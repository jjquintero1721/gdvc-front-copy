import { useState, useEffect } from 'react'
import dashboardService from '@/services/dashboardService'
import './DashboardSections.css'

/**
 * StockAlerts - CON DATOS REALES
 * Muestra las alertas de stock bajo desde el backend
 */
function StockAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await dashboardService.getStats()

      // Obtener las alertas de stock
      const alertasStock = data.stats?.alertasStock || []
      setAlerts(alertasStock)

    } catch (err) {
      console.error('❌ Error al cargar alertas de stock:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">
          Stock Bajo
          <span className="badge badge-warning">{alerts.length}</span>
        </h2>
      </div>

      <div className="section-content">
        {loading ? (
          <div className="section-loading">
            <div className="spinner-small"></div>
            <p>Cargando alertas...</p>
          </div>
        ) : error ? (
          <div className="section-error">
            <p>⚠️ {error}</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="section-empty">
            <div className="empty-icon">✓</div>
            <p className="empty-message">No hay alertas de stock bajo</p>
          </div>
        ) : (
          <div className="stock-alerts-container">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`stock-alert-item ${alert.requiere_accion_inmediata ? 'critical' : 'warning'}`}
              >
                <div className="stock-alert-icon">
                  {alert.requiere_accion_inmediata ? '🚨' : '⚠️'}
                </div>
                <div className="stock-alert-info">
                  <p className="stock-alert-name">{alert.medicamento}</p>
                  <p className="stock-alert-quantity">
                    Stock actual: <strong>{alert.stock_actual}</strong> / Mínimo: <strong>{alert.stock_minimo}</strong>
                  </p>
                </div>
                {alert.requiere_accion_inmediata && (
                  <div className="stock-alert-badge">
                    <span className="badge badge-danger">Crítico</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StockAlerts