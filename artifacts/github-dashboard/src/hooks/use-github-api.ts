import { useQuery } from "@tanstack/react-query";
import { useGitHub } from "./use-github";

const GITHUB_API = "https://api.github.com";

async function fetchGitHub(endpoint: string, token: string) {
  const res = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Invalid or expired token");
    if (res.status === 403) throw new Error("API rate limit exceeded or access denied");
    if (res.status === 404) throw new Error("Resource not found");
    throw new Error(`GitHub API error: ${res.statusText}`);
  }
  return res.json();
}

export function useUserProfile(username?: string) {
  const { config } = useGitHub();
  const targetUser = username || config?.username;
  return useQuery({
    queryKey: ["userProfile", targetUser],
    queryFn: () => {
      // If we are looking at our own profile, use /user to get private details
      if (targetUser === config?.username) {
        return fetchGitHub("/user", config!.token);
      }
      return fetchGitHub(`/users/${targetUser}`, config!.token);
    },
    enabled: !!config?.token && !!targetUser,
  });
}

export function useUserRepos() {
  const { config } = useGitHub();
  return useQuery({
    queryKey: ["userRepos", config?.username],
    queryFn: async () => {
      // Get all repos for the authenticated user, including private ones
      const allRepos = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const res = await fetch(`${GITHUB_API}/user/repos?per_page=100&sort=updated&page=${page}`, {
          headers: {
            Authorization: `token ${config!.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
        const data = await res.json();
        allRepos.push(...data);
        if (data.length < 100) hasMore = false;
        else page++;
      }
      return allRepos;
    },
    enabled: !!config?.token,
  });
}

export function useRepoDetail(owner: string, repo: string) {
  const { config } = useGitHub();
  return useQuery({
    queryKey: ["repoDetail", owner, repo],
    queryFn: () => fetchGitHub(`/repos/${owner}/${repo}`, config!.token),
    enabled: !!config?.token && !!owner && !!repo,
  });
}

export function useRepoLanguages(owner: string, repo: string) {
  const { config } = useGitHub();
  return useQuery({
    queryKey: ["repoLanguages", owner, repo],
    queryFn: () => fetchGitHub(`/repos/${owner}/${repo}/languages`, config!.token),
    enabled: !!config?.token && !!owner && !!repo,
  });
}

export function useRepoContributors(owner: string, repo: string) {
  const { config } = useGitHub();
  return useQuery({
    queryKey: ["repoContributors", owner, repo],
    queryFn: () => fetchGitHub(`/repos/${owner}/${repo}/contributors`, config!.token),
    enabled: !!config?.token && !!owner && !!repo,
  });
}

export function useRepoCommits(owner: string, repo: string) {
  const { config } = useGitHub();
  return useQuery({
    queryKey: ["repoCommits", owner, repo],
    queryFn: () => fetchGitHub(`/repos/${owner}/${repo}/commits?per_page=10`, config!.token),
    enabled: !!config?.token && !!owner && !!repo,
  });
}

export function useRepoReadme(owner: string, repo: string) {
  const { config } = useGitHub();
  return useQuery({
    queryKey: ["repoReadme", owner, repo],
    queryFn: async () => {
      const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
        headers: {
          Authorization: `token ${config!.token}`,
          Accept: "application/vnd.github.v3.raw", // Get raw markdown
        },
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`GitHub API error: ${res.statusText}`);
      }
      return res.text();
    },
    enabled: !!config?.token && !!owner && !!repo,
  });
}
