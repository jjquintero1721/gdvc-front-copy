import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, CheckCircle, History, RotateCcw, Calendar, AlertCircle } from 'lucide-react'
import consultationService from '@/services/consultationService'
import followUpService from '@/services/followUpService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import './ConsultationFormModal.css'

/**
 * ConsultationFormModal - Modal para crear/editar consultas
 *
 * Funcionalidades:
 * - Crear nueva consulta (desde cita confirmada)
 * - Editar consulta existente (genera nueva versión - Memento Pattern)
 * - Ver historial de versiones
 * - Revertir a versión anterior
 * - Programar seguimiento de paciente
 * - Completar consulta (marca cita como COMPLETADA)
 *
 * @param {boolean} isOpen - Estado del modal
 * @param {Function} onClose - Callback para cerrar
 * @param {Object} appointment - Cita asociada
 * @param {Object} existingConsultation - Consulta existente (para edición)
 * @param {Function} onSave - Callback después de guardar
 */
function ConsultationFormModal({
  isOpen,
  onClose,
  appointment,
  existingConsultation = null,
  onSave
}) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    motivo: '',
    anamnesis: '',
    signos_vitales: '',
    diagnostico: '',
    tratamiento: '',
    vacunas: '',
    observaciones: ''
  })

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // Estados de historial y seguimiento
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [followUpData, setFollowUpData] = useState({
    fecha_hora_seguimiento: '',
    veterinario_id: '',
    servicio_id: '',
    motivo_seguimiento: '',
    dias_recomendados: 7,
    notas: ''
  })

  // Cargar datos existentes si es edición
  useEffect(() => {
    if (existingConsultation) {
      setFormData({
        motivo: existingConsultation.motivo || '',
        anamnesis: existingConsultation.anamnesis || '',
        signos_vitales: existingConsultation.signos_vitales || '',
        diagnostico: existingConsultation.diagnostico || '',
        tratamiento: existingConsultation.tratamiento || '',
        vacunas: existingConsultation.vacunas || '',
        observaciones: existingConsultation.observaciones || ''
      })
      setIsEditing(true)
    } else {
      // Si es nueva consulta, prellenar con motivo de la cita
      if (appointment?.motivo) {
        setFormData(prev => ({
          ...prev,
          motivo: appointment.motivo
        }))
      }
      setIsEditing(false)
    }
  }, [existingConsultation, appointment])

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar cambios en el formulario de seguimiento
  const handleFollowUpChange = (e) => {
    const { name, value } = e.target
    setFollowUpData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Validar formulario
  const validateForm = () => {
    const errors = []

    if (!formData.motivo.trim()) {
      errors.push('El motivo es obligatorio')
    }
    if (!formData.anamnesis.trim()) {
      errors.push('La anamnesis es obligatoria')
    }
    if (!formData.signos_vitales.trim()) {
      errors.push('Los signos vitales son obligatorios')
    }
    if (!formData.diagnostico.trim()) {
      errors.push('El diagnóstico es obligatorio')
    }

    return errors
  }

  // Guardar consulta (crear o actualizar)
  const handleSave = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isEditing && existingConsultation) {
        // Actualizar consulta existente (genera nueva versión)
        await consultationService.updateConsultation(
          existingConsultation.id,
          formData
        )
        setSuccess('Consulta actualizada correctamente (nueva versión creada)')
      } else {
        // Crear nueva consulta
        const consultationData = {
          ...formData,
          historia_clinica_id: appointment.mascota.historia_clinica_id,
          veterinario_id: appointment.veterinario_id,
          cita_id: appointment.id
        }

        await consultationService.createConsultation(consultationData)
        setSuccess('Consulta creada correctamente')
      }

      // Llamar callback
      if (onSave) {
        await onSave()
      }

      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error al guardar la consulta')
    } finally {
      setLoading(false)
    }
  }

  // Completar consulta (marca cita como COMPLETADA)
  const handleComplete = async () => {
    if (!existingConsultation) {
      setError('Debe guardar la consulta antes de completarla')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Completar la cita asociada
      await appointmentService.completeAppointment(appointment.id)
      setSuccess('Consulta completada. La cita ha sido marcada como COMPLETADA.')

      // Callback y cierre
      if (onSave) {
        await onSave()
      }

      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error al completar la consulta')
    } finally {
      setLoading(false)
    }
  }

  // Cargar historial de versiones
  const loadHistory = async () => {
    if (!existingConsultation) return

    setLoading(true)
    setError(null)

    try {
      const response = await consultationService.getConsultationHistory(
        existingConsultation.id
      )
      setHistory(response.historial || [])
      setShowHistory(true)
    } catch (err) {
      setError(err.message || 'Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  // Restaurar versión anterior
  const handleRestoreVersion = async (version) => {
    if (!existingConsultation) return

    if (!window.confirm(`¿Está seguro de restaurar la versión ${version}?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await consultationService.restoreConsultationVersion(
        existingConsultation.id,
        version
      )
      setSuccess(`Versión ${version} restaurada correctamente`)

      // Recargar consulta
      if (onSave) {
        await onSave()
      }

      setShowHistory(false)
    } catch (err) {
      setError(err.message || 'Error al restaurar la versión')
    } finally {
      setLoading(false)
    }
  }

  // Crear seguimiento
  const handleCreateFollowUp = async () => {
    if (!existingConsultation) {
      setError('Debe guardar la consulta antes de crear un seguimiento')
      return
    }

    // Validar formulario de seguimiento
    if (!followUpData.fecha_hora_seguimiento) {
      setError('Debe especificar una fecha para el seguimiento')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await followUpService.createFollowUp(
        existingConsultation.id,
        {
          ...followUpData,
          consulta_origen_id: existingConsultation.id
        }
      )
      setSuccess('Seguimiento programado correctamente')
      setShowFollowUpForm(false)

      // Resetear formulario de seguimiento
      setFollowUpData({
        fecha_hora_seguimiento: '',
        veterinario_id: '',
        servicio_id: '',
        motivo_seguimiento: '',
        dias_recomendados: 7,
        notas: ''
      })
    } catch (err) {
      setError(err.message || 'Error al crear el seguimiento')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="consultation-form-modal-overlay">
        <motion.div
          className="consultation-form-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="consultation-form-modal__header">
            <div>
              <h2 className="consultation-form-modal__title">
                {isEditing ? 'Editar Consulta' : 'Nueva Consulta'}
              </h2>
              <p className="consultation-form-modal__subtitle">
                Paciente: {appointment?.mascota?.nombre || 'No especificado'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="consultation-form-modal__close"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Mensajes */}
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Formulario Principal */}
          {!showHistory && !showFollowUpForm && (
            <div className="consultation-form-modal__content">
              <div className="consultation-form-modal__form">
                {/* Motivo */}
                <div className="consultation-form-modal__field">
                  <label className="consultation-form-modal__label">
                    Motivo de consulta *
                  </label>
                  <Input
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    placeholder="Ej: Chequeo general de rutina"
                    disabled={loading}
                  />
                </div>

                {/* Anamnesis */}
                <div className="consultation-form-modal__field">
                  <label className="consultation-form-modal__label">
                    Anamnesis (Historia clínica) *
                  </label>
                  <textarea
                    name="anamnesis"
                    value={formData.anamnesis}
                    onChange={handleChange}
                    placeholder="Ej: Mascota activa, buen apetito..."
                    className="consultation-form-modal__textarea"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                {/* Signos Vitales */}
                <div className="consultation-form-modal__field">
                  <label className="consultation-form-modal__label">
                    Signos Vitales *
                  </label>
                  <textarea
                    name="signos_vitales"
                    value={formData.signos_vitales}
                    onChange={handleChange}
                    placeholder="Ej: FC: 120 lpm, FR: 30 rpm, Temp: 38.5°C, Peso: 28 kg"
                    className="consultation-form-modal__textarea"
                    rows={2}
                    disabled={loading}
                  />
                </div>

                {/* Diagnóstico */}
                <div className="consultation-form-modal__field">
                  <label className="consultation-form-modal__label">
                    Diagnóstico *
                  </label>
                  <textarea
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleChange}
                    placeholder="Ej: Mascota en excelente estado de salud..."
                    className="consultation-form-modal__textarea"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                {/* Tratamiento */}
                <div className="consultation-form-modal__field">
                  <label className="consultation-form-modal__label">
                    Tratamiento
                  </label>
                  <textarea
                    name="tratamiento"
                    value={formData.tratamiento}
                    onChange={handleChange}
                    placeholder="Ej: Continuar con dieta balanceada..."
                    className="consultation-form-modal__textarea"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                {/* Vacunas */}
                <div className="consultation-form-modal__field">
                  <label className="consultation-form-modal__label">
                    Vacunas Aplicadas
                  </label>
                  <textarea
                    name="vacunas"
                    value={formData.vacunas}
                    onChange={handleChange}
                    placeholder="Ej: Refuerzo antirrábico aplicado..."
                    className="consultation-form-modal__textarea"
                    rows={2}
                    disabled={loading}
                  />
                </div>

                {/* Observaciones */}
                <div className="consultation-form-modal__field">
                  <label className="consultation-form-modal__label">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Ej: Propietario muy responsable. Mascota bien socializada."
                    className="consultation-form-modal__textarea"
                    rows={2}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Historial de Versiones */}
          {showHistory && (
            <div className="consultation-form-modal__content">
              <div className="consultation-form-modal__history">
                <h3 className="consultation-form-modal__section-title">
                  Historial de Versiones
                </h3>
                {history.length === 0 ? (
                  <p className="consultation-form-modal__empty">
                    No hay versiones anteriores
                  </p>
                ) : (
                  <div className="consultation-form-modal__history-list">
                    {history.map((version, index) => (
                      <div key={index} className="consultation-form-modal__history-item">
                        <div className="consultation-form-modal__history-info">
                          <span className="consultation-form-modal__history-version">
                            Versión {version.version}
                          </span>
                          <span className="consultation-form-modal__history-date">
                            {new Date(version.fecha_modificacion).toLocaleString('es-CO')}
                          </span>
                          <span className="consultation-form-modal__history-user">
                            Por: {version.veterinario_nombre}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(version.version)}
                          className="consultation-form-modal__history-restore"
                          disabled={loading}
                        >
                          <RotateCcw size={16} />
                          Restaurar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setShowHistory(false)}
                  disabled={loading}
                >
                  Volver
                </Button>
              </div>
            </div>
          )}

          {/* Formulario de Seguimiento */}
          {showFollowUpForm && (
            <div className="consultation-form-modal__content">
              <div className="consultation-form-modal__follow-up">
                <h3 className="consultation-form-modal__section-title">
                  Programar Seguimiento
                </h3>
                <div className="consultation-form-modal__form">
                  <div className="consultation-form-modal__field">
                    <label className="consultation-form-modal__label">
                      Fecha y Hora del Seguimiento *
                    </label>
                    <Input
                      type="datetime-local"
                      name="fecha_hora_seguimiento"
                      value={followUpData.fecha_hora_seguimiento}
                      onChange={handleFollowUpChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="consultation-form-modal__field">
                    <label className="consultation-form-modal__label">
                      Días Recomendados
                    </label>
                    <Input
                      type="number"
                      name="dias_recomendados"
                      value={followUpData.dias_recomendados}
                      onChange={handleFollowUpChange}
                      disabled={loading}
                      min={1}
                    />
                  </div>

                  <div className="consultation-form-modal__field">
                    <label className="consultation-form-modal__label">
                      Motivo del Seguimiento *
                    </label>
                    <textarea
                      name="motivo_seguimiento"
                      value={followUpData.motivo_seguimiento}
                      onChange={handleFollowUpChange}
                      placeholder="Ej: Control post-operatorio"
                      className="consultation-form-modal__textarea"
                      rows={2}
                      disabled={loading}
                    />
                  </div>

                  <div className="consultation-form-modal__field">
                    <label className="consultation-form-modal__label">
                      Notas Adicionales
                    </label>
                    <textarea
                      name="notas"
                      value={followUpData.notas}
                      onChange={handleFollowUpChange}
                      placeholder="Ej: Revisar evolución de la herida..."
                      className="consultation-form-modal__textarea"
                      rows={2}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="consultation-form-modal__follow-up-actions">
                  <Button
                    variant="primary"
                    onClick={handleCreateFollowUp}
                    disabled={loading}
                  >
                    <Calendar size={18} />
                    Programar Seguimiento
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowFollowUpForm(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer con acciones */}
          {!showHistory && !showFollowUpForm && (
            <div className="consultation-form-modal__footer">
              <div className="consultation-form-modal__actions">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save size={18} />
                  {isEditing ? 'Actualizar Consulta' : 'Guardar Consulta'}
                </Button>

                {isEditing && (
                  <>
                    <Button
                      variant="success"
                      onClick={handleComplete}
                      disabled={loading}
                    >
                      <CheckCircle size={18} />
                      Completar Consulta
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={loadHistory}
                      disabled={loading}
                    >
                      <History size={18} />
                      Ver Historial
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => setShowFollowUpForm(true)}
                      disabled={loading}
                    >
                      <Calendar size={18} />
                      Programar Seguimiento
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ConsultationFormModal