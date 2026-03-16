import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { api } from '../api'

export default function CatalogPage() {
  const [bouquets, setBouquets] = useState([])
  const [flowers, setFlowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    Promise.all([api.getBouquets(), api.getFlowers()])
      .then(([b, f]) => { setBouquets(b); setFlowers(f) })
      .finally(() => setLoading(false))
  }, [])

  const filteredBouquets = bouquets.filter(b =>
    b.title.toLowerCase().includes(filter.toLowerCase())
  )
  const filteredFlowers = flowers.filter(f =>
    f.title.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) return <div className="page"><p className="muted">Ucitavanje...</p></div>

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <input
          className="form-input"
          style={{ maxWidth: 300 }}
          placeholder="Pretrazi katalog..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {filteredBouquets.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div className="section-header">
            <h2>Buketi</h2>
          </div>
          <div className="grid-3">
            {filteredBouquets.map(b => (
              <ProductCard key={b.id} item={b} type="bouquet" />
            ))}
          </div>
        </section>
      )}

      {filteredFlowers.length > 0 && (
        <section>
          <div className="section-header">
            <h2>Cvece</h2>
          </div>
          <div className="grid-3">
            {filteredFlowers.map(f => (
              <ProductCard key={f.id} item={f} type="flower" />
            ))}
          </div>
        </section>
      )}

      {filteredBouquets.length === 0 && filteredFlowers.length === 0 && (
        <div className="empty"><p>Nema rezultata.</p></div>
      )}
    </div>
  )
}
