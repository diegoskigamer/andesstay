const STATUS_STYLES = {
  CREADA: { bg: "#eef2ff", fg: "#4338ca" },
  CONFIRMADA: { bg: "#ecfdf5", fg: "#047857" },
  CHECKIN_PENDIENTE: { bg: "#fffbeb", fg: "#b45309" },
  EN_ESTADIA: { bg: "#eff6ff", fg: "#1d4ed8" },
  CHECKOUT: { bg: "#f3f4f6", fg: "#374151" },
  CANCELADA: { bg: "#fef2f2", fg: "#b91c1c" },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { bg: "#f3f4f6", fg: "#374151" };
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
