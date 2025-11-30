import apiClient from './apiClient'

/**
 * Servicio de Decoradores de Citas
 *
 * - Devuelve el `response` de axios (no sólo response.data) para mantener compatibilidad
 *   con el resto del código que espera response.data.decoradores
 * - getOwnerDecorators filtra de forma segura sin romper (no usar sintaxis inválida)
 */
class DecoratorService {
  async addRecordatorio(appointmentId, recordatorioData) {
    try {
      const response = await apiClient.post(
        `/appointments/${appointmentId}/decoradores/recordatorio`,
        recordatorioData
      )
      return response
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async addNotas(appointmentId, notasData) {
    try {
      const response = await apiClient.post(
        `/appointments/${appointmentId}/decoradores/notas`,
        notasData
      )
      return response
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async addPrioridad(appointmentId, prioridadData) {
    try {
      const response = await apiClient.post(
        `/appointments/${appointmentId}/decoradores/prioridad`,
        prioridadData
      )
      return response
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener todos los decoradores de una cita
   * Retorna el response (axios)
   */
  async getDecorators(appointmentId) {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}/decoradores`)
      // retorno: axios response (response.data probablemente contiene { message, data } o { decoradores })
      return response
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Eliminar un decorador por id
   */
  async removeDecorator(appointmentId, decoratorId) {
    try {
      const response = await apiClient.delete(
        `/appointments/${appointmentId}/decoradores/${decoratorId}`
      )
      return response
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Obtener solo los decoradores de tipo NOTAS_ESPECIALES (para propietarios)
   * Devuelve un objeto con la misma forma de un axios response: { data: { decoradores: [...] , ... } }
   */
  async getOwnerDecorators(appointmentId) {
    try {
      const response = await this.getDecorators(appointmentId)
      // extraer decoradores desde response.data (compatibilidad)
      const allDecorators = response?.data?.decoradores ?? response?.data?.data?.decoradores ?? []
      const filtered = allDecorators.filter(d => {
        const tipo = (d.tipo_decorador || d.tipo || '').toString().toLowerCase()
        return tipo === 'notas_especiales' || tipo === 'notas'
      })

      // construir un objeto similar a axios response
      return {
        ...response,
        data: {
          ...(response.data || {}),
          decoradores: filtered
        }
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Normalizar errores
  handleError(error) {
    if (error?.response) {
      const msg = error.response.data?.detail || error.response.data?.message || 'Error en la petición de decoradores'
      const e = new Error(msg)
      e.original = error
      return e
    }
    if (error?.request) {
      return new Error('Error de conexión con el servidor')
    }
    return error
  }
}

export default new DecoratorService()
