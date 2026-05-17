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
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
  resendVerificationEmail: (email) => request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  chatWithAssistant: (payload) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
  getReferenceData: () => request('/meta/reference-data'),
  getAircraft: () => request('/aircraft'),
  getAircraftDetails: (aircraftId) => request(`/aircraft/${aircraftId}`),
  getAircraftSeats: (aircraftId) => request(`/aircraft/${aircraftId}/seats`),
  createAircraft: (payload) => request('/aircraft', { method: 'POST', body: JSON.stringify(payload) }),
  updateAircraft: (id, payload) => request(`/aircraft/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAircraft: (id) => request(`/aircraft/${id}`, { method: 'DELETE' }),
  getFlights: (params) => request(`/flights${qs(params) ? `?${qs(params)}` : ''}`),
  searchFlights: (params) => request(`/flights/search${qs(params) ? `?${qs(params)}` : ''}`),
  getFlightSeats: (flightId) => request(`/flights/${flightId}/seats`),
  getFlightAvailability: (flightId) => request(`/flights/${flightId}/availability`),
  getFlightSeatMap: (flightId) => request(`/flights/${flightId}/seat-map`),
  createFlight: (payload) => request('/flights', { method: 'POST', body: JSON.stringify(payload) }),
  updateFlight: (id, payload) => request(`/flights/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteFlight: (id) => request(`/flights/${id}`, { method: 'DELETE' }),
  updateFlightStatus: (id, status) => request(`/flights/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  updateBooking: (id, payload) => request(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  cancelBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
  applyDiscount: (payload) => request('/discounts/apply', { method: 'POST', body: JSON.stringify(payload) }),
  createDiscount: (payload) => request('/discounts', { method: 'POST', body: JSON.stringify(payload) }),
  getPaymentSandboxConfig: () => request('/payments/sandbox-config'),
  confirmCardPayment: (bookingId, payload) => request(`/payments/${bookingId}/confirm-card`, { method: 'POST', body: JSON.stringify(payload) }),
  getUserBookings: (userId) => request(`/bookings/user/${userId}`),
  getMyAccount: () => request('/users/me'),
  updateMyAccount: (payload) => request('/users/me', { method: 'PUT', body: JSON.stringify(payload) }),
  changeMyPassword: (payload) => request('/users/me/password', { method: 'PATCH', body: JSON.stringify(payload) }),
  getUsers: () => request('/users'),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  getAnalytics: () => request('/users/analytics'),
  getRecommendations: (params) => request(`/recommendations${qs(params) ? `?${qs(params)}` : ''}`),
  getSearchHistory: (params) => request(`/recommendations/search-history${qs(params) ? `?${qs(params)}` : ''}`),
  recordSearchHistory: (payload) => request('/recommendations/search-history', { method: 'POST', body: JSON.stringify(payload) }),
  getNotifications: () => request('/meta/notifications')
};
