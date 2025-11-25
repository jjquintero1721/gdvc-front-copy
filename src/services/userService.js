import apiClient from './apiClient'

/**
 * Servicio de Gestión de Usuarios
 * RF-02 | Gestión de usuarios internos (Superadmin)
 *
 * IMPORTANTE: Estructura de respuesta del backend
 * ============================================
 * El backend envuelve todas las respuestas en success_response:
 * {
 *   "success": true,          // ← booleano, no string
 *   "message": "Mensaje descriptivo",
 *   "data": { ... datos reales ... }
 * }
 *
 * Por lo tanto:
 * - response.data.success → true/false (booleano)
 * - response.data.data → objeto con los datos reales
 * - response.data.message → mensaje descriptivo
 *
 * Endpoints disponibles:
 * - GET /users/ - Listar todos los usuarios (con paginación y filtros)
 * - GET /users/me - Obtener usuario actual
 * - GET /users/search - Buscar usuarios por nombre o correo
 * - GET /users/rol/{rol} - Filtrar por rol
 * - GET /users/{user_id} - Obtener un usuario específico
 * - PUT /users/{user_id} - Actualizar usuario
 * - POST /users/{user_id}/change-password - Cambiar contraseña
 *
 * NOTA: Solo SUPERADMIN puede activar/desactivar usuarios
 */
const userService = {
  /**
   * Obtener todos los usuarios con paginación y filtros
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.skip - Número de registros a omitir (default: 0)
   * @param {number} params.limit - Límite de registros (default: 100)
   * @param {boolean|null} params.activo - Filtrar por estado activo/inactivo
   * @returns {Promise} Lista de usuarios
   */
  getAllUsers: async (params = {}) => {
    try {
      const { skip = 0, limit = 100, activo = null } = params

      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString()
      })

      // Solo agregar filtro activo si tiene valor
      if (activo !== null && activo !== undefined) {
        queryParams.append('activo', activo.toString())
      }

      const response = await apiClient.get(`/users?${queryParams.toString()}`)

      // response.data contiene: { success: true, message: "...", data: { total, usuarios: [...] } }
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * Buscar usuarios por nombre o correo
   * @param {string} query - Término de búsqueda
   * @param {number} skip - Paginación
   * @param {number} limit - Límite de resultados
   * @returns {Promise} Resultados de búsqueda
   */
  searchUsers: async (query, skip = 0, limit = 100) => {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        skip: skip.toString(),
        limit: limit.toString()
      })

      const response = await apiClient.get(`/users/search?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * Obtener usuarios por rol
   * @param {string} rol - Rol a filtrar (superadmin, veterinario, auxiliar, propietario)
   * @param {boolean} activo - Solo usuarios activos
   * @returns {Promise} Usuarios del rol especificado
   */
  getUsersByRole: async (rol, activo = true) => {
    try {
      const queryParams = new URLSearchParams({
        activo: activo.toString()
      })

      const response = await apiClient.get(`/users/rol/${rol}?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw handleUserError(error)
    }
  },

  /**
   * Obtener un usuario específico por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise} Datos del usuario
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
   * Actualizar datos de un usuario
   * Solo SUPERADMIN puede cambiar el campo 'activo'
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @param {string} userData.nombre - Nombre del usuario
   * @param {string} userData.telefono - Teléfono del usuario
   * @param {boolean} userData.activo - Estado activo (solo SUPERADMIN)
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
   * Cambiar contraseña de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} oldPassword - Contraseña anterior
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise} Confirmación
   */
  changeUserPassword: async (userId, oldPassword, newPassword) => {
    try {
      const response = await apiClient.post(`/users/${userId}/change-password`, {
        contrasena_anterior: oldPassword,
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