import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function BouquetDetailPage() {
  const { id } = useParams()
  const [bouquet, setBouquet] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    api.getBouquet(id).then(setBouquet)
  }, [id])

  function handleAdd() {
    addToCart({ type: 'bouquet', id: bouquet.id, qty, title: bouquet.title, price: parseFloat(bouquet.price) })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!bouquet) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <span><Link to="/">Katalog</Link></span>
        <span>{bouquet.title}</span>
      </div>
      <div className="row-2">
        <div>
          {bouquet.image
            ? <img src={bouquet.image} alt={bouquet.title} style={{ width: '100%', borderRadius: 8 }} />
            : <div className="product-card-placeholder" style={{ height: 320, borderRadius: 8 }}>nema slike</div>
          }
        </div>
        <div>
          <h1 style={{ fontWeight: 600, marginBottom: 8 }}>{bouquet.title}</h1>
          {bouquet.description && <p className="muted" style={{ marginBottom: 16 }}>{bouquet.description}</p>}
          <p className="price" style={{ fontSize: '1.3rem', marginBottom: 4 }}>{bouquet.price} RSD</p>
          <p className="muted small" style={{ marginBottom: 20 }}>Na stanju: {bouquet.number_in_stock} kom.</p>

          {bouquet.items?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">Cvece u buketu</div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {bouquet.items.map((item, i) => (
                  <li key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <Link to={`/flowers/${item.flower.id}`} style={{ color: 'inherit' }}>{item.flower.title}</Link>
                    <span className="muted small">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user ? (
            <div className="add-form" style={{ marginBottom: 12 }}>
              <input type="number" min="1" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
              <button className="btn btn-accent" onClick={handleAdd}>
                {added ? 'Dodato!' : 'Dodaj u korpu'}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-accent" style={{ display: 'inline-block', marginBottom: 12 }}>
              Prijavi se da narucis
            </Link>
          )}
          <br />
          <Link to="/" className="btn btn-ghost btn-sm">Nazad</Link>
        </div>
      </div>
    </div>
  )
}
