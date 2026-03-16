import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { user } = useAuth()
  const { cart, updateCartItem, removeFromCart } = useCart()
  const total = cart.reduce((sum, e) => sum + e.price * e.qty, 0)

  if (cart.length === 0) {
    return (
      <div className="page">
        <h1 style={{ fontWeight: 600, marginBottom: 24 }}>Korpa</h1>
        <div className="empty">
          <p>Vasa korpa je prazna.</p>
          <Link to="/" className="btn btn-accent">Pogledajte ponudu</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 style={{ fontWeight: 600, marginBottom: 24 }}>Korpa</h1>
      <div className="card" style={{ marginBottom: 24 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Artikal</th>
              <th style={{ textAlign: 'center', width: 160 }}>Kolicina</th>
              <th style={{ textAlign: 'right' }}>Cena</th>
              <th style={{ textAlign: 'right' }}>Ukupno</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.key}>
                <td>
                  <Link to={item.type === 'bouquet' ? `/bouquets/${item.id}` : `/flowers/${item.id}`}
                        style={{ fontWeight: 600 }}>
                    {item.title}
                  </Link>
                  <span className="muted small" style={{ marginLeft: 6 }}>({item.type === 'bouquet' ? 'buket' : 'cvet'})</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <input
                      type="number" min="0" value={item.qty}
                      onChange={e => updateCartItem(item.key, parseInt(e.target.value) || 0)}
                      style={{ width: 56, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center', fontSize: '.85rem' }}
                    />
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>{item.price} RSD</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{(item.price * item.qty).toFixed(2)} RSD</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.key)}>Ukloni</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: 'right' }}>Ukupno:</td>
              <td style={{ textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{total.toFixed(2)} RSD</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/" className="btn btn-ghost">Nastavi kupovinu</Link>
        {user
          ? <Link to="/checkout" className="btn btn-accent">Narucite</Link>
          : <Link to="/login" className="btn btn-accent">Prijavi se da narucis</Link>
        }
      </div>
    </div>
  )
}
