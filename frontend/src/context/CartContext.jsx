import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      api.getCart().then(setCart).catch(() => setCart([]))
    } else {
      setCart([])
    }
  }, [user])

  async function addToCart(item) {
    const updated = await api.addToCart(item)
    setCart(updated)
  }

  async function updateCartItem(key, qty) {
    const updated = await api.updateCartItem(key, qty)
    setCart(updated)
  }

  async function removeFromCart(key) {
    await api.removeCartItem(key)
    setCart(prev => prev.filter(e => e.key !== key))
  }

  async function clearCart() {
    await api.clearCart()
    setCart([])
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
