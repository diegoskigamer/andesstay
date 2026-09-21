// Cliente API centralizado.
//
// En modo simulado (VITE_AUTH_MODE != "cognito") pega directo al backend
// sin header de autorización. En modo Cognito, adjunta automáticamente
// `Authorization: Bearer <id_token>` (el id_token de Cognito trae los
// datos del usuario federado desde Azure AD, incluido el rol).

import { AUTH_MODE } from "../auth/cognitoConfig";
import { getStoredTokens } from "../auth/cognitoTokenStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (AUTH_MODE === "cognito") {
    const tokens = getStoredTokens();
    if (tokens?.idToken) headers.Authorization = `Bearer ${tokens.idToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // respuesta sin body JSON
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---- Reservas ----
export const ReservationsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/api/reservations${qs ? `?${qs}` : ""}`);
  },
  get: (id) => request(`/api/reservations/${id}`),
  create: (payload) =>
    request("/api/reservations", { method: "POST", body: JSON.stringify(payload) }),
  updateStatus: (id, payload) =>
    request(`/api/reservations/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

// ---- Catálogo ----
export const CatalogApi = {
  listUnits: () => request("/api/catalog/units"),
  getUnit: (id) => request(`/api/catalog/units/${id}`),
  createUnit: (payload) =>
    request("/api/catalog/units", { method: "POST", body: JSON.stringify(payload) }),
  updateUnit: (id, payload) =>
    request(`/api/catalog/units/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
};

// ---- Auditoría ----
export const AuditApi = {
  all: (actor) => request(`/api/audit${actor ? `?actor=${encodeURIComponent(actor)}` : ""}`),
  timeline: (reservationId) => request(`/api/audit/reservations/${reservationId}`),
};

// ---- Reportería ----
export const ReportApi = {
  kpis: (range = "last24h") => request(`/api/report/kpis?range=${range}`),
  topUnits: (range = "last7d") => request(`/api/report/top-units?range=${range}`),
};