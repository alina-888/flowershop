const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Token ${token}`;
  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

// Handles both paginated {results: [...]} and plain array responses
function extractList(data) {
  return Array.isArray(data) ? data : (data.results ?? data);
}

export const api = {
  getFlowers: () => request('/catalog/flowers/').then(extractList),
  getFlower: (id) => request(`/catalog/flowers/${id}/`),
  getBouquets: () => request('/catalog/bouquets/').then(extractList),
  getBouquet: (id) => request(`/catalog/bouquets/${id}/`),
  login: (body) => request('/auth/login/', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register/', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout/', { method: 'POST' }),
  me: () => request('/auth/me/'),
  getCart: () => request('/cart/'),
  addToCart: (body) => request('/cart/add/', { method: 'POST', body: JSON.stringify(body) }),
  updateCartItem: (id, qty) => request(`/cart/items/${id}/`, { method: 'PATCH', body: JSON.stringify({ qty }) }),
  removeCartItem: (id) => request(`/cart/items/${id}/`, { method: 'DELETE' }),
  clearCart: () => request('/cart/', { method: 'DELETE' }),
  getNotifications: () => request('/reservations/notifications/'),
  markNotificationRead: (id) => request(`/reservations/notifications/${id}/read/`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/reservations/notifications/read-all/', { method: 'POST' }),
  markNotificationsByReservation: (id) => request(`/reservations/notifications/reservation/${id}/read/`, { method: 'POST' }),
  getMyReservations: () => request('/reservations/').then(extractList),
  getReservation: (id) => request(`/reservations/${id}/`),
  createReservation: (body) => request('/reservations/', { method: 'POST', body: JSON.stringify(body) }),
  getStaffReservations: () => request('/reservations/staff/').then(extractList),
  updateReservation: (id, body) => request(`/reservations/${id}/staff-update/`, { method: 'PATCH', body: JSON.stringify(body) }),
  getOptions: () => request('/reservations/options/'),
};
