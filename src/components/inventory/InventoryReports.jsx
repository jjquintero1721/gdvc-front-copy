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
import './InventoryReports.css'

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
      <div className="inventory-reports__loading">
        <div className="inventory-reports__spinner"></div>
      </div>
    );
  }

  return (
    <div className="inventory-reports">
      {/* Dashboard Summary */}
      {dashboard && dashboard.resumen && (
        <div className="inventory-reports__summary">
          <button
            onClick={() => toggleSection('dashboard')}
            className="inventory-reports__section-toggle"
          >
            <h2 className="inventory-reports__summary-title">
              <Package size={28} />
              Resumen del Inventario
            </h2>
            {expandedSections.dashboard ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {expandedSections.dashboard && (
            <div className="inventory-reports__summary-grid">
              <div className="inventory-reports__summary-stat">
                <p className="inventory-reports__summary-stat-label">Total Medicamentos</p>
                <p className="inventory-reports__summary-stat-value">{dashboard.resumen.total_medicamentos}</p>
              </div>

              <div className="inventory-reports__summary-stat">
                <p className="inventory-reports__summary-stat-label">Activos</p>
                <p className="inventory-reports__summary-stat-value">{dashboard.resumen.medicamentos_activos}</p>
              </div>

              <div className="inventory-reports__summary-stat">
                <p className="inventory-reports__summary-stat-label">Stock Bajo</p>
                <p className="inventory-reports__summary-stat-value">{dashboard.resumen.alertas_stock_bajo}</p>
              </div>

              <div className="inventory-reports__summary-stat">
                <p className="inventory-reports__summary-stat-label">Valor Total</p>
                <p className="inventory-reports__summary-stat-value">
                  {formatCurrency(dashboard.resumen.valor_total_inventario)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="inventory-reports__section">
          <div className="inventory-reports__section-header">
            <button
              onClick={() => toggleSection('lowStock')}
              className="inventory-reports__section-toggle"
            >
              <h2 className="inventory-reports__section-title">
                <AlertTriangle size={28} />
                Alertas de Stock Bajo
                <span className="inventory-reports__badge">
                  {lowStockAlerts.length}
                </span>
              </h2>
              {expandedSections.lowStock ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {lowStockAlerts.length > 0 && (
              <button
                onClick={handleGeneratePurchaseOrder}
                className="inventory-reports__generate-order-btn"
              >
                <ShoppingCart size={18} />
                Generar Orden de Compra
              </button>
            )}
          </div>

          {expandedSections.lowStock && (
            <div className="inventory-reports__list">
              {lowStockAlerts.map((alert) => (
                <div
                  key={alert.medicamento_id}
                  className={`inventory-reports__item inventory-reports__item--low-stock ${
                    alert.requiere_accion_inmediata ? 'inventory-reports__item--urgent' : ''
                  }`}
                >
                  <div className="inventory-reports__item-header">
                    <div className="inventory-reports__item-left">
                      <div className="inventory-reports__item-icon-bg inventory-reports__item-icon-bg--low-stock">
                        <AlertTriangle className="inventory-reports__item-icon" size={20} />
                      </div>
                      <div className="inventory-reports__item-info">
                        <h3 className="inventory-reports__item-name">{alert.nombre}</h3>
                        <p className="inventory-reports__item-type">{alert.tipo}</p>
                      </div>
                    </div>
                    {alert.requiere_accion_inmediata && (
                      <span className="inventory-reports__item-badge inventory-reports__item-badge--urgent">
                        ¡URGENTE!
                      </span>
                    )}
                  </div>

                  <div className="inventory-reports__item-grid">
                    <div className="inventory-reports__item-stat">
                      <p className="inventory-reports__item-stat-label">Stock Actual</p>
                      <p className="inventory-reports__item-stat-value inventory-reports__item-stat-value--danger">
                        {alert.stock_actual} <span className="inventory-reports__item-stat-unit">{alert.unidad_medida}</span>
                      </p>
                    </div>

                    <div className="inventory-reports__item-stat">
                      <p className="inventory-reports__item-stat-label">Stock Mínimo</p>
                      <p className="inventory-reports__item-stat-value">
                        {alert.stock_minimo} <span className="inventory-reports__item-stat-unit">{alert.unidad_medida}</span>
                      </p>
                    </div>

                    <div className="inventory-reports__item-stat">
                      <p className="inventory-reports__item-stat-label">Faltante</p>
                      <p className="inventory-reports__item-stat-value inventory-reports__item-stat-value--warning">
                        {Math.max(alert.stock_minimo - alert.stock_actual, 0)} <span className="inventory-reports__item-stat-unit">{alert.unidad_medida}</span>
                      </p>
                    </div>


                    <div className="inventory-reports__item-stat">
                      <p className="inventory-reports__item-stat-label">Nivel de Stock</p>
                      <div className="inventory-reports__progress-bar">
                        <div
                          className={`inventory-reports__progress-fill ${
                            alert.porcentaje_stock < 30 ? 'inventory-reports__progress-fill--danger' : 'inventory-reports__progress-fill--warning'
                          }`}
                          style={{ width: `${Math.min(alert.porcentaje_stock, 100)}%` }}
                        />
                      </div>
                      <span className="inventory-reports__progress-label">
                        {alert.porcentaje_stock.toFixed(0)}%
                      </span>
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
        <div className="inventory-reports__section">
          <button
            onClick={() => toggleSection('expired')}
            className="inventory-reports__section-toggle"
          >
            <h2 className="inventory-reports__section-title">
              <XCircle size={28} />
              Medicamentos Vencidos
              <span className="inventory-reports__badge inventory-reports__badge--danger">
                {expiredMedications.length}
              </span>
            </h2>
            {expandedSections.expired ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {expandedSections.expired && (
            <div className="inventory-reports__list">
              {expiredMedications.map((medication) => (
                <div
                  key={medication.id}
                  className="inventory-reports__item inventory-reports__item--expired"
                >
                  <div className="inventory-reports__item-header">
                    <div className="inventory-reports__item-left">
                      <div className="inventory-reports__item-icon-bg inventory-reports__item-icon-bg--expired">
                        <XCircle className="inventory-reports__item-icon inventory-reports__item-icon--expired" size={20} />
                      </div>
                      <div className="inventory-reports__item-info">
                        <h3 className="inventory-reports__item-name">{medication.nombre}</h3>
                        <p className="inventory-reports__item-type">{medication.tipo}</p>
                      </div>
                    </div>
                    <span className="inventory-reports__item-badge inventory-reports__item-badge--expired">
                      VENCIDO
                    </span>
                  </div>

                  <div className="inventory-reports__item-grid">
                    <div className="inventory-reports__item-stat">
                      <Calendar size={14} />
                      <p className="inventory-reports__item-stat-label">Venció:</p>
                      <p className="inventory-reports__item-stat-value inventory-reports__item-stat-value--danger">
                        {formatDate(medication.fecha_vencimiento)}
                      </p>
                    </div>

                    <div className="inventory-reports__item-stat">
                      <Package size={14} />
                      <p className="inventory-reports__item-stat-label">Stock actual:</p>
                      <p className="inventory-reports__item-stat-value">
                        {medication.stock_actual} {medication.unidad_medida}
                      </p>
                    </div>

                    {medication.lote && (
                      <div className="inventory-reports__item-stat">
                        <FileText size={14} />
                        <p className="inventory-reports__item-stat-label">Lote:</p>
                        <p className="inventory-reports__item-stat-value">{medication.lote}</p>
                      </div>
                    )}
                  </div>

                  <div className="inventory-reports__item-message inventory-reports__item-message--expired">
                    <AlertTriangle className="inventory-reports__item-message-icon inventory-reports__item-message-icon--expired" size={16} />
                    <p className="inventory-reports__item-message-text inventory-reports__item-message-text--expired">
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
        <div className="inventory-reports__section inventory-reports__section--purchase-order">
          <button
            onClick={() => toggleSection('purchaseOrder')}
            className="inventory-reports__section-toggle"
          >
            <h2 className="inventory-reports__section-title">
              <ShoppingCart size={28} />
              Orden de Compra Generada
              <span className="inventory-reports__badge inventory-reports__badge--primary">
                {purchaseOrder.length} items
              </span>
            </h2>
            {expandedSections.purchaseOrder ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {expandedSections.purchaseOrder && (
            <>
              <div className="inventory-reports__purchase-order-info">
                <p>
                  Esta orden de compra ha sido generada automáticamente basándose en los medicamentos con stock bajo.
                </p>
              </div>

              <div className="inventory-reports__purchase-order-list">
                {purchaseOrder.map((item, index) => (
                  <div
                    key={item.medicamento_id || index}
                    className="inventory-reports__purchase-order-item"
                  >
                    <div className="inventory-reports__purchase-order-header">
                      <div className="inventory-reports__purchase-order-info-section">
                        <h3 className="inventory-reports__purchase-order-name">{item.nombre}</h3>
                        <p className="inventory-reports__purchase-order-type">Tipo: {item.tipo}</p>
                      </div>
                      <button
                        onClick={() => onEntryFromPurchaseOrder && onEntryFromPurchaseOrder(item)}
                        className="inventory-reports__purchase-order-entry-btn"
                      >
                        <ArrowUpCircle size={16} />
                        Registrar Entrada
                      </button>
                    </div>

                    <div className="inventory-reports__purchase-order-details">
                      <div className="inventory-reports__purchase-order-stat">
                        <p className="inventory-reports__purchase-order-stat-label">Stock Actual</p>
                        <p className="inventory-reports__purchase-order-stat-value">{item.stock_actual}</p>
                      </div>
                      <div className="inventory-reports__purchase-order-stat">
                        <p className="inventory-reports__purchase-order-stat-label">A Ordenar</p>
                        <p className="inventory-reports__purchase-order-stat-value inventory-reports__purchase-order-stat-value--primary">
                          {item.cantidad_sugerida}
                        </p>
                      </div>
                      <div className="inventory-reports__purchase-order-stat">
                        <p className="inventory-reports__purchase-order-stat-label">Costo Unit.</p>
                        <p className="inventory-reports__purchase-order-stat-value">
                          {formatCurrency(item.precio_compra)}
                        </p>
                      </div>
                      <div className="inventory-reports__purchase-order-stat">
                        <p className="inventory-reports__purchase-order-stat-label">Costo Total</p>
                        <p className="inventory-reports__purchase-order-stat-value inventory-reports__purchase-order-stat-value--success">
                          {formatCurrency(item.precio_compra * item.cantidad_sugerida)}
                        </p>
                      </div>
                    </div>

                    {item.laboratorio && (
                      <div className="inventory-reports__purchase-order-footer">
                        <p>
                          Laboratorio: <span>{item.laboratorio}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                <div className="inventory-reports__purchase-order-total">
                  <span className="inventory-reports__purchase-order-total-label">Total Estimado:</span>
                  <span className="inventory-reports__purchase-order-total-value">
                    {formatCurrency(
                      purchaseOrder.reduce((sum, item) => sum + (item.precio_compra * item.cantidad_sugerida || 0), 0)
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {lowStockAlerts.length === 0 && expiredMedications.length === 0 && (
        <div className="inventory-reports__empty">
          <Package className="inventory-reports__empty-icon" size={64} />
          <h3 className="inventory-reports__empty-title">
            ¡Todo en orden!
          </h3>
          <p className="inventory-reports__empty-text">
            No hay alertas de stock bajo ni medicamentos vencidos en este momento.
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryReports;