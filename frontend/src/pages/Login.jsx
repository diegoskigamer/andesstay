import { useSession } from "../context/SessionContext";

export default function Login() {
  const { login, inProgress } = useSession();

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="brand-mark" style={{ margin: "0 auto 1rem" }}>AS</div>
        <h1>AndesStay</h1>
        <p className="muted">Acceso corporativo para hostales, cabañas y lodges.</p>
        <button className="btn-primary" onClick={login} disabled={inProgress}>
          {inProgress ? "Redirigiendo…" : "Iniciar sesión con Microsoft"}
        </button>
      </div>
    </div>
  );
}