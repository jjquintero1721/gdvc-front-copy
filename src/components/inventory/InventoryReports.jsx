import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  XCircle,
  ShoppingCart,
  DollarSign,
  Calendar,
  FileText,
  ArrowUpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const InventoryReports = ({ onEntryFromPurchaseOrder }) => {
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiredMedications, setExpiredMedications] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    lowStock: true,
    expired: true,
    dashboard: true,
    purchaseOrder: false,
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [lowStock, expired, dashboardData] = await Promise.all([
        inventoryService.getLowStockAlerts(),
        inventoryService.getExpiredMedications(),
        inventoryService.getDashboard(),
      ]);

      setLowStockAlerts(lowStock);
      setExpiredMedications(expired);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePurchaseOrder = async () => {
    try {
      const order = await inventoryService.generatePurchaseOrder();
      setPurchaseOrder(order);
      setExpandedSections(prev => ({ ...prev, purchaseOrder: true }));
    } catch (error) {
      console.error('Error generating purchase order:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      {dashboard && dashboard.resumen && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <button
            onClick={() => toggleSection('dashboard')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Package className="text-blue-600" size={28} />
              Resumen del Inventario
            </h2>
            {expandedSections.dashboard ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {expandedSections.dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Total Medicamentos</p>
                <p className="text-3xl font-bold text-blue-900">{dashboard.resumen.total_medicamentos}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-1">Activos</p>
                <p className="text-3xl font-bold text-green-900">{dashboard.resumen.medicamentos_activos}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-1">Stock Bajo</p>
                <p className="text-3xl font-bold text-orange-900">{dashboard.resumen.alertas_stock_bajo}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(dashboard.resumen.valor_total_inventario)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => toggleSection('lowStock')}
              className="flex items-center gap-3 flex-1"
            >
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <AlertTriangle className="text-orange-600" size={28} />
                Alertas de Stock Bajo
                <span className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {lowStockAlerts.length}
                </span>
              </h2>
              {expandedSections.lowStock ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {lowStockAlerts.length > 0 && (
              <button
                onClick={handleGeneratePurchaseOrder}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              >
                <ShoppingCart size={18} />
                Generar Orden de Compra
              </button>
            )}
          </div>

          {expandedSections.lowStock && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockAlerts.map((alert) => (
                <div
                  key={alert.medicamento_id}
                  className={`border-l-4 p-4 rounded-lg ${
                    alert.requiere_accion_inmediata
                      ? 'bg-red-50 border-red-500'
                      : 'bg-orange-50 border-orange-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{alert.nombre}</h3>
                    {alert.requiere_accion_inmediata && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        ¡URGENTE!
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock actual:</span>
                      <span className="font-semibold text-gray-800">{alert.stock_actual}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock mínimo:</span>
                      <span className="font-semibold text-gray-800">{alert.stock_minimo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diferencia:</span>
                      <span className="font-semibold text-red-600">-{alert.diferencia}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Nivel de stock:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                alert.porcentaje_stock < 25 ? 'bg-red-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(alert.porcentaje_stock, 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-800">
                            {alert.porcentaje_stock.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expired Medications */}
      {expiredMedications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
          <button
            onClick={() => toggleSection('expired')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <XCircle className="text-red-600" size={28} />
              Medicamentos Vencidos
              <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {expiredMedications.length}
              </span>
            </h2>
            {expandedSections.expired ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {expandedSections.expired && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiredMedications.map((medication) => (
                <div
                  key={medication.id}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
                >
                  <h3 className="font-bold text-gray-800 mb-2">{medication.nombre}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-600" />
                      <span className="text-gray-600">Venció:</span>
                      <span className="font-semibold text-red-700">
                        {formatDate(medication.fecha_vencimiento)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-600" />
                      <span className="text-gray-600">Stock actual:</span>
                      <span className="font-semibold text-gray-800">
                        {medication.stock_actual} {medication.unidad_medida}
                      </span>
                    </div>
                    {medication.lote && (
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-gray-600" />
                        <span className="text-gray-600">Lote:</span>
                        <span className="font-semibold text-gray-800">{medication.lote}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs text-red-700 font-medium">
                      ⚠️ Requiere desecho según protocolo de bioseguridad
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Purchase Order */}
      {purchaseOrder.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-200">
          <button
            onClick={() => toggleSection('purchaseOrder')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <ShoppingCart className="text-blue-600" size={28} />
              Orden de Compra Generada
              <span className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {purchaseOrder.length} items
              </span>
            </h2>
            {expandedSections.purchaseOrder ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {expandedSections.purchaseOrder && (
            <>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Esta orden de compra ha sido generada automáticamente basándose en los medicamentos con stock bajo.
                </p>
              </div>

              <div className="space-y-3">
                {purchaseOrder.map((item, index) => (
                  <div
                    key={item.medicamento_id || index}
                    className="bg-gray-50 border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.nombre}</h3>
                        <p className="text-sm text-gray-600 capitalize">Tipo: {item.tipo}</p>
                      </div>
                      <button
                        onClick={() => onEntryFromPurchaseOrder && onEntryFromPurchaseOrder(item)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <ArrowUpCircle size={16} />
                        Registrar Entrada
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Stock Actual</p>
                        <p className="font-semibold text-gray-800">{item.stock_actual}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">A Ordenar</p>
                        <p className="font-semibold text-blue-700">{item.cantidad_sugerida}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Costo Unit.</p>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(item.precio_compra)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Costo Total</p>
                        <p className="font-semibold text-green-700">
                          {formatCurrency(item.costo_total_sugerido)}
                        </p>
                      </div>
                    </div>

                    {item.laboratorio && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Laboratorio: <span className="font-medium text-gray-800">{item.laboratorio}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">Total Estimado:</span>
                    <span className="text-2xl font-bold text-green-700">
                      {formatCurrency(
                        purchaseOrder.reduce((sum, item) => sum + (item.costo_total_sugerido || 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {lowStockAlerts.length === 0 && expiredMedications.length === 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
          <Package className="mx-auto text-green-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            ¡Todo en orden!
          </h3>
          <p className="text-green-700">
            No hay alertas de stock bajo ni medicamentos vencidos en este momento.
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryReports;