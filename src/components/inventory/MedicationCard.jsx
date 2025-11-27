import React, { useState } from 'react';
import { Pill, AlertCircle, Snowflake, MapPin, Calendar, DollarSign, Package, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';

const MedicationCard = ({ medication, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);

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
    if (isExpiringSoon()) return { text: 'Por Vencer', color: 'bg-yellow-500' };
    return { text: 'Normal', color: 'bg-green-500' };
  };

  const badge = getStockBadge();

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Pill className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                {medication.nombre}
              </h3>
              <p className="text-blue-100 text-sm capitalize">{medication.tipo}</p>
            </div>
          </div>
          <span className={`${badge.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
            {badge.text}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Alerts */}
        {(medication.requiere_refrigeracion || medication.controlado) && (
          <div className="flex gap-2 mb-4">
            {medication.requiere_refrigeracion && (
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                <Snowflake size={12} />
                Refrigeración
              </span>
            )}
            {medication.controlado && (
              <span className="flex items-center gap-1 bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                <AlertCircle size={12} />
                Controlado
              </span>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`${getStockColor()} p-2 rounded-lg`}>
              <Package size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Stock Actual</p>
              <p className="text-lg font-bold text-gray-800">
                {medication.stock_actual} {medication.unidad_medida}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Precio Venta</p>
                <p className="font-semibold text-gray-800">
                  {formatCurrency(medication.precio_venta)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Vencimiento</p>
                <p className={`font-semibold ${isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-yellow-600' : 'text-gray-800'}`}>
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
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => console.log('Actualizar', medication.id)}
              className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2.5 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
            >
              <Edit size={16} />
              Actualizar
            </button>

            <button
              onClick={() => console.log('Historial', medication.id)}
              className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 py-2.5 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
            >
              <Clock size={16} />
              Historial
            </button>

            <button
              onClick={() => console.log('Entrada', medication.id)}
              className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
            >
              <ArrowUpCircle size={16} />
              Entrada
            </button>

            <button
              onClick={() => console.log('Salida', medication.id)}
              className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 py-2.5 rounded-lg hover:bg-orange-100 transition-colors font-medium text-sm"
            >
              <ArrowDownCircle size={16} />
              Salida
            </button>
          </div>

          <button
            onClick={() => console.log('Desactivar', medication.id)}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2.5 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          >
            <Trash2 size={16} />
            Desactivar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationCard;