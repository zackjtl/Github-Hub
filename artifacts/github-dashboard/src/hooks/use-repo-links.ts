import { useCallback, useEffect, useState } from "react";

export interface RepoLink {
  id: string;
  platformId: string;
  url: string;
  label?: string;
}

const STORAGE_KEY = "repo_links";

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
  const key = repoKey(owner, repo);
  const [links, setLinks] = useState<RepoLink[]>(() => readStore()[key] ?? []);

  useEffect(() => {
    setLinks(readStore()[key] ?? []);
  }, [key]);

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
    },
    [key],
  );

  const updateLink = useCallback(
    (id: string, patch: Partial<Omit<RepoLink, "id">>) => {
      const store = readStore();
      const existing = store[key] ?? [];
      store[key] = existing.map((l) => (l.id === id ? { ...l, ...patch } : l));
      writeStore(store);
      setLinks(store[key]);
    },
    [key],
  );

  const removeLink = useCallback(
    (id: string) => {
      const store = readStore();
      const existing = store[key] ?? [];
      store[key] = existing.filter((l) => l.id !== id);
      writeStore(store);
      setLinks(store[key]);
    },
    [key],
  );

  return { links, addLink, updateLink, removeLink };
}
