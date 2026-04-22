import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRepoNotes, type RepoNote } from "@/hooks/use-repo-notes";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FileText, ExternalLink, AlertCircle, Eye, Columns2, Edit3 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";

interface RepoNotesProps {
  owner: string;
  repo: string;
}

type EditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; note: RepoNote };

export function RepoNotes({ owner, repo }: RepoNotesProps) {
  const { notes, gist, isLoading, error, create, update, remove } = useRepoNotes(owner, repo);
  const { toast } = useToast();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [confirmDelete, setConfirmDelete] = useState<RepoNote | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("split");

  const activeNote = notes.find((n) => n.id === activeId) || notes[0] || null;

  const openCreate = () => {
    setDraftTitle("");
    setDraftContent("");
    setEditor({ mode: "create" });
  };

  const openEdit = (note: RepoNote) => {
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setEditor({ mode: "edit", note });
  };

  const closeEditor = () => setEditor({ mode: "closed" });

  const handleSave = async () => {
    if (!draftTitle.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    try {
      if (editor.mode === "create") {
        await create.mutateAsync({ title: draftTitle, content: draftContent });
        toast({ title: "Note created" });
      } else if (editor.mode === "edit") {
        await update.mutateAsync({ id: editor.note.id, title: draftTitle, content: draftContent });
        toast({ title: "Note updated" });
      }
      closeEditor();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await remove.mutateAsync({ id: confirmDelete.id });
      if (activeId === confirmDelete.id) setActiveId(null);
      toast({ title: "Note deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setConfirmDelete(null);
    }
  };

  if (error) {
    return (
      <Card className="bg-card/30 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {(error as Error).message}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Notes are stored in a private GitHub Gist. Your token must include the{" "}
            <span className="font-mono bg-muted px-1 py-0.5 rounded">gist</span> scope.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30 border-border/50 backdrop-blur-sm" data-testid="repo-notes">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Notes</span>
            <span className="text-xs text-muted-foreground">
              {isLoading ? "" : `${notes.length}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {gist && (
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                <a href={gist.html_url} target="_blank" rel="noopener noreferrer" title="Open backing gist">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            )}
            <Button size="sm" onClick={openCreate} className="h-8" data-testid="button-new-note">
              <Plus className="w-3.5 h-3.5 mr-1" /> New
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : notes.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-1">No notes yet for this repo.</p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              Notes are stored as Markdown files in a private GitHub Gist, synced across all your devices.
            </p>
            <Button size="sm" onClick={openCreate} variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" /> Create your first note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[400px]">
            {/* List */}
            <div className="border-b md:border-b-0 md:border-r border-border/50 max-h-[500px] overflow-y-auto">
              {notes.map((note) => {
                const isActive = (activeNote?.id || notes[0]?.id) === note.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => setActiveId(note.id)}
                    className={`w-full text-left p-3 border-b border-border/30 transition-colors hover:bg-muted/30 ${
                      isActive ? "bg-primary/10 border-l-2 border-l-primary" : ""
                    }`}
                    data-testid={`note-item-${note.id}`}
                  >
                    <div className="text-sm font-medium truncate text-foreground">
                      {note.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {note.content.split("\n")[0].slice(0, 60) || "Empty note"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Viewer */}
            {activeNote ? (
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border/50 gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{activeNote.title}</h3>
                    {gist && (
                      <p className="text-[11px] text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(gist.updated_at))} ago
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(activeNote)} className="h-8">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete(activeNote)}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[500px]">
                  {activeNote.content.trim() ? (
                    <article className="prose prose-sm dark:prose-invert max-w-none
                      prose-headings:border-b prose-headings:border-border/50 prose-headings:pb-2
                      prose-a:text-primary prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.content}</ReactMarkdown>
                    </article>
                  ) : (
                    <p className="italic text-muted-foreground text-sm">This note is empty.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-muted-foreground">Select a note</div>
            )}
          </div>
        )}
      </CardContent>

      {/* Editor dialog */}
      <Dialog open={editor.mode !== "closed"} onOpenChange={(o) => !o && closeEditor()}>
        <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[1200px] h-[90vh] flex flex-col gap-3 p-4 sm:p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle>{editor.mode === "edit" ? "Edit Note" : "New Note"}</DialogTitle>
            <DialogDescription>
              Markdown is supported. Notes sync to your private GitHub Gist.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Input
              placeholder="Note title"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="flex-1"
              data-testid="input-note-title"
            />
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as typeof viewMode)}
              className="bg-muted/30 rounded-md p-0.5 border border-border/50"
            >
              <ToggleGroupItem value="edit" size="sm" className="h-8 px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary" title="Editor only">
                <Edit3 className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Edit</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="split" size="sm" className="h-8 px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary" title="Split view">
                <Columns2 className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Split</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="preview" size="sm" className="h-8 px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary" title="Preview only">
                <Eye className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Preview</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div
            className={`flex-1 min-h-0 grid gap-3 ${
              viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {(viewMode === "edit" || viewMode === "split") && (
              <div className="flex flex-col min-h-0 border border-border/50 rounded-md overflow-hidden bg-background/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5 bg-muted/30 border-b border-border/50 shrink-0">
                  Markdown
                </div>
                <Textarea
                  placeholder="Write in Markdown..."
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  className="flex-1 resize-none border-0 rounded-none font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  data-testid="textarea-note-content"
                />
              </div>
            )}
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="flex flex-col min-h-0 border border-border/50 rounded-md overflow-hidden bg-background/40">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5 bg-muted/30 border-b border-border/50 shrink-0">
                  Preview
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {draftContent.trim() ? (
                    <article className="prose prose-sm dark:prose-invert max-w-none
                      prose-headings:border-b prose-headings:border-border/50 prose-headings:pb-2
                      prose-a:text-primary prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{draftContent}</ReactMarkdown>
                    </article>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0">
            <Button variant="ghost" onClick={closeEditor}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={create.isPending || update.isPending}
              data-testid="button-save-note"
            >
              {create.isPending || update.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.title}" will be permanently removed from your gist. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
