/**
 * Service - Exportación de historias clínicas
 * RNF-06: Interoperabilidad - Exportar información en formatos estándar
 */

import api from '@/services/apiClient.js'

/**
 * Exporta una historia clínica en formato PDF o CSV
 *
 * @param {string} historiaClinicaId - ID de la historia clínica
 * @param {string} formato - 'pdf' o 'csv'
 * @returns {Promise<void>} - Descarga automática del archivo
 */
export const exportarHistoriaClinica = async (historiaClinicaId, formato) => {
  try {
    const response = await api.post(
      `/export/historias-clinicas/${historiaClinicaId}`,
      { formato },
      {
        responseType: 'blob',
        headers: {
          'Accept': formato === 'pdf' ? 'application/pdf' : 'text/csv'
        }
      }
    )

    // Extraer nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers['content-disposition']
    let filename = `historia_clinica.${formato}`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1]
      }
    }

    // Crear blob y descargar
    const blob = new Blob([response.data], {
      type: formato === 'pdf' ? 'application/pdf' : 'text/csv'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, filename }
  } catch (error) {
    console.error('Error al exportar historia clínica:', error)

    let errorMessage = 'Error al exportar la historia clínica'

    if (error.response?.status === 403) {
      errorMessage = 'No tienes permisos para exportar esta historia clínica'
    } else if (error.response?.status === 404) {
      errorMessage = 'Historia clínica no encontrada'
    } else if (error.response?.status === 400) {
      errorMessage = 'Formato de exportación no válido'
    } else if (error.response?.data) {
      try {
        const blob = error.response.data
        const text = await blob.text()
        const json = JSON.parse(text)
        errorMessage = json.detail || errorMessage
      } catch (e) {
        // Si no se puede parsear, usar mensaje por defecto
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * Obtiene los formatos de exportación disponibles
 *
 * @returns {Promise<Array>} - Lista de formatos disponibles
 */
export const obtenerFormatosDisponibles = async () => {
  try {
    const response = await api.get('/exportacion/formatos')
    return response.data.formatos_disponibles
  } catch (error) {
    console.error('Error al obtener formatos de exportación:', error)
    throw error
  }
}