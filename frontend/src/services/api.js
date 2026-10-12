import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or unauthorized on protected routes, clear local storage
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Books APIs
export const bookService = {
  getAllBooks: async (query = '', category = '') => {
    const params = {};
    if (query) params.query = query;
    if (category) params.category = category;
    const res = await api.get('/books', { params });
    return res.data;
  },
  getBookById: async (id) => {
    const res = await api.get(`/books/${id}`);
    return res.data;
  },
  addBook: async (bookData) => {
    const res = await api.post('/books', bookData);
    return res.data;
  },
  updateBook: async (id, bookData) => {
    const res = await api.put(`/books/${id}`, bookData);
    return res.data;
  },
  deleteBook: async (id) => {
    const res = await api.delete(`/books/${id}`);
    return res.data;
  },
};

// Borrowing APIs
export const borrowingService = {
  borrowBook: async (bookId) => {
    const res = await api.post(`/borrowings/${bookId}`);
    return res.data;
  },
  getMyBorrowings: async () => {
    const res = await api.get('/borrowings/my');
    return res.data;
  },
  getAllBorrowings: async () => {
    const res = await api.get('/borrowings');
    return res.data;
  },
  returnBook: async (borrowingId) => {
    const res = await api.put(`/borrowings/${borrowingId}/return`);
    return res.data;
  },
};

// Fine APIs
export const fineService = {
  getMyFines: async () => {
    const res = await api.get('/fines/my');
    return res.data;
  },
  getAllFines: async () => {
    const res = await api.get('/fines');
    return res.data;
  },
  payFine: async (fineId) => {
    const res = await api.put(`/fines/${fineId}/pay`);
    return res.data;
  },
};

export default api;
