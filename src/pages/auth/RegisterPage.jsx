import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '@/services/authService'

// Componentes UI
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'

// Iconos
import UserIcon from '@/assets/icons/UserIcon'
import AtSignIcon from '@/assets/icons/AtSignIcon'
import LockIcon from '@/assets/icons/LockIcon'
import CreditCardIcon from '@/assets/icons/CreditCardIcon'
import PhoneIcon from '@/assets/icons/PhoneIcon'
import MapPinIcon from '@/assets/icons/MapPinIcon'
import AccountCircleIcon from '@/assets/icons/AccountCircleIcon'

// Toast
import { useToastContext } from "@/components/ui/ToastProvider";

import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const toast = useToastContext()

  const [formData, setFormData] = useState({
    full_name: '',
    cedula: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    acceptTerms: false
  })

  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.full_name.trim()) errors.full_name = 'El nombre completo es requerido'
    else if (formData.full_name.length < 3) errors.full_name = 'Debe tener al menos 3 caracteres'

    if (!formData.cedula.trim()) errors.cedula = 'La cédula es requerida'
    else if (!/^\d{8,12}$/.test(formData.cedula)) errors.cedula = 'Debe tener entre 8 y 12 dígitos'

    if (!formData.phone.trim()) errors.phone = 'El teléfono es requerido'
    else if (!/^\d{10}$/.test(formData.phone)) errors.phone = 'Debe tener 10 dígitos'

    if (!formData.address.trim()) errors.address = 'La dirección es requerida'

    if (!formData.email.trim()) errors.email = 'Correo requerido'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Correo inválido'

    if (!formData.password) errors.password = 'La contraseña es requerida'
    else if (formData.password.length < 8) errors.password = 'Debe tener mínimo 8 caracteres'

    if (!formData.acceptTerms) errors.acceptTerms = 'Debes aceptar los términos'

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

    setLoading(true)

    try {
      const userData = {
        nombre: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        cedula: formData.cedula,
        rol: 'propietario'
      }

      await authService.register(userData)

      toast("success", "Cuenta creada exitosamente")

      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Registro exitoso. Inicia sesión.' }
        })
      }, 1500)

    } catch (err) {
      toast("error", err.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Card
        title="Crea tu cuenta"
        subtitle="Únete a la familia de Clínica Veterinaria"
        headerIcon={<AccountCircleIcon />}
      >
        <form onSubmit={handleSubmit} className="register-form">

          <Input
            label="Nombre Completo"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={fieldErrors.full_name}
            icon={<UserIcon />}
          />

          <div className="register-form__row">
            <Input
              label="Cédula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              error={fieldErrors.cedula}
              icon={<CreditCardIcon />}
            />

            <Input
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
              icon={<PhoneIcon />}
            />
          </div>

          <Input
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={fieldErrors.address}
            icon={<MapPinIcon />}
          />

          <Input
            label="Correo Electrónico"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            icon={<AtSignIcon />}
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            icon={<LockIcon />}
          />

          <div className="register-form__terms">
            <Checkbox
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
            />
            <p>Acepto los términos y condiciones</p>
          </div>
          {fieldErrors.acceptTerms && (
            <p className="input-error caption">{fieldErrors.acceptTerms}</p>
          )}

          <Button fullWidth type="submit" loading={loading}>
            Crear cuenta
          </Button>

          <div className="register-form__login caption">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default RegisterPage
