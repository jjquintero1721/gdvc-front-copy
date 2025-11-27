import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import './ConsultationForm.css';

const ConsultationForm = ({ consultation, appointment, onSubmit, onComplete, onRestoreVersion, history = [] }) => {
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
  const [confirmCompleteDialog, setConfirmCompleteDialog] = useState(false);
  const [confirmRestoreDialog, setConfirmRestoreDialog] = useState({
    isOpen: false,
    version: null,
    versionData: null
  });

  useEffect(() => {
    if (consultation) {
      let signosVitalesObj = {
        temperatura: '',
        frecuencia_cardiaca: '',
        frecuencia_respiratoria: '',
        peso: '',
        condicion_corporal: ''
      };

      if (consultation.signos_vitales) {
        try {
          if (typeof consultation.signos_vitales === 'string') {
            try {
              signosVitalesObj = JSON.parse(consultation.signos_vitales);
            } catch {
              console.log('Signos vitales en formato texto:', consultation.signos_vitales);
            }
          } else if (typeof consultation.signos_vitales === 'object') {
            signosVitalesObj = consultation.signos_vitales;
          }
        } catch (error) {
          console.error('Error al parsear signos vitales:', error);
        }
      }

      setFormData({
        motivo: consultation.motivo || '',
        anamnesis: consultation.anamnesis || '',
        signos_vitales: signosVitalesObj,
        diagnostico: consultation.diagnostico || '',
        tratamiento: consultation.tratamiento || '',
        vacunas: consultation.vacunas || '',
        observaciones: consultation.observaciones || '',
        descripcion_cambio: ''
      });
    }
  }, [consultation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

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

  const formatSignosVitales = () => {
    const sv = formData.signos_vitales;
    if (!sv.temperatura && !sv.frecuencia_cardiaca && !sv.frecuencia_respiratoria &&
        !sv.peso && !sv.condicion_corporal) {
      return null;
    }
    const partes = [];
    if (sv.temperatura) partes.push(`Temperatura: ${sv.temperatura}°C`);
    if (sv.frecuencia_cardiaca) partes.push(`FC: ${sv.frecuencia_cardiaca} lpm`);
    if (sv.frecuencia_respiratoria) partes.push(`FR: ${sv.frecuencia_respiratoria} rpm`);
    if (sv.peso) partes.push(`Peso: ${sv.peso} kg`);
    if (sv.condicion_corporal) partes.push(`Condición Corporal: ${sv.condicion_corporal}/9`);
    return partes.join(', ');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.motivo?.trim()) {
      newErrors.motivo = 'El motivo de consulta es obligatorio';
    } else if (formData.motivo.trim().length < 5) {
      newErrors.motivo = 'El motivo debe tener al menos 5 caracteres';
    } else if (formData.motivo.length > 300) {
      newErrors.motivo = 'El motivo no puede exceder 300 caracteres';
    }
    if (!formData.diagnostico?.trim()) {
      newErrors.diagnostico = 'El diagnóstico es obligatorio';
    } else if (formData.diagnostico.trim().length < 10) {
      newErrors.diagnostico = 'El diagnóstico debe tener al menos 10 caracteres';
    }
    if (!formData.tratamiento?.trim()) {
      newErrors.tratamiento = 'El tratamiento es obligatorio';
    } else if (formData.tratamiento.trim().length < 5) {
      newErrors.tratamiento = 'El tratamiento debe tener al menos 5 caracteres';
    }
    if (consultation && !formData.descripcion_cambio?.trim()) {
      newErrors.descripcion_cambio = 'Debes describir los cambios realizados';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        motivo: formData.motivo.trim(),
        diagnostico: formData.diagnostico.trim(),
        tratamiento: formData.tratamiento.trim(),
        anamnesis: formData.anamnesis?.trim() || null,
        signos_vitales: formatSignosVitales(),
        vacunas: formData.vacunas?.trim() || null,
        observaciones: formData.observaciones?.trim() || null
      };
      if (consultation) {
        payload.descripcion_cambio = formData.descripcion_cambio.trim();
      }
      console.log('📤 Enviando payload:', payload);
      await onSubmit(payload);
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
        setErrors({});
      } else {
        setFormData(prev => ({
          ...prev,
          descripcion_cambio: ''
        }));
      }
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Error al guardar la consulta'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCompleteDialog = () => {
    if (!consultation) {
      setErrors(prev => ({
        ...prev,
        submit: 'Debe guardar la consulta antes de completarla'
      }));
      return;
    }
    setConfirmCompleteDialog(true);
  };

  const handleCompleteConfirmed = async () => {
    setIsSubmitting(true);
    try {
      await onComplete();
      setConfirmCompleteDialog(false);
    } catch (error) {
      console.error('❌ Error al completar consulta:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Error al completar la consulta'
      }));
      setConfirmCompleteDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRestoreDialog = (versionData) => {
    setConfirmRestoreDialog({
      isOpen: true,
      version: versionData.version,
      versionData: versionData
    });
  };

  const handleRestoreVersionConfirmed = async () => {
    if (!confirmRestoreDialog.version) return;
    setIsSubmitting(true);
    try {
      await onRestoreVersion(confirmRestoreDialog.version);
      setConfirmRestoreDialog({ isOpen: false, version: null, versionData: null });
    } catch (error) {
      console.error('❌ Error al restaurar versión:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Error al restaurar la versión'
      }));
      setConfirmRestoreDialog({ isOpen: false, version: null, versionData: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="consultation-form">
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

        {errors.submit && (
          <div className="consultation-form-error-banner">
            <AlertCircle size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        <div className="consultation-form-field">
          <label className="consultation-form-label">
            Motivo de Consulta <span className="required">*</span>
          </label>
          <textarea
            name="motivo"
            value={formData.motivo}
            onChange={handleInputChange}
            className={`consultation-form-textarea ${errors.motivo ? 'error' : ''}`}
            placeholder="Describe el motivo principal de la consulta... (mínimo 5 caracteres)"
            rows="3"
            maxLength={300}
          />
          <div className="consultation-form-char-count">
            {formData.motivo.length}/300 caracteres
          </div>
          {errors.motivo && (
            <span className="consultation-form-error">
              <AlertCircle size={16} />
              {errors.motivo}
            </span>
          )}
        </div>

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

        <div className="consultation-form-section">
          <h4 className="consultation-form-section-title">Signos Vitales (Opcional)</h4>
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

        <div className="consultation-form-field">
          <label className="consultation-form-label">
            Diagnóstico <span className="required">*</span>
          </label>
          <textarea
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleInputChange}
            className={`consultation-form-textarea ${errors.diagnostico ? 'error' : ''}`}
            placeholder="Diagnóstico clínico, resultados de exámenes... (mínimo 10 caracteres)"
            rows="4"
          />
          <div className="consultation-form-char-count">
            {formData.diagnostico.length} caracteres
          </div>
          {errors.diagnostico && (
            <span className="consultation-form-error">
              <AlertCircle size={16} />
              {errors.diagnostico}
            </span>
          )}
        </div>

        <div className="consultation-form-field">
          <label className="consultation-form-label">
            Tratamiento <span className="required">*</span>
          </label>
          <textarea
            name="tratamiento"
            value={formData.tratamiento}
            onChange={handleInputChange}
            className={`consultation-form-textarea ${errors.tratamiento ? 'error' : ''}`}
            placeholder="Medicamentos prescritos, dosis, frecuencia... (mínimo 5 caracteres)"
            rows="4"
          />
          <div className="consultation-form-char-count">
            {formData.tratamiento.length} caracteres
          </div>
          {errors.tratamiento && (
            <span className="consultation-form-error">
              <AlertCircle size={16} />
              {errors.tratamiento}
            </span>
          )}
        </div>

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

        <div className="consultation-form-actions">
          <button type="submit" disabled={isSubmitting} className="consultation-form-submit">
            <Save size={18} />
            {isSubmitting ? 'Guardando...' : (consultation ? 'Actualizar Consulta' : 'Crear Consulta')}
          </button>
          {consultation && onComplete && (
            <button type="button" onClick={openCompleteDialog} disabled={isSubmitting} className="consultation-form-complete">
              Completar Cita
            </button>
          )}
        </div>
      </form>

      {history && history.length > 0 && (
        <div className="consultation-form-history">
          <h4 className="consultation-form-section-title">Historial de Versiones</h4>
          {history.map((versionItem, index) => (
            <div key={index} className="consultation-form-history-item">
              <div>
                <span>v{versionItem.version}</span>
                <span>{new Date(versionItem.fecha_creacion).toLocaleString('es-CO')}</span>
              </div>
              <button type="button" onClick={() => openRestoreDialog(versionItem)} disabled={isSubmitting}>
                Restaurar
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmCompleteDialog}
        onClose={() => !isSubmitting && setConfirmCompleteDialog(false)}
        onConfirm={handleCompleteConfirmed}
        variant="success"
        title="¿Estás seguro de que deseas completar esta cita?"
        message="Esta acción cambiará el estado de la cita a 'Completada' y no se podrá deshacer."
        confirmText="Aceptar"
        cancelText="Cancelar"
        isLoading={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={confirmRestoreDialog.isOpen}
        onClose={() => !isSubmitting && setConfirmRestoreDialog({ isOpen: false, version: null, versionData: null })}
        onConfirm={handleRestoreVersionConfirmed}
        variant="restore"
        title={`¿Estás seguro de que deseas restaurar la versión ${confirmRestoreDialog.version}?`}
        message="Esto creará una nueva versión con estos datos."
        confirmText="Aceptar"
        cancelText="Cancelar"
        isLoading={isSubmitting}
      >
        {confirmRestoreDialog.versionData && (
          <div style={{ textAlign: 'left', fontSize: '0.875rem' }}>
            <p><strong>Fecha:</strong> {new Date(confirmRestoreDialog.versionData.fecha_creacion).toLocaleString('es-CO')}</p>
            {confirmRestoreDialog.versionData.motivo && (
              <p><strong>Motivo:</strong> {confirmRestoreDialog.versionData.motivo.substring(0, 50)}...</p>
            )}
          </div>
        )}
      </ConfirmationDialog>
    </>
  );
};

export default ConsultationForm;