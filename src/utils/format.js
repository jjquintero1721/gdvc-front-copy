/**
 * Utilidades de Formateo
 * Funciones helper para formatear datos
 */

/**
 * Formatea un número de teléfono colombiano
 * Ejemplo: 3001234567 -> (300) 123-4567
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

/**
 * Formatea una cédula
 * Ejemplo: 1234567890 -> 1.234.567.890
 */
export const formatCedula = (cedula) => {
  if (!cedula) return ''
  return cedula.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Formatea un nombre propio (primera letra en mayúscula)
 */
export const formatName = (name) => {
  if (!name) return ''
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Formatea una fecha
 * Ejemplo: 2024-01-15T10:30:00 -> 15/01/2024
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return ''

  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  return `${day}/${month}/${year}`
}

/**
 * Trunca un texto y agrega puntos suspensivos
 */
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Capitaliza la primera letra de un string
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Formatea un valor monetario en pesos colombianos
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}