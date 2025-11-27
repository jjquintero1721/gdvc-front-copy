import apiClient from './apiClient';

/**
 * Servicio de Inventario - CORREGIDO
 * Maneja todas las operaciones relacionadas con medicamentos e inventario
 *
 * CORRECCIONES:
 * - Mejor manejo de errores
 * - Logging para debugging
 * - Extracción correcta de datos de respuestas
 */
const inventoryService = {
  // ==================== MEDICAMENTOS ====================

  createMedication: async (medicationData) => {
    try {
      const response = await apiClient.post('/inventory/medications', medicationData);
      console.log('[inventoryService] createMedication response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] createMedication error:', error);
      throw error;
    }
  },

  getAllMedications: async () => {
    try {
      const response = await apiClient.get('/inventory/medications');
      console.log('[inventoryService] getAllMedications response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] getAllMedications error:', error);
      throw error;
    }
  },

  getMedicationById: async (medicationId) => {
    try {
      const response = await apiClient.get(`/inventory/medications/${medicationId}`);
      console.log('[inventoryService] getMedicationById response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] getMedicationById error:', error);
      throw error;
    }
  },

  updateMedication: async (medicationId, medicationData) => {
    try {
      const response = await apiClient.put(
        `/inventory/medications/${medicationId}`,
        medicationData
      );
      console.log('[inventoryService] updateMedication response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] updateMedication error:', error);
      throw error;
    }
  },

  deleteMedication: async (medicationId) => {
    try {
      const response = await apiClient.delete(`/inventory/medications/${medicationId}`);
      console.log('[inventoryService] deleteMedication response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] deleteMedication error:', error);
      throw error;
    }
  },

  searchMedications: async (searchTerm) => {
    try {
      const response = await apiClient.get(`/inventory/medications/search/${searchTerm}`);
      console.log('[inventoryService] searchMedications response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] searchMedications error:', error);
      throw error;
    }
  },

  // ==================== MOVIMIENTOS ====================

  registerEntry: async (entryData) => {
    try {
      const response = await apiClient.post('/inventory/movements/entrada', entryData);
      console.log('[inventoryService] registerEntry response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] registerEntry error:', error);
      throw error;
    }
  },

  registerExit: async (exitData) => {
    try {
      const response = await apiClient.post('/inventory/movements/salida', exitData);
      console.log('[inventoryService] registerExit response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] registerExit error:', error);
      throw error;
    }
  },

  getMedicationHistory: async (medicationId) => {
    try {
      const response = await apiClient.get(
        `/inventory/movements/medication/${medicationId}`
      );
      console.log('[inventoryService] getMedicationHistory response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('[inventoryService] getMedicationHistory error:', error);
      throw error;
    }
  },

  // ==================== ALERTAS Y REPORTES - CORREGIDO ====================

  /**
   * Obtiene alertas de stock bajo
   * CORREGIDO: Maneja correctamente la estructura de respuesta del backend
   */
  getLowStockAlerts: async () => {
    try {
      const response = await apiClient.get('/inventory/alerts/low-stock');
      console.log('[inventoryService] getLowStockAlerts RAW response:', response);
      console.log('[inventoryService] getLowStockAlerts response.data:', response.data);

      // El backend devuelve: { success: true, data: [...], message: "..." }
      const alerts = response.data.data || response.data || [];
      console.log('[inventoryService] getLowStockAlerts processed:', alerts);

      // Asegurar que siempre devolvemos un array
      return Array.isArray(alerts) ? alerts : [];
    } catch (error) {
      console.error('[inventoryService] getLowStockAlerts error:', error);
      console.error('[inventoryService] getLowStockAlerts error.response:', error.response);
      return []; // Devolver array vacío en caso de error
    }
  },

  /**
   * Obtiene medicamentos vencidos
   * CORREGIDO: Maneja correctamente la estructura de respuesta del backend
   */
  getExpiredMedications: async () => {
    try {
      const response = await apiClient.get('/inventory/alerts/expired');
      console.log('[inventoryService] getExpiredMedications RAW response:', response);
      console.log('[inventoryService] getExpiredMedications response.data:', response.data);

      // El backend devuelve: { success: true, data: [...], message: "..." }
      const expired = response.data.data || response.data || [];
      console.log('[inventoryService] getExpiredMedications processed:', expired);

      // Asegurar que siempre devolvemos un array
      return Array.isArray(expired) ? expired : [];
    } catch (error) {
      console.error('[inventoryService] getExpiredMedications error:', error);
      console.error('[inventoryService] getExpiredMedications error.response:', error.response);
      return []; // Devolver array vacío en caso de error
    }
  },

  /**
   * Obtiene dashboard de inventario con resumen y alertas
   * CORREGIDO: Maneja correctamente la estructura de respuesta del backend
   */
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/inventory/dashboard');
      console.log('[inventoryService] getDashboard RAW response:', response);
      console.log('[inventoryService] getDashboard response.data:', response.data);

      // El backend devuelve: { success: true, data: {...}, message: "..." }
      const dashboardData = response.data.data || response.data;
      console.log('[inventoryService] getDashboard processed:', dashboardData);

      // Validar estructura del dashboard
      if (!dashboardData || typeof dashboardData !== 'object') {
        console.warn('[inventoryService] getDashboard: Invalid dashboard structure');
        return {
          resumen: {
            total_medicamentos: 0,
            medicamentos_activos: 0,
            alertas_stock_bajo: 0,
            medicamentos_vencidos: 0,
            medicamentos_criticos: 0,
            valor_total_inventario: 0,
            requiere_atencion: false
          },
          alertas_criticas: [],
          alertas_advertencia: [],
          medicamentos_vencidos: []
        };
      }

      return dashboardData;
    } catch (error) {
      console.error('[inventoryService] getDashboard error:', error);
      console.error('[inventoryService] getDashboard error.response:', error.response);

      // Devolver estructura por defecto en caso de error
      return {
        resumen: {
          total_medicamentos: 0,
          medicamentos_activos: 0,
          alertas_stock_bajo: 0,
          medicamentos_vencidos: 0,
          medicamentos_criticos: 0,
          valor_total_inventario: 0,
          requiere_atencion: false
        },
        alertas_criticas: [],
        alertas_advertencia: [],
        medicamentos_vencidos: []
      };
    }
  },

  /**
   * Genera orden de compra automática
   * CORREGIDO: Maneja correctamente la estructura de respuesta del backend
   */
  generatePurchaseOrder: async () => {
    try {
      const response = await apiClient.get('/inventory/purchase-order');
      console.log('[inventoryService] generatePurchaseOrder RAW response:', response);
      console.log('[inventoryService] generatePurchaseOrder response.data:', response.data);

      // El backend devuelve: { success: true, data: [...], message: "..." }
      const purchaseOrder = response.data.data || response.data || [];
      console.log('[inventoryService] generatePurchaseOrder processed:', purchaseOrder);

      // Asegurar que siempre devolvemos un array
      return Array.isArray(purchaseOrder) ? purchaseOrder : [];
    } catch (error) {
      console.error('[inventoryService] generatePurchaseOrder error:', error);
      console.error('[inventoryService] generatePurchaseOrder error.response:', error.response);
      return []; // Devolver array vacío en caso de error
    }
  },
};

export default inventoryService;