import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalInstance, apiRequest } from "./msalConfig";

/**
 * Obtiene el access_token vigente para llamar al backend, renovándolo en
 * silencio si hace falta. Si la renovación silenciosa falla (ej. requiere
 * MFA o el usuario debe volver a interactuar), redirige a Microsoft login.
 *
 * Devuelve null si MSAL no está configurado (modo simulado).
 */
export async function getAccessToken() {
  if (!msalInstance) return null;

  const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
  if (!account) return null;

  try {
    const result = await msalInstance.acquireTokenSilent({
      ...apiRequest,
      account,
    });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect(apiRequest);
      return null; // se redirige; el flujo continúa después del login
    }
    throw error;
  }
}