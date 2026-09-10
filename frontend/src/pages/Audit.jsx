import { useEffect, useState } from "react";
import { AuditApi } from "../api/client";

export default function Audit() {
  const [events, setEvents] = useState([]);
  const [actorFilter, setActorFilter] = useState("");
  const [reservationFilter, setReservationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = reservationFilter
        ? await AuditApi.timeline(reservationFilter)
        : await AuditApi.all(actorFilter);
      setEvents(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [actorFilter, reservationFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Auditoría</h1>
        <div className="page-actions">
          <input
            placeholder="Filtrar por usuario"
            value={actorFilter}
            onChange={(e) => { setActorFilter(e.target.value); setReservationFilter(""); }}
          />
          <input
            placeholder="Filtrar por N° de reserva"
            value={reservationFilter}
            onChange={(e) => { setReservationFilter(e.target.value); setActorFilter(""); }}
          />
        </div>
      </div>

      <p className="muted">Solo lectura — trazabilidad de eventos de hospedaje.</p>

      {loading && <p>Cargando…</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha/hora</th>
                <th>Reserva</th>
                <th>Evento</th>
                <th>Usuario</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>{new Date(ev.timestamp).toLocaleString("es-CL")}</td>
                  <td>#{ev.reservationId}</td>
                  <td>{ev.eventType}</td>
                  <td>{ev.actor}</td>
                  <td className="muted small">{ev.details}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={5} className="muted" style={{ textAlign: "center" }}>Sin eventos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
