import apiClient from './apiClient'

/**
 * Servicio de Usuarios
 * Maneja todas las operaciones relacionadas con la gestión de usuarios
 */
const userService = {
  /**
   * Obtener todos los usuarios (solo SUPERADMIN)
   * @param {Object} params - Parámetros de filtrado (role, activo, etc.)
   * @returns {Promise} Lista de usuarios
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params })
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * Obtener un usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise} Usuario
   */
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * Crear un nuevo usuario (solo SUPERADMIN)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} Usuario creado
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData)
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * Actualizar un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise} Usuario actualizado
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData)
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * Activar un usuario (solo SUPERADMIN)
   * @param {string} userId - ID del usuario
   * @returns {Promise} Usuario actualizado
   */
  activateUser: async (userId) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, { activo: true })
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * Desactivar un usuario (solo SUPERADMIN)
   * @param {string} userId - ID del usuario
   * @returns {Promise} Usuario actualizado
   */
  deactivateUser: async (userId) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, { activo: false })
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * ✅ CORREGIDO: Cambiar contraseña de un usuario
   *
   * @param {string} userId - ID del usuario (UUID)
   * @param {string} oldPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise} Confirmación
   *
   * Endpoint: POST /api/v1/users/{userId}/change-password
   * Body: { contrasena_actual: string, contrasena_nueva: string }
   */
  changeUserPassword: async (userId, oldPassword, newPassword) => {
    try {
      const response = await apiClient.post(`/users/${userId}/change-password`, {
        contrasena_actual: oldPassword,    // ✅ CORREGIDO: Era "contrasena_anterior", ahora "contrasena_actual"
        contrasena_nueva: newPassword
      })
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  }
}

/**
 * Manejador de errores del servicio de usuarios
 * @param {Error} error - Error de axios
 * @returns {Error} Error formateado
 */
function handleUserError(error) {
  if (error.response) {
    const { status, data } = error.response
    const errorMessage = data.detail || data.message || 'Error desconocido'

    switch (status) {
      case 400:
        return new Error(errorMessage || 'Datos inválidos')
      case 401:
        return new Error('No tienes autorización para realizar esta acción')
      case 403:
        return new Error(errorMessage || 'No tienes permisos suficientes. Solo el SUPERADMIN puede realizar esta acción.')
      case 404:
        return new Error('Usuario no encontrado')
      case 409:
        return new Error(errorMessage || 'Conflicto: El usuario ya existe')
      case 422:
        // Manejo especial de errores de validación de Pydantic
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
    return new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
  } else {
    return new Error(error.message || 'Error al procesar la solicitud')
  }
}

export default userService