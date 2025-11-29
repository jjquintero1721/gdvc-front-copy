import React, { useState } from 'react'
import { User, Mail, Phone, Edit, UserCheck, UserX, UserPlus, Users } from 'lucide-react'
import CreateAuxiliarModal from './CreateAuxiliarModal'
import AuxiliaresListModal from './AuxiliaresListModal'
import './VeterinarioCard.css'

/**
 * VeterinarioCard Component
 * Muestra la información de un veterinario en formato de tarjeta
 */
const VeterinarioCard = ({
  veterinario,
  onEdit,
  onToggleStatus,
  onCreateAuxiliar,
  onViewAuxiliares,
  canEdit = false,
  canToggleStatus = false,
  canManageAuxiliares = false
}) => {
  const { id, nombre, correo, telefono, activo } = veterinario
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showListModal, setShowListModal] = useState(false)

  const handleCreateAuxiliar = async (auxiliarData) => {
    await onCreateAuxiliar(id, auxiliarData)
  }

  return (
    <>
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

        {/* Sección de auxiliares */}
        {canManageAuxiliares && (
          <div className="veterinario-card__auxiliares-section">
            <button
              className="veterinario-card__auxiliar-btn veterinario-card__auxiliar-btn--create"
              onClick={() => setShowCreateModal(true)}
              title="Crear nuevo auxiliar"
            >
              <UserPlus size={16} />
              <span>Crear Auxiliar</span>
            </button>

            <button
              className="veterinario-card__auxiliar-btn veterinario-card__auxiliar-btn--view"
              onClick={() => setShowListModal(true)}
              title="Ver auxiliares asignados"
            >
              <Users size={16} />
              <span>Ver Auxiliares</span>
            </button>
          </div>
        )}

        {/* Acciones principales */}
        <div className="veterinario-card__actions">
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

      {/* Modales */}
      <CreateAuxiliarModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        veterinarioId={id}
        veterinarioNombre={nombre}
        onSuccess={handleCreateAuxiliar}
      />

      <AuxiliaresListModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        veterinarioId={id}
        veterinarioNombre={nombre}
        fetchAuxiliares={onViewAuxiliares}
      />
    </>
  )
}

export default VeterinarioCard