import { useEffect, useState } from "react";
import { ReservationsApi, ReportApi } from "../api/client";
import { useSession, ROLES } from "../context/RoleContext";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const { role, name } = useSession();
  const [reservations, setReservations] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const res = await ReservationsApi.list();
        if (cancelled) return;
        setReservations(res);

        if (role === ROLES.ADMIN) {
          const k = await ReportApi.kpis("last24h");
          if (!cancelled) setKpis(k);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (loading) return <p>Cargando…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  const today = new Date().toISOString().slice(0, 10);
  const arrivalsToday = reservations.filter((r) => r.checkInDate === today);
  const departuresToday = reservations.filter((r) => r.checkOutDate === today);
  const myReservations = reservations.filter((r) => r.guestName === name);

  return (
    <div className="stack">
      <h1>Dashboard</h1>

      {role === ROLES.ADMIN && kpis && (
        <div className="grid-cards">
          <KpiCard label="Reservas (24h)" value={kpis.totalReservations} />
          <KpiCard label="Ocupación activa" value={`${kpis.occupancyRatePercent}%`} />
          <KpiCard label="Tiempo de ciclo prom." value={`${kpis.avgCycleTimeHours} h`} />
          <KpiCard label="Estadías activas" value={kpis.activeStays} />
        </div>
      )}

      {(role === ROLES.RECEPCIONISTA || role === ROLES.ADMIN) && (
        <div className="two-col">
          <ReservationList title="Llegadas de hoy" items={arrivalsToday} />
          <ReservationList title="Salidas de hoy" items={departuresToday} />
        </div>
      )}

      {role === ROLES.HUESPED && (
        <ReservationList title={`Mis reservas (${name})`} items={myReservations} empty="No tienes reservas con ese nombre todavía." />
      )}

      {role === ROLES.AUDITOR && (
        <div className="card">
          <p>Como Auditor, tu vista principal es la pantalla de Auditoría (solo lectura).</p>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="kpi-card">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function ReservationList({ title, items, empty = "Sin registros." }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="muted">{empty}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Huésped</th>
              <th>Unidad</th>
              <th>Fechas</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.guestName}</td>
                <td>{r.unit?.name}</td>
                <td>{r.checkInDate} → {r.checkOutDate}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
