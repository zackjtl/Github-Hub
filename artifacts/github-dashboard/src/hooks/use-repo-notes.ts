import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGitHub } from "./use-github";
import {
  findNotesGist,
  getGist,
  createNotesGist,
  patchGistFiles,
  fetchGistFileRaw,
  type Gist,
} from "@/lib/gist";

const CACHE_KEY = "gitdash_notes_gist_ids";

interface NotesGistCache {
  [key: string]: string;
}

function readCache(): NotesGistCache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(cache: NotesGistCache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function repoKey(owner: string, repo: string) {
  return `${owner}/${repo}`;
}

export interface RepoNote {
  id: string;
  title: string;
  content: string;
  truncated?: boolean;
  rawUrl?: string;
}

function gistToNotes(gist: Gist | null): RepoNote[] {
  if (!gist) return [];
  return Object.entries(gist.files).map(([filename, file]) => ({
    id: filename,
    title: filename.endsWith(".md") ? filename.slice(0, -3) : filename,
    content: file.content || "",
    truncated: file.truncated,
    rawUrl: file.raw_url,
  }));
}

function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 100) || "Untitled";
}

function toFilename(title: string): string {
  return `${sanitizeTitle(title)}.md`;
}

function uniqueFilename(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base;
  const stem = base.replace(/\.md$/, "");
  let i = 2;
  while (existing.includes(`${stem} (${i}).md`)) i++;
  return `${stem} (${i}).md`;
}

export function useRepoNotes(owner: string, repo: string) {
  const { config } = useGitHub();
  const qc = useQueryClient();
  const key = ["repoNotes", owner, repo];

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<{ gist: Gist | null; notes: RepoNote[] }> => {
      if (!config?.token) return { gist: null, notes: [] };
      const cache = readCache();
      const cachedId = cache[repoKey(owner, repo)];
      let gist: Gist | null = null;
      if (cachedId) {
        try {
          gist = await getGist(cachedId, config.token);
        } catch {
          // Cached id stale; clear and fall through
          delete cache[repoKey(owner, repo)];
          writeCache(cache);
        }
      }
      if (!gist) {
        gist = await findNotesGist(owner, repo, config.token);
        if (gist) {
          cache[repoKey(owner, repo)] = gist.id;
          writeCache(cache);
        }
      }
      // Resolve any truncated files
      let notes = gistToNotes(gist);
      const truncated = notes.filter((n) => n.truncated && n.rawUrl);
      if (truncated.length > 0) {
        await Promise.all(
          truncated.map(async (n) => {
            try {
              n.content = await fetchGistFileRaw(n.rawUrl!, config.token);
            } catch {
              // leave whatever partial content we have
            }
          }),
        );
      }
      return { gist, notes };
    },
    enabled: !!config?.token && !!owner && !!repo,
    staleTime: 60_000,
  });

  const create = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!config?.token) throw new Error("Not authenticated");
      const existing = query.data?.notes.map((n) => `${n.id}`) || [];
      const filename = uniqueFilename(toFilename(title), existing);
      let gist = query.data?.gist || null;
      if (!gist) {
        gist = await createNotesGist(owner, repo, { filename, content }, config.token);
        const cache = readCache();
        cache[repoKey(owner, repo)] = gist.id;
        writeCache(cache);
      } else {
        gist = await patchGistFiles(gist.id, { [filename]: { content } }, config.token);
      }
      return gist;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: {
      id: string;
      title: string;
      content: string;
    }) => {
      if (!config?.token) throw new Error("Not authenticated");
      const gist = query.data?.gist;
      if (!gist) throw new Error("No notes gist exists");
      const newFilename = toFilename(title);
      const otherFiles = Object.keys(gist.files).filter((f) => f !== id);
      const finalName =
        newFilename === id ? id : uniqueFilename(newFilename, otherFiles);

      if (finalName === id) {
        return await patchGistFiles(gist.id, { [id]: { content } }, config.token);
      }
      // Rename: send the old key with new filename + content
      return await patchGistFiles(
        gist.id,
        { [id]: { filename: finalName, content } },
        config.token,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!config?.token) throw new Error("Not authenticated");
      const gist = query.data?.gist;
      if (!gist) throw new Error("No notes gist exists");
      return await patchGistFiles(gist.id, { [id]: null }, config.token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    notes: query.data?.notes || [],
    gist: query.data?.gist || null,
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    remove,
  };
}
