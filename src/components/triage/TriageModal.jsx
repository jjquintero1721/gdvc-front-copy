import { useState } from 'react'
import TriageForm from './TriageForm'
import Alert from '@/components/ui/Alert'
import PriorityBadge from './PriorityBadge'
import triageService from '@/services/triageService'
import './TriageModal.css'

/**
 * Componente TriageModal
 * Modal para registrar un nuevo triage desde una cita
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Object} cita - Datos de la cita
 * @param {Function} onSuccess - Callback cuando se crea exitosamente
 */
function TriageModal({ isOpen, onClose, cita, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [triageCreado, setTriageCreado] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (triageData) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('📋 Registrando triage:', triageData)

      const response = await triageService.createTriage(triageData)

      console.log('✅ Triage registrado:', response)

      setTriageCreado(response.data)
      setSuccess(response.message || 'Triage registrado exitosamente')

      // Notificar al padre después de 2 segundos
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.data)
        }
        handleClose()
      }, 2000)

    } catch (err) {
      console.error('❌ Error al registrar triage:', err)
      setError(err.message || 'Error al registrar el triage')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccess(null)
    setTriageCreado(null)
    onClose()
  }

  return (
    <div className="triage-modal-overlay" onClick={handleClose}>
      <div className="triage-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="triage-modal__header">
          <h2 className="triage-modal__title">
            🩺 Registrar Triage
          </h2>
          <button
            className="triage-modal__close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Información de la cita */}
        <div className="triage-modal__cita-info">
          <div className="triage-modal__cita-field">
            <span className="triage-modal__cita-label">Mascota:</span>
            <span className="triage-modal__cita-value">
              {cita?.mascota?.nombre || 'No disponible'}
            </span>
          </div>
          <div className="triage-modal__cita-field">
            <span className="triage-modal__cita-label">Propietario:</span>
            <span className="triage-modal__cita-value">
              {cita?.propietario?.nombre || 'No disponible'}
            </span>
          </div>
          <div className="triage-modal__cita-field">
            <span className="triage-modal__cita-label">Servicio:</span>
            <span className="triage-modal__cita-value">
              {cita?.servicio?.nombre || 'No disponible'}
            </span>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {success && triageCreado && (
          <Alert type="success" message={success}>
            <div className="triage-modal__success-details">
              <p><strong>Prioridad asignada:</strong></p>
              <PriorityBadge priority={triageCreado.prioridad} size="large" />
            </div>
          </Alert>
        )}

        {/* Formulario */}
        {!triageCreado && (
          <div className="triage-modal__form">
            <TriageForm
              mascotaId={cita?.mascota_id}
              citaId={cita?.id}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TriageModal