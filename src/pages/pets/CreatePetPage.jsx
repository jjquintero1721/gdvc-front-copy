import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/AuthStore.jsx'
import petService from '@/services/petService'
import userService from '@/services/userService'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import '@pages/pets/CreatePetPage.css'
import {useToastContext} from "@components/ui/ToastProvider.jsx";

function CreatePetPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const toast = useToastContext()

  const isStaff = ['superadmin', 'veterinario', 'auxiliar'].includes(currentUser?.rol)

  const [formData, setFormData] = useState({
    propietario_id: isStaff ? '' : (currentUser?.propietario_id || ''),
    nombre: '',
    especie: '',
    raza: '',
    microchip: '',
    fecha_nacimiento: '',
    color: '',
    sexo: '',
    peso: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [owners, setOwners] = useState([])
  const [loadingOwners, setLoadingOwners] = useState(isStaff)

  useEffect(() => {
    if (isStaff) loadOwners()
  }, [isStaff])

  const loadOwners = async () => {
    try {
      setLoadingOwners(true)
      const response = await userService.getAllUsers({
        skip: 0,
        limit: 100,
        rol: 'propietario'
      })
      if (response.success) {
        const ownersList = response.data.usuarios || []
        const mapped = ownersList
          .filter(u => u.propietario_id)
          .map(u => ({
            id: u.propietario_id,
            nombre: u.nombre,
            correo: u.correo
          }))
        setOwners(mapped)
      }
    } catch (err) {
      toast("error",'Error al cargar propietarios')
    } finally {
      setLoadingOwners(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: null }))
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.propietario_id) errors.propietario_id = 'Debes seleccionar un propietario'
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio'
    if (!formData.especie.trim()) errors.especie = 'La especie es obligatoria'
    if (!formData.sexo.trim()) errors.sexo = 'El sexo es obligatorio'
    if (!formData.fecha_nacimiento) errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'

    // Validar que el peso sea positivo si se proporciona
    if (formData.peso && parseFloat(formData.peso) <= 0) {
      errors.peso = 'El peso debe ser mayor a 0 kg'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 🔧 FUNCIÓN MEJORADA PARA CONVERTIR ERRORES A STRING
  const formatErrorMessage = (err) => {
    // Si ya es un string, devolverlo directamente
    if (typeof err === 'string') return err

    // Si es un objeto Error de JavaScript (ya procesado por petService)
    if (err instanceof Error) return err.message

    // Si es un objeto con propiedad 'message'
    if (err && typeof err === 'object' && err.message) {
      return typeof err.message === 'string' ? err.message : 'Error al procesar la solicitud'
    }

    // Fallback
    return 'Error inesperado al registrar mascota'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast("error",'Corrige los errores del formulario')
      return
    }

    try {
      setLoading(true)
      setError(null) // Limpiar errores previos

      const petData = {
        propietario_id: formData.propietario_id,
        nombre: formData.nombre.trim(),
        especie: formData.especie.trim().toLowerCase(),
        raza: formData.raza?.trim() || null,
        microchip: formData.microchip?.trim() || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        color: formData.color?.trim() || null,
        sexo: formData.sexo,
        peso: formData.peso ? parseFloat(formData.peso) : null
      }

      const response = await petService.createPet(petData)

      if (response.success) {
        toast("success", "Mascota registrada exitosamente");

        navigate("/mascotas");
      } else {
        // El backend respondió pero con success: false
        toast("error",'Error al registrar la mascota')
      }
    } catch (err) {
      // 🔧 SIMPLIFICADO: petService ya maneja los errores y devuelve Error con mensaje legible
      console.error('Error al registrar mascota:', err)
      setError(formatErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-pet-page beautiful-fade">
      <div className="create-pet-wrapper">

        <div className="left-section">

          <div className="page-header animated-slide">
            <h1>🐾 Registrar Nueva Mascota</h1>
            <p>Completa la información de la mascota. Los campos con * son obligatorios.</p>
          </div>

          {error && (
            <Alert type="error" onClose={() => setError(null)} className="alert">
              {error}
            </Alert>
          )}

          <Card className="pet-card animated-scale">
            <form onSubmit={handleSubmit} className="pet-form-grid">

              {isStaff && (
                <div className="form-group">
                  <label>Propietario *</label>
                  <select
                    name="propietario_id"
                    value={formData.propietario_id}
                    onChange={handleChange}
                    disabled={loadingOwners}
                    className={fieldErrors.propietario_id ? "input-error" : ""}
                  >
                    <option value="">
                      {loadingOwners ? "Cargando..." : "Selecciona un propietario"}
                    </option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.nombre} - {o.correo}</option>
                    ))}
                  </select>
                  {fieldErrors.propietario_id &&
                    <span className="error-text">{fieldErrors.propietario_id}</span>}
                </div>
              )}

              <div className="form-group">
                <label>Nombre *</label>
                <Input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Max, Luna, Michi"
                  error={fieldErrors.nombre}
                />
              </div>

              <div className="form-group">
                <label>Especie *</label>
                <select
                  name="especie"
                  value={formData.especie}
                  onChange={handleChange}
                  className={fieldErrors.especie ? "input-error" : ""}
                >
                  <option value="">Selecciona una especie</option>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                </select>
                {fieldErrors.especie &&
                  <span className="error-text">{fieldErrors.especie}</span>}
              </div>

              <div className="form-group">
                <label>Raza</label>
                <Input
                  name="raza"
                  value={formData.raza}
                  onChange={handleChange}
                  placeholder="Golden Retriever, Siamés…"
                />
              </div>

              {/* NUEVOS CAMPOS */}
              <div className="form-group">
                <label>Color</label>
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Blanco, negro, café..."
                />
              </div>

              <div className="form-group">
                <label>Sexo *</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className={fieldErrors.sexo ? "input-error" : ""}
                >
                  <option value="">Selecciona sexo</option>
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                </select>
                {fieldErrors.sexo &&
                  <span className="error-text">{fieldErrors.sexo}</span>}
              </div>

              <div className="form-group">
                <label>Peso (kg)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  placeholder="Ej: 12.5"
                  error={fieldErrors.peso}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento *</label>
                <Input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  error={fieldErrors.fecha_nacimiento}
                />
              </div>

              <div className="form-group">
                <label>Microchip</label>
                <Input
                  name="microchip"
                  value={formData.microchip}
                  onChange={handleChange}
                  placeholder="123456789012345"
                />
              </div>

              <div className="form-actions">
                <Button type="button" variant="secondary" className="styled-btn" onClick={() => navigate(-1)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="styled-btn blue-btn" disabled={loading}>
                  {loading ? "Registrando..." : "Registrar Mascota"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="pet-side-info">
          <div className="emoji">🐶</div>
          <h3>¡Dato Curioso!</h3>
          <p>
            Registrar a tu mascota permite crear su historia clínica
            y llevar un control veterinario más completo 💙
          </p>
        </div>

      </div>
    </div>
  )
}

export default CreatePetPage