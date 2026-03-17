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

export default function FlowerDetailPage() {
  const { id } = useParams()
  const [flower, setFlower] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    api.getFlower(id).then(setFlower)
  }, [id])

  function handleAdd() {
    if (!user) { navigate('/login'); return }
    addToCart({ type: 'flower', id: flower.id, qty, title: flower.title, price: parseFloat(flower.price) })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!flower) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  const outOfStock = flower.number_in_stock === 0

  return (
    <div className="page">
      <div className="breadcrumb">
        <span><Link to="/">Katalog</Link></span>
        <span>{flower.title}</span>
      </div>
      <div className="row-2">
        <div>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 12, display: 'inline-block' }}>← Nazad</Link>
          {flower.image
            ? <img src={flower.image} alt={flower.title} style={{ width: '100%', borderRadius: 8 }} decoding="async" />
            : <div className="product-card-placeholder" style={{ height: 320, borderRadius: 8 }}>nema slike</div>
          }
        </div>
        <div>
          <h1 style={{ fontWeight: 600, marginBottom: 8 }}>{flower.title}</h1>
          {flower.description && <p className="muted" style={{ marginBottom: 16 }}>{flower.description}</p>}
          <p className="price" style={{ fontSize: '1.3rem', marginBottom: 4 }}>{flower.price} RSD</p>
          {outOfStock
            ? <p style={{ marginBottom: 20 }}><span className="status-badge status-cancelled">Nema na stanju</span></p>
            : <p className="muted small" style={{ marginBottom: 20 }}>Na stanju: {flower.number_in_stock} kom.</p>
          }

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
