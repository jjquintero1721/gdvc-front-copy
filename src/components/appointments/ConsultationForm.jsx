import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import './ConsultationForm.css';

/**
 * ConsultationForm - Formulario para crear/editar consultas
 *
 * Permite al veterinario registrar:
 * - Motivo de consulta
 * - Anamnesis
 * - Signos vitales
 * - Diagnóstico
 * - Tratamiento
 * - Vacunas aplicadas
 * - Observaciones
 *
 * @param {Object} consultation - Consulta existente (null si es nueva)
 * @param {Object} appointment - Cita asociada
 * @param {Function} onSubmit - Callback al enviar el formulario
 */
const ConsultationForm = ({ consultation, appointment, onSubmit }) => {
  const [formData, setFormData] = useState({
    motivo: '',
    anamnesis: '',
    signos_vitales: {
      temperatura: '',
      frecuencia_cardiaca: '',
      frecuencia_respiratoria: '',
      peso: '',
      condicion_corporal: ''
    },
    diagnostico: '',
    tratamiento: '',
    vacunas: '',
    observaciones: '',
    descripcion_cambio: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos de la consulta existente
  useEffect(() => {
    if (consultation) {
      setFormData({
        motivo: consultation.motivo || '',
        anamnesis: consultation.anamnesis || '',
        signos_vitales: consultation.signos_vitales || {
          temperatura: '',
          frecuencia_cardiaca: '',
          frecuencia_respiratoria: '',
          peso: '',
          condicion_corporal: ''
        },
        diagnostico: consultation.diagnostico || '',
        tratamiento: consultation.tratamiento || '',
        vacunas: consultation.vacunas || '',
        observaciones: consultation.observaciones || '',
        descripcion_cambio: ''
      });
    }
  }, [consultation]);

  /**
   * Maneja cambios en inputs de texto
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Maneja cambios en signos vitales
   */
  const handleVitalSignChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      signos_vitales: {
        ...prev.signos_vitales,
        [name]: value
      }
    }));
  };

  /**
   * Valida el formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.motivo?.trim()) {
      newErrors.motivo = 'El motivo de consulta es obligatorio';
    }

    if (!formData.diagnostico?.trim()) {
      newErrors.diagnostico = 'El diagnóstico es obligatorio';
    }

    if (!formData.tratamiento?.trim()) {
      newErrors.tratamiento = 'El tratamiento es obligatorio';
    }

    // Si es actualización, requerir descripción del cambio
    if (consultation && !formData.descripcion_cambio?.trim()) {
      newErrors.descripcion_cambio = 'Debes describir los cambios realizados';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);

      // Si es creación, limpiar el formulario
      if (!consultation) {
        setFormData({
          motivo: '',
          anamnesis: '',
          signos_vitales: {
            temperatura: '',
            frecuencia_cardiaca: '',
            frecuencia_respiratoria: '',
            peso: '',
            condicion_corporal: ''
          },
          diagnostico: '',
          tratamiento: '',
          vacunas: '',
          observaciones: '',
          descripcion_cambio: ''
        });
      } else {
        // Si es actualización, solo limpiar la descripción del cambio
        setFormData(prev => ({
          ...prev,
          descripcion_cambio: ''
        }));
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="consultation-form">
      {/* Información de la cita */}
      <div className="consultation-form-info">
        <h3 className="consultation-form-section-title">
          {consultation ? 'Editar Consulta' : 'Nueva Consulta'}
        </h3>
        <div className="consultation-form-info-grid">
          <div>
            <span className="consultation-form-label">Mascota:</span>
            <span className="consultation-form-value">{appointment.mascota?.nombre}</span>
          </div>
          <div>
            <span className="consultation-form-label">Especie:</span>
            <span className="consultation-form-value">{appointment.mascota?.especie}</span>
          </div>
          <div>
            <span className="consultation-form-label">Raza:</span>
            <span className="consultation-form-value">{appointment.mascota?.raza}</span>
          </div>
        </div>
      </div>

      {/* Motivo de consulta */}
      <div className="consultation-form-field">
        <label className="consultation-form-label">
          Motivo de Consulta <span className="required">*</span>
        </label>
        <textarea
          name="motivo"
          value={formData.motivo}
          onChange={handleInputChange}
          className={`consultation-form-textarea ${errors.motivo ? 'error' : ''}`}
          placeholder="Describe el motivo principal de la consulta..."
          rows="3"
        />
        {errors.motivo && (
          <span className="consultation-form-error">
            <AlertCircle size={16} />
            {errors.motivo}
          </span>
        )}
      </div>

      {/* Anamnesis */}
      <div className="consultation-form-field">
        <label className="consultation-form-label">Anamnesis</label>
        <textarea
          name="anamnesis"
          value={formData.anamnesis}
          onChange={handleInputChange}
          className="consultation-form-textarea"
          placeholder="Historia clínica relevante, síntomas reportados por el propietario..."
          rows="4"
        />
      </div>

      {/* Signos Vitales */}
      <div className="consultation-form-section">
        <h4 className="consultation-form-section-title">Signos Vitales</h4>
        <div className="consultation-form-grid">
          <div className="consultation-form-field">
            <label className="consultation-form-label">Temperatura (°C)</label>
            <input
              type="number"
              step="0.1"
              name="temperatura"
              value={formData.signos_vitales.temperatura}
              onChange={handleVitalSignChange}
              className="consultation-form-input"
              placeholder="38.5"
            />
          </div>

          <div className="consultation-form-field">
            <label className="consultation-form-label">Frecuencia Cardíaca (lpm)</label>
            <input
              type="number"
              name="frecuencia_cardiaca"
              value={formData.signos_vitales.frecuencia_cardiaca}
              onChange={handleVitalSignChange}
              className="consultation-form-input"
              placeholder="120"
            />
          </div>

          <div className="consultation-form-field">
            <label className="consultation-form-label">Frecuencia Respiratoria (rpm)</label>
            <input
              type="number"
              name="frecuencia_respiratoria"
              value={formData.signos_vitales.frecuencia_respiratoria}
              onChange={handleVitalSignChange}
              className="consultation-form-input"
              placeholder="30"
            />
          </div>

          <div className="consultation-form-field">
            <label className="consultation-form-label">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              name="peso"
              value={formData.signos_vitales.peso}
              onChange={handleVitalSignChange}
              className="consultation-form-input"
              placeholder="15.5"
            />
          </div>

          <div className="consultation-form-field">
            <label className="consultation-form-label">Condición Corporal (1-9)</label>
            <input
              type="number"
              min="1"
              max="9"
              name="condicion_corporal"
              value={formData.signos_vitales.condicion_corporal}
              onChange={handleVitalSignChange}
              className="consultation-form-input"
              placeholder="5"
            />
          </div>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="consultation-form-field">
        <label className="consultation-form-label">
          Diagnóstico <span className="required">*</span>
        </label>
        <textarea
          name="diagnostico"
          value={formData.diagnostico}
          onChange={handleInputChange}
          className={`consultation-form-textarea ${errors.diagnostico ? 'error' : ''}`}
          placeholder="Diagnóstico clínico, resultados de exámenes..."
          rows="4"
        />
        {errors.diagnostico && (
          <span className="consultation-form-error">
            <AlertCircle size={16} />
            {errors.diagnostico}
          </span>
        )}
      </div>

      {/* Tratamiento */}
      <div className="consultation-form-field">
        <label className="consultation-form-label">
          Tratamiento <span className="required">*</span>
        </label>
        <textarea
          name="tratamiento"
          value={formData.tratamiento}
          onChange={handleInputChange}
          className={`consultation-form-textarea ${errors.tratamiento ? 'error' : ''}`}
          placeholder="Medicamentos prescritos, dosis, frecuencia..."
          rows="4"
        />
        {errors.tratamiento && (
          <span className="consultation-form-error">
            <AlertCircle size={16} />
            {errors.tratamiento}
          </span>
        )}
      </div>

      {/* Vacunas */}
      <div className="consultation-form-field">
        <label className="consultation-form-label">Vacunas Aplicadas</label>
        <textarea
          name="vacunas"
          value={formData.vacunas}
          onChange={handleInputChange}
          className="consultation-form-textarea"
          placeholder="Vacunas aplicadas durante la consulta..."
          rows="2"
        />
      </div>

      {/* Observaciones */}
      <div className="consultation-form-field">
        <label className="consultation-form-label">Observaciones Adicionales</label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleInputChange}
          className="consultation-form-textarea"
          placeholder="Notas adicionales, recomendaciones, seguimiento..."
          rows="3"
        />
      </div>

      {/* Descripción del cambio (solo en edición) */}
      {consultation && (
        <div className="consultation-form-field">
          <label className="consultation-form-label">
            Descripción del Cambio <span className="required">*</span>
          </label>
          <input
            type="text"
            name="descripcion_cambio"
            value={formData.descripcion_cambio}
            onChange={handleInputChange}
            className={`consultation-form-input ${errors.descripcion_cambio ? 'error' : ''}`}
            placeholder="Ej: Actualización de tratamiento, corrección de diagnóstico..."
          />
          {errors.descripcion_cambio && (
            <span className="consultation-form-error">
              <AlertCircle size={16} />
              {errors.descripcion_cambio}
            </span>
          )}
          <p className="consultation-form-hint">
            Esta información quedará registrada en el historial de versiones
          </p>
        </div>
      )}

      {/* Botón de envío */}
      <div className="consultation-form-actions">
        <button
          type="submit"
          disabled={isSubmitting}
          className="consultation-form-submit"
        >
          <Save size={18} />
          {isSubmitting ? 'Guardando...' : (consultation ? 'Actualizar Consulta' : 'Crear Consulta')}
        </button>
      </div>
    </form>
  );
};

export default ConsultationForm;