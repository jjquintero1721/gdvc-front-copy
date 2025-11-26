import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Eye, X, RotateCcw } from 'lucide-react'
import './AppointmentCard.css'

/**
 * AppointmentCard - Tarjeta de cita para propietarios
 *
 * ✅ CORRECCIÓN APLICADA:
 * - Normalización de estados (uppercase)
 * - Debugging mejorado
 * - Validación explícita de props
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

  // ✅ DEBUGGING: Verificar props recibidas
  console.group(`🎴 AppointmentCard #${appointment.id}`)
  console.log('📋 Appointment:', appointment)
  console.log('👤 User Role:', userRole)
  console.log('🔖 Estado Original:', appointment.estado)

  // ✅ CORRECCIÓN: Normalizar estado a UPPERCASE para evitar problemas de comparación
  const normalizedEstado = appointment.estado?.toString().toUpperCase() || 'DESCONOCIDO'
  console.log('🔖 Estado Normalizado:', normalizedEstado)

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
      PENDIENTE: 'yellow',
      EN_PROCESO: 'purple'
    }
    return statusColors[estado] || 'gray'
  }

  const getStatusLabel = (estado) => {
    const labels = {
      AGENDADA: 'Agendada',
      CONFIRMADA: 'Confirmada',
      ATENDIDA: 'Atendida',
      CANCELADA: 'Cancelada',
      PENDIENTE: 'Pendiente',
      EN_PROCESO: 'En Proceso'
    }
    return labels[estado] || estado
  }

  // ✅ CORRECCIÓN: Usar estado normalizado para las comparaciones
  // Determinar si puede confirmar/cancelar/reprogramar
  const canConfirm = ['superadmin', 'propietario'].includes(userRole) &&
                     ['AGENDADA', 'PENDIENTE'].includes(normalizedEstado)

  const canCancel = ['superadmin', 'propietario'].includes(userRole) &&
                    !['CANCELADA', 'ATENDIDA', 'EN_PROCESO'].includes(normalizedEstado)

  const canReschedule = ['superadmin', 'propietario'].includes(userRole) &&
                        !['CANCELADA', 'ATENDIDA', 'EN_PROCESO'].includes(normalizedEstado)

  // ✅ DEBUGGING: Mostrar evaluación de permisos
  console.log('✅ Permisos evaluados:')
  console.log('  - canConfirm:', canConfirm, {
    hasRole: ['superadmin', 'propietario'].includes(userRole),
    hasCorrectStatus: ['AGENDADA', 'PENDIENTE'].includes(normalizedEstado),
    currentStatus: normalizedEstado
  })
  console.log('  - canCancel:', canCancel)
  console.log('  - canReschedule:', canReschedule)
  console.groupEnd()

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className={`appointment-card__status appointment-card__status--${getStatusColor(normalizedEstado)}`}>
          {getStatusLabel(normalizedEstado)}
        </span>
      </div>

      {/* Body */}
      <div className="appointment-card__body">
        {/* Información del paciente */}
        <div className="appointment-card__patient">
          <h3 className="appointment-card__patient-name">
            {appointment.mascota?.nombre || 'Paciente'}
          </h3>
          <p className="appointment-card__patient-species">
            {appointment.mascota?.especie || 'Especie no especificada'}
          </p>
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

        {/* Servicio */}
        <div className="appointment-card__service">
          <span className="appointment-card__label">Servicio</span>
          <span className="appointment-card__service-name">
            {appointment.servicio?.nombre || 'Consulta general'}
          </span>
        </div>

        {/* Veterinario */}
        {appointment.veterinario && (
          <div className="appointment-card__vet">
            <span className="appointment-card__label">Veterinario</span>
            <span className="appointment-card__vet-name">
              {appointment.veterinario.nombre || 'No asignado'}
            </span>
          </div>
        )}

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
        {/* Botón de Ver Detalles (siempre visible) */}
        <button
          onClick={() => onViewDetails(appointment)}
          className="appointment-card__button appointment-card__button--secondary"
          disabled={isLoading}
        >
          <Eye size={18} />
          <span>Ver Detalles</span>
        </button>

        {/* ⭐ Botón de Confirmar (solo para AGENDADA/PENDIENTE) */}
        {canConfirm && (
          <button
            onClick={() => {
              console.log('🎯 Confirmando cita:', appointment.id)
              onConfirm(appointment)
            }}
            className="appointment-card__button appointment-card__button--success"
            disabled={isLoading}
            title="Confirmar cita"
          >
            <CheckCircle size={18} />
            <span>Confirmar Cita</span>
          </button>
        )}

        {/* ℹ️ Mensaje de debugging si el botón no aparece */}
        {!canConfirm && normalizedEstado === 'AGENDADA' && (
          <div style={{
            padding: '8px',
            background: '#fef3c7',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#92400e'
          }}>
            ⚠️ Debug: Estado=AGENDADA pero botón oculto. Role={userRole}
          </div>
        )}

        {/* Botones de acción secundarios */}
        <div className="appointment-card__actions">
          {canReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="appointment-card__action-button appointment-card__action-button--reschedule"
              title="Reprogramar cita"
              disabled={isLoading}
            >
              <RotateCcw size={20} />
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => onCancel(appointment)}
              className="appointment-card__action-button appointment-card__action-button--cancel"
              title="Cancelar cita"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AppointmentCard