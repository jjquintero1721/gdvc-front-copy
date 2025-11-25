import { useState } from 'react'
import './UserActionsMenu.css'

/**
 * Menú de Acciones de Usuario
 *
 * Componente que muestra los botones de acción para cada usuario:
 * - Ver detalles
 * - Editar usuario
 * - Activar/Desactivar usuario
 *
 * Incluye tooltips y animaciones suaves
 *
 * @param {Object} user - Usuario sobre el que se realizarán las acciones
 * @param {function} onView - Callback para ver detalles del usuario
 * @param {function} onEdit - Callback para editar el usuario
 * @param {function} onToggleStatus - Callback para activar/desactivar usuario
 * @param {boolean} disabled - Deshabilitar todas las acciones
 */
function UserActionsMenu({ user, onView, onEdit, onToggleStatus, disabled = false }) {
  const [showTooltip, setShowTooltip] = useState(null)

  const actions = [
    {
      id: 'view',
      label: 'Ver detalles',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: onView,
      className: 'user-actions-menu__button--view'
    },
    {
      id: 'edit',
      label: 'Editar usuario',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: onEdit,
      className: 'user-actions-menu__button--edit'
    },
    {
      id: 'toggle',
      label: user.activo ? 'Desactivar usuario' : 'Activar usuario',
      icon: user.activo ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: onToggleStatus,
      className: user.activo
        ? 'user-actions-menu__button--deactivate'
        : 'user-actions-menu__button--activate'
    }
  ]

  return (
    <div className="user-actions-menu">
      {actions.map((action) => (
        <div
          key={action.id}
          className="user-actions-menu__item"
          onMouseEnter={() => setShowTooltip(action.id)}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <button
            className={`user-actions-menu__button ${action.className}`}
            onClick={() => action.onClick(user)}
            disabled={disabled}
            aria-label={action.label}
          >
            {action.icon}
          </button>

          {showTooltip === action.id && (
            <div className="user-actions-menu__tooltip">
              {action.label}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default UserActionsMenu