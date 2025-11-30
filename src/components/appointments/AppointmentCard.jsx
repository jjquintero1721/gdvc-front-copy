import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { CheckCircle, Eye, X, RotateCcw, Stethoscope, Star } from 'lucide-react'
import './AppointmentCard.css'
import './DecoratorModal.jsx'

function AppointmentCard({
  appointment,
  onViewDetails,
  onConfirm,
  onCancel,
  onReschedule,
  onOpenTriage,
  onOpenDecorators,
  userRole
}) {
  const [isLoading, setIsLoading] = useState(false)

  const estadoNormalized = appointment.estado?.toString().toLowerCase();

  const normalizedEstado =
    appointment.estado?.toString().toUpperCase() || 'DESCONOCIDO'

  const formatAppointmentDate = (dateString) => {
    try {
      const date = parseISO(dateString)
      return {
        date: format(date, "d 'de' MMMM, yyyy", { locale: es }),
        time: format(date, 'HH:mm', { locale: es })
      }
    } catch {
      return { date: 'Fecha no disponible', time: '' }
    }
  }

  const { date, time } = formatAppointmentDate(appointment.fecha_hora)

  const getStatusColor = (estado) => {
    const map = {
      AGENDADA: 'orange',
      CONFIRMADA: 'green',
      EN_PROCESO: 'blue',
      COMPLETADA: 'green',
      CANCELADA: 'red',
      CANCELADA_TARDIA: 'red'
    }
    return map[estado] || 'gray'
  }

  const getStatusLabel = (estado) => {
    const labels = {
      AGENDADA: 'Agendada',
      CONFIRMADA: 'Confirmada',
      EN_PROCESO: 'En Proceso',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      CANCELADA_TARDIA: 'Cancelación tardía'
    }
    return labels[estado] || estado
  }

  // =============================
  //  REGLAS DE VISIBILIDAD
  // =============================

  const estadosSinAcciones = [
    'CONFIRMADA',
    'COMPLETADA',
    'CANCELADA',
    'CANCELADA_TARDIA'
  ]

  const showOnlyDetails = estadosSinAcciones.includes(normalizedEstado)

  const canConfirm =
    !showOnlyDetails && ['AGENDADA'].includes(normalizedEstado)

  const canCancel =
    !showOnlyDetails &&
    ['AGENDADA'].includes(normalizedEstado)

  const canReschedule =
    !showOnlyDetails &&
    ['AGENDADA'].includes(normalizedEstado)

  const canTriage =
    !showOnlyDetails &&
    normalizedEstado === 'EN_PROCESO' &&
    userRole !== 'superadmin'

  // Decoradores: permitir en estados donde se puedan gestionar
  const canAddDecorators =
    !showOnlyDetails &&
    ['AGENDADA', 'CONFIRMADA', 'EN_PROCESO'].includes(normalizedEstado)

  return (
    <motion.div
      className="appointment-card"
      data-status={normalizedEstado}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className="appointment-card__header">
        <div className="appointment-card__icon">
          <svg className="appointment-card__icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <span className={`appointment-card__status appointment-card__status--${getStatusColor(normalizedEstado)}`}>
          {getStatusLabel(normalizedEstado)}
        </span>
      </div>

      {/* Body */}
      <div className="appointment-card__body">
        <div className="appointment-card__patient">
          <h3 className="appointment-card__patient-name">{appointment.mascota?.nombre}</h3>
          <p className="appointment-card__patient-species">{appointment.mascota?.especie}</p>
        </div>

        <div className="appointment-card__date-section">
          <div className="appointment-card__date">
            <span>{date}</span>
          </div>
          <div className="appointment-card__time">
            <span>{time}</span>
          </div>
        </div>

        <div className="appointment-card__service">
          <span className="appointment-card__label">Servicio</span>
          <span className="appointment-card__service-name">
            {appointment.servicio?.nombre}
          </span>
        </div>

        {appointment.veterinario && (
          <div className="appointment-card__vet">
            <span className="appointment-card__label">Veterinario</span>
            <span className="appointment-card__vet-name">
              {appointment.veterinario.nombre}
            </span>
          </div>
        )}

        {appointment.motivo && (
          <div className="appointment-card__motivo">
            <span className="appointment-card__label">Motivo</span>
            <p className="appointment-card__motivo-text">{appointment.motivo}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="appointment-card__footer">
        {/* Ver detalles → siempre */}
        <button
          onClick={() => onViewDetails(appointment)}
          className="appointment-card__button appointment-card__button--secondary"
        >
          <Eye size={18} />
          Ver Detalles
        </button>

        {/* ACCIONES OCULTAS EN ESTADOS BLOQUEADOS */}
        {!showOnlyDetails && (
          <>
            {canConfirm && (
              <button
                className="appointment-card__button appointment-card__button--success"
                onClick={() => onConfirm(appointment)}
              >
                <CheckCircle size={18} />
                Confirmar Cita
              </button>
            )}

            <div className="appointment-card__actions">
              {canReschedule && (
                <button
                  className="appointment-card__action-button appointment-card__action-button--reschedule"
                  onClick={() => onReschedule(appointment)}
                  title="Reprogramar cita"
                >
                  <RotateCcw size={20} />
                </button>
              )}

              {canCancel && (
                <button
                  className="appointment-card__action-button appointment-card__action-button--cancel"
                  onClick={() => onCancel(appointment)}
                  title="Cancelar cita"
                >
                  <X size={20} />
                </button>
              )}

              {userRole !== 'propietario' &&
                  ['agendada', 'confirmada', 'en_proceso'].includes(estadoNormalized) && (
                    <button
                      className="appointment-card__action-button appointment-card__action-button--triage"
                      onClick={() => onOpenTriage(appointment)}
                      title="Registrar triage"
                    >
                        <Stethoscope size={20} />
                    </button>
                  )
                }

              {canAddDecorators && (
                <button
                  className="appointment-card__action-button appointment-card__action-button--decorator"
                  onClick={() => onOpenDecorators(appointment)}
                  title="Añadir decorador"
                >
                  <Star size={20} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default AppointmentCard