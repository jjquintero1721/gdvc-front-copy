import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import MedicationCard from '../../components/inventory/MedicationCard';
import CreateMedicationModal from '../../components/inventory/CreateMedicationModal';
import { Plus, AlertTriangle, Package, TrendingDown } from 'lucide-react';

const InventoryPage = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getAllMedications();
      setMedications(data);
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
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : medications.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < medications.length - 1 ? prev + 1 : 0));
  };

  const visibleMedications = medications.slice(currentIndex, currentIndex + 3);
  if (visibleMedications.length < 3 && medications.length >= 3) {
    visibleMedications.push(...medications.slice(0, 3 - visibleMedications.length));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
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
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span className="font-semibold">Nuevo Medicamento</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Medicamentos</p>
                <p className="text-3xl font-bold text-gray-800">{medications.length}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <Package className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Stock Bajo</p>
                <p className="text-3xl font-bold text-gray-800">-</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-full">
                <TrendingDown className="text-yellow-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Vencidos</p>
                <p className="text-3xl font-bold text-gray-800">-</p>
              </div>
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="text-red-600" size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medications Carousel */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Medicamentos Disponibles</h2>

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
        ) : medications.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay medicamentos registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando tu primer medicamento al inventario
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Agregar Medicamento
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Buttons */}
            {medications.length > 3 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all z-10 hover:bg-gray-50"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all z-10 hover:bg-gray-50"
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
            {medications.length > 3 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(medications.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index * 3)}
                    className={`h-2 rounded-full transition-all ${
                      Math.floor(currentIndex / 3) === index
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reports Section - Placeholder for Phase 4 */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes y Alertas</h2>
        <div className="bg-white rounded-xl p-8 shadow-lg text-center border-2 border-dashed border-gray-300">
          <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Los reportes se mostrarán aquí (Fase 4)</p>
        </div>
      </div>

      {/* Create Medication Modal */}
      {isCreateModalOpen && (
        <CreateMedicationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default InventoryPage;