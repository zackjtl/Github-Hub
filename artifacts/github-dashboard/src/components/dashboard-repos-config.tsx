import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Settings2, Search, Lock, Globe, X } from "lucide-react";
import {
  useDashboardPrefs,
  type DashboardMode,
} from "@/hooks/use-dashboard-prefs";

interface DashboardReposConfigProps {
  repos: any[];
  trigger?: React.ReactNode;
}

export function DashboardReposConfig({
  repos,
  trigger,
}: DashboardReposConfigProps) {
  const { prefs, setPrefs } = useDashboardPrefs();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DashboardMode>(prefs.mode);
  const [selected, setSelected] = useState<string[]>(prefs.pinnedRepos);
  const [search, setSearch] = useState("");

  // Reset working state whenever the dialog opens
  useEffect(() => {
    if (open) {
      setMode(prefs.mode);
      setSelected(prefs.pinnedRepos);
      setSearch("");
    }
  }, [open, prefs.mode, prefs.pinnedRepos]);

  const filteredRepos = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...repos].sort((a, b) => {
      const aSel = selected.includes(a.full_name);
      const bSel = selected.includes(b.full_name);
      if (aSel !== bSel) return aSel ? -1 : 1;
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
    if (!q) return sorted;
    return sorted.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q),
    );
  }, [repos, search, selected]);

  const toggle = (fullName: string) => {
    setSelected((prev) =>
      prev.includes(fullName)
        ? prev.filter((n) => n !== fullName)
        : [...prev, fullName],
    );
  };

  const handleSave = () => {
    setPrefs({ mode, pinnedRepos: selected });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(true)}
          data-testid="button-configure-dashboard-repos"
        >
          <Settings2 className="w-4 h-4 mr-1.5" />
          Configure
        </Button>
      )}

      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Dashboard Repositories</DialogTitle>
          <DialogDescription>
            Choose which repositories appear on your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 flex-1 min-h-0 flex flex-col">
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as DashboardMode)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <Label
              htmlFor="mode-auto"
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                mode === "auto"
                  ? "border-primary/60 bg-primary/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <RadioGroupItem
                id="mode-auto"
                value="auto"
                data-testid="radio-mode-auto"
              />
              <div className="space-y-1">
                <div className="font-medium text-foreground">Automatic</div>
                <div className="text-xs text-muted-foreground">
                  Show your most recently updated repositories.
                </div>
              </div>
            </Label>

            <Label
              htmlFor="mode-manual"
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                mode === "manual"
                  ? "border-primary/60 bg-primary/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <RadioGroupItem
                id="mode-manual"
                value="manual"
                data-testid="radio-mode-manual"
              />
              <div className="space-y-1">
                <div className="font-medium text-foreground">Manual</div>
                <div className="text-xs text-muted-foreground">
                  Pick exactly which repositories to display.
                </div>
              </div>
            </Label>
          </RadioGroup>

          {mode === "manual" && (
            <div className="flex-1 min-h-0 flex flex-col space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search repositories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    data-testid="input-pin-search"
                  />
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {selected.length} selected
                </Badge>
                {selected.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground"
                    onClick={() => setSelected([])}
                    data-testid="button-clear-pinned"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[340px] border border-border/50 rounded-lg">
                <div className="p-1">
                  {filteredRepos.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No repositories found.
                    </div>
                  ) : (
                    filteredRepos.map((repo) => {
                      const isSelected = selected.includes(repo.full_name);
                      return (
                        <Label
                          key={repo.id}
                          htmlFor={`pin-${repo.id}`}
                          className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10"
                              : "hover:bg-muted/40"
                          }`}
                          data-testid={`row-pin-${repo.id}`}
                        >
                          <Checkbox
                            id={`pin-${repo.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggle(repo.full_name)}
                            data-testid={`checkbox-pin-${repo.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground truncate">
                                {repo.name}
                              </span>
                              {repo.private ? (
                                <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                              ) : (
                                <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                              )}
                              {repo.language && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-4 px-1.5 font-normal"
                                >
                                  {repo.language}
                                </Badge>
                              )}
                            </div>
                            {repo.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {repo.description}
                              </div>
                            )}
                          </div>
                        </Label>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel-dashboard-config"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-dashboard-config">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
