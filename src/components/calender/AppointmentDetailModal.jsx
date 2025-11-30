import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './AppointmentDetailModal.css';
import DecoratorsView from '@/components/appointments/DecoratorsView.jsx'
import decoratorService from "@services/decoratorService";

/**
 * AppointmentDetailModal - Modal para mostrar detalles de una cita
 *
 * Props:
 *  - isOpen
 *  - onClose
 *  - appointment (obj)
 *  - userRole (string)  <-- Importante: debe pasarse desde el padre
 *  - onDecoratorsChanged (opcional) callback cuando cambian decoradores
 */
const AppointmentDetailModal = ({ isOpen, onClose, appointment, userRole, onDecoratorsChanged }) => {
  if (!appointment) return null;

  // Formatear fecha y hora
  const fechaHora = parseISO(appointment.fecha_hora);
  const fechaFormateada = format(fechaHora, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const horaFormateada = format(fechaHora, 'h:mm a', { locale: es });
  const [decorators, setDecorators] = useState([]);
  const [loadingDecorators, setLoadingDecorators] = useState(true);

  useEffect(() => {
    if (!isOpen || !appointment?.id) return;

    const load = async () => {
      try {
        setLoadingDecorators(true);
        const response = await decoratorService.getDecorators(appointment.id);

        console.log("📦 Respuesta completa del backend:", response);
        console.log("📦 response.data:", response.data);

        // El backend devuelve: { success: true, message: "...", data: { decoradores: [...], id, mascota_id, etc. } }
        // Necesitamos extraer response.data.data.decoradores
        let list = [];
        
        if (response?.data?.data?.decoradores) {
          // Estructura: response.data.data.decoradores
          list = response.data.data.decoradores;
        } else if (response?.data?.decoradores) {
          // Fallback: response.data.decoradores
          list = response.data.decoradores;
        } else {
          console.warn("⚠️ No se encontraron decoradores en la respuesta");
        }

        console.log("✅ Decoradores extraídos:", list);
        setDecorators(list);
      } catch (err) {
        console.error("❌ Error cargando decoradores:", err);
        setDecorators([]);
      } finally {
        setLoadingDecorators(false);
      }
    };

    load();
  }, [isOpen, appointment?.id]);


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="appointment-modal__overlay"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="appointment-modal__container"
            >
              <div className="appointment-modal__header">
                <div className="appointment-modal__header-content">
                  <div>
                    <h2 className="appointment-modal__title">Detalle de Cita</h2>
                    <p className="appointment-modal__date">{fechaFormateada}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="appointment-modal__close-btn"
                    aria-label="Cerrar modal"
                  >
                    <svg className="appointment-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="appointment-modal__content">
                {/* --- Información principal (igual que antes) --- */}
                <div className="appointment-modal__grid">
                  <div className="appointment-modal__section">
                    <h3 className="appointment-modal__section-title">Mascota</h3>
                    <div className="appointment-modal__section-content">
                      <div className="appointment-modal__info-row">
                        <svg className="appointment-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="appointment-modal__info-text">
                          {appointment.mascota?.nombre || 'No especificado'}
                        </span>
                      </div>
                      {appointment.mascota?.especie && (
                        <p className="appointment-modal__info-subtext">
                          {appointment.mascota.especie} - {appointment.mascota.raza || 'Raza no especificada'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="appointment-modal__section">
                    <h3 className="appointment-modal__section-title">Propietario</h3>
                    <div className="appointment-modal__section-content">
                      <div className="appointment-modal__info-row">
                        <svg className="appointment-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="appointment-modal__info-text">
                          {appointment.propietario?.nombre || 'No especificado'}
                        </span>
                      </div>
                      {appointment.propietario?.telefono && (
                        <p className="appointment-modal__info-subtext">{appointment.propietario.telefono}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Veterinario */}
                {appointment.veterinario && (
                  <div className="appointment-modal__section appointment-modal__section--full">
                    <h3 className="appointment-modal__section-title">Veterinario Asignado</h3>
                    <div className="appointment-modal__info-row">
                      <svg className="appointment-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="appointment-modal__info-text">
                         {appointment.veterinario.nombre} {appointment.veterinario.apellido}
                      </span>
                    </div>
                    {appointment.veterinario.especialidad && (
                      <p className="appointment-modal__info-subtext">
                        {appointment.veterinario.especialidad}
                      </p>
                    )}
                  </div>
                )}

                {/* Horario / Estado / Servicio / Motivo (igual que antes) */}
                <div className="appointment-modal__grid">
                  <div className="appointment-modal__section appointment-modal__section--blue">
                    <h3 className="appointment-modal__section-title">Horario</h3>
                    <div className="appointment-modal__info-row">
                      <svg className="appointment-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="appointment-modal__info-text">{horaFormateada}</span>
                    </div>
                  </div>

                  <div className="appointment-modal__section appointment-modal__section--green">
                    <h3 className="appointment-modal__section-title">Estado</h3>
                    <span className={`appointment-modal__badge appointment-modal__badge--${appointment.estado}`}>
                      {appointment.estado?.charAt(0).toUpperCase() + appointment.estado?.slice(1)}
                    </span>
                  </div>
                </div>

                {appointment.servicio && (
                  <div className="appointment-modal__section appointment-modal__section--purple appointment-modal__section--full">
                    <h3 className="appointment-modal__section-title">Servicio</h3>
                    <p className="appointment-modal__info-text">{appointment.servicio.nombre || 'No especificado'}</p>
                    {appointment.servicio.descripcion && (
                      <p className="appointment-modal__description">{appointment.servicio.descripcion}</p>
                    )}
                  </div>
                )}

                {appointment.motivo && (
                  <div className="appointment-modal__section appointment-modal__section--full">
                    <h3 className="appointment-modal__section-title">Motivo de la consulta</h3>
                    <p className="appointment-modal__description">{appointment.motivo}</p>
                  </div>
                )}

                {/* Notas adicionales */}
                {appointment.notas && appointment.notas.trim() !== '' && (
                  <div className="appointment-modal__section appointment-modal__section--amber appointment-modal__section--full">
                    <div className="appointment-modal__alert">
                      <svg className="appointment-modal__icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      <div className="appointment-modal__alert-content">
                        <h3 className="appointment-modal__section-title">Notas adicionales</h3>
                        <p className="appointment-modal__description">{appointment.notas}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información adicional (fechas) */}
                <div className="appointment-modal__data-grid">
                  <div>
                    <p className="appointment-modal__data-label">Fecha de creación:</p>
                    <p className="appointment-modal__data-value">
                      {appointment.fecha_creacion ? format(parseISO(appointment.fecha_creacion), "d 'de' MMMM 'de' yyyy", { locale: es }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="appointment-modal__data-label">Última actualización:</p>
                    <p className="appointment-modal__data-value">
                      {appointment.fecha_actualizacion ? format(parseISO(appointment.fecha_actualizacion), "d 'de' MMMM 'de' yyyy", { locale: es }) : '-'}
                    </p>
                  </div>
                </div>

                {/* ============================
                    Sección de Decoradores
                ============================= */}
                <div className="appointment-modal__section appointment-modal__section--full" style={{ marginTop: 16 }}>
                  <h3 className="appointment-modal__section-title">Decoradores</h3>

                  {loadingDecorators ? (
                    <p style={{ padding: "8px 12px", opacity: 0.7 }}>Cargando decoradores...</p>
                  ) : (
                    <DecoratorsView
                      appointment={appointment}
                      userRole={userRole}
                      decoratorsList={decorators}     // ⭐ se los pasamos directamente
                      onDecoratorRemoved={(id) => {
                        // Eliminar de la UI
                        setDecorators(prev => prev.filter(d => d.id !== id));

                        if (typeof onDecoratorsChanged === 'function') {
                          onDecoratorsChanged();
                        }
                      }}
                    />
                  )}
                </div>

                {/* Botón Cerrar (en footer por si quieres) */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="appointment-modal__close-btn" onClick={onClose}>Cerrar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AppointmentDetailModal;