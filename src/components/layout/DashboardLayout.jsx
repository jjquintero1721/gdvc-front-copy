import Sidebar from './Sidebar'
import './DashboardLayout.css'

/**
 * Layout para el Dashboard
 * Incluye Sidebar y área de contenido principal
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja layout del dashboard
 * - Open/Closed: Flexible para agregar elementos sin modificar estructura
 */
function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-layout__content">
        <main className="dashboard-layout__main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout