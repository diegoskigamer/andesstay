import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

// -----------------------------------------------------------------------
// Configuración de MSAL / Azure AD — App Registration "BarrioDigital"
//
// Todos los valores salen de variables de entorno (nunca hardcodeados).
// Complétalas en frontend/.env (copia .env.example) con lo que te dio
// tu profesor/universidad:
//
//   VITE_AUTH_MODE=msal
//   VITE_AZURE_CLIENT_ID=<clientId de la App Registration>
//   VITE_AZURE_TENANT_ID=<TENANT_ID>
//   VITE_AZURE_REDIRECT_URI=http://localhost:5173
//   VITE_API_SCOPE=api://<API_CLIENT_ID>/access_as_user
//
// Mientras VITE_AUTH_MODE no sea "msal" (o falten estas variables), la
// app sigue funcionando con el selector de rol simulado (RoleContext),
// sin romper nada de lo que ya tienes andando.
// -----------------------------------------------------------------------

export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "simulated"; // "simulated" | "msal"

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const redirectUri = import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin;

export const isMsalConfigured = Boolean(clientId && tenantId);

export const msalConfig = {
  auth: {
    clientId: clientId || "MISSING_CLIENT_ID",
    authority: `https://login.microsoftonline.com/${tenantId || "MISSING_TENANT_ID"}/`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error("[MSAL]", message);
      },
      logLevel: LogLevel.Warning,
    },
  },
};

// Scope del API expuesto por el backend (definido en la App Registration
// del API, ej: api://<API_CLIENT_ID>/access_as_user). Se usa para pedir
// el access_token que después se manda como Bearer al backend.
export const apiRequest = {
  scopes: [import.meta.env.VITE_API_SCOPE || "openid profile"],
};

// Scope solo para el login inicial (perfil básico).
export const loginRequest = {
  scopes: ["openid", "profile", "User.Read"],
};

export const msalInstance = isMsalConfigured ? new PublicClientApplication(msalConfig) : null;