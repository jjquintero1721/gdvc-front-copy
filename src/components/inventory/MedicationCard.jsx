import React, { useState } from 'react';
import {
  Pill,
  AlertCircle,
  Snowflake,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Edit,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock
} from 'lucide-react';

import UpdateMedicationModal from './UpdateMedicationModal';
import RegisterEntryModal from './RegisterEntryModal';
import RegisterExitModal from './RegisterExitModal';
import MedicationHistoryModal from './MedicationHistoryModal';
import DeactivateMedicationModal from './DesactivateMedicationModal';
import './MedicationCard.css';

const MedicationCard = ({ medication, onUpdate, onInventoryChange }) => {
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
    return new Date(medication.fecha_vencimiento) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  // NOTE: usamos las clases con sufijo 2 para evitar colisiones
  const getBadgeClass = () => {
    if (isExpired()) return 'medication-card__badge2--expired2';
    if (isLowStock) return 'medication-card__badge2--low2';
    return 'medication-card__badge2--ok2';
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
    if (onInventoryChange) onInventoryChange();
  };

  return (
    <>
      <div className="medication-card">

        {/* HEADER */}
        <div className="medication-card__header">
          <div className="medication-card__header-top">
            <div className="medication-card__title-wrapper">
              <div className="medication-card__icon-bg">
                <Pill size={24} className="medication-card__icon" />
              </div>
              <div className="medication-card__title-content">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 className="medication-card__name">{medication.nombre}</h3>

                    {/* badge ahora AL LADO del nombre */}
                    <span className={`medication-card__badge2 ${getBadgeClass()}`}>
                      {getBadgeText()}
                    </span>
                  </div>

                  {/* tipo queda abajo */}
                  <p className="medication-card__type">{medication.tipo}</p>
                </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="medication-card__body">
          <div className={`medication-card__stock ${getStockClass()}`}>
            <div className="medication-card__stock-left">
              <Package size={18} className="medication-card__stock-icon" />
              <div>
                <p className="medication-card__stock-label">Stock Actual</p>
                <p className="medication-card__stock-value">{medication.stock_actual}</p>
              </div>
            </div>
            <div className="medication-card__stock-right">
              <p className="medication-card__stock-unit-label">Unidad</p>
              <p className="medication-card__stock-unit">{medication.unidad_medida}</p>
            </div>
          </div>

          <div className="medication-card__limits">
            <div>
              <p className="medication-card__limit-label">Mínimo</p>
              <p className="medication-card__limit-value">{medication.stock_minimo}</p>
            </div>
            <div>
              <p className="medication-card__limit-label">Máximo</p>
              <p className="medication-card__limit-value">{medication.stock_maximo}</p>
            </div>
          </div>

          <div className="medication-card__price">
            <div className="medication-card__price-left">
              <DollarSign size={16} />
              <div>
                <p className="medication-card__price-label">Precio Venta</p>
                <p className="medication-card__price-value">
                  {formatCurrency(medication.precio_venta)}
                </p>
              </div>
            </div>
          </div>

          <div className="medication-card__info-item">
            <Calendar size={16} />
            <div>
              <p className="medication-card__info-label">Vencimiento</p>
              <p className={`medication-card__info-value ${getDateClass()}`}>
                {formatDate(medication.fecha_vencimiento)}
              </p>
            </div>
          </div>

          <div className="medication-card__info-item">
            <MapPin size={16} />
            <div>
              <p className="medication-card__info-label">Ubicación</p>
              <p className="medication-card__info-value">
                {medication.ubicacion || 'No especificada'}
              </p>
            </div>
          </div>

          {medication.laboratorio && (
            <div className="medication-card__lab">
              <p className="medication-card__lab-label">Laboratorio</p>
              <p className="medication-card__lab-value">{medication.laboratorio}</p>
            </div>
          )}
          {medication.tipo === 'antibiotico' && medication.principio_activo && (
              <div className="medication-card__info-item">
                <Pill size={16} />
                <div>
                  <p className="medication-card__info-label">Principio Activo</p>
                  <p className="medication-card__info-value">
                    {medication.principio_activo}
                  </p>
                </div>
              </div>
            )}


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

        {/* FOOTER */}
        <div className="medication-card__footer">

          <div className="medication-card__footer-row">
            <button className="medication-card__action-button" onClick={() => setIsUpdateModalOpen(true)}>
              <Edit size={16} /> Actualizar
            </button>

            <button className="medication-card__action-button" onClick={() => setIsHistoryModalOpen(true)}>
              <Clock size={16} /> Historial
            </button>
          </div>

          <div className="medication-card__footer-row">
            <button className="medication-card__action-button medication-card__action-button--entry"
              onClick={() => setIsEntryModalOpen(true)}>
              <ArrowUpCircle size={16} /> Entrada
            </button>

            <button className="medication-card__action-button medication-card__action-button--exit"
              onClick={() => setIsExitModalOpen(true)}>
              <ArrowDownCircle size={16} /> Salida
            </button>
          </div>

          <button
            className="medication-card__action-button medication-card__action-button--deactivate-full"
            onClick={() => setIsDeactivateModalOpen(true)}
          >
            <Trash2 size={16} />
            Desactivar
          </button>

        </div>
      </div>

      <UpdateMedicationModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => { setIsUpdateModalOpen(false); handleModalSuccess(); }}
        medication={medication}
      />

      <RegisterEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSuccess={() => { setIsEntryModalOpen(false); handleModalSuccess(); }}
        medication={medication}
      />

      <RegisterExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onSuccess={() => { setIsExitModalOpen(false); handleModalSuccess(); }}
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
