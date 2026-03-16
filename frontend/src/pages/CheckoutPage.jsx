import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'

const WRAPPING_COLORS = [
  ['', 'Bez pakovanja'], ['white', 'White'], ['pink', 'Pink'], ['red', 'Red'],
  ['yellow', 'Yellow'], ['green', 'Green'], ['purple', 'Purple'], ['blue', 'Blue']
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const [form, setForm] = useState({ greeting_card: false, message: '', wrapping_color: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.createReservation({
        ...form,
        items: cart.map(e => ({ type: e.type, id: e.id, qty: e.qty })),
      })
      clearCart()
      navigate('/reservations')
    } catch (err) {
      setError(err.items?.[0] || err.error || 'Doslo je do greske.')
    } finally {
      setLoading(false)
    }
  }

  const total = cart.reduce((sum, e) => sum + e.price * e.qty, 0)

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <h1 style={{ fontWeight: 600, marginBottom: 24 }}>Porudzbina</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">Pregled korpe</div>
        <table className="table">
          <tbody>
            {cart.map(item => (
              <tr key={item.key}>
                <td>{item.title} <span className="muted small">({item.type === 'bouquet' ? 'buket' : 'cvet'})</span></td>
                <td style={{ textAlign: 'center' }}>x{item.qty}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{(item.price * item.qty).toFixed(2)} RSD</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" style={{ textAlign: 'right' }}>Ukupno:</td>
              <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{total.toFixed(2)} RSD</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="card">
        <div className="card-header">Detalji porudzbine</div>
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Boja papira za pakovanje</label>
              <select name="wrapping_color" className="form-select" value={form.wrapping_color} onChange={handleChange}>
                {WRAPPING_COLORS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-check">
                <input type="checkbox" name="greeting_card" checked={form.greeting_card} onChange={handleChange} />
                Dodaj cestitku
              </label>
            </div>
            <div className="form-group">
              <label className="form-label">Poruka na cestitki</label>
              <textarea name="message" className="form-textarea" value={form.message} onChange={handleChange} placeholder="Unesite poruku..." />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/cart')}>Nazad</button>
              <button type="submit" className="btn btn-accent" disabled={loading}>
                {loading ? 'Slanje...' : 'Potvrdi porudzbinu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
