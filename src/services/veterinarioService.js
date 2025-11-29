import apiClient from './apiClient'

/**
 * Servicio de Veterinarios
 * Maneja todas las operaciones relacionadas con la gestión de veterinarios
 *
 * NOTA: Los veterinarios son usuarios con rol "veterinario"
 * Por lo tanto, usamos los endpoints de usuarios con filtros
 */
const veterinarioService = {
  /**
   * Obtener todos los veterinarios
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista de veterinarios
   */
  getAllVeterinarios: async (params = {}) => {
    try {
      // Añadir filtro de rol veterinario
      const queryParams = {
        ...params,
        // No filtramos por rol aquí, lo haremos en el frontend
      }

      const response = await apiClient.get('/users', { params: queryParams })

      // Filtrar solo veterinarios
      if (response.data.success && response.data.data.usuarios) {
        const veterinarios = response.data.data.usuarios.filter(
          user => user.rol === 'veterinario'
        )

        return {
          ...response.data,
          data: {
            ...response.data.data,
            usuarios: veterinarios,
            total: veterinarios.length
          }
        }
      }

      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  },

  /**
   * Obtener un veterinario por ID
   * @param {string} veterinarioId - ID del veterinario
   * @returns {Promise} Veterinario
   */
  getVeterinarioById: async (veterinarioId) => {
    try {
      const response = await apiClient.get(`/users/${veterinarioId}`)
      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  },

  /**
   * Crear un nuevo veterinario (solo SUPERADMIN)
   * @param {Object} veterinarioData - Datos del veterinario
   * @returns {Promise} Veterinario creado
   */
  createVeterinario: async (veterinarioData) => {
    try {
      // Asegurar que el rol sea veterinario
      const data = {
        ...veterinarioData,
        rol: 'veterinario'
      }

      const response = await apiClient.post('/auth/register', data)
      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  },

  /**
   * Actualizar un veterinario
   * @param {string} veterinarioId - ID del veterinario
   * @param {Object} veterinarioData - Datos a actualizar
   * @returns {Promise} Veterinario actualizado
   */
  updateVeterinario: async (veterinarioId, veterinarioData) => {
    try {
      const response = await apiClient.put(`/users/${veterinarioId}`, veterinarioData)
      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  },

  /**
   * Activar un veterinario (solo SUPERADMIN)
   * @param {string} veterinarioId - ID del veterinario
   * @returns {Promise} Veterinario actualizado
   */
  activateVeterinario: async (veterinarioId) => {
    try {
      const response = await apiClient.put(`/users/${veterinarioId}`, { activo: true })
      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  },

  /**
   * Desactivar un veterinario (solo SUPERADMIN)
   * @param {string} veterinarioId - ID del veterinario
   * @returns {Promise} Veterinario actualizado
   */
  deactivateVeterinario: async (veterinarioId) => {
    try {
      const response = await apiClient.put(`/users/${veterinarioId}`, { activo: false })
      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  },

  /**
   * Buscar veterinarios por nombre
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise} Veterinarios encontrados
   */
  searchVeterinarios: async (searchTerm) => {
    try {
      const response = await apiClient.get('/users', {
        params: {
          limit: 100 // Obtener más resultados para filtrar localmente
        }
      })

      if (response.data.success && response.data.data.usuarios) {
        const veterinarios = response.data.data.usuarios
          .filter(user => user.rol === 'veterinario')
          .filter(vet =>
            vet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vet.correo.toLowerCase().includes(searchTerm.toLowerCase())
          )

        return {
          ...response.data,
          data: {
            ...response.data.data,
            usuarios: veterinarios,
            total: veterinarios.length
          }
        }
      }

      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  },
  /**
   * Obtener auxiliares de un veterinario
   * @param {string} veterinarioId - ID del veterinario
   * @param {boolean} activo - Filtrar por estado activo
   * @returns {Promise} Lista de auxiliares
   */
  getAuxiliaresByVeterinario: async (veterinarioId, activo = null) => {
    try {
      const params = {}
      if (activo !== null) params.activo = activo

      const response = await apiClient.get(
        `/users/veterinario/${veterinarioId}/auxiliares`,
        { params }
      )
      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  },

  /**
   * Crear auxiliar para un veterinario
   * @param {string} veterinarioId - ID del veterinario
   * @param {Object} auxiliarData - Datos del auxiliar
   * @returns {Promise} Auxiliar creado
   */
  createAuxiliar: async (veterinarioId, auxiliarData) => {
    try {
      const data = {
        ...auxiliarData,
        rol: 'auxiliar',
        veterinario_encargado_id: veterinarioId
      }

      const response = await apiClient.post('/auth/register', data)
      return response.data
    } catch (error) {
      throw handleVeterinarioError(error)
    }
  }
}


/**
 * Manejo de errores específicos para veterinarios
 * @param {Error} error - Error capturado
 * @returns {Error} Error formateado
 */
const handleVeterinarioError = (error) => {
  // Si es un error de axios con respuesta del servidor
  if (error.response) {
    const { status, data } = error.response

    // Mapeo de códigos de estado a mensajes amigables
    const errorMessages = {
      400: data?.message || 'Datos inválidos. Por favor verifica la información.',
      401: 'No tienes autorización. Por favor inicia sesión nuevamente.',
      403: 'No tienes permisos para realizar esta acción.',
      404: 'Veterinario no encontrado.',
      409: data?.message || 'Ya existe un veterinario con ese correo electrónico.',
      500: 'Error en el servidor. Por favor intenta más tarde.'
    }

    const message = errorMessages[status] || data?.message || 'Error al procesar la solicitud'

    const formattedError = new Error(message)
    formattedError.status = status
    formattedError.originalError = error
    return formattedError
  }

  // Error de red o sin respuesta
  if (error.request) {
    const networkError = new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
    networkError.isNetworkError = true
    networkError.originalError = error
    return networkError
  }

  // Otro tipo de error
  return error
}

export default veterinarioService