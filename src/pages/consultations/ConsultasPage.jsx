import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Search, Filter, Calendar, AlertCircle } from 'lucide-react'
import appointmentService from '@/services/appointmentService'
import ConsultationCard from '@/components/consultations/ConsultationCard'
import ConsultationFormModal from '@/components/consultations/ConsultationFormModal'
import AppointmentDetailModal from '@/components/calender/AppointmentDetailModal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import './ConsultasPage.css'

/**
 * ConsultasPage - Página de gestión de consultas
 *
 * RF-07: Gestión de historias clínicas
 * RF-11: Seguimiento de pacientes
 *
 * Permisos:
 * - VETERINARIO: Ver todas las citas confirmadas + crear consultas
 * - SUPERADMIN: Ver todas las citas confirmadas + crear consultas
 *
 * Funcionalidades:
 * - Listar citas en estado CONFIRMADA
 * - Filtrar citas por fecha, paciente, veterinario
 * - Iniciar consulta (cambia estado a EN_PROCESO)
 * - Crear/editar consulta
 * - Ver historial de versiones (Memento Pattern)
 * - Revertir cambios
 * - Programar seguimientos
 * - Completar consulta (marca cita como COMPLETADA)
 */
function ConsultasPage() {
  const { user: currentUser } = useAuthStore()

  // Estados de datos
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterVeterinarian, setFilterVeterinarian] = useState('all')

  // Estados de modales
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [existingConsultation, setExistingConsultation] = useState(null)

  // Verificar permisos
  const canManageConsultations = ['superadmin', 'veterinario'].includes(currentUser?.rol)

  // Cargar citas confirmadas
  useEffect(() => {
    if (canManageConsultations) {
      loadConfirmedAppointments()
    }
  }, [canManageConsultations])

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    applyFilters()
  }, [appointments, searchTerm, filterDate, filterVeterinarian])

  /**
   * Carga todas las citas en estado CONFIRMADA o EN_PROCESO
   */
  const loadConfirmedAppointments = async () => {
    setLoading(true)
    setError(null)

    try {
      // Obtener todas las citas
      const response = await appointmentService.getAllAppointments()
      const allAppointments = response.appointment || response.data || []

      // Filtrar solo CONFIRMADAS y EN_PROCESO
      const confirmedAppointments = allAppointments.filter(
        apt => apt.estado === 'CONFIRMADA' || apt.estado === 'EN_PROCESO'
      )

      setAppointments(confirmedAppointments)
    } catch (err) {
      setError(err.message || 'Error al cargar las citas confirmadas')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Aplica filtros de búsqueda y fecha
   */
  const applyFilters = () => {
    let filtered = [...appointments]

    // Filtro por búsqueda (nombre del paciente o propietario)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.pets?.nombre?.toLowerCase().includes(search) ||
        apt.pets?.propietario?.nombre?.toLowerCase().includes(search)
      )
    }

    // Filtro por fecha
    if (filterDate) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.fecha_hora).toISOString().split('T')[0]
        return aptDate === filterDate
      })
    }

    // Filtro por veterinario
    if (filterVeterinarian !== 'all') {
      filtered = filtered.filter(apt =>
        apt.veterinario_id === filterVeterinarian
      )
    }

    setFilteredAppointments(filtered)
  }

  /**
   * Inicia una consulta (cambia estado de cita a EN_PROCESO)
   */
  const handleStartConsultation = async (appointment) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Cambiar estado de la cita a EN_PROCESO
      await appointmentService.startAppointment(appointment.id)

      setSuccess('Consulta iniciada correctamente')
      setSelectedAppointment(appointment)
      setExistingConsultation(null)
      setIsConsultationModalOpen(true)

      // Recargar citas
      await loadConfirmedAppointments()
    } catch (err) {
      setError(err.message || 'Error al iniciar la consulta')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Abre modal de detalles de cita
   */
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailModalOpen(true)
  }

  /**
   * Callback después de guardar consulta
   */
  const handleConsultationSaved = async () => {
    await loadConfirmedAppointments()
  }

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterDate('')
    setFilterVeterinarian('all')
  }

  // Si no tiene permisos
  if (!canManageConsultations) {
    return (
      <div className="consultas-page">
        <Alert variant="error">
          No tienes permisos para acceder a esta página.
          Solo veterinarios y superadmin pueden gestionar consultas.
        </Alert>
      </div>
    )
  }

  return (
    <div className="consultas-page">
      {/* Header */}
      <motion.div
        className="consultas-page__header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="consultas-page__header-content">
          <h1 className="consultas-page__title">Consultas Veterinarias</h1>
          <p className="consultas-page__subtitle">
            Gestiona las consultas de pacientes. Solo se muestran citas confirmadas listas para atención.
          </p>
        </div>
      </motion.div>

      {/* Mensajes */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros y búsqueda */}
      <motion.div
        className="consultas-page__filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="consultas-page__filters-row">
          <div className="consultas-page__search">
            <Search size={20} />
            <Input
              type="text"
              placeholder="Buscar por nombre del paciente o propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="consultas-page__search-input"
            />
          </div>

          <div className="consultas-page__date-filter">
            <Calendar size={20} />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="consultas-page__date-input"
            />
          </div>

          <Button
            variant="secondary"
            onClick={handleClearFilters}
            disabled={!searchTerm && !filterDate && filterVeterinarian === 'all'}
          >
            <Filter size={18} />
            Limpiar Filtros
          </Button>
        </div>

        <div className="consultas-page__stats">
          <div className="consultas-page__stat">
            <span className="consultas-page__stat-value">
              {filteredAppointments.length}
            </span>
            <span className="consultas-page__stat-label">
              Citas Confirmadas
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid de citas */}
      <motion.div
        className="consultas-page__content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <div className="consultas-page__loading">
            <div className="spinner"></div>
            <p>Cargando citas confirmadas...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <motion.div
            className="consultas-page__empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={64} className="consultas-page__empty-icon" />
            <h3 className="consultas-page__empty-title">
              No hay citas confirmadas
            </h3>
            <p className="consultas-page__empty-text">
              Cuando haya citas confirmadas, aparecerán aquí para que puedas iniciar las consultas.
            </p>
          </motion.div>
        ) : (
          <div className="consultas-page__grid">
            <AnimatePresence>
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ConsultationCard
                    appointment={appointment}
                    onStartConsultation={handleStartConsultation}
                    onViewDetails={handleViewDetails}
                    isLoading={loading}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Modales */}
      <ConsultationFormModal
        isOpen={isConsultationModalOpen}
        onClose={() => {
          setIsConsultationModalOpen(false)
          setSelectedAppointment(null)
          setExistingConsultation(null)
        }}
        appointment={selectedAppointment}
        existingConsultation={existingConsultation}
        onSave={handleConsultationSaved}
      />

      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        canEdit={false}
      />
    </div>
  )
}

export default ConsultasPage