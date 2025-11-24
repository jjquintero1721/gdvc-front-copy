import apiClient from './apiClient'

/**
 * Servicio de Autenticación
 * Maneja todas las operaciones relacionadas con login, registro y gestión de contraseñas
 *
 * IMPORTANTE: Estructura de respuesta del backend
 * ============================================
 * El backend envuelve todas las respuestas en success_response:
 * {
 *   "status": "success",
 *   "message": "Mensaje descriptivo",
 *   "data": { ... datos reales ... }
 * }
 *
 * Por lo tanto, siempre debemos acceder a response.data.data para obtener los datos reales
 */
const authService = {
  /**
   * Login de usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise} Estructura: { status, message, data: { access_token, token_type, usuario } }
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        correo: email,
        contrasena: password
      })

      // response.data contiene: { status, message, data: { access_token, token_type, usuario } }
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  },

  /**
   * Registro de nuevo usuario (propietario)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} Estructura: { status, message, data: { usuario } }
   */
  register: async (userData) => {
    try {
      // Transformar los datos al formato esperado por el backend
      const backendData = {
        nombre: userData.nombre || userData.full_name,
        correo: userData.email || userData.correo,
        telefono: userData.phone || userData.telefono,
        contrasena: userData.password || userData.contrasena,
        rol: userData.rol || 'propietario',  // Por defecto propietario
        documento: userData.cedula || userData.documento
      }

      const response = await apiClient.post('/auth/register', backendData)

      // response.data contiene: { status, message, data: { usuario } }
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  },

  /**
   * Cambiar contraseña (requiere contraseña anterior)
   * @param {string} oldPassword - Contraseña anterior
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise} Confirmación del cambio
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      })
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise} Confirmación de logout
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error) {
      // Incluso si falla el logout en el servidor, limpiamos el estado local
      console.error('Error during logout:', error)
      return { success: true }
    }
  },

  /**
   * Refrescar token de acceso
   * @param {string} refreshToken - Token de refresco
   * @returns {Promise} Nuevos tokens
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken
      })
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  },

  /**
   * Obtener información del usuario actual
   * @returns {Promise} Estructura: { status, message, data: { usuario } }
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me')

      // response.data contiene: { status, message, data: { usuario } }
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  }
}

/**
 * Manejador de errores de autenticación
 * Extrae y formatea los mensajes de error de la API
 *
 * @param {Error} error - Error de axios
 * @returns {Error} Error formateado con mensaje legible
 */
function handleAuthError(error) {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response

    // El backend puede devolver errores en formato:
    // 1. { detail: "mensaje" } (FastAPI HTTPException)
    // 2. { status: "error", message: "mensaje" } (error_response)
    const errorMessage = data.detail || data.message || 'Error desconocido'

    switch (status) {
      case 400:
        return new Error(errorMessage || 'Datos de entrada inválidos')
      case 401:
        return new Error(errorMessage || 'Credenciales inválidas')
      case 403:
        return new Error(errorMessage || 'Acceso no autorizado')
      case 404:
        return new Error(errorMessage || 'Usuario no encontrado')
      case 409:
        return new Error(errorMessage || 'El usuario ya existe')
      case 422:
        // Errores de validación de Pydantic
        if (data.detail && Array.isArray(data.detail)) {
          const messages = data.detail.map(err => err.msg).join(', ')
          return new Error(`Errores de validación: ${messages}`)
        }
        return new Error(errorMessage || 'Error de validación')
      case 500:
        return new Error('Error interno del servidor. Por favor, intenta más tarde.')
      default:
        return new Error(errorMessage)
    }
  } else if (error.request) {
    // Error de red o servidor no responde
    return new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
  } else {
    // Error en la configuración de la petición
    return new Error(error.message || 'Error al procesar la solicitud')
  }
}

export default authService