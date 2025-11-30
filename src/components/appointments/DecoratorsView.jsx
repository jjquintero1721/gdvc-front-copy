import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, FileText, AlertTriangle, Trash2, Clock } from 'lucide-react'
import decoratorService from '@/services/decoratorService'
import { toast } from 'react-hot-toast'
import './DecoratorsView.css'

/**
 * Componente para visualizar y gestionar decoradores de una cita
 *
 * Props:
 * - appointment: objeto cita (necesita .id)
 * - userRole: rol actual del usuario ('superadmin','veterinario','auxiliar','propietario', etc.)
 * - decoratorsList: (OPCIONAL) lista de decoradores pre-cargados
 * - onDecoratorRemoved: callback opcional cuando se elimina un decorador
 */
function DecoratorsView({ appointment, userRole, decoratorsList, onDecoratorRemoved }) {
  const [decorators, setDecorators] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    console.log("🔍 DecoratorsView - decoratorsList recibido:", decoratorsList);

    // Si se pasan decoradores como prop, usarlos directamente
    if (decoratorsList !== undefined && decoratorsList !== null) {
      console.log("✅ Usando decoratorsList del padre");

      // Normalizar los decoradores recibidos
      const normalized = normalizeDecorators(decoratorsList);
      console.log("📦 Decoradores normalizados:", normalized);

      setDecorators(normalized);
      setIsLoading(false);
      return;
    }

    // Si no, cargar desde el backend
    if (appointment?.id) {
      loadDecorators()
    } else {
      setDecorators([])
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment, userRole, decoratorsList])

  /**
   * Normaliza decoradores desde cualquier formato posible
   */
  const normalizeDecorators = (data) => {
    console.log("🔄 Normalizando decoradores desde:", data);

    // Si es un array, procesarlo
    if (Array.isArray(data)) {
      return data.map(d => normalizeDecorator(d));
    }

    // Si es un objeto, puede ser:
    // 1. Un único decorador
    // 2. El objeto completo de la cita con campos de decoradores mezclados

    const decoradoresEncontrados = [];

    // Buscar decoradores en el objeto
    if (data.notas_especiales) {
      decoradoresEncontrados.push({
        id: data.id || `notas-${Date.now()}`,
        cita_id: data.cita_id || data.id,
        tipo_decorador: 'NOTAS_ESPECIALES',
        configuracion: {
          notas: data.notas_especiales
        },
        activo: true,
        fecha_creacion: data.fecha_creacion || new Date().toISOString(),
        creado_por: data.creado_por || null
      });
    }

    if (data.recordatorios) {
      decoradoresEncontrados.push({
        id: data.id || `recordatorio-${Date.now()}`,
        cita_id: data.cita_id || data.id,
        tipo_decorador: 'RECORDATORIO',
        configuracion: {
          recordatorios: data.recordatorios
        },
        activo: true,
        fecha_creacion: data.fecha_creacion || new Date().toISOString(),
        creado_por: data.creado_por || null
      });
    }

    if (data.prioridad || data.nivel_prioridad) {
      decoradoresEncontrados.push({
        id: data.id || `prioridad-${Date.now()}`,
        cita_id: data.cita_id || data.id,
        tipo_decorador: 'PRIORIDAD',
        configuracion: {
          nivel_prioridad: data.nivel_prioridad || data.prioridad,
          razon: data.razon_prioridad || data.razon || ''
        },
        activo: true,
        fecha_creacion: data.fecha_creacion || new Date().toISOString(),
        creado_por: data.creado_por || null
      });
    }

    // Si ya tiene estructura de decorador normalizado
    if (data.tipo_decorador || data.tipo) {
      decoradoresEncontrados.push(normalizeDecorator(data));
    }

    console.log("✅ Decoradores encontrados en el objeto:", decoradoresEncontrados);
    return decoradoresEncontrados;
  }

  /**
   * Normaliza un único decorador
   */
  const normalizeDecorator = (d) => {
    return {
      id: d.id || d._id || d.decorator_id || `decorator-${Date.now()}-${Math.random()}`,
      cita_id: d.cita_id || d.cita || d.appointment_id || null,
      tipo_decorador: (d.tipo_decorador || d.tipo || 'UNKNOWN').toString().toUpperCase(),
      configuracion: d.configuracion || d.config || {},
      activo: d.activo !== undefined ? d.activo : true,
      fecha_creacion: d.fecha_creacion || d.created_at || d.fecha || new Date().toISOString(),
      creado_por: d.creado_por || d.creador || null
    };
  }

  const loadDecorators = async () => {
    try {
      setIsLoading(true)
      let response

      if (userRole === 'propietario') {
        response = await decoratorService.getOwnerDecorators(appointment.id)
      } else {
        response = await decoratorService.getDecorators(appointment.id)
      }

      console.log("📦 Respuesta de decoradores:", response);

      // Extraer decoradores de la respuesta
      const payload = response?.data || response;
      let decoradoresData = null;

      // Intentar múltiples rutas de extracción
      if (payload?.data?.decoradores) {
        decoradoresData = payload.data.decoradores;
      } else if (payload?.decoradores) {
        decoradoresData = payload.decoradores;
      } else if (payload?.data) {
        // Puede ser el objeto completo de la cita
        decoradoresData = payload.data;
      } else {
        decoradoresData = payload;
      }

      console.log("📦 Datos extraídos para normalizar:", decoradoresData);

      // Normalizar
      const normalized = normalizeDecorators(decoradoresData);
      console.log("✅ Decoradores normalizados:", normalized);

      setDecorators(normalized);
    } catch (error) {
      console.error('❌ Error al cargar decoradores:', error)
      toast.error('Error al cargar decoradores')
      setDecorators([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDecorator = async (decoratorId, decoratorTipo) => {
    const canRemove = checkCanRemove(decoratorTipo)
    if (!canRemove) {
      toast.error('No tienes permiso para eliminar este decorador')
      return
    }

    if (!confirm('¿Estás seguro de eliminar este decorador?')) return

    try {
      setRemovingId(decoratorId)
      await decoratorService.removeDecorator(appointment.id, decoratorId)
      toast.success('Decorador eliminado exitosamente')

      // Actualizar lista (filtrar por id)
      setDecorators(prev => prev.filter(d => d.id !== decoratorId))

      if (typeof onDecoratorRemoved === 'function') {
        onDecoratorRemoved(decoratorId)
      }
    } catch (error) {
      console.error('Error al eliminar decorador:', error)
      toast.error(error.message || 'Error al eliminar decorador')
    } finally {
      setRemovingId(null)
    }
  }

  const checkCanRemove = (decoratorTipo) => {
    const role = (userRole || '').toString().toLowerCase()
    const tipo = (decoratorTipo || '').toString().toLowerCase()

    // superadmin, veterinario y auxiliar pueden eliminar cualquier decorador
    if (['superadmin', 'veterinario', 'auxiliar'].includes(role)) return true

    // propietario solo puede eliminar NOTAS_ESPECIALES
    if (role === 'propietario' && (tipo === 'notas_especiales' || tipo.includes('notas'))) return true

    return false
  }

  const getDecoratorIcon = (type) => {
    const t = (type || '').toString().toLowerCase()
    if (t.includes('recordatorio')) return <Bell size={20} />
    if (t.includes('notas')) return <FileText size={20} />
    if (t.includes('prioridad')) return <AlertTriangle size={20} />
    return <FileText size={20} />
  }

  const getDecoratorColor = (type) => {
    const t = (type || '').toString().toLowerCase()
    if (t.includes('recordatorio')) return 'blue'
    if (t.includes('notas')) return 'purple'
    if (t.includes('prioridad')) return 'orange'
    return 'gray'
  }

  if (isLoading) {
    return (
      <div className="decorators-view">
        <div className="decorators-view__loading">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            🔄
          </motion.div>
          <span>Cargando decoradores...</span>
        </div>
      </div>
    )
  }

  console.log("🎨 Renderizando decoradores:", decorators);

  if (!decorators || decorators.length === 0) {
    return (
      <div className="decorators-view">
        <div className="decorators-view__empty">
          <FileText size={48} />
          <p>No hay decoradores para esta cita</p>
        </div>
      </div>
    )
  }

  return (
    <div className="decorators-view">
      <h3 className="decorators-view__title">Decoradores de la Cita ({decorators.length})</h3>

      <div className="decorators-list">
        <AnimatePresence>
          {decorators.map((decorator, index) => (
            <DecoratorCard
              key={decorator.id || index}
              decorator={decorator}
              color={getDecoratorColor(decorator.tipo_decorador)}
              icon={getDecoratorIcon(decorator.tipo_decorador)}
              onRemove={handleRemoveDecorator}
              isRemoving={removingId === decorator.id}
              userRole={userRole}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Componente individual para cada decorador
 */
function DecoratorCard({ decorator, color, icon, onRemove, isRemoving, userRole }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getDecoratorTitle = (type) => {
    const t = (type || '').toString().toLowerCase()
    if (t.includes('recordatorio')) return 'Recordatorios'
    if (t.includes('notas')) return 'Notas Especiales'
    if (t.includes('prioridad')) return 'Prioridad'
    return type || 'Decorador'
  }

  const renderDecoratorContent = () => {
    const config = decorator.configuracion || {}
    const tipo = (decorator.tipo_decorador || '').toString().toLowerCase()

    console.log("🎯 Renderizando contenido de decorador:", { tipo, config });

    if (tipo.includes('recordatorio')) {
      const recordatorios = config.recordatorios || []
      return (
        <div className="decorator-content">
          {recordatorios.length > 0 ? (
            recordatorios.map((rec, idx) => (
              <div key={idx} className="decorator-content__item">
                <Clock size={16} />
                <span>{rec.horas_antes} horas antes</span>
                <span className={`status ${rec.activo ? 'active' : 'inactive'}`}>
                  {rec.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))
          ) : (
            <p>No hay recordatorios configurados</p>
          )}
        </div>
      )
    }

    if (tipo.includes('notas')) {
      const notas = config.notas || config || {}
      const tieneContenido = notas.preparacion_cliente || notas.instrucciones_veterinario ||
                            (notas.requisitos && notas.requisitos.length > 0) || notas.observaciones;

      return (
        <div className="decorator-content">
          {notas.preparacion_cliente && (
            <div className="decorator-content__field">
              <strong>Preparación cliente:</strong>
              <p>{notas.preparacion_cliente}</p>
            </div>
          )}
          {notas.instrucciones_veterinario && (
            <div className="decorator-content__field">
              <strong>Instrucciones veterinario:</strong>
              <p>{notas.instrucciones_veterinario}</p>
            </div>
          )}
          {notas.requisitos && notas.requisitos.length > 0 && (
            <div className="decorator-content__field">
              <strong>Requisitos:</strong>
              <ul>
                {notas.requisitos.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          {notas.observaciones && (
            <div className="decorator-content__field">
              <strong>Observaciones:</strong>
              <p>{notas.observaciones}</p>
            </div>
          )}
          {!tieneContenido && (
            <p>No hay notas especiales configuradas</p>
          )}
        </div>
      )
    }

    if (tipo.includes('prioridad')) {
      const nivel = (config.nivel_prioridad || 'media').toString()
      const razon = config.razon || 'No especificada'
      return (
        <div className="decorator-content">
          <div className="decorator-content__priority">
            <div className={`priority-badge priority-badge--${nivel}`}>
              {nivel.toUpperCase()}
            </div>
            <p>{razon}</p>
          </div>
        </div>
      )
    }

    return <p>Tipo de decorador desconocido: {tipo}</p>
  }

  const canRemove = (() => {
    const role = (userRole || '').toString().toLowerCase()
    const tipo = (decorator.tipo_decorador || '').toString().toLowerCase()
    if (['superadmin', 'veterinario', 'auxiliar'].includes(role)) return true
    if (role === 'propietario' && (tipo === 'notas_especiales' || tipo.includes('notas'))) return true
    return false
  })()

  return (
    <motion.div
      className={`decorator-card decorator-card--${color}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.25 }}
    >
      <div className="decorator-card__header">
        <div className="decorator-card__icon">{icon}</div>
        <div className="decorator-card__info">
          <h4 className="decorator-card__title">{getDecoratorTitle(decorator.tipo_decorador)}</h4>
          {decorator.fecha_creacion && (
            <span className="decorator-card__date">{new Date(decorator.fecha_creacion).toLocaleString()}</span>
          )}
        </div>

        <div className="decorator-card__actions">
          <button
            className="decorator-card__toggle"
            onClick={() => setIsExpanded(prev => !prev)}
            aria-label="Expandir/Contraer"
            type="button"
          >
            {isExpanded ? '▲' : '▼'}
          </button>

          <button
            className="decorator-card__remove"
            onClick={() => onRemove(decorator.id, decorator.tipo_decorador)}
            disabled={!canRemove || isRemoving}
            title={!canRemove ? 'No tienes permiso para eliminar' : 'Eliminar decorador'}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="decorator-card__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {renderDecoratorContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default DecoratorsView