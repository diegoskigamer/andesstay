import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { cognitoConfig } from "../auth/cognitoConfig";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Ruta /callback — acá es donde Cognito redirige después de que el
 * usuario se loguea (vía Azure AD). Tomamos el "code" de la URL, se lo
 * mandamos a nuestro backend (que tiene el client secret) y guardamos
 * los tokens que nos devuelve.
 *
 * NOTA: React StrictMode ejecuta los useEffect dos veces en desarrollo.
 * Como el "code" de Cognito solo se puede canjear UNA vez, usamos un ref
 * para asegurarnos de que el intercambio solo se dispare una sola vez de
 * verdad, aunque el efecto se monte dos veces.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useSession();
  const [error, setError] = useState(null);
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Cognito devolvió un error: ${errorParam}`);
      return;
    }

    if (!code) {
      setError("No llegó ningún código de autorización en la URL.");
      return;
    }

    fetch(`${BASE_URL}/api/auth/cognito/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri: cognitoConfig.redirectUri }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Error ${res.status} al validar el login`);
        }
        return res.json();
      })
      .then((data) => {
        completeLogin({
          idToken: data.idToken,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        navigate("/dashboard", { replace: true });
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="login-page">
      <div className="card login-card">
        {error ? (
          <>
            <h2>No se pudo iniciar sesión</h2>
            <p className="error">{error}</p>
            <button className="btn-primary" onClick={() => navigate("/login")}>Volver a intentar</button>
          </>
        ) : (
          <p>Completando inicio de sesión…</p>
        )}
      </div>
    </div>
  );
}