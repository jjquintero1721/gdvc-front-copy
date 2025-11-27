import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, Clock, ArrowUpCircle, ArrowDownCircle, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import './MedicationHistoryModal.css'

const MedicationHistoryModal = ({ isOpen, onClose, medication }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && medication) {
      loadHistory();
    }
  }, [isOpen, medication]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getMedicationHistory(medication.id);
      console.log("HISTORY DATA =>", data);
      setHistory(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError('Error al cargar el historial');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="medication-history-modal__overlay">
      <div className="medication-history-modal__container">
        {/* Header */}
        <div className="medication-history-modal__header">
          <div className="medication-history-modal__header-content">
            <div className="medication-history-modal__title-wrapper">
              <div className="medication-history-modal__icon-bg">
                <Clock size={24} />
              </div>
              <div className="medication-history-modal__title-content">
                <h2 className="medication-history-modal__title">Historial de Movimientos</h2>
                <p className="medication-history-modal__subtitle">{medication?.nombre}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="medication-history-modal__close-btn"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="medication-history-modal__summary">
          <div className="medication-history-modal__summary-grid">
            <div className="medication-history-modal__summary-item">
              <p className="medication-history-modal__summary-label">Stock Actual</p>
              <p className="medication-history-modal__summary-value">
                {medication?.stock_actual} <span className="medication-history-modal__summary-unit">{medication?.unidad_medida}</span>
              </p>
            </div>
            <div className="medication-history-modal__summary-item medication-history-modal__summary-item--bordered">
              <p className="medication-history-modal__summary-label">Movimientos</p>
              <p className="medication-history-modal__summary-value">{history.length}</p>
            </div>
            <div className="medication-history-modal__summary-item">
              <p className="medication-history-modal__summary-label">Stock Mínimo</p>
              <p className="medication-history-modal__summary-value">
                {medication?.stock_minimo} <span className="medication-history-modal__summary-unit">{medication?.unidad_medida}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="medication-history-modal__body">
          {loading ? (
            <div className="medication-history-modal__loading">
              <div className="medication-history-modal__spinner"></div>
            </div>
          ) : error ? (
            <div className="medication-history-modal__error">
              <div className="medication-history-modal__error-content">
                <AlertCircle className="medication-history-modal__error-icon" size={24} />
                <p className="medication-history-modal__error-text">{error}</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="medication-history-modal__empty">
              <Clock className="medication-history-modal__empty-icon" size={64} />
              <h3 className="medication-history-modal__empty-title">
                Sin movimientos registrados
              </h3>
              <p className="medication-history-modal__empty-text">
                Aún no hay movimientos de entrada o salida para este medicamento
              </p>
            </div>
          ) : (
            <div className="medication-history-modal__movements">
              {history.map((movement) => (
                <div
                  key={movement.id}
                  className={`medication-history-modal__movement ${
                    movement.tipo === 'entrada'
                      ? 'medication-history-modal__movement--entry'
                      : 'medication-history-modal__movement--exit'
                  }`}
                >
                  {/* Header del movimiento */}
                  <div className="medication-history-modal__movement-header">
                    <div className="medication-history-modal__movement-left">
                      <div
                        className={`medication-history-modal__movement-icon-bg ${
                          movement.tipo === 'entrada'
                            ? 'medication-history-modal__movement-icon-bg--entry'
                            : 'medication-history-modal__movement-icon-bg--exit'
                        }`}
                      >
                        {movement.tipo === 'entrada' ? (
                          <ArrowUpCircle size={24} />
                        ) : (
                          <ArrowDownCircle size={24} />
                        )}
                      </div>
                      <div className="medication-history-modal__movement-info">
                        <h4 className="medication-history-modal__movement-type">
                          {movement.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </h4>
                        <p className="medication-history-modal__movement-reason">{movement.motivo}</p>
                      </div>
                    </div>
                    <div className="medication-history-modal__movement-right">
                      <p
                        className={`medication-history-modal__movement-quantity ${
                          movement.tipo === 'entrada' 
                            ? 'medication-history-modal__movement-quantity--entry' 
                            : 'medication-history-modal__movement-quantity--exit'
                        }`}
                      >
                        {movement.tipo === 'entrada' ? '+' : '-'}{movement.cantidad}
                      </p>
                      <p className="medication-history-modal__movement-unit">{medication?.unidad_medida}</p>
                    </div>
                  </div>

                  {/* Detalles del movimiento */}
                  <div className="medication-history-modal__movement-details">
                    <div className="medication-history-modal__movement-detail">
                      <Calendar size={16} className="medication-history-modal__movement-detail-icon" />
                      <span className="medication-history-modal__movement-detail-text">{formatDate(movement.fecha_movimiento)}</span>
                    </div>
                    {movement.referencia && (
                      <div className="medication-history-modal__movement-detail">
                        <FileText size={16} className="medication-history-modal__movement-detail-icon" />
                        <span className="medication-history-modal__movement-detail-text">{movement.referencia}</span>
                      </div>
                    )}
                  </div>

                  {/* Stock changes */}
                  <div className="medication-history-modal__stock-changes">
                    <div className="medication-history-modal__stock-change">
                      <span className="medication-history-modal__stock-change-label">Stock anterior:</span>
                      <span className="medication-history-modal__stock-change-value">
                        {movement.stock_anterior} {medication?.unidad_medida}
                      </span>
                    </div>
                    <div className="medication-history-modal__stock-change">
                      <span className="medication-history-modal__stock-change-label">Stock nuevo:</span>
                      <span className="medication-history-modal__stock-change-value">
                        {movement.stock_nuevo} {medication?.unidad_medida}
                      </span>
                    </div>
                  </div>

                  {/* Costos (solo para entradas) */}
                  {movement.tipo === 'entrada' && movement.costo_unitario && (
                    <div className="medication-history-modal__costs">
                      <div className="medication-history-modal__cost-row">
                        <span className="medication-history-modal__cost-label">Costo unitario:</span>
                        <span className="medication-history-modal__cost-value">
                          {formatCurrency(movement.costo_unitario)}
                        </span>
                      </div>
                      {movement.costo_total && (
                        <div className="medication-history-modal__cost-row">
                          <span className="medication-history-modal__cost-label">Costo total:</span>
                          <span className="medication-history-modal__cost-value medication-history-modal__cost-value--total">
                            {formatCurrency(movement.costo_total)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Observaciones */}
                  {movement.observaciones && (
                    <div className="medication-history-modal__observations">
                      <p className="medication-history-modal__observations-label">Observaciones:</p>
                      <p className="medication-history-modal__observations-text">{movement.observaciones}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="medication-history-modal__footer">
          <button
            onClick={onClose}
            className="medication-history-modal__close-footer-btn"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationHistoryModal;