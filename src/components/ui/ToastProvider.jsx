import { createContext, useContext, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Alert from "@/components/ui/Alert"
import "./ToastProvider.css"

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((variant, message, duration = 3000) => {
    const id = Date.now()

    setToasts((prev) => [...prev, { id, variant, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}

      {/* Contenedor flotante */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                variant={toast.variant}
                onClose={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
              >
                {toast.message}
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToastContext = () => useContext(ToastContext)
