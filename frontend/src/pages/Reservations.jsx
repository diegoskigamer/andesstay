import { useEffect, useState } from "react";
import { ReservationsApi, CatalogApi } from "../api/client";
import { useSession, ROLES } from "../context/RoleContext";
import StatusBadge from "../components/StatusBadge";

const NEXT_STATUS = {
  CREADA: ["CONFIRMADA", "CANCELADA"],
  CONFIRMADA: ["CHECKIN_PENDIENTE", "CANCELADA"],
  CHECKIN_PENDIENTE: ["EN_ESTADIA", "CANCELADA"],
  EN_ESTADIA: ["CHECKOUT"],
  CHECKOUT: [],
  CANCELADA: [],
};

export default function Reservations() {
  const { role, name } = useSession();
  const [reservations, setReservations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const canCreate = role === ROLES.HUESPED || role === ROLES.RECEPCIONISTA || role === ROLES.ADMIN;
  const canChangeStatus = role === ROLES.RECEPCIONISTA || role === ROLES.ADMIN;

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [res, u] = await Promise.all([
        ReservationsApi.list(statusFilter ? { status: statusFilter } : {}),
        CatalogApi.listUnits(),
      ]);
      setReservations(res);
      setUnits(u);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleStatusChange(reservationId, status) {
    try {
      await ReservationsApi.updateStatus(reservationId, { status, actor: name });
      await loadAll();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Reservas</h1>
        <div className="page-actions">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.keys(NEXT_STATUS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {canCreate && (
            <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cancelar" : "+ Nueva reserva"}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <NewReservationForm
          units={units}
          defaultGuestName={role === ROLES.HUESPED ? name : ""}
          createdBy={name}
          onCreated={() => {
            setShowForm(false);
            loadAll();
          }}
        />
      )}

      {loading && <p>Cargando…</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Huésped</th>
                <th>Unidad</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Estado</th>
                {canChangeStatus && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.guestName}</td>
                  <td>{r.unit?.name}<br /><span className="muted small">{r.unit?.hostelName}</span></td>
                  <td>{r.checkInDate}</td>
                  <td>{r.checkOutDate}</td>
                  <td><StatusBadge status={r.status} /></td>
                  {canChangeStatus && (
                    <td>
                      <div className="action-buttons">
                        {NEXT_STATUS[r.status]?.map((next) => (
                          <button
                            key={next}
                            className="btn-secondary small"
                            onClick={() => handleStatusChange(r.id, next)}
                          >
                            → {next.replaceAll("_", " ")}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted" style={{ textAlign: "center" }}>
                    No hay reservas con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewReservationForm({ units, defaultGuestName, createdBy, onCreated }) {
  const [form, setForm] = useState({
    unitId: units[0]?.id ?? "",
    guestName: defaultGuestName,
    guestEmail: "",
    checkInDate: "",
    checkOutDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await ReservationsApi.create({
        ...form,
        unitId: Number(form.unitId),
        createdBy,
      });
      onCreated();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h3>Nueva reserva</h3>

      <label>
        Unidad
        <select value={form.unitId} onChange={(e) => update("unitId", e.target.value)} required>
          {units.map((u) => (
            <option key={u.id} value={u.id} disabled={u.availableCount === 0}>
              {u.name} — {u.hostelName} ({u.availableCount}/{u.totalCount} disp.)
            </option>
          ))}
        </select>
      </label>

      <label>
        Nombre del huésped
        <input
          value={form.guestName}
          onChange={(e) => update("guestName", e.target.value)}
          required
        />
      </label>

      <label>
        Email del huésped
        <input
          type="email"
          value={form.guestEmail}
          onChange={(e) => update("guestEmail", e.target.value)}
          required
        />
      </label>

      <label>
        Check-in
        <input
          type="date"
          value={form.checkInDate}
          onChange={(e) => update("checkInDate", e.target.value)}
          required
        />
      </label>

      <label>
        Check-out
        <input
          type="date"
          value={form.checkOutDate}
          onChange={(e) => update("checkOutDate", e.target.value)}
          required
        />
      </label>

      {formError && <p className="error">{formError}</p>}

      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Creando…" : "Crear reserva"}
      </button>
    </form>
  );
}
