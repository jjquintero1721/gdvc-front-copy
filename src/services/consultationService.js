/**
 * Servicio de Consultas - RF-07
 * Gestión de historias clínicas y consultas veterinarias
 *
 * Funcionalidades:
 * - Crear consultas
 * - Obtener consulta por ID
 * - Actualizar consultas (genera nueva versión)
 * - Obtener historial de versiones
 * - Restaurar versión anterior (Memento Pattern)
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

class ConsultationService {
  /**
   * Crea una nueva consulta
   * POST /medical-history/consultas
   */
  async createConsultation(consultationData) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/medical-history/consultas`,
        consultationData,
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
   * Obtiene una consulta por ID
   * GET /medical-history/consultas/{consultation_id}
   */
  async getConsultation(consultationId) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/medical-history/consultas/${consultationId}`,
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
   * Actualiza una consulta existente
   * PUT /medical-history/consultas/{consultation_id}
   *
   * Implementa Memento Pattern: Cada actualización genera una nueva versión
   */
  async updateConsultation(consultationId, consultationData) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${API_URL}/medical-history/consultas/${consultationId}`,
        consultationData,
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
   * Obtiene el historial de versiones de una consulta
   * GET /medical-history/consultas/{consultation_id}/historial
   *
   * Retorna todas las versiones guardadas (Memento Pattern)
   */
  async getConsultationHistory(consultationId) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/medical-history/consultas/${consultationId}/historial`,
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
   * Restaura una versión anterior de la consulta
   * POST /medical-history/consultas/{consultation_id}/restaurar/{version}
   *
   * Memento Pattern: Permite revertir cambios
   */
  async restoreConsultationVersion(consultationId, version) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/medical-history/consultas/${consultationId}/restaurar/${version}`,
        {},
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

export default new ConsultationService()