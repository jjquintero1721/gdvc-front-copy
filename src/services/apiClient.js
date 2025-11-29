import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

/**
 * Cliente Axios configurado para la API del backend
 * Incluye interceptores para manejo de autenticación y errores
 */
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de Request - Agregar token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de Response - Manejo de errores y refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401 y no hemos intentado refrescar el token aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = useAuthStore.getState().getRefreshToken()

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Intentar refrescar el token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const { access_token, refresh_token } = response.data

        // Actualizar tokens en el store
        useAuthStore.getState().updateTokens({
          access_token,
          refresh_token
        })

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Si falla el refresh, cerrar sesión
        useAuthStore.getState().logout()
        return Promise.reject({
          ...refreshError,
          forcedLogout: true
        })
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient