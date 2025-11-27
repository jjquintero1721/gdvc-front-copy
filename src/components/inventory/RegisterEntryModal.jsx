import React, { useState } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, ArrowUpCircle, AlertCircle } from 'lucide-react';

const RegisterEntryModal = ({ isOpen, onClose, onSuccess, medication }) => {
  const [formData, setFormData] = useState({
    cantidad: 0,
    motivo: '',
    referencia: '',
    observaciones: '',
    costo_unitario: medication?.precio_compra || 0,
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
        tipo: 'entrada',
        cantidad: formData.cantidad,
        motivo: formData.motivo,
        referencia: formData.referencia || null,
        observaciones: formData.observaciones || null,
        costo_unitario: formData.costo_unitario,
      };

      await inventoryService.registerEntry(dataToSend);
      onSuccess();
      // Limpiar formulario
      setFormData({
        cantidad: 0,
        motivo: '',
        referencia: '',
        observaciones: '',
        costo_unitario: medication?.precio_compra || 0,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar la entrada');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const nuevoStock = (medication?.stock_actual || 0) + formData.cantidad;
  const costoTotal = formData.cantidad * formData.costo_unitario;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ArrowUpCircle size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Registrar Entrada</h2>
              <p className="text-green-100 text-sm">{medication?.nombre}</p>
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
              Cantidad a Ingresar <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
              placeholder="0"
            />
            {formData.cantidad > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Nuevo stock: <span className="font-semibold text-green-600">{nuevoStock} {medication?.unidad_medida}</span>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Seleccione un motivo</option>
              <option value="Compra mensual a proveedor">Compra mensual a proveedor</option>
              <option value="Compra de emergencia">Compra de emergencia</option>
              <option value="Donación">Donación</option>
              <option value="Devolución de proveedor">Devolución de proveedor</option>
              <option value="Ajuste de inventario">Ajuste de inventario</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Costo Unitario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo Unitario
            </label>
            <input
              type="number"
              name="costo_unitario"
              value={formData.costo_unitario}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
            {formData.cantidad > 0 && formData.costo_unitario > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Costo total: <span className="font-semibold text-gray-800">
                  ${costoTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </p>
            )}
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia (Número de Factura/Orden)
            </label>
            <input
              type="text"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: FACT-2025-001"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Información adicional sobre esta entrada..."
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
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Registrando...
              </>
            ) : (
              <>
                <ArrowUpCircle size={20} />
                Registrar Entrada
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterEntryModal;