import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyReservations()
      .then(setReservations)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <h1 style={{ fontWeight: 600, marginBottom: 24 }}>Moje porudzbine</h1>
      {reservations.length === 0 ? (
        <div className="empty">
          <p>Nemate jos porudzbina.</p>
          <Link to="/" className="btn btn-accent">Pogledajte ponudu</Link>
        </div>
      ) : (
        <div className="card res-list">
          {reservations.map(res => (
            <Link key={res.id} to={`/reservations/${res.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="res-item">
                <div className="res-item-left">
                  <h4>Porudzbina #{res.id}</h4>
                  <small>{new Date(res.created_at).toLocaleString('sr-Latn')}</small>
                </div>
                <div className="res-item-right">
                  <StatusBadge status={res.status} label={res.status_display} />
                  <span className="price small">{res.total_price} RSD</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
