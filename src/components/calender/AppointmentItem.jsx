import React from 'react';
import { motion } from 'framer-motion';

const AppointmentItem = ({ appointment, isCurrentUser, onClick }) => {
  // Determinar el estado de la cita
  const getStatusBadge = (estado) => {
    const statusStyles = {
      confirmada: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      cancelada: 'bg-red-100 text-red-800',
      completada: 'bg-blue-100 text-blue-800',
    };

    const statusLabels = {
      confirmada: 'Confirmada',
      pendiente: 'Pendiente',
      cancelada: 'Cancelada',
      completada: 'Completada',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[estado] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[estado] || estado}
      </span>
    );
  };

  // Detectar decoradores (si existen en el appointment)
  const hasNote = appointment.notas && appointment.notas.trim() !== '';
  const hasReminder = appointment.recordatorio; // Asume que existe este campo
  const hasPriority = appointment.prioridad; // Asume que existe este campo

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isCurrentUser 
          ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400' 
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Título con mascota */}
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-gray-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h4 className="font-semibold text-gray-900 truncate">
              {appointment.mascota?.nombre || 'Mascota no especificada'}
              {appointment.mascota?.tipo && (
                <span className="text-gray-500 font-normal text-sm ml-1">
                  ({appointment.mascota.tipo})
                </span>
              )}
            </h4>
          </div>

          {/* Veterinario */}
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-4 h-4 text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm text-gray-700">
              Dr. {appointment.veterinario?.apellido || 'No asignado'}
              {isCurrentUser && (
                <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                  Tú
                </span>
              )}
            </span>
          </div>

          {/* Motivo */}
          {appointment.motivo && (
            <p className="text-sm text-gray-600 truncate mt-1">
              {appointment.motivo}
            </p>
          )}

          {/* Decoradores (Iconos) */}
          <div className="flex items-center gap-2 mt-2">
            {hasNote && (
              <div
                className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded"
                title="Tiene notas"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>Notas</span>
              </div>
            )}

            {hasReminder && (
              <div
                className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded"
                title="Tiene recordatorio"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <span>Recordatorio</span>
              </div>
            )}

            {hasPriority && (
              <div
                className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded"
                title="Prioridad alta"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
                <span>Prioridad</span>
              </div>
            )}
          </div>
        </div>

        {/* Estado */}
        <div className="flex-shrink-0">
          {getStatusBadge(appointment.estado)}
        </div>
      </div>

      {/* Indicador de cancelación tardía */}
      {appointment.cancelacion_tardia && (
        <div className="mt-2 flex items-center gap-1 text-xs text-orange-700">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Cancelación tardía</span>
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentItem;