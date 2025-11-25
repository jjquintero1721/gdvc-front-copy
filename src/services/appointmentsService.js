import axios from 'axios';
import { format } from 'date-fns';

// Configurar la base URL del API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ajusta según tu método de almacenamiento
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Obtiene todas las citas
 * Endpoint: GET /api/v1/appointments/
 */
export const getAllAppointments = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/v1/appointments/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener todas las citas:', error);
    throw error;
  }
};

/**
 * Obtiene las citas de una fecha específica
 * Endpoint: GET /api/v1/appointments/date/{fecha}
 * @param {Date|string} date - Fecha en formato Date o string YYYY-MM-DD
 */
export const getAppointmentsByDate = async (date) => {
  try {
    // Convertir fecha a formato YYYY-MM-DD
    const formattedDate = typeof date === 'string'
      ? date
      : format(date, 'yyyy-MM-dd');

    const response = await apiClient.get(`/api/v1/appointments/date/${formattedDate}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener citas de la fecha ${date}:`, error);
    throw error;
  }
};

/**
 * Obtiene la disponibilidad de un veterinario específico
 * Endpoint: GET /api/v1/appointments/availability/{veterinario_id}
 * @param {number} veterinarioId - ID del veterinario
 * @param {Date|string} fecha - Fecha para consultar disponibilidad
 */
export const getVeterinarianAvailability = async (veterinarioId, fecha) => {
  try {
    const formattedDate = typeof fecha === 'string'
      ? fecha
      : format(fecha, 'yyyy-MM-dd');

    const response = await apiClient.get(
      `/api/v1/appointments/availability/${veterinarioId}`,
      {
        params: { fecha: formattedDate }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener disponibilidad del veterinario ${veterinarioId}:`, error);
    throw error;
  }
};

/**
 * Obtiene detalles de una cita específica
 * @param {number} appointmentId - ID de la cita
 */
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await apiClient.get(`/api/v1/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cita ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Función helper para parsear horarios ISO a objetos Date locales
 * @param {string[]} horariosISO - Array de strings ISO
 * @returns {Date[]} Array de objetos Date en zona horaria local
 */
export const parseAvailabilitySlots = (horariosISO) => {
  return horariosISO.map(iso => new Date(iso));
};