import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepoCommitActivity, type CommitActivityWeek } from "@/hooks/use-github-api";
import { Activity, GitCommit, Flame, CalendarDays, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommitActivityChartProps {
  owner: string;
  repo: string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getLevelClass(count: number, max: number): string {
  if (count === 0) return "bg-muted/30 border border-border/20";
  const ratio = max > 0 ? count / max : 0;
  if (ratio < 0.2) return "bg-primary/20 border border-primary/30";
  if (ratio < 0.45) return "bg-primary/40 border border-primary/40";
  if (ratio < 0.7) return "bg-primary/65 border border-primary/50";
  return "bg-primary border border-primary";
}

function computeStats(weeks: CommitActivityWeek[]) {
  let total = 0;
  let maxDay = { count: 0, date: 0 };
  let bestWeek = { count: 0, week: 0 };
  let activeDays = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  // Flatten into a chronological list of (timestamp, count)
  const dayPoints: { ts: number; count: number }[] = [];
  weeks.forEach((w) => {
    w.days.forEach((c, dayIdx) => {
      const ts = (w.week + dayIdx * 86400) * 1000;
      dayPoints.push({ ts, count: c });
      total += c;
      if (c > 0) activeDays++;
      if (c > maxDay.count) maxDay = { count: c, date: ts };
    });
    if (w.total > bestWeek.count) bestWeek = { count: w.total, week: w.week * 1000 };
  });

  dayPoints.sort((a, b) => a.ts - b.ts);
  // Streak ending at most-recent day
  for (let i = dayPoints.length - 1; i >= 0; i--) {
    if (dayPoints[i].count > 0) currentStreak++;
    else break;
  }
  // Longest streak overall
  let runningStreak = 0;
  for (const p of dayPoints) {
    if (p.count > 0) {
      runningStreak++;
      if (runningStreak > maxStreak) maxStreak = runningStreak;
    } else {
      runningStreak = 0;
    }
  }

  return { total, maxDay, bestWeek, activeDays, maxStreak, currentStreak };
}

export function CommitActivityChart({ owner, repo }: CommitActivityChartProps) {
  const { data: weeks, isLoading, error, isFetching, refetch } = useRepoCommitActivity(owner, repo);

  const { stats, max, monthMarkers } = useMemo(() => {
    if (!weeks || weeks.length === 0) {
      return { stats: null, max: 0, monthMarkers: [] as { idx: number; label: string }[] };
    }
    const stats = computeStats(weeks);
    let max = 0;
    weeks.forEach((w) => w.days.forEach((c) => { if (c > max) max = c; }));
    const monthMarkers: { idx: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((w, idx) => {
      const m = new Date(w.week * 1000).getMonth();
      if (m !== lastMonth) {
        monthMarkers.push({ idx, label: MONTH_LABELS[m] });
        lastMonth = m;
      }
    });
    return { stats, max, monthMarkers };
  }, [weeks]);

  const isComputing = error && (error as Error).message === "STATS_COMPUTING";

  return (
    <Card className="bg-card/40 border-border/50 backdrop-blur-sm" data-testid="commit-activity-chart">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Activity className="w-4 h-4" /> Commit Activity
          <span className="text-[10px] font-normal normal-case text-muted-foreground/70 ml-1">
            (last 52 weeks)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || isFetching && !weeks ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : isComputing ? (
          <div className="text-center py-10 text-sm text-muted-foreground space-y-3">
            <Activity className="w-8 h-8 mx-auto text-muted-foreground/50 animate-pulse" />
            <div>
              GitHub is still computing the stats for this repo.
              {isFetching && <span className="block text-xs mt-1 opacity-70">Auto-retrying…</span>}
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
              Retry now
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-muted-foreground space-y-3">
            <AlertCircle className="w-6 h-6 text-destructive/70 mx-auto" />
            <div>Could not load commit activity.</div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        ) : !weeks || weeks.length === 0 || stats?.total === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground italic">
            No commit activity in the last year.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Stats summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatTile
                icon={<GitCommit className="w-4 h-4" />}
                label="Total commits"
                value={stats!.total.toLocaleString()}
                sub={`${stats!.activeDays} active days`}
              />
              <StatTile
                icon={<Flame className="w-4 h-4 text-orange-400" />}
                label="Longest streak"
                value={`${stats!.maxStreak}`}
                sub={`days · current ${stats!.currentStreak}`}
              />
              <StatTile
                icon={<CalendarDays className="w-4 h-4 text-blue-400" />}
                label="Busiest day"
                value={stats!.maxDay.count > 0 ? `${stats!.maxDay.count}` : "—"}
                sub={
                  stats!.maxDay.count > 0
                    ? format(new Date(stats!.maxDay.date), "MMM d, yyyy")
                    : "no commits"
                }
              />
              <StatTile
                icon={<Activity className="w-4 h-4 text-green-400" />}
                label="Best week"
                value={`${stats!.bestWeek.count}`}
                sub={
                  stats!.bestWeek.count > 0
                    ? `week of ${format(new Date(stats!.bestWeek.week), "MMM d")}`
                    : "—"
                }
              />
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto -mx-2 px-2 pb-2">
              <TooltipProvider delayDuration={50}>
                <div className="inline-block min-w-full">
                  {/* Month labels */}
                  <div className="flex pl-8 text-[10px] text-muted-foreground/80 mb-1.5 select-none">
                    {weeks.map((_, weekIdx) => {
                      const marker = monthMarkers.find((m) => m.idx === weekIdx);
                      return (
                        <div
                          key={weekIdx}
                          className="w-[13px] mr-[3px] h-3 flex items-end"
                        >
                          {marker ? <span>{marker.label}</span> : null}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex">
                    {/* Day-of-week labels */}
                    <div className="flex flex-col mr-2 text-[10px] text-muted-foreground/80 select-none">
                      {DAY_LABELS.map((d, i) => (
                        <div key={d} className="h-[13px] mb-[3px] flex items-center">
                          {i % 2 === 1 ? d : ""}
                        </div>
                      ))}
                    </div>

                    {/* Grid */}
                    <div className="flex">
                      {weeks.map((week) => (
                        <div key={week.week} className="flex flex-col mr-[3px]">
                          {week.days.map((count, dayIdx) => {
                            const ts = (week.week + dayIdx * 86400) * 1000;
                            return (
                              <Tooltip key={dayIdx}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`w-[13px] h-[13px] mb-[3px] rounded-sm transition-transform hover:scale-125 hover:ring-1 hover:ring-primary/50 cursor-pointer ${getLevelClass(count, max)}`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <div className="font-medium">
                                    {count} commit{count === 1 ? "" : "s"}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {format(new Date(ts), "EEE, MMM d, yyyy")}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground mt-3 select-none">
                    <span>Less</span>
                    <div className={`w-[11px] h-[11px] rounded-sm ${getLevelClass(0, max)}`} />
                    <div className={`w-[11px] h-[11px] rounded-sm ${getLevelClass(Math.max(1, Math.ceil(max * 0.15)), max)}`} />
                    <div className={`w-[11px] h-[11px] rounded-sm ${getLevelClass(Math.max(1, Math.ceil(max * 0.35)), max)}`} />
                    <div className={`w-[11px] h-[11px] rounded-sm ${getLevelClass(Math.max(1, Math.ceil(max * 0.6)), max)}`} />
                    <div className={`w-[11px] h-[11px] rounded-sm ${getLevelClass(max, max)}`} />
                    <span>More</span>
                  </div>
                </div>
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatTile({
  icon, label, value, sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-background/40 border border-border/40 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
    </div>
  );
}
