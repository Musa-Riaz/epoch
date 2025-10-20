import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8500/api';

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
// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config

//         console.log('error', error)

//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true

//             try {
//                 const refreshToken = localStorage.getItem('refreshToken')
//                 console.log('refreshToken', refreshToken)
//                 if (refreshToken) {
//                     const response = await axios.post<ApiResponse<RefreshTokenResponse>>(`${API_BASE_URL}/auth/refresh`, {
//                         refreshToken
//                     })

//                     // Update access token in local storage
//                     const { accessToken } = response.data.data
//                     localStorage.setItem('token', accessToken)

//                     originalRequest.headers.Authorization = `Bearer ${accessToken}`
//                     return api(originalRequest)
//                 }
//                 else {
//                     // useAuthStore.getState().resetState();
//                     // TODO: instead of redirecting to login, we should show a message to the user to login again
//                     window.location.href = '/login'
//                 }
//             } catch {
//                 // useAuthStore.getState().resetState();
//                 window.location.href = '/login'
//             }
//         }

//         return Promise.reject(error)
//     }
// )