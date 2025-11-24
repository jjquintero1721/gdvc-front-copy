/**
 * Utilidades de Validación
 * Funciones helper para validar diferentes tipos de datos
 */

/**
 * Valida un email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida una cédula colombiana
 */
export const isValidCedula = (cedula) => {
  const cedulaRegex = /^\d{7,11}$/
  return cedulaRegex.test(cedula)
}

/**
 * Valida un teléfono colombiano
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^3\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * Valida fortaleza de contraseña
 * Mínimo 8 caracteres, al menos un número y un símbolo
 */
export const isStrongPassword = (password) => {
  if (password.length < 8) return false
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  return hasNumber && hasSymbol
}

/**
 * Obtiene el nivel de fortaleza de una contraseña
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0

  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return Math.min(strength, 5)
}

/**
 * Valida que un campo no esté vacío
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

/**
 * Valida longitud mínima
 */
export const minLength = (value, min) => {
  if (typeof value === 'string') {
    return value.trim().length >= min
  }
  return false
}

/**
 * Valida longitud máxima
 */
export const maxLength = (value, max) => {
  if (typeof value === 'string') {
    return value.trim().length <= max
  }
  return false
}