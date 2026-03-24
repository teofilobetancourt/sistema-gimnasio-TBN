import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X, Dumbbell } from "lucide-react";

export default function AddTrainerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    especialidad: "",
    turno: "Mañana",
    horario: "",
    urlImagen: "",
    estado: "ACTIVO",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "entrenadores"), {
        ...formData,
        fechaRegistro: serverTimestamp(),
      });
      onClose();
      setFormData({
        nombre: "",
        cedula: "",
        telefono: "",
        especialidad: "",
        turno: "Mañana",
        horario: "",
        urlImagen: "",
        estado: "ACTIVO",
      });
    } catch (error) {
      console.error("Error adding trainer: ", error);
      alert("Error al registrar el entrenador");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-pink-500" />
            Registrar Entrenador
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
              <input
                required
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Ej. Marco Antonio"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cédula</label>
              <input
                required
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Ej. 12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
              <input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="0412..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Especialidad</label>
              <select
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">General</option>
                <option value="Musculación">Musculación</option>
                <option value="Funcional / Crossfit">Funcional / Crossfit</option>
                <option value="Cardio / Zumba">Cardio / Zumba</option>
                <option value="Personal Trainer">Personal Trainer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Turno</label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Ambos">Ambos (Doble Turno)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Horario Específico</label>
              <input
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Ej. 08:00 AM a 12:00 PM"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">URL de Foto (Para Propaganda)</label>
              <input
                name="urlImagen"
                value={formData.urlImagen}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enlace público a la foto del entrenador (Ej. imgur.com/...)"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "Guardando..." : "Registrar Entrenador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
