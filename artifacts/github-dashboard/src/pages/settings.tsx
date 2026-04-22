import { useState, useEffect } from "react";
import { useGitHub } from "@/hooks/use-github";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Github, Moon, Sun, Monitor, Save, AlertTriangle, ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Settings() {
  const { config, setConfig } = useGitHub();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [username, setUsername] = useState(config?.username || "");
  const [token, setToken] = useState(config?.token || "");
  const [scopeCheck, setScopeCheck] = useState<{
    loading: boolean;
    scopes?: string[];
    error?: string;
  }>({ loading: false });

  const requiredScopes = ["repo", "user", "gist"];

  const checkScopes = async () => {
    if (!config?.token) return;
    setScopeCheck({ loading: true });
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: { Authorization: `token ${config.token}` },
      });
      if (!res.ok) {
        setScopeCheck({ loading: false, error: `GitHub returned ${res.status}` });
        return;
      }
      const header = res.headers.get("X-OAuth-Scopes") || "";
      const scopes = header.split(",").map((s) => s.trim()).filter(Boolean);
      setScopeCheck({ loading: false, scopes });
    } catch (e: any) {
      setScopeCheck({ loading: false, error: e?.message || "Network error" });
    }
  };

  const hasScope = (s: string) => {
    if (!scopeCheck.scopes) return false;
    if (scopeCheck.scopes.includes(s)) return true;
    // GitHub treats parent scope as covering child (e.g. "user" covers "user:email")
    return scopeCheck.scopes.some((g) => g.startsWith(`${s}:`));
  };

  const handleSave = () => {
    if (!username.trim() || !token.trim()) {
      toast({
        title: "Missing fields",
        description: "Username and token are required.",
        variant: "destructive"
      });
      return;
    }

    setConfig({ username: username.trim(), token: token.trim() });
    
    toast({
      title: "Settings Saved",
      description: "Your GitHub configuration has been updated.",
    });
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect? You will be returned to the setup screen.")) {
      setConfig(null);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl pb-10 animate-in fade-in duration-500" data-testid="page-settings">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your GitHub connection and app preferences.</p>
      </div>

      <Card className="bg-card/40 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" /> GitHub Configuration
          </CardTitle>
          <CardDescription>
            Update the token and username used to fetch data from the GitHub API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-primary/5 border-primary/20 text-foreground">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-foreground">Local Storage Only</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              Your personal access token is stored securely in your browser's local storage and is only sent directly to api.github.com.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="settings-username">Username</Label>
              <Input 
                id="settings-username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="max-w-md bg-background/50"
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between max-w-md">
                <Label htmlFor="settings-token">Personal Access Token</Label>
                <a 
                  href="https://github.com/settings/tokens/new" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Generate new
                </a>
              </div>
              <Input 
                id="settings-token" 
                type="password" 
                value={token} 
                onChange={(e) => setToken(e.target.value)}
                className="max-w-md bg-background/50 font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border/30">
            <Button onClick={handleSave} className="hover-elevate">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-none">
              Disconnect Account
            </Button>
          </div>

          {config?.token && (
            <div className="pt-4 border-t border-border/30 space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Token Permissions
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verify which scopes your saved token actually has.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={checkScopes}
                  disabled={scopeCheck.loading}
                  data-testid="button-check-scopes"
                >
                  {scopeCheck.loading ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Checking...</>
                  ) : (
                    <>Check now</>
                  )}
                </Button>
              </div>

              {scopeCheck.error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{scopeCheck.error}</AlertDescription>
                </Alert>
              )}

              {scopeCheck.scopes && (
                <div className="space-y-3 bg-muted/20 rounded-lg p-4 border border-border/40">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Required scopes
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {requiredScopes.map((s) => {
                        const ok = hasScope(s);
                        return (
                          <span
                            key={s}
                            className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md border ${
                              ok
                                ? "bg-green-500/10 text-green-500 border-green-500/30"
                                : "bg-destructive/10 text-destructive border-destructive/30"
                            }`}
                          >
                            {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      All granted scopes
                    </div>
                    {scopeCheck.scopes.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">
                        None reported (this may be a fine-grained token; scopes are managed differently for those).
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {scopeCheck.scopes.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center text-[11px] font-mono px-1.5 py-0.5 rounded bg-background/60 border border-border/50 text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {!requiredScopes.every(hasScope) && (
                    <p className="text-xs text-destructive/90">
                      Some required scopes are missing. Generate a new token with the missing scopes checked, then paste it above.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/40 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how GitHub-Hub looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all hover-elevate ${
                theme === "light" 
                  ? "border-primary bg-primary/5" 
                  : "border-border/50 bg-background/50 hover:border-primary/50"
              }`}
            >
              <Sun className={`w-8 h-8 mb-3 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`font-medium ${theme === 'light' ? 'text-foreground' : 'text-muted-foreground'}`}>Light</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all hover-elevate ${
                theme === "dark" 
                  ? "border-primary bg-primary/5" 
                  : "border-border/50 bg-background/50 hover:border-primary/50"
              }`}
            >
              <Moon className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`font-medium ${theme === 'dark' ? 'text-foreground' : 'text-muted-foreground'}`}>Dark</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all hover-elevate ${
                theme === "system" 
                  ? "border-primary bg-primary/5" 
                  : "border-border/50 bg-background/50 hover:border-primary/50"
              }`}
            >
              <Monitor className={`w-8 h-8 mb-3 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`font-medium ${theme === 'system' ? 'text-foreground' : 'text-muted-foreground'}`}>System</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
