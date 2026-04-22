import { createContext, useContext, useState, useEffect, ReactNode, createElement } from "react";

interface GitHubConfig {
  token: string;
  username: string;
}

interface GitHubContextValue {
  config: GitHubConfig | null;
  setConfig: (newConfig: GitHubConfig | null) => void;
  isConfigured: boolean;
}

const GitHubContext = createContext<GitHubContextValue | null>(null);

const STORAGE_KEY = "github_config";

function readStoredConfig(): GitHubConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as GitHubConfig;
    }
  } catch (e) {
    console.error("Failed to parse github_config from localStorage", e);
  }
  return null;
}

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<GitHubConfig | null>(() => readStoredConfig());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setConfigState(readStoredConfig());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setConfig = (newConfig: GitHubConfig | null) => {
    if (newConfig) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setConfigState(newConfig);
  };

  const isConfigured = Boolean(config?.token && config?.username);

  return createElement(
    GitHubContext.Provider,
    { value: { config, setConfig, isConfigured } },
    children,
  );
}

export function useGitHub(): GitHubContextValue {
  const ctx = useContext(GitHubContext);
  if (!ctx) {
    throw new Error("useGitHub must be used within a GitHubProvider");
  }
  return ctx;
}
