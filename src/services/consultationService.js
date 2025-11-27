import apiClient from './apiClient'

/**
 * Servicio de Consultas Médicas - RF-07
 * Gestión completa de consultas veterinarias con patrón Memento
 *
 * Endpoints disponibles:
 * - POST /api/v1/medical-history/consultas
 * - GET /api/v1/medical-history/consultas/{consultation_id}
 * - PUT /api/v1/medical-history/consultas/{consultation_id}
 * - GET /api/v1/medical-history/consultas/{consultation_id}/historial
 * - POST /api/v1/medical-history/consultas/{consultation_id}/restaurar/{version}
 * - GET /api/v1/medical-history/historias/{historia_id}
 * - GET /api/v1/medical-history/mascotas/{mascota_id}/historia
 * - GET /api/v1/medical-history/historias/{historia_id}/consultas
 */
class ConsultationService {
  /**
   * Crea una nueva consulta
   * POST /api/v1/medical-history/consultas
   *
   * Builder Pattern: Construye la consulta paso a paso
   * Memento Pattern: Crea snapshot inicial automáticamente
   */
  async createConsultation(consultationData) {
    try {
      console.log('📝 Creando nueva consulta:', consultationData)

      const response = await apiClient.post(
        '/medical-history/consultas',
        consultationData
      )

      console.log('✅ Consulta creada:', response.data)
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
  async getConsultationById(consultationId) {
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
   * Obtiene la consulta asociada a una cita específica
   * Esta función busca en las consultas de la historia clínica de la mascota
   * la consulta que está vinculada a la cita indicada
   * 
   * @param {string} appointmentId - ID de la cita
   * @returns {Promise} Consulta asociada a la cita
   */
  async getConsultationByAppointment(appointmentId) {
      try {
        console.log(`🔍 Buscando consulta para la cita ${appointmentId}`)

        const response = await apiClient.get(
          `/medical-history/citas/${appointmentId}/consulta`
        )

        console.log('✅ Consulta encontrada para la cita:', response.data)
        return response.data
      } catch (error) {
        // Si hay un error 404, es NORMAL y ESPERADO
        // Significa que la cita aún no tiene una consulta creada
        if (error.response?.status === 404) {
          console.log('ℹ️ No existe consulta para esta cita (aún no creada)')
          return {
            success: false,
            data: null,
            message: 'Consulta no encontrada para esta cita'
          }
        }

        // Para otros errores, propagar la excepción
        console.error(`❌ Error al buscar consulta por cita:`, error)
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
        `/medical-history/consultas/${consultationId}/restaurar/${version}`
      )

      console.log('✅ Versión restaurada:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al restaurar versión:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene la historia clínica por ID
   * GET /api/v1/medical-history/historias/{historia_id}
   */
  async getMedicalHistoryById(historiaId) {
    try {
      console.log(`🔍 Obteniendo historia clínica ${historiaId}`)

      const response = await apiClient.get(
        `/medical-history/historias/${historiaId}`
      )

      console.log('✅ Historia clínica obtenida:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener historia clínica:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene la historia clínica de una mascota
   * GET /api/v1/medical-history/mascotas/{mascota_id}/historia
   */
  async getMedicalHistoryByPet(mascotaId) {
    try {
      console.log(`🔍 Obteniendo historia clínica de mascota ${mascotaId}`)

      const response = await apiClient.get(
        `/medical-history/mascotas/${mascotaId}/historia`
      )

      console.log('✅ Historia clínica obtenida:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener historia clínica:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene todas las consultas de una historia clínica
   * GET /api/v1/medical-history/historias/{historia_id}/consultas
   */
  async getConsultationsByHistory(historiaId, params = {}) {
    try {
      console.log(`🔍 Obteniendo consultas de historia ${historiaId}`)

      const response = await apiClient.get(
        `/medical-history/historias/${historiaId}/consultas`,
        { params }
      )

      console.log('✅ Consultas obtenidas:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener consultas:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Manejo centralizado de errores
   */
  handleError(error) {
    if (error.response) {
      // El servidor respondió con un código de error
      const errorMessage = error.response.data?.detail || 
                          error.response.data?.message || 
                          'Error en el servidor'
      
      return {
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return {
        message: 'No se pudo conectar con el servidor',
        status: 0
      }
    } else {
      // Error al configurar la petición
      return {
        message: error.message || 'Error desconocido',
        status: -1
      }
    }
  }
}

// Exportar instancia única del servicio
const consultationService = new ConsultationService()
export default consultationService