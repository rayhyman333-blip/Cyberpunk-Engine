import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Megaphone, 
  Wallet, 
  LogOut, 
  Menu,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/deposit", label: "Wallet", icon: Wallet },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/payouts", label: "Payouts", icon: ShieldAlert });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full bg-black/90 border-r border-white/10">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          GEO<span className="text-white">ENGINE</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          v2.0.4 <span className="text-primary animate-pulse">●</span> ONLINE
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "animate-pulse" : "group-hover:text-primary"}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 bg-black/40">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{user?.username}</span>
            <span className="text-xs text-primary font-mono">
              ${((user?.balance || 0) / 100).toFixed(2)}
            </span>
          </div>
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/40"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40 text-primary">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 border-r border-white/10 w-72 bg-black">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-8 mt-12 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
