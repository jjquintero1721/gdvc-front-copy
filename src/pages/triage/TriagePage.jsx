import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import triageService from '@/services/triageService'
import TriageCard from '@/components/triage/TriageCard'
import PriorityBadge from '@/components/triage/PriorityBadge'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import TriageDetailModal from '@/components/triage/TriageDetailModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import {
  TRIAGE_PRIORITY,
  TRIAGE_PRIORITY_LABELS
} from '@/utils/triageConstants'
import './TriagePage.css'

/**
 * Página de Triage - Cola de Urgencias
 * RF-08 | Gestión de Triage
 *
 * VERSIÓN CORREGIDA:
 * - Usa GET /api/v1/triage/ en lugar de /urgencias
 * - Muestra TODOS los triages, no solo urgentes
 * - Ordena por prioridad manualmente en el frontend
 *
 * Funcionalidades:
 * - Ver todos los triages ordenados por prioridad
 * - Filtrar por prioridad
 * - Ver detalles de cada triage
 * - Eliminar triages
 * - Actualización manual
 */
function TriagePage() {
  const { user } = useAuthStore()

  // Estados de datos
  const [triages, setTriages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Estados de filtros
  const [filterPriority, setFilterPriority] = useState('all')

  // Estados de modales
  const [selectedTriage, setSelectedTriage] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [triageToDelete, setTriageToDelete] = useState(null)

  // Cargar todos los triages al montar
  useEffect(() => {
    loadAllTriages()
  }, [])

  /**
   * Cargar TODOS los triages (corregido)
   * Usa GET /api/v1/triage/ en lugar de /urgencias
   */
  const loadAllTriages = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🩺 Cargando TODOS los triages...')

      // ✅ CAMBIO: Usar getAllTriages en lugar de getColaUrgencias
      const response = await triageService.getAllTriages({
        skip: 0,
        limit: 100
      })

      console.log('✅ Triages obtenidos:', response)

      // Extraer triages del response
      let triagesData = []

      if (response.data) {
        // Si viene en response.data
        triagesData = Array.isArray(response.data) ? response.data : []
      } else if (Array.isArray(response)) {
        // Si viene directo como array
        triagesData = response
      }

      console.log('📊 Total de triages:', triagesData.length)

      // ✅ ORDENAR POR PRIORIDAD
      const triagesOrdenados = ordenarPorPrioridad(triagesData)

      setTriages(triagesOrdenados)
    } catch (err) {
      console.error('❌ Error al cargar triages:', err)
      setError(err.message || 'Error al cargar los triages')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Ordenar triages por prioridad
   * Orden: URGENTE > ALTA > MEDIA > BAJA
   */
  const ordenarPorPrioridad = (triagesArray) => {
    const ordenPrioridad = {
      [TRIAGE_PRIORITY.URGENTE]: 1,
      [TRIAGE_PRIORITY.ALTA]: 2,
      [TRIAGE_PRIORITY.MEDIA]: 3,
      [TRIAGE_PRIORITY.BAJA]: 4
    }

    return [...triagesArray].sort((a, b) => {
      const prioridadA = ordenPrioridad[a.prioridad] || 999
      const prioridadB = ordenPrioridad[b.prioridad] || 999
      return prioridadA - prioridadB
    })
  }

  /**
   * Filtrar triages por prioridad
   */
  const filteredTriages = triages.filter(triage => {
    if (filterPriority === 'all') return true
    return triage.prioridad === filterPriority
  })

  /**
   * Ver detalles de un triage
   */
  const handleViewDetails = (triage) => {
    setSelectedTriage(triage)
    setShowDetailModal(true)
  }

  /**
   * Confirmar eliminación
   */
  const handleDeleteClick = (triage) => {
    setTriageToDelete(triage)
    setShowDeleteConfirm(true)
  }

  /**
   * Eliminar triage
   */
  const handleDeleteConfirm = async () => {
    if (!triageToDelete) return

    try {
      console.log(`🗑️ Eliminando triage ${triageToDelete.id}`)

      await triageService.deleteTriage(triageToDelete.id)

      console.log('✅ Triage eliminado exitosamente')

      setSuccess('Triage eliminado exitosamente')
      setShowDeleteConfirm(false)
      setTriageToDelete(null)

      // Recargar triages
      loadAllTriages()

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      console.error('❌ Error al eliminar triage:', err)
      setError(err.message || 'Error al eliminar el triage')
      setShowDeleteConfirm(false)
    }
  }

  /**
   * Contar triages por prioridad
   */
  const priorityCounts = {
    urgente: triages.filter(t => t.prioridad === TRIAGE_PRIORITY.URGENTE).length,
    alta: triages.filter(t => t.prioridad === TRIAGE_PRIORITY.ALTA).length,
    media: triages.filter(t => t.prioridad === TRIAGE_PRIORITY.MEDIA).length,
    baja: triages.filter(t => t.prioridad === TRIAGE_PRIORITY.BAJA).length
  }

  return (
    <div className="triage-page">
      {/* Header */}
      <div className="triage-page__header">
        <div>
          <h1 className="triage-page__title">
            🚨 Cola de Urgencias
          </h1>
          <p className="triage-page__subtitle">
            Gestión de triages y priorización de pacientes
          </p>
        </div>

        <Button
          variant="primary"
          onClick={loadAllTriages}
          disabled={loading}
        >
          {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Estadísticas */}
      <div className="triage-page__stats">
        <div className="triage-stat triage-stat--urgente">
          <div className="triage-stat__icon">🚨</div>
          <div className="triage-stat__content">
            <div className="triage-stat__value">{priorityCounts.urgente}</div>
            <div className="triage-stat__label">Urgentes</div>
          </div>
        </div>

        <div className="triage-stat triage-stat--alta">
          <div className="triage-stat__icon">⚠️</div>
          <div className="triage-stat__content">
            <div className="triage-stat__value">{priorityCounts.alta}</div>
            <div className="triage-stat__label">Alta Prioridad</div>
          </div>
        </div>

        <div className="triage-stat triage-stat--media">
          <div className="triage-stat__icon">⚡</div>
          <div className="triage-stat__content">
            <div className="triage-stat__value">{priorityCounts.media}</div>
            <div className="triage-stat__label">Media Prioridad</div>
          </div>
        </div>

        <div className="triage-stat triage-stat--baja">
          <div className="triage-stat__icon">✅</div>
          <div className="triage-stat__content">
            <div className="triage-stat__value">{priorityCounts.baja}</div>
            <div className="triage-stat__label">Baja Prioridad</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="triage-page__filters">
        <button
          className={`triage-filter-button ${filterPriority === 'all' ? 'active' : ''}`}
          onClick={() => setFilterPriority('all')}
        >
          Todos ({triages.length})
        </button>

        {Object.entries(TRIAGE_PRIORITY).map(([key, value]) => (
          <button
            key={value}
            className={`triage-filter-button ${filterPriority === value ? 'active' : ''}`}
            onClick={() => setFilterPriority(value)}
          >
            <PriorityBadge priority={value} size="small" showIcon={false} />
            ({priorityCounts[value]})
          </button>
        ))}
      </div>

      {/* Lista de Triages */}
      <div className="triage-page__content">
        {loading ? (
          <div className="triage-page__loading">
            <div className="spinner"></div>
            <p>Cargando triages...</p>
          </div>
        ) : filteredTriages.length === 0 ? (
          <div className="triage-page__empty">
            <div className="triage-page__empty-icon">📋</div>
            <h3 className="triage-page__empty-title">
              {filterPriority === 'all'
                ? 'No hay triages registrados'
                : `No hay triages con prioridad ${TRIAGE_PRIORITY_LABELS[filterPriority]}`
              }
            </h3>
            <p className="triage-page__empty-text">
              Los triages aparecerán aquí cuando se registren desde las citas.
            </p>
          </div>
        ) : (
          <div className="triage-page__grid">
            {filteredTriages.map(triage => (
              <TriageCard
                key={triage.id}
                triage={triage}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetailModal && selectedTriage && (
        <TriageDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedTriage(null)
          }}
          triage={selectedTriage}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && triageToDelete && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Eliminar Triage"
          message={`¿Estás seguro de que deseas eliminar este triage? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteConfirm(false)
            setTriageToDelete(null)
          }}
          variant="danger"
        />
      )}
    </div>
  )
}

export default TriagePage