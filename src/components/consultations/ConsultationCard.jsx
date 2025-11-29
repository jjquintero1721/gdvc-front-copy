import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Play, Eye, ArrowRight } from 'lucide-react'
import './ConsultationCard.css'

/**
 * ConsultationCard - Tarjeta de cita confirmada o en proceso
 *
 * ✅ CORRECCIONES APLICADAS:
 * 1. Detecta estado real de la cita (CONFIRMADA vs EN_PROCESO)
 * 2. Muestra badge con el estado correcto
 * 3. Cambia el texto del botón según el estado:
 *    - CONFIRMADA: "Iniciar Consulta"
 *    - EN_PROCESO: "Continuar Consulta"
 * 4. Aplica colores diferentes según el estado
 *
 * @param {Object} appointment - Cita confirmada o en proceso
 * @param {Function} onStartConsultation - Callback para iniciar/continuar consulta
 * @param {Function} onViewDetails - Callback para ver detalles
 * @param {boolean} isLoading - Estado de carga
 */
function ConsultationCard({
  appointment,
  onStartConsultation,
  onViewDetails,
  isLoading = false
}) {
  // ✅ NUEVO: Normalizar estado a UPPERCASE para comparaciones
  const estadoNormalizado = appointment.estado?.toString().toUpperCase() || 'DESCONOCIDO'

  // ✅ NUEVO: Determinar si la cita está en proceso
  const isInProgress = estadoNormalizado === 'EN_PROCESO'

  console.log('🎴 ConsultationCard:', {
    id: appointment.id,
    estadoOriginal: appointment.estado,
    estadoNormalizado,
    isInProgress
  })

  // Formatear fecha
  const formatAppointmentDate = (dateString) => {
    try {
      const date = parseISO(dateString)
      return {
        date: format(date, "d 'de' MMMM, yyyy", { locale: es }),
        time: format(date, 'HH:mm', { locale: es }),
        dayOfWeek: format(date, 'EEEE', { locale: es })
      }
    } catch (error) {
      return { date: 'Fecha no disponible', time: '', dayOfWeek: '' }
    }
  }

  const { date, time, dayOfWeek } = formatAppointmentDate(appointment.fecha_hora)

  // ✅ NUEVO: Configuración del badge según estado
  const getBadgeConfig = () => {
    if (isInProgress) {
      return {
        text: 'En Proceso',
        className: 'consultation-card__status--in-progress'
      }
    }
    return {
      text: 'Confirmada',
      className: 'consultation-card__status--confirmed'
    }
  }

  // ✅ NUEVO: Configuración del botón según estado
  const getButtonConfig = () => {
    if (isInProgress) {
      return {
        text: 'Continuar Consulta',
        icon: <ArrowRight size={18} />,
        className: 'consultation-card__button--continue'
      }
    }
    return {
      text: 'Iniciar Consulta',
      icon: <Play size={18} />,
      className: 'consultation-card__button--primary'
    }
  }

  const badgeConfig = getBadgeConfig()
  const buttonConfig = getButtonConfig()

  return (
    <motion.div
      className="consultation-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className="consultation-card__header">
        <div className="consultation-card__icon consultation-card__icon--pulse">
          <svg className="consultation-card__icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        {/* ✅ NUEVO: Badge dinámico según estado */}
        <span className={`consultation-card__status ${badgeConfig.className}`}>
          {badgeConfig.text}
        </span>
      </div>

      {/* Body */}
      <div className="consultation-card__body">
        {/* Información del paciente */}
        <div className="consultation-card__patient">
          <h3 className="consultation-card__patient-name">
            {appointment.mascota?.nombre || 'Paciente'}
          </h3>
          <p className="consultation-card__patient-owner">
            Propietario: {appointment.mascota?.propietario?.nombre || 'No especificado'}
          </p>
        </div>

        {/* Fecha y Hora */}
        <div className="consultation-card__datetime">
          <div className="consultation-card__date">
            <svg className="consultation-card__date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <span className="consultation-card__day">{dayOfWeek}</span>
              <span className="consultation-card__full-date">{date}</span>
            </div>
          </div>
          <div className="consultation-card__time">
            <svg className="consultation-card__time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{time}</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="consultation-card__info">
          <div className="consultation-card__info-item">
            <span className="consultation-card__label">Servicio:</span>
            <span className="consultation-card__value">
              {appointment.servicio?.nombre || 'Consulta general'}
            </span>
          </div>
          {appointment.motivo && (
            <div className="consultation-card__info-item">
              <span className="consultation-card__label">Motivo:</span>
              <span className="consultation-card__value">{appointment.motivo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="consultation-card__footer">
        {/* ✅ NUEVO: Botón dinámico según estado */}
        <button
          onClick={() => onStartConsultation(appointment)}
          className={`consultation-card__button ${buttonConfig.className}`}
          disabled={isLoading}
          title={isInProgress ? 'Continuar con la consulta en proceso' : 'Iniciar una nueva consulta'}
        >
          {buttonConfig.icon}
          <span>{buttonConfig.text}</span>
        </button>

        <button
          onClick={() => onViewDetails(appointment)}
          className="consultation-card__button consultation-card__button--secondary"
          disabled={isLoading}
        >
          <Eye size={18} />
          <span>Ver Detalles</span>
        </button>
      </div>
    </motion.div>
  )
}

export default ConsultationCard