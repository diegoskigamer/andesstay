import { NavLink } from "react-router-dom";
import { useSession, ROLES } from "../context/SessionContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.HUESPED, ROLES.AUDITOR] },
  { to: "/reservations", label: "Reservas", roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.HUESPED] },
  { to: "/catalog", label: "Catálogo", roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA] },
  { to: "/reports", label: "Reportería", roles: [ROLES.ADMIN] },
  { to: "/audit", label: "Auditoría", roles: [ROLES.ADMIN, ROLES.AUDITOR] },
];

export default function NavBar() {
  const { role, name, authMode, setRole, setName, logout } = useSession();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">AS</span>
        <span>AndesStay</span>
      </div>

      <nav className="navbar-links">
        {LINKS.filter((l) => l.roles.includes(role)).map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar-session">
        {authMode === "simulated" ? (
          <div className="msal-session">
            <input
              className="session-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select value={role || ""} onChange={(e) => setRole(e.target.value)}>
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button className="btn-secondary small" onClick={logout}>Cerrar sesión</button>
          </div>
        ) : (
          <div className="msal-session">
            <span className="tag">{role || "Sin rol asignado"}</span>
            <span>{name}</span>
            <button className="btn-secondary small" onClick={logout}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
}