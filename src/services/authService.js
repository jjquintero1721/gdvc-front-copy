import apiClient from './apiClient'

/**
 * Servicio de Autenticación
 * Maneja todas las operaciones relacionadas con login, registro y gestión de contraseñas
 */
const authService = {
  /**
   * Login de usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise} Datos del usuario y tokens
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        correo: email,
        contrasena: password
      })
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  },

  /**
   * Registro de nuevo usuario (propietario)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} Datos del usuario creado
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
   * @returns {Promise} Datos del usuario
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  }
}

/**
 * Manejador de errores de autenticación
 * Extrae y formatea los mensajes de error de la API
 */
function handleAuthError(error) {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response

    switch (status) {
      case 400:
        return new Error(data.detail || 'Datos de entrada inválidos')
      case 401:
        return new Error(data.detail || 'Credenciales inválidas')
      case 403:
        return new Error(data.detail || 'Acceso no autorizado')
      case 404:
        return new Error(data.detail || 'Usuario no encontrado')
      case 409:
        return new Error(data.detail || 'El usuario ya existe')
      case 422:
        // Errores de validación de Pydantic
        if (data.detail && Array.isArray(data.detail)) {
          const messages = data.detail.map(err => err.msg).join(', ')
          return new Error(`Errores de validación: ${messages}`)
        }
        return new Error(data.detail || 'Error de validación')
      case 500:
        return new Error('Error interno del servidor. Por favor, intenta más tarde.')
      default:
        return new Error(data.detail || 'Error desconocido en el servidor')
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