import React from 'react'
import { Users, Mail, Phone, Calendar, UserCheck, UserX } from 'lucide-react'
import './AuxiliarCard.css'

/**
 * AuxiliarCard - Muestra información de un auxiliar
 * Usado en la vista del veterinario para mostrar sus auxiliares
 */
const AuxiliarCard = ({ auxiliar }) => {
  const { nombre, correo, telefono, activo, fecha_creacion } = auxiliar

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`auxiliar-mini-card ${!activo ? 'auxiliar-mini-card--inactive' : ''}`}>
      <div className="auxiliar-mini-card__icon">
        <Users size={32} />
      </div>

      <div className="auxiliar-mini-card__content">
        <div className="auxiliar-mini-card__header">
          <h4 className="auxiliar-mini-card__name">{nombre}</h4>
          <span className={`auxiliar-mini-card__badge ${activo ? 'active' : 'inactive'}`}>
            {activo ? (
              <>
                <UserCheck size={12} />
                <span>Activo</span>
              </>
            ) : (
              <>
                <UserX size={12} />
                <span>Inactivo</span>
              </>
            )}
          </span>
        </div>

        <div className="auxiliar-mini-card__details">
          <div className="auxiliar-mini-card__detail">
            <Mail size={14} />
            <span>{correo}</span>
          </div>

          {telefono && (
            <div className="auxiliar-mini-card__detail">
              <Phone size={14} />
              <span>{telefono}</span>
            </div>
          )}

          <div className="auxiliar-mini-card__detail">
            <Calendar size={14} />
            <span>Desde {formatDate(fecha_creacion)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuxiliarCard