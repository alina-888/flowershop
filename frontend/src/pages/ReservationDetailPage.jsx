import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'

export default function ReservationDetailPage() {
  const { id } = useParams()
  const [res, setRes] = useState(null)

  useEffect(() => {
    api.getReservation(id).then(setRes)
  }, [id])

  if (!res) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <span><Link to="/reservations">Moje porudzbine</Link></span>
        <span>Porudzbina #{res.id}</span>
      </div>
      <div className="row-2">
        <div className="card">
          <div className="card-header">Stavke</div>
          <table className="table">
            <thead>
              <tr><th>Naziv</th><th style={{ textAlign: 'center' }}>Kol.</th><th style={{ textAlign: 'right' }}>Ukupno</th></tr>
            </thead>
            <tbody>
              {res.items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.subtotal} RSD</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" style={{ textAlign: 'right' }}>Ukupno:</td>
                <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{res.total_price} RSD</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">Detalji</div>
          <div style={{ padding: '0' }}>
            {[
              ['Status', <StatusBadge key="s" status={res.status} label={res.status_display} />],
              ['Datum', new Date(res.created_at).toLocaleString('sr-Latn')],
              res.wrapping_color && ['Pakovanje', res.wrapping_color_display],
              ['Cestitka', res.greeting_card ? 'Da' : 'Ne'],
              res.message && ['Poruka', <em key="m">{res.message}</em>],
              res.estimated_ready && ['Ocekivano', new Date(res.estimated_ready).toLocaleString('sr-Latn')],
            ].filter(Boolean).map(([label, value], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                <span className="muted small">{label}</span>
                <span className="small">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <Link to="/reservations" className="btn btn-ghost btn-sm">Nazad</Link>
      </div>
    </div>
  )
}
