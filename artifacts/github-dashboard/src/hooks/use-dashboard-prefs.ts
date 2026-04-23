import { useCallback, useEffect, useState } from "react";
import { useGitHub } from "./use-github";
import {
  DASHBOARD_PREFS_GIST_DESC,
  createPrivateJsonGist,
  findGistByDescription,
  getGist,
  patchGistFiles,
} from "@/lib/gist";

export type DashboardMode = "auto" | "manual";

export interface DashboardPrefs {
  mode: DashboardMode;
  pinnedRepos: string[]; // "owner/repo"
}

const STORAGE_KEY = "dashboard_prefs";
const GIST_ID_KEY = "gitdash_dashboard_prefs_gist_id";
const GIST_FILE = "dashboard-prefs.json";

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
  const { config } = useGitHub();
  const [prefs, setPrefsState] = useState<DashboardPrefs>(() => readPrefs());

  const persistLocal = useCallback((next: DashboardPrefs) => {
    writePrefs(next);
    setPrefsState(next);
  }, []);

  const saveToGist = useCallback(
    async (next: DashboardPrefs) => {
      if (!config?.token) return;
      const payload = JSON.stringify(next, null, 2);
      try {
        let gistId = localStorage.getItem(GIST_ID_KEY);
        if (!gistId) {
          const found = await findGistByDescription(DASHBOARD_PREFS_GIST_DESC, config.token);
          if (found) {
            gistId = found.id;
            localStorage.setItem(GIST_ID_KEY, gistId);
          }
        }
        if (!gistId) {
          const created = await createPrivateJsonGist(
            DASHBOARD_PREFS_GIST_DESC,
            GIST_FILE,
            payload,
            config.token,
          );
          localStorage.setItem(GIST_ID_KEY, created.id);
          return;
        }
        await patchGistFiles(gistId, { [GIST_FILE]: { content: payload } }, config.token);
      } catch (error) {
        console.error("Failed to sync dashboard prefs to gist", error);
      }
    },
    [config?.token],
  );

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

  useEffect(() => {
    if (!config?.token) return;
    let cancelled = false;
    (async () => {
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
        if (!gist) {
          gist = await findGistByDescription(DASHBOARD_PREFS_GIST_DESC, config.token);
        }
        if (!gist) return;
        localStorage.setItem(GIST_ID_KEY, gist.id);
        const file = gist.files[GIST_FILE] || Object.values(gist.files)[0];
        if (!file?.content) return;
        const parsed = JSON.parse(file.content) as Partial<DashboardPrefs>;
        const next: DashboardPrefs = {
          mode: parsed.mode === "manual" ? "manual" : "auto",
          pinnedRepos: Array.isArray(parsed.pinnedRepos) ? parsed.pinnedRepos : [],
        };
        if (!cancelled) persistLocal(next);
      } catch (error) {
        console.error("Failed to load dashboard prefs from gist", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [config?.token, persistLocal]);

  const setPrefs = useCallback((next: DashboardPrefs) => {
    persistLocal(next);
    void saveToGist(next);
  }, [persistLocal, saveToGist]);

  const setMode = useCallback(
    (mode: DashboardMode) => {
      const current = readPrefs();
      const next = { ...current, mode };
      persistLocal(next);
      void saveToGist(next);
    },
    [persistLocal, saveToGist],
  );

  const setPinnedRepos = useCallback((pinnedRepos: string[]) => {
    const current = readPrefs();
    const next = { ...current, pinnedRepos };
    persistLocal(next);
    void saveToGist(next);
  }, [persistLocal, saveToGist]);

  const togglePinned = useCallback((fullName: string) => {
    const current = readPrefs();
    const exists = current.pinnedRepos.includes(fullName);
    const pinnedRepos = exists
      ? current.pinnedRepos.filter((r) => r !== fullName)
      : [...current.pinnedRepos, fullName];
    const next = { ...current, pinnedRepos };
    persistLocal(next);
    void saveToGist(next);
  }, [persistLocal, saveToGist]);

  return { prefs, setPrefs, setMode, setPinnedRepos, togglePinned };
}
