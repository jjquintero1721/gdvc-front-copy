import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, AlertCircle } from 'lucide-react'
import './RescheduleAppointmentModal.css'

/**
 * RescheduleAppointmentModal - Modal profesional para reprogramar citas
 *
 * Características:
 * - Selector de fecha y hora moderno
 * - Validaciones de negocio (mínimo 2 horas antes)
 * - Muestra claramente el cambio de fecha
 * - Diseño responsive y accesible
 *
 * @param {Boolean} isOpen - Estado de apertura del modal
 * @param {Function} onClose - Callback al cerrar sin reprogramar
 * @param {Function} onConfirm - Callback al confirmar reprogramación (recibe nueva fecha)
 * @param {Object} appointment - Datos de la cita a reprogramar
 */
function RescheduleAppointmentModal({ isOpen, onClose, onConfirm, appointment }) {
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializar con la fecha actual de la cita
  useEffect(() => {
    if (isOpen && appointment?.fecha_hora) {
      const fecha = new Date(appointment.fecha_hora)
      setNuevaFecha(fecha.toISOString().split('T')[0])
      setNuevaHora(fecha.toTimeString().slice(0, 5))
    }
  }, [isOpen, appointment])

  // Validar que la nueva fecha sea al menos 2 horas en el futuro
  const validateDateTime = (fecha, hora) => {
    if (!fecha || !hora) {
      return 'Debes seleccionar fecha y hora'
    }

    const nuevaFechaHora = new Date(`${fecha}T${hora}:00`)
    const ahora = new Date()
    const doHorasEnFuturo = new Date(ahora.getTime() + 2 * 60 * 60 * 1000)

    if (nuevaFechaHora < doHorasEnFuturo) {
      return 'La nueva fecha debe ser al menos 2 horas en el futuro'
    }

    // Validar que no sea la misma fecha/hora
    const fechaActual = new Date(appointment.fecha_hora)
    if (Math.abs(nuevaFechaHora - fechaActual) < 60000) { // menos de 1 minuto de diferencia
      return 'La nueva fecha debe ser diferente a la actual'
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar
    const validationError = validateDateTime(nuevaFecha, nuevaHora)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Construir fecha ISO completa
      const nuevaFechaHora = `${nuevaFecha}T${nuevaHora}:00`

      await onConfirm(nuevaFechaHora)
      // El padre cerrará el modal después del éxito
    } catch (err) {
      setError(err.message || 'Error al reprogramar la cita')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setNuevaFecha('')
      setNuevaHora('')
      setError(null)
      onClose()
    }
  }

  // Calcular fecha mínima (2 horas desde ahora)
  const getMinDateTime = () => {
    const ahora = new Date()
    const doHoras = new Date(ahora.getTime() + 2 * 60 * 60 * 1000)
    return doHoras.toISOString().slice(0, 16)
  }

  if (!isOpen) return null

  const fechaActual = appointment?.fecha_hora
    ? new Date(appointment.fecha_hora).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A'

  return (
    <AnimatePresence>
      <div className="reschedule-modal-overlay" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="reschedule-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="reschedule-modal-header">
            <div className="reschedule-modal-header-content">
              <div className="reschedule-modal-icon">
                <Calendar size={28} />
              </div>
              <div>
                <h2 className="reschedule-modal-title">Reprogramar Cita</h2>
                <p className="reschedule-modal-subtitle">
                  Selecciona una nueva fecha y hora
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="reschedule-modal-close-btn"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="reschedule-modal-body">
            <div className="reschedule-modal-info">
              <div className="reschedule-modal-info-item">
                <span className="reschedule-modal-info-label">Mascota:</span>
                <span className="reschedule-modal-info-value">
                  {appointment?.mascota?.nombre}
                </span>
              </div>
              <div className="reschedule-modal-info-item">
                <span className="reschedule-modal-info-label">Servicio:</span>
                <span className="reschedule-modal-info-value">
                  {appointment?.servicio?.nombre}
                </span>
              </div>
              <div className="reschedule-modal-info-item reschedule-modal-info-item--highlight">
                <span className="reschedule-modal-info-label">Fecha actual:</span>
                <span className="reschedule-modal-info-value">
                  {fechaActual}
                </span>
              </div>
            </div>

            <div className="reschedule-modal-datetime">
              <div className="reschedule-modal-form-group">
                <label htmlFor="nueva-fecha" className="reschedule-modal-label">
                  <Calendar size={18} />
                  Nueva Fecha <span className="reschedule-modal-required">*</span>
                </label>
                <input
                  id="nueva-fecha"
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => {
                    setNuevaFecha(e.target.value)
                    setError(null)
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="reschedule-modal-input"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="reschedule-modal-form-group">
                <label htmlFor="nueva-hora" className="reschedule-modal-label">
                  <Clock size={18} />
                  Nueva Hora <span className="reschedule-modal-required">*</span>
                </label>
                <input
                  id="nueva-hora"
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => {
                    setNuevaHora(e.target.value)
                    setError(null)
                  }}
                  className="reschedule-modal-input"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="reschedule-modal-notice">
              <AlertCircle size={18} />
              <span>
                La nueva fecha debe ser al menos 2 horas en el futuro.
                Se enviará una notificación al propietario.
              </span>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="reschedule-modal-error"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Footer con botones */}
            <div className="reschedule-modal-footer">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="reschedule-modal-btn reschedule-modal-btn--secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !nuevaFecha || !nuevaHora}
                className="reschedule-modal-btn reschedule-modal-btn--primary"
              >
                {isSubmitting ? 'Reprogramando...' : 'Confirmar Reprogramación'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default RescheduleAppointmentModal