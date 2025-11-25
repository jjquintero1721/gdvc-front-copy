import React, { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import './Toast.css'

/**
 * Toast Component
 * Componente para mostrar notificaciones temporales
 *
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en milisegundos (default: 5000)
 * @param {Function} onClose - Callback cuando se cierra el toast
 */
const Toast = ({
  message,
  type = 'success',
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <XCircle size={20} />
      case 'warning':
        return <AlertCircle size={20} />
      case 'info':
        return <Info size={20} />
      default:
        return <Info size={20} />
    }
  }

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__icon">
        {getIcon()}
      </div>
      <p className="toast__message">{message}</p>
      <button
        className="toast__close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default Toast