import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Bell,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react'
import './DecoratorModal.css'

/**
 * Modal para añadir decoradores a citas
 * RF-05: Gestión de citas con extensiones dinámicas
 *
 * Tipos de decoradores:
 * - recordatorio: Recordatorios automáticos
 * - notas: Notas especiales
 * - prioridad: Nivel de prioridad
 */
function DecoratorModal({
  isOpen,
  onClose,
  appointment,
  onAddDecorator,
  userRole,
  existingDecorators = []
}) {
  const [activeTab, setActiveTab] = useState('recordatorio')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para Recordatorios
  const [recordatorios, setRecordatorios] = useState([
    { horas_antes: 24, activo: true },
    { horas_antes: 2, activo: true }
  ])

  // Estado para Notas
  const [notas, setNotas] = useState({
    preparacion_cliente: '',
    instrucciones_veterinario: '',
    requisitos: [],
    observaciones: ''
  })
  const [nuevoRequisito, setNuevoRequisito] = useState('')

  // Estado para Prioridad
  const [prioridad, setPrioridad] = useState({
    nivel_prioridad: 'media',
    razon: ''
  })

  // Determinar qué tabs mostrar según el rol
  const canAddRecordatorio = userRole !== 'propietario'
  const canAddNotas = true // Todos pueden añadir notas
  const canAddPrioridad = userRole !== 'propietario'

  // Establecer tab inicial válido según permisos
  useEffect(() => {
    if (isOpen) {
      if (userRole === 'propietario') {
        setActiveTab('notas')
      } else {
        setActiveTab('recordatorio')
      }
    }
  }, [isOpen, userRole])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setRecordatorios([
      { horas_antes: 24, activo: true },
      { horas_antes: 2, activo: true }
    ])
    setNotas({
      preparacion_cliente: '',
      instrucciones_veterinario: '',
      requisitos: [],
      observaciones: ''
    })
    setPrioridad({
      nivel_prioridad: 'media',
      razon: ''
    })
    setNuevoRequisito('')
  }

  // ==================== RECORDATORIOS ====================
  const addRecordatorio = () => {
    setRecordatorios([...recordatorios, { horas_antes: 1, activo: true }])
  }

  const removeRecordatorio = (index) => {
    setRecordatorios(recordatorios.filter((_, i) => i !== index))
  }

  const updateRecordatorio = (index, field, value) => {
    const updated = [...recordatorios]
    updated[index][field] = field === 'horas_antes' ? parseInt(value) || 1 : value
    setRecordatorios(updated)
  }

  // ==================== NOTAS ====================
  const addRequisito = () => {
    if (nuevoRequisito.trim()) {
      setNotas({
        ...notas,
        requisitos: [...notas.requisitos, nuevoRequisito.trim()]
      })
      setNuevoRequisito('')
    }
  }

  const removeRequisito = (index) => {
    setNotas({
      ...notas,
      requisitos: notas.requisitos.filter((_, i) => i !== index)
    })
  }

  // ==================== SUBMIT ====================
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      let decoratorData = null

      if (activeTab === 'recordatorio') {
        decoratorData = { recordatorios }
      } else if (activeTab === 'notas') {
        decoratorData = notas
      } else if (activeTab === 'prioridad') {
        decoratorData = prioridad
      }

      await onAddDecorator(activeTab, decoratorData)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error al añadir decorador:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validación de formularios
  const isFormValid = () => {
    if (activeTab === 'recordatorio') {
      return recordatorios.length > 0 && recordatorios.every(r => r.horas_antes > 0)
    } else if (activeTab === 'notas') {
      return notas.preparacion_cliente.trim() ||
             notas.instrucciones_veterinario.trim() ||
             notas.observaciones.trim() ||
             notas.requisitos.length > 0
    } else if (activeTab === 'prioridad') {
      return prioridad.razon.length >= 10 && prioridad.razon.length <= 500
    }
    return false
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="decorator-modal-overlay" onClick={handleClose}>
        <motion.div
          className="decorator-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="decorator-modal__header">
            <h2 className="decorator-modal__title">
              Añadir Decorador a Cita
            </h2>
            <button
              className="decorator-modal__close"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="decorator-modal__tabs">
            {canAddRecordatorio && (
              <button
                className={`decorator-modal__tab ${activeTab === 'recordatorio' ? 'active' : ''}`}
                onClick={() => setActiveTab('recordatorio')}
              >
                <Bell size={20} />
                <span>Recordatorios</span>
              </button>
            )}

            {canAddNotas && (
              <button
                className={`decorator-modal__tab ${activeTab === 'notas' ? 'active' : ''}`}
                onClick={() => setActiveTab('notas')}
              >
                <FileText size={20} />
                <span>Notas Especiales</span>
              </button>
            )}

            {canAddPrioridad && (
              <button
                className={`decorator-modal__tab ${activeTab === 'prioridad' ? 'active' : ''}`}
                onClick={() => setActiveTab('prioridad')}
              >
                <AlertTriangle size={20} />
                <span>Prioridad</span>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="decorator-modal__content">
            <AnimatePresence mode="wait">
              {/* RECORDATORIOS */}
              {activeTab === 'recordatorio' && (
                <motion.div
                  key="recordatorio"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="decorator-form"
                >
                  <div className="decorator-form__section">
                    <h3 className="decorator-form__section-title">
                      <Bell size={18} />
                      Configurar Recordatorios
                    </h3>
                    <p className="decorator-form__description">
                      Añade recordatorios automáticos para esta cita
                    </p>

                    <div className="recordatorio-list">
                      {recordatorios.map((rec, index) => (
                        <motion.div
                          key={index}
                          className="recordatorio-item"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="recordatorio-item__input-group">
                            <Clock size={18} />
                            <input
                              type="number"
                              min="1"
                              max="168"
                              value={rec.horas_antes}
                              onChange={(e) => updateRecordatorio(index, 'horas_antes', e.target.value)}
                              className="recordatorio-item__input"
                            />
                            <span>horas antes</span>
                          </div>

                          <label className="recordatorio-item__checkbox">
                            <input
                              type="checkbox"
                              checked={rec.activo}
                              onChange={(e) => updateRecordatorio(index, 'activo', e.target.checked)}
                            />
                            <span>Activo</span>
                          </label>

                          {recordatorios.length > 1 && (
                            <button
                              onClick={() => removeRecordatorio(index)}
                              className="recordatorio-item__remove"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <button
                      onClick={addRecordatorio}
                      className="decorator-form__add-button"
                    >
                      <Plus size={18} />
                      Añadir Recordatorio
                    </button>
                  </div>
                </motion.div>
              )}

              {/* NOTAS ESPECIALES */}
              {activeTab === 'notas' && (
                <motion.div
                  key="notas"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="decorator-form"
                >
                  <div className="decorator-form__section">
                    <h3 className="decorator-form__section-title">
                      <FileText size={18} />
                      Notas Especiales
                    </h3>
                    <p className="decorator-form__description">
                      {userRole === 'propietario'
                        ? 'Añade notas importantes sobre tu mascota'
                        : 'Añade instrucciones y notas especiales para esta cita'}
                    </p>

                    <div className="decorator-form__field">
                      <label>Preparación para el cliente</label>
                      <textarea
                        value={notas.preparacion_cliente}
                        onChange={(e) => setNotas({...notas, preparacion_cliente: e.target.value})}
                        placeholder="Ej: Traer certificado de vacunas"
                        rows="3"
                      />
                    </div>

                    {userRole !== 'propietario' && (
                      <div className="decorator-form__field">
                        <label>Instrucciones para veterinario</label>
                        <textarea
                          value={notas.instrucciones_veterinario}
                          onChange={(e) => setNotas({...notas, instrucciones_veterinario: e.target.value})}
                          placeholder="Ej: Paciente nervioso, manejar con cuidado"
                          rows="3"
                        />
                      </div>
                    )}

                    <div className="decorator-form__field">
                      <label>Requisitos especiales</label>
                      <div className="requisitos-input-group">
                        <input
                          type="text"
                          value={nuevoRequisito}
                          onChange={(e) => setNuevoRequisito(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addRequisito()}
                          placeholder="Ej: Ayuno de 12 horas"
                        />
                        <button
                          type="button"
                          onClick={addRequisito}
                          className="requisitos-add-btn"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      {notas.requisitos.length > 0 && (
                        <div className="requisitos-list">
                          {notas.requisitos.map((req, index) => (
                            <motion.div
                              key={index}
                              className="requisito-tag"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <span>{req}</span>
                              <button onClick={() => removeRequisito(index)}>
                                <X size={14} />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="decorator-form__field">
                      <label>Observaciones adicionales</label>
                      <textarea
                        value={notas.observaciones}
                        onChange={(e) => setNotas({...notas, observaciones: e.target.value})}
                        placeholder="Cualquier información adicional relevante"
                        rows="3"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PRIORIDAD */}
              {activeTab === 'prioridad' && (
                <motion.div
                  key="prioridad"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="decorator-form"
                >
                  <div className="decorator-form__section">
                    <h3 className="decorator-form__section-title">
                      <AlertTriangle size={18} />
                      Nivel de Prioridad
                    </h3>
                    <p className="decorator-form__description">
                      Marca esta cita con un nivel de prioridad especial
                    </p>

                    <div className="prioridad-options">
                      {['alta', 'media', 'baja'].map((nivel) => (
                        <button
                          key={nivel}
                          className={`prioridad-option prioridad-option--${nivel} ${
                            prioridad.nivel_prioridad === nivel ? 'active' : ''
                          }`}
                          onClick={() => setPrioridad({...prioridad, nivel_prioridad: nivel})}
                        >
                          <div className="prioridad-option__indicator"></div>
                          <span>{nivel.charAt(0).toUpperCase() + nivel.slice(1)}</span>
                        </button>
                      ))}
                    </div>

                    <div className="decorator-form__field">
                      <label>
                        Razón de la prioridad *
                        <span className="char-count">
                          {prioridad.razon.length}/500
                        </span>
                      </label>
                      <textarea
                        value={prioridad.razon}
                        onChange={(e) => setPrioridad({...prioridad, razon: e.target.value})}
                        placeholder="Explica por qué esta cita tiene esta prioridad (mínimo 10 caracteres)"
                        rows="4"
                        maxLength="500"
                      />
                      {prioridad.razon.length > 0 && prioridad.razon.length < 10 && (
                        <span className="field-error">
                          Mínimo 10 caracteres requeridos
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="decorator-modal__footer">
            <button
              onClick={handleClose}
              className="decorator-modal__button decorator-modal__button--cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="decorator-modal__button decorator-modal__button--submit"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Añadir Decorador
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DecoratorModal