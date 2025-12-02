import apiClient from './apiClient'

/**
 * Servicio de Autenticación
 * Maneja todas las operaciones relacionadas con login, registro y gestión de contraseñas
 *
 * IMPORTANTE: Estructura de respuesta del backend
 * ============================================
 * El backend envuelve todas las respuestas en success_response:
 * {
 *   "success": true,          // ← booleano, no string
 *   "message": "Mensaje descriptivo",
 *   "data": { ... datos reales ... }
 * }
 *
 * Por lo tanto, con axios:
 * - response.data.success → true/false (booleano)
 * - response.data.data → objeto con los datos reales
 * - response.data.message → mensaje descriptivo
 */
const authService = {
  /**
   * Login de usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise} Estructura: { success: true, message: "...", data: { access_token, token_type, usuario } }
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        correo: email,
        contrasena: password
      })
      const  payload = response.data
      if (payload && payload.success === false) {
        const err = new Error(payload.message || 'Credenciales inválidas')
        err.status = response.status
        err.payload = payload
        throw err
      }

      // response.data contiene: { success: true, message: "...", data: { access_token, token_type, usuario } }
      return payload
    } catch (error) {

      if (error?.response){
          const { status, data } = error.response

          const backendMessage = data?.message || (data && data.success === false && data.message) || null
            // Error de validación que podría estar en data.data o data.errors
            let validation = null
            if (data?.data && typeof data.data === 'object') {
              validation = data.data
            } else if (data?.errors) {
              validation = data.errors
            } else if (Array.isArray(data?.detail)) {
              validation = data.detail
            }

            const err = new Error(
              backendMessage ||
              (status === 401 ? 'Credenciales inválidas. Verifica tu correo y contraseña.' :
                status === 422 ? 'Errores de validación. Revisa los campos.' :
                status === 429 ? 'Cuenta bloqueada temporalmente por intentos fallidos.' :  // ✅ AGREGADO
                'Ocurrió un error en el servidor.')
            )
            err.status = status
            if (validation) err.validation = validation
            err.responseData = data
            throw err
          }

          // Si no hubo response pero sí request => problema de red
          if (error?.request) {
            const err = new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
            err.isNetworkError = true
            throw err
          }

          // Otro tipo de error inesperado
          const err = new Error(error?.message || 'Contraseña o correo inválidos.')
          throw err
        }
  },

  /**
   * Registro de nuevo usuario (propietario)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} Estructura: { success: true, message: "...", data: { usuario } }
   */
  register: async (userData) => {
    try {
      // Transformar los datos al formato esperado por el backend
      const backendData = {
        nombre: userData.nombre || userData.full_name,
        correo: userData.email || userData.correo,
        telefono: userData.phone || userData.telefono,
        contrasena: userData.password || userData.contrasena,
        rol: userData.rol || 'propietario',  // Por defecto propietario
        documento: userData.cedula || userData.documento
      }

      const response = await apiClient.post('/auth/register', backendData)

      // response.data contiene: { success: true, message: "...", data: { usuario } }
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  },

  /**
   * ✅ CORREGIDO: Cambiar contraseña del usuario autenticado
   *
   * @param {string} userId - ID del usuario (UUID)
   * @param {string} oldPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise} Confirmación del cambio
   *
   * Endpoint: POST /api/v1/users/{userId}/change-password
   * Body: { contrasena_actual: string, contrasena_nueva: string }
   */
  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      const response = await apiClient.post(`/users/${userId}/change-password`, {
        contrasena_actual: oldPassword,    // ✅ Nombre correcto según backend
        contrasena_nueva: newPassword      // ✅ Nombre correcto según backend
      })
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  },

  resetPassword: async (email, newPassword, confirmPassword) => {
      try {
        const response = await apiClient.post('/auth/reset-password', {
          correo: email,
          nueva_contrasena: newPassword,
          confirmar: confirmPassword
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.detail || "Error al restablecer la contraseña");
      }
    },



  /**
   * Cerrar sesión
   * @returns {Promise} Confirmación de logout
   */
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  },

  /**
   * Validar token actual
   * @returns {Promise} Usuario actual
   */
  validateToken: async () => {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data
    } catch (error) {
      throw handleAuthError(error)
    }
  }
}

/**
 * Manejador de errores del servicio de autenticación
 * @param {Error} error - Error de axios
 * @returns {Error} Error formateado
 */
function handleAuthError(error) {
  if (error.response) {
    const { status, data } = error.response
    const errorMessage = data.detail || data.message || 'Error desconocido'

    switch (status) {
      case 400:
        return new Error(errorMessage || 'Datos inválidos')
      case 401:
        return new Error('Credenciales inválidas. Verifica tu correo y contraseña.')
      case 403:
        return new Error(errorMessage || 'No tienes permisos para realizar esta acción')
      case 404:
        return new Error('Usuario no encontrado')
      case 409:
        return new Error(errorMessage || 'El correo ya está registrado')
      case 422:
        // Manejo especial de errores de validación de Pydantic
        if (data.detail && Array.isArray(data.detail)) {
          const messages = data.detail.map(err => err.msg).join(', ')
          return new Error(`Errores de validación: ${messages}`)
        }
        return new Error(errorMessage || 'Error de validación. Verifica los datos ingresados.')
      case 429:
        return new Error(errorMessage || 'Cuenta bloqueada temporalmente. Intenta más tarde.')
      case 500:
        return new Error('Error interno del servidor. Por favor, intenta más tarde.')
      default:
        return new Error(errorMessage)
    }
  } else if (error.request) {
    return new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
  } else {
    return new Error(error.message || 'Error al procesar la solicitud')
  }
}

export default authService