import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react"
import "./Alert.css"

function Alert({ variant = "info", children, onClose }) {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  }

  return (
    <div className={`alert alert--${variant}`}>
      <div className="alert__icon">{icons[variant]}</div>

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
