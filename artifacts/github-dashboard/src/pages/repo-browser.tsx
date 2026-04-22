import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useUserRepos } from "@/hooks/use-github-api";
import { RepoCard } from "@/components/repo-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid, List, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SortOption = "updated" | "stars" | "forks" | "name";
type ViewMode = "grid" | "list";

export function RepoBrowser() {
  const { data: repos, isLoading, error } = useUserRepos();
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const languages = useMemo(() => {
    if (!repos) return [];
    const langs = new Set<string>();
    repos.forEach((r: any) => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repos]);

  const filteredAndSortedRepos = useMemo(() => {
    if (!repos) return [];

    return repos
      .filter((repo: any) => {
        // Search filter
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          repo.name.toLowerCase().includes(searchLower) || 
          (repo.description && repo.description.toLowerCase().includes(searchLower)) ||
          (repo.topics && repo.topics.some((t: string) => t.toLowerCase().includes(searchLower)));

        // Language filter
        const matchesLanguage = languageFilter === "all" || repo.language === languageFilter;

        // Visibility filter
        const matchesVisibility = 
          visibilityFilter === "all" || 
          (visibilityFilter === "private" && repo.private) ||
          (visibilityFilter === "public" && !repo.private);

        return matchesSearch && matchesLanguage && matchesVisibility;
      })
      .sort((a: any, b: any) => {
        switch (sortBy) {
          case "stars":
            return (b.stargazers_count || 0) - (a.stargazers_count || 0);
          case "forks":
            return (b.forks_count || 0) - (a.forks_count || 0);
          case "name":
            return a.name.localeCompare(b.name);
          case "updated":
          default:
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
      });
  }, [repos, search, languageFilter, visibilityFilter, sortBy]);

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error fetching repositories</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500" data-testid="page-repo-browser">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Repositories</h2>
        <p className="text-muted-foreground">Browse, filter, and search through your GitHub repositories.</p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center gap-4 bg-card/30 p-4 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Find a repository..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
            data-testid="input-search-repos"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-[140px] bg-background/50 border-border/50" data-testid="select-language">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-[120px] bg-background/50 border-border/50" data-testid="select-visibility">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px] bg-background/50 border-border/50" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="forks">Forks</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border border-border/50 rounded-md bg-background/50 ml-auto md:ml-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-none rounded-l-md ${viewMode === 'grid' ? 'bg-secondary/20 text-secondary' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-none rounded-r-md ${viewMode === 'list' ? 'bg-secondary/20 text-secondary' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground font-medium">
          {isLoading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <span>Showing {filteredAndSortedRepos.length} repositories</span>
          )}
        </div>

        {isLoading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className={viewMode === 'grid' ? 'h-48 rounded-xl' : 'h-24 rounded-xl'} />
            ))}
          </div>
        ) : filteredAndSortedRepos.length > 0 ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredAndSortedRepos.map((repo: any) => (
              <RepoCard key={repo.id} repo={repo} compact={viewMode === 'list'} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/30 rounded-xl border border-border/50 border-dashed">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No repositories found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => {
                setSearch("");
                setLanguageFilter("all");
                setVisibilityFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
