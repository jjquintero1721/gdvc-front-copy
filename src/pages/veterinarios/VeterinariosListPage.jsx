import React, { useState, useEffect } from 'react'
import { Search, UserPlus, AlertCircle, Loader } from 'lucide-react'
import { useAuthStore } from '@store/AuthStore.jsx'
import veterinarioService from '../../services/veterinarioService'
import VeterinarioCard from '../../components/veterinarios/VeterinarioCard'
import CreateVeterinarioModal from '../../components/veterinarios/CreateVeterinarioModal'
import EditVeterinarioModal from '../../components/veterinarios/EditVeterinarioModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import Toast from '../../components/common/Toast'
import './VeterinariosListPage.css'

/**
 * VeterinariosListPage Component
 * Página principal para gestionar veterinarios del sistema
 *
 * Permisos:
 * - SUPERADMIN: puede crear, editar, activar/desactivar cualquier veterinario
 * - VETERINARIO: puede ver todos y editar solo su propio perfil
 * - AUXILIAR: puede ver todos los veterinarios (solo lectura)
 */
const VeterinariosListPage = () => {
  // Estados
  const { user } = useAuthStore()
  const [veterinarios, setVeterinarios] = useState([])
  const [filteredVeterinarios, setFilteredVeterinarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedVeterinario, setSelectedVeterinario] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado de toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Verificar permisos del usuario
  const isSuperAdmin = user?.rol === 'superadmin'
  const isVeterinario = user?.rol === 'veterinario'
  const canCreate = isSuperAdmin
  const canToggleStatus = isSuperAdmin

  // Cargar veterinarios al montar el componente
  useEffect(() => {
    loadVeterinarios()
  }, [])

  // Filtrar veterinarios cuando cambia el término de búsqueda o el filtro
  useEffect(() => {
    filterVeterinarios()
  }, [searchTerm, filterStatus, veterinarios])

  // Función para cargar veterinarios
  const loadVeterinarios = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await veterinarioService.getAllVeterinarios()

      if (response.success && response.data) {
        setVeterinarios(response.data.usuarios || [])
      } else {
        setVeterinarios([])
      }
    } catch (err) {
      console.error('Error al cargar veterinarios:', err)
      setError(err.message || 'Error al cargar los veterinarios')
      setVeterinarios([])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para filtrar veterinarios
  const filterVeterinarios = () => {
    let filtered = [...veterinarios]

    // Filtrar por estado
    if (filterStatus === 'active') {
      filtered = filtered.filter(vet => vet.activo === true)
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(vet => vet.activo === false)
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(vet =>
        vet.nombre.toLowerCase().includes(term) ||
        vet.correo.toLowerCase().includes(term) ||
        (vet.telefono && vet.telefono.toLowerCase().includes(term))
      )
    }

    setFilteredVeterinarios(filtered)
  }

  // Función para crear veterinario
  const handleCreateVeterinario = async (veterinarioData) => {
    try {
      setIsSubmitting(true)

      const response = await veterinarioService.createVeterinario(veterinarioData)

      if (response.success) {
        showToast('Veterinario registrado exitosamente', 'success')
        setShowCreateModal(false)
        await loadVeterinarios()
      }
    } catch (err) {
      console.error('Error al crear veterinario:', err)
      showToast(err.message || 'Error al registrar el veterinario', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para editar veterinario
  const handleEditVeterinario = async (veterinarioId, updatedData) => {
    try {
      setIsSubmitting(true)

      const response = await veterinarioService.updateVeterinario(veterinarioId, updatedData)

      if (response.success) {
        showToast('Veterinario actualizado exitosamente', 'success')
        setShowEditModal(false)
        setSelectedVeterinario(null)
        await loadVeterinarios()
      }
    } catch (err) {
      console.error('Error al actualizar veterinario:', err)
      showToast(err.message || 'Error al actualizar el veterinario', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ➤ FUNCIÓN PARA CREAR AUXILIAR
  const handleCreateAuxiliar = async (veterinarioId, auxiliarData) => {
    try {
      const response = await veterinarioService.createAuxiliar(veterinarioId, auxiliarData)

      if (!response.success) throw new Error(response.message)

      showToast('Auxiliar creado correctamente', 'success')
      return true
    } catch (err) {
      throw new Error(err.message || 'Error al crear el auxiliar')
    }
  }

  // ➤ FUNCIÓN PARA OBTENER AUXILIARES
  const handleFetchAuxiliares = async (veterinarioId) => {
    try {
      const res = await veterinarioService.getAuxiliaresByVeterinario(veterinarioId)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // Función para cambiar estado del veterinario
  const handleToggleStatus = async () => {
    if (!selectedVeterinario) return

    try {
      setIsSubmitting(true)

      let response
      if (selectedVeterinario.activo) {
        response = await veterinarioService.deactivateVeterinario(selectedVeterinario.id)
      } else {
        response = await veterinarioService.activateVeterinario(selectedVeterinario.id)
      }

      if (response.success) {
        const action = selectedVeterinario.activo ? 'desactivado' : 'activado'
        showToast(`Veterinario ${action} exitosamente`, 'success')
        setShowConfirmModal(false)
        setSelectedVeterinario(null)
        await loadVeterinarios()
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      showToast(err.message || 'Error al cambiar el estado del veterinario', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para abrir modal de edición
  const openEditModal = (veterinario) => {
    setSelectedVeterinario(veterinario)
    setShowEditModal(true)
  }

  // Función para abrir modal de confirmación
  const openConfirmModal = (veterinario) => {
    setSelectedVeterinario(veterinario)
    setShowConfirmModal(true)
  }

  // Verificar si el usuario puede editar este veterinario
  const canEdit = (veterinario) => {
    // Superadmin puede editar cualquiera
    if (isSuperAdmin) return true

    // Veterinario solo puede editar su propio perfil
    if (isVeterinario && user?.id === veterinario.id) return true

    return false
  }

  // Mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 5000)
  }

  // Renderizado condicional: Loading
  if (isLoading) {
    return (
      <div className="veterinarios-page">
        <div className="loading-container">
          <Loader className="spinner" size={48} />
          <p>Cargando veterinarios...</p>
        </div>
      </div>
    )
  }

  // Renderizado condicional: Error
  if (error) {
    return (
      <div className="veterinarios-page">
        <div className="error-container">
          <AlertCircle size={48} color="#ef4444" />
          <h3>Error al cargar veterinarios</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={loadVeterinarios}>
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="veterinarios-page">
      {/* Header */}
      <div className="veterinarios-header">
        <div className="veterinarios-header__info">
          <h1>Gestión de Veterinarios</h1>
          <p className="veterinarios-count">
            {filteredVeterinarios.length} {filteredVeterinarios.length === 1 ? 'veterinario registrado' : 'veterinarios registrados'} en el sistema
          </p>
        </div>

        {canCreate && (
          <button
            className="btn btn--primary"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus size={20} />
            <span>Registrar Veterinario</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="veterinarios-filters">
        {/* Barra de búsqueda */}
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro de estado */}
        <div className="filter-group">
          <label>Estado:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Lista de veterinarios */}
      {filteredVeterinarios.length === 0 ? (
        <div className="empty-state">
          <UserPlus size={64} color="#9ca3af" />
          <h3>No se encontraron veterinarios</h3>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : canCreate
              ? 'Comienza registrando tu primer veterinario'
              : 'No hay veterinarios registrados en el sistema'}
          </p>
          {canCreate && !searchTerm && filterStatus === 'all' && (
            <button
              className="btn btn--primary"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlus size={20} />
              <span>Registrar Veterinario</span>
            </button>
          )}
        </div>
      ) : (
        <div className="veterinarios-grid">
          {filteredVeterinarios.map((veterinario) => (
            <VeterinarioCard
              key={veterinario.id}
              veterinario={veterinario}
              onEdit={openEditModal}
              onToggleStatus={openConfirmModal}
              canEdit={canEdit(veterinario)}
              canToggleStatus={canToggleStatus}
              canManageAuxiliares={user.rol === 'veterinario' || user.rol === 'admin'}
              onCreateAuxiliar={handleCreateAuxiliar}
              onViewAuxiliares={handleFetchAuxiliares}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <CreateVeterinarioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateVeterinario}
        isLoading={isSubmitting}
      />

      <EditVeterinarioModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedVeterinario(null)
        }}
        onSubmit={handleEditVeterinario}
        veterinario={selectedVeterinario}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedVeterinario(null)
        }}
        onConfirm={handleToggleStatus}
        title={selectedVeterinario?.activo ? '¿Desactivar veterinario?' : '¿Activar veterinario?'}
        message={
          selectedVeterinario?.activo
            ? `El veterinario ${selectedVeterinario?.nombre} no podrá acceder al sistema hasta que sea reactivado.`
            : `El veterinario ${selectedVeterinario?.nombre} podrá acceder nuevamente al sistema.`
        }
        confirmText={selectedVeterinario?.activo ? 'Desactivar' : 'Activar'}
        confirmVariant={selectedVeterinario?.activo ? 'danger' : 'success'}
        isLoading={isSubmitting}
      />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  )
}

export default VeterinariosListPage