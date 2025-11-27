import React, { useState } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, ArrowDownCircle, AlertCircle, AlertTriangle } from 'lucide-react';

const RegisterExitModal = ({ isOpen, onClose, onSuccess, medication }) => {
  const [formData, setFormData] = useState({
    cantidad: 0,
    motivo: '',
    referencia: '',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        medicamento_id: medication.id,
        tipo: 'salida',
        cantidad: formData.cantidad,
        motivo: formData.motivo,
        referencia: formData.referencia || null,
        observaciones: formData.observaciones || null,
      };

      await inventoryService.registerExit(dataToSend);
      onSuccess();
      // Limpiar formulario
      setFormData({
        cantidad: 0,
        motivo: '',
        referencia: '',
        observaciones: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar la salida');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const nuevoStock = Math.max(0, (medication?.stock_actual || 0) - formData.cantidad);
  const isStockInsufficient = formData.cantidad > medication?.stock_actual;
  const willBeLowStock = nuevoStock <= medication?.stock_minimo && nuevoStock > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ArrowDownCircle size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Registrar Salida</h2>
              <p className="text-orange-100 text-sm">{medication?.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Warning: Insufficient Stock */}
        {isStockInsufficient && formData.cantidad > 0 && (
          <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-red-800 font-semibold text-sm">Stock insuficiente</p>
                <p className="text-red-700 text-sm">
                  Solo hay {medication?.stock_actual} {medication?.unidad_medida} disponibles.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning: Low Stock */}
        {willBeLowStock && !isStockInsufficient && (
          <div className="mx-6 mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-yellow-800 font-semibold text-sm">Advertencia de Stock Bajo</p>
                <p className="text-yellow-700 text-sm">
                  El stock quedará por debajo del mínimo ({medication?.stock_minimo} {medication?.unidad_medida})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Actual */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Actual</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Stock Actual</p>
                <p className="text-lg font-bold text-gray-800">
                  {medication?.stock_actual} {medication?.unidad_medida}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Stock Mínimo</p>
                <p className="text-lg font-bold text-gray-800">
                  {medication?.stock_minimo} {medication?.unidad_medida}
                </p>
              </div>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a Retirar <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              required
              min="1"
              max={medication?.stock_actual}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold"
              placeholder="0"
            />
            {formData.cantidad > 0 && !isStockInsufficient && (
              <p className="mt-2 text-sm text-gray-600">
                Nuevo stock: <span className={`font-semibold ${willBeLowStock ? 'text-yellow-600' : 'text-gray-800'}`}>
                  {nuevoStock} {medication?.unidad_medida}
                </span>
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo <span className="text-red-500">*</span>
            </label>
            <select
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Seleccione un motivo</option>
              <option value="Uso en consulta veterinaria">Uso en consulta veterinaria</option>
              <option value="Aplicación de vacuna">Aplicación de vacuna</option>
              <option value="Tratamiento en hospitalización">Tratamiento en hospitalización</option>
              <option value="Venta directa">Venta directa</option>
              <option value="Medicamento vencido - Desecho">Medicamento vencido - Desecho</option>
              <option value="Medicamento dañado">Medicamento dañado</option>
              <option value="Ajuste de inventario">Ajuste de inventario</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia (Número de Historia Clínica/Merma)
            </label>
            <input
              type="text"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ej: HC-2025-001 o MERMA-2025-001"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones <span className="text-red-500">*</span>
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describa el uso del medicamento o el motivo de la salida..."
            />
          </div>
        </form>

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
            type="submit"
            onClick={handleSubmit}
            disabled={loading || isStockInsufficient}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Registrando...
              </>
            ) : (
              <>
                <ArrowDownCircle size={20} />
                Registrar Salida
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterExitModal;