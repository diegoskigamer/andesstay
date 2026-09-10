import { useState, useEffect } from "react";
import { SessionContext, ROLES } from "./SessionContext";

export { ROLES } from "./SessionContext";
export { useSession } from "./SessionContext";

// -----------------------------------------------------------------------
// MODO SIMULADO (sin login real) — se usa cuando VITE_AUTH_MODE !== "msal"
// o cuando faltan las variables de Azure AD en .env.
//
// Deja un selector de rol para poder probar los 4 perfiles del caso sin
// depender de un tenant de Azure AD real.
// -----------------------------------------------------------------------

const STORAGE_KEY = "andesstay.simulatedSession";

export function RoleProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return { role: ROLES.ADMIN, name: "Ana Admin" };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const setRole = (role, name) => setSession({ role, name: name ?? session.name });
  const setName = (name) => setSession((s) => ({ ...s, name }));

  const value = {
    ...session,
    isAuthenticated: true, // en modo simulado "siempre hay sesión"
    authMode: "simulated",
    setRole,
    setName,
    login: () => {},
    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      setSession({ role: ROLES.ADMIN, name: "Ana Admin" });
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}