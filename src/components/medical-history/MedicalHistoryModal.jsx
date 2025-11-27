import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Button from '@/components/ui/Button'
import './MedicalHistoryModal.css'

/**
 * Modal Centrado de Historia Clínica - Diseño Profesional
 *
 * Muestra la historia clínica en formato de documento médico profesional
 * Preparado para exportación a PDF
 *
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Callback para cerrar el modal
 * @param {object} pet - Información de la mascota
 * @param {object} medicalHistory - Historia clínica completa con consultas
 * @param {boolean} loading - Estado de carga
 */
function MedicalHistoryModal({ isOpen, onClose, pet, medicalHistory, loading }) {
  const modalContentRef = useRef(null)

  // Cerrar modal al presionar Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--
    }

    if (years === 0) {
      const months = monthDiff + (today.getDate() < birth.getDate() ? -1 : 0)
      return `${months} ${months === 1 ? 'mes' : 'meses'}`
    }

    return `${years} ${years === 1 ? 'año' : 'años'}`
  }

  const consultas = medicalHistory?.consultas || []
  const edad = pet?.fecha_nacimiento ? calculateAge(pet.fecha_nacimiento) : null

  return (
    <>
      {/* Overlay de fondo oscuro */}
      <div
        className="medical-history-modal-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal centrado */}
      <div className="medical-history-modal">
        <div className="medical-history-modal__container" ref={modalContentRef}>
          {/* Header del documento */}
          <div className="medical-history-modal__header">
            <div className="medical-history-modal__header-content">
              <div className="medical-history-modal__clinic-info">
                <div className="medical-history-modal__logo">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor" opacity="0.2"/>
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v8.22c0 4.28-2.92 8.28-7 9.57-4.08-1.29-7-5.29-7-9.57V7.78l8-3.6z" fill="currentColor"/>
                    <path d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h1 className="medical-history-modal__title">Historia Clínica</h1>
                  <p className="medical-history-modal__clinic-name">Clínica Veterinaria GDCV</p>
                </div>
              </div>
              <button
                className="medical-history-modal__close-btn"
                onClick={onClose}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contenido del documento */}
          <div className="medical-history-modal__content">
            {loading ? (
              <div className="medical-history-modal__loading">
                <div className="medical-history-modal__spinner" />
                <p>Cargando historia clínica...</p>
              </div>
            ) : (
              <>
                {/* Información del Paciente */}
                {pet && (
                  <div className="medical-history-modal__patient-section">
                    <h2 className="medical-history-modal__section-title">
                      Información del Paciente
                    </h2>
                    <div className="medical-history-modal__patient-grid">
                      <div className="medical-history-modal__field-group">
                        <label className="medical-history-modal__field-label">Nombre:</label>
                        <span className="medical-history-modal__field-value">{pet.nombre}</span>
                      </div>
                      <div className="medical-history-modal__field-group">
                        <label className="medical-history-modal__field-label">Especie:</label>
                        <span className="medical-history-modal__field-value">{pet.especie}</span>
                      </div>
                      <div className="medical-history-modal__field-group">
                        <label className="medical-history-modal__field-label">Raza:</label>
                        <span className="medical-history-modal__field-value">{pet.raza || 'N/A'}</span>
                      </div>
                      <div className="medical-history-modal__field-group">
                        <label className="medical-history-modal__field-label">Edad:</label>
                        <span className="medical-history-modal__field-value">{edad || 'N/A'}</span>
                      </div>
                      {pet.microchip && (
                        <div className="medical-history-modal__field-group medical-history-modal__field-group--full">
                          <label className="medical-history-modal__field-label">Microchip:</label>
                          <span className="medical-history-modal__field-value medical-history-modal__microchip">
                            {pet.microchip}
                          </span>
                        </div>
                      )}
                      {pet.fecha_nacimiento && (
                        <div className="medical-history-modal__field-group">
                          <label className="medical-history-modal__field-label">Fecha de Nacimiento:</label>
                          <span className="medical-history-modal__field-value">
                            {formatDate(pet.fecha_nacimiento)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Registro de Consultas */}
                <div className="medical-history-modal__consultations-section">
                  <h2 className="medical-history-modal__section-title">
                    Registro de Consultas Médicas
                  </h2>

                  {consultas.length === 0 ? (
                    <div className="medical-history-modal__empty-state">
                      <div className="medical-history-modal__empty-icon">📋</div>
                      <p className="medical-history-modal__empty-title">
                        Sin consultas registradas
                      </p>
                      <p className="medical-history-modal__empty-text">
                        Este paciente aún no tiene consultas médicas registradas en su historial.
                      </p>
                    </div>
                  ) : (
                    <div className="medical-history-modal__consultations-list">
                      {consultas.map((consulta, index) => (
                        <div
                          key={consulta.id || index}
                          className="medical-history-modal__consultation-card"
                        >
                          {/* Header de la consulta */}
                          <div className="medical-history-modal__consultation-header">
                            <div className="medical-history-modal__consultation-number">
                              Consulta #{consultas.length - index}
                            </div>
                            <div className="medical-history-modal__consultation-date">
                              {formatDateTime(consulta.fecha_consulta)}
                            </div>
                          </div>

                          {/* Contenido de la consulta */}
                          <div className="medical-history-modal__consultation-body">
                            {/* Veterinario */}
                            {consulta.veterinario && (
                              <div className="medical-history-modal__consultation-field">
                                <label className="medical-history-modal__consultation-label">
                                  Veterinario Tratante:
                                </label>
                                <p className="medical-history-modal__consultation-text">
                                  {consulta.veterinario.nombre || consulta.veterinario}
                                </p>
                              </div>
                            )}

                            {/* Motivo */}
                            <div className="medical-history-modal__consultation-field">
                              <label className="medical-history-modal__consultation-label">
                                Motivo de Consulta:
                              </label>
                              <p className="medical-history-modal__consultation-text">
                                {consulta.motivo || 'No especificado'}
                              </p>
                            </div>

                            {/* Diagnóstico */}
                            <div className="medical-history-modal__consultation-field">
                              <label className="medical-history-modal__consultation-label">
                                Diagnóstico:
                              </label>
                              <p className="medical-history-modal__consultation-text">
                                {consulta.diagnostico || 'No especificado'}
                              </p>
                            </div>

                            {/* Tratamiento */}
                            <div className="medical-history-modal__consultation-field">
                              <label className="medical-history-modal__consultation-label">
                                Tratamiento:
                              </label>
                              <p className="medical-history-modal__consultation-text">
                                {consulta.tratamiento || 'No especificado'}
                              </p>
                            </div>

                            {/* Observaciones */}
                            {consulta.observaciones && (
                              <div className="medical-history-modal__consultation-field">
                                <label className="medical-history-modal__consultation-label">
                                  Observaciones:
                                </label>
                                <p className="medical-history-modal__consultation-text">
                                  {consulta.observaciones}
                                </p>
                              </div>
                            )}

                            {/* Metadatos */}
                            <div className="medical-history-modal__consultation-metadata">
                              {consulta.version && (
                                <span className="medical-history-modal__metadata-item">
                                  Versión: {consulta.version}
                                </span>
                              )}
                              {consulta.fecha_actualizacion && (
                                <span className="medical-history-modal__metadata-item">
                                  Última actualización: {formatDateTime(consulta.fecha_actualizacion)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer con acciones */}
          <div className="medical-history-modal__footer">
            <div className="medical-history-modal__footer-info">
              <small>
                Total de consultas: <strong>{consultas.length}</strong>
              </small>
              {medicalHistory?.fecha_creacion && (
                <small>
                  Historia creada: {formatDate(medicalHistory.fecha_creacion)}
                </small>
              )}
            </div>
            <div className="medical-history-modal__footer-actions">
              {/* TODO: Botón para exportar PDF en futuro */}
              {/* <Button variant="outline" size="small">
                📄 Exportar PDF
              </Button> */}
              <Button onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

MedicalHistoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pet: PropTypes.shape({
    id: PropTypes.string,
    nombre: PropTypes.string,
    especie: PropTypes.string,
    raza: PropTypes.string,
    microchip: PropTypes.string,
    fecha_nacimiento: PropTypes.string
  }),
  medicalHistory: PropTypes.shape({
    id: PropTypes.string,
    mascota_id: PropTypes.string,
    fecha_creacion: PropTypes.string,
    consultas: PropTypes.arrayOf(PropTypes.object)
  }),
  loading: PropTypes.bool
}

export default MedicalHistoryModal