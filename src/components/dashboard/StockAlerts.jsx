import { CheckIcon } from '@/assets/icons/DashboardIcons'
import './DashboardSections.css'

/**
 * StockAlerts - MEJORADO
 * Muestra alertas de stock bajo con diseño profesional
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja alertas de inventario
 */
function StockAlerts() {
  // Datos mock - Estos vendrán de la API en producción
  const mockStockAlerts = []

  return (
    <div className="stock-alerts">
      <div className="stock-alerts__header">
        <h3 className="stock-alerts__title">
          Stock Bajo
          <span className="stock-alerts__count">
            {mockStockAlerts.length}
          </span>
        </h3>
      </div>

      {mockStockAlerts.length === 0 ? (
        <div className="stock-alerts__empty">
          <CheckIcon className="stock-alerts__empty-icon" />
          <p className="stock-alerts__empty-text">
            No hay alertas de stock bajo
          </p>
        </div>
      ) : (
        <div className="stock-alerts__items">
          {mockStockAlerts.map((item, index) => (
            <div key={index} className="stock-alert-item">
              {/* Aquí irá el contenido de cada alerta de stock */}
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StockAlerts