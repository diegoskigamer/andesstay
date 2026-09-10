import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { SessionContext, ROLES, AZURE_APP_ROLE_TO_ROLE } from "../context/SessionContext";
import { msalInstance, loginRequest } from "./msalConfig";

// -----------------------------------------------------------------------
// MODO MSAL REAL — se activa cuando VITE_AUTH_MODE=msal y están seteadas
// VITE_AZURE_CLIENT_ID / VITE_AZURE_TENANT_ID en frontend/.env.
//
// Lee el rol desde los App Roles del token de Azure AD (claim "roles").
// Esos roles se configuran en Azure Portal → App Registration
// "BarrioDigital" → App roles, y se asignan a cada usuario/grupo en
// Enterprise Applications → Users and groups.
// -----------------------------------------------------------------------

function rolesFromClaims(claims) {
  const rawRoles = claims?.roles || [];
  return rawRoles.map((r) => AZURE_APP_ROLE_TO_ROLE[r]).filter(Boolean);
}

function MsalSessionBridge({ children }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = accounts[0];

  const claims = account?.idTokenClaims;
  const mappedRoles = rolesFromClaims(claims);
  // Si el usuario tiene varios App Roles asignados, se usa el de mayor
  // jerarquía para la UI (Admin > Recepcionista > Auditor > Huésped).
  const priority = [ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.AUDITOR, ROLES.HUESPED];
  const role = priority.find((r) => mappedRoles.includes(r)) || null;

  const value = {
    role,
    name: account?.name || account?.username || "",
    isAuthenticated,
    authMode: "msal",
    inProgress: inProgress !== InteractionStatus.None,
    login: () => instance.loginRedirect(loginRequest),
    logout: () => instance.logoutRedirect(),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function MsalSessionProvider({ children }) {
  return (
    <MsalProvider instance={msalInstance}>
      <MsalSessionBridge>{children}</MsalSessionBridge>
    </MsalProvider>
  );
}