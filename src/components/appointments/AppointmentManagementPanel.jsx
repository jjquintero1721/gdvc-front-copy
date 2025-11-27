import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Edit, History, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import ConsultationForm from './ConsultationForm';
import ConsultationHistory from './ConsultationHistory';
import FollowUpForm from './FollowUpForm';
import consultationService from '@/services/consultationService';
import followUpService from '@/services/followUpService';
import appointmentService from '@/services/appointmentService';
import './AppointmentManagementPanel.css';

/**
 * AppointmentManagementPanel - Panel principal de gestión de citas
 * ✅ VERSIÓN CORREGIDA
 *
 * Este componente se abre cuando el veterinario inicia una cita (/start)
 * y permite gestionar todo el ciclo de vida de la consulta:
 *
 * - Crear la primera consulta
 * - Editar consulta existente
 * - Ver/restaurar versiones anteriores
 * - Crear seguimientos
 * - Completar la cita
 *
 * @param {Object} appointment - Cita actual
 * @param {Boolean} isOpen - Estado de apertura del panel
 * @param {Function} onClose - Callback al cerrar (sin completar)
 * @param {Function} onComplete - Callback al completar la cita
 */
const AppointmentManagementPanel = ({ appointment, isOpen, onClose, onComplete }) => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('consultation'); // consultation | history | followup
  const [consultation, setConsultation] = useState(null);
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar datos cuando se abre el panel
  useEffect(() => {
    if (isOpen && appointment) {
      loadConsultationData();
    }
  }, [isOpen, appointment]);

  /**
   * Carga todos los datos relacionados con la cita
   */
  const loadConsultationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar si ya existe una consulta para esta cita
      const consultationResponse = await consultationService.getConsultationByAppointment(appointment.id);

      if (consultationResponse.success && consultationResponse.data) {
        const consultationData = consultationResponse.data;
        setConsultation(consultationData);

        // Cargar historial de versiones
        const historyResponse = await consultationService.getConsultationHistory(consultationData.id);
        if (historyResponse.success) {
          setConsultationHistory(historyResponse.data || []);
        }

        // Cargar seguimientos
        const followUpResponse = await followUpService.getConsultationFollowUps(consultationData.id);
        if (followUpResponse.success) {
          setFollowUps(followUpResponse.data.seguimientos || []);
        }
      }
    } catch (err) {
      console.error('Error al cargar datos de consulta:', err);
      // No mostrar error si simplemente no existe la consulta aún
      if (!err.message?.includes('404')) {
        setError('Error al cargar los datos de la consulta');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Maneja la creación de una nueva consulta - VERSIÓN CORREGIDA
   */
  const handleCreateConsultation = async (consultationData) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Validar que existan los datos necesarios
      if (!appointment.mascota?.historia_clinica_id) {
        throw new Error('La mascota no tiene una historia clínica asociada');
      }

      if (!appointment.veterinario_id) {
        throw new Error('No hay veterinario asignado a esta cita');
      }

      // ✅ Construir payload con TODOS los campos obligatorios
      const payload = {
        // Campos obligatorios del schema
        historia_clinica_id: appointment.mascota.historia_clinica_id,
        veterinario_id: appointment.veterinario_id,
        motivo: consultationData.motivo.trim(),
        diagnostico: consultationData.diagnostico.trim(),
        tratamiento: consultationData.tratamiento.trim(),

        // Campos opcionales
        cita_id: appointment.id,
        anamnesis: consultationData.anamnesis?.trim() || null,
        signos_vitales: consultationData.signos_vitales || null,
        vacunas: consultationData.vacunas?.trim() || null,
        observaciones: consultationData.observaciones?.trim() || null
      };

      // ✅ Validar longitudes antes de enviar
      if (payload.motivo.length < 5) {
        throw new Error('El motivo debe tener al menos 5 caracteres');
      }
      if (payload.motivo.length > 300) {
        throw new Error('El motivo no puede exceder 300 caracteres');
      }
      if (payload.diagnostico.length < 10) {
        throw new Error('El diagnóstico debe tener al menos 10 caracteres');
      }
      if (payload.tratamiento.length < 5) {
        throw new Error('El tratamiento debe tener al menos 5 caracteres');
      }

      console.log('📤 Enviando consulta al backend:', payload);

      const response = await consultationService.createConsultation(payload);

      if (response.success) {
        setConsultation(response.data);
        setSuccess('✅ Consulta creada exitosamente');
        await loadConsultationData();
      } else {
        throw new Error(response.message || 'Error al crear la consulta');
      }
    } catch (err) {
      console.error('❌ Error al crear consulta:', err);
      setError(err.message || 'Error al crear la consulta');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Maneja la actualización de la consulta - VERSIÓN CORREGIDA
   */
  const handleUpdateConsultation = async (consultationData) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Construir payload para actualización
      const payload = {
        motivo: consultationData.motivo?.trim() || null,
        diagnostico: consultationData.diagnostico?.trim() || null,
        tratamiento: consultationData.tratamiento?.trim() || null,
        anamnesis: consultationData.anamnesis?.trim() || null,
        signos_vitales: consultationData.signos_vitales || null,
        vacunas: consultationData.vacunas?.trim() || null,
        observaciones: consultationData.observaciones?.trim() || null,
        descripcion_cambio: consultationData.descripcion_cambio?.trim() || null
      };

      // ✅ Validar longitudes si los campos están presentes
      if (payload.motivo && payload.motivo.length < 5) {
        throw new Error('El motivo debe tener al menos 5 caracteres');
      }
      if (payload.motivo && payload.motivo.length > 300) {
        throw new Error('El motivo no puede exceder 300 caracteres');
      }
      if (payload.diagnostico && payload.diagnostico.length < 10) {
        throw new Error('El diagnóstico debe tener al menos 10 caracteres');
      }
      if (payload.tratamiento && payload.tratamiento.length < 5) {
        throw new Error('El tratamiento debe tener al menos 5 caracteres');
      }

      console.log('📤 Actualizando consulta:', payload);

      const response = await consultationService.updateConsultation(
        consultation.id,
        payload
      );

      if (response.success) {
        setConsultation(response.data);
        setSuccess('✅ Consulta actualizada exitosamente');
        await loadConsultationData();
      } else {
        throw new Error(response.message || 'Error al actualizar la consulta');
      }
    } catch (err) {
      console.error('❌ Error al actualizar consulta:', err);
      setError(err.message || 'Error al actualizar la consulta');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la restauración de una versión anterior
   */
  const handleRestoreVersion = async (version) => {
    try {
      setLoading(true);
      setError(null);

      const response = await consultationService.restoreConsultationVersion(
        consultation.id,
        version
      );

      if (response.success) {
        setConsultation(response.data);
        setSuccess(`✅ Consulta restaurada a la versión ${version}`);
        await loadConsultationData();
        setActiveTab('consultation');
      } else {
        throw new Error(response.message || 'Error al restaurar la versión');
      }
    } catch (err) {
      console.error('❌ Error al restaurar versión:', err);
      setError(err.message || 'Error al restaurar la versión');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la creación de un seguimiento
   */
  const handleCreateFollowUp = async (followUpData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await followUpService.createFollowUp(
        consultation.id,
        {
          ...followUpData,
          consulta_origen_id: consultation.id
        }
      );

      if (response.success) {
        setSuccess('✅ Seguimiento creado exitosamente');
        await loadConsultationData();
        setActiveTab('consultation');
      } else {
        throw new Error(response.message || 'Error al crear el seguimiento');
      }
    } catch (err) {
      console.error('❌ Error al crear seguimiento:', err);
      setError(err.message || 'Error al crear el seguimiento');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Completa la cita
   */
  const handleCompleteAppointment = async () => {
    if (!consultation) {
      setError('⚠️ Debes crear una consulta antes de completar la cita');
      return;
    }

    const confirmComplete = window.confirm(
      '¿Estás seguro de que deseas completar esta cita?\n\nEsta acción cambiará el estado de la cita a "Completada" y no se podrá deshacer.'
    );

    if (!confirmComplete) return;

    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.completeAppointment(appointment.id);

      if (response.success) {
        setSuccess('✅ Cita completada exitosamente');
        setTimeout(() => {
          onComplete?.();
        }, 1500);
      } else {
        throw new Error(response.message || 'Error al completar la cita');
      }
    } catch (err) {
      console.error('❌ Error al completar cita:', err);
      setError(err.message || 'Error al completar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Auto-ocultar mensajes de éxito después de 5 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="appointment-panel-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="appointment-panel-container"
        >
          {/* Header */}
          <div className="appointment-panel-header">
            <div>
              <h2 className="appointment-panel-title">
                Gestión de Cita - {appointment.mascota?.nombre}
              </h2>
              <p className="appointment-panel-subtitle">
                Propietario: {appointment.propietario?.nombre} | Fecha: {new Date(appointment.fecha_hora).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="appointment-panel-close-btn"
              aria-label="Cerrar panel"
            >
              <X size={24} />
            </button>
          </div>

          {/* Alertas */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="appointment-panel-alert appointment-panel-alert--error"
            >
              <AlertCircle size={20} />
              <span>{error}</span>
              <button onClick={() => setError(null)} aria-label="Cerrar alerta">×</button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="appointment-panel-alert appointment-panel-alert--success"
            >
              <CheckCircle size={20} />
              <span>{success}</span>
              <button onClick={() => setSuccess(null)} aria-label="Cerrar alerta">×</button>
            </motion.div>
          )}

          {/* Tabs de navegación */}
          <div className="appointment-panel-tabs">
            <button
              className={`appointment-panel-tab ${activeTab === 'consultation' ? 'active' : ''}`}
              onClick={() => setActiveTab('consultation')}
            >
              <FileText size={18} />
              <span>{consultation ? 'Editar Consulta' : 'Crear Consulta'}</span>
            </button>

            {consultation && (
              <>
                <button
                  className={`appointment-panel-tab ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <History size={18} />
                  <span>Historial ({consultationHistory.length})</span>
                </button>

                <button
                  className={`appointment-panel-tab ${activeTab === 'followup' ? 'active' : ''}`}
                  onClick={() => setActiveTab('followup')}
                >
                  <Plus size={18} />
                  <span>Seguimiento ({followUps.length})</span>
                </button>
              </>
            )}
          </div>

          {/* Contenido según tab activo */}
          <div className="appointment-panel-content">
            {loading && (
              <div className="appointment-panel-loading">
                <div className="spinner"></div>
                <p>Cargando...</p>
              </div>
            )}

            {!loading && activeTab === 'consultation' && (
              <ConsultationForm
                consultation={consultation}
                appointment={appointment}
                onSubmit={consultation ? handleUpdateConsultation : handleCreateConsultation}
              />
            )}

            {!loading && activeTab === 'history' && consultation && (
              <ConsultationHistory
                history={consultationHistory}
                currentVersion={consultation.version}
                onRestore={handleRestoreVersion}
              />
            )}

            {!loading && activeTab === 'followup' && consultation && (
              <FollowUpForm
                consultation={consultation}
                existingFollowUps={followUps}
                onSubmit={handleCreateFollowUp}
              />
            )}
          </div>

          {/* Footer con acciones */}
          <div className="appointment-panel-footer">
            <button
              onClick={onClose}
              className="appointment-panel-btn appointment-panel-btn--secondary"
            >
              Cerrar sin Completar
            </button>

            <button
              onClick={handleCompleteAppointment}
              disabled={!consultation || loading}
              className="appointment-panel-btn appointment-panel-btn--primary"
              title={!consultation ? 'Debes crear una consulta primero' : 'Completar y cerrar la cita'}
            >
              <CheckCircle size={18} />
              Completar Cita
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppointmentManagementPanel;