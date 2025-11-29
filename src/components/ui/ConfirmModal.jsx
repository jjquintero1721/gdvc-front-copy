import { useEffect } from 'react'
import Button from './Button'
import './ConfirmModal.css'

/**
 * Modal de Confirmación Reutilizable
 *
 * Componente para mostrar diálogos de confirmación con animaciones suaves
 *
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Callback cuando se cierra el modal
 * @param {function} onConfirm - Callback cuando se confirma la acción
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje descriptivo
 * @param {string} confirmText - Texto del botón de confirmar (default: "Confirmar")
 * @param {string} cancelText - Texto del botón de cancelar (default: "Cancelar")
 * @param {string} variant - Tipo de acción: 'danger', 'warning', 'success', 'info' (default: 'warning')
 * @param {boolean} loading - Estado de carga durante la acción (default: false)
 */
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  loading = false
}) {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Manejar tecla ESC para cerrar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  // Icono según el variant
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <svg className="confirm-modal__icon confirm-modal__icon--danger" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )
      case 'warning':
        return (
          <svg className="confirm-modal__icon confirm-modal__icon--warning" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 20h20L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 10v4M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )
      case 'success':
        return (
          <svg className="confirm-modal__icon confirm-modal__icon--success" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      default:
        return (
          <svg className="confirm-modal__icon confirm-modal__icon--info" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )
    }
  }

  return (
    <div className="confirm-modal__overlay" onClick={!loading ? onClose : undefined}>
      <div
        className="confirm-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal__content">
          <div className="confirm-modal__icon-container">
            {getIcon()}
          </div>

          <h2 className="confirm-modal__title">{title}</h2>

          <p className="confirm-modal__message">{message}</p>

          <div className="confirm-modal__actions">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="confirm-modal__button confirm-modal__button--cancel"
            >
              {cancelText}
            </Button>

            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              loading={loading}
              className="confirm-modal__button confirm-modal__button--confirm"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal