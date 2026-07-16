import { Link, useLocation } from "wouter";
import { Home, Users, BookOpen, Settings } from "lucide-react";
import { useRollCall } from "@/hooks/useRollCall";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();
  const { currentSession } = useRollCall();

  const tabs = [
    { href: "/", label: "Головна", icon: Home, indicator: !!currentSession },
    { href: "/roster", label: "Склад", icon: Users },
    { href: "/history", label: "Журнал", icon: BookOpen },
    { href: "/settings", label: "Налаштування", icon: Settings },
  ];

  // Do not show bottom nav on roll call active screen to maximize space
  if (location.startsWith("/roll-call/")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = location === tab.href || (tab.href !== "/" && location.startsWith(tab.href));
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors touch-manipulation",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <tab.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                {tab.indicator && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
