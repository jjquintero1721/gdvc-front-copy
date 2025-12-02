import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react"
import "./Alert.css"

function Alert({ type = "info", children, onClose }) {

  if (!children || (typeof children === 'string' && !children.trim())) {
    return null
  }

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  }

  return (
    <div className={`alert alert--${type}`}>
      <div className="alert__icon">{icons[type]}</div>

      <div className="alert__message">{children}</div>

      {onClose && (
        <button className="alert__close" onClick={onClose}>
          <X size={18} />
        </button>
      )}
    </div>
  )
}

export default Alert
