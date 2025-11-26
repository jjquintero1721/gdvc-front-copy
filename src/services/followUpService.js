/**
 * Servicio de Seguimiento de Pacientes - RF-11
 * Permite crear citas de control/seguimiento asociadas a consultas
 *
 * ✅ CORRECCIÓN APLICADA:
 * Ahora usa apiClient (con /api/v1/ incluido) en lugar de axios directo
 *
 * Funcionalidades:
 * - Crear seguimiento (nueva cita vinculada a consulta)
 * - Listar seguimientos de una consulta
 * - Completar seguimiento (registrar consulta de control)
 * - Cancelar seguimiento
 * - Obtener estadísticas
 */

import apiClient from './apiClient'

class FollowUpService {
  /**
   * Crea un seguimiento para una consulta
   * POST /api/v1/follow-up/consultas/{consulta_id}/seguimiento
   *
   * Crea una nueva cita vinculada a la consulta original
   * Usado para controles post-operatorios, revisiones, etc.
   */
  async createFollowUp(consultaId, followUpData) {
    try {
      console.log(`📅 Creando seguimiento para consulta ${consultaId}:`, followUpData)

      // ✅ CORREGIDO: Usa apiClient que ya incluye /api/v1/
      const response = await apiClient.post(
        `/follow-up/consultas/${consultaId}/seguimiento`,
        followUpData
      )

      console.log('✅ Seguimiento creado:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al crear seguimiento:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene todos los seguimientos de una consulta
   * GET /api/v1/follow-up/consultas/{consulta_id}/seguimientos
   */
  async getConsultationFollowUps(consultaId) {
    try {
      console.log(`🔍 Obteniendo seguimientos de consulta ${consultaId}`)

      const response = await apiClient.get(
        `/follow-up/consultas/${consultaId}/seguimientos`
      )

      console.log('✅ Seguimientos obtenidos:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener seguimientos:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Completa un seguimiento (registra la consulta de control)
   * POST /api/v1/follow-up/completar
   *
   * Este endpoint crea la consulta de seguimiento y la vincula
   * automáticamente al historial clínico
   */
  async completeFollowUp(completionData) {
    try {
      console.log('📝 Completando seguimiento:', completionData)

      const response = await apiClient.post(
        '/follow-up/completar',
        completionData
      )

      console.log('✅ Seguimiento completado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al completar seguimiento:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Cancela un seguimiento
   * DELETE /api/v1/follow-up/cancelar/{cita_seguimiento_id}
   */
  async cancelFollowUp(citaSeguimientoId) {
    try {
      console.log(`❌ Cancelando seguimiento ${citaSeguimientoId}`)

      const response = await apiClient.delete(
        `/follow-up/cancelar/${citaSeguimientoId}`
      )

      console.log('✅ Seguimiento cancelado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al cancelar seguimiento:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene estadísticas de seguimientos
   * GET /api/v1/follow-up/estadisticas
   */
  async getFollowUpStatistics(params = {}) {
    try {
      console.log('📊 Obteniendo estadísticas de seguimientos')

      const response = await apiClient.get('/follow-up/estadisticas', {
        params
      })

      console.log('✅ Estadísticas obtenidas:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Manejo centralizado de errores
   */
  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.detail ||
                     error.response.data?.message ||
                     'Error al procesar la solicitud'
      return new Error(message)
    } else if (error.request) {
      // Error de red
      return new Error('No se pudo conectar con el servidor')
    } else {
      // Error desconocido
      return new Error(error.message || 'Error desconocido')
    }
  }
}

export default new FollowUpService()