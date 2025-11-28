import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import {
  TRIAGE_GENERAL_STATE,
  TRIAGE_DOLOR,
  TRIAGE_SI_NO_OPTIONS,
  TRIAGE_VALIDATION,
  TRIAGE_HELP_MESSAGES,
  SIGNOS_VITALES_RANGOS
} from '@/utils/triageConstants'
import './TriageForm.css'

/**
 * Componente TriageForm
 * Formulario reutilizable para crear o editar un triage
 *
 * @param {Object} initialData - Datos iniciales (para edición)
 * @param {Function} onSubmit - Callback al enviar el formulario
 * @param {Function} onCancel - Callback al cancelar
 * @param {boolean} loading - Estado de carga
 * @param {string} mascotaId - ID de la mascota (obligatorio si no viene en initialData)
 * @param {string} citaId - ID de la cita (opcional)
 */
function TriageForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  mascotaId = null,
  citaId = null
}) {
  const [formData, setFormData] = useState({
    mascota_id: mascotaId || initialData?.mascota_id || '',
    cita_id: citaId || initialData?.cita_id || '',
    estado_general: initialData?.estado_general || TRIAGE_GENERAL_STATE.ALERTA,
    fc: initialData?.fc || '',
    fr: initialData?.fr || '',
    temperatura: initialData?.temperatura || '',
    dolor: initialData?.dolor || TRIAGE_DOLOR.AUSENTE,
    sangrado: initialData?.sangrado || 'No',
    shock: initialData?.shock || 'No',
    observaciones: initialData?.observaciones || ''
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [showRangos, setShowRangos] = useState(false)

  // Validación del formulario
  const validateForm = () => {
    const errors = {}

    // Mascota ID obligatorio
    if (!formData.mascota_id) {
      errors.mascota_id = 'La mascota es obligatoria'
    }

    // Frecuencia Cardíaca
    if (!formData.fc) {
      errors.fc = 'La frecuencia cardíaca es obligatoria'
    } else if (formData.fc < TRIAGE_VALIDATION.fc.min || formData.fc > TRIAGE_VALIDATION.fc.max) {
      errors.fc = TRIAGE_VALIDATION.fc.message
    }

    // Frecuencia Respiratoria
    if (!formData.fr) {
      errors.fr = 'La frecuencia respiratoria es obligatoria'
    } else if (formData.fr < TRIAGE_VALIDATION.fr.min || formData.fr > TRIAGE_VALIDATION.fr.max) {
      errors.fr = TRIAGE_VALIDATION.fr.message
    }

    // Temperatura
    if (!formData.temperatura) {
      errors.temperatura = 'La temperatura es obligatoria'
    } else if (formData.temperatura < TRIAGE_VALIDATION.temperatura.min || formData.temperatura > TRIAGE_VALIDATION.temperatura.max) {
      errors.temperatura = TRIAGE_VALIDATION.temperatura.message
    }

    // Observaciones (obligatorias si hay signos de urgencia)
    const esUrgente = formData.estado_general === TRIAGE_GENERAL_STATE.CRITICO ||
                      formData.dolor === TRIAGE_DOLOR.SEVERO ||
                      formData.sangrado === 'Si' ||
                      formData.shock === 'Si'

    if (esUrgente && (!formData.observaciones || formData.observaciones.length < TRIAGE_VALIDATION.observaciones.minLength)) {
      errors.observaciones = TRIAGE_VALIDATION.observaciones.message
    }

    return errors
  }

  // Manejador de cambios
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Limpiar error del campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Manejador del submit
  const handleSubmit = (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    // Preparar datos para enviar
    const dataToSend = {
      ...formData,
      fc: parseInt(formData.fc),
      fr: parseInt(formData.fr),
      temperatura: parseFloat(formData.temperatura)
    }

    // Si no hay cita_id, no lo enviamos
    if (!dataToSend.cita_id) {
      delete dataToSend.cita_id
    }

    onSubmit(dataToSend)
  }

  return (
    <form onSubmit={handleSubmit} className="triage-form">
      {/* Advertencia de signos vitales */}
      {showRangos && (
        <Alert
          type="info"
          message="Rangos de referencia de signos vitales"
          onClose={() => setShowRangos(false)}
        >
          <ul className="triage-form__rangos">
            <li>{SIGNOS_VITALES_RANGOS.fc.perro.label}</li>
            <li>{SIGNOS_VITALES_RANGOS.fc.gato.label}</li>
            <li>{SIGNOS_VITALES_RANGOS.fr.normal.label}</li>
            <li>{SIGNOS_VITALES_RANGOS.temperatura.normal.label}</li>
          </ul>
        </Alert>
      )}

      {/* Botón para mostrar rangos */}
      <div className="triage-form__help">
        <button
          type="button"
          className="triage-form__help-button"
          onClick={() => setShowRangos(!showRangos)}
        >
          {showRangos ? '✕' : 'ℹ️'} Ver rangos normales de signos vitales
        </button>
      </div>

      {/* Estado General */}
      <div className="triage-form__field">
        <label htmlFor="estado_general" className="triage-form__label">
          Estado General <span className="triage-form__required">*</span>
        </label>
        <select
          id="estado_general"
          name="estado_general"
          value={formData.estado_general}
          onChange={handleChange}
          className="triage-form__select"
          disabled={loading}
        >
          {Object.entries(TRIAGE_GENERAL_STATE).map(([key, value]) => (
            <option key={value} value={value}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {fieldErrors.estado_general && (
          <p className="triage-form__error">{fieldErrors.estado_general}</p>
        )}
      </div>

      {/* Signos Vitales */}
      <div className="triage-form__vitals-grid">
        {/* FC */}
        <Input
          label="Frecuencia Cardíaca (lpm)"
          type="number"
          name="fc"
          value={formData.fc}
          onChange={handleChange}
          placeholder="Ej: 120"
          error={fieldErrors.fc}
          helperText={TRIAGE_HELP_MESSAGES.fc}
          disabled={loading}
          required
          min={TRIAGE_VALIDATION.fc.min}
          max={TRIAGE_VALIDATION.fc.max}
        />

        {/* FR */}
        <Input
          label="Frecuencia Respiratoria (rpm)"
          type="number"
          name="fr"
          value={formData.fr}
          onChange={handleChange}
          placeholder="Ej: 25"
          error={fieldErrors.fr}
          helperText={TRIAGE_HELP_MESSAGES.fr}
          disabled={loading}
          required
          min={TRIAGE_VALIDATION.fr.min}
          max={TRIAGE_VALIDATION.fr.max}
        />

        {/* Temperatura */}
        <Input
          label="Temperatura (°C)"
          type="number"
          step="0.1"
          name="temperatura"
          value={formData.temperatura}
          onChange={handleChange}
          placeholder="Ej: 38.5"
          error={fieldErrors.temperatura}
          helperText={TRIAGE_HELP_MESSAGES.temperatura}
          disabled={loading}
          required
          min={TRIAGE_VALIDATION.temperatura.min}
          max={TRIAGE_VALIDATION.temperatura.max}
        />
      </div>

      {/* Dolor */}
      <div className="triage-form__field">
        <label htmlFor="dolor" className="triage-form__label">
          Nivel de Dolor <span className="triage-form__required">*</span>
        </label>
        <select
          id="dolor"
          name="dolor"
          value={formData.dolor}
          onChange={handleChange}
          className="triage-form__select"
          disabled={loading}
        >
          {Object.entries(TRIAGE_DOLOR).map(([key, value]) => (
            <option key={value} value={value}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <p className="triage-form__helper-text">{TRIAGE_HELP_MESSAGES.dolor}</p>
      </div>

      {/* Sangrado y Shock */}
      <div className="triage-form__row">
        <div className="triage-form__field">
          <label htmlFor="sangrado" className="triage-form__label">
            Sangrado <span className="triage-form__required">*</span>
          </label>
          <select
            id="sangrado"
            name="sangrado"
            value={formData.sangrado}
            onChange={handleChange}
            className="triage-form__select"
            disabled={loading}
          >
            {TRIAGE_SI_NO_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="triage-form__helper-text">{TRIAGE_HELP_MESSAGES.sangrado}</p>
        </div>

        <div className="triage-form__field">
          <label htmlFor="shock" className="triage-form__label">
            Shock <span className="triage-form__required">*</span>
          </label>
          <select
            id="shock"
            name="shock"
            value={formData.shock}
            onChange={handleChange}
            className="triage-form__select"
            disabled={loading}
          >
            {TRIAGE_SI_NO_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="triage-form__helper-text">{TRIAGE_HELP_MESSAGES.shock}</p>
        </div>
      </div>

      {/* Observaciones */}
      <div className="triage-form__field">
        <label htmlFor="observaciones" className="triage-form__label">
          Observaciones
          {(formData.estado_general === TRIAGE_GENERAL_STATE.CRITICO ||
            formData.dolor === TRIAGE_DOLOR.SEVERO ||
            formData.sangrado === 'Si' ||
            formData.shock === 'Si') && (
            <span className="triage-form__required"> * (Obligatorio para casos críticos)</span>
          )}
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          placeholder="Describe la condición del paciente, síntomas adicionales, etc."
          className="triage-form__textarea"
          disabled={loading}
          rows={4}
          maxLength={TRIAGE_VALIDATION.observaciones.maxLength}
        />
        {fieldErrors.observaciones && (
          <p className="triage-form__error">{fieldErrors.observaciones}</p>
        )}
        <p className="triage-form__helper-text">
          {TRIAGE_HELP_MESSAGES.observaciones} ({formData.observaciones.length}/{TRIAGE_VALIDATION.observaciones.maxLength})
        </p>
      </div>

      {/* Botones */}
      <div className="triage-form__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar Triage' : 'Registrar Triage'}
        </Button>
      </div>
    </form>
  )
}

export default TriageForm