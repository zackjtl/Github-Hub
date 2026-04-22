import { useState, useEffect } from "react";

interface GitHubConfig {
  token: string;
  username: string;
}

export function useGitHub() {
  const [config, setConfigState] = useState<GitHubConfig | null>(() => {
    try {
      const stored = localStorage.getItem("github_config");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse github_config from localStorage", e);
    }
    return null;
  });

  const setConfig = (newConfig: GitHubConfig | null) => {
    if (newConfig) {
      localStorage.setItem("github_config", JSON.stringify(newConfig));
    } else {
      localStorage.removeItem("github_config");
    }
    setConfigState(newConfig);
  };

  const isConfigured = Boolean(config?.token && config?.username);

  return {
    config,
    setConfig,
    isConfigured,
  };
}
