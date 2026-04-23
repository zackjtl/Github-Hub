import { useMemo } from "react";
import { Link } from "wouter";
import { useUserProfile, useUserRepos } from "@/hooks/use-github-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RepoCard } from "@/components/repo-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, GitFork, Star, BookOpen, Lock, Globe, Pin } from "lucide-react";
import { getLanguageColor } from "@/lib/language-colors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDashboardPrefs } from "@/hooks/use-dashboard-prefs";
import { DashboardReposConfig } from "@/components/dashboard-repos-config";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function Dashboard() {
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useUserProfile();
  const { data: repos, isLoading: isReposLoading, error: reposError } = useUserRepos();
  const { prefs } = useDashboardPrefs();

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

    const sortedLanguages = Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
    const topLanguages = sortedLanguages.slice(0, 4);
    const othersCount = sortedLanguages.slice(4).reduce((sum, lang) => sum + lang.count, 0);
    const languageDistribution = othersCount > 0
      ? [...topLanguages, { name: "Others", count: othersCount }]
      : topLanguages;

    // Get recently updated repos
    const recentRepos = [...repos]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 6);

    return {
      totalRepos: repos.length,
      totalStars,
      totalForks,
      privateCount,
      publicCount,
      topLanguages,
      languageDistribution,
      recentRepos,
    };
  }, [repos]);

  const displayedRepos = useMemo(() => {
    if (!repos || !stats) return [];
    if (prefs.mode === "manual") {
      const byName = new Map<string, any>(
        repos.map((r: any) => [r.full_name as string, r]),
      );
      return prefs.pinnedRepos
        .map((name) => byName.get(name))
        .filter(Boolean);
    }
    return stats.recentRepos;
  }, [repos, stats, prefs.mode, prefs.pinnedRepos]);

  const sectionTitle = prefs.mode === "manual" ? "Pinned Repositories" : "Recently Updated";

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.languageDistribution.length > 0 ? (
              <div className="space-y-3" data-testid="stat-top-language">
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.languageDistribution}
                        dataKey="count"
                        nameKey="name"
                        innerRadius={32}
                        outerRadius={56}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {stats.languageDistribution.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.name === "Others" ? "hsl(var(--muted-foreground))" : getLanguageColor(entry.name)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} repos`, name]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--background))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-1">
                  {stats.languageDistribution.map((lang) => (
                    <div key={lang.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              lang.name === "Others"
                                ? "hsl(var(--muted-foreground))"
                                : getLanguageColor(lang.name),
                          }}
                        />
                        <span className="truncate">{lang.name}</span>
                      </div>
                      <span className="text-muted-foreground">{lang.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">No language data.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            {prefs.mode === "manual" && <Pin className="w-4 h-4 text-primary" />}
            {sectionTitle}
          </h3>
          <div className="flex items-center gap-1">
            <DashboardReposConfig repos={repos ?? []} />
            <Link href="/repos">
              <Button variant="link" className="text-primary hover:text-primary/80 px-2">View all</Button>
            </Link>
          </div>
        </div>
        {displayedRepos.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {displayedRepos.map((repo: any) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        ) : prefs.mode === "manual" ? (
          <div className="border border-dashed border-border/60 rounded-xl p-10 text-center bg-card/30">
            <Pin className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground mb-4">
              No repositories pinned yet. Pick the ones you want to keep an eye on.
            </p>
            <DashboardReposConfig
              repos={repos ?? []}
              trigger={
                <Button size="sm" data-testid="button-pick-repos-empty">
                  Pick repositories
                </Button>
              }
            />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic text-center py-8">
            No repositories found.
          </div>
        )}
      </div>
    </div>
  );
}
