import { useGitHub } from "@/hooks/use-github";
import { Link, useLocation } from "wouter";
import { Github, LayoutDashboard, Library, Settings, LogOut, Code2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/use-github-api";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { config, setConfig } = useGitHub();
  const [location] = useLocation();
  const { data: profile } = useUserProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setConfig(null);
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/repos", label: "Repositories", icon: Library },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const NavLinks = () => (
    <nav className="flex flex-col gap-2 p-4 flex-1">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} className="w-full">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden app-bg-gradient">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <Code2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">GitHub-Hub</h1>
            <p className="text-xs text-muted-foreground">A better experience portal</p>
          </div>
        </div>

        <NavLinks />

        {config && (
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{config.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{profile?.name || config.username}</p>
                <p className="text-xs text-muted-foreground truncate">@{config.username}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-colors" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <Code2 className="h-5 w-5" />
            </div>
            <h1 className="font-bold text-foreground">GitHub-Hub</h1>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <div className="p-6 border-b border-border">
                <h2 className="font-bold text-foreground">Navigation</h2>
              </div>
              <NavLinks />
              {config && (
                <div className="p-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>{config.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-foreground truncate">{profile?.name || config.username}</p>
                      <p className="text-xs text-muted-foreground truncate">@{config.username}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-center" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto p-4 md:p-8 w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
