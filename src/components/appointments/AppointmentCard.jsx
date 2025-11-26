import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import './AppointmentCard.css'

/**
 * AppointmentCard - Tarjeta de cita para propietarios
 *
 * Muestra la información de una cita con diseño similar a PetCard
 * Incluye botones de acción según el estado de la cita
 *
 * @param {Object} appointment - Objeto de cita
 * @param {Function} onViewDetails - Callback para ver detalles
 * @param {Function} onConfirm - Callback para confirmar cita
 * @param {Function} onCancel - Callback para cancelar cita
 * @param {Function} onReschedule - Callback para reprogramar cita
 * @param {String} userRole - Rol del usuario actual
 */
function AppointmentCard({
  appointment,
  onViewDetails,
  onConfirm,
  onCancel,
  onReschedule,
  userRole
}) {
  const [isLoading, setIsLoading] = useState(false)

  // Formatear fecha
  const formatAppointmentDate = (dateString) => {
    try {
      const date = parseISO(dateString)
      return {
        date: format(date, "d 'de' MMMM, yyyy", { locale: es }),
        time: format(date, 'HH:mm', { locale: es })
      }
    } catch (error) {
      return { date: 'Fecha no disponible', time: '' }
    }
  }

  const { date, time } = formatAppointmentDate(appointment.fecha_hora)

  // Determinar color según estado
  const getStatusColor = (estado) => {
    const statusColors = {
      AGENDADA: 'orange',
      CONFIRMADA: 'green',
      ATENDIDA: 'blue',
      CANCELADA: 'red',
      PENDIENTE: 'yellow'
    }
    return statusColors[estado] || 'gray'
  }

  const getStatusLabel = (estado) => {
    const labels = {
      AGENDADA: 'Agendada',
      CONFIRMADA: 'Confirmada',
      ATENDIDA: 'Atendida',
      CANCELADA: 'Cancelada',
      PENDIENTE: 'Pendiente'
    }
    return labels[estado] || estado
  }

  // Determinar si puede confirmar/cancelar/reprogramar
  const canConfirm = ['superadmin', 'propietario'].includes(userRole) &&
                     ['AGENDADA', 'PENDIENTE'].includes(appointment.estado)

  const canCancel = ['superadmin', 'propietario'].includes(userRole) &&
                    !['CANCELADA', 'ATENDIDA'].includes(appointment.estado)

  const canReschedule = ['superadmin', 'propietario'].includes(userRole) &&
                        !['CANCELADA', 'ATENDIDA'].includes(appointment.estado)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="appointment-card"
    >
      {/* Header con icono y estado */}
      <div className="appointment-card__header">
        <div className="appointment-card__icon">
          <svg
            className="appointment-card__icon-svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <span className={`appointment-card__status appointment-card__status--${getStatusColor(appointment.estado)}`}>
          {getStatusLabel(appointment.estado)}
        </span>
      </div>

      {/* Información principal */}
      <div className="appointment-card__body">
        {/* Mascota */}
        <div className="appointment-card__section">
          <span className="appointment-card__label">Mascota</span>
          <span className="appointment-card__value">
            {appointment.mascota?.nombre || 'No especificada'}
          </span>
        </div>

        {/* Servicio */}
        <div className="appointment-card__section">
          <span className="appointment-card__label">Servicio</span>
          <span className="appointment-card__value">
            {appointment.servicio?.nombre || 'No especificado'}
          </span>
        </div>

        {/* Veterinario */}
        <div className="appointment-card__section">
          <span className="appointment-card__label">Veterinario</span>
          <span className="appointment-card__value">
            {appointment.veterinario?.nombre || 'No asignado'}
          </span>
        </div>

        {/* Fecha y Hora */}
        <div className="appointment-card__date-section">
          <div className="appointment-card__date">
            <svg className="appointment-card__date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{date}</span>
          </div>
          <div className="appointment-card__time">
            <svg className="appointment-card__time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{time}</span>
          </div>
        </div>

        {/* Motivo */}
        {appointment.motivo && (
          <div className="appointment-card__motivo">
            <span className="appointment-card__label">Motivo</span>
            <p className="appointment-card__motivo-text">{appointment.motivo}</p>
          </div>
        )}
      </div>

      {/* Footer con botones de acción */}
      <div className="appointment-card__footer">
        <button
          onClick={() => onViewDetails(appointment)}
          className="appointment-card__button appointment-card__button--primary"
          disabled={isLoading}
        >
          <svg className="appointment-card__button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver Detalles
        </button>

        <div className="appointment-card__actions">
          {canConfirm && (
            <button
              onClick={() => onConfirm(appointment)}
              className="appointment-card__action-button appointment-card__action-button--confirm"
              title="Confirmar cita"
              disabled={isLoading}
            >
              <svg className="appointment-card__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}

          {canReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="appointment-card__action-button appointment-card__action-button--reschedule"
              title="Reprogramar cita"
              disabled={isLoading}
            >
              <svg className="appointment-card__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => onCancel(appointment)}
              className="appointment-card__action-button appointment-card__action-button--cancel"
              title="Cancelar cita"
              disabled={isLoading}
            >
              <svg className="appointment-card__action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AppointmentCard