import { useState, useEffect } from "react";
import { SessionContext, ROLES, AZURE_APP_ROLE_TO_ROLE } from "../context/SessionContext";
import { buildAuthorizeUrl, buildLogoutUrl } from "./cognitoConfig";
import { decodeJwt } from "./jwt";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "./cognitoTokenStorage";

// -----------------------------------------------------------------------
// MODO COGNITO (federado con Azure AD) — se activa con VITE_AUTH_MODE=cognito.
//
// El botón de login redirige a la Hosted UI de Cognito. Cognito federa
// con Azure AD, y cuando el usuario vuelve autenticado, la página
// /callback (AuthCallback.jsx) toma el "code" y se lo manda a nuestro
// backend, que lo cambia por tokens reales (ver AuthController).
//
// El rol se lee del id_token (claim "custom:role", "cognito:groups" o
// "roles", el que exista — mismo mapeo que usa el backend).
// -----------------------------------------------------------------------

/**
 * Azure AD manda el rol como una lista, ej: ["Admin"]. Cognito, al
 * mapearlo a un atributo de texto simple (custom:role), a veces lo
 * guarda como el string literal '["Admin"]' en vez de extraer el valor.
 * Esta función soporta ambos casos: array real o string con formato JSON.
 */
function parseRoleClaim(rawValue) {
  if (!rawValue) return [];
  if (typeof rawValue === "string" && rawValue.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [rawValue];
    }
  }
  return Array.isArray(rawValue) ? rawValue : [rawValue];
}

function roleFromIdToken(idToken) {
  if (!idToken) return null;
  const claims = decodeJwt(idToken);
  if (!claims) return null;

  const candidates = [
    ...parseRoleClaim(claims["custom:role"]),
    ...parseRoleClaim(claims["cognito:groups"]),
    ...parseRoleClaim(claims.roles),
  ].filter(Boolean);

  const mapped = candidates.map((r) => AZURE_APP_ROLE_TO_ROLE[r]).filter(Boolean);
  // Si el usuario tiene varios App Roles asignados, se usa el de mayor
  // jerarquía para la UI (Admin > Recepcionista > Auditor > Huésped).
  const priority = [ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.AUDITOR, ROLES.HUESPED];
  return priority.find((r) => mapped.includes(r)) || null;
}

export function CognitoSessionProvider({ children }) {
  const [tokens, setTokens] = useState(() => getStoredTokens());

  useEffect(() => {
    if (tokens) setStoredTokens(tokens);
    else clearStoredTokens();
  }, [tokens]);

  const claims = tokens?.idToken ? decodeJwt(tokens.idToken) : null;

  const value = {
    role: roleFromIdToken(tokens?.idToken),
    name: claims?.name || claims?.email || claims?.["cognito:username"] || "",
    isAuthenticated: Boolean(tokens?.idToken),
    authMode: "cognito",
    idToken: tokens?.idToken || null,
    login: () => {
      window.location.href = buildAuthorizeUrl();
    },
    logout: () => {
      setTokens(null);
      window.location.href = buildLogoutUrl();
    },
    // Usado por AuthCallback.jsx después de recibir los tokens del backend.
    completeLogin: (newTokens) => setTokens(newTokens),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}