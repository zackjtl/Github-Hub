import { useMemo } from "react";
import { Link } from "wouter";
import { useUserProfile, useUserRepos } from "@/hooks/use-github-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RepoCard } from "@/components/repo-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, GitFork, Star, BookOpen, Lock, Globe } from "lucide-react";
import { getLanguageColor } from "@/lib/language-colors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useUserProfile();
  const { data: repos, isLoading: isReposLoading, error: reposError } = useUserRepos();

  const stats = useMemo(() => {
    if (!repos) return null;

    let totalStars = 0;
    let totalForks = 0;
    let privateCount = 0;
    let publicCount = 0;
    const languages: Record<string, number> = {};

    repos.forEach((repo: any) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      
      if (repo.private) privateCount++;
      else publicCount++;

      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Get recently updated repos
    const recentRepos = [...repos]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 6);

    // Get most starred repos
    const topRepos = [...repos]
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 6);

    return {
      totalRepos: repos.length,
      totalStars,
      totalForks,
      privateCount,
      publicCount,
      topLanguages,
      recentRepos,
      topRepos
    };
  }, [repos]);

  if (profileError || reposError) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error fetching data</AlertTitle>
        <AlertDescription>
          {profileError?.message || reposError?.message}
          <div className="mt-4">
            <Link href="/settings">
              <Button variant="outline" size="sm" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground">Check Settings</Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isProfileLoading || isReposLoading || !stats) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in duration-500" data-testid="page-dashboard">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your GitHub repositories and activity.</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm shadow-sm hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Repositories</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-total-repos">{stats.totalRepos}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center"><Globe className="w-3 h-3 mr-1"/>{stats.publicCount} Public</span>
              <span className="flex items-center"><Lock className="w-3 h-3 mr-1"/>{stats.privateCount} Private</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm shadow-sm hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stars</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-total-stars">{stats.totalStars}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all repositories</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 backdrop-blur-sm shadow-sm hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Forks</CardTitle>
            <GitFork className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-total-forks">{stats.totalForks}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all repositories</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 backdrop-blur-sm shadow-sm hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Language</CardTitle>
            <div 
              className="h-4 w-4 rounded-full" 
              style={{ backgroundColor: getLanguageColor(stats.topLanguages[0]?.name) }}
            />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground truncate" data-testid="stat-top-language">
              {stats.topLanguages[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Used in {stats.topLanguages[0]?.count || 0} repos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold tracking-tight">Recently Updated</h3>
              <Link href="/repos">
                <Button variant="link" className="text-primary hover:text-primary/80 px-0">View all</Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.recentRepos.map((repo: any) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </div>

          {stats.topRepos.length > 0 && stats.topRepos[0].stargazers_count > 0 && (
            <div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Most Starred</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {stats.topRepos.slice(0, 4).map((repo: any) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
              <CardDescription>Based on repository count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topLanguages.map((lang) => (
                  <div key={lang.name} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3 shadow-sm"
                      style={{ backgroundColor: getLanguageColor(lang.name) }}
                    />
                    <div className="flex-1 text-sm font-medium text-foreground">{lang.name}</div>
                    <div className="text-sm text-muted-foreground">{lang.count}</div>
                  </div>
                ))}
                {stats.topLanguages.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No language data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
