import React, { useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
import './CreateAuxiliarModal.css'

const CreateAuxiliarModal = ({ isOpen, onClose, veterinarioId, veterinarioNombre, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSuccess(formData)
      setFormData({ nombre: '', correo: '', telefono: '', contrasena: '' })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al crear auxiliar')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <UserPlus size={32} />
          </div>
          <h2 className="modal-title">Crear Nuevo Auxiliar</h2>
          <p className="modal-subtitle">Para {veterinarioNombre}</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error">
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo *</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: María López"
              required
              minLength={3}
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico *</label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              placeholder="maria.lopez@gdcv.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+573005555555"
              maxLength={20}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña *</label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              maxLength={50}
              disabled={loading}
            />
            <small className="form-hint">Mínimo 8 caracteres, incluye números y mayúsculas</small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Crear Auxiliar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAuxiliarModal