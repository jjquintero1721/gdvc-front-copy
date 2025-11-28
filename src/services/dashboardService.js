/**
 * Servicio de Dashboard
 * Obtiene estadísticas según el rol del usuario
 */

import apiClient from './apiClient'

const dashboardService = {
  /**
   * Obtiene estadísticas del dashboard según el rol del usuario autenticado
   *
   * @returns {Promise} Estadísticas del dashboard
   *
   * Estructura de respuesta:
   * - Para staff (superadmin, veterinario, auxiliar):
   *   {
   *     rol: "superadmin",
   *     stats: {
   *       citasDelDia: number,
   *       citasProgramadas: number,
   *       stockBajo: number,
   *       notificaciones: number,
   *       citasDetalle: Array,
   *       alertasStock: Array
   *     }
   *   }
   *
   * - Para propietario:
   *   {
   *     rol: "propietario",
   *     stats: {
   *       propietario: {...},
   *       mascotas: Array,
   *       mascotaSaludo: {...},
   *       proximasCitas: Array
   *     }
   *   }
   */
  getStats: async () => {
    try {
      console.log('📊 Solicitando estadísticas del dashboard...')

      const response = await apiClient.get('/dashboard/stats')

      console.log('✅ Estadísticas obtenidas:', response.data)

      // El backend devuelve: { success: true, data: {...}, message: "..." }
      return response.data.data

    } catch (error) {
      console.error('❌ Error al obtener estadísticas del dashboard:', error)

      // Manejo de errores específicos
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
          'Error al obtener estadísticas del dashboard'
        )
      }

      throw new Error('Error de conexión al obtener estadísticas')
    }
  }
}

export default dashboardService