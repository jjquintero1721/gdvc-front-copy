import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import petService from '@/services/petService'
import userService from '@/services/userService'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import './CreatePetPage.css'

/**
 * Página de Registro de Mascota
 * RF-04 | Registro de mascotas
 * RN06: Mascota vinculada a propietario
 * RN07: No duplicar nombre+especie por propietario
 *
 * Campos del formulario:
 * - propietario_id (UUID) - Requerido
 * - nombre (string) - Requerido
 * - especie (string) - Requerido
 * - raza (string) - Opcional
 * - microchip (string) - Opcional
 * - fecha_nacimiento (date) - Opcional
 *
 * Comportamiento por rol:
 * - STAFF (superadmin, veterinario, auxiliar): Puede seleccionar propietario
 * - PROPIETARIO: Solo puede registrar mascotas para sí mismo
 */
function CreatePetPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()

  // Verificar permisos
  const isStaff = ['superadmin', 'veterinario', 'auxiliar'].includes(currentUser?.rol)

  // Estado del formulario
  const [formData, setFormData] = useState({
    propietario_id: isStaff ? '' : (currentUser?.propietario_id || ''),
    nombre: '',
    especie: '',
    raza: '',
    microchip: '',
    fecha_nacimiento: ''
  })

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [owners, setOwners] = useState([])
  const [loadingOwners, setLoadingOwners] = useState(isStaff)

  /**
   * Cargar lista de propietarios (solo para staff)
   */
  useEffect(() => {
    if (isStaff) {
      loadOwners()
    }
  }, [isStaff])

  const loadOwners = async () => {
    try {
      setLoadingOwners(true)
      // ✅ Método correcto: getAllUsers con filtro por rol
      const response = await userService.getAllUsers({
        skip: 0,
        limit: 100,
        rol: 'propietario'
      })

      if (response.success && response.data) {
        // ✅ La respuesta viene en response.data.usuarios (no users)
        const ownersList = response.data.usuarios || []

        // Mapear usuarios propietarios a propietarios con propietario_id
        const mappedOwners = ownersList
          .filter(u => u.propietario_id) // Solo usuarios que tienen propietario_id
          .map(u => ({
            id: u.propietario_id,
            nombre: u.nombre,
            correo: u.correo
          }))
        setOwners(mappedOwners)

        // Si no hay propietarios, mostrar advertencia
        if (mappedOwners.length === 0) {
          console.warn('No se encontraron propietarios con propietario_id')
        }
      }
    } catch (err) {
      console.error('Error al cargar propietarios:', err)
      setError('Error al cargar la lista de propietarios. ' + (err.message || ''))
    } finally {
      setLoadingOwners(false)
    }
  }

  /**
   * Manejar cambios en los inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo al escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const errors = {}

    // propietario_id requerido
    if (!formData.propietario_id) {
      errors.propietario_id = 'Debes seleccionar un propietario'
    }

    // nombre requerido
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres'
    } else if (formData.nombre.trim().length > 120) {
      errors.nombre = 'El nombre no puede exceder 120 caracteres'
    }

    // especie requerida
    if (!formData.especie.trim()) {
      errors.especie = 'La especie es obligatoria'
    } else if (formData.especie.trim().length < 2) {
      errors.especie = 'La especie debe tener al menos 2 caracteres'
    }

    // raza (opcional pero con límite)
    if (formData.raza && formData.raza.trim().length > 120) {
      errors.raza = 'La raza no puede exceder 120 caracteres'
    }

    // microchip (opcional pero con límite)
    if (formData.microchip && formData.microchip.trim().length > 60) {
      errors.microchip = 'El microchip no puede exceder 60 caracteres'
    }

    // fecha_nacimiento (opcional pero no puede ser futura)
    if (formData.fecha_nacimiento) {
      const fechaNac = new Date(formData.fecha_nacimiento)
      const hoy = new Date()
      if (fechaNac > hoy) {
        errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar formulario
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Preparar datos para el backend
      const petData = {
        propietario_id: formData.propietario_id,
        nombre: formData.nombre.trim(),
        especie: formData.especie.trim().toLowerCase(),
        raza: formData.raza?.trim() || null,
        microchip: formData.microchip?.trim() || null,
        fecha_nacimiento: formData.fecha_nacimiento || null
      }

      const response = await petService.createPet(petData)

      if (response.success) {
        // Redirigir a la página de mascotas con mensaje de éxito
        navigate('/mascotas', {
          state: { success: 'Mascota registrada exitosamente' }
        })
      } else {
        setError(response.message || 'Error al registrar la mascota')
      }
    } catch (err) {
      console.error('Error al crear mascota:', err)
      setError(err.message || 'Error al registrar la mascota. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cancelar y volver
   */
  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className="create-pet-page">
      <div className="create-pet-page__container">
        {/* Header */}
        <div className="create-pet-page__header">
          <h1 className="create-pet-page__title">Registrar Nueva Mascota</h1>
          <p className="create-pet-page__subtitle">
            Completa la información de la mascota. Los campos marcados con * son obligatorios.
          </p>
        </div>

        {/* Alerta de error global */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Formulario */}
        <Card>
          <form onSubmit={handleSubmit} className="create-pet-form">
            {/* Selección de propietario (solo para staff) */}
            {isStaff && (
              <div className="create-pet-form__field">
                <label htmlFor="propietario_id" className="create-pet-form__label">
                  Propietario *
                </label>
                <select
                  id="propietario_id"
                  name="propietario_id"
                  value={formData.propietario_id}
                  onChange={handleChange}
                  disabled={loadingOwners}
                  className={`create-pet-form__select ${fieldErrors.propietario_id ? 'create-pet-form__select--error' : ''}`}
                  required
                >
                  <option value="">
                    {loadingOwners ? 'Cargando propietarios...' : 'Selecciona un propietario'}
                  </option>
                  {owners.map(owner => (
                    <option key={owner.id} value={owner.id}>
                      {owner.nombre} - {owner.correo}
                    </option>
                  ))}
                </select>
                {fieldErrors.propietario_id && (
                  <span className="create-pet-form__error">{fieldErrors.propietario_id}</span>
                )}
              </div>
            )}

            {/* Nombre */}
            <div className="create-pet-form__field">
              <label htmlFor="nombre" className="create-pet-form__label">
                Nombre de la Mascota *
              </label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Max, Luna, Michi"
                error={fieldErrors.nombre}
                required
                maxLength={120}
              />
            </div>

            {/* Especie */}
            <div className="create-pet-form__field">
              <label htmlFor="especie" className="create-pet-form__label">
                Especie *
              </label>
              <select
                id="especie"
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                className={`create-pet-form__select ${fieldErrors.especie ? 'create-pet-form__select--error' : ''}`}
                required
              >
                <option value="">Selecciona una especie</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="ave">Ave</option>
                <option value="reptil">Reptil</option>
                <option value="roedor">Roedor</option>
                <option value="otro">Otro</option>
              </select>
              {fieldErrors.especie && (
                <span className="create-pet-form__error">{fieldErrors.especie}</span>
              )}
            </div>

            {/* Raza */}
            <div className="create-pet-form__field">
              <label htmlFor="raza" className="create-pet-form__label">
                Raza
              </label>
              <Input
                id="raza"
                name="raza"
                type="text"
                value={formData.raza}
                onChange={handleChange}
                placeholder="Ej: Golden Retriever, Siamés, Criollo"
                error={fieldErrors.raza}
                maxLength={120}
              />
              <span className="create-pet-form__hint">Opcional</span>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="create-pet-form__field">
              <label htmlFor="fecha_nacimiento" className="create-pet-form__label">
                Fecha de Nacimiento
              </label>
              <Input
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                error={fieldErrors.fecha_nacimiento}
                max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
              />
              <span className="create-pet-form__hint">Opcional</span>
            </div>

            {/* Microchip */}
            <div className="create-pet-form__field">
              <label htmlFor="microchip" className="create-pet-form__label">
                Número de Microchip
              </label>
              <Input
                id="microchip"
                name="microchip"
                type="text"
                value={formData.microchip}
                onChange={handleChange}
                placeholder="Ej: 123456789012345"
                error={fieldErrors.microchip}
                maxLength={60}
              />
              <span className="create-pet-form__hint">Opcional - Debe ser único</span>
            </div>

            {/* Botones de acción */}
            <div className="create-pet-form__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrar Mascota'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Información adicional */}
        <Card className="create-pet-page__info">
          <h3 className="create-pet-page__info-title">📋 Información Importante</h3>
          <ul className="create-pet-page__info-list">
            <li>Al registrar la mascota, se creará automáticamente su historia clínica.</li>
            <li>El microchip debe ser único en el sistema si lo proporcionas.</li>
            <li>No puedes registrar dos mascotas con el mismo nombre y especie para el mismo propietario.</li>
            <li>La fecha de nacimiento ayuda a calcular la edad de la mascota automáticamente.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default CreatePetPage