import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  function addToCart(item) {
    const key = crypto.randomUUID()
    setCart(prev => [...prev, { key, ...item }])
  }

  function updateCartItem(key, qty) {
    if (qty <= 0) {
      setCart(prev => prev.filter(e => e.key !== key))
    } else {
      setCart(prev => prev.map(e => e.key === key ? { ...e, qty } : e))
    }
  }

  function removeFromCart(key) {
    setCart(prev => prev.filter(e => e.key !== key))
  }

  function clearCart() {
    setCart([])
    localStorage.removeItem('cart')
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
