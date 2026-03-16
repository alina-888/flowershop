// Props: status (value), label (value)
export default function StatusBadge({ status, label }) {
  return (
    <span className={`status-badge status-${status}`}>{label}</span>
  )
}
