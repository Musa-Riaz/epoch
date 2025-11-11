import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8500/api';

// Function to get auth store (lazy loaded to avoid circular dependencies)
const getAuthStore = () => {
    if (typeof window !== 'undefined') {
        // Dynamic import to avoid circular dependency
        return import('@/stores/auth.store').then(module => module.useAuthStore);
    }
    return null;
};

// creating axios instance

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // Get token from Zustand persist storage
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const { state } = JSON.parse(authStorage);
                const token = state?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error parsing auth storage:', error);
            }
        }
        return config;
    },
     (error) => {
        return Promise.reject(error)
     }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Use auth store's logout function to clear state
                const authStoreModule = await getAuthStore();
                if (authStoreModule) {
                    authStoreModule.getState().logout();
                }
            } catch (err) {
                console.error('Error clearing auth state:', err);
                // Fallback: clear localStorage directly
                localStorage.removeItem('auth-storage');
            }
            
            // Redirect to login page
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        // Handle 403 Forbidden errors
        if (error.response?.status === 403) {
            console.error('Access forbidden - insufficient permissions');
        }

        // Handle 500 Server errors
        if (error.response?.status >= 500) {
            console.error('Server error occurred:', error.response?.data?.message || 'Internal server error');
        }

        return Promise.reject(error);
    }
)