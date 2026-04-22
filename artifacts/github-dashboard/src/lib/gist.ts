const GIST_API = "https://api.github.com/gists";

export const NOTES_GIST_PREFIX = "[gitdash:notes]";

export interface GistFile {
  filename: string;
  content: string;
  raw_url?: string;
  size?: number;
  truncated?: boolean;
}

export interface Gist {
  id: string;
  description: string;
  files: Record<string, GistFile>;
  updated_at: string;
  created_at: string;
  html_url: string;
}

async function gistFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${GIST_API}${path}`, {
    ...init,
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Invalid token or missing 'gist' scope");
    if (res.status === 403) throw new Error("Permission denied — make sure your token has the 'gist' scope");
    if (res.status === 404) throw new Error("Gist not found");
    throw new Error(`Gist API error: ${res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function buildDescription(owner: string, repo: string) {
  return `${NOTES_GIST_PREFIX} ${owner}/${repo}`;
}

/** Find existing notes gist for this repo by scanning user's gists. */
export async function findNotesGist(owner: string, repo: string, token: string): Promise<Gist | null> {
  const target = buildDescription(owner, repo);
  let page = 1;
  while (true) {
    const list = (await gistFetch(`?per_page=100&page=${page}`, token)) as Gist[];
    if (!list || list.length === 0) return null;
    const found = list.find((g) => g.description === target);
    if (found) {
      // Re-fetch to get full file contents (list endpoint truncates)
      return (await gistFetch(`/${found.id}`, token)) as Gist;
    }
    if (list.length < 100) return null;
    page++;
    if (page > 30) return null; // safety cap
  }
}

export async function getGist(id: string, token: string): Promise<Gist> {
  return (await gistFetch(`/${id}`, token)) as Gist;
}

export async function createNotesGist(
  owner: string,
  repo: string,
  initialFile: { filename: string; content: string },
  token: string,
): Promise<Gist> {
  return (await gistFetch("", token, {
    method: "POST",
    body: JSON.stringify({
      description: buildDescription(owner, repo),
      public: false,
      files: { [initialFile.filename]: { content: initialFile.content } },
    }),
  })) as Gist;
}

/** Patch one or many files. Pass `null` as the value to delete a file. */
export async function patchGistFiles(
  id: string,
  files: Record<string, { content: string; filename?: string } | null>,
  token: string,
): Promise<Gist> {
  return (await gistFetch(`/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ files }),
  })) as Gist;
}

/** Fetch the raw content of a single file (used when content is truncated). */
export async function fetchGistFileRaw(rawUrl: string, token: string): Promise<string> {
  const res = await fetch(rawUrl, { headers: { Authorization: `token ${token}` } });
  if (!res.ok) throw new Error(`Failed to fetch raw note: ${res.statusText}`);
  return res.text();
}
