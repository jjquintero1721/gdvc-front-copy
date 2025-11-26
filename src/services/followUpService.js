/**
 * Servicio de Seguimiento de Pacientes - RF-11
 * Permite crear citas de control/seguimiento asociadas a consultas
 *
 * Funcionalidades:
 * - Crear seguimiento (nueva cita vinculada a consulta)
 * - Listar seguimientos de una consulta
 * - Completar seguimiento (registrar consulta de control)
 * - Cancelar seguimiento
 * - Obtener estadísticas
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

class FollowUpService {
  /**
   * Crea un seguimiento para una consulta
   * POST /follow-up/consultas/{consulta_id}/seguimiento
   *
   * Crea una nueva cita vinculada a la consulta original
   * Usado para controles post-operatorios, revisiones, etc.
   */
  async createFollowUp(consultaId, followUpData) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/follow-up/consultas/${consultaId}/seguimiento`,
        followUpData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene todos los seguimientos de una consulta
   * GET /follow-up/consultas/{consulta_id}/seguimientos
   */
  async getConsultationFollowUps(consultaId) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/follow-up/consultas/${consultaId}/seguimientos`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Completa un seguimiento (registra la consulta de control)
   * POST /follow-up/completar
   *
   * Este endpoint crea la consulta de seguimiento y la vincula
   * automáticamente al historial clínico
   */
  async completeFollowUp(completionData) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/follow-up/completar`,
        completionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Cancela un seguimiento
   * DELETE /follow-up/cancelar/{cita_seguimiento_id}
   */
  async cancelFollowUp(citaSeguimientoId) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(
        `${API_URL}/follow-up/cancelar/${citaSeguimientoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene estadísticas de seguimientos
   * GET /follow-up/estadisticas
   */
  async getFollowUpStatistics() {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/follow-up/estadisticas`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Manejo centralizado de errores
   */
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.detail ||
                     error.response.data?.message ||
                     'Error al procesar la solicitud'
      return new Error(message)
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor')
    } else {
      return new Error(error.message || 'Error desconocido')
    }
  }
}

export default new FollowUpService()