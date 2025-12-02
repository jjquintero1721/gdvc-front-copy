import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/AuthStore.jsx'
import authService from '@/services/authService'

// Componentes UI
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

// Iconos
import LockIcon from '@/assets/icons/LockIcon'
import AccountCircleIcon from '@/assets/icons/AccountCircleIcon'

// Toast
import { useToastContext } from "@/components/ui/ToastProvider";

import './ChangePasswordPage.css'

function ChangePasswordPage() {
  const navigate = useNavigate()
  const toast = useToastContext()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentUser = useAuthStore((state) => state.user)

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.oldPassword) errors.oldPassword = 'La contraseña actual es requerida'

    if (!formData.newPassword) errors.newPassword = 'La nueva contraseña es requerida'
    else if (formData.newPassword.length < 8) errors.newPassword = 'Debe tener al menos 8 caracteres'

    if (!formData.confirmPassword) errors.confirmPassword = 'Debes confirmar la contraseña'
    else if (formData.newPassword !== formData.confirmPassword)
      errors.confirmPassword = 'Las contraseñas no coinciden'

    if (formData.oldPassword === formData.newPassword)
      errors.newPassword = 'La nueva contraseña debe ser diferente a la actual'

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast("error", "Corrige los campos marcados")
      return
    }

    if (!currentUser || !currentUser.id) {
      toast("error", "No se pudo obtener tu información. Inicia sesión de nuevo.")
      return
    }

    setLoading(true)

    try {
      await authService.changePassword(
        currentUser.id,
        formData.oldPassword,
        formData.newPassword
      )

      toast("success", "Contraseña cambiada exitosamente")

      setTimeout(() => {
        localStorage.clear()
        navigate('/login')
      }, 1500)

    } catch (err) {
      toast("error", err.message || "Error al cambiar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="change-password-page">
        <Card
          title="Inicio de sesión requerido"
          subtitle="Debes iniciar sesión para cambiar tu contraseña"
          headerIcon={<AccountCircleIcon />}
        >
          <Button fullWidth onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="change-password-page">
      <Card
        title="Cambiar Contraseña"
        subtitle={`Cambiando contraseña para: ${currentUser?.nombre || currentUser?.correo}`}
        headerIcon={<AccountCircleIcon />}
      >
        <form onSubmit={handleSubmit} className="change-password-form">

          <Input
            label="Contraseña Actual"
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            error={fieldErrors.oldPassword}
            icon={<LockIcon />}
          />

          <Input
            label="Nueva Contraseña"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={fieldErrors.newPassword}
            icon={<LockIcon />}
          />

          <Input
            label="Confirmar Nueva Contraseña"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            icon={<LockIcon />}
          />

          <Button fullWidth loading={loading}>
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>

          <div className="change-password-form__back caption">
            <Link to="/dashboard">← Volver al Dashboard</Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ChangePasswordPage
