import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import MedicationCard from '../../components/inventory/MedicationCard';
import CreateMedicationModal from '../../components/inventory/CreateMedicationModal';
import RegisterEntryModal from '../../components/inventory/RegisterEntryModal';
import InventoryReports from '../../components/inventory/InventoryReports';
import { Plus, AlertTriangle, Package, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './InventoryPage.css';

const InventoryPage = () => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para entrada desde purchase order
  const [isEntryFromPOModalOpen, setIsEntryFromPOModalOpen] = useState(false);
  const [selectedMedicationForPO, setSelectedMedicationForPO] = useState(null);

  useEffect(() => {
    loadMedications();
  }, []);

  useEffect(() => {
    // Filtrar medicamentos cuando cambie el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredMedications(medications);
    } else {
      const filtered = medications.filter(med =>
        med.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.laboratorio && med.laboratorio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMedications(filtered);
      setCurrentIndex(0); // Reset al inicio cuando se filtra
    }
  }, [searchTerm, medications]);

  const loadMedications = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await inventoryService.getAllMedications();

        // Aseguramos que sea SIEMPRE un array
        const meds = Array.isArray(response) ? response : response.data;

        setMedications(meds);
        setFilteredMedications(meds);
      } catch (err) {
        setError('Error al cargar los medicamentos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };


  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    loadMedications();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredMedications.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < filteredMedications.length - 1 ? prev + 1 : 0));
  };

  const handleEntryFromPurchaseOrder = (medication) => {
    setSelectedMedicationForPO(medication);
    setIsEntryFromPOModalOpen(true);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Calcular medicamentos visibles en el carrusel
  const visibleMedications = filteredMedications.slice(currentIndex, currentIndex + 3);
  if (visibleMedications.length < 3 && filteredMedications.length >= 3) {
    visibleMedications.push(...filteredMedications.slice(0, 3 - visibleMedications.length));
  }

  return (
    <div className="inventory-page">
      <div className="inventory-page__container">
        {/* Header */}
        <div className="inventory-page__header">
          <div className="inventory-page__header-top">
            <div className="inventory-page__title-wrapper">
              <h1 className="inventory-page__title">
                Inventario de Medicamentos
              </h1>
              <p className="inventory-page__subtitle">
                Gestiona el stock de medicamentos, vacunas y suministros veterinarios
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inventory-page__add-button"
            >
              <Plus size={20} />
              Agregar Medicamento
            </button>
          </div>

          {/* Search Bar */}
          <div className="inventory-page__search-wrapper">
            <Search className="inventory-page__search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar medicamentos por nombre, tipo o laboratorio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inventory-page__search-input"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="inventory-page__search-clear"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {searchTerm && (
            <p className="inventory-page__search-results">
              {filteredMedications.length} {filteredMedications.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          )}
        </div>

        {/* Medications Carousel */}
        <div className="inventory-page__carousel-section">
          {loading ? (
            <div className="inventory-page__loading">
              <div className="inventory-page__spinner"></div>
            </div>
          ) : error ? (
            <div className="inventory-page__error">
              <div className="inventory-page__error-content">
                <AlertTriangle className="inventory-page__error-icon" size={24} />
                <p className="inventory-page__error-text">{error}</p>
              </div>
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="inventory-page__empty">
              <Package className="inventory-page__empty-icon" size={64} />
              <h3 className="inventory-page__empty-title">
                {searchTerm ? 'No se encontraron medicamentos' : 'No hay medicamentos registrados'}
              </h3>
              <p className="inventory-page__empty-text">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza agregando tu primer medicamento al inventario'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inventory-page__empty-button"
                >
                  <Plus size={20} />
                  Agregar Medicamento
                </button>
              )}
            </div>
          ) : (
            <div className="inventory-page__carousel-container">
              {/* Navigation Buttons */}
              {filteredMedications.length > 3 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="inventory-page__carousel-nav inventory-page__carousel-nav--prev"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="inventory-page__carousel-nav-icon" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="inventory-page__carousel-nav inventory-page__carousel-nav--next"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="inventory-page__carousel-nav-icon" />
                  </button>
                </>
              )}

              {/* Cards Container */}
              <div className="inventory-page__carousel-grid">
                {visibleMedications.map((medication) => (
                  <MedicationCard
                    key={medication.id}
                    medication={medication}
                    onUpdate={loadMedications}
                  />
                ))}
              </div>

              {/* Indicators */}
              {filteredMedications.length > 3 && (
                <div className="inventory-page__carousel-indicators">
                  {Array.from({ length: Math.ceil(filteredMedications.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index * 3)}
                      className={`inventory-page__carousel-indicator ${
                        Math.floor(currentIndex / 3) === index
                          ? 'inventory-page__carousel-indicator--active'
                          : ''
                      }`}
                      aria-label={`Ir a página ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="inventory-page__reports-section">
          <div className="inventory-page__reports-header">
            <h2 className="inventory-page__reports-title">Reportes y Alertas</h2>
            <p className="inventory-page__reports-subtitle">
              Monitorea el estado del inventario y gestiona alertas automáticas
            </p>
          </div>
          <InventoryReports onEntryFromPurchaseOrder={handleEntryFromPurchaseOrder} />
        </div>
      </div>

      {/* Modals */}
      <CreateMedicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal de entrada desde Purchase Order */}
      {selectedMedicationForPO && (
        <RegisterEntryModal
          isOpen={isEntryFromPOModalOpen}
          onClose={() => {
            setIsEntryFromPOModalOpen(false);
            setSelectedMedicationForPO(null);
          }}
          onSuccess={() => {
            setIsEntryFromPOModalOpen(false);
            setSelectedMedicationForPO(null);
            loadMedications();
          }}
          medication={selectedMedicationForPO}
        />
      )}
    </div>
  );
};

export default InventoryPage;