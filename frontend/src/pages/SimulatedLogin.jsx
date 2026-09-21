import { useState } from "react";
import { useSession, ROLES } from "../context/SessionContext";

/**
 * Pantalla de login para el modo simulado (sin Cognito/Azure AD real
 * todavía). Se comporta igual que el login real: pide entrar antes de
 * ver la app, y desde ahí eliges con qué usuario/rol quieres probar.
 */
export default function SimulatedLogin() {
  const { login, name: currentName, role: currentRole } = useSession();
  const [name, setName] = useState(currentName || "Ana Admin");
  const [role, setRole] = useState(currentRole || ROLES.ADMIN);

  function handleSubmit(e) {
    e.preventDefault();
    login(name, role);
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <div className="brand-mark" style={{ margin: "0 auto 1rem" }}>AS</div>
        <h1>AndesStay</h1>
        <p className="muted">Modo simulado — elige con qué usuario quieres entrar.</p>

        <label style={{ textAlign: "left", marginTop: "1rem" }}>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label style={{ textAlign: "left", marginTop: "0.75rem" }}>
          Rol
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <button className="btn-primary" type="submit">Entrar</button>
      </form>
    </div>
  );
}