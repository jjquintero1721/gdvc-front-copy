import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import MedicationCard from '../../components/inventory/MedicationCard';
import CreateMedicationModal from '../../components/inventory/CreateMedicationModal';
import RegisterEntryModal from '../../components/inventory/RegisterEntryModal';
import InventoryReports from '../../components/inventory/InventoryReports';
import { Plus, AlertTriangle, Package, Search, X } from 'lucide-react';

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
      const data = await inventoryService.getAllMedications();
      setMedications(data);
      setFilteredMedications(data);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Inventario de Medicamentos
            </h1>
            <p className="text-gray-600">
              Gestiona el stock de medicamentos, vacunas y suministros veterinarios
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Agregar Medicamento
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar medicamentos por nombre, tipo o laboratorio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            {filteredMedications.length} {filteredMedications.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        )}
      </div>

      {/* Medications Carousel */}
      <div className="max-w-7xl mx-auto mb-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No se encontraron medicamentos' : 'No hay medicamentos registrados'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer medicamento al inventario'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Agregar Medicamento
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Buttons */}
            {filteredMedications.length > 3 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all z-10 hover:bg-gray-50"
                  aria-label="Anterior"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all z-10 hover:bg-gray-50"
                  aria-label="Siguiente"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(filteredMedications.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index * 3)}
                    className={`h-2 rounded-full transition-all ${
                      Math.floor(currentIndex / 3) === index
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reportes y Alertas</h2>
          <p className="text-gray-600">
            Monitorea el estado del inventario y gestiona alertas automáticas
          </p>
        </div>
        <InventoryReports onEntryFromPurchaseOrder={handleEntryFromPurchaseOrder} />
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