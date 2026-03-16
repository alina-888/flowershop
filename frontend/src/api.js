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
  getMyReservations: () => request('/reservations/').then(extractList),
  getReservation: (id) => request(`/reservations/${id}/`),
  createReservation: (body) => request('/reservations/', { method: 'POST', body: JSON.stringify(body) }),
  getStaffReservations: () => request('/reservations/staff/').then(extractList),
  updateReservation: (id, body) => request(`/reservations/${id}/staff-update/`, { method: 'PATCH', body: JSON.stringify(body) }),
  getOptions: () => request('/reservations/options/'),
};
