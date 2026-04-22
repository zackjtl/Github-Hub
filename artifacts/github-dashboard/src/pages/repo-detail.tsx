import { useState } from "react";
import { useRoute } from "wouter";
import { 
  useRepoDetail, 
  useRepoLanguages, 
  useRepoContributors, 
  useRepoCommits, 
  useRepoReadme 
} from "@/hooks/use-github-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, GitFork, Lock, Globe, ExternalLink, Activity, 
  BookOpen, Users, GitCommit, AlertCircle, CircleDot, FileText
} from "lucide-react";
import { RepoNotes } from "@/components/repo-notes";
import { formatDistanceToNow, format } from "date-fns";
import { getLanguageColor } from "@/lib/language-colors";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RepoLinks } from "@/components/repo-links";

export function RepoDetail() {
  const [, params] = useRoute("/repo/:owner/:repo");
  const owner = params?.owner || "";
  const repoName = params?.repo || "";

  const { data: repo, isLoading: isLoadingRepo, error: repoError } = useRepoDetail(owner, repoName);
  const { data: languages, isLoading: isLoadingLangs } = useRepoLanguages(owner, repoName);
  const { data: contributors, isLoading: isLoadingContribs } = useRepoContributors(owner, repoName);
  const { data: commits, isLoading: isLoadingCommits } = useRepoCommits(owner, repoName);
  const { data: readme, isLoading: isLoadingReadme } = useRepoReadme(owner, repoName);

  if (repoError) {
    return (
      <div className="p-8 text-center bg-destructive/10 rounded-xl border border-destructive/20 mt-10">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-destructive mb-2">Repository Not Found</h2>
        <p className="text-muted-foreground mb-4">Make sure the repository exists and you have access to it.</p>
        <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  if (isLoadingRepo) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!repo) return null;

  // Calculate language percentages
  const totalBytes = languages ? Object.values(languages).reduce((a: any, b: any) => a + b, 0) as number : 0;
  const langArray = languages 
    ? Object.entries(languages)
        .map(([name, bytes]) => ({
          name,
          bytes: bytes as number,
          percent: ((bytes as number) / totalBytes) * 100
        }))
        .sort((a, b) => b.bytes - a.bytes)
    : [];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500" data-testid="page-repo-detail">
      {/* Header */}
      <div className="bg-card/40 border border-border/50 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-sm relative overflow-hidden">
        {/* Subtle background color based on primary language */}
        {repo.language && (
          <div 
            className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] blur-[100px] pointer-events-none rounded-full"
            style={{ backgroundColor: getLanguageColor(repo.language) }}
          />
        )}
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground break-all">
                  <span className="text-muted-foreground/50 font-normal">{repo.owner.login}/</span>{repo.name}
                </h1>
                <Badge variant={repo.private ? "secondary" : "outline"} className="text-xs h-6 px-2 font-mono">
                  {repo.private ? <Lock className="w-3 h-3 mr-1.5"/> : <Globe className="w-3 h-3 mr-1.5"/>}
                  {repo.private ? "Private" : "Public"}
                </Badge>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-3xl mb-6">
                {repo.description || <span className="italic opacity-50">No description provided.</span>}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-md border border-border/50">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-foreground">{repo.stargazers_count}</span> stars
                </div>
                <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-md border border-border/50">
                  <GitFork className="w-4 h-4 text-blue-400" />
                  <span className="text-foreground">{repo.forks_count}</span> forks
                </div>
                <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-md border border-border/50">
                  <CircleDot className="w-4 h-4 text-green-500" />
                  <span className="text-foreground">{repo.open_issues_count}</span> issues
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
                  Updated {formatDistanceToNow(new Date(repo.updated_at))} ago
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild variant="default" className="font-medium shadow-sm hover-elevate">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="readme" className="w-full">
            <TabsList className="w-full justify-start bg-card/50 border border-border/50 p-1 mb-6">
              <TabsTrigger value="readme" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex-1 sm:flex-none">
                <BookOpen className="w-4 h-4 mr-2" /> README
              </TabsTrigger>
              <TabsTrigger value="commits" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex-1 sm:flex-none">
                <GitCommit className="w-4 h-4 mr-2" /> Commits
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex-1 sm:flex-none">
                <FileText className="w-4 h-4 mr-2" /> Notes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="readme" className="m-0 focus-visible:outline-none">
              <Card className="bg-card/30 border-border/50 overflow-hidden backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  {isLoadingReadme ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-32 w-full mt-8" />
                    </div>
                  ) : readme ? (
                    <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                      prose-headings:border-b prose-headings:border-border/50 prose-headings:pb-2 prose-headings:mb-4
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-lg prose-img:border prose-img:border-border/20
                      prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
                    </article>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground italic">
                      No README.md found in this repository.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="commits" className="m-0 focus-visible:outline-none">
              <Card className="bg-card/30 border-border/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  {isLoadingCommits ? (
                    <div className="p-6 space-y-6">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : commits && commits.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {commits.map((commit: any) => (
                        <div key={commit.sha} className="p-4 hover:bg-muted/20 transition-colors flex gap-4 group">
                          <Avatar className="h-10 w-10 border border-border/50">
                            <AvatarImage src={commit.author?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {commit.commit.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <a 
                              href={commit.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-foreground font-medium hover:text-primary transition-colors line-clamp-1 mb-1 group-hover:underline"
                            >
                              {commit.commit.message.split('\n')[0]}
                            </a>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground/80">{commit.commit.author.name}</span>
                              <span>committed on {format(new Date(commit.commit.author.date), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded border border-border/50 h-fit">
                            {commit.sha.substring(0, 7)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No commits found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="m-0 focus-visible:outline-none">
              <RepoNotes owner={owner} repo={repoName} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RepoLinks owner={repo.owner.login} repo={repo.name} />

          <Card className="bg-card/40 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" /> Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLangs ? (
                <div className="space-y-4">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="space-y-2">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                  </div>
                </div>
              ) : langArray.length > 0 ? (
                <div className="space-y-4">
                  {/* Language Progress Bar */}
                  <div className="h-2.5 w-full flex rounded-full overflow-hidden shadow-inner">
                    {langArray.map((lang) => (
                      <div 
                        key={lang.name}
                        style={{ 
                          width: `${lang.percent}%`,
                          backgroundColor: getLanguageColor(lang.name) 
                        }}
                        className="h-full hover:brightness-110 transition-all"
                        title={`${lang.name}: ${lang.percent.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                  
                  {/* Language Legend */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    {langArray.map((lang) => (
                      <div key={lang.name} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" 
                          style={{ backgroundColor: getLanguageColor(lang.name) }} 
                        />
                        <span className="font-medium text-foreground truncate">{lang.name}</span>
                        <span className="text-muted-foreground ml-auto text-xs">{lang.percent.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No language data.</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingContribs ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : contributors && contributors.length > 0 ? (
                <div className="space-y-4">
                  {contributors.slice(0, 10).map((user: any) => (
                    <div key={user.login} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 border border-border/50 group-hover:border-primary/50 transition-colors">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.login.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <a 
                          href={user.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
                        >
                          {user.login}
                        </a>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-muted/50 border-border/50">
                        {user.contributions}
                      </Badge>
                    </div>
                  ))}
                  {contributors.length > 10 && (
                    <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border/30">
                      + {contributors.length - 10} more contributors
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No contributors found.</div>
              )}
            </CardContent>
          </Card>

          {repo.topics && repo.topics.length > 0 && (
            <Card className="bg-card/40 border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {repo.topics.map((topic: string) => (
                    <Badge key={topic} variant="secondary" className="bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 text-xs font-medium border-none px-2.5 py-1 rounded-md transition-colors">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
