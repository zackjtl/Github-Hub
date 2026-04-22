import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRepoLinks, type RepoLink } from "@/hooks/use-repo-links";
import {
  PLATFORMS,
  CATEGORY_LABELS,
  getPlatform,
  type PlatformCategory,
} from "@/lib/platforms";
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  ChevronsUpDown,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoLinksProps {
  owner: string;
  repo: string;
}

const CATEGORY_ORDER: PlatformCategory[] = [
  "hosting",
  "database",
  "service",
  "other",
];

export function RepoLinks({ owner, repo }: RepoLinksProps) {
  const { links, addLink, updateLink, removeLink } = useRepoLinks(owner, repo);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RepoLink | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (link: RepoLink) => {
    setEditing(link);
    setDialogOpen(true);
  };

  return (
    <Card
      className="bg-card/40 border-border/50 backdrop-blur-sm"
      data-testid="card-repo-links"
    >
      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Link2 className="w-4 h-4" /> Linked Platforms
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={openAdd}
          data-testid="button-add-link"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-sm text-muted-foreground italic text-center py-4">
            No linked platforms yet.
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => {
              const platform = getPlatform(link.platformId);
              const Icon = platform.icon;
              return (
                <div
                  key={link.id}
                  className="group flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-background/40 hover:border-border/80 hover:bg-background/60 transition-colors"
                  data-testid={`row-link-${link.id}`}
                >
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-md shrink-0 border border-border/50"
                    style={{
                      backgroundColor: `${platform.color}1a`,
                      color: platform.color,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0"
                    data-testid={`link-open-${link.id}`}
                  >
                    <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {link.label || platform.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{link.url}</span>
                    </div>
                  </a>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(link)}
                      data-testid={`button-edit-link-${link.id}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeLink(link.id)}
                      data-testid={`button-remove-link-${link.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <LinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSave={(values) => {
          if (editing) {
            updateLink(editing.id, values);
          } else {
            addLink(values);
          }
          setDialogOpen(false);
        }}
      />
    </Card>
  );
}

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: RepoLink | null;
  onSave: (values: Omit<RepoLink, "id">) => void;
}

function LinkDialog({ open, onOpenChange, editing, onSave }: LinkDialogProps) {
  const [platformId, setPlatformId] = useState<string>(
    editing?.platformId ?? "vercel",
  );
  const [url, setUrl] = useState<string>(editing?.url ?? "");
  const [label, setLabel] = useState<string>(editing?.label ?? "");
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Reset form whenever the dialog opens
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPlatformId(editing?.platformId ?? "vercel");
      setUrl(editing?.url ?? "");
      setLabel(editing?.label ?? "");
    }
    onOpenChange(next);
  };

  const selected = getPlatform(platformId);
  const SelectedIcon = selected.icon;

  const canSave = platformId.trim() && url.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      platformId,
      url: url.trim(),
      label: label.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Link" : "Add Linked Platform"}
            </DialogTitle>
            <DialogDescription>
              Link this repo to a hosting service, database, or external tool.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Platform
              </Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between h-11 font-normal"
                    data-testid="combobox-platform"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded shrink-0"
                        style={{
                          backgroundColor: `${selected.color}1a`,
                          color: selected.color,
                        }}
                      >
                        <SelectedIcon className="w-3.5 h-3.5" />
                      </span>
                      <span>{selected.name}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1.5 font-normal"
                      >
                        {CATEGORY_LABELS[selected.category]}
                      </Badge>
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search platform..."
                      data-testid="input-platform-search"
                    />
                    <CommandList className="max-h-72">
                      <CommandEmpty>No platform found.</CommandEmpty>
                      {CATEGORY_ORDER.map((cat) => {
                        const items = PLATFORMS.filter(
                          (p) => p.category === cat,
                        );
                        if (items.length === 0) return null;
                        return (
                          <CommandGroup
                            key={cat}
                            heading={CATEGORY_LABELS[cat]}
                          >
                            {items.map((p) => {
                              const Icon = p.icon;
                              const isSelected = p.id === platformId;
                              return (
                                <CommandItem
                                  key={p.id}
                                  value={`${p.name} ${p.id}`}
                                  onSelect={() => {
                                    setPlatformId(p.id);
                                    setPopoverOpen(false);
                                  }}
                                  data-testid={`option-platform-${p.id}`}
                                >
                                  <span
                                    className="flex items-center justify-center w-5 h-5 rounded shrink-0 mr-2"
                                    style={{
                                      backgroundColor: `${p.color}1a`,
                                      color: p.color,
                                    }}
                                  >
                                    <Icon className="w-3 h-3" />
                                  </span>
                                  <span className="flex-1">{p.name}</span>
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        );
                      })}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="link-url"
                className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
              >
                URL
              </Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-11"
                data-testid="input-link-url"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="link-label"
                className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
              >
                Label (Optional)
              </Label>
              <Input
                id="link-label"
                placeholder={`e.g. Production, Staging, ${selected.name}`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-11"
                data-testid="input-link-label"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-link"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSave}
              data-testid="button-save-link"
            >
              {editing ? "Save Changes" : "Add Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
