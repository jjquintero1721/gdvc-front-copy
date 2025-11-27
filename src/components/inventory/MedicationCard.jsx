import React, { useState } from 'react';
import { Pill, AlertCircle, Snowflake, MapPin, Calendar, DollarSign, Package, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';
import UpdateMedicationModal from './UpdateMedicationModal';
import RegisterEntryModal from './RegisterEntryModal';
import RegisterExitModal from './RegisterExitModal';
import MedicationHistoryModal from './MedicationHistoryModal';
import DeactivateMedicationModal from './DesactivateMedicationModal.jsx';

const MedicationCard = ({ medication, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);

  // Estados para los modales
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const isLowStock = medication.stock_actual <= medication.stock_minimo;

  const isExpiringSoon = () => {
    if (!medication.fecha_vencimiento) return false;
    const expiryDate = new Date(medication.fecha_vencimiento);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  };

  const isExpired = () => {
    if (!medication.fecha_vencimiento) return false;
    const expiryDate = new Date(medication.fecha_vencimiento);
    const today = new Date();
    return expiryDate < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockColor = () => {
    if (isExpired()) return 'text-red-600 bg-red-50';
    if (isLowStock) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockBadge = () => {
    if (isExpired()) return { text: 'Vencido', color: 'bg-red-500' };
    if (isLowStock) return { text: 'Stock Bajo', color: 'bg-orange-500' };
    return { text: 'Stock OK', color: 'bg-green-500' };
  };

  const badge = getStockBadge();

  const handleModalSuccess = () => {
    onUpdate(); // Recargar la lista de medicamentos
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Header with Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <Pill size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">
                  {medication.nombre}
                </h3>
                <p className="text-sm text-gray-600 capitalize">{medication.tipo}</p>
              </div>
            </div>
            <span className={`${badge.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
              {badge.text}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Stock Info */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${getStockColor()}`}>
            <div className="flex items-center gap-2">
              <Package size={18} className="flex-shrink-0" />
              <div>
                <p className="text-xs font-medium mb-0.5">Stock Actual</p>
                <p className="text-2xl font-bold">{medication.stock_actual}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs mb-0.5">Unidad</p>
              <p className="text-sm font-semibold capitalize">{medication.unidad_medida}</p>
            </div>
          </div>

          {/* Stock Limits */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Mínimo</p>
              <p className="text-sm font-semibold text-gray-800">{medication.stock_minimo}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Máximo</p>
              <p className="text-sm font-semibold text-gray-800">{medication.stock_maximo}</p>
            </div>
          </div>

          {/* Price Info */}
          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Precio Venta</p>
                <p className="text-sm font-bold text-green-700">{formatCurrency(medication.precio_venta)}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
              <Calendar size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Vencimiento</p>
                <p className={`text-sm font-medium ${isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-yellow-600' : 'text-gray-800'}`}>
                  {formatDate(medication.fecha_vencimiento)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">Ubicación</p>
              <p className="text-sm font-medium text-gray-800">{medication.ubicacion || 'No especificada'}</p>
            </div>
          </div>

          {medication.laboratorio && (
            <div className="text-sm">
              <p className="text-xs text-gray-600">Laboratorio</p>
              <p className="font-medium text-gray-800">{medication.laboratorio}</p>
            </div>
          )}

          {/* Special Badges */}
          <div className="flex flex-wrap gap-2">
            {medication.requiere_refrigeracion && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                <Snowflake size={12} />
                <span>Refrigeración</span>
              </div>
            )}
            {medication.controlado && (
              <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                <AlertCircle size={12} />
                <span>Controlado</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2.5 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
            >
              <Edit size={16} />
              Actualizar
            </button>

            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 py-2.5 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
            >
              <Clock size={16} />
              Historial
            </button>

            <button
              onClick={() => setIsEntryModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
            >
              <ArrowUpCircle size={16} />
              Entrada
            </button>

            <button
              onClick={() => setIsExitModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 py-2.5 rounded-lg hover:bg-orange-100 transition-colors font-medium text-sm"
            >
              <ArrowDownCircle size={16} />
              Salida
            </button>
          </div>

          <button
            onClick={() => setIsDeactivateModalOpen(true)}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2.5 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          >
            <Trash2 size={16} />
            Desactivar
          </button>
        </div>
      </div>

      {/* Modales */}
      <UpdateMedicationModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          setIsUpdateModalOpen(false);
          handleModalSuccess();
        }}
        medication={medication}
      />

      <RegisterEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSuccess={() => {
          setIsEntryModalOpen(false);
          handleModalSuccess();
        }}
        medication={medication}
      />

      <RegisterExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onSuccess={() => {
          setIsExitModalOpen(false);
          handleModalSuccess();
        }}
        medication={medication}
      />

      <MedicationHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        medication={medication}
      />

      <DeactivateMedicationModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onSuccess={() => {
          setIsDeactivateModalOpen(false);
          handleModalSuccess();
        }}
        medication={medication}
      />
    </>
  );
};

export default MedicationCard;