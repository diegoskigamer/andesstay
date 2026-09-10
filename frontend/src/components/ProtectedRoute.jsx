import { Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

/**
 * En modo simulado, isAuthenticated siempre es true, así que esto no hace
 * nada (no rompe el flujo actual). En modo MSAL real, redirige a /login
 * si no hay sesión activa.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authMode } = useSession();

  if (authMode === "msal" && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}