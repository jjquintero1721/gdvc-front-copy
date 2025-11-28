import React, { useState } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, ArrowUpCircle, AlertCircle } from 'lucide-react';
import './RegisterEntryModal.css'

const RegisterEntryModal = ({ isOpen, onClose, onSuccess, medication }) => {
  const [formData, setFormData] = useState({
    cantidad: 0,
    motivo: '',
    referencia: '',
    observaciones: '',
    costo_unitario: medication?.precio_compra || 0,
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
        tipo: 'entrada',
        cantidad: formData.cantidad,
        motivo: formData.motivo,
        referencia: formData.referencia || null,
        observaciones: formData.observaciones || null,
        costo_unitario: formData.costo_unitario,
      };

      await inventoryService.registerEntry(dataToSend);
      onSuccess();
      // Limpiar formulario
      setFormData({
        cantidad: 0,
        motivo: '',
        referencia: '',
        observaciones: '',
        costo_unitario: medication?.precio_compra || 0,
      });
    } catch (err) {
      console.error('Error completo:', err);

      // ✅ CORRECCIÓN: Manejar correctamente diferentes tipos de errores
      let errorMessage = 'Error al registrar la entrada';

      if (err.response?.data) {
        const errorData = err.response.data;

        // Si es un array de errores de validación (FastAPI)
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map(error => `${error.loc?.join(' → ') || 'Campo'}: ${error.msg}`)
            .join('\n');
        }
        // Si es un string simple
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Si es un objeto con mensaje
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const nuevoStock = (medication?.stock_actual || 0) + formData.cantidad;
  const costoTotal = formData.cantidad * formData.costo_unitario;

  return (
    <div className="medication-modal__overlay">
      <div className="medication-modal__container">
        {/* Header */}
        <div className="entry-modal__header">
          <div className="medication-modal__header-content">
            <div className="medication-modal__title-wrapper">
              <div className="entry-modal__icon-bg">
                <ArrowUpCircle size={24} />
              </div>
              <div className="medication-modal__title-content">
                <h2 className="entry-modal__title">Registrar Entrada</h2>
                <p className="entry-modal__subtitle">{medication?.nombre}</p>
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

        {/* Error Message - ✅ CORRECCIÓN: Renderizar el error correctamente */}
        {error && (
          <div className="medication-modal__body">
            <div className="medication-modal__error">
              <div className="medication-modal__error-content">
                <AlertCircle className="medication-modal__error-icon" size={20} />
                {/* ✅ CORRECCIÓN: Manejar saltos de línea en errores */}
                <div className="medication-modal__error-text">
                  {error.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="medication-modal__body">
          {/* Información Actual */}
          <div className="entry-modal__current-info">
            <h3 className="entry-modal__current-title">Información Actual</h3>
            <div className="entry-modal__current-grid">
              <div className="entry-modal__current-item">
                <p className="entry-modal__current-label">Stock Actual</p>
                <p className="entry-modal__current-value">
                  {medication?.stock_actual} <span className="entry-modal__current-unit">{medication?.unidad_medida}</span>
                </p>
              </div>
              <div className="entry-modal__current-item">
                <p className="entry-modal__current-label">Stock Mínimo</p>
                <p className="entry-modal__current-value">
                  {medication?.stock_minimo} <span className="entry-modal__current-unit">{medication?.unidad_medida}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Cantidad */}
          <div className="medication-form__field">
            <label className="medication-form__label">
              Cantidad a Ingresar <span className="medication-form__required">*</span>
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              required
              min="1"
              className="medication-form__input entry-modal__quantity-input"
              placeholder="0"
            />
            {formData.cantidad > 0 && (
              <div className="entry-modal__new-stock">
                <p className="entry-modal__new-stock-label">Nuevo stock:</p>
                <p className="entry-modal__new-stock-value">
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
              className="medication-form__select entry-modal__reason-select"
            >
              <option value="">Seleccione un motivo</option>
              <option value="Compra mensual a proveedor">Compra mensual a proveedor</option>
              <option value="Compra de emergencia">Compra de emergencia</option>
              <option value="Donación">Donación</option>
              <option value="Devolución de proveedor">Devolución de proveedor</option>
              <option value="Ajuste de inventario">Ajuste de inventario</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Costo Unitario */}
          <div className="medication-form__field">
            <label className="medication-form__label">
              Costo Unitario
            </label>
            <input
              type="number"
              name="costo_unitario"
              value={formData.costo_unitario}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="medication-form__input"
              placeholder="0.00"
            />
            {formData.cantidad > 0 && formData.costo_unitario > 0 && (
              <div className="entry-modal__cost-total">
                <p className="entry-modal__cost-total-label">Costo total:</p>
                <p className="entry-modal__cost-total-value">
                  ${costoTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          {/* Referencia */}
          <div className="medication-form__field">
            <label className="medication-form__label">
              Referencia (Número de Factura/Orden)
            </label>
            <input
              type="text"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              className="medication-form__input"
              placeholder="Ej: FACT-2025-001"
            />
          </div>

          {/* Observaciones */}
          <div className="medication-form__field">
            <label className="medication-form__label">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
              className="medication-form__textarea"
              placeholder="Información adicional sobre esta entrada..."
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
            disabled={loading}
            className="medication-modal__button entry-modal__button--submit"
          >
            {loading ? (
              <>
                <div className="medication-modal__spinner"></div>
                Registrando...
              </>
            ) : (
              <>
                <ArrowUpCircle size={20} />
                Registrar Entrada
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterEntryModal;