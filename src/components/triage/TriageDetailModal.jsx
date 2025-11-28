import PriorityBadge from './PriorityBadge'
import Button from '@/components/ui/Button'
import {
  TRIAGE_GENERAL_STATE_LABELS,
  TRIAGE_DOLOR_LABELS
} from '@/utils/triageConstants'
import './TriageDetailModal.css'

/**
 * Componente TriageDetailModal
 * Modal para ver detalles completos de un triage
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Object} triage - Datos del triage
 */
function TriageDetailModal({ isOpen, onClose, triage }) {
  if (!isOpen || !triage) return null

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-CO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="triage-detail-overlay" onClick={onClose}>
      <div className="triage-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="triage-detail__header">
          <h2 className="triage-detail__title">
            📋 Detalles del Triage
          </h2>
          <button
            className="triage-detail__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Prioridad destacada */}
        <div className="triage-detail__priority-section">
          <span className="triage-detail__priority-label">Prioridad Asignada:</span>
          <PriorityBadge priority={triage.prioridad} size="large" />
        </div>

        {/* Información del Paciente */}
        <div className="triage-detail__section">
          <h3 className="triage-detail__section-title">🐾 Información del Paciente</h3>
          <div className="triage-detail__info-grid">
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Mascota:</span>
              <span className="triage-detail__value">
                {triage.mascota?.nombre || 'No disponible'}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Especie:</span>
              <span className="triage-detail__value">
                {triage.mascota?.especie || 'No disponible'}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Raza:</span>
              <span className="triage-detail__value">
                {triage.mascota?.raza || 'No disponible'}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Edad:</span>
              <span className="triage-detail__value">
                {triage.mascota?.edad ? `${triage.mascota.edad} años` : 'No disponible'}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Propietario:</span>
              <span className="triage-detail__value">
                {triage.mascota?.propietario?.nombre || 'No disponible'}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Teléfono:</span>
              <span className="triage-detail__value">
                {triage.mascota?.propietario?.telefono || 'No disponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Signos Vitales */}
        <div className="triage-detail__section">
          <h3 className="triage-detail__section-title">🩺 Signos Vitales</h3>
          <div className="triage-detail__vitals">
            <div className="triage-detail__vital-card">
              <div className="triage-detail__vital-icon">💓</div>
              <div className="triage-detail__vital-content">
                <div className="triage-detail__vital-label">Frecuencia Cardíaca</div>
                <div className="triage-detail__vital-value">{triage.fc} lpm</div>
              </div>
            </div>

            <div className="triage-detail__vital-card">
              <div className="triage-detail__vital-icon">🫁</div>
              <div className="triage-detail__vital-content">
                <div className="triage-detail__vital-label">Frecuencia Respiratoria</div>
                <div className="triage-detail__vital-value">{triage.fr} rpm</div>
              </div>
            </div>

            <div className="triage-detail__vital-card">
              <div className="triage-detail__vital-icon">🌡️</div>
              <div className="triage-detail__vital-content">
                <div className="triage-detail__vital-label">Temperatura</div>
                <div className="triage-detail__vital-value">{triage.temperatura}°C</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado y Síntomas */}
        <div className="triage-detail__section">
          <h3 className="triage-detail__section-title">⚕️ Evaluación Clínica</h3>
          <div className="triage-detail__info-grid">
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Estado General:</span>
              <span className={`triage-detail__badge triage-detail__badge--${triage.estado_general}`}>
                {TRIAGE_GENERAL_STATE_LABELS[triage.estado_general] || triage.estado_general}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Nivel de Dolor:</span>
              <span className="triage-detail__value">
                {TRIAGE_DOLOR_LABELS[triage.dolor] || triage.dolor}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Sangrado:</span>
              <span className={`triage-detail__value ${triage.sangrado === 'Si' ? 'triage-detail__value--alert' : ''}`}>
                {triage.sangrado}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Shock:</span>
              <span className={`triage-detail__value ${triage.shock === 'Si' ? 'triage-detail__value--alert' : ''}`}>
                {triage.shock}
              </span>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {triage.observaciones && (
          <div className="triage-detail__section">
            <h3 className="triage-detail__section-title">📝 Observaciones</h3>
            <p className="triage-detail__observations">
              {triage.observaciones}
            </p>
          </div>
        )}

        {/* Información del Registro */}
        <div className="triage-detail__section">
          <h3 className="triage-detail__section-title">ℹ️ Información del Registro</h3>
          <div className="triage-detail__info-grid">
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Registrado por:</span>
              <span className="triage-detail__value">
                {triage.usuario?.nombre || 'No disponible'}
              </span>
            </div>
            <div className="triage-detail__info-item">
              <span className="triage-detail__label">Fecha y Hora:</span>
              <span className="triage-detail__value">
                {formatDate(triage.fecha_creacion)}
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Cerrar */}
        <div className="triage-detail__actions">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TriageDetailModal