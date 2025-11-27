import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, RotateCcw, Info } from 'lucide-react'
import Button from '@/components/ui/Button'
import './ConfirmationDialog.css'

/**
 * ConfirmationDialog - Modal de confirmación mejorado
 *
 * Componente reutilizable para confirmaciones críticas con mejor UX
 * Incluye variantes para diferentes tipos de acciones
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Callback para cerrar el modal
 * @param {function} onConfirm - Callback para confirmar la acción
 * @param {string} variant - Tipo: 'danger', 'warning', 'success', 'info'
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje principal
 * @param {string} details - Detalles adicionales (opcional)
 * @param {string} confirmText - Texto del botón confirmar
 * @param {string} cancelText - Texto del botón cancelar
 * @param {boolean} isLoading - Estado de carga
 * @param {React.ReactNode} children - Contenido adicional (opcional)
 */
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  variant = 'warning',
  title,
  message,
  details,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  children
}) => {
  // Prevenir cierre si está cargando
  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // Prevenir cierre al hacer clic en el contenido
  const handleContentClick = (e) => {
    e.stopPropagation()
  }

  // Iconos según variante
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle size={48} />
      case 'success':
        return <CheckCircle size={48} />
      case 'info':
        return <Info size={48} />
      case 'restore':
        return <RotateCcw size={48} />
      case 'warning':
      default:
        return <AlertCircle size={48} />
    }
  }

  // Colores según variante
  const getVariantClass = () => {
    return `confirmation-dialog--${variant}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="confirmation-dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={`confirmation-dialog-content ${getVariantClass()}`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={handleContentClick}
          >
            {/* Botón cerrar */}
            <button
              className="confirmation-dialog-close"
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            {/* Icono principal */}
            <div className={`confirmation-dialog-icon confirmation-dialog-icon--${variant}`}>
              {getIcon()}
            </div>

            {/* Título */}
            <h3 className="confirmation-dialog-title">
              {title}
            </h3>

            {/* Mensaje principal */}
            <p className="confirmation-dialog-message">
              {message}
            </p>

            {/* Detalles adicionales */}
            {details && (
              <div className="confirmation-dialog-details">
                {details}
              </div>
            )}

            {/* Contenido personalizado (opcional) */}
            {children && (
              <div className="confirmation-dialog-body">
                {children}
              </div>
            )}

            {/* Botones de acción */}
            <div className="confirmation-dialog-actions">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
                className="confirmation-dialog-btn-cancel"
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                loading={isLoading}
                disabled={isLoading}
                className="confirmation-dialog-btn-confirm"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationDialog