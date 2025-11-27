import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, Save, AlertCircle, Info } from 'lucide-react';
import './UpdateMedicationModal.css';

const UpdateMedicationModal = ({ isOpen, onClose, onSuccess, medication }) => {
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

  useEffect(() => {
    if (medication) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        nombre: medication.nombre || '',
        tipo: medication.tipo || 'medicamento',
        descripcion: medication.descripcion || '',
        laboratorio: medication.laboratorio || '',
        stock_actual: medication.stock_actual || 0,
        stock_minimo: medication.stock_minimo || 0,
        stock_maximo: medication.stock_maximo || 0,
        unidad_medida: medication.unidad_medida || 'unidades',
        precio_compra: medication.precio_compra || 0,
        precio_venta: medication.precio_venta || 0,
        lote: medication.lote || '',
        fecha_vencimiento: formatDateForInput(medication.fecha_vencimiento),
        ubicacion: medication.ubicacion || '',
        requiere_refrigeracion: medication.requiere_refrigeracion || false,
        controlado: medication.controlado || false,
        enfermedad: medication.enfermedad || '',
        dosis_recomendada: medication.dosis_recomendada || '',
      });
    }
  }, [medication]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        fecha_vencimiento: formData.fecha_vencimiento
          ? new Date(formData.fecha_vencimiento).toISOString()
          : null,
      };

      await inventoryService.updateMedication(medication.id, dataToSend);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el medicamento');
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
        <div className="update-medication-modal__header">
          <div className="medication-modal__header-content">
            <div className="medication-modal__title-wrapper">
              <div className="update-medication-modal__icon-bg">
                <Save size={24} className="medication-modal__icon" />
              </div>
              <h2 className="medication-modal__title">Actualizar Medicamento</h2>
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

        {/* Información actual */}
        {medication && (
          <div className="update-medication-modal__current-info">
            <h3 className="update-medication-modal__current-title">
              <Info size={16} />
              Información Actual
            </h3>
            <div className="update-medication-modal__current-grid">
              <div className="update-medication-modal__current-item">
                <span className="update-medication-modal__current-label">Stock Actual:</span>
                <span className="update-medication-modal__current-value">
                  {medication.stock_actual} {medication.unidad_medida}
                </span>
              </div>
              <div className="update-medication-modal__current-item">
                <span className="update-medication-modal__current-label">Última Actualización:</span>
                <span className="update-medication-modal__current-value">
                  {new Date(medication.updated_at || medication.created_at).toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        )}

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
              <h3 className="medication-form__section-title">Información Básica</h3>
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
                  <label className="medication-form__label">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                    className="medication-form__textarea"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">Laboratorio</label>
                  <input
                    type="text"
                    name="laboratorio"
                    value={formData.laboratorio}
                    onChange={handleChange}
                    className="medication-form__input"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Unidad de Medida <span className="medication-form__required">*</span>
                  </label>
                  <select
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleChange}
                    required
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
              <h3 className="medication-form__section-title">Control de Stock</h3>
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
              <h3 className="medication-form__section-title">Información Comercial</h3>
              <div className="medication-form__grid">
                <div className="medication-form__field">
                  <label className="medication-form__label">
                    Precio de Compra <span className="medication-form__required">*</span>
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
                    Precio de Venta <span className="medication-form__required">*</span>
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
              </div>
            </div>

            {/* Información de Control */}
            <div className="medication-form__section">
              <h3 className="medication-form__section-title">Información de Control</h3>
              <div className="medication-form__grid">
                <div className="medication-form__field">
                  <label className="medication-form__label">Lote</label>
                  <input
                    type="text"
                    name="lote"
                    value={formData.lote}
                    onChange={handleChange}
                    className="medication-form__input"
                  />
                </div>

                <div className="medication-form__field">
                  <label className="medication-form__label">Fecha de Vencimiento</label>
                  <input
                    type="datetime-local"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className="medication-form__input"
                  />
                </div>

                <div className="medication-form__field medication-form__field--full">
                  <label className="medication-form__label">Ubicación</label>
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

              <div className="medication-form__checkboxes">
                <div className="medication-form__checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="requiere_refrigeracion"
                    checked={formData.requiere_refrigeracion}
                    onChange={handleChange}
                    className="medication-form__checkbox"
                    id="requiere_refrigeracion_update"
                  />
                  <label htmlFor="requiere_refrigeracion_update" className="medication-form__checkbox-label">
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
                    id="controlado_update"
                  />
                  <label htmlFor="controlado_update" className="medication-form__checkbox-label">
                    Medicamento Controlado
                  </label>
                </div>
              </div>
            </div>

            {/* Información Médica */}
            {(formData.tipo === 'vacuna' || formData.tipo === 'medicamento') && (
              <div className="medication-form__section">
                <h3 className="medication-form__section-title">Información Médica</h3>
                <div className="medication-form__grid">
                  <div className="medication-form__field">
                    <label className="medication-form__label">Enfermedad que Trata</label>
                    <input
                      type="text"
                      name="enfermedad"
                      value={formData.enfermedad}
                      onChange={handleChange}
                      className="medication-form__input"
                    />
                  </div>

                  <div className="medication-form__field">
                    <label className="medication-form__label">Dosis Recomendada</label>
                    <input
                      type="text"
                      name="dosis_recomendada"
                      value={formData.dosis_recomendada}
                      onChange={handleChange}
                      className="medication-form__input"
                    />
                  </div>
                </div>
              </div>
            )}
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
            className="medication-modal__button medication-modal__button--update"
          >
            {loading ? (
              <>
                <div className="medication-modal__spinner"></div>
                Actualizando...
              </>
            ) : (
              <>
                <Save size={20} />
                Actualizar Medicamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateMedicationModal;