import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from '@/store/AuthStore.jsx'
import AppRoutes from '@/routes/AppRoutes.jsx'
import { ToastProvider} from "@components/ui/ToastProvider.jsx";

function App() {
  const { isAuthenticated, isTokenExpired, logout } = useAuthStore()

  // Validar token al cargar
  useEffect(() => {
    if (isAuthenticated && isTokenExpired()) {
      console.warn('⚠️ Token expirado, cerrando sesión...')
      logout()
    }
  }, [isAuthenticated, isTokenExpired, logout])

  return (
    <ToastProvider >
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
    </ToastProvider>
  )
}

export default App