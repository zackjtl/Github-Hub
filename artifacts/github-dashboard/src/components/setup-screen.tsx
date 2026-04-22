import { useState } from "react";
import { useGitHub } from "@/hooks/use-github";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Github, KeyRound, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SetupScreen() {
  const { setConfig } = useGitHub();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !token.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter both username and token.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app we might validate the token first, 
    // but here we'll just save it and let the API queries handle invalid tokens
    setConfig({ username: username.trim(), token: token.trim() });
    
    toast({
      title: "Configuration Saved",
      description: "Welcome to your GitHub Dashboard.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/50 bg-card/80 backdrop-blur-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="bg-primary/20 p-3 rounded-2xl text-primary ring-1 ring-primary/30">
                <Code2 className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">GitDash Setup</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Connect your GitHub account to access your personal command center.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <User className="w-3 h-3" /> GitHub Username
              </Label>
              <Input 
                id="username" 
                placeholder="e.g. torvalds" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/50 border-border/50 focus-visible:ring-primary h-11"
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="token" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <KeyRound className="w-3 h-3" /> Personal Access Token
                </Label>
                <a 
                  href="https://github.com/settings/tokens/new" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-primary hover:underline"
                >
                  Create token
                </a>
              </div>
              <Input 
                id="token" 
                type="password" 
                placeholder="ghp_..." 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-background/50 border-border/50 focus-visible:ring-primary h-11"
                data-testid="input-token"
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">
                Requires <span className="font-mono text-foreground bg-muted px-1 py-0.5 rounded">repo</span> and <span className="font-mono text-foreground bg-muted px-1 py-0.5 rounded">user</span> scopes. Token is stored locally in your browser.
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-6">
            <Button type="submit" className="w-full h-11 font-medium" data-testid="button-submit-setup">
              <Github className="w-4 h-4 mr-2" />
              Connect Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
