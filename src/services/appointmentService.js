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
 * - GET /appointments/date/{fecha} - Obtener citas de una fecha específica
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
   * ✅ NUEVO: Obtener citas de una fecha específica
   * Endpoint: GET /appointments/date/{fecha}
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise} Citas de la fecha especificada
   */
  getAppointmentsByDate: async (fecha) => {
    try {
      console.log(`📅 Solicitando citas para la fecha: ${fecha}`)

      const response = await apiClient.get(`/appointments/date/${fecha}`)

      console.log('✅ Respuesta del backend:', response.data)

      // response.data contiene: { success: true, message: "...", data: { total, citas: [...] } }
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener citas de la fecha ${fecha}:`, error)
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
   * Crear una nueva cita
   * @param {Object} appointmentData - Datos de la cita
   * @returns {Promise} Cita creada
   */
  createAppointment: async (appointmentData) => {
      try {
        console.log('📝 Creando nueva cita:', appointmentData)

        const response = await apiClient.post('/appointments/', appointmentData)

        console.log('✅ Cita creada:', response.data)
        return response.data
      } catch (error) {
        console.error('❌ Error al crear cita:', error)
        throw handleAppointmentError(error)
      }
    },

  /**
   * Actualizar una cita existente
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
   * Cancelar una cita
   * @param {string} appointmentId - ID de la cita
   * @returns {Promise} Confirmación de cancelación
   */
  cancelAppointment: async (appointmentId, motivo_cancelacion) => {
      try {
        console.log(`❌ Cancelando cita ${appointmentId}`)

        const response = await apiClient.delete(`/appointments/${appointmentId}`, {
          params: {
            motivo_cancelacion: motivo_cancelacion
          }
        })

        console.log('✅ Cita cancelada:', response.data)
        return response.data
      } catch (error) {
        console.error(`❌ Error al cancelar cita ${appointmentId}:`, error)
        throw handleAppointmentError(error)
      }
    },

  /**
   * Reprogramar una cita
   * @param {string} appointmentId - ID de la cita
   * @param {string} nuevaFecha - Nueva fecha en formato ISO
   * @returns {Promise} Cita reprogramada
   */
  rescheduleAppointment: async (appointmentId, nuevaFecha) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/reschedule`, {
        fecha_hora: nuevaFecha
      })
      return response.data
    } catch (error) {
      throw handleAppointmentError(error)
    }
  },

  /**
   * Confirmar una cita
   * @param {string} appointmentId - ID de la cita
   * @returns {Promise} Cita confirmada
   */
  confirmAppointment: async (appointmentId) => {
      try {
        console.log(`✅ Confirmando cita ${appointmentId}`)

        const response = await apiClient.post(`/appointments/${appointmentId}/confirm`)

        console.log('✅ Cita confirmada:', response.data)
        return response.data
      } catch (error) {
        console.error(`❌ Error al confirmar cita ${appointmentId}:`, error)
        throw handleAppointmentError(error)
      }
    },

      /**
     * Obtener disponibilidad de un veterinario
     * Endpoint: GET /appointments/availability/{veterinario_id}
     * @param {string} veterinarioId - ID del veterinario
     * @param {Object} params - Parámetros adicionales
     * @param {string} params.fecha_desde - Fecha desde (opcional)
     * @param {string} params.fecha_hasta - Fecha hasta (opcional)
     * @returns {Promise} Disponibilidad del veterinario
     */
    getVeterinarianAvailability: async (veterinarioId, params = {}) => {
      try {
        console.log(`📅 Obteniendo disponibilidad del veterinario ${veterinarioId}`)

        const queryParams = new URLSearchParams()

        if (params.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde)
        if (params.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta)

        const response = await apiClient.get(`/appointments/availability/${veterinarioId}?${queryParams}`)

        console.log('✅ Disponibilidad obtenida:', response.data)
        return response.data
      } catch (error) {
        console.error(`❌ Error al obtener disponibilidad del veterinario ${veterinarioId}:`, error)
        throw handleAppointmentError(error)
      }
    }

}

/**
 * Manejo centralizado de errores de citas
 * @param {Error} error - Error capturado
 * @returns {Error} Error formateado
 */
const handleAppointmentError = (error) => {
  if (error.response) {
    // Error del servidor
    const status = error.response.status
    const detail = error.response.data?.detail

    // 🔍 LOG DETALLADO PARA DEBUG
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
        return new Error('Cita no encontrada.')
      case 422:
        // ✅ MEJORADO: Mostrar detalles de validación
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
    // Error de red
    return new Error('Error de conexión. Verifica tu internet.')
  } else {
    // Otro error
    return new Error(error.message || 'Error desconocido')
  }
}

export default appointmentService