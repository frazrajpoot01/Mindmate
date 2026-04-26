import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mindmate_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 by redirecting to login securely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear both localStorage and the Middleware cookie!
        localStorage.removeItem('mindmate_token');
        document.cookie = "mindmate_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Convenience helpers
export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  // Updated to include the new fields we added to the UI
  signup: (email, password, first_name, last_name) =>
    api.post('/auth/signup', { email, password, first_name, last_name }),

  // ─── Google Login ──────────────────────────────────────────────
  googleLogin: (googleToken) =>
    api.post('/auth/google', { token: googleToken }),
};

export const chatApi = {
  sendMessage: (message) =>
    api.post('/chat', { message }),

  // Now accepts an optional sessionId to fetch specific conversations
  getHistory: (sessionId = null) => {
    const url = sessionId ? `/chat-history?session_id=${sessionId}` : '/chat-history';
    return api.get(url);
  },

  // Fetch the journal archive metadata
  getJournal: () =>
    api.get('/journal'),

  // ─── NEW: Soft Close Chat Session ──────────────────────────────
  clearChat: () =>
    api.delete('/chat/clear'),
};

export const moodApi = {
  saveMood: (mood_type) =>
    api.post('/save-mood', { mood_type }),
  getHistory: () =>
    api.get('/get-mood-history'),
};

export const settingsApi = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data) => api.put('/settings/profile', data),
  exportData: () => api.get('/settings/export'),
  deleteAccount: () => api.delete('/settings/account'),
};