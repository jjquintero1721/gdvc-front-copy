import apiClient from './apiClient'

/**
 * Servicio de Mascotas
 * RF-04 | Gestión de pacientes (mascotas)
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
 * Endpoints disponibles:
 * - GET /patients/pets - Listar todas las mascotas
 * - GET /patients/pets/owner/{owner_id} - Obtener mascotas por propietario
 * - POST /patients/pets - Crear mascota
 */
const petService = {
  /**
   * Obtener mascotas de un propietario específico
   * @param {string} ownerId - ID del propietario
   * @returns {Promise} Lista de mascotas del propietario
   */
  getPetsByOwner: async (ownerId) => {
    try {
      const response = await apiClient.get(`/patients/pets/owner/${ownerId}`)
      // response.data contiene: { success: true, message: "...", data: { mascotas: [...] } }
      return response.data
    } catch (error) {
      throw handlePetError(error)
    }
  },

  /**
   * Obtener todas las mascotas con paginación
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.page - Número de página
   * @param {number} params.pageSize - Tamaño de página
   * @param {boolean} params.activo - Filtrar por estado activo
   * @returns {Promise} Lista de mascotas
   */
  getAllPets: async (params = {}) => {
    try {
      const { page = 1, pageSize = 10, activo = null } = params
      const skip = (page - 1) * pageSize

      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: pageSize.toString()
      })

      if (activo !== null) {
        queryParams.append('activo', activo.toString())
      }

      const response = await apiClient.get(`/patients/pets?${queryParams}`)
      return response.data
    } catch (error) {
      throw handlePetError(error)
    }
  },

  /**
   * Crear nueva mascota
   * @param {Object} petData - Datos de la mascota
   * @returns {Promise} Mascota creada
   */
  createPet: async (petData) => {
    try {
      const response = await apiClient.post('/patients/pets', petData)
      return response.data
    } catch (error) {
      throw handlePetError(error)
    }
  }
}

/**
 * Manejo de errores del servicio de mascotas
 * @param {Error} error - Error capturado
 * @returns {Error} Error procesado con mensaje amigable
 */
function handlePetError(error) {
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 400:
        return new Error(data.detail || 'Datos inválidos. Verifica la información de la mascota.')
      case 401:
        return new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      case 403:
        return new Error('No tienes permisos para realizar esta acción.')
      case 404:
        return new Error('Propietario o mascota no encontrado.')
      case 500:
        return new Error('Error del servidor. Por favor, intenta más tarde.')
      default:
        return new Error(data.detail || 'Error al procesar la solicitud.')
    }
  }

  if (error.request) {
    return new Error('Error de conexión. Por favor, verifica tu internet.')
  }

  return new Error(error.message || 'Error desconocido')
}

export default petService