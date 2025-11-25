import React, { useState, useEffect } from 'react'
import { X, Edit, Loader } from 'lucide-react'
import './EditVeterinarioModal.css'

/**
 * EditVeterinarioModal Component
 * Modal para editar un veterinario existente
 * - Superadmin puede editar cualquier veterinario
 * - Veterinario solo puede editar su propio perfil
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Function} onSubmit - Callback para enviar el formulario
 * @param {Object} veterinario - Datos del veterinario a editar
 * @param {boolean} isLoading - Si está procesando la solicitud
 */
const EditVeterinarioModal = ({ isOpen, onClose, onSubmit, veterinario, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: ''
  })

  const [errors, setErrors] = useState({})

  // Cargar datos del veterinario cuando se abre el modal
  useEffect(() => {
    if (isOpen && veterinario) {
      setFormData({
        nombre: veterinario.nombre || '',
        telefono: veterinario.telefono || ''
      })
      setErrors({})
    }
  }, [isOpen, veterinario])

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

    // Teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.telefono.trim() && !/^\+?[\d\s\-()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono no es válido'
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

    // Solo enviar campos que cambiaron
    const updatedData = {}

    if (formData.nombre !== veterinario.nombre) {
      updatedData.nombre = formData.nombre.trim()
    }

    if (formData.telefono !== veterinario.telefono) {
      updatedData.telefono = formData.telefono.trim()
    }

    // Si no hay cambios, solo cerrar
    if (Object.keys(updatedData).length === 0) {
      handleClose()
      return
    }

    await onSubmit(veterinario.id, updatedData)
  }

  // Resetear formulario al cerrar
  const handleClose = () => {
    setFormData({
      nombre: '',
      telefono: ''
    })
    setErrors({})
    onClose()
  }

  if (!isOpen || !veterinario) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title">
            <Edit size={24} />
            <h2>Editar Veterinario</h2>
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

          {/* Correo electrónico (solo lectura) */}
          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="correo"
              value={veterinario.correo}
              className="form-input"
              disabled
              readOnly
            />
            <p className="form-help">El correo no puede ser modificado</p>
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="telefono" className="form-label">
              Teléfono
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

          {/* Rol (solo lectura) */}
          <div className="form-group">
            <label htmlFor="rol" className="form-label">
              Rol del Usuario
            </label>
            <input
              type="text"
              id="rol"
              value="Veterinario"
              className="form-input"
              disabled
              readOnly
            />
            <p className="form-help">El rol no puede ser modificado desde aquí</p>
          </div>

          {/* Estado (solo lectura) */}
          <div className="form-group">
            <label htmlFor="estado" className="form-label">
              Estado
            </label>
            <div className="status-badge">
              <span className={`status-indicator ${veterinario.activo ? 'status-indicator--active' : 'status-indicator--inactive'}`}>
                {veterinario.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="form-help">
              {veterinario.activo
                ? 'Usa los botones de acción en la tabla para activar/desactivar'
                : 'Usa los botones de acción en la tabla para activar/desactivar'
              }
            </p>
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
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Edit size={16} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditVeterinarioModal