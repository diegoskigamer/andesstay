import { createContext, useContext } from "react";

// Contexto único de sesión. Tanto el modo simulado (context/RoleContext.jsx)
// como el modo MSAL real (auth/MsalSessionProvider.jsx) escriben en este
// mismo contexto, así que el resto de la app (NavBar, RoleGate, páginas)
// no necesita saber cuál de los dos está activo.

export const ROLES = {
  ADMIN: "Admin",
  RECEPCIONISTA: "Recepcionista",
  HUESPED: "Huesped",
  AUDITOR: "Auditor",
};

// Nombre exacto que debe tener cada App Role configurado en Azure AD
// (App Registration "BarrioDigital" → Roles de aplicación) para que se
// mapee correctamente a los roles internos de la app.
export const AZURE_APP_ROLE_TO_ROLE = {
  Admin: ROLES.ADMIN,
  Recepcionista: ROLES.RECEPCIONISTA,
  Operador: ROLES.RECEPCIONISTA, // alias por si en Azure se nombró "Operador"
  Huesped: ROLES.HUESPED,
  Cliente: ROLES.HUESPED, // alias por si en Azure se nombró "Cliente"
  Auditor: ROLES.AUDITOR,
};

export const SessionContext = createContext(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de un SessionProvider");
  return ctx;
}