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
      // ✅ CORREGIDO: Comillas invertidas correctas
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

      // ✅ CORREGIDO: El backend espera 'page' y 'page_size', no 'skip' y 'limit'
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      })

      if (activo !== null) {
        queryParams.append('activo', activo.toString())
      }

      // ✅ CORREGIDO: Comillas invertidas correctas
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
 * Convierte errores de Axios/Backend en objetos Error con mensajes legibles
 *
 * @param {Error} error - Error capturado
 * @returns {Error} Error procesado con mensaje amigable
 */
function handlePetError(error) {
  // 🔧 MEJORADO: Manejar errores de Axios correctamente
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    // 🔧 NUEVO: Manejar arrays de errores de validación de Pydantic
    if (data.detail && Array.isArray(data.detail)) {
      const messages = data.detail.map(err => {
        // Formato de error de Pydantic: { msg: "...", loc: [...], type: "..." }
        return err.msg || err.message || JSON.stringify(err)
      })
      return new Error(messages.join('. '))
    }

    // 🔧 NUEVO: Manejar objetos de error con 'detail' como string
    if (data.detail && typeof data.detail === 'string') {
      return new Error(data.detail)
    }

    // Mensajes específicos por código de estado
    switch (status) {
      case 400:
        return new Error(data.message || data.detail || 'Datos inválidos. Verifica la información de la mascota.')
      case 401:
        return new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      case 403:
        return new Error('No tienes permisos para realizar esta acción.')
      case 404:
        return new Error('Mascota o propietario no encontrado.')
      case 409:
        return new Error('Ya existe una mascota con el mismo nombre y especie para este propietario.')
      case 422:
        // Error de validación de Pydantic
        return new Error(data.message || 'Error de validación. Verifica los datos ingresados.')
      case 500:
        return new Error('Error del servidor. Por favor, intenta nuevamente.')
      default:
        return new Error(data.detail || data.message || 'Error al procesar la solicitud.')
    }
  }

  // Error de red (sin respuesta del servidor)
  if (error.request) {
    return new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
  }

  // Otros errores
  return new Error(error.message || 'Error desconocido.')
}

export default petService