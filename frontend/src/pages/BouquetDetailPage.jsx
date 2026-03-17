import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function CartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

export default function BouquetDetailPage() {
  const { id } = useParams()
  const [bouquet, setBouquet] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    api.getBouquet(id).then(setBouquet)
  }, [id])

  function handleAdd() {
    if (!user) { navigate('/login'); return }
    addToCart({ type: 'bouquet', id: bouquet.id, qty, title: bouquet.title, price: parseFloat(bouquet.price) })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!bouquet) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  const outOfStock = bouquet.number_in_stock === 0

  return (
    <div className="page">
      <div className="breadcrumb">
        <span><Link to="/">Katalog</Link></span>
        <span>{bouquet.title}</span>
      </div>
      <div className="row-2">
        <div>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 12, display: 'inline-block' }}>← Nazad</Link>
          {bouquet.image
            ? <img src={bouquet.image} alt={bouquet.title} style={{ width: '100%', borderRadius: 8 }} decoding="async" />
            : <div className="product-card-placeholder" style={{ height: 320, borderRadius: 8 }}>nema slike</div>
          }
        </div>
        <div>
          <h1 style={{ fontWeight: 600, marginBottom: 8 }}>{bouquet.title}</h1>
          {bouquet.description && <p className="muted" style={{ marginBottom: 16 }}>{bouquet.description}</p>}
          <p className="price" style={{ fontSize: '1.3rem', marginBottom: 4 }}>{bouquet.price} RSD</p>
          {outOfStock
            ? <p style={{ marginBottom: 20 }}><span className="status-badge status-cancelled">Nema na stanju</span></p>
            : <p className="muted small" style={{ marginBottom: 20 }}>Na stanju: {bouquet.number_in_stock} kom.</p>
          }

          {bouquet.items?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">Cvece u buketu</div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {bouquet.items.map((item, i) => (
                  <li key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <Link to={`/flowers/${item.flower.id}`}>{item.flower.title}</Link>
                    <span className="muted small">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="qty-add">
            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={outOfStock}>−</button>
            <span className="qty-value">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(q => q + 1)} disabled={outOfStock}>+</button>
            <button className="btn btn-accent cart-add-btn" onClick={handleAdd} disabled={outOfStock} title="Dodaj u korpu">
              {added ? '✓' : <CartIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
