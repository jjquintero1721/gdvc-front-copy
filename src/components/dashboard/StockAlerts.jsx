import './StockAlerts.css'

/**
 * Componente StockAlerts
 * Muestra alertas de stock bajo en inventario
 *
 * Datos mock por ahora - En producción se conectarán a endpoints reales
 *
 * Principios SOLID:
 * - Single Responsibility: Solo renderiza alertas de stock
 */
function StockAlerts() {
  // Datos mock - Estos vendrán de la API en producción
  const mockAlerts = []

  if (mockAlerts.length === 0) {
    return (
      <div className="stock-alerts">
        <h3 className="stock-alerts__title">Stock Bajo</h3>
        <div className="stock-alerts__empty">
          <p>No hay alertas de stock bajo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stock-alerts">
      <h3 className="stock-alerts__title">Stock Bajo</h3>

      <div className="stock-alerts__content">
        {mockAlerts.map((alert, index) => (
          <div key={index} className="stock-alerts__item">
            <div className="stock-alerts__icon">⚠️</div>
            <div className="stock-alerts__info">
              <h4 className="stock-alerts__product-name">{alert.productName}</h4>
              <p className="stock-alerts__quantity">
                Stock actual: <strong>{alert.currentStock}</strong>
              </p>
              <p className="stock-alerts__min">
                Stock mínimo: {alert.minStock}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StockAlerts