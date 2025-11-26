/**
 * Servicio de Consultas - RF-07
 * Gestión de historias clínicas y consultas veterinarias
 *
 * ✅ CORRECCIÓN APLICADA:
 * Ahora usa apiClient (con /api/v1/ incluido) en lugar de axios directo
 *
 * Funcionalidades:
 * - Crear consultas
 * - Obtener consulta por ID
 * - Actualizar consultas (genera nueva versión)
 * - Obtener historial de versiones
 * - Restaurar versión anterior (Memento Pattern)
 */

import apiClient from './apiClient'

class ConsultationService {
  /**
   * Crea una nueva consulta
   * POST /api/v1/medical-history/consultas
   */
  async createConsultation(consultationData) {
    try {
      console.log('📝 Creando consulta:', consultationData)

      // ✅ CORREGIDO: Usa apiClient que ya incluye /api/v1/
      const response = await apiClient.post(
        '/medical-history/consultas',
        consultationData
      )

      console.log('✅ Consulta creada exitosamente:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al crear consulta:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene una consulta por ID
   * GET /api/v1/medical-history/consultas/{consultation_id}
   */
  async getConsultation(consultationId) {
    try {
      console.log(`🔍 Obteniendo consulta ${consultationId}`)

      const response = await apiClient.get(
        `/medical-history/consultas/${consultationId}`
      )

      console.log('✅ Consulta obtenida:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener consulta ${consultationId}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Actualiza una consulta existente
   * PUT /api/v1/medical-history/consultas/{consultation_id}
   *
   * Implementa Memento Pattern: Cada actualización genera una nueva versión
   */
  async updateConsultation(consultationId, consultationData) {
    try {
      console.log(`📝 Actualizando consulta ${consultationId}:`, consultationData)

      const response = await apiClient.put(
        `/medical-history/consultas/${consultationId}`,
        consultationData
      )

      console.log('✅ Consulta actualizada:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al actualizar consulta ${consultationId}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene el historial de versiones de una consulta
   * GET /api/v1/medical-history/consultas/{consultation_id}/historial
   *
   * Retorna todas las versiones guardadas (Memento Pattern)
   */
  async getConsultationHistory(consultationId) {
    try {
      console.log(`📜 Obteniendo historial de consulta ${consultationId}`)

      const response = await apiClient.get(
        `/medical-history/consultas/${consultationId}/historial`
      )

      console.log('✅ Historial obtenido:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener historial de consulta ${consultationId}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Restaura una versión anterior de la consulta
   * POST /api/v1/medical-history/consultas/{consultation_id}/restaurar/{version}
   *
   * Memento Pattern: Permite revertir cambios
   */
  async restoreConsultationVersion(consultationId, version) {
    try {
      console.log(`⏮️ Restaurando consulta ${consultationId} a versión ${version}`)

      const response = await apiClient.post(
        `/medical-history/consultas/${consultationId}/restaurar/${version}`,
        {}
      )

      console.log('✅ Versión restaurada:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al restaurar versión ${version}:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * ✅ NUEVO: Obtiene la consulta asociada a una cita
   * GET /api/v1/medical-history/consultas/cita/{cita_id}
   */
  async getConsultationByAppointmentId(citaId) {
    try {
      console.log(`🔍 Buscando consulta para cita ${citaId}`)

      const response = await apiClient.get(
        `/medical-history/consultas/cita/${citaId}`
      )

      console.log('✅ Consulta encontrada:', response.data)
      return response.data
    } catch (error) {
      // Si no existe, retornar null en lugar de error
      if (error.response?.status === 404) {
        console.log('ℹ️ No se encontró consulta para esta cita')
        return null
      }
      console.error(`❌ Error al buscar consulta para cita ${citaId}:`, error)
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