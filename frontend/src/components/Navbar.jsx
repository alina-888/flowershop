import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNotifications } from '../context/NotificationContext'

const activeLinkStyle = {
  color: 'var(--accent)',
  fontWeight: 600,
  textDecoration: 'underline',
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const { unreadCount } = useNotifications()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">Cvecara</Link>
        <div className="navbar-links">
          <NavLink to="/" end style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Katalog</NavLink>
          <NavLink to="/bouquets" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Buketi</NavLink>
          <NavLink to="/flowers" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Cvece</NavLink>
          {user && (
            <NavLink to="/reservations" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
              Porudzbine{unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </NavLink>
          )}
          {user?.is_staff && <NavLink to="/staff" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Panel</NavLink>}
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
