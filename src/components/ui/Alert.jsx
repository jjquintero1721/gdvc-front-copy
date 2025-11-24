import './Alert.css'

/**
 * Componente Alert para mostrar mensajes
 *
 * @param {string} type - Tipo de alerta: 'success', 'error', 'warning', 'info'
 * @param {string} title - Título opcional
 * @param {string} message - Mensaje de la alerta
 * @param {function} onClose - Función para cerrar la alerta
 */
function Alert({
  type = 'info',
  title,
  message,
  onClose,
  className = ''
}) {
  const alertClassNames = [
    'alert',
    `alert--${type}`,
    className
  ].filter(Boolean).join(' ')

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div className={alertClassNames} role="alert">
      <div className="alert__icon">
        {icons[type]}
      </div>

      <div className="alert__content">
        {title && <div className="alert__title body-m">{title}</div>}
        {message && <div className="alert__message caption">{message}</div>}
      </div>

      {onClose && (
        <button
          className="alert__close"
          onClick={onClose}
          aria-label="Cerrar alerta"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default Alert