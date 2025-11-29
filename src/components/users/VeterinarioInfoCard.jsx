import React from 'react'
import { User, Mail, Phone, Calendar, Stethoscope } from 'lucide-react'
import './VeterinarioInfoCard.css'

/**
 * VeterinarioInfoCard - Muestra información del veterinario encargado
 * Usado en la vista del auxiliar
 */
const VeterinarioInfoCard = ({ veterinario }) => {
  const { nombre, correo, telefono, fecha_creacion } = veterinario

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
    <div className="vet-info-card">
      <div className="vet-info-card__icon">
        <Stethoscope size={32} />
      </div>

      <div className="vet-info-card__content">
        <div className="vet-info-card__header">
          <h4 className="vet-info-card__name">{nombre}</h4>
          <span className="vet-info-card__badge">
            <User size={12} />
            <span>Veterinario</span>
          </span>
        </div>

        <div className="vet-info-card__details">
          <div className="vet-info-card__detail">
            <Mail size={14} />
            <span>{correo}</span>
          </div>

          {telefono && (
            <div className="vet-info-card__detail">
              <Phone size={14} />
              <span>{telefono}</span>
            </div>
          )}

          <div className="vet-info-card__detail">
            <Calendar size={14} />
            <span>En PawFlow desde {formatDate(fecha_creacion)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VeterinarioInfoCard