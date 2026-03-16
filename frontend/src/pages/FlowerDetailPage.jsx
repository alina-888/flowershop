import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function FlowerDetailPage() {
  const { id } = useParams()
  const [flower, setFlower] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    api.getFlower(id).then(setFlower)
  }, [id])

  function handleAdd() {
    addToCart({ type: 'flower', id: flower.id, qty, title: flower.title, price: parseFloat(flower.price) })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!flower) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <span><Link to="/">Katalog</Link></span>
        <span>{flower.title}</span>
      </div>
      <div className="row-2">
        <div>
          {flower.image
            ? <img src={flower.image} alt={flower.title} style={{ width: '100%', borderRadius: 8 }} />
            : <div className="product-card-placeholder" style={{ height: 320, borderRadius: 8 }}>nema slike</div>
          }
        </div>
        <div>
          <h1 style={{ fontWeight: 600, marginBottom: 8 }}>{flower.title}</h1>
          <p className="muted" style={{ marginBottom: 16 }}>{flower.description}</p>
          <p className="price" style={{ fontSize: '1.3rem', marginBottom: 4 }}>{flower.price} RSD</p>
          <p className="muted small" style={{ marginBottom: 20 }}>Na stanju: {flower.number_in_stock} kom.</p>

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
