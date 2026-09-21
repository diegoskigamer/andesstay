import { Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

/**
 * Redirige a /login si no hay sesión activa, tanto en modo simulado
 * (donde ahora también hay una pantalla de login) como en modo Cognito.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}