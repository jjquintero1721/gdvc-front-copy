import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

const inventoryApi = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}/inventory`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
inventoryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo de errores
inventoryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const inventoryService = {
  // ==================== MEDICAMENTOS ====================

  // Crear medicamento
  createMedication: async (medicationData) => {
    const response = await inventoryApi.post('/medications', medicationData);
    return response.data;
  },

  // Obtener todos los medicamentos
  getAllMedications: async () => {
    const response = await inventoryApi.get('/medications');
    return response.data;
  },

  // Obtener medicamento por ID
  getMedicationById: async (medicationId) => {
    const response = await inventoryApi.get(`/medications/${medicationId}`);
    return response.data;
  },

  // Actualizar medicamento
  updateMedication: async (medicationId, medicationData) => {
    const response = await inventoryApi.put(`/medications/${medicationId}`, medicationData);
    return response.data;
  },

  // Desactivar medicamento
  deleteMedication: async (medicationId) => {
    const response = await inventoryApi.delete(`/medications/${medicationId}`);
    return response.data;
  },

  // Buscar medicamentos
  searchMedications: async (searchTerm) => {
    const response = await inventoryApi.get(`/medications/search/${searchTerm}`);
    return response.data;
  },

  // ==================== MOVIMIENTOS ====================

  // Registrar entrada
  registerEntry: async (entryData) => {
    const response = await inventoryApi.post('/movements/entrada', entryData);
    return response.data;
  },

  // Registrar salida
  registerExit: async (exitData) => {
    const response = await inventoryApi.post('/movements/salida', exitData);
    return response.data;
  },

  // Obtener historial de movimientos
  getMedicationHistory: async (medicationId) => {
    const response = await inventoryApi.get(`/movements/medication/${medicationId}`);
    return response.data;
  },

  // ==================== ALERTAS Y REPORTES ====================

  // Obtener alertas de bajo stock
  getLowStockAlerts: async () => {
    const response = await inventoryApi.get('/alerts/low-stock');
    return response.data;
  },

  // Obtener medicamentos vencidos
  getExpiredMedications: async () => {
    const response = await inventoryApi.get('/alerts/expired');
    return response.data;
  },

  // Obtener dashboard
  getDashboard: async () => {
    const response = await inventoryApi.get('/dashboard');
    return response.data;
  },

  // Generar orden de compra
  generatePurchaseOrder: async () => {
    const response = await inventoryApi.get('/purchase-order');
    return response.data;
  },
};

export default inventoryService;