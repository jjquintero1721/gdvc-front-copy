import React, { useState } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import './DesactivateMedicationModal.css'

const DeactivateMedicationModal = ({ isOpen, onClose, onSuccess, medication }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeactivate = async () => {
    setLoading(true);
    setError(null);

    try {
      await inventoryService.deleteMedication(medication.id);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al desactivar el medicamento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="deactivate-modal__overlay">
      <div className="deactivate-modal__container">
        {/* Header */}
        <div className="deactivate-modal__header">
          <div className="deactivate-modal__header-content">
            <div className="deactivate-modal__title-wrapper">
              <div className="deactivate-modal__icon-bg">
                <AlertTriangle size={24} />
              </div>
              <h2 className="deactivate-modal__title">Confirmar Desactivación</h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="deactivate-modal__close-btn"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="deactivate-modal__body">
          {/* Error Message */}
          {error && (
            <div className="deactivate-modal__error">
              <p className="deactivate-modal__error-text">{error}</p>
            </div>
          )}

          {/* Warning Message */}
          <div className="deactivate-modal__warning">
            <div className="deactivate-modal__warning-content">
              <AlertTriangle className="deactivate-modal__warning-icon" size={20} />
              <div className="deactivate-modal__warning-text-container">
                <p className="deactivate-modal__warning-title">
                  ¿Está seguro que desea desactivar este medicamento?
                </p>
                <p className="deactivate-modal__warning-text">
                  Esta acción realizará un borrado lógico. El medicamento no se eliminará
                  permanentemente, pero no estará disponible para su uso.
                </p>
              </div>
            </div>
          </div>

          {/* Medication Info */}
          <div className="deactivate-modal__medication-info">
            <h3 className="deactivate-modal__medication-title">
              Información del Medicamento
            </h3>
            <div className="deactivate-modal__medication-grid">
              <div className="deactivate-modal__medication-row">
                <span className="deactivate-modal__medication-label">Nombre:</span>
                <span className="deactivate-modal__medication-value">
                  {medication?.nombre}
                </span>
              </div>
              <div className="deactivate-modal__medication-row">
                <span className="deactivate-modal__medication-label">Tipo:</span>
                <span className="deactivate-modal__medication-value deactivate-modal__medication-value--capitalize">
                  {medication?.tipo}
                </span>
              </div>
              <div className="deactivate-modal__medication-row">
                <span className="deactivate-modal__medication-label">Stock Actual:</span>
                <span className="deactivate-modal__medication-value">
                  {medication?.stock_actual} {medication?.unidad_medida}
                </span>
              </div>
              {medication?.lote && (
                <div className="deactivate-modal__medication-row">
                  <span className="deactivate-modal__medication-label">Lote:</span>
                  <span className="deactivate-modal__medication-value">
                    {medication?.lote}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="deactivate-modal__note">
            <p className="deactivate-modal__note-text">
              <span className="deactivate-modal__note-highlight">Nota:</span> Podrá reactivar este medicamento
              más adelante si es necesario.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="deactivate-modal__footer">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="deactivate-modal__button deactivate-modal__button--cancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={loading}
            className="deactivate-modal__button deactivate-modal__button--confirm"
          >
            {loading ? (
              <>
                <div className="deactivate-modal__spinner"></div>
                Desactivando...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Sí, Desactivar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateMedicationModal;