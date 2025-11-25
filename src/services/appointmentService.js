import apiClient from './apiClient'

/**
 * Servicio de Citas
 * RF-05 | Gestión de citas
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
 * - GET /appointments/ - Listar todas las citas con filtros
 * - GET /appointments/{appointment_id} - Obtener cita específica
 * - POST /appointments/ - Crear nueva cita
 * - PUT /appointments/{appointment_id} - Actualizar cita
 * - DELETE /appointments/{appointment_id} - Cancelar cita
 */
const appointmentService = {
  /**
   * Obtener todas las citas con filtros opcionales
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.skip - Número de registros a omitir
   * @param {number} params.limit - Límite de registros
   * @param {string} params.estado - Estado de la cita (AGENDADA, CONFIRMADA, ATENDIDA, CANCELADA)
   * @param {string} params.mascota_id - ID de la mascota
   * @param {string} params.veterinario_id - ID del veterinario
   * @param {string} params.fecha_desde - Fecha desde (formato ISO)
   * @param {string} params.fecha_hasta - Fecha hasta (formato ISO)
   * @returns {Promise} Lista de citas
   */
  getAllAppointments: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      // Parámetros de paginación
      queryParams.append('skip', (params.skip || 0).toString())
      queryParams.append('limit', (params.limit || 100).toString())

      // Filtros opcionales
      if (params.estado) queryParams.append('estado', params.estado)
      if (params.mascota_id) queryParams.append('mascota_id', params.mascota_id)
      if (params.veterinario_id) queryParams.append('veterinario_id', params.veterinario_id)
      if (params.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde)
      if (params.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta)

      const response = await apiClient.get(`/appointments/?${queryParams}`)
      // response.data contiene: { success: true, message: "...", data: { total, citas: [...] } }
      return response.data
    } catch (error) {
      throw handleAppointmentError(error)
    }
  },

  /**
   * Obtener citas de un veterinario específico
   * @param {string} veterinarioId - ID del veterinario
   * @param {Object} additionalParams - Parámetros adicionales (opcional)
   * @returns {Promise} Lista de citas del veterinario
   */
  getAppointmentsByVeterinarian: async (veterinarioId, additionalParams = {}) => {
    try {
      return await appointmentService.getAllAppointments({
        ...additionalParams,
        veterinario_id: veterinarioId
      })
    } catch (error) {
      throw error
    }
  },

  /**
   * Obtener citas de una mascota específica
   * @param {string} mascotaId - ID de la mascota
   * @param {Object} additionalParams - Parámetros adicionales (opcional)
   * @returns {Promise} Lista de citas de la mascota
   */
  getAppointmentsByPet: async (mascotaId, additionalParams = {}) => {
    try {
      return await appointmentService.getAllAppointments({
        ...additionalParams,
        mascota_id: mascotaId
      })
    } catch (error) {
      throw error
    }
  },

  /**
   * Obtener una cita específica por ID
   * @param {string} appointmentId - ID de la cita
   * @returns {Promise} Datos de la cita
   */
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`)
      return response.data
    } catch (error) {
      throw handleAppointmentError(error)
    }
  },

  /**
   * Crear nueva cita
   * @param {Object} appointmentData - Datos de la cita
   * @returns {Promise} Cita creada
   */
  createAppointment: async (appointmentData) => {
    try {
      const response = await apiClient.post('/appointments/', appointmentData)
      return response.data
    } catch (error) {
      throw handleAppointmentError(error)
    }
  },

  /**
   * Actualizar cita existente
   * @param {string} appointmentId - ID de la cita
   * @param {Object} appointmentData - Datos actualizados
   * @returns {Promise} Cita actualizada
   */
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, appointmentData)
      return response.data
    } catch (error) {
      throw handleAppointmentError(error)
    }
  },

  /**
   * Cancelar cita
   * @param {string} appointmentId - ID de la cita
   * @returns {Promise} Confirmación de cancelación
   */
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await apiClient.delete(`/appointments/${appointmentId}`)
      return response.data
    } catch (error) {
      throw handleAppointmentError(error)
    }
  }
}

/**
 * Manejo de errores del servicio de citas
 * @param {Error} error - Error capturado
 * @returns {Error} Error procesado con mensaje amigable
 */
function handleAppointmentError(error) {
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 400:
        return new Error(data.detail || 'Datos inválidos. Verifica la información de la cita.')
      case 401:
        return new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      case 403:
        return new Error('No tienes permisos para realizar esta acción.')
      case 404:
        return new Error('Cita no encontrada.')
      case 409:
        return new Error('Conflicto de horario. El horario seleccionado no está disponible.')
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

export default appointmentService