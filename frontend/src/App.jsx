import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import CatalogPage from './pages/CatalogPage'
import BouquetDetailPage from './pages/BouquetDetailPage'
import FlowerDetailPage from './pages/FlowerDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyReservationsPage from './pages/MyReservationsPage'
import ReservationDetailPage from './pages/ReservationDetailPage'
import StaffPanelPage from './pages/StaffPanelPage'

function AppRoutes() {
  const { user } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/bouquets/:id" element={<BouquetDetailPage />} />
        <Route path="/flowers/:id" element={<FlowerDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reservations" element={user ? <MyReservationsPage /> : <Navigate to="/login" />} />
        <Route path="/reservations/:id" element={user ? <ReservationDetailPage /> : <Navigate to="/login" />} />
        <Route path="/staff" element={user?.is_staff ? <StaffPanelPage /> : <Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  )
}
