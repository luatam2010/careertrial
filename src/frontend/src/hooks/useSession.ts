import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useCallback } from "react";

export interface Session {
  isAuthenticated: boolean;
  isInitializing: boolean;
  principal: string | null;
  /** Short display label derived from the principal. */
  displayName: string | null;
  login: () => void;
  logout: () => void;
}

/**
 * Local sign-in state backed by Internet Identity.
 * The identity provider URL is injected by the deployment environment.
 */
export function useSession(): Session {
  const {
    identity,
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
  } = useInternetIdentity();

  const principal = identity?.getPrincipal().toText() ?? null;

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  const handleLogout = useCallback(() => {
    clear();
  }, [clear]);

  return {
    isAuthenticated,
    isInitializing: isInitializing || isLoggingIn,
    principal,
    displayName: principal
      ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
      : null,
    login: handleLogin,
    logout: handleLogout,
  };
}
