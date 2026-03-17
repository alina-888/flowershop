import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../api'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      api.getNotifications().then(setNotifications).catch(() => {})
    } else {
      setNotifications([])
    }
  }, [user])

  const unreadCount = notifications.filter(n => !n.is_read).length

  async function markRead(id) {
    await api.markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllRead() {
    await api.markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function markReadByReservation(reservationId) {
    await api.markNotificationsByReservation(reservationId)
    setNotifications(prev =>
      prev.map(n => n.reservation_id === reservationId ? { ...n, is_read: true } : n)
    )
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, markReadByReservation }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
