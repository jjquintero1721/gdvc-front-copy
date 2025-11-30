import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import './CancelAppointmentModal.css'

/**
 * CancelAppointmentModal - Modal profesional para cancelar citas
 *
 * Características:
 * - Diseño moderno y profesional
 * - Campo de motivo obligatorio
 * - Validaciones en tiempo real
 * - Animaciones suaves
 * - Mensajes de confirmación claros
 *
 * @param {Boolean} isOpen - Estado de apertura del modal
 * @param {Function} onClose - Callback al cerrar sin cancelar
 * @param {Function} onConfirm - Callback al confirmar cancelación (recibe motivo)
 * @param {Object} appointment - Datos de la cita a cancelar
 */
function CancelAppointmentModal({ isOpen, onClose, onConfirm, appointment }) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar motivo
    if (!motivo.trim()) {
      setError('El motivo de cancelación es obligatorio')
      return
    }

    if (motivo.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres')
      return
    }

    if (motivo.trim().length > 300) {
      setError('El motivo no puede exceder 300 caracteres')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onConfirm(motivo.trim())
      // El padre cerrará el modal después del éxito
    } catch (err) {
      setError(err.message || 'Error al cancelar la cita')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setMotivo('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="cancel-modal-overlay" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="cancel-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="cancel-modal-header">
            <div className="cancel-modal-header-content">
              <div className="cancel-modal-icon">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h2 className="cancel-modal-title">Cancelar Cita</h2>
                <p className="cancel-modal-subtitle">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="cancel-modal-close-btn"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="cancel-modal-body">
            <div className="cancel-modal-info">
              <div className="cancel-modal-info-item">
                <span className="cancel-modal-info-label">Mascota:</span>
                <span className="cancel-modal-info-value">
                  {appointment?.mascota?.nombre}
                </span>
              </div>
              <div className="cancel-modal-info-item">
                <span className="cancel-modal-info-label">Servicio:</span>
                <span className="cancel-modal-info-value">
                  {appointment?.servicio?.nombre}
                </span>
              </div>
              <div className="cancel-modal-info-item">
                <span className="cancel-modal-info-label">Fecha:</span>
                <span className="cancel-modal-info-value">
                  {new Date(appointment?.fecha_hora).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="cancel-modal-form-group">
              <label htmlFor="motivo" className="cancel-modal-label">
                Motivo de la cancelación <span className="cancel-modal-required">*</span>
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value)
                  setError(null)
                }}
                placeholder="Ejemplo: Cambio de fecha por emergencia personal..."
                className="cancel-modal-textarea"
                rows={4}
                disabled={isSubmitting}
                maxLength={300}
                required
              />
              <div className="cancel-modal-char-count">
                {motivo.length} / 300 caracteres
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="cancel-modal-error"
              >
                <AlertTriangle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Footer con botones */}
            <div className="cancel-modal-footer">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="cancel-modal-btn cancel-modal-btn--secondary"
              >
                No, mantener cita
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !motivo.trim()}
                className="cancel-modal-btn cancel-modal-btn--danger"
              >
                {isSubmitting ? 'Cancelando...' : 'Sí, cancelar cita'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CancelAppointmentModal