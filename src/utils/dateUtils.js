/**
 * Utilidades para manejo de fechas
 *
 * Funciones para formatear, calcular y manipular fechas
 */

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * Retorna un string legible (ej: "3 años", "6 meses", "2 semanas")
 *
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @returns {string} Edad en formato legible
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 'N/A'

  const birth = new Date(birthDate)
  const today = new Date()

  // Calcular diferencia en milisegundos
  const diffMs = today - birth
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Si es menor a 60 días, mostrar en semanas
  if (diffDays < 60) {
    const weeks = Math.floor(diffDays / 7)
    if (weeks === 0) {
      return `${diffDays} día${diffDays !== 1 ? 's' : ''}`
    }
    return `${weeks} semana${weeks !== 1 ? 's' : ''}`
  }

  // Si es menor a 2 años, mostrar en meses
  if (diffDays < 730) {
    const months = Math.floor(diffDays / 30)
    return `${months} mes${months !== 1 ? 'es' : ''}`
  }

  // Mostrar en años
  const years = Math.floor(diffDays / 365)
  return `${years} año${years !== 1 ? 's' : ''}`
}

/**
 * Calcula la edad exacta en años, meses y días
 *
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @returns {Object} Objeto con años, meses y días
 */
export const calculateExactAge = (birthDate) => {
  if (!birthDate) return { years: 0, months: 0, days: 0 }

  const birth = new Date(birthDate)
  const today = new Date()

  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  let days = today.getDate() - birth.getDate()

  if (days < 0) {
    months--
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  return { years, months, days }
}

/**
 * Formatea una fecha a formato legible en español
 *
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'medium', 'long')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return 'N/A'

  const d = new Date(date)

  if (isNaN(d.getTime())) return 'Fecha inválida'

  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  }

  return d.toLocaleDateString('es-ES', options[format])
}

/**
 * Formatea una fecha y hora
 *
 * @param {string|Date} datetime - Fecha y hora a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return 'N/A'

  const d = new Date(datetime)

  if (isNaN(d.getTime())) return 'Fecha inválida'

  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD)
 *
 * @returns {string} Fecha actual
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Verifica si una fecha es futura
 *
 * @param {string|Date} date - Fecha a verificar
 * @returns {boolean} True si la fecha es futura
 */
export const isFutureDate = (date) => {
  if (!date) return false
  return new Date(date) > new Date()
}

/**
 * Verifica si una fecha es pasada
 *
 * @param {string|Date} date - Fecha a verificar
 * @returns {boolean} True si la fecha es pasada
 */
export const isPastDate = (date) => {
  if (!date) return false
  return new Date(date) < new Date()
}

/**
 * Calcula la diferencia en días entre dos fechas
 *
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
export const daysDifference = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffMs = Math.abs(d2 - d1)
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}