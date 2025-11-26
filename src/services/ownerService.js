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
 *
 * 🔧 CORRECCIÓN APLICADA (v2):
 * - Las rutas usan el prefijo /patients/owners/
 * - Se agregó método getMyOwnerProfile() para propietarios autenticados
 */
const ownerService = {
  /**
   * ✅ NUEVO: Obtener mi perfil de propietario (usuario autenticado)
   * Este endpoint permite a un propietario obtener su propio registro
   * sin necesidad de conocer su owner_id previamente
   *
   * @returns {Promise} Propietario del usuario autenticado
   */
  getMyOwnerProfile: async () => {
    try {
      console.log('🔍 Obteniendo mi perfil de propietario...')

      // ✅ Usar el nuevo endpoint /patients/owners/me
      const response = await apiClient.get('/patients/owners/me')

      const owner = response.data?.data || null

      if (!owner) {
        console.warn('⚠️ No se encontró registro de propietario')
        return null
      }

      console.log(`✅ Propietario encontrado: ${owner.id}`)
      return owner
    } catch (error) {
      console.error('❌ Error al obtener mi perfil de propietario:', error)
      throw handleOwnerError(error)
    }
  },

  /**
   * Obtener propietario por usuario_id
   *
   * ⚠️ DEPRECADO: Usar getMyOwnerProfile() en su lugar para propietarios autenticados
   * Este método se mantiene para compatibilidad con código existente
   *
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise} Propietario encontrado
   */
  getOwnerByUserId: async (usuarioId) => {
    try {
      console.log(`🔍 Buscando propietario para usuario: ${usuarioId}`)

      // ⚠️ Este método requiere permisos de staff
      // Para propietarios autenticados, usar getMyOwnerProfile() en su lugar
      const response = await apiClient.get('/patients/owners/', {
        params: { page: 1, page_size: 100 }
      })

      const owners = response.data?.data?.owners || []
      const owner = owners.find(o => o.usuario_id === usuarioId)

      if (!owner) {
        console.warn(`⚠️ No se encontró propietario para usuario ${usuarioId}`)
        return null
      }

      console.log(`✅ Propietario encontrado: ${owner.id}`)
      return owner
    } catch (error) {
      console.error(`❌ Error al buscar propietario:`, error)

      // Si es error 403 (Forbidden), sugerir usar getMyOwnerProfile()
      if (error.response?.status === 403) {
        console.warn('⚠️ Acceso denegado. Si eres propietario, usa getMyOwnerProfile() en su lugar')
        throw new Error('No tienes permisos para acceder a este endpoint. Por favor, contacta al administrador.')
      }

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
      const response = await apiClient.get(`/patients/owners/${ownerId}`)
      return response.data?.data || response.data
    } catch (error) {
      throw handleOwnerError(error)
    }
  },

  /**
   * Obtener todos los propietarios
   * ⚠️ Requiere permisos de staff (SUPERADMIN, VETERINARIO, AUXILIAR)
   *
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Lista de propietarios
   */
  getAllOwners: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      // Parámetros de paginación
      const page = params.page || 1
      const page_size = params.page_size || params.limit || 10

      queryParams.append('page', page)
      queryParams.append('page_size', page_size)

      if (params.activo !== undefined) {
        queryParams.append('activo', params.activo)
      }

      const response = await apiClient.get(`/patients/owners/?${queryParams}`)
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