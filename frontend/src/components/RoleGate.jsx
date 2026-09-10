import { useSession } from "../context/SessionContext";

/**
 * Restringe el acceso a una pantalla según el rol activo.
 * Hoy el rol viene de la sesión simulada (RoleContext) o de los claims
 * reales del JWT en modo MSAL — ambos casos pasan por el mismo
 * SessionContext, así que esta lógica de gate no cambia entre modos.
 */
export default function RoleGate({ allow, children }) {
  const { role } = useSession();

  if (!role) {
    return (
      <div className="card">
        <h2>Sin rol asignado</h2>
        <p>
          Tu cuenta no tiene un rol de aplicación asignado en Azure AD todavía.
          Pídele a un administrador que te asigne uno en Enterprise
          Applications → BarrioDigital → Users and groups.
        </p>
      </div>
    );
  }

  if (!allow.includes(role)) {
    return (
      <div className="card">
        <h2>Acceso restringido</h2>
        <p>
          Tu rol actual (<strong>{role}</strong>) no tiene acceso a esta pantalla.
          Roles permitidos: {allow.join(", ")}.
        </p>
      </div>
    );
  }

  return children;
}