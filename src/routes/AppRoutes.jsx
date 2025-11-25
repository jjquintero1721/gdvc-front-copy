import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layouts
import AuthLayout from '@/components/layout/AuthLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage'

// Dashboard Pages
import DashboardHome from '@/pages/dashboard/DashboardHome'

// Users Pages
import UsersPage from '@/pages/users/UsersPage'
import UserDetailPage from '@/pages/users/UserDetailPage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas Públicas (Auth) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      <Route
        path="/registro"
        element={
          <PublicRoute>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      <Route
        path="/cambiar-contrasena"
        element={
          <PublicRoute>
            <AuthLayout>
              <ChangePasswordPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Rutas Protegidas (Dashboard) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Ruta de Gestión de Usuarios (Solo SUPERADMIN) */}
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Ver detalle de un usuario específico (desde gestión de usuarios) */}
      <Route
        path="/usuarios/:userId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Ver perfil propio (desde botón del sidebar) */}
      <Route
        path="/mi-perfil"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Redireccionamiento por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 - Página no encontrada */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes