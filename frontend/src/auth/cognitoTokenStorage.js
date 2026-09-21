// Guarda los tokens que nos devuelve nuestro propio backend (después de
// cambiar el "code" de Cognito). Se guardan en sessionStorage: se borran
// solos al cerrar la pestaña, más seguro que localStorage para tokens.
const KEY = "andesstay.cognitoTokens";

export function getStoredTokens() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens) {
  sessionStorage.setItem(KEY, JSON.stringify(tokens));
}

export function clearStoredTokens() {
  sessionStorage.removeItem(KEY);
}