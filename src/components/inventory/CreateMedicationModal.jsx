import React, { useState } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, Save, AlertCircle } from 'lucide-react';

const CreateMedicationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'medicamento',
    descripcion: '',
    laboratorio: '',
    stock_actual: 0,
    stock_minimo: 0,
    stock_maximo: 0,
    unidad_medida: 'unidades',
    precio_compra: 0,
    precio_venta: 0,
    lote: '',
    fecha_vencimiento: '',
    ubicacion: '',
    requiere_refrigeracion: false,
    controlado: false,
    enfermedad: '',
    dosis_recomendada: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir valores numéricos
      const dataToSend = {
        ...formData,
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        stock_maximo: parseInt(formData.stock_maximo) || 0,
        precio_compra: parseFloat(formData.precio_compra) || 0,
        precio_venta: parseFloat(formData.precio_venta) || 0,
      };

      // Si hay fecha de vencimiento, formatearla correctamente
      if (dataToSend.fecha_vencimiento) {
        dataToSend.fecha_vencimiento = new Date(dataToSend.fecha_vencimiento).toISOString();
      }

      await inventoryService.createMedication(dataToSend);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el medicamento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Nuevo Medicamento</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Medicamento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Vacuna Antirrábica Canina"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="medicamento">Medicamento</option>
                    <option value="vacuna">Vacuna</option>
                    <option value="suplemento">Suplemento</option>
                    <option value="antiparasitario">Antiparasitario</option>
                    <option value="anestesico">Anestésico</option>
                    <option value="antibiotico">Antibiótico</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción del medicamento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Laboratorio
                  </label>
                  <input
                    type="text"
                    name="laboratorio"
                    value={formData.laboratorio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Zoetis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad de Medida
                  </label>
                  <select
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="unidades">Unidades</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="gr">Gramos (gr)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="cajas">Cajas</option>
                    <option value="tabletas">Tabletas</option>
                    <option value="capsulas">Cápsulas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stock */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Control de Stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Actual <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_actual"
                    value={formData.stock_actual}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_minimo"
                    value={formData.stock_minimo}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Máximo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_maximo"
                    value={formData.stock_maximo}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Precios */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Información Comercial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Compra (COP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="precio_compra"
                    value={formData.precio_compra}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Venta (COP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="precio_venta"
                    value={formData.precio_venta}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lote
                  </label>
                  <input
                    type="text"
                    name="lote"
                    value={formData.lote}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: VAC-2025-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación en Almacén
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Refrigerador A - Estante 2"
                  />
                </div>
              </div>
            </div>

            {/* Características Especiales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Características Especiales
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="requiere_refrigeracion"
                    checked={formData.requiere_refrigeracion}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Requiere Refrigeración
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="controlado"
                    checked={formData.controlado}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Medicamento Controlado
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enfermedad que Trata
                    </label>
                    <input
                      type="text"
                      name="enfermedad"
                      value={formData.enfermedad}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Rabia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosis Recomendada
                    </label>
                    <input
                      type="text"
                      name="dosis_recomendada"
                      value={formData.dosis_recomendada}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 1 dosis anual"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
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
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Medicamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMedicationModal;