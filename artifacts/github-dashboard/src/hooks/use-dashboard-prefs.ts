import { useCallback, useEffect, useState } from "react";

export type DashboardMode = "auto" | "manual";

export interface DashboardPrefs {
  mode: DashboardMode;
  pinnedRepos: string[]; // "owner/repo"
}

const STORAGE_KEY = "dashboard_prefs";

const DEFAULTS: DashboardPrefs = {
  mode: "auto",
  pinnedRepos: [],
};

function readPrefs(): DashboardPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DashboardPrefs>;
      return {
        mode: parsed.mode === "manual" ? "manual" : "auto",
        pinnedRepos: Array.isArray(parsed.pinnedRepos) ? parsed.pinnedRepos : [],
      };
    }
  } catch (e) {
    console.error("Failed to parse dashboard_prefs", e);
  }
  return { ...DEFAULTS };
}

const SAME_TAB_EVENT = "dashboard_prefs_changed";

function writePrefs(prefs: DashboardPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent(SAME_TAB_EVENT));
}

export function useDashboardPrefs() {
  const [prefs, setPrefsState] = useState<DashboardPrefs>(() => readPrefs());

  useEffect(() => {
    const sync = () => setPrefsState(readPrefs());
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) sync();
    };
    window.addEventListener("storage", storageHandler);
    window.addEventListener(SAME_TAB_EVENT, sync);
    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener(SAME_TAB_EVENT, sync);
    };
  }, []);

  const setPrefs = useCallback((next: DashboardPrefs) => {
    writePrefs(next);
    setPrefsState(next);
  }, []);

  const setMode = useCallback(
    (mode: DashboardMode) => {
      const current = readPrefs();
      const next = { ...current, mode };
      writePrefs(next);
      setPrefsState(next);
    },
    [],
  );

  const setPinnedRepos = useCallback((pinnedRepos: string[]) => {
    const current = readPrefs();
    const next = { ...current, pinnedRepos };
    writePrefs(next);
    setPrefsState(next);
  }, []);

  const togglePinned = useCallback((fullName: string) => {
    const current = readPrefs();
    const exists = current.pinnedRepos.includes(fullName);
    const pinnedRepos = exists
      ? current.pinnedRepos.filter((r) => r !== fullName)
      : [...current.pinnedRepos, fullName];
    const next = { ...current, pinnedRepos };
    writePrefs(next);
    setPrefsState(next);
  }, []);

  return { prefs, setPrefs, setMode, setPinnedRepos, togglePinned };
}
