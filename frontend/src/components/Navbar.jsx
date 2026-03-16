import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { cart, clearCart } = useCart()

  async function handleLogout() {
    await logout()
    clearCart()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">Cvecara</Link>
        <div className="navbar-links">
          <Link to="/">Katalog</Link>
          {user && <Link to="/reservations">Porudzbine</Link>}
          {user?.is_staff && <Link to="/staff">Panel</Link>}
        </div>
        <div className="navbar-right">
          <Link to="/cart">
            Korpa{cart.length > 0 && <span> ({cart.length})</span>}
          </Link>
          {user ? (
            <>
              <span className="muted small">{user.username}</span>
              <button onClick={handleLogout}>Odjava</button>
            </>
          ) : (
            <>
              <Link to="/login">Prijava</Link>
              <Link to="/register">Registracija</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
