"use client";

import React, { useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, DollarSign } from "lucide-react";
import { generateReceipt } from "@/lib/pdfGenerator";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPaymentModal({ isOpen, onClose }: AddPaymentModalProps) {
  const { data: membresias } = useCollection("membresias");
  const { data: entrenadores } = useCollection("entrenadores");
  const [formData, setFormData] = useState({
    matricula: "",
    monto: "",
    idMembresia: "",
    idEntrenador: "",
    metodo: "Efectivo",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedPlan = membresias.find((m: any) => m.id === formData.idMembresia);
      
      // Registrar el pago
      await addDoc(collection(db, "pagos"), {
        ...formData,
        nombreMembresia: selectedPlan?.nombre || "Varios",
        fecha: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      });

      // Actualizar la fecha de fin y estado del miembro automáticamente
      const q = query(collection(db, "miembros"), where("matricula", "==", formData.matricula), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const memberRef = querySnapshot.docs[0].ref;
        const duracionDias = parseInt(selectedPlan?.duracion || "30");
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + duracionDias);
        
        const finalIdEntrenador = selectedPlan?.incluyeEntrenador ? formData.idEntrenador : "";
        const selectedTrainer = finalIdEntrenador ? entrenadores?.find((t: any) => t.id === finalIdEntrenador) : null;
        
        await updateDoc(memberRef, {
          estado: "ACTIVO",
          fechaFin: fechaFin.toISOString().split('T')[0],
          idMembresia: formData.idMembresia,
          nombreMembresia: selectedPlan?.nombre,
          idEntrenador: finalIdEntrenador,
          nombreEntrenador: selectedTrainer?.nombre || "",
        });
      }
      
      // Auto-generate receipt option
      if (window.confirm("Pago registrado con éxito. ¿Desea generar el recibo en PDF?")) {
        const pagoObj = {
          ...formData,
          nombreMembresia: selectedPlan?.nombre || "Varios",
          fecha: new Date().toISOString().split('T')[0],
        };
        const miembroInfo = querySnapshot && !querySnapshot.empty ? querySnapshot.docs[0].data() : null;
        generateReceipt(pagoObj, miembroInfo);
      }

      onClose();
      setFormData({
        matricula: "",
        monto: "",
        idMembresia: "MENSUAL",
        idEntrenador: "",
        metodo: "Efectivo",
      });
    } catch (error) {
      console.error("Error adding payment: ", error);
      alert("Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedPlanObj = membresias?.find((m: any) => m.id === formData.idMembresia);
  const incluyeEntrenador = selectedPlanObj?.incluyeEntrenador || false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Registrar Pago
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Cédula del Miembro</label>
            <input
              required
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej. 12345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Monto ($)</label>
            <input
              required
              type="number"
              step="0.01"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Membresía</label>
            <select
              required
              name="idMembresia"
              value={formData.idMembresia}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar plan...</option>
              {membresias?.map((plan: any) => (
                <option key={plan.id} value={plan.id}>{plan.nombre} (${plan.costo})</option>
              ))}
            </select>
          </div>

          {incluyeEntrenador && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-gray-400 mb-1">Entrenador (Incluido en Plan)</label>
              <select
                name="idEntrenador"
                value={formData.idEntrenador}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Ninguno (Libre)</option>
                {entrenadores?.filter((e: any) => e.estado === "ACTIVO").map((entrenador: any) => (
                  <option key={entrenador.id} value={entrenador.id}>
                    {entrenador.nombre} - {entrenador.turno || "Ambos"} ({entrenador.especialidad})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Método de Pago</label>
            <select
              name="metodo"
              value={formData.metodo}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Divisas">Divisas ($)</option>
              <option value="Pago Móvil">Pago Móvil</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Confirmar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
