import apiClient from './apiClient'

/**
 * Servicio de Servicios Veterinarios
 * RF-09 | Gestión de servicios ofrecidos por la clínica
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
 * - POST /services/ - Crear servicio
 * - GET /services/ - Listar todos los servicios
 * - GET /services/active - Listar servicios activos
 * - GET /services/{service_id} - Obtener servicio específico
 * - PUT /services/{service_id} - Actualizar servicio
 * - DELETE /services/{service_id} - Desactivar servicio
 * - GET /services/search/ - Buscar servicios
 */
const serviceService = {
  /**
   * Crear un nuevo servicio
   * @param {Object} serviceData - Datos del servicio
   * @param {string} serviceData.nombre - Nombre del servicio (requerido)
   * @param {string} serviceData.descripcion - Descripción del servicio (opcional)
   * @param {number} serviceData.duracion_minutos - Duración en minutos (requerido)
   * @param {number} serviceData.costo - Costo del servicio (requerido)
   * @returns {Promise} Servicio creado
   */
  createService: async (serviceData) => {
    try {
      const response = await apiClient.post('/services/', serviceData)
      return response.data
    } catch (error) {
      throw handleServiceError(error)
    }
  },

  /**
   * Obtener todos los servicios con filtros opcionales
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.skip - Número de registros a omitir
   * @param {number} params.limit - Límite de registros
   * @param {boolean} params.activo - Filtrar por estado activo/inactivo
   * @returns {Promise} Lista de servicios
   */
  getAllServices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      queryParams.append('skip', (params.skip || 0).toString())
      queryParams.append('limit', (params.limit || 100).toString())

      if (params.activo !== undefined && params.activo !== null) {
        queryParams.append('activo', params.activo.toString())
      }

      const response = await apiClient.get(`/services/?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw handleServiceError(error)
    }
  },

  /**
   * Obtener solo servicios activos (para agendar citas)
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise} Lista de servicios activos
   */
  getActiveServices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      queryParams.append('skip', (params.skip || 0).toString())
      queryParams.append('limit', (params.limit || 100).toString())

      const response = await apiClient.get(`/services/active?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw handleServiceError(error)
    }
  },

  /**
   * Obtener un servicio por ID
   * @param {string} serviceId - ID del servicio (UUID)
   * @returns {Promise} Datos del servicio
   */
  getServiceById: async (serviceId) => {
    try {
      const response = await apiClient.get(`/services/${serviceId}`)
      return response.data
    } catch (error) {
      throw handleServiceError(error)
    }
  },

  /**
   * Actualizar un servicio existente
   * @param {string} serviceId - ID del servicio (UUID)
   * @param {Object} serviceData - Datos a actualizar
   * @returns {Promise} Servicio actualizado
   */
  updateService: async (serviceId, serviceData) => {
    try {
      const response = await apiClient.put(`/services/${serviceId}`, serviceData)
      return response.data
    } catch (error) {
      throw handleServiceError(error)
    }
  },

  /**
   * Desactivar un servicio (borrado lógico)
   * @param {string} serviceId - ID del servicio (UUID)
   * @returns {Promise} Confirmación de desactivación
   */
  deactivateService: async (serviceId) => {
    try {
      const response = await apiClient.delete(`/services/${serviceId}`)
      return response.data
    } catch (error) {
      throw handleServiceError(error)
    }
  },

  /**
   * Buscar servicios por término
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise} Resultados de búsqueda
   */
  searchServices: async (searchTerm, params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      queryParams.append('q', searchTerm)
      queryParams.append('skip', (params.skip || 0).toString())
      queryParams.append('limit', (params.limit || 100).toString())

      const response = await apiClient.get(`/services/search/?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw handleServiceError(error)
    }
  }
}

/**
 * Manejo centralizado de errores del servicio
 */
function handleServiceError(error) {
  if (error.response) {
    // Error de respuesta del servidor
    const status = error.response.status
    const message = error.response.data?.detail || error.response.data?.message || 'Error desconocido'

    switch (status) {
      case 400:
        return new Error(`Datos inválidos: ${message}`)
      case 401:
        return new Error('No autorizado. Por favor, inicie sesión nuevamente')
      case 403:
        return new Error('No tiene permisos para realizar esta acción')
      case 404:
        return new Error('Servicio no encontrado')
      case 409:
        return new Error('Ya existe un servicio con ese nombre')
      case 500:
        return new Error('Error del servidor. Por favor, intente más tarde')
      default:
        return new Error(message)
    }
  } else if (error.request) {
    // Error de red
    return new Error('Error de conexión. Verifique su conexión a internet')
  } else {
    // Otro tipo de error
    return new Error(error.message || 'Error desconocido')
  }
}

export default serviceService