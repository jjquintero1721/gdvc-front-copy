import apiClient from './apiClient'

/**
 * Servicio para endpoints del usuario autenticado (/me)
 */
const userMeService = {
  /**
   * Obtener auxiliares del veterinario autenticado
   * @returns {Promise} Lista de auxiliares
   */
  getMyAuxiliares: async (activo = null) => {
    try {
      const params = {}
      if (activo !== null) params.activo = activo

      const response = await apiClient.get('/users/me/auxiliares', { params })
      return response.data
    } catch (error) {
      throw handleError(error)
    }
  },

  /**
   * Obtener veterinario encargado del auxiliar autenticado
   * @returns {Promise} Veterinario encargado
   */
  getMyVeterinario: async () => {
    try {
      const response = await apiClient.get('/users/me/veterinario-encargado')
      return response.data
    } catch (error) {
      throw handleError(error)
    }
  }
}

const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response

    const errorMessages = {
      400: data?.message || 'Solicitud inválida.',
      401: 'No tienes autorización. Por favor inicia sesión nuevamente.',
      403: data?.message || 'No tienes permisos para realizar esta acción.',
      404: data?.message || 'Información no encontrada.',
      500: 'Error en el servidor. Por favor intenta más tarde.'
    }

    const message = errorMessages[status] || data?.message || 'Error al procesar la solicitud'

    const formattedError = new Error(message)
    formattedError.status = status
    formattedError.originalError = error
    return formattedError
  }

  if (error.request) {
    const networkError = new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
    networkError.isNetworkError = true
    networkError.originalError = error
    return networkError
  }

  return error
}

export default userMeService