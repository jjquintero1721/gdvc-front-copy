import React, { useState } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeactivateMedicationModal = ({ isOpen, onClose, onSuccess, medication }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeactivate = async () => {
    setLoading(true);
    setError(null);

    try {
      await inventoryService.deleteMedication(medication.id);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al desactivar el medicamento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Confirmar Desactivación</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-yellow-800 text-sm mb-1">
                  ¿Está seguro que desea desactivar este medicamento?
                </p>
                <p className="text-yellow-700 text-sm">
                  Esta acción realizará un borrado lógico. El medicamento no se eliminará
                  permanentemente, pero no estará disponible para su uso.
                </p>
              </div>
            </div>
          </div>

          {/* Medication Info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Información del Medicamento
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nombre:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {medication?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipo:</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">
                  {medication?.tipo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Stock Actual:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {medication?.stock_actual} {medication?.unidad_medida}
                </span>
              </div>
              {medication?.lote && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lote:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {medication?.lote}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Nota:</span> Podrá reactivar este medicamento
              más adelante si es necesario.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Desactivando...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Sí, Desactivar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateMedicationModal;