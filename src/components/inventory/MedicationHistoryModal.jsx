import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, Clock, ArrowUpCircle, ArrowDownCircle, AlertCircle, Calendar, User, FileText } from 'lucide-react';

const MedicationHistoryModal = ({ isOpen, onClose, medication }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && medication) {
      loadHistory();
    }
  }, [isOpen, medication]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getMedicationHistory(medication.id);
      setHistory(data);
    } catch (err) {
      setError('Error al cargar el historial');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Historial de Movimientos</h2>
              <p className="text-purple-100 text-sm">{medication?.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-gray-50 to-white px-6 py-4 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Stock Actual</p>
              <p className="text-2xl font-bold text-gray-800">
                {medication?.stock_actual} <span className="text-sm font-normal">{medication?.unidad_medida}</span>
              </p>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <p className="text-sm text-gray-600">Movimientos</p>
              <p className="text-2xl font-bold text-gray-800">{history.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Stock Mínimo</p>
              <p className="text-2xl font-bold text-gray-800">
                {medication?.stock_minimo} <span className="text-sm font-normal">{medication?.unidad_medida}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" size={24} />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Sin movimientos registrados
              </h3>
              <p className="text-gray-600">
                Aún no hay movimientos de entrada o salida para este medicamento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((movement) => (
                <div
                  key={movement.id}
                  className={`border rounded-xl p-5 transition-all hover:shadow-md ${
                    movement.tipo === 'entrada'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  {/* Header del movimiento */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          movement.tipo === 'entrada'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {movement.tipo === 'entrada' ? (
                          <ArrowUpCircle size={24} />
                        ) : (
                          <ArrowDownCircle size={24} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {movement.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </h4>
                        <p className="text-sm text-gray-600">{movement.motivo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          movement.tipo === 'entrada' ? 'text-green-700' : 'text-orange-700'
                        }`}
                      >
                        {movement.tipo === 'entrada' ? '+' : '-'}{movement.cantidad}
                      </p>
                      <p className="text-xs text-gray-600">{medication?.unidad_medida}</p>
                    </div>
                  </div>

                  {/* Detalles del movimiento */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-700">{formatDate(movement.fecha)}</span>
                    </div>
                    {movement.referencia && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-gray-700">{movement.referencia}</span>
                      </div>
                    )}
                  </div>

                  {/* Stock changes */}
                  <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock anterior:</span>
                      <span className="font-semibold text-gray-800">
                        {movement.stock_anterior} {medication?.unidad_medida}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Stock nuevo:</span>
                      <span className="font-semibold text-gray-800">
                        {movement.stock_nuevo} {medication?.unidad_medida}
                      </span>
                    </div>
                  </div>

                  {/* Costos (solo para entradas) */}
                  {movement.tipo === 'entrada' && movement.costo_unitario && (
                    <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Costo unitario:</span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(movement.costo_unitario)}
                        </span>
                      </div>
                      {movement.costo_total && (
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">Costo total:</span>
                          <span className="font-bold text-gray-900">
                            {formatCurrency(movement.costo_total)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Observaciones */}
                  {movement.observaciones && (
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Observaciones:</p>
                      <p className="text-sm text-gray-700">{movement.observaciones}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationHistoryModal;