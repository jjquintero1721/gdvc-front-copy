import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import serviceService from '@/services/serviceService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ServiceGrid from '@/components/services/ServiceGrid'
import CreateServiceModal from '@/components/services/CreateServiceModal'
import './ServicesPage.css'

/**
 * Página de Gestión de Servicios - Versión Actualizada
 * RF-09 | Gestión de servicios ofrecidos por la clínica
 *
 * Permisos por rol:
 * - SUPERADMIN, VETERINARIO, AUXILIAR: Acceso completo (ver, crear, editar, activar/desactivar)
 * - PROPIETARIO: Sin acceso
 *
 * Funcionalidades:
 * - Listar servicios
 * - Buscar por nombre/descripción
 * - Filtrar por estado (activo/todos)
 * - Crear nuevo servicio
 * - Editar servicio
 * - Activar/Desactivar servicio con modal de confirmación
 */
function ServicesPage() {
  const { user: currentUser } = useAuthStore()

  // Estados de datos
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('active') // active, all

  // Estados del modal de crear/editar
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Estado del modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    confirmText: 'Confirmar',
    onConfirm: null,
    loading: false
  })

  // Verificar permisos
  const canManage = ['superadmin', 'veterinario', 'auxiliar'].includes(currentUser?.rol)

  /**
   * Cargar servicios al montar el componente
   */
  useEffect(() => {
    loadServices()
  }, [filterStatus])

  /**
   * Aplicar filtros de búsqueda
   */
  useEffect(() => {
    applyFilters()
  }, [services, searchTerm])

  /**
   * Cargar servicios desde el backend
   */
  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)

      let response

      if (filterStatus === 'active') {
        response = await serviceService.getActiveServices()
      } else {
        response = await serviceService.getAllServices()
      }

      if (response.success && response.data) {
        const servicesList = response.data.servicios || []
        setServices(servicesList)
        setFilteredServices(servicesList)
      }
    } catch (err) {
      setError(err.message || 'Error al cargar servicios')
      console.error('Error loading services:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Aplicar filtros de búsqueda
   */
  const applyFilters = () => {
    let filtered = [...services]

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(service =>
        service.nombre?.toLowerCase().includes(search) ||
        service.descripcion?.toLowerCase().includes(search)
      )
    }

    setFilteredServices(filtered)
  }

  /**
   * Manejar búsqueda
   */
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  /**
   * Abrir modal para crear servicio
   */
  const handleCreateService = () => {
    setSelectedService(null)
    setModalOpen(true)
  }

  /**
   * Abrir modal para editar servicio
   */
  const handleEditService = (service) => {
    setSelectedService(service)
    setModalOpen(true)
  }

  /**
   * Cerrar modal de crear/editar
   */
  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedService(null)
    setError(null)
  }

  /**
   * Enviar formulario del modal
   */
  const handleSubmitModal = async (formData) => {
    try {
      setModalLoading(true)
      setError(null)

      let response

      if (selectedService) {
        // Editar servicio existente
        response = await serviceService.updateService(selectedService.id, formData)
        setSuccess('Servicio actualizado exitosamente')
      } else {
        // Crear nuevo servicio
        response = await serviceService.createService(formData)
        setSuccess('Servicio registrado exitosamente')
      }

      // Recargar lista
      await loadServices()

      // Cerrar modal
      handleCloseModal()

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar servicio')
      console.error('Error saving service:', err)
    } finally {
      setModalLoading(false)
    }
  }

  /**
   * Mostrar modal de confirmación para activar/desactivar servicio
   */
  const handleToggleServiceStatus = (service) => {
    const isDeactivating = service.activo

    setConfirmModal({
      isOpen: true,
      title: isDeactivating ? '¿Desactivar servicio?' : '¿Activar servicio?',
      message: isDeactivating
        ? `El servicio "${service.nombre}" quedará inactivo y no podrá ser seleccionado para nuevas citas hasta que sea reactivado.`
        : `El servicio "${service.nombre}" será activado y estará disponible para agendar citas.`,
      variant: isDeactivating ? 'danger' : 'success',
      confirmText: isDeactivating ? 'Desactivar' : 'Activar',
      onConfirm: () => executeToggleServiceStatus(service),
      loading: false
    })
  }

  /**
   * Ejecutar la acción de activar/desactivar servicio
   */
  const executeToggleServiceStatus = async (service) => {
    try {
      // Activar estado de carga en el modal
      setConfirmModal(prev => ({ ...prev, loading: true }))

      const response = service.activo
        ? await serviceService.deactivateService(service.id)
        : await serviceService.activateService(service.id)

      if (response.success) {
        setSuccess(`Servicio ${service.activo ? 'desactivado' : 'activado'} exitosamente`)

        // Cerrar modal
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          variant: 'warning',
          onConfirm: null,
          loading: false
        })

        // Recargar servicios
        await loadServices()

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      setError(err.message || 'Error al cambiar el estado del servicio')

      // Cerrar modal incluso si hay error
      setConfirmModal({
        isOpen: false,
        title: '',
        message: '',
        variant: 'warning',
        onConfirm: null,
        loading: false
      })
    }
  }

  /**
   * Cerrar modal de confirmación
   */
  const handleCloseConfirmModal = () => {
    if (!confirmModal.loading) {
      setConfirmModal({
        isOpen: false,
        title: '',
        message: '',
        variant: 'warning',
        onConfirm: null,
        loading: false
      })
    }
  }

  return (
    <div className="services-page">
      {/* Header */}
      <div className="services-page__header">
        <div className="services-page__header-content">
          <h1 className="services-page__title">Gestión de Servicios</h1>
          <p className="services-page__subtitle">
            {filteredServices.length} {filteredServices.length === 1 ? 'servicio registrado' : 'servicios registrados'} en el sistema
          </p>
        </div>
        {canManage && (
          <Button onClick={handleCreateService}>
            + Registrar Servicio
          </Button>
        )}
      </div>

      {/* Mensajes */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <div className="services-page__filters">
        {/* Búsqueda */}
        <div className="services-page__search">
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={handleSearch}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            }
          />
        </div>

        {/* Filtro de estado */}
        <div className="services-page__filter-group">
          <label className="services-page__filter-label">Estado:</label>
          <select
            className="services-page__select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="active">Activos</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {/* Grid de servicios */}
      <ServiceGrid
        services={filteredServices}
        loading={loading}
        onAddService={canManage ? handleCreateService : null}
        onEditService={canManage ? handleEditService : null}
        onToggleStatus={canManage ? handleToggleServiceStatus : null}
        emptyMessage={
          searchTerm
            ? 'No se encontraron servicios que coincidan con tu búsqueda'
            : 'No hay servicios registrados'
        }
      />

      {/* Modal de crear/editar */}
      {canManage && (
        <CreateServiceModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModal}
          service={selectedService}
          loading={modalLoading}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText || 'Confirmar'}
        cancelText="Cancelar"
        loading={confirmModal.loading}
      />
    </div>
  )
}

export default ServicesPage