import { useEffect, useState } from "react";
import { CatalogApi } from "../api/client";
import { useSession, ROLES } from "../context/RoleContext";

export default function Catalog() {
  const { role } = useSession();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const canEdit = role === ROLES.ADMIN;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUnits(await CatalogApi.listUnits());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Catálogo de unidades</h1>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancelar" : "+ Nueva unidad"}
          </button>
        )}
      </div>

      {showForm && (
        <NewUnitForm onCreated={() => { setShowForm(false); load(); }} />
      )}

      {loading && <p>Cargando…</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid-cards wide">
          {units.map((u) => (
            <UnitCard
              key={u.id}
              unit={u}
              editable={canEdit}
              editing={editingId === u.id}
              onEdit={() => setEditingId(u.id)}
              onCancelEdit={() => setEditingId(null)}
              onSaved={() => { setEditingId(null); load(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UnitCard({ unit, editable, editing, onEdit, onCancelEdit, onSaved }) {
  const [rate, setRate] = useState(unit.nightlyRate);
  const [total, setTotal] = useState(unit.totalCount);
  const [available, setAvailable] = useState(unit.availableCount);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      await CatalogApi.updateUnit(unit.id, {
        nightlyRate: Number(rate),
        totalCount: Number(total),
        availableCount: Number(available),
      });
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="unit-card-header">
        <h3>{unit.name}</h3>
        <span className="tag">{unit.type}</span>
      </div>
      <p className="muted">{unit.hostelName} · capacidad {unit.capacity}</p>

      {!editing ? (
        <>
          <p><strong>${Number(unit.nightlyRate).toLocaleString("es-CL")}</strong> / noche</p>
          <p>Disponibilidad: {unit.availableCount} / {unit.totalCount}</p>
          {editable && <button className="btn-secondary small" onClick={onEdit}>Editar tarifa/disponibilidad</button>}
        </>
      ) : (
        <div className="stack small-gap">
          <label>Tarifa/noche
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
          </label>
          <label>Total unidades
            <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
          </label>
          <label>Disponibles
            <input type="number" value={available} onChange={(e) => setAvailable(e.target.value)} />
          </label>
          {err && <p className="error">{err}</p>}
          <div className="action-buttons">
            <button className="btn-primary small" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button className="btn-secondary small" onClick={onCancelEdit}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewUnitForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "", type: "HABITACION", hostelName: "", capacity: 2, totalCount: 1, nightlyRate: 30000,
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
      await CatalogApi.createUnit({
        ...form,
        capacity: Number(form.capacity),
        totalCount: Number(form.totalCount),
        nightlyRate: Number(form.nightlyRate),
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
      <h3>Nueva unidad</h3>

      <label>Nombre
        <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
      </label>

      <label>Tipo
        <select value={form.type} onChange={(e) => update("type", e.target.value)}>
          <option value="HABITACION">Habitación</option>
          <option value="CABANA">Cabaña</option>
          <option value="LODGE">Lodge</option>
        </select>
      </label>

      <label>Hostal / propiedad
        <input value={form.hostelName} onChange={(e) => update("hostelName", e.target.value)} required />
      </label>

      <label>Capacidad
        <input type="number" min="1" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} required />
      </label>

      <label>Cantidad total
        <input type="number" min="0" value={form.totalCount} onChange={(e) => update("totalCount", e.target.value)} required />
      </label>

      <label>Tarifa por noche (CLP)
        <input type="number" min="1" value={form.nightlyRate} onChange={(e) => update("nightlyRate", e.target.value)} required />
      </label>

      {formError && <p className="error">{formError}</p>}

      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Creando…" : "Crear unidad"}
      </button>
    </form>
  );
}
