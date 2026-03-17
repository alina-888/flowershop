import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useNotifications } from '../context/NotificationContext'
import StatusBadge from '../components/StatusBadge'

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const navigate = useNavigate()

  const unread = notifications.filter(n => !n.is_read)

  useEffect(() => {
    api.getMyReservations()
      .then(setReservations)
      .finally(() => setLoading(false))
  }, [])

  async function handleNotifClick(notif) {
    await markRead(notif.id)
    navigate(`/reservations/${notif.reservation_id}`)
  }

  if (loading) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <h1 style={{ fontWeight: 600, marginBottom: 24 }}>Moje porudzbine</h1>

      {unread.length > 0 && (
        <div className="notif-strip">
          <div className="notif-strip-header">
            <span className="fw-semibold small">Obaveštenja</span>
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Označi sve kao pročitano</button>
          </div>
          {unread.map(n => (
            <div key={n.id} className="notif-item" onClick={() => handleNotifClick(n)}>
              <span>{n.message}</span>
              <span className="muted small">{new Date(n.created_at).toLocaleString('sr-Latn')}</span>
            </div>
          ))}
        </div>
      )}

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
