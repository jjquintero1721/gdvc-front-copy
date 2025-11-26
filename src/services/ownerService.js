import apiClient from './apiClient'

/**
 * Servicio de Propietarios
 * RF-01 | Gestión de propietarios
 *
 * IMPORTANTE: Estructura de respuesta del backend
 * ============================================
 * El backend envuelve todas las respuestas en success_response:
 * {
 *   "success": true,
 *   "message": "Mensaje descriptivo",
 *   "data": { ... datos reales ... }
 * }
 */
const ownerService = {
  /**
   * Obtener propietario por usuario_id
   * Útil para obtener el registro de propietario del usuario autenticado
   *
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise} Propietario encontrado
   */
  getOwnerByUserId: async (usuarioId) => {
    try {
      console.log(`🔍 Buscando propietario para usuario: ${usuarioId}`)

      // Obtener todos los propietarios y filtrar por usuario_id
      // Nota: Si el backend tiene un endpoint específico, usar ese en su lugar
      const response = await apiClient.get('/owners/')

      const owners = response.data?.data?.propietarios || response.data?.propietarios || []
      const owner = owners.find(o => o.usuario_id === usuarioId)

      if (!owner) {
        console.warn(`⚠️ No se encontró propietario para usuario ${usuarioId}`)
        return null
      }

      console.log(`✅ Propietario encontrado: ${owner.id}`)
      return owner
    } catch (error) {
      console.error(`❌ Error al buscar propietario:`, error)
      throw handleOwnerError(error)
    }
  },

  /**
   * Obtener propietario por ID
   * @param {string} ownerId - ID del propietario
   * @returns {Promise} Propietario encontrado
   */
  getOwnerById: async (ownerId) => {
    try {
      const response = await apiClient.get(`/owners/${ownerId}`)
      return response.data?.data || response.data
    } catch (error) {
      throw handleOwnerError(error)
    }
  },

  /**
   * Obtener todos los propietarios
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Lista de propietarios
   */
  getAllOwners: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (params.skip !== undefined) queryParams.append('skip', params.skip)
      if (params.limit !== undefined) queryParams.append('limit', params.limit)
      if (params.activo !== undefined) queryParams.append('activo', params.activo)

      const response = await apiClient.get(`/owners/?${queryParams}`)
      return response.data
    } catch (error) {
      throw handleOwnerError(error)
    }
  }
}

/**
 * Manejo de errores del servicio de propietarios
 * @param {Error} error - Error capturado
 * @returns {Error} Error procesado con mensaje amigable
 */
function handleOwnerError(error) {
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 400:
        return new Error(data.detail || 'Datos inválidos.')
      case 401:
        return new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      case 403:
        return new Error('No tienes permisos para acceder a esta información.')
      case 404:
        return new Error('Propietario no encontrado.')
      default:
        return new Error(data.detail || 'Error al procesar la solicitud.')
    }
  } else if (error.request) {
    return new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
  } else {
    return new Error(error.message || 'Error inesperado.')
  }
}

export default ownerService