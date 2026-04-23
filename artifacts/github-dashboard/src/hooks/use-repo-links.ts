import { useCallback, useEffect, useState } from "react";
import { useGitHub } from "./use-github";
import {
  REPO_LINKS_GIST_DESC,
  createPrivateJsonGist,
  findGistByDescription,
  getGist,
  patchGistFiles,
} from "@/lib/gist";

export interface RepoLink {
  id: string;
  platformId: string;
  url: string;
  label?: string;
}

const STORAGE_KEY = "repo_links";
const GIST_ID_KEY = "gitdash_repo_links_gist_id";
const GIST_FILE = "repo-links.json";

type Store = Record<string, RepoLink[]>;

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch (e) {
    console.error("Failed to parse repo_links from localStorage", e);
  }
  return {};
}

function writeStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function repoKey(owner: string, repo: string): string {
  return `${owner}/${repo}`.toLowerCase();
}

export function useRepoLinks(owner: string, repo: string) {
  const { config } = useGitHub();
  const key = repoKey(owner, repo);
  const [links, setLinks] = useState<RepoLink[]>(() => readStore()[key] ?? []);

  const loadStoreFromGist = useCallback(async (): Promise<Store | null> => {
    if (!config?.token) return null;
    try {
      const cachedId = localStorage.getItem(GIST_ID_KEY);
      let gist = null;
      if (cachedId) {
        try {
          gist = await getGist(cachedId, config.token);
        } catch {
          localStorage.removeItem(GIST_ID_KEY);
        }
      }
      if (!gist) gist = await findGistByDescription(REPO_LINKS_GIST_DESC, config.token);
      if (!gist) return null;
      localStorage.setItem(GIST_ID_KEY, gist.id);
      const file = gist.files[GIST_FILE] || Object.values(gist.files)[0];
      if (!file?.content) return {};
      return JSON.parse(file.content) as Store;
    } catch (error) {
      console.error("Failed to load repo links from gist", error);
      return null;
    }
  }, [config?.token]);

  const saveStoreToGist = useCallback(
    async (store: Store) => {
      if (!config?.token) return;
      const payload = JSON.stringify(store, null, 2);
      try {
        let gistId = localStorage.getItem(GIST_ID_KEY);
        if (!gistId) {
          const found = await findGistByDescription(REPO_LINKS_GIST_DESC, config.token);
          if (found) {
            gistId = found.id;
            localStorage.setItem(GIST_ID_KEY, gistId);
          }
        }
        if (!gistId) {
          const created = await createPrivateJsonGist(
            REPO_LINKS_GIST_DESC,
            GIST_FILE,
            payload,
            config.token,
          );
          localStorage.setItem(GIST_ID_KEY, created.id);
          return;
        }
        await patchGistFiles(gistId, { [GIST_FILE]: { content: payload } }, config.token);
      } catch (error) {
        console.error("Failed to sync repo links to gist", error);
      }
    },
    [config?.token],
  );

  useEffect(() => {
    setLinks(readStore()[key] ?? []);
  }, [key]);

  useEffect(() => {
    if (!config?.token) return;
    let cancelled = false;
    (async () => {
      const gistStore = await loadStoreFromGist();
      if (!gistStore || cancelled) return;
      writeStore(gistStore);
      setLinks(gistStore[key] ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [config?.token, key, loadStoreFromGist]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setLinks(readStore()[key] ?? []);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  const addLink = useCallback(
    (input: Omit<RepoLink, "id">) => {
      const store = readStore();
      const existing = store[key] ?? [];
      const next: RepoLink = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...input,
      };
      store[key] = [...existing, next];
      writeStore(store);
      setLinks(store[key]);
      void saveStoreToGist(store);
    },
    [key, saveStoreToGist],
  );

  const updateLink = useCallback(
    (id: string, patch: Partial<Omit<RepoLink, "id">>) => {
      const store = readStore();
      const existing = store[key] ?? [];
      store[key] = existing.map((l) => (l.id === id ? { ...l, ...patch } : l));
      writeStore(store);
      setLinks(store[key]);
      void saveStoreToGist(store);
    },
    [key, saveStoreToGist],
  );

  const removeLink = useCallback(
    (id: string) => {
      const store = readStore();
      const existing = store[key] ?? [];
      store[key] = existing.filter((l) => l.id !== id);
      writeStore(store);
      setLinks(store[key]);
      void saveStoreToGist(store);
    },
    [key, saveStoreToGist],
  );

  return { links, addLink, updateLink, removeLink };
}
