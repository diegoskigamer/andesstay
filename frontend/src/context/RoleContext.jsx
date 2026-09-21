import { useState, useEffect } from "react";
import { SessionContext, ROLES } from "./SessionContext";

export { ROLES } from "./SessionContext";
export { useSession } from "./SessionContext";

// -----------------------------------------------------------------------
// MODO SIMULADO (sin Cognito/Azure AD real) — se usa cuando
// VITE_AUTH_MODE !== "cognito" o cuando falta configurar Cognito en .env.
//
// Tiene su propia pantalla de login (SimulatedLogin.jsx) y un botón de
// "Cerrar sesión" — el mismo comportamiento que el login real, sin
// depender de AWS/Azure.
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
    return { role: ROLES.ADMIN, name: "Ana Admin", isAuthenticated: false };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const setRole = (role, name) => setSession((s) => ({ ...s, role, name: name ?? s.name }));
  const setName = (name) => setSession((s) => ({ ...s, name }));

  const login = (name, role) =>
    setSession((s) => ({ ...s, name: name || s.name, role: role || s.role, isAuthenticated: true }));

  const logout = () => setSession((s) => ({ ...s, isAuthenticated: false }));

  const value = {
    ...session,
    authMode: "simulated",
    setRole,
    setName,
    login,
    logout,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}