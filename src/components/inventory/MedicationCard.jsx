import React, { useState } from 'react';
import { Pill, AlertCircle, Snowflake, MapPin, Calendar, DollarSign, Package, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';
import UpdateMedicationModal from './UpdateMedicationModal';
import RegisterEntryModal from './RegisterEntryModal';
import RegisterExitModal from './RegisterExitModal';
import MedicationHistoryModal from './MedicationHistoryModal';
import DeactivateMedicationModal from './DesactivateMedicationModal';
import './MedicationCard.css';

const MedicationCard = ({ medication, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);

  // Estados para los modales
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const isLowStock = medication.stock_actual <= medication.stock_minimo;

  const isExpiringSoon = () => {
    if (!medication.fecha_vencimiento) return false;
    const expiryDate = new Date(medication.fecha_vencimiento);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  };

  const isExpired = () => {
    if (!medication.fecha_vencimiento) return false;
    const expiryDate = new Date(medication.fecha_vencimiento);
    const today = new Date();
    return expiryDate < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockClass = () => {
    if (isExpired()) return 'medication-card__stock--expired';
    if (isLowStock) return 'medication-card__stock--low';
    return 'medication-card__stock--ok';
  };

  const getBadgeClass = () => {
    if (isExpired()) return 'medication-card__badge--expired';
    if (isLowStock) return 'medication-card__badge--low';
    return 'medication-card__badge--ok';
  };

  const getBadgeText = () => {
    if (isExpired()) return 'Vencido';
    if (isLowStock) return 'Stock Bajo';
    return 'Stock OK';
  };

  const getDateClass = () => {
    if (isExpired()) return 'medication-card__info-value--expired';
    if (isExpiringSoon()) return 'medication-card__info-value--expiring';
    return '';
  };

  const handleModalSuccess = () => {
    onUpdate();
  };

  return (
    <>
      <div
        className="medication-card"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Header with Badge */}
        <div className="medication-card__header">
          <div className="medication-card__header-top">
            <div className="medication-card__title-wrapper">
              <div className="medication-card__icon-bg">
                <Pill size={24} className="medication-card__icon" />
              </div>
              <div className="medication-card__title-content">
                <h3 className="medication-card__name">
                  {medication.nombre}
                </h3>
                <p className="medication-card__type">{medication.tipo}</p>
              </div>
            </div>
            <span className={`medication-card__badge ${getBadgeClass()}`}>
              {getBadgeText()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="medication-card__body">
          {/* Stock Info */}
          <div className={`medication-card__stock ${getStockClass()}`}>
            <div className="medication-card__stock-left">
              <Package size={18} className="medication-card__stock-icon" />
              <div className="medication-card__stock-info">
                <p className="medication-card__stock-label">Stock Actual</p>
                <p className="medication-card__stock-value">{medication.stock_actual}</p>
              </div>
            </div>
            <div className="medication-card__stock-right">
              <p className="medication-card__stock-unit-label">Unidad</p>
              <p className="medication-card__stock-unit">{medication.unidad_medida}</p>
            </div>
          </div>

          {/* Stock Limits */}
          <div className="medication-card__limits">
            <div className="medication-card__limit">
              <p className="medication-card__limit-label">Mínimo</p>
              <p className="medication-card__limit-value">{medication.stock_minimo}</p>
            </div>
            <div className="medication-card__limit">
              <p className="medication-card__limit-label">Máximo</p>
              <p className="medication-card__limit-value">{medication.stock_maximo}</p>
            </div>
          </div>

          {/* Price Info */}
          <div className="medication-card__price">
            <div className="medication-card__price-left">
              <DollarSign size={16} className="medication-card__price-icon" />
              <div className="medication-card__price-info">
                <p className="medication-card__price-label">Precio Venta</p>
                <p className="medication-card__price-value">
                  {formatCurrency(medication.precio_venta)}
                </p>
              </div>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="medication-card__info-item medication-card__info-item--date">
            <Calendar size={16} className="medication-card__info-icon medication-card__info-icon--date" />
            <div className="medication-card__info-content">
              <p className="medication-card__info-label">Vencimiento</p>
              <p className={`medication-card__info-value ${getDateClass()}`}>
                {formatDate(medication.fecha_vencimiento)}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="medication-card__info-item medication-card__info-item--location">
            <MapPin size={16} className="medication-card__info-icon medication-card__info-icon--location" />
            <div className="medication-card__info-content">
              <p className="medication-card__info-label">Ubicación</p>
              <p className="medication-card__info-value">
                {medication.ubicacion || 'No especificada'}
              </p>
            </div>
          </div>

          {/* Laboratory */}
          {medication.laboratorio && (
            <div className="medication-card__lab">
              <p className="medication-card__lab-label">Laboratorio</p>
              <p className="medication-card__lab-value">{medication.laboratorio}</p>
            </div>
          )}

          {/* Special Badges */}
          {(medication.requiere_refrigeracion || medication.controlado) && (
            <div className="medication-card__special-badges">
              {medication.requiere_refrigeracion && (
                <div className="medication-card__special-badge medication-card__special-badge--refrigeration">
                  <Snowflake size={12} />
                  <span>Refrigeración</span>
                </div>
              )}
              {medication.controlado && (
                <div className="medication-card__special-badge medication-card__special-badge--controlled">
                  <AlertCircle size={12} />
                  <span>Controlado</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="medication-card__footer">
          <div className="medication-card__actions">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="medication-card__action-button medication-card__action-button--update"
            >
              <Edit size={16} />
              Actualizar
            </button>

            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="medication-card__action-button medication-card__action-button--history"
            >
              <Clock size={16} />
              Historial
            </button>

            <button
              onClick={() => setIsEntryModalOpen(true)}
              className="medication-card__action-button medication-card__action-button--entry"
            >
              <ArrowUpCircle size={16} />
              Entrada
            </button>

            <button
              onClick={() => setIsExitModalOpen(true)}
              className="medication-card__action-button medication-card__action-button--exit"
            >
              <ArrowDownCircle size={16} />
              Salida
            </button>
          </div>

          <button
            onClick={() => setIsDeactivateModalOpen(true)}
            className="medication-card__action-button medication-card__action-button--deactivate"
          >
            <Trash2 size={16} />
            Desactivar
          </button>
        </div>
      </div>

      {/* Modales */}
      <UpdateMedicationModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          setIsUpdateModalOpen(false);
          handleModalSuccess();
        }}
        medication={medication}
      />

      <RegisterEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSuccess={() => {
          setIsEntryModalOpen(false);
          handleModalSuccess();
        }}
        medication={medication}
      />

      <RegisterExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onSuccess={() => {
          setIsExitModalOpen(false);
          handleModalSuccess();
        }}
        medication={medication}
      />

      <MedicationHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        medication={medication}
      />

      <DeactivateMedicationModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onSuccess={() => {
          setIsDeactivateModalOpen(false);
          handleModalSuccess();
        }}
        medication={medication}
      />
    </>
  );
};

export default MedicationCard;