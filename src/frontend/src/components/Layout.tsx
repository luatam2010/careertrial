import { useSession } from "@/hooks/useSession";
import { Link, Outlet } from "@tanstack/react-router";
import { Compass, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { MentorChatWidget } from "./MentorChatWidget";
import { PilotPricingPopup } from "./PilotPricingPopup";

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-card"
    >
      <Compass className="size-5" strokeWidth={2.2} />
    </span>
  );
}

function Header() {
  const { isAuthenticated, isInitializing, displayName, logout } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          to="/"
          data-ocid="nav.home_link"
          className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <LogoMark />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-lg font-bold tracking-tight text-foreground">
              Career Trial
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Khám phá nghề nghiệp
            </span>
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              data-ocid="nav.session_state"
              className="hidden items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground sm:flex"
            >
              <span
                className="size-1.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span className="max-w-[10rem] truncate">{displayName}</span>
            </span>
            <button
              type="button"
              data-ocid="nav.logout_button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            data-ocid="nav.login_button"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-smooth hover:bg-accent hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {isInitializing ? "Đang tải…" : "Đăng nhập"}
          </Link>
        )}
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center md:flex-row md:px-6 md:text-left">
        <p className="text-sm text-muted-foreground">
          Career Trial — hành trình thử nghề dành cho học sinh Việt Nam.
        </p>
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-smooth hover:text-primary"
        >
          © {year}. Built with love using caffeine.ai
        </a>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-page">
      <Header />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
      <PilotPricingPopup />
      <MentorChatWidget />
    </div>
  );
}
