import React, { useEffect, useState } from 'react'
import { X, Users, Mail, Phone, UserCheck, UserX, Loader2 } from 'lucide-react'
import './AuxiliaresListModal.css'

const AuxiliaresListModal = ({ isOpen, onClose, veterinarioId, veterinarioNombre, fetchAuxiliares }) => {
  const [auxiliares, setAuxiliares] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && veterinarioId) {
      loadAuxiliares()
    }
  }, [isOpen, veterinarioId])

  const loadAuxiliares = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchAuxiliares(veterinarioId)
      if (response.success) {
        setAuxiliares(response.data.auxiliares || [])
      }
    } catch (err) {
      setError(err.message || 'Error al cargar auxiliares')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="auxiliares-modal-overlay" onClick={onClose}>
      <div className="auxiliares-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="auxiliares-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="auxiliares-modal-header">
          <div className="auxiliares-modal-icon">
            <Users size={32} />
          </div>
          <h2 className="auxiliares-modal-title">Auxiliares Asignados</h2>
          <p className="auxiliares-modal-subtitle">{veterinarioNombre}</p>
        </div>

        <div className="auxiliares-modal-content">
          {loading ? (
            <div className="auxiliares-loading">
              <Loader2 size={40} className="spinner" />
              <p>Cargando auxiliares...</p>
            </div>
          ) : error ? (
            <div className="auxiliares-error">
              <p>{error}</p>
              <button onClick={loadAuxiliares} className="btn-retry">
                Reintentar
              </button>
            </div>
          ) : auxiliares.length === 0 ? (
            <div className="auxiliares-empty">
              <Users size={48} />
              <p>No hay auxiliares asignados</p>
              <small>Este veterinario aún no tiene auxiliares a su cargo</small>
            </div>
          ) : (
            <div className="auxiliares-grid">
              {auxiliares.map((auxiliar, index) => (
                <div
                  key={auxiliar.id}
                  className={`auxiliar-item ${!auxiliar.activo ? 'auxiliar-item--inactive' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="auxiliar-avatar">
                    <Users size={28} />
                  </div>

                  <div className="auxiliar-info">
                    <div className="auxiliar-header">
                      <h3 className="auxiliar-name">{auxiliar.nombre}</h3>
                      <span className={`auxiliar-status ${auxiliar.activo ? 'active' : 'inactive'}`}>
                        {auxiliar.activo ? (
                          <>
                            <UserCheck size={14} />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <UserX size={14} />
                            <span>Inactivo</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="auxiliar-details">
                      <div className="auxiliar-detail-item">
                        <Mail size={14} />
                        <span>{auxiliar.correo}</span>
                      </div>
                      {auxiliar.telefono && (
                        <div className="auxiliar-detail-item">
                          <Phone size={14} />
                          <span>{auxiliar.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && auxiliares.length > 0 && (
          <div className="auxiliares-modal-footer">
            <p className="auxiliares-count">
              Total: <strong>{auxiliares.length}</strong> auxiliar{auxiliares.length !== 1 ? 'es' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuxiliaresListModal