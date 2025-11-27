import React, { useState } from 'react';
import { Plus, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './FollowUpForm.css';

/**
 * FollowUpForm - Formulario para crear seguimientos
 *
 * Permite al veterinario programar citas de seguimiento vinculadas
 * a la consulta actual (ej: control post-operatorio, revisión).
 *
 * @param {Object} consultation - Consulta origen
 * @param {Array} existingFollowUps - Seguimientos ya creados
 * @param {Function} onSubmit - Callback al crear seguimiento
 */
const FollowUpForm = ({ consultation, existingFollowUps = [], onSubmit }) => {
  const [formData, setFormData] = useState({
    fecha_hora: '',
    motivo: '',
    notas: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja cambios en los inputs
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
   * Valida el formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha_hora) {
      newErrors.fecha_hora = 'La fecha y hora del seguimiento son obligatorias';
    } else {
      const selectedDate = new Date(formData.fecha_hora);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.fecha_hora = 'La fecha debe ser futura';
      }
    }

    if (!formData.motivo?.trim()) {
      newErrors.motivo = 'El motivo del seguimiento es obligatorio';
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
      await onSubmit({
        fecha_hora: formData.fecha_hora,
        motivo: formData.motivo,
        notas: formData.notas || null
      });

      // Limpiar formulario
      setFormData({
        fecha_hora: '',
        motivo: '',
        notas: ''
      });
    } catch (error) {
      console.error('Error al crear seguimiento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Sugiere fechas comunes para seguimiento
   */
  const suggestDate = (days) => {
    const suggestedDate = addDays(new Date(), days);
    // Formato: YYYY-MM-DDTHH:MM (datetime-local input)
    const formattedDate = format(suggestedDate, "yyyy-MM-dd'T'09:00");
    setFormData(prev => ({
      ...prev,
      fecha_hora: formattedDate
    }));
  };

  return (
    <div className="followup-form-container">
      {/* Seguimientos existentes */}
      {existingFollowUps.length > 0 && (
        <div className="followup-form-existing">
          <h3 className="followup-form-section-title">
            Seguimientos Programados ({existingFollowUps.length})
          </h3>
          <div className="followup-form-list">
            {existingFollowUps.map((followUp) => (
              <FollowUpItem key={followUp.id} followUp={followUp} />
            ))}
          </div>
        </div>
      )}

      {/* Formulario de nuevo seguimiento */}
      <form onSubmit={handleSubmit} className="followup-form">
        <div className="followup-form-header">
          <h3 className="followup-form-section-title">
            <Plus size={20} />
            Programar Nuevo Seguimiento
          </h3>
          <p className="followup-form-subtitle">
            Crea una cita de control vinculada a esta consulta
          </p>
        </div>

        {/* Sugerencias rápidas de fecha */}
        <div className="followup-form-quick-dates">
          <span className="followup-form-label">Sugerencias rápidas:</span>
          <div className="followup-form-quick-btns">
            <button
              type="button"
              onClick={() => suggestDate(7)}
              className="followup-form-quick-btn"
            >
              En 1 semana
            </button>
            <button
              type="button"
              onClick={() => suggestDate(15)}
              className="followup-form-quick-btn"
            >
              En 15 días
            </button>
            <button
              type="button"
              onClick={() => suggestDate(30)}
              className="followup-form-quick-btn"
            >
              En 1 mes
            </button>
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="followup-form-field">
          <label className="followup-form-label">
            <Calendar size={16} />
            Fecha y Hora del Seguimiento <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            name="fecha_hora"
            value={formData.fecha_hora}
            onChange={handleInputChange}
            className={`followup-form-input ${errors.fecha_hora ? 'error' : ''}`}
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
          />
          {errors.fecha_hora && (
            <span className="followup-form-error">
              <AlertCircle size={16} />
              {errors.fecha_hora}
            </span>
          )}
        </div>

        {/* Motivo */}
        <div className="followup-form-field">
          <label className="followup-form-label">
            Motivo del Seguimiento <span className="required">*</span>
          </label>
          <input
            type="text"
            name="motivo"
            value={formData.motivo}
            onChange={handleInputChange}
            className={`followup-form-input ${errors.motivo ? 'error' : ''}`}
            placeholder="Ej: Control post-operatorio, revisión de tratamiento..."
          />
          {errors.motivo && (
            <span className="followup-form-error">
              <AlertCircle size={16} />
              {errors.motivo}
            </span>
          )}
        </div>

        {/* Notas adicionales */}
        <div className="followup-form-field">
          <label className="followup-form-label">
            Notas Adicionales (opcional)
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleInputChange}
            className="followup-form-textarea"
            placeholder="Indicaciones especiales, recomendaciones para el seguimiento..."
            rows="3"
          />
        </div>

        {/* Botón de envío */}
        <div className="followup-form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="followup-form-submit"
          >
            <Plus size={18} />
            {isSubmitting ? 'Programando...' : 'Programar Seguimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * FollowUpItem - Item individual de seguimiento programado
 */
const FollowUpItem = ({ followUp }) => {
  const fechaHora = followUp.fecha_hora
    ? format(parseISO(followUp.fecha_hora), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
    : 'Fecha no disponible';

  const isCompleted = followUp.estado === 'completada';
  const isCanceled = followUp.estado === 'cancelada';

  return (
    <div className={`followup-item ${isCompleted ? 'completed' : ''} ${isCanceled ? 'canceled' : ''}`}>
      <div className="followup-item-header">
        <div className="followup-item-icon">
          {isCompleted ? (
            <CheckCircle size={20} />
          ) : (
            <Clock size={20} />
          )}
        </div>
        <div className="followup-item-info">
          <h4 className="followup-item-title">{followUp.motivo}</h4>
          <p className="followup-item-date">
            <Calendar size={14} />
            {fechaHora}
          </p>
          {followUp.notas && (
            <p className="followup-item-notes">{followUp.notas}</p>
          )}
        </div>
        <div className={`followup-item-status followup-item-status--${followUp.estado}`}>
          {followUp.estado}
        </div>
      </div>
    </div>
  );
};

export default FollowUpForm;