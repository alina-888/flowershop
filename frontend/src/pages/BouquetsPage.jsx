import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { api } from '../api'

export default function BouquetsPage() {
  const [bouquets, setBouquets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.getBouquets()
      .then(setBouquets)
      .finally(() => setLoading(false))
  }, [])

  const filtered = bouquets.filter(b =>
    b.title.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <div className="section-header">
        <h2>Buketi</h2>
      </div>
      <div style={{ marginBottom: 24 }}>
        <input
          className="form-input"
          style={{ maxWidth: 300 }}
          placeholder="Pretrazi bukete..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      {filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map(b => (
            <ProductCard key={b.id} item={b} type="bouquet" />
          ))}
        </div>
      ) : (
        <div className="empty"><p>Nema rezultata.</p></div>
      )}
    </div>
  )
}
