/**
 * Layout para el Dashboard
 * TODO: Implementar en futuras fases con sidebar, header, etc.
 */
function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>GDCV - Dashboard</h1>
      </header>
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout