import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function ProductCard({ item, type }) {
  const [qty, setQty] = useState(1)
  const { user } = useAuth()
  const { addToCart } = useCart()

  function handleAdd() {
    addToCart({ type, id: item.id, qty, title: item.title, price: parseFloat(item.price) })
    setQty(1)
  }

  const detailPath = type === 'bouquet' ? `/bouquets/${item.id}` : `/flowers/${item.id}`

  return (
    <div className="card product-card">
      {item.image
        ? <img src={item.image} alt={item.title} className="product-card-img" />
        : <div className="product-card-placeholder">nema slike</div>
      }
      <div className="product-card-body">
        <div className="product-card-title">{item.title}</div>
        {item.description && (
          <div className="product-card-desc">
            {item.description.length > 80 ? item.description.slice(0, 80) + '...' : item.description}
          </div>
        )}
        <div className="product-card-footer">
          <span className="product-card-price">{item.price} RSD</span>
          <span className="product-card-stock muted small">{item.number_in_stock} kom.</span>
        </div>
        <Link to={detailPath} className="btn btn-outline btn-sm" style={{ marginTop: 8, display: 'block', textAlign: 'center' }}>
          Detalji
        </Link>
        {user ? (
          <div className="add-form">
            <input
              type="number" min="1" value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button className="btn btn-accent btn-sm" onClick={handleAdd}>Dodaj u korpu</button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-accent btn-sm" style={{ marginTop: 8, display: 'block', textAlign: 'center' }}>
            Prijavi se da narucis
          </Link>
        )}
      </div>
    </div>
  )
}
