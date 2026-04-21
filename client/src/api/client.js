const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuth() {
  const raw = localStorage.getItem('skylink_auth');
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const auth = getAuth();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.');
  }

  return data;
}

function qs(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  return search.toString();
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getReferenceData: () => request('/meta/reference-data'),
  getFlights: (params) => request(`/flights${qs(params) ? `?${qs(params)}` : ''}`),
  searchFlights: (params) => request(`/flights/search${qs(params) ? `?${qs(params)}` : ''}`),
  getFlightSeats: (flightId) => request(`/flights/${flightId}/seats`),
  createFlight: (payload) => request('/flights', { method: 'POST', body: JSON.stringify(payload) }),
  updateFlight: (id, payload) => request(`/flights/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteFlight: (id) => request(`/flights/${id}`, { method: 'DELETE' }),
  updateFlightStatus: (id, status) => request(`/flights/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  updateBooking: (id, payload) => request(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  cancelBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
  applyDiscount: (payload) => request('/discounts/apply', { method: 'POST', body: JSON.stringify(payload) }),
  createDiscount: (payload) => request('/discounts', { method: 'POST', body: JSON.stringify(payload) }),
  confirmCardPayment: (bookingId, payload) => request(`/payments/${bookingId}/confirm-card`, { method: 'POST', body: JSON.stringify(payload) }),
  getUserBookings: (userId) => request(`/bookings/user/${userId}`),
  getUsers: () => request('/users'),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  getAnalytics: () => request('/users/analytics'),
  getRecommendations: (params) => request(`/recommendations${qs(params) ? `?${qs(params)}` : ''}`)
};
