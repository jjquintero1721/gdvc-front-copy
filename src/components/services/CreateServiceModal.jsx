import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import './CreateServiceModal.css'

/**
 * Modal para Crear/Editar Servicio
 * RF-09 | Gestión de servicios
 *
 * Campos del formulario:
 * - nombre (string, requerido)
 * - descripcion (string, opcional)
 * - duracion_minutos (number, requerido)
 * - costo (number, requerido)
 *
 * @param {boolean} isOpen - Estado del modal
 * @param {Function} onClose - Callback para cerrar
 * @param {Function} onSubmit - Callback para enviar datos
 * @param {Object} service - Servicio a editar (null para crear nuevo)
 * @param {boolean} loading - Estado de carga
 */
function CreateServiceModal({ isOpen, onClose, onSubmit, service = null, loading = false }) {
  const isEditing = !!service

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion_minutos: '',
    costo: ''
  })

  // Estados de UI
  const [fieldErrors, setFieldErrors] = useState({})

  // Cargar datos si estamos editando
  useEffect(() => {
    if (service) {
      setFormData({
        nombre: service.nombre || '',
        descripcion: service.descripcion || '',
        duracion_minutos: service.duracion_minutos?.toString() || '',
        costo: service.costo?.toString() || ''
      })
    } else {
      resetForm()
    }
  }, [service])

  // Limpiar formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      duracion_minutos: '',
      costo: ''
    })
    setFieldErrors({})
  }

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const errors = {}

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre del servicio es requerido'
    } else if (formData.nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres'
    } else if (formData.nombre.trim().length > 150) {
      errors.nombre = 'El nombre no puede exceder 150 caracteres'
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      errors.descripcion = 'La descripción no puede exceder 500 caracteres'
    }

    if (!formData.duracion_minutos) {
      errors.duracion_minutos = 'La duración es requerida'
    } else {
      const duracion = parseInt(formData.duracion_minutos)
      if (isNaN(duracion) || duracion <= 0) {
        errors.duracion_minutos = 'La duración debe ser un número mayor a 0'
      } else if (duracion > 480) {
        errors.duracion_minutos = 'La duración no puede exceder 480 minutos (8 horas)'
      }
    }

    if (!formData.costo) {
      errors.costo = 'El costo es requerido'
    } else {
      const costo = parseFloat(formData.costo)
      if (isNaN(costo) || costo < 0) {
        errors.costo = 'El costo debe ser un número mayor o igual a 0'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar submit
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Preparar datos para enviar
    const dataToSubmit = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null,
      duracion_minutos: parseInt(formData.duracion_minutos),
      costo: parseFloat(formData.costo)
    }

    onSubmit(dataToSubmit)
  }

  // Manejar cierre
  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <Card className="create-service-modal">
          {/* Header */}
          <div className="create-service-modal__header">
            <h2 className="create-service-modal__title">
              {isEditing ? 'Editar Servicio' : 'Registrar Nuevo Servicio'}
            </h2>
            <button
              className="create-service-modal__close-btn"
              onClick={handleClose}
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="create-service-modal__form">
            {/* Nombre */}
            <div className="create-service-modal__field">
              <label className="create-service-modal__label">
                Nombre del Servicio *
              </label>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Consulta General"
                error={fieldErrors.nombre}
                disabled={loading}
                required
              />
            </div>

            {/* Descripción */}
            <div className="create-service-modal__field">
              <label className="create-service-modal__label">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción detallada del servicio..."
                className={`create-service-modal__textarea ${fieldErrors.descripcion ? 'create-service-modal__textarea--error' : ''}`}
                rows="4"
                disabled={loading}
                maxLength="500"
              />
              {fieldErrors.descripcion && (
                <span className="create-service-modal__error">{fieldErrors.descripcion}</span>
              )}
              <span className="create-service-modal__char-count">
                {formData.descripcion.length}/500 caracteres
              </span>
            </div>

            {/* Duración y Costo en fila */}
            <div className="create-service-modal__row">
              {/* Duración */}
              <div className="create-service-modal__field">
                <label className="create-service-modal__label">
                  Duración (minutos) *
                </label>
                <Input
                  type="number"
                  name="duracion_minutos"
                  value={formData.duracion_minutos}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  max="480"
                  error={fieldErrors.duracion_minutos}
                  disabled={loading}
                  required
                />
              </div>

              {/* Costo */}
              <div className="create-service-modal__field">
                <label className="create-service-modal__label">
                  Costo (COP) *
                </label>
                <Input
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                  step="1000"
                  error={fieldErrors.costo}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Botones */}
            <div className="create-service-modal__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Registrar')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default CreateServiceModal