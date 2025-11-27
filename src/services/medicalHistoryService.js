import apiClient from './apiClient'

/**
 * Servicio de Historias Clínicas - RF-07
 * Gestión de visualización de historias clínicas por mascota
 *
 * Endpoints disponibles:
 * - GET /api/v1/medical-history/historias/{historia_id}
 * - GET /api/v1/medical-history/mascotas/{mascota_id}/historia
 * - GET /api/v1/medical-history/historias/{historia_id}/consultas
 */
class MedicalHistoryService {
  /**
   * Obtiene la historia clínica completa por ID
   * GET /api/v1/medical-history/historias/{historia_id}
   *
   * @param {string} historiaId - ID de la historia clínica
   * @param {boolean} includeConsultas - Incluir consultas (default: true)
   * @returns {Promise} Historia clínica completa
   */
  async getMedicalHistoryById(historiaId, includeConsultas = true) {
    try {
      console.log(`📋 Obteniendo historia clínica ${historiaId}`)

      const response = await apiClient.get(
        `/medical-history/historias/${historiaId}`,
        { params: { include_consultas: includeConsultas } }
      )

      console.log('✅ Historia clínica obtenida:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener historia clínica:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene la historia clínica de una mascota específica
   * GET /api/v1/medical-history/mascotas/{mascota_id}/historia
   *
   * @param {string} mascotaId - ID de la mascota
   * @param {boolean} includeConsultas - Incluir consultas (default: true)
   * @returns {Promise} Historia clínica de la mascota
   */
  async getMedicalHistoryByPet(mascotaId, includeConsultas = true) {
    try {
      console.log(`📋 Obteniendo historia clínica de mascota ${mascotaId}`)

      const response = await apiClient.get(
        `/medical-history/mascotas/${mascotaId}/historia`,
        { params: { include_consultas: includeConsultas } }
      )

      console.log('✅ Historia clínica obtenida:', response.data)
      return response.data
    } catch (error) {
      console.error(`❌ Error al obtener historia clínica de mascota:`, error)
      throw this.handleError(error)
    }
  }

  /**
   * Obtiene todas las consultas de una historia clínica
   * GET /api/v1/medical-history/historias/{historia_id}/consultas
   *
   * @param {string} historiaId - ID de la historia clínica
   * @param {Object} params - Parámetros de filtrado (página, límite, etc.)
   * @returns {Promise} Lista de consultas
   */
  async getConsultationsByHistory(historiaId, params = {}) {
    try {
      console.log(`📋 Obteniendo consultas de historia ${historiaId}`)

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
      const errorMessage = error.response.data?.detail ||
                          error.response.data?.message ||
                          'Error en el servidor'

      return {
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      }
    } else if (error.request) {
      return {
        message: 'No se pudo conectar con el servidor',
        status: 0
      }
    } else {
      return {
        message: error.message || 'Error desconocido',
        status: -1
      }
    }
  }
}

// Exportar instancia única del servicio
const medicalHistoryService = new MedicalHistoryService()
export default medicalHistoryService