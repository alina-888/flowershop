import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { api } from '../api'

export default function FlowersPage() {
  const [flowers, setFlowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.getFlowers()
      .then(setFlowers)
      .finally(() => setLoading(false))
  }, [])

  const filtered = flowers.filter(f =>
    f.title.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <div className="section-header">
        <h2>Cvece</h2>
      </div>
      <div style={{ marginBottom: 24 }}>
        <input
          className="form-input"
          style={{ maxWidth: 300 }}
          placeholder="Pretrazi cvece..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      {filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map(f => (
            <ProductCard key={f.id} item={f} type="flower" />
          ))}
        </div>
      ) : (
        <div className="empty"><p>Nema rezultata.</p></div>
      )}
    </div>
  )
}
