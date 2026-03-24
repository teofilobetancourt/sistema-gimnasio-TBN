"use client";

import React, { useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, DollarSign, Calculator, Info } from "lucide-react";
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
  const [tasaBCV, setTasaBCV] = useState(1);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, "ajustes", "general"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTasaBCV(parseFloat(data.tasaBCV) || 1);
      }
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const isUSD = formData.metodo === "Divisas";
  const montoNum = parseFloat(formData.monto) || 0;
  const conversionValue = isUSD ? montoNum * tasaBCV : montoNum / tasaBCV;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedPlan = membresias.find((m: any) => m.id === formData.idMembresia);
      
      // Registrar el pago
      const montoFinalUSD = isUSD ? montoNum : montoNum / tasaBCV;
      const montoFinalBs = isUSD ? montoNum * tasaBCV : montoNum;

      await addDoc(collection(db, "pagos"), {
        ...formData,
        monto: montoFinalUSD.toFixed(2), // Siempre guardamos el monto base en $ para reportes
        montoOriginal: formData.monto,
        monedaOriginal: isUSD ? "USD" : "VES",
        tasaBCVUsada: tasaBCV,
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
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Auto-precio al cambiar MEMBRESIA o METODO
    if (name === "idMembresia" || name === "metodo") {
      const plan = membresias?.find((m: any) => m.id === (name === "idMembresia" ? value : formData.idMembresia));
      const method = name === "metodo" ? value : formData.metodo;
      if (plan) {
        const costoUSD = parseFloat(plan.costo) || 0;
        if (method === "Divisas") {
          newFormData.monto = costoUSD.toString();
        } else {
          newFormData.monto = (costoUSD * tasaBCV).toFixed(2);
        }
      }
    }

    setFormData(newFormData);
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-400">
                {isUSD ? "Monto ($)" : "Monto (Bs)"}
              </label>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase">
                <Calculator className="h-3 w-3" />
                Tasa: {tasaBCV.toLocaleString()} Bs/$
              </div>
            </div>
            <input
              readOnly
              required
              type="number"
              step="0.01"
              name="monto"
              value={formData.monto}
              className={`w-full bg-gray-800/50 border rounded-lg px-4 py-2 text-gray-400 font-bold cursor-not-allowed ${isUSD ? 'border-green-500/10' : 'border-blue-500/10'}`}
              placeholder="0.00"
            />
            {montoNum > 0 && (
               <div className="mt-2 text-xs font-bold text-gray-500 italic animate-in fade-in slide-in-from-top-1 duration-300">
                  Equivale a: <span className={isUSD ? 'text-blue-400' : 'text-green-400'}>
                    {isUSD ? `Bs ${conversionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$ ${conversionValue.toFixed(2)}`}
                  </span>
               </div>
            )}
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

          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 flex items-start gap-3">
             <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
             <p className="text-[10px] text-gray-500 leading-tight">
               El sistema guarda el monto base en <b>USD</b> para tus reportes globales, pero registra la moneda original para el recibo.
             </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Método de Pago</label>
            <select
              name="metodo"
              value={formData.metodo}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Divisas">Divisas ($)</option>
              <option value="Efectivo">Efectivo (Bs)</option>
              <option value="Pago Móvil">Pago Móvil (Bs)</option>
              <option value="Transferencia">Transferencia (Bs)</option>
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
