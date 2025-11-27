import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';
import { X, Save, AlertCircle } from 'lucide-react';

const UpdateMedicationModal = ({ isOpen, onClose, onSuccess, medication }) => {
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

  useEffect(() => {
    if (medication) {
      // Formatear fecha para el input tipo datetime-local
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        nombre: medication.nombre || '',
        tipo: medication.tipo || 'medicamento',
        descripcion: medication.descripcion || '',
        laboratorio: medication.laboratorio || '',
        stock_actual: medication.stock_actual || 0,
        stock_minimo: medication.stock_minimo || 0,
        stock_maximo: medication.stock_maximo || 0,
        unidad_medida: medication.unidad_medida || 'unidades',
        precio_compra: medication.precio_compra || 0,
        precio_venta: medication.precio_venta || 0,
        lote: medication.lote || '',
        fecha_vencimiento: formatDateForInput(medication.fecha_vencimiento),
        ubicacion: medication.ubicacion || '',
        requiere_refrigeracion: medication.requiere_refrigeracion || false,
        controlado: medication.controlado || false,
        enfermedad: medication.enfermedad || '',
        dosis_recomendada: medication.dosis_recomendada || '',
      });
    }
  }, [medication]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir la fecha a formato ISO si existe
      const dataToSend = {
        ...formData,
        fecha_vencimiento: formData.fecha_vencimiento
          ? new Date(formData.fecha_vencimiento).toISOString()
          : null,
      };

      await inventoryService.updateMedication(medication.id, dataToSend);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el medicamento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-white">Actualizar Medicamento</h2>
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
        <div className="p-6">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad de Medida <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="unidades">Unidades</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="mg">Miligramos (mg)</option>
                    <option value="g">Gramos (g)</option>
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
                    Precio de Compra <span className="text-red-500">*</span>
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
                    Precio de Venta <span className="text-red-500">*</span>
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
              </div>
            </div>

            {/* Información de Control */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Información de Control
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
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

                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiere_refrigeracion"
                      checked={formData.requiere_refrigeracion}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Requiere Refrigeración
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="controlado"
                      checked={formData.controlado}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Medicamento Controlado
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Información Médica */}
            {(formData.tipo === 'vacuna' || formData.tipo === 'medicamento') && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Información Médica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t rounded-b-2xl">
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
                Actualizando...
              </>
            ) : (
              <>
                <Save size={20} />
                Actualizar Medicamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateMedicationModal;