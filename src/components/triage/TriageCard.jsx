import { useState } from 'react'
import PriorityBadge from './PriorityBadge'
import Button from '@/components/ui/Button'
import { TRIAGE_GENERAL_STATE_LABELS } from '@/utils/triageConstants'
import './TriageCard.css'

/**
 * Componente TriageCard
 * Tarjeta que muestra información resumida de un triage
 *
 * @param {Object} triage - Datos del triage
 * @param {Function} onViewDetails - Callback para ver detalles
 * @param {Function} onEdit - Callback para editar (opcional)
 * @param {Function} onDelete - Callback para eliminar (opcional)
 */
function TriageCard({ triage, onViewDetails, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false)

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div
      className="triage-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header con prioridad */}
      <div className="triage-card__header">
        <PriorityBadge priority={triage.prioridad} size="medium" />
        <span className="triage-card__date caption">
          {formatDate(triage.fecha_creacion)}
        </span>
      </div>

      {/* Información del paciente */}
      <div className="triage-card__patient">
        <div className="triage-card__patient-name">
          <span className="triage-card__label">Mascota:</span>
          <span className="triage-card__value body-l">
            {triage.mascota?.nombre || 'No disponible'}
          </span>
        </div>
        <div className="triage-card__patient-owner">
          <span className="triage-card__label">Propietario:</span>
          <span className="triage-card__value caption">
            {triage.mascota?.propietario?.nombre || 'No disponible'}
          </span>
        </div>
      </div>

      {/* Signos vitales */}
      <div className="triage-card__vitals">
        <div className="triage-card__vital">
          <span className="triage-card__vital-icon">💓</span>
          <span className="triage-card__vital-label">FC:</span>
          <span className="triage-card__vital-value">{triage.fc} lpm</span>
        </div>
        <div className="triage-card__vital">
          <span className="triage-card__vital-icon">🫁</span>
          <span className="triage-card__vital-label">FR:</span>
          <span className="triage-card__vital-value">{triage.fr} rpm</span>
        </div>
        <div className="triage-card__vital">
          <span className="triage-card__vital-icon">🌡️</span>
          <span className="triage-card__vital-label">Temp:</span>
          <span className="triage-card__vital-value">{triage.temperatura}°C</span>
        </div>
      </div>

      {/* Estado general */}
      <div className="triage-card__state">
        <span className="triage-card__label">Estado:</span>
        <span className={`triage-card__state-value triage-card__state-value--${triage.estado_general}`}>
          {TRIAGE_GENERAL_STATE_LABELS[triage.estado_general] || triage.estado_general}
        </span>
      </div>

      {/* Observaciones (resumidas) */}
      {triage.observaciones && (
        <div className="triage-card__observations">
          <span className="triage-card__label">Observaciones:</span>
          <p className="triage-card__observations-text caption">
            {triage.observaciones.length > 100
              ? `${triage.observaciones.substring(0, 100)}...`
              : triage.observaciones
            }
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className={`triage-card__actions ${showActions ? 'triage-card__actions--visible' : ''}`}>
        <Button
          variant="secondary"
          size="small"
          onClick={() => onViewDetails(triage)}
        >
          Ver Detalles
        </Button>
        {onEdit && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => onEdit(triage)}
          >
            Editar
          </Button>
        )}
        {onDelete && (
          <Button
            variant="danger"
            size="small"
            onClick={() => onDelete(triage)}
          >
            Eliminar
          </Button>
        )}
      </div>
    </div>
  )
}

export default TriageCard