import axios from 'axios';

const normalizeBaseUrl = (value) => value?.replace(/\/+$/, '');

const resolveApiBaseUrl = () => {
    const envApiUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);

    if (envApiUrl) {
        return envApiUrl;
    }

    if (import.meta.env.DEV) {
        return 'http://localhost:5001/api';
    }

    return '/api';
};

export const getApiErrorMessage = (error, fallbackMessage = 'Une erreur est survenue') => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.code === 'ERR_NETWORK') {
        return 'Connexion a l API impossible. Verifie VITE_API_URL cote frontend et FRONTEND_URL cote backend.';
    }

    return fallbackMessage;
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
