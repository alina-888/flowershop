import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

export default function ProductCard({ item, type }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const outOfStock = item.number_in_stock === 0

  function handleAdd() {
    if (!user) { navigate('/login'); return }
    addToCart({ type, id: item.id, qty, title: item.title, price: parseFloat(item.price) })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    setQty(1)
  }

  const detailPath = type === 'bouquet' ? `/bouquets/${item.id}` : `/flowers/${item.id}`

  return (
    <div className="card product-card">
      <Link to={detailPath} className="product-card-link">
        {item.image
          ? <img src={item.image} alt={item.title} className="product-card-img" loading="lazy" decoding="async" />
          : <div className="product-card-placeholder">nema slike</div>
        }
        <div className="product-card-body">
          <div className="product-card-title">{item.title}</div>
          {item.description && (
            <div className="product-card-desc">
              {item.description.length > 80 ? item.description.slice(0, 80) + '...' : item.description}
            </div>
          )}
        </div>
      </Link>
      <div className="product-card-body" style={{ paddingTop: 0 }}>
        <div className="product-card-footer">
          <span className="product-card-price">{item.price} RSD</span>
          {outOfStock
            ? <span className="status-badge status-cancelled">Nema na stanju</span>
            : <span className="product-card-stock muted small">{item.number_in_stock} kom.</span>
          }
        </div>
        <div className="qty-add" style={{ marginTop: 8 }}>
          <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={outOfStock}>−</button>
          <span className="qty-value">{qty}</span>
          <button className="qty-btn" onClick={() => setQty(q => q + 1)} disabled={outOfStock}>+</button>
          <button className="btn btn-accent cart-add-btn" onClick={handleAdd} disabled={outOfStock} title="Dodaj u korpu">
            {added ? '✓' : <CartIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}
