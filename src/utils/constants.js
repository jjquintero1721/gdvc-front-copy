/**
 * Constantes de la Aplicación
 */

// Información de la aplicación
export const APP_NAME = 'GDCV - Gestión de Clínica Veterinaria'
export const APP_VERSION = '1.0.0'

// URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Claves de almacenamiento local
export const STORAGE_KEYS = {
  TOKEN: import.meta.env.VITE_TOKEN_KEY || 'gdcv_access_token',
  REFRESH_TOKEN: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'gdcv_refresh_token',
  USER: import.meta.env.VITE_USER_KEY || 'gdcv_user',
}

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK: 'Error de conexión. Por favor, verifica tu internet.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
  VALIDATION: 'Por favor, revisa los datos ingresados.',
}

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  VETERINARIO: 'veterinario',
  PROPIETARIO: 'propietario',
}

// Estados de citas (para futuras implementaciones)
export const APPOINTMENT_STATUS = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmada',
  COMPLETED: 'completada',
  CANCELLED: 'cancelada',
}

// Tipos de mascotas (para futuras implementaciones)
export const PET_TYPES = {
  DOG: 'perro',
  CAT: 'gato',
  BIRD: 'ave',
  RABBIT: 'conejo',
  OTHER: 'otro',
}

// Configuración de validación
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_LENGTH: 10,
  CEDULA_MIN_LENGTH: 7,
  CEDULA_MAX_LENGTH: 11,
  NAME_MIN_LENGTH: 3,
}

// Tiempos de timeout
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 segundos
  REDIRECT: 2000, // 2 segundos
  TOAST: 5000, // 5 segundos
}

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/registro',
  CHANGE_PASSWORD: '/cambiar-contrasena',
  DASHBOARD: '/dashboard',
  PETS: '/dashboard/mascotas',
  APPOINTMENTS: '/dashboard/citas',
  MEDICAL_HISTORY: '/dashboard/historial',
  PRODUCTS: '/dashboard/productos',
  INVOICES: '/dashboard/facturas',
}