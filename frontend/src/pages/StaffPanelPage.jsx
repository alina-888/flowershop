import { useState, useEffect } from 'react'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'

const STATUS_CHOICES = [
  ['pending', 'Pending'], ['read', 'Read'], ['in_progress', 'In Progress'],
  ['ready', 'Ready for Pickup'], ['completed', 'Completed'], ['cancelled', 'Cancelled']
]

function StaffReservationItem({ res, onUpdated }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(res.status)
  const [estimatedReady, setEstimatedReady] = useState(res.estimated_ready ? res.estimated_ready.slice(0, 16) : '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await api.updateReservation(res.id, { status, estimated_ready: estimatedReady || null })
      onUpdated(updated)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={() => setOpen(o => !o)}>
        <div className="accordion-header-left">
          <span className="fw-semibold">#{res.id}</span>
          <span className="muted small">{res.customer_username}</span>
          <span className="muted small">{new Date(res.created_at).toLocaleString('sr-Latn')}</span>
        </div>
        <StatusBadge status={res.status} label={res.status_display} />
      </div>
      {open && (
        <div className="accordion-body">
          <div className="row-2">
            <div>
              <table className="table">
                <thead><tr><th>Naziv</th><th>Kol.</th><th style={{ textAlign: 'right' }}>Ukupno</th></tr></thead>
                <tbody>
                  {res.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{item.subtotal} RSD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="small" style={{ marginTop: 8 }}>
                <span className="muted">Ukupno: </span>
                <span className="price">{res.total_price} RSD</span>
              </p>
              {res.greeting_card && <p className="small muted">Cestitka{res.message && `: "${res.message}"`}</p>}
              {res.wrapping_color && <p className="small muted">Pakovanje: {res.wrapping_color_display}</p>}
            </div>
            <div>
              <p className="fw-semibold small" style={{ marginBottom: 10 }}>Azuriraj status</p>
              <div className="form-group">
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUS_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ocekivano vreme preuzimanja</label>
                <input type="datetime-local" className="form-input" value={estimatedReady}
                       onChange={e => setEstimatedReady(e.target.value)} />
              </div>
              <button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Cuvanje...' : 'Sacuvaj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StaffPanelPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getStaffReservations().then(setReservations).finally(() => setLoading(false))
  }, [])

  function handleUpdated(updated) {
    setReservations(prev => prev.map(r => r.id === updated.id ? { ...updated, customer_username: r.customer_username } : r))
  }

  if (loading) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <h1 style={{ fontWeight: 600, marginBottom: 24 }}>Sve porudzbine</h1>
      {reservations.length === 0
        ? <div className="empty"><p>Nema porudzbina.</p></div>
        : reservations.map(res => (
            <StaffReservationItem key={res.id} res={res} onUpdated={handleUpdated} />
          ))
      }
    </div>
  )
}
