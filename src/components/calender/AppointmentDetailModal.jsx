import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AppointmentDetailModal = ({ isOpen, onClose, appointment }) => {
  if (!appointment) return null;

  // Formatear fecha y hora
  const fechaHora = parseISO(appointment.fecha_hora);
  const fechaFormateada = format(fechaHora, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const horaFormateada = format(fechaHora, 'h:mm a', { locale: es });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Detalle de Cita</h2>
                    <p className="text-blue-100">{fechaFormateada}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Información principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Mascota */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Mascota</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-semibold text-gray-900">
                          {appointment.mascota?.nombre || 'No especificado'}
                        </span>
                      </div>
                      {appointment.mascota?.tipo && (
                        <p className="text-sm text-gray-600 ml-7">
                          Tipo: {appointment.mascota.tipo}
                        </p>
                      )}
                      {appointment.mascota?.raza && (
                        <p className="text-sm text-gray-600 ml-7">
                          Raza: {appointment.mascota.raza}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Veterinario */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Veterinario</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-semibold text-gray-900">
                          Dr. {appointment.veterinario?.nombre} {appointment.veterinario?.apellido}
                        </span>
                      </div>
                      {appointment.veterinario?.especialidad && (
                        <p className="text-sm text-gray-600 ml-7">
                          {appointment.veterinario.especialidad}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Horario y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Horario</h3>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg font-semibold text-gray-900">{horaFormateada}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Estado</h3>
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${appointment.estado === 'confirmada' ? 'bg-green-200 text-green-800' : ''}
                      ${appointment.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' : ''}
                      ${appointment.estado === 'cancelada' ? 'bg-red-200 text-red-800' : ''}
                      ${appointment.estado === 'completada' ? 'bg-blue-200 text-blue-800' : ''}
                    `}>
                      {appointment.estado?.charAt(0).toUpperCase() + appointment.estado?.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Servicio */}
                {appointment.servicio && (
                  <div className="bg-purple-50 rounded-xl p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Servicio</h3>
                    <p className="text-gray-900 font-medium">{appointment.servicio.nombre || 'No especificado'}</p>
                    {appointment.servicio.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">{appointment.servicio.descripcion}</p>
                    )}
                  </div>
                )}

                {/* Motivo */}
                {appointment.motivo && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Motivo de la consulta</h3>
                    <p className="text-gray-900">{appointment.motivo}</p>
                  </div>
                )}

                {/* Notas */}
                {appointment.notas && appointment.notas.trim() !== '' && (
                  <div className="bg-amber-50 rounded-xl p-4 mb-6 border-l-4 border-amber-400">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-semibold text-amber-900 uppercase mb-1">Notas adicionales</h3>
                        <p className="text-gray-700">{appointment.notas}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Fecha de creación:</span>
                    <p>{format(parseISO(appointment.fecha_creacion), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                  </div>
                  {appointment.fecha_actualizacion && (
                    <div>
                      <span className="font-medium">Última actualización:</span>
                      <p>{format(parseISO(appointment.fecha_actualizacion), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    </div>
                  )}
                </div>

                {/* Advertencia de cancelación tardía */}
                {appointment.cancelacion_tardia && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                    <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-orange-900">Cancelación tardía</p>
                      <p className="text-sm text-orange-700">Esta cita fue cancelada con poco tiempo de anticipación.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con botones de acción */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cerrar
                </button>
                {/* Aquí podrías agregar botones para editar o cancelar la cita si fuera necesario */}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetailModal;