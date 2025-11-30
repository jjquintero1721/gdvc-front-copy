import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Button from '@/components/ui/Button'
import { exportarHistoriaClinica } from '@/services/exportService'
import './MedicalHistoryModal.css'

/**
 * Modal de Historia Clínica con Consultas Colapsables
 *
 * Muestra la historia clínica completa con un accordion para ver el detalle de cada consulta
 * Al hacer click en una consulta, se expande/colapsa para mostrar toda la información
 *
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Callback para cerrar el modal
 * @param {object} pet - Información de la mascota
 * @param {object} medicalHistory - Historia clínica completa con consultas
 * @param {boolean} loading - Estado de carga
 */
function MedicalHistoryModal({ isOpen, onClose, pet, medicalHistory, loading }) {
  const modalContentRef = useRef(null)
  const [expandedConsultations, setExpandedConsultations] = useState([])
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportingCSV, setExportingCSV] = useState(false)

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

  // Resetear consultas expandidas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setExpandedConsultations([])
    }
  }, [isOpen])

  if (!isOpen) return null

  /**
   * Toggle de expansión/colapso de una consulta
   */
  const toggleConsultation = (consultaId) => {
    setExpandedConsultations(prev => {
      if (prev.includes(consultaId)) {
        return prev.filter(id => id !== consultaId)
      } else {
        return [...prev, consultaId]
      }
    })
  }

  /**
   * Verifica si una consulta está expandida
   */
  const isExpanded = (consultaId) => {
    return expandedConsultations.includes(consultaId)
  }

  /**
   * Formatea una fecha a formato legible en español
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Formatea una fecha con hora a formato legible en español
   */
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

  /**
   * Calcula la edad de la mascota en años o meses
   */
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

  /**
   * Maneja la exportación en formato PDF
   */
  const handleExportPDF = async () => {
    if (!medicalHistory?.id) return

    setExportingPDF(true)
    try {
      await exportarHistoriaClinica(medicalHistory.id, 'pdf')
    } catch (error) {
      alert(error.message || 'Error al exportar a PDF')
    } finally {
      setExportingPDF(false)
    }
  }

  /**
   * Maneja la exportación en formato CSV
   */
  const handleExportCSV = async () => {
    if (!medicalHistory?.id) return

    setExportingCSV(true)
    try {
      await exportarHistoriaClinica(medicalHistory.id, 'csv')
    } catch (error) {
      alert(error.message || 'Error al exportar a CSV')
    } finally {
      setExportingCSV(false)
    }
  }

  const consultas = medicalHistory?.consultas || []
  const edad = pet?.fecha_nacimiento ? calculateAge(pet.fecha_nacimiento) : null

  return (
    <>
      {/* Overlay de fondo */}
      <div
        className="medical-history-modal-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal centrado */}
      <div className="medical-history-modal" role="dialog" aria-modal="true">
        <div className="medical-history-modal__container" ref={modalContentRef}>

          {/* ============================================
              HEADER DEL MODAL
              ============================================ */}
          <div className="medical-history-modal__header">
            <div className="medical-history-modal__header-content">
              <div className="medical-history-modal__title-section">
                <div className="medical-history-modal__icon" aria-hidden="true">
                  🏥
                </div>
                <div className="medical-history-modal__title-group">
                  <h1>Historia Clínica</h1>
                  <p className="medical-history-modal__subtitle">
                    Clínica Veterinaria GDCV
                  </p>
                </div>
              </div>
              <button
                className="medical-history-modal__close-btn"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ============================================
              CONTENIDO DEL MODAL
              ============================================ */}
          <div className="medical-history-modal__content">
            {loading ? (
              // Estado de carga
              <div className="medical-history-modal__loading">
                <div className="medical-history-modal__spinner" />
                <p>Cargando historia clínica...</p>
              </div>
            ) : (
              <>
                {/* ============================================
                    INFORMACIÓN DEL PACIENTE - CON NUEVOS CAMPOS
                    ============================================ */}
                {pet && (
                  <div className="medical-history-modal__patient-section">
                    <h2 className="medical-history-modal__section-title">
                      Información del Paciente
                    </h2>
                    <div className="medical-history-modal__patient-grid">
                      <div className="medical-history-modal__field-group">
                        <label className="medical-history-modal__field-label">
                          Nombre
                        </label>
                        <span className="medical-history-modal__field-value">
                          {pet.nombre}
                        </span>
                      </div>

                      <div className="medical-history-modal__field-group">
                        <label className="medical-history-modal__field-label">
                          Especie
                        </label>
                        <span className="medical-history-modal__field-value">
                          {pet.especie}
                        </span>
                      </div>

                      <div className="medical-history-modal__field-group">
                        <label className="medical-history-modal__field-label">
                          Raza
                        </label>
                        <span className="medical-history-modal__field-value">
                          {pet.raza || 'No especificada'}
                        </span>
                      </div>

                      {/* NUEVO CAMPO: Color */}
                      {pet.color && (
                        <div className="medical-history-modal__field-group">
                          <label className="medical-history-modal__field-label">
                            Color
                          </label>
                          <span className="medical-history-modal__field-value">
                            {pet.color}
                          </span>
                        </div>
                      )}

                      {/* NUEVO CAMPO: Sexo */}
                      {pet.sexo && (
                        <div className="medical-history-modal__field-group">
                          <label className="medical-history-modal__field-label">
                            Sexo
                          </label>
                          <span className="medical-history-modal__field-value">
                            {pet.sexo === 'macho' ? 'Macho ♂' : pet.sexo === 'hembra' ? 'Hembra ♀' : pet.sexo}
                          </span>
                        </div>
                      )}

                      {/* NUEVO CAMPO: Peso */}
                      {(typeof pet.peso !== 'undefined' && pet.peso !== null && pet.peso !== '') && (
                        <div className="medical-history-modal__field-group">
                          <label className="medical-history-modal__field-label">
                            Peso
                          </label>
                          <span className="medical-history-modal__field-value">
                            {Number(pet.peso)} kg
                          </span>
                        </div>
                      )}

                      <div className="medical-history-modal__field-group">
                        <label className="medical-history-modal__field-label">
                          Edad
                        </label>
                        <span className="medical-history-modal__field-value">
                          {edad || 'No disponible'}
                        </span>
                      </div>

                      {pet.fecha_nacimiento && (
                        <div className="medical-history-modal__field-group">
                          <label className="medical-history-modal__field-label">
                            Fecha de Nacimiento
                          </label>
                          <span className="medical-history-modal__field-value">
                            {formatDate(pet.fecha_nacimiento)}
                          </span>
                        </div>
                      )}

                      {pet.microchip && (
                        <div className="medical-history-modal__field-group medical-history-modal__field-group--full">
                          <label className="medical-history-modal__field-label">
                            Microchip
                          </label>
                          <span className="medical-history-modal__field-value medical-history-modal__microchip">
                            {pet.microchip}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ============================================
                    HISTORIAL DE CONSULTAS
                    ============================================ */}
                <div className="medical-history-modal__history-section">
                  <h2 className="medical-history-modal__section-title">
                    Historial de Consultas
                  </h2>

                  {consultas.length === 0 ? (
                    <div className="medical-history-modal__empty-state">
                      <div className="medical-history-modal__empty-icon">📋</div>
                      <p className="medical-history-modal__empty-text">
                        Esta mascota aún no tiene consultas registradas
                      </p>
                    </div>
                  ) : (
                    <div className="medical-history-modal__accordion">
                      {consultas.map((consulta, index) => {
                        const expanded = isExpanded(consulta.id)

                        return (
                          <div
                            key={consulta.id}
                            className={`medical-history-modal__accordion-item ${
                              expanded ? 'medical-history-modal__accordion-item--expanded' : ''
                            }`}
                          >
                            {/* Header de la consulta */}
                            <div
                              className="medical-history-modal__accordion-header"
                              onClick={() => toggleConsultation(consulta.id)}
                              role="button"
                              tabIndex={0}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  toggleConsultation(consulta.id)
                                }
                              }}
                            >
                              <div className="medical-history-modal__accordion-title">
                                <div className="medical-history-modal__consultation-number">
                                  Consulta #{consultas.length - index}
                                </div>
                                <div className="medical-history-modal__consultation-date">
                                  {formatDateTime(consulta.fecha_hora)}
                                </div>
                              </div>

                              {/* Icono de expandir/colapsar */}
                              <div className="medical-history-modal__accordion-icon">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6 9L12 15L18 9"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* Contenido colapsable de la consulta */}
                            <div
                              className={`medical-history-modal__accordion-content ${
                                expanded ? 'medical-history-modal__accordion-content--expanded' : ''
                              }`}
                            >
                              <div className="medical-history-modal__consultation-body">

                                {/* Motivo de Consulta */}
                                <div className="medical-history-modal__consultation-field">
                                  <label className="medical-history-modal__consultation-label">
                                    Motivo de Consulta
                                  </label>
                                  <p className="medical-history-modal__consultation-text">
                                    {consulta.motivo || 'No especificado'}
                                  </p>
                                </div>

                                {/* Anamnesis */}
                                {consulta.anamnesis && (
                                  <div className="medical-history-modal__consultation-field">
                                    <label className="medical-history-modal__consultation-label">
                                      Anamnesis
                                    </label>
                                    <p className="medical-history-modal__consultation-text">
                                      {consulta.anamnesis}
                                    </p>
                                  </div>
                                )}

                                {/* Signos Vitales */}
                                {consulta.signos_vitales && (
                                  <div className="medical-history-modal__consultation-field">
                                    <label className="medical-history-modal__consultation-label">
                                      Signos Vitales
                                    </label>
                                    <p className="medical-history-modal__consultation-text">
                                      {consulta.signos_vitales}
                                    </p>
                                  </div>
                                )}

                                {/* Diagnóstico */}
                                <div className="medical-history-modal__consultation-field">
                                  <label className="medical-history-modal__consultation-label">
                                    Diagnóstico
                                  </label>
                                  <p className="medical-history-modal__consultation-text">
                                    {consulta.diagnostico || 'No especificado'}
                                  </p>
                                </div>

                                {/* Tratamiento y Vacunas en 2 columnas */}
                                <div className="medical-history-modal__consultation-row">
                                  <div className="medical-history-modal__consultation-field">
                                    <label className="medical-history-modal__consultation-label">
                                      Tratamiento
                                    </label>
                                    <p className="medical-history-modal__consultation-text">
                                      {consulta.tratamiento || 'No especificado'}
                                    </p>
                                  </div>

                                  <div className="medical-history-modal__consultation-field">
                                    <label className="medical-history-modal__consultation-label">
                                      Vacunas
                                    </label>
                                    <p className="medical-history-modal__consultation-text">
                                      {consulta.vacunas || 'Ninguna'}
                                    </p>
                                  </div>
                                </div>

                                {/* Observaciones (opcional) */}
                                {consulta.observaciones && (
                                  <div className="medical-history-modal__consultation-field">
                                    <label className="medical-history-modal__consultation-label">
                                      Observaciones
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
                                      Versión {consulta.version}
                                    </span>
                                  )}
                                  {consulta.fecha_actualizacion && (
                                    <span className="medical-history-modal__metadata-item">
                                      Actualizado: {formatDateTime(consulta.fecha_actualizacion)}
                                    </span>
                                  )}
                                  {consulta.veterinario_id && (
                                    <span className="medical-history-modal__metadata-item">
                                      Veterinario ID: {consulta.veterinario_id.substring(0, 8)}...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ============================================
              FOOTER CON INFORMACIÓN Y ACCIONES
              ============================================ */}
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
              <button
                className="export-btn export-btn--pdf"
                onClick={handleExportPDF}
                disabled={exportingPDF || !medicalHistory?.id}
                title="Exportar a PDF"
              >
                {exportingPDF ? (
                  <>
                    <span className="export-btn__spinner"></span>
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <svg className="export-btn__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
                      <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
                      <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
                    </svg>
                    <span>Exportar PDF</span>
                  </>
                )}
              </button>

              <button
                className="export-btn export-btn--csv"
                onClick={handleExportCSV}
                disabled={exportingCSV || !medicalHistory?.id}
                title="Exportar a CSV"
              >
                {exportingCSV ? (
                  <>
                    <span className="export-btn__spinner"></span>
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <svg className="export-btn__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Exportar CSV</span>
                  </>
                )}
              </button>

              <Button onClick={onClose} variant="primary">
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
    color: PropTypes.string,
    sexo: PropTypes.string,
    peso: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    microchip: PropTypes.string,
    fecha_nacimiento: PropTypes.string
  }),
  medicalHistory: PropTypes.shape({
    id: PropTypes.string,
    mascota_id: PropTypes.string,
    numero: PropTypes.string,
    fecha_creacion: PropTypes.string,
    consultas: PropTypes.arrayOf(PropTypes.object)
  }),
  loading: PropTypes.bool
}

export default MedicalHistoryModal