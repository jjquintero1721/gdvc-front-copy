import React from 'react'
import { X, AlertCircle, Loader } from 'lucide-react'
import './ConfirmModal.css'

/**
 * ConfirmModal Component
 * Modal reutilizable para confirmaciones de acciones
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Function} onConfirm - Callback para confirmar la acción
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje de confirmación
 * @param {string} confirmText - Texto del botón de confirmar
 * @param {string} cancelText - Texto del botón de cancelar
 * @param {string} confirmVariant - Variante del botón: 'danger', 'success', 'primary'
 * @param {boolean} isLoading - Si está procesando la acción
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className={`confirm-modal-icon confirm-modal-icon--${confirmVariant}`}>
          <AlertCircle size={24} />
        </div>

        {/* Título */}
        <h3 className="confirm-modal-title">{title}</h3>

        {/* Mensaje */}
        <p className="confirm-modal-message">{message}</p>

        {/* Botones */}
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn--cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-modal-btn confirm-modal-btn--${confirmVariant}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="spinner" size={16} />
                <span>Procesando...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal