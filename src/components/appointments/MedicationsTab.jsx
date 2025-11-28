import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import RegisterExitModal from '../Inventory/RegisterExitModal';
import {
  Pill,
  Search,
  AlertCircle,
  Package,
  ArrowDownCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import './MedicationsTab.css';

const MedicationsTab = ({ appointmentId, patientInfo }) => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar medicamentos al montar el componente
  useEffect(() => {
    loadMedications();
  }, []);

  // Filtrar medicamentos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMedications(medications);
    } else {
      const filtered = medications.filter(med =>
        med.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.principio_activo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedications(filtered);
    }
  }, [searchTerm, medications]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryService.getAllMedications();
      // Filtrar solo medicamentos activos con stock disponible
      const availableMeds = response.filter(med => med.activo && med.stock_actual > 0);
      setMedications(availableMeds);
      setFilteredMedications(availableMeds);
    } catch (err) {
      setError('Error al cargar los medicamentos');
      console.error('Error loading medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedication = (medication) => {
    setSelectedMedication(medication);
  };

  const handleOpenModal = () => {
    if (selectedMedication) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedMedication(null);
    loadMedications(); // Recargar la lista
  };

  const getStockStatusClass = (medication) => {
    if (medication.stock_actual <= 0) return 'stock-status--out';
    if (medication.stock_actual <= medication.stock_minimo) return 'stock-status--low';
    return 'stock-status--normal';
  };

  const getStockStatusText = (medication) => {
    if (medication.stock_actual <= 0) return 'Sin stock';
    if (medication.stock_actual <= medication.stock_minimo) return 'Stock bajo';
    return 'Disponible';
  };

  if (loading) {
    return (
      <div className="medications-tab">
        <div className="medications-tab__loading">
          <div className="medications-tab__spinner"></div>
          <p>Cargando medicamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medications-tab">
        <div className="medications-tab__error">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button
            onClick={loadMedications}
            className="medications-tab__retry-btn"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medications-tab">
      {/* Header con información del paciente */}
      <div className="medications-tab__header">
        <div className="medications-tab__patient-info">
          <Pill className="medications-tab__icon" size={24} />
          <div>
            <h3 className="medications-tab__title">Medicamentos e Insumos</h3>
            <p className="medications-tab__subtitle">
              Paciente: <strong>{patientInfo?.nombre}</strong> |
              Especie: <strong>{patientInfo?.especie}</strong> |
              Raza: <strong>{patientInfo?.raza}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="medications-tab__search-container">
        <div className="medications-tab__search-wrapper">
          <Search className="medications-tab__search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o principio activo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="medications-tab__search-input"
          />
        </div>
        {filteredMedications.length > 0 && (
          <p className="medications-tab__results-count">
            {filteredMedications.length} medicamento{filteredMedications.length !== 1 ? 's' : ''} disponible{filteredMedications.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Lista de medicamentos */}
      <div className="medications-tab__content">
        {filteredMedications.length === 0 ? (
          <div className="medications-tab__empty">
            <Package size={64} />
            <p className="medications-tab__empty-title">
              {searchTerm ? 'No se encontraron medicamentos' : 'No hay medicamentos disponibles'}
            </p>
            <p className="medications-tab__empty-text">
              {searchTerm
                ? 'Intenta con otro término de búsqueda'
                : 'Todos los medicamentos están sin stock o inactivos'}
            </p>
          </div>
        ) : (
          <div className="medications-tab__grid">
            {filteredMedications.map((medication) => (
              <div
                key={medication.id}
                className={`medication-card ${selectedMedication?.id === medication.id ? 'medication-card--selected' : ''}`}
                onClick={() => handleSelectMedication(medication)}
              >
                <div className="medication-card__header">
                  <div className="medication-card__icon-wrapper">
                    <Pill size={20} />
                  </div>
                  <div className={`medication-card__stock-badge ${getStockStatusClass(medication)}`}>
                    {getStockStatusText(medication)}
                  </div>
                </div>

                <div className="medication-card__body">
                  <h4 className="medication-card__name">{medication.nombre}</h4>
                  {medication.principio_activo && (
                    <p className="medication-card__active-ingredient">
                      {medication.principio_activo}
                    </p>
                  )}

                  <div className="medication-card__details">
                    <div className="medication-card__detail-item">
                      <span className="medication-card__detail-label">Stock:</span>
                      <span className="medication-card__detail-value">
                        {medication.stock_actual} {medication.unidad_medida}
                      </span>
                    </div>
                    {medication.lote && (
                      <div className="medication-card__detail-item">
                        <span className="medication-card__detail-label">Lote:</span>
                        <span className="medication-card__detail-value">
                          {medication.lote}
                        </span>
                      </div>
                    )}
                    {medication.fecha_vencimiento && (
                      <div className="medication-card__detail-item">
                        <span className="medication-card__detail-label">Vence:</span>
                        <span className="medication-card__detail-value">
                          {new Date(medication.fecha_vencimiento).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    )}
                  </div>

                  {medication.stock_actual <= medication.stock_minimo && medication.stock_actual > 0 && (
                    <div className="medication-card__warning">
                      <AlertTriangle size={16} />
                      <span>Stock bajo (mín: {medication.stock_minimo})</span>
                    </div>
                  )}
                </div>

                {selectedMedication?.id === medication.id && (
                  <div className="medication-card__selected-indicator">
                    <CheckCircle size={20} />
                    <span>Seleccionado</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de acción flotante */}
      {selectedMedication && (
        <div className="medications-tab__action-bar">
          <div className="medications-tab__action-info">
            <p className="medications-tab__action-label">Medicamento seleccionado:</p>
            <p className="medications-tab__action-name">{selectedMedication.nombre}</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="medications-tab__register-btn"
          >
            <ArrowDownCircle size={20} />
            Registrar Salida
          </button>
        </div>
      )}

      {/* Modal de registro de salida */}
      <RegisterExitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        medication={selectedMedication}
      />
    </div>
  );
};

export default MedicationsTab;