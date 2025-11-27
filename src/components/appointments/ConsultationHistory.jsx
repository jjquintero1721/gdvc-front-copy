import React, { useState } from 'react';
import { RotateCcw, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './ConsultationHistory.css';

/**
 * ConsultationHistory - Visualizador de historial de versiones
 *
 * Muestra todas las versiones anteriores de la consulta guardadas
 * mediante el patrón Memento. Permite restaurar versiones anteriores.
 *
 * @param {Array} history - Array de versiones (mementos)
 * @param {Number} currentVersion - Versión actual de la consulta
 * @param {Function} onRestore - Callback para restaurar una versión
 */
const ConsultationHistory = ({ history, currentVersion, onRestore }) => {
  const [expandedVersion, setExpandedVersion] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="consultation-history-empty">
        <Clock size={48} className="consultation-history-empty-icon" />
        <h3>Sin historial de versiones</h3>
        <p>Esta consulta aún no tiene versiones anteriores guardadas.</p>
      </div>
    );
  }

  /**
   * Expande/colapsa una versión
   */
  const toggleVersion = (version) => {
    setExpandedVersion(expandedVersion === version ? null : version);
  };

  /**
   * Maneja la restauración de una versión
   */
  const handleRestore = (version) => {
    const confirmRestore = window.confirm(
      `¿Estás seguro de que deseas restaurar la versión ${version}? Esto creará una nueva versión con estos datos.`
    );

    if (confirmRestore) {
      onRestore(version);
    }
  };

  // Ordenar versiones de más reciente a más antigua
  const sortedHistory = [...history].sort((a, b) => b.version - a.version);

  return (
    <div className="consultation-history">
      <div className="consultation-history-header">
        <h3 className="consultation-history-title">
          Historial de Versiones
        </h3>
        <p className="consultation-history-subtitle">
          Total de versiones: {history.length} | Versión actual: {currentVersion}
        </p>
      </div>

      <div className="consultation-history-timeline">
        {sortedHistory.map((memento, index) => (
          <VersionItem
            key={`${memento.version}-${index}`}
            memento={memento}
            isExpanded={expandedVersion === memento.version}
            isCurrent={memento.version === currentVersion}
            onToggle={() => toggleVersion(memento.version)}
            onRestore={() => handleRestore(memento.version)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * VersionItem - Item individual de versión en el historial
 */
const VersionItem = ({ memento, isExpanded, isCurrent, onToggle, onRestore }) => {
  const fechaCreacion = memento.fecha_creacion
    ? format(parseISO(memento.fecha_creacion), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
    : 'Fecha no disponible';

  return (
    <div className={`version-item ${isCurrent ? 'current' : ''}`}>
      {/* Header de la versión */}
      <div className="version-item-header" onClick={onToggle}>
        <div className="version-item-header-left">
          <div className="version-item-badge">
            v{memento.version}
            {isCurrent && <span className="version-item-current-tag">ACTUAL</span>}
          </div>
          <div className="version-item-info">
            <h4 className="version-item-title">
              {memento.descripcion_cambio || 'Sin descripción'}
            </h4>
            <div className="version-item-meta">
              <span className="version-item-meta-item">
                <Clock size={14} />
                {fechaCreacion}
              </span>
              {memento.creado_por_nombre && (
                <span className="version-item-meta-item">
                  <User size={14} />
                  {memento.creado_por_nombre}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="version-item-header-right">
          {!isCurrent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore();
              }}
              className="version-item-restore-btn"
              title="Restaurar esta versión"
            >
              <RotateCcw size={16} />
              Restaurar
            </button>
          )}
          <button className="version-item-toggle-btn">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Contenido expandido */}
      {isExpanded && memento.estado && (
        <div className="version-item-content">
          <div className="version-item-content-grid">
            {/* Motivo */}
            {memento.estado.motivo && (
              <div className="version-item-field">
                <label>Motivo de Consulta</label>
                <p>{memento.estado.motivo}</p>
              </div>
            )}

            {/* Anamnesis */}
            {memento.estado.anamnesis && (
              <div className="version-item-field">
                <label>Anamnesis</label>
                <p>{memento.estado.anamnesis}</p>
              </div>
            )}

            {/* Signos Vitales */}
            {memento.estado.signos_vitales && (
              <div className="version-item-field version-item-field--full">
                <label>Signos Vitales</label>
                <div className="version-item-vitals">
                  {memento.estado.signos_vitales.temperatura && (
                    <span>Temp: {memento.estado.signos_vitales.temperatura}°C</span>
                  )}
                  {memento.estado.signos_vitales.frecuencia_cardiaca && (
                    <span>FC: {memento.estado.signos_vitales.frecuencia_cardiaca} lpm</span>
                  )}
                  {memento.estado.signos_vitales.frecuencia_respiratoria && (
                    <span>FR: {memento.estado.signos_vitales.frecuencia_respiratoria} rpm</span>
                  )}
                  {memento.estado.signos_vitales.peso && (
                    <span>Peso: {memento.estado.signos_vitales.peso} kg</span>
                  )}
                  {memento.estado.signos_vitales.condicion_corporal && (
                    <span>CC: {memento.estado.signos_vitales.condicion_corporal}/9</span>
                  )}
                </div>
              </div>
            )}

            {/* Diagnóstico */}
            {memento.estado.diagnostico && (
              <div className="version-item-field">
                <label>Diagnóstico</label>
                <p>{memento.estado.diagnostico}</p>
              </div>
            )}

            {/* Tratamiento */}
            {memento.estado.tratamiento && (
              <div className="version-item-field">
                <label>Tratamiento</label>
                <p>{memento.estado.tratamiento}</p>
              </div>
            )}

            {/* Vacunas */}
            {memento.estado.vacunas && (
              <div className="version-item-field">
                <label>Vacunas Aplicadas</label>
                <p>{memento.estado.vacunas}</p>
              </div>
            )}

            {/* Observaciones */}
            {memento.estado.observaciones && (
              <div className="version-item-field">
                <label>Observaciones</label>
                <p>{memento.estado.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationHistory;