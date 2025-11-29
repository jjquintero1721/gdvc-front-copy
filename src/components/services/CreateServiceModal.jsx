import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import './CreateServiceModal.css'

function CreateServiceModal({ isOpen, onClose, onSubmit, service = null, loading = false }) {
  const isEditing = !!service

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion_minutos: '',
    costo: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [shake, setShake] = useState(false)

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

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      duracion_minutos: '',
      costo: ''
    })
    setFieldErrors({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido'
    if (formData.descripcion && formData.descripcion.length > 500)
      errors.descripcion = 'Máximo 500 caracteres'
    if (!parseInt(formData.duracion_minutos))
      errors.duracion_minutos = 'Duración inválida'
    if (isNaN(parseFloat(formData.costo)))
      errors.costo = 'Costo inválido'

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setShake(true)
      setTimeout(() => setShake(false), 300)
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    onSubmit({
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null,
      duracion_minutos: parseInt(formData.duracion_minutos),
      costo: parseFloat(formData.costo)
    })
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className={`modal-box ${shake ? 'shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Servicio' : 'Registrar Nuevo Servicio'}</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>

          {/* Nombre */}
          <div className="field">
            <label>Nombre del Servicio *</label>
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Consulta General"
              error={fieldErrors.nombre}
            />
          </div>

          {/* Descripción */}
          <div className="field">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción detallada..."
              maxLength="500"
              className={`textarea ${fieldErrors.descripcion ? 'error' : ''}`}
            />
            <div className="char-count">{formData.descripcion.length}/500</div>
          </div>

          {/* Duración & Costo */}
          <div className="row">
            <div className="field">
              <label>Duración (minutos) *</label>
              <Input
                type="number"
                name="duracion_minutos"
                value={formData.duracion_minutos}
                onChange={handleChange}
                placeholder="30"
                error={fieldErrors.duracion_minutos}
              />
            </div>

            <div className="field">
              <label>Costo (COP) *</label>
              <Input
                type="number"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                placeholder="50000"
                error={fieldErrors.costo}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="actions">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateServiceModal