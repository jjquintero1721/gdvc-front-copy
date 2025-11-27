import React, { useState } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, Save, AlertCircle } from 'lucide-react';
import './CreateMedicationModal.css';

const CreateMedicationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'medicamento',
    descripcion: '',
    laboratorio: '',
    stock_actual: 0,
    stock_minimo: 0,
    stock_maximo: 0,
    unidad_medida: 'unidades',
    precio_compra: 0,
    precio_venta: 0,
    lote: '',
    fecha_vencimiento: '',
    ubicacion: '',
    requiere_refrigeracion: false,
    controlado: false,
    enfermedad: '',
    dosis_recomendada: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir valores numéricos
      const dataToSend = {
        ...formData,
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        stock_maximo: parseInt(formData.stock_maximo) || 0,
        precio_compra: parseFloat(formData.precio_compra) || 0,
        precio_venta: parseFloat(formData.precio_venta) || 0,
      };

      // Si hay fecha de vencimiento, formatearla correctamente
      if (dataToSend.fecha_vencimiento) {
        dataToSend.fecha_vencimiento = new Date(dataToSend.fecha_vencimiento).toISOString();
      }

      await inventoryService.createMedication(dataToSend);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el medicamento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="medication-modal__overlay">
      <div className="medication-modal__container">
        {/* Header */}
        <div className="medication-modal__header">
          <div className="medication-modal__header-content">
            <div className="medication-modal__title-wrapper">
              <div className="medication-modal__icon-bg">
                <Save size={24} className="medication-modal__icon" />
              </div>
              <h2 className="medication-modal__title">Nuevo Medicamento</h2>
            </div>
            <button
              onClick={onClose}
              className="medication-modal__close-btn"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="medication-modal__body">
          {error && (
            <div className="medication-modal__error">
              <div className="medication-modal__error-content">
                <AlertCircle className="medication-modal__error-icon" size={20} />
                <p className="medication-modal__error-text">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="medication-form">
            {/* Información Básica */}
            <div className="medication-form__section">
              <h3 className="medication-form__section-title">
                Información Básica
              </h3>
              <div className="medication-form__grid">
                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Nombre del Medicamento <span className="medication-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="medication-form__input"
                    placeholder="Ej: Vacuna Antirrábica Canina"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Tipo <span className="medication-form__required">*</span>
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    className="medication-form__select"
                  >
                    <option value="medicamento">Medicamento</option>
                    <option value="vacuna">Vacuna</option>
                    <option value="suplemento">Suplemento</option>
                    <option value="antiparasitario">Antiparasitario</option>
                    <option value="anestesico">Anestésico</option>
                    <option value="antibiotico">Antibiótico</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="medication-form__field medication-form__field--full">
                  <label className="medication-form__label">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                    className="medication-form__textarea"
                    placeholder="Descripción del medicamento..."
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Laboratorio
                  </label>
                  <input
                    type="text"
                    name="laboratorio"
                    value={formData.laboratorio}
                    onChange={handleChange}
                    className="medication-form__input"
                    placeholder="Ej: Zoetis"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Unidad de Medida
                  </label>
                  <select
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleChange}
                    className="medication-form__select"
                  >
                    <option value="unidades">Unidades</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="gr">Gramos (gr)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="cajas">Cajas</option>
                    <option value="tabletas">Tabletas</option>
                    <option value="capsulas">Cápsulas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="medication-form__section">
              <h3 className="medication-form__section-title">
                Control de Stock
              </h3>
              <div className="medication-form__grid medication-form__grid--three">
                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Stock Actual <span className="medication-form__required">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_actual"
                    value={formData.stock_actual}
                    onChange={handleChange}
                    required
                    min="0"
                    className="medication-form__input"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Stock Mínimo <span className="medication-form__required">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_minimo"
                    value={formData.stock_minimo}
                    onChange={handleChange}
                    required
                    min="0"
                    className="medication-form__input"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Stock Máximo <span className="medication-form__required">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_maximo"
                    value={formData.stock_maximo}
                    onChange={handleChange}
                    required
                    min="0"
                    className="medication-form__input"
                  />
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="medication-form__section">
              <h3 className="medication-form__section-title">
                Información Comercial
              </h3>
              <div className="medication-form__grid">
                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Precio de Compra (COP) <span className="medication-form__required">*</span>
                  </label>
                  <input
                    type="number"
                    name="precio_compra"
                    value={formData.precio_compra}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="medication-form__input"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Precio de Venta (COP) <span className="medication-form__required">*</span>
                  </label>
                  <input
                    type="number"
                    name="precio_venta"
                    value={formData.precio_venta}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="medication-form__input"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Lote
                  </label>
                  <input
                    type="text"
                    name="lote"
                    value={formData.lote}
                    onChange={handleChange}
                    className="medication-form__input"
                    placeholder="Ej: VAC-2025-001"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className="medication-form__input"
                  />
                </div>

                <div className="medication-form__field medication-form__field--full">
                  <label className="medication-form__label">
                    Ubicación en Almacén
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    className="medication-form__input"
                    placeholder="Ej: Refrigerador A - Estante 2"
                  />
                </div>
              </div>
            </div>

            {/* Características Especiales */}
            <div className="medication-form__section">
              <h3 className="medication-form__section-title">
                Características Especiales
              </h3>
              <div className="medication-form__checkboxes">
                <div className="medication-form__checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="requiere_refrigeracion"
                    checked={formData.requiere_refrigeracion}
                    onChange={handleChange}
                    className="medication-form__checkbox"
                    id="requiere_refrigeracion"
                  />
                  <label htmlFor="requiere_refrigeracion" className="medication-form__checkbox-label">
                    Requiere Refrigeración
                  </label>
                </div>

                <div className="medication-form__checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="controlado"
                    checked={formData.controlado}
                    onChange={handleChange}
                    className="medication-form__checkbox"
                    id="controlado"
                  />
                  <label htmlFor="controlado" className="medication-form__checkbox-label">
                    Medicamento Controlado
                  </label>
                </div>
              </div>

              <div className="medication-form__grid">
                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Enfermedad que Trata
                  </label>
                  <input
                    type="text"
                    name="enfermedad"
                    value={formData.enfermedad}
                    onChange={handleChange}
                    className="medication-form__input"
                    placeholder="Ej: Rabia"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Dosis Recomendada
                  </label>
                  <input
                    type="text"
                    name="dosis_recomendada"
                    value={formData.dosis_recomendada}
                    onChange={handleChange}
                    className="medication-form__input"
                    placeholder="Ej: 1 dosis anual"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

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
            className="medication-modal__button medication-modal__button--submit"
          >
            {loading ? (
              <>
                <div className="medication-modal__spinner"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Medicamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMedicationModal;