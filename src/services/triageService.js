import apiClient from './apiClient'

/**
 * Servicio de Triage
 * RF-08 | Gestión de Triage (clasificación de prioridad)
 *
 * Endpoints disponibles:
 * - POST /triage/ - Crear nuevo triage
 * - GET /triage/ - Obtener todos los triages con filtros
 * - GET /triage/urgencias - Obtener cola de urgencias
 * - GET /triage/{triage_id} - Obtener triage específico
 * - PUT /triage/{triage_id} - Actualizar triage
 * - DELETE /triage/{triage_id} - Eliminar triage
 * - GET /triage/cita/{cita_id} - Obtener triage por cita
 * - GET /triage/mascota/{mascota_id} - Obtener triages por mascota
 */
const triageService = {
  /**
   * Crear un nuevo registro de triage
   * @param {Object} triageData - Datos del triage
   * @param {string} triageData.cita_id - ID de la cita (opcional)
   * @param {string} triageData.mascota_id - ID de la mascota (obligatorio)
   * @param {string} triageData.estado_general - critico, decaido, alerta, estable
   * @param {number} triageData.fc - Frecuencia cardíaca (latidos/min)
   * @param {number} triageData.fr - Frecuencia respiratoria (respiraciones/min)
   * @param {number} triageData.temperatura - Temperatura en °C
   * @param {string} triageData.dolor - ausente, leve, moderado, severo
   * @param {string} triageData.sangrado - Si/No
   * @param {string} triageData.shock - Si/No
   * @param {string} triageData.observaciones - Observaciones adicionales
   * @returns {Promise} Triage creado con prioridad calculada
   */
  createTriage: async (triageData) => {
    try {
      console.log('📋 Creando triage:', triageData)

      const response = await apiClient.post('/triage/', triageData)

      console.log('✅ Triage creado exitosamente:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al crear triage:', error)
      throw handleTriageError(error)
    }
  },

  /**
   * Obtener todos los triages con filtros opcionales
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.skip - Número de registros a omitir
   * @param {number} params.limit - Límite de registros
   * @param {string} params.prioridad - urgente, alta, media, baja
   * @returns {Promise} Lista de triages
   */
  getAllTriages: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      // Parámetros de paginación
      queryParams.append('skip', (params.skip || 0).toString())
      queryParams.append('limit', (params.limit || 100).toString())

      // Filtro de prioridad
      if (params.prioridad) {
        queryParams.append('prioridad', params.prioridad)
      }

      const response = await apiClient.get(`/triage/?${queryParams}`)

      console.log('✅ Triages obtenidos:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener triages:', error)
      throw handleTriageError(error)
    }
  },

  /**
   * Obtener cola de urgencias
   * Devuelve los triages pendientes ordenados por prioridad
   * @param {number} limit - Límite de registros (default: 50)
   * @returns {Promise} Cola de urgencias ordenada
   */
  getColaUrgencias: async (limit = 50) => {
    try {
      console.log('🚨 Obteniendo cola de urgencias')

      const response = await apiClient.get(`/triage/urgencias?limit=${limit}`)

      console.log('✅ Cola de urgencias obtenida:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener cola de urgencias:', error)
      throw handleTriageError(error)
    }
  },

  /**
   * Obtener un triage por ID
   * @param {string} triageId - ID del triage (UUID)
   * @returns {Promise} Datos del triage
   */
  getTriageById: async (triageId) => {
    try {
      console.log(`🔍 Obteniendo triage ${triageId}`)

      const response = await apiClient.get(`/triage/${triageId}`)

      console.log('✅ Triage obtenido:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener triage ${triageId}:`, error)
      throw handleTriageError(error)
    }
  },

  /**
   * Obtener triage asociado a una cita
   * @param {string} citaId - ID de la cita (UUID)
   * @returns {Promise} Datos del triage
   */
  getTriageByCita: async (citaId) => {
    try {
      console.log(`🔍 Obteniendo triage de la cita ${citaId}`)

      const response = await apiClient.get(`/triage/cita/${citaId}`)

      console.log('✅ Triage de la cita obtenido:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener triage de la cita ${citaId}:`, error)
      throw handleTriageError(error)
    }
  },

  /**
   * Obtener historial de triages de una mascota
   * @param {string} mascotaId - ID de la mascota (UUID)
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise} Lista de triages de la mascota
   */
  getTriagesByMascota: async (mascotaId, params = {}) => {
    try {
      console.log(`🔍 Obteniendo triages de la mascota ${mascotaId}`)

      const queryParams = new URLSearchParams()
      queryParams.append('skip', (params.skip || 0).toString())
      queryParams.append('limit', (params.limit || 100).toString())

      const response = await apiClient.get(`/triage/mascota/${mascotaId}?${queryParams}`)

      console.log('✅ Triages de la mascota obtenidos:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener triages de la mascota ${mascotaId}:`, error)
      throw handleTriageError(error)
    }
  },

  /**
   * Actualizar un triage existente
   * @param {string} triageId - ID del triage (UUID)
   * @param {Object} triageData - Datos a actualizar
   * @returns {Promise} Triage actualizado
   */
  updateTriage: async (triageId, triageData) => {
    try {
      console.log(`✏️ Actualizando triage ${triageId}:`, triageData)

      const response = await apiClient.put(`/triage/${triageId}`, triageData)

      console.log('✅ Triage actualizado exitosamente:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al actualizar triage ${triageId}:`, error)
      throw handleTriageError(error)
    }
  },

  /**
   * Eliminar un triage
   * @param {string} triageId - ID del triage (UUID)
   * @returns {Promise} Confirmación de eliminación
   */
  deleteTriage: async (triageId) => {
    try {
      console.log(`🗑️ Eliminando triage ${triageId}`)

      const response = await apiClient.delete(`/triage/${triageId}`)

      console.log('✅ Triage eliminado exitosamente')
      return response.data
    } catch (error) {
      console.error(`❌ Error al eliminar triage ${triageId}:`, error)
      throw handleTriageError(error)
    }
  }
}

/**
 * Manejo centralizado de errores de triage
 * @param {Error} error - Error capturado
 * @returns {Error} Error formateado
 */
const handleTriageError = (error) => {
  if (error.response) {
    const status = error.response.status
    const detail = error.response.data?.detail

    console.error('❌ ERROR COMPLETO:', {
      status,
      detail,
      fullError: error.response.data
    })

    switch (status) {
      case 400:
        return new Error(`Datos inválidos: ${JSON.stringify(detail)}`)
      case 401:
        return new Error('No autorizado. Por favor, inicia sesión nuevamente.')
      case 403:
        return new Error('No tienes permisos para realizar esta acción.')
      case 404:
        return new Error('Triage no encontrado.')
      case 422:
        if (Array.isArray(detail)) {
          const messages = detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
          return new Error(`Error de validación: ${messages}`)
        }
        return new Error(`Error de validación: ${JSON.stringify(detail)}`)
      case 500:
        return new Error('Error del servidor. Por favor, intenta más tarde.')
      default:
        return new Error(JSON.stringify(detail) || 'Error desconocido')
    }
  } else if (error.request) {
    return new Error('Error de conexión. Verifica tu internet.')
  } else {
    return new Error(error.message || 'Error desconocido')
  }
}

export default triageService