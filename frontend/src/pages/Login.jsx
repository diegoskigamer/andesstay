import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { buildAzureLogoutUrl } from "../auth/cognitoConfig";

export default function Login() {
  const { login } = useSession();
  const [searchParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  // Si venimos de un logout, primero cerramos también la sesión en Azure AD
  // (si no, el próximo login sería automático con la misma cuenta, sin
  // preguntar credenciales, por el SSO del navegador con Microsoft).
  useEffect(() => {
    if (searchParams.get("fromLogout") === "1") {
      window.location.href = buildAzureLogoutUrl();
    }
  }, [searchParams]);

  function handleLogin() {
    setRedirecting(true);
    login();
  }

  if (searchParams.get("fromLogout") === "1") {
    return (
      <div className="login-page">
        <div className="card login-card">
          <p>Cerrando sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="brand-mark" style={{ margin: "0 auto 1rem" }}>AS</div>
        <h1>AndesStay</h1>
        <p className="muted">Acceso corporativo para hostales, cabañas y lodges.</p>
        <button className="btn-primary" onClick={handleLogin} disabled={redirecting}>
          {redirecting ? "Redirigiendo…" : "Iniciar sesión con Microsoft"}
        </button>
      </div>
    </div>
  );
}