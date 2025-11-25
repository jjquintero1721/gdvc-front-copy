import React, { useState } from 'react'
import { X, UserPlus, Loader } from 'lucide-react'
import './CreateVeterinarioModal.css'

/**
 * CreateVeterinarioModal Component
 * Modal para crear un nuevo veterinario (solo superadmin)
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Function} onSubmit - Callback para enviar el formulario
 * @param {boolean} isLoading - Si está procesando la solicitud
 */
const CreateVeterinarioModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: ''
  })

  const [errors, setErrors] = useState({})

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    // Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    // Correo
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido'
    }

    // Teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono no es válido'
    }

    // Contraseña
    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es obligatoria'
    } else if (formData.contrasena.length < 8) {
      newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres'
    }

    // Confirmar contraseña
    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Debes confirmar la contraseña'
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Preparar datos para enviar
    const veterinarioData = {
      nombre: formData.nombre.trim(),
      correo: formData.correo.trim(),
      telefono: formData.telefono.trim(),
      contrasena: formData.contrasena,
      rol: 'veterinario' // Importante: asegurar que sea veterinario
    }

    await onSubmit(veterinarioData)
  }

  // Resetear formulario al cerrar
  const handleClose = () => {
    setFormData({
      nombre: '',
      correo: '',
      telefono: '',
      contrasena: '',
      confirmarContrasena: ''
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title">
            <UserPlus size={24} />
            <h2>Registrar Nuevo Veterinario</h2>
          </div>
          <button
            className="modal-header__close"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Nombre completo */}
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre Completo <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`form-input ${errors.nombre ? 'form-input--error' : ''}`}
              placeholder="Ej: Dr. Carlos Rodríguez"
              disabled={isLoading}
            />
            {errors.nombre && (
              <span className="form-error">{errors.nombre}</span>
            )}
          </div>

          {/* Correo electrónico */}
          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              Correo Electrónico <span className="required">*</span>
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={`form-input ${errors.correo ? 'form-input--error' : ''}`}
              placeholder="veterinario@clinica.com"
              disabled={isLoading}
            />
            {errors.correo && (
              <span className="form-error">{errors.correo}</span>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="telefono" className="form-label">
              Teléfono <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`form-input ${errors.telefono ? 'form-input--error' : ''}`}
              placeholder="+57 300 123 4567"
              disabled={isLoading}
            />
            {errors.telefono && (
              <span className="form-error">{errors.telefono}</span>
            )}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="contrasena" className="form-label">
              Contraseña <span className="required">*</span>
            </label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              className={`form-input ${errors.contrasena ? 'form-input--error' : ''}`}
              placeholder="Mínimo 8 caracteres"
              disabled={isLoading}
            />
            {errors.contrasena && (
              <span className="form-error">{errors.contrasena}</span>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <label htmlFor="confirmarContrasena" className="form-label">
              Confirmar Contraseña <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmarContrasena"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              className={`form-input ${errors.confirmarContrasena ? 'form-input--error' : ''}`}
              placeholder="Repetir contraseña"
              disabled={isLoading}
            />
            {errors.confirmarContrasena && (
              <span className="form-error">{errors.confirmarContrasena}</span>
            )}
          </div>

          {/* Botones */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="spinner" size={16} />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Registrar Veterinario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateVeterinarioModal