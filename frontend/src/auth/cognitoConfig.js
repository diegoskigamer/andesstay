

export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "simulated"; // "simulated" | "cognito"

const domain = import.meta.env.VITE_COGNITO_DOMAIN;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI || `${window.location.origin}/callback`;
const logoutUri = `${window.location.origin}/login?fromLogout=1`;
const azureTenantId = import.meta.env.VITE_AZURE_TENANT_ID;

export function buildAzureLogoutUrl() {
  const postLogout = encodeURIComponent(`${window.location.origin}/login`);
  return `https://login.microsoftonline.com/${azureTenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogout}`;
}
const scope = import.meta.env.VITE_COGNITO_SCOPE || "openid profile email";

export const isCognitoConfigured = Boolean(domain && clientId);

export const cognitoConfig = { domain, clientId, redirectUri, logoutUri, scope };

export function buildAuthorizeUrl() {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope,
    redirect_uri: redirectUri,
  });
  return `https://${domain}/oauth2/authorize?${params.toString()}`;
}

export function buildLogoutUrl() {
  const params = new URLSearchParams({
    client_id: clientId,
    logout_uri: logoutUri,
  });
  return `https://${domain}/logout?${params.toString()}`;
}