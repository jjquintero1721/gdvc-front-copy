import apiClient from './apiClient';

const inventoryService = {
  // ==================== MEDICAMENTOS ====================

  createMedication: async (medicationData) => {
    const response = await apiClient.post('/inventory/medications', medicationData);
    return response.data;
  },

  getAllMedications: async () => {
    const response = await apiClient.get('/inventory/medications');
    return response.data;
  },

  getMedicationById: async (medicationId) => {
    const response = await apiClient.get(`/inventory/medications/${medicationId}`);
    return response.data;
  },

  updateMedication: async (medicationId, medicationData) => {
    const response = await apiClient.put(
      `/inventory/medications/${medicationId}`,
      medicationData
    );
    return response.data;
  },

  deleteMedication: async (medicationId) => {
    const response = await apiClient.delete(`/inventory/medications/${medicationId}`);
    return response.data;
  },

  searchMedications: async (searchTerm) => {
    const response = await apiClient.get(`/inventory/medications/search/${searchTerm}`);
    return response.data;
  },

  // ==================== MOVIMIENTOS ====================

  registerEntry: async (entryData) => {
    const response = await apiClient.post('/inventory/movements/entrada', entryData);
    return response.data;
  },

  registerExit: async (exitData) => {
    const response = await apiClient.post('/inventory/movements/salida', exitData);
    return response.data;
  },

  getMedicationHistory: async (medicationId) => {
    const response = await apiClient.get(
      `/inventory/movements/medication/${medicationId}`
    );
    return response.data;
  },

  // ==================== ALERTAS Y REPORTES ====================

  getLowStockAlerts: async () => {
    const response = await apiClient.get('/inventory/alerts/low-stock');
    return response.data;
  },

  getExpiredMedications: async () => {
    const response = await apiClient.get('/inventory/alerts/expired');
    return response.data;
  },

  getDashboard: async () => {
    const response = await apiClient.get('/inventory/dashboard');
    return response.data;
  },

  generatePurchaseOrder: async () => {
    const response = await apiClient.get('/inventory/purchase-order');
    return response.data;
  },
};

export default inventoryService;
