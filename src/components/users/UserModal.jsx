import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import './UserModal.css'

/**
 * Modal para Ver/Editar Usuario
 * Props:
 * - isOpen: boolean - Controla si el modal está abierto
 * - onClose: function - Función para cerrar el modal
 * - user: object - Datos del usuario
 * - mode: string - 'view' o 'edit'
 * - onSave: function - Función para guardar cambios
 */
function UserModal({ isOpen, onClose, user, mode = 'view', onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    correo: '',
    telefono: '',
    rol: '',
    activo: true,
    fecha_creacion: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const isEditMode = mode === 'edit'

  // Cargar datos del usuario cuando el modal se abre
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        nombre: user.nombre || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
        rol: user.rol || '',
        activo: user.activo,
        fecha_creacion: user.fecha_creacion || ''
      })
    }
  }, [user])

  /**
   * Manejador de cambios en los inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error del campo
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const errors = {}

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (formData.telefono && formData.telefono.length < 7) {
      errors.telefono = 'El teléfono debe tener al menos 7 dígitos'
    }

    return errors
  }

  /**
   * Guardar cambios
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validar formulario
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      await onSave(formData)
      // El componente padre maneja el cierre y la recarga
    } catch (err) {
      console.error('Error al guardar usuario:', err)
      setError(err.message || 'Error al guardar los cambios')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener el color del badge según el rol
   */
  const getRoleBadgeClass = (role) => {
    const classes = {
      superadmin: 'user-badge--superadmin',
      veterinario: 'user-badge--veterinario',
      auxiliar: 'user-badge--auxiliar',
      propietario: 'user-badge--propietario'
    }
    return classes[role] || 'user-badge--default'
  }

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? '✏️ Editar Usuario' : '👁️ Detalles del Usuario'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="user-form">
            {/* Nombre */}
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre Completo *
              </label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                disabled={!isEditMode}
                placeholder="Nombre del usuario"
                error={fieldErrors.nombre}
              />
            </div>

            {/* Correo (no editable) */}
            <div className="form-group">
              <label htmlFor="correo" className="form-label">
                Correo Electrónico
              </label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                disabled
                placeholder="correo@ejemplo.com"
              />
              <small className="form-hint">El correo no puede ser modificado</small>
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label htmlFor="telefono" className="form-label">
                Teléfono
              </label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                disabled={!isEditMode}
                placeholder="Número de teléfono"
                error={fieldErrors.telefono}
              />
            </div>

            {/* Rol (no editable) */}
            <div className="form-group">
              <label className="form-label">Rol del Usuario</label>
              <div className="form-value">
                <span className={`user-badge ${getRoleBadgeClass(formData.rol)}`}>
                  {formData.rol}
                </span>
              </div>
              <small className="form-hint">El rol no puede ser modificado desde aquí</small>
            </div>

            {/* Estado */}
            <div className="form-group">
              <label className="form-label">Estado</label>
              <div className="form-value">
                <span
                  className={`status-badge ${
                    formData.activo ? 'status-badge--active' : 'status-badge--inactive'
                  }`}
                >
                  {formData.activo ? '✅ Activo' : '🚫 Inactivo'}
                </span>
              </div>
              <small className="form-hint">
                Usa los botones de acción en la tabla para activar/desactivar
              </small>
            </div>

            {/* Fecha de creación */}
            {!isEditMode && (
              <div className="form-group">
                <label className="form-label">Fecha de Creación</label>
                <div className="form-value">{formatDate(formData.fecha_creacion)}</div>
              </div>
            )}

            {/* Información adicional si es propietario */}
            {user?.propietario_id && !isEditMode && (
              <div className="form-group">
                <label className="form-label">Información Adicional</label>
                <div className="form-value">
                  <p><strong>ID Propietario:</strong> {user.propietario_id}</p>
                  {user.documento && (
                    <p><strong>Documento:</strong> {user.documento}</p>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button onClick={onClose} variant="outline" disabled={loading}>
            {isEditMode ? 'Cancelar' : 'Cerrar'}
          </Button>

          {isEditMode && (
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserModal