import React from 'react'
import { User, Mail, Phone, Edit, UserCheck, UserX } from 'lucide-react'
import './VeterinarioCard.css'

/**
 * VeterinarioCard Component
 * Muestra la información de un veterinario en formato de tarjeta
 *
 * @param {Object} veterinario - Datos del veterinario
 * @param {Function} onEdit - Callback para editar veterinario
 * @param {Function} onToggleStatus - Callback para activar/desactivar veterinario
 * @param {boolean} canEdit - Si el usuario puede editar este veterinario
 * @param {boolean} canToggleStatus - Si el usuario puede activar/desactivar (solo superadmin)
 */
const VeterinarioCard = ({
  veterinario,
  onEdit,
  onToggleStatus,
  canEdit = false,
  canToggleStatus = false
}) => {
  const { id, nombre, correo, telefono, activo } = veterinario

  return (
    <div className={`veterinario-card ${!activo ? 'veterinario-card--inactive' : ''}`}>
      {/* Avatar */}
      <div className="veterinario-card__avatar">
        <div className="veterinario-card__avatar-circle">
          <User size={48} strokeWidth={1.5} />
        </div>
      </div>

      {/* Nombre y estado */}
      <div className="veterinario-card__header">
        <h3 className="veterinario-card__name">{nombre}</h3>
        <span className={`veterinario-card__status ${activo ? 'veterinario-card__status--active' : 'veterinario-card__status--inactive'}`}>
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Información de contacto */}
      <div className="veterinario-card__info">
        <div className="veterinario-card__info-item">
          <Mail size={16} />
          <span title={correo}>{correo}</span>
        </div>

        <div className="veterinario-card__info-item">
          <Phone size={16} />
          <span>{telefono || 'No especificado'}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="veterinario-card__actions">
        {/* Botón de editar */}
        {canEdit && (
          <button
            className="veterinario-card__action-btn veterinario-card__action-btn--edit"
            onClick={() => onEdit(veterinario)}
            title="Editar veterinario"
          >
            <Edit size={16} />
            <span>Editar</span>
          </button>
        )}

        {/* Botón de activar/desactivar (solo superadmin) */}
        {canToggleStatus && (
          <button
            className={`veterinario-card__action-btn ${
              activo 
                ? 'veterinario-card__action-btn--deactivate' 
                : 'veterinario-card__action-btn--activate'
            }`}
            onClick={() => onToggleStatus(veterinario)}
            title={activo ? 'Desactivar veterinario' : 'Activar veterinario'}
          >
            {activo ? <UserX size={16} /> : <UserCheck size={16} />}
            <span>{activo ? 'Desactivar' : 'Activar'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default VeterinarioCard