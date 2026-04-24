import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Search, HandHeart, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/read", label: "Read", icon: BookOpen },
  { to: "/search", label: "Search", icon: Search },
  { to: "/prayer", label: "Prayer", icon: HandHeart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active = pathname === item.to || (item.to === "/read" && pathname.startsWith("/read"));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="group relative flex flex-col items-center gap-1 px-4 py-1.5"
            >
              <Icon
                className={`h-5 w-5 transition-all ${active ? "text-[var(--gold-deep)]" : "text-muted-foreground group-hover:text-foreground"}`}
                strokeWidth={active ? 2.2 : 1.6}
              />
              <span
                className={`text-[10px] font-medium tracking-wide ${active ? "text-[var(--gold-deep)]" : "text-muted-foreground"}`}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute -top-2 h-[3px] w-8 rounded-full bg-gradient-gold" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}