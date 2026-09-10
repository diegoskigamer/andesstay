import { useEffect, useState } from "react";
import { ReportApi } from "../api/client";

export default function Reports() {
  const [range, setRange] = useState("last24h");
  const [kpis, setKpis] = useState(null);
  const [topUnits, setTopUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([ReportApi.kpis(range), ReportApi.topUnits(range === "last24h" ? "last7d" : range)])
      .then(([k, t]) => {
        if (cancelled) return;
        setKpis(k);
        setTopUnits(t);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [range]);

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Reportería</h1>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="last24h">Últimas 24h</option>
          <option value="last7d">Últimos 7 días</option>
          <option value="last30d">Últimos 30 días</option>
        </select>
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && kpis && (
        <>
          <div className="grid-cards">
            <div className="kpi-card">
              <div className="kpi-value">{kpis.totalReservations}</div>
              <div className="kpi-label">Reservas en el período</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{kpis.occupancyRatePercent}%</div>
              <div className="kpi-label">Ocupación activa ({kpis.occupiedUnits}/{kpis.totalUnits})</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{kpis.avgCycleTimeHours} h</div>
              <div className="kpi-label">Tiempo de ciclo promedio</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{kpis.activeStays}</div>
              <div className="kpi-label">Estadías activas</div>
            </div>
          </div>

          <div className="two-col">
            <div className="card">
              <h3>Reservas por hora</h3>
              {Object.keys(kpis.reservationsByHour).length === 0 ? (
                <p className="muted">Sin datos en el período.</p>
              ) : (
                <table className="table">
                  <thead><tr><th>Hora</th><th>Reservas</th></tr></thead>
                  <tbody>
                    {Object.entries(kpis.reservationsByHour).map(([hour, count]) => (
                      <tr key={hour}><td>{hour}</td><td>{count}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card">
              <h3>Unidades más demandadas</h3>
              {topUnits.length === 0 ? (
                <p className="muted">Sin datos en el período.</p>
              ) : (
                <table className="table">
                  <thead><tr><th>Unidad</th><th>Hostal</th><th>Reservas</th></tr></thead>
                  <tbody>
                    {topUnits.map((u) => (
                      <tr key={u.unitId}>
                        <td>{u.unitName}</td>
                        <td className="muted small">{u.hostelName}</td>
                        <td>{u.reservationsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
