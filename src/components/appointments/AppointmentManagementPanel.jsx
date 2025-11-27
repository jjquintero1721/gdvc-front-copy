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
   * Maneja la creación de una nueva consulta
   */
  const handleCreateConsultation = async (consultationData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await consultationService.createConsultation({
        ...consultationData,
        cita_id: appointment.id,
        historia_clinica_id: appointment.mascota.historia_clinica_id,
        veterinario_id: appointment.veterinario_id
      });

      if (response.success) {
        setConsultation(response.data);
        setSuccess('Consulta creada exitosamente');
        await loadConsultationData();
      }
    } catch (err) {
      console.error('Error al crear consulta:', err);
      setError(err.message || 'Error al crear la consulta');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la actualización de la consulta
   */
  const handleUpdateConsultation = async (consultationData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await consultationService.updateConsultation(
        consultation.id,
        consultationData
      );

      if (response.success) {
        setConsultation(response.data);
        setSuccess('Consulta actualizada exitosamente');
        await loadConsultationData();
      }
    } catch (err) {
      console.error('Error al actualizar consulta:', err);
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
        setSuccess(`Consulta restaurada a la versión ${version}`);
        await loadConsultationData();
        setActiveTab('consultation');
      }
    } catch (err) {
      console.error('Error al restaurar versión:', err);
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
        setSuccess('Seguimiento creado exitosamente');
        await loadConsultationData();
        setActiveTab('consultation');
      }
    } catch (err) {
      console.error('Error al crear seguimiento:', err);
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
      setError('Debes crear una consulta antes de completar la cita');
      return;
    }

    const confirmComplete = window.confirm(
      '¿Estás seguro de que deseas completar esta cita? Esta acción no se puede deshacer.'
    );

    if (!confirmComplete) return;

    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.completeAppointment(appointment.id);

      if (response.success) {
        setSuccess('Cita completada exitosamente');
        setTimeout(() => {
          onComplete?.();
        }, 1500);
      }
    } catch (err) {
      console.error('Error al completar cita:', err);
      setError(err.message || 'Error al completar la cita');
    } finally {
      setLoading(false);
    }
  };

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
                Propietario: {appointment.propietario?.nombre} | Fecha: {new Date(appointment.fecha_hora).toLocaleDateString()}
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
            <div className="appointment-panel-alert appointment-panel-alert--error">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {success && (
            <div className="appointment-panel-alert appointment-panel-alert--success">
              <CheckCircle size={20} />
              <span>{success}</span>
              <button onClick={() => setSuccess(null)}>×</button>
            </div>
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