import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Info,
  AlertTriangle,
  Clock
} from 'lucide-react'
import Button from '@/components/ui/Button'
import './ConfirmationDialog.css'

/**
 * ConfirmationDialog - Modal de confirmación profesional
 *
 * Reemplaza window.confirm() con una interfaz moderna y accesible
 * Incluye animaciones, variantes de color y mejor UX
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Callback para cerrar
 * @param {function} onConfirm - Callback para confirmar
 * @param {string} variant - Tipo: 'danger' | 'warning' | 'success' | 'info' | 'restore'
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje principal
 * @param {string} details - Detalles adicionales (opcional)
 * @param {string} confirmText - Texto del botón confirmar
 * @param {string} cancelText - Texto del botón cancelar
 * @param {boolean} isLoading - Estado de carga
 * @param {React.ReactNode} children - Contenido adicional
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
  // Prevenir scroll del body cuando está abierto
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

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, isLoading, onClose])

  // Prevenir cierre si está cargando
  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // Prevenir propagación al hacer clic en el contenido
  const handleContentClick = (e) => {
    e.stopPropagation()
  }

  // Iconos según variante
  const getIcon = () => {
    const iconProps = { size: 48, strokeWidth: 2 }

    switch (variant) {
      case 'danger':
        return <AlertCircle {...iconProps} />
      case 'success':
        return <CheckCircle {...iconProps} />
      case 'info':
        return <Info {...iconProps} />
      case 'restore':
        return <RotateCcw {...iconProps} />
      case 'warning':
      default:
        return <AlertTriangle {...iconProps} />
    }
  }

  // Variante para botón de confirmar
  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger'
      case 'success':
        return 'primary'
      case 'restore':
        return 'primary'
      default:
        return 'primary'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="confirmation-dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <motion.div
            className={`confirmation-dialog-content confirmation-dialog--${variant}`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            onClick={handleContentClick}
          >
            {/* Botón cerrar */}
            <button
              className="confirmation-dialog-close"
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Cerrar"
              type="button"
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

            {/* Mensaje */}
            <p className="confirmation-dialog-message">
              {message}
            </p>

            {/* Detalles adicionales */}
            {details && (
              <div className="confirmation-dialog-details">
                <Clock size={16} />
                <span>{details}</span>
              </div>
            )}

            {/* Contenido adicional */}
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
                type="button"
              >
                {cancelText}
              </Button>
              <Button
                variant={getConfirmButtonVariant()}
                onClick={onConfirm}
                loading={isLoading}
                disabled={isLoading}
                type="button"
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