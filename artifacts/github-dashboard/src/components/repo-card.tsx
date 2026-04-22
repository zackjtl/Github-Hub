import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, Lock, Globe, Clock, ExternalLink } from "lucide-react";
import { getLanguageColor } from "@/lib/language-colors";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface RepoCardProps {
  repo: any;
  compact?: boolean;
}

export function RepoCard({ repo, compact = false }: RepoCardProps) {
  const languageColor = getLanguageColor(repo.language);
  
  if (compact) {
    return (
      <Link href={`/repo/${repo.owner.login}/${repo.name}`}>
        <Card className="group hover-elevate transition-all border-border/50 bg-card/40 backdrop-blur-sm cursor-pointer h-full flex flex-col justify-center">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-primary group-hover:text-primary/80 transition-colors truncate">
                  {repo.name}
                </h3>
                <Badge variant={repo.private ? "secondary" : "outline"} className="text-[10px] h-5 px-1.5 font-mono">
                  {repo.private ? <Lock className="w-3 h-3 mr-1"/> : <Globe className="w-3 h-3 mr-1"/>}
                  {repo.private ? "Private" : "Public"}
                </Badge>
                {repo.archived && (
                  <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-mono bg-destructive/10 text-destructive border-none">
                    Archived
                  </Badge>
                )}
              </div>
              {repo.description && (
                <p className="text-sm text-muted-foreground truncate">{repo.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              {repo.language && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: languageColor }} />
                  <span>{repo.language}</span>
                </div>
              )}
              {repo.stargazers_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  <span>{repo.stargazers_count}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="group hover-elevate transition-all border-border/50 bg-card/40 backdrop-blur-sm flex flex-col h-full overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <Link href={`/repo/${repo.owner.login}/${repo.name}`} className="min-w-0">
            <CardTitle className="text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors truncate cursor-pointer break-words">
              {repo.name}
            </CardTitle>
          </Link>
          <Badge variant={repo.private ? "secondary" : "outline"} className="shrink-0 text-[10px] h-5 px-1.5 font-mono">
            {repo.private ? <Lock className="w-3 h-3 mr-1"/> : <Globe className="w-3 h-3 mr-1"/>}
            {repo.private ? "Private" : "Public"}
          </Badge>
        </div>
        {repo.archived && (
          <Badge variant="destructive" className="w-fit text-[10px] h-5 px-1.5 mt-2 font-mono bg-destructive/10 text-destructive border-none">
            Archived
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-5 pt-0 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {repo.description || <span className="italic opacity-50">No description provided.</span>}
        </p>

        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {repo.topics.slice(0, 4).map((topic: string) => (
              <Badge key={topic} variant="secondary" className="bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 text-[10px] font-medium border-none px-2 rounded-md">
                {topic}
              </Badge>
            ))}
            {repo.topics.length > 4 && (
              <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground text-[10px] font-medium border-none px-2 rounded-md">
                +{repo.topics.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/30">
          <div className="flex items-center gap-4">
            {repo.language && (
              <div className="flex items-center gap-1.5 font-medium">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: languageColor }} />
                <span>{repo.language}</span>
              </div>
            )}
            {repo.stargazers_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                <span>{repo.stargazers_count}</span>
              </div>
            )}
            {repo.forks_count > 0 && (
              <div className="flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5" />
                <span>{repo.forks_count}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-60">
            <span>{formatDistanceToNow(new Date(repo.updated_at))} ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
