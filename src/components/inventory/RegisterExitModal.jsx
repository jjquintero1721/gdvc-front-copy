import React, { useState } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, ArrowDownCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import './RegisterExitModal.css'

const RegisterExitModal = ({ isOpen, onClose, onSuccess, medication }) => {
  const [formData, setFormData] = useState({
    cantidad: 0,
    motivo: '',
    referencia: '',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        medicamento_id: medication.id,
        tipo: 'salida',
        cantidad: formData.cantidad,
        motivo: formData.motivo,
        referencia: formData.referencia || null,
        observaciones: formData.observaciones || null,
      };

      await inventoryService.registerExit(dataToSend);
      onSuccess();
      // Limpiar formulario
      setFormData({
        cantidad: 0,
        motivo: '',
        referencia: '',
        observaciones: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar la salida');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const nuevoStock = Math.max(0, (medication?.stock_actual || 0) - formData.cantidad);
  const isStockInsufficient = formData.cantidad > medication?.stock_actual;
  const willBeLowStock = nuevoStock <= medication?.stock_minimo && nuevoStock > 0;

  return (
    <div className="medication-modal__overlay">
      <div className="medication-modal__container">
        {/* Header */}
        <div className="exit-modal__header">
          <div className="medication-modal__header-content">
            <div className="medication-modal__title-wrapper">
              <div className="exit-modal__icon-bg">
                <ArrowDownCircle size={24} />
              </div>
              <div className="medication-modal__title-content">
                <h2 className="exit-modal__title">Registrar Salida</h2>
                <p className="exit-modal__subtitle">{medication?.nombre}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="medication-modal__close-btn"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="medication-modal__body">
            <div className="medication-modal__error">
              <div className="medication-modal__error-content">
                <AlertCircle className="medication-modal__error-icon" size={20} />
                <p className="medication-modal__error-text">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Warning: Insufficient Stock */}
        {isStockInsufficient && formData.cantidad > 0 && (
          <div className="medication-modal__body">
            <div className="exit-modal__warning">
              <div className="exit-modal__warning-content">
                <AlertTriangle className="exit-modal__warning-icon exit-modal__warning-icon--danger" size={20} />
                <div className="exit-modal__warning-text-container">
                  <p className="exit-modal__warning-title exit-modal__warning-title--danger">Stock insuficiente</p>
                  <p className="exit-modal__warning-text exit-modal__warning-text--danger">
                    Solo hay {medication?.stock_actual} {medication?.unidad_medida} disponibles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning: Low Stock */}
        {willBeLowStock && !isStockInsufficient && (
          <div className="medication-modal__body">
            <div className="exit-modal__warning exit-modal__warning--stock">
              <div className="exit-modal__warning-content">
                <AlertTriangle className="exit-modal__warning-icon exit-modal__warning-icon--warning" size={20} />
                <div className="exit-modal__warning-text-container">
                  <p className="exit-modal__warning-title exit-modal__warning-title--warning">Advertencia de Stock Bajo</p>
                  <p className="exit-modal__warning-text exit-modal__warning-text--warning">
                    El stock quedará por debajo del mínimo ({medication?.stock_minimo} {medication?.unidad_medida})
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="medication-modal__body">
          {/* Información Actual */}
          <div className="exit-modal__current-info">
            <h3 className="exit-modal__current-title">Información Actual</h3>
            <div className="exit-modal__current-grid">
              <div className="exit-modal__current-item">
                <p className="exit-modal__current-label">Stock Actual</p>
                <p className="exit-modal__current-value">
                  {medication?.stock_actual} <span className="exit-modal__current-unit">{medication?.unidad_medida}</span>
                </p>
              </div>
              <div className="exit-modal__current-item">
                <p className="exit-modal__current-label">Stock Mínimo</p>
                <p className="exit-modal__current-value">
                  {medication?.stock_minimo} <span className="exit-modal__current-unit">{medication?.unidad_medida}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Cantidad */}
          <div className="medication-form__field exit-modal__quantity-field">
            <label className="medication-form__label">
              Cantidad a Retirar <span className="medication-form__required">*</span>
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              required
              min="1"
              max={medication?.stock_actual}
              className={`medication-form__input exit-modal__quantity-input ${isStockInsufficient ? 'exit-modal__quantity-input--error' : ''}`}
              placeholder="0"
            />
            {formData.cantidad > 0 && !isStockInsufficient && (
              <div className={`exit-modal__new-stock ${willBeLowStock ? 'exit-modal__new-stock--warning' : ''}`}>
                <p className="exit-modal__new-stock-label">Nuevo stock:</p>
                <p className={`exit-modal__new-stock-value ${willBeLowStock ? 'exit-modal__new-stock-value--warning' : ''}`}>
                  {nuevoStock} {medication?.unidad_medida}
                </p>
              </div>
            )}
          </div>

          {/* Motivo */}
          <div className="medication-form__field">
            <label className="medication-form__label">
              Motivo <span className="medication-form__required">*</span>
            </label>
            <select
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              required
              className="medication-form__select exit-modal__reason-select"
            >
              <option value="">Seleccione un motivo</option>
              <option value="Uso en consulta veterinaria">Uso en consulta veterinaria</option>
              <option value="Aplicación de vacuna">Aplicación de vacuna</option>
              <option value="Tratamiento en hospitalización">Tratamiento en hospitalización</option>
              <option value="Venta directa">Venta directa</option>
              <option value="Medicamento vencido - Desecho">Medicamento vencido - Desecho</option>
              <option value="Medicamento dañado">Medicamento dañado</option>
              <option value="Ajuste de inventario">Ajuste de inventario</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Referencia */}
          <div className="medication-form__field">
            <label className="medication-form__label">
              Referencia (Número de Historia Clínica/Merma)
            </label>
            <input
              type="text"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              className="medication-form__input"
              placeholder="Ej: HC-2025-001 o MERMA-2025-001"
            />
          </div>

          {/* Observaciones */}
          <div className="medication-form__field exit-modal__observations-field">
            <label className="exit-modal__observations-label">
              Observaciones <span className="medication-form__required">*</span>
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              required
              rows="3"
              className="exit-modal__observations-textarea"
              placeholder="Describa el uso del medicamento o el motivo de la salida..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="medication-modal__footer">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="medication-modal__button medication-modal__button--cancel"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || isStockInsufficient}
            className="medication-modal__button exit-modal__button--submit"
          >
            {loading ? (
              <>
                <div className="medication-modal__spinner"></div>
                Registrando...
              </>
            ) : (
              <>
                <ArrowDownCircle size={20} />
                Registrar Salida
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterExitModal;