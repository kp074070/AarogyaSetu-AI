const API_BASE = '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE;
  }

  getToken() {
    return localStorage.getItem('aarogyasetu_token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('aarogyasetu_token');
        localStorage.removeItem('aarogyasetu_user');
        window.location.href = '/login';
      }
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  register(userData) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // PHCs
  getPHCs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/phcs?${query}`);
  }

  getPHCStats() {
    return this.request('/phcs/stats');
  }

  getNearbyPHCs(state, limit = 10) {
    return this.request(`/phcs/nearby?state=${state}&limit=${limit}`);
  }

  getPHC(phcId) {
    return this.request(`/phcs/${phcId}`);
  }

  updatePHC(phcId, data) {
    return this.request(`/phcs/${phcId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Medicines
  getMedicines(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/medicines?${query}`);
  }

  getMedicineStats(phcId) {
    const query = phcId ? `?phcId=${phcId}` : '';
    return this.request(`/medicines/stats${query}`);
  }

  getMedicineAvailability(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/medicines/availability?${query}`);
  }

  getMedicineCategories() {
    return this.request('/medicines/categories');
  }

  updateMedicine(id, data) {
    return this.request(`/medicines/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Appointments
  getAppointments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/appointments?${query}`);
  }

  getAppointmentStats() {
    return this.request('/appointments/stats');
  }

  getAllAppointments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/appointments/all?${query}`);
  }

  createAppointment(data) {
    return this.request('/appointments', { method: 'POST', body: JSON.stringify(data) });
  }

  updateAppointment(id, data) {
    return this.request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Alerts
  getAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/alerts?${query}`);
  }

  createAlert(data) {
    return this.request('/alerts', { method: 'POST', body: JSON.stringify(data) });
  }

  dismissAlert(id) {
    return this.request(`/alerts/${id}/dismiss`, { method: 'PATCH' });
  }
}

const api = new ApiService();
export default api;
