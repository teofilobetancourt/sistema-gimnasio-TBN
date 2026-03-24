"use client";

import React, { useState } from "react";
import { addDoc, collection, serverTimestamp, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Camera, User, DollarSign, Calculator } from "lucide-react";
import MemberPhotoUpload from "./MemberPhotoUpload";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useCollection } from "@/hooks/useCollection";

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { data: membresias } = useCollection("membresias");
  const { data: entrenadores } = useCollection("entrenadores");
  const [formData, setFormData] = useState({
    nombre: "",
    matricula: "",
    telefono: "",
    direccion: "",
    edad: "",
    enfermedad: "",
    nombreContacto: "",
    telefonoContacto: "",
    estado: "ACTIVO",
    idMembresia: "",
    idEntrenador: "",
    fotoUrl: "",
    metodo: "Efectivo",
    monto: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedPlan = membresias.find((m: any) => m.id === formData.idMembresia);
      let fechaFin = null;
      
      if (selectedPlan) {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(selectedPlan.duracion || "30"));
        fechaFin = d.toISOString().split('T')[0];
      }

      const finalIdEntrenador = selectedPlan?.incluyeEntrenador ? formData.idEntrenador : "";
      const selectedTrainer = finalIdEntrenador ? entrenadores?.find((t: any) => t.id === finalIdEntrenador) : null;


      // Registro de Miembro
      const memberRef = await addDoc(collection(db, "miembros"), {
        ...formData,
        idEntrenador: finalIdEntrenador,
        fechaFin,
        nombreMembresia: selectedPlan?.nombre || "",
        nombreEntrenador: selectedTrainer?.nombre || "",
        fechaRegistro: serverTimestamp(),
      });

      // Registro Automático de Pago (si hay plan seleccionado)
      if (formData.idMembresia && formData.monto) {
        const isUSD = formData.metodo === "Divisas";
        const montoNum = parseFloat(formData.monto) || 0;
        const montoFinalUSD = isUSD ? montoNum : montoNum / tasaBCV;

        await addDoc(collection(db, "pagos"), {
          matricula: formData.matricula,
          monto: montoFinalUSD.toFixed(2),
          montoOriginal: formData.monto,
          monedaOriginal: isUSD ? "USD" : "VES",
          metodo: formData.metodo,
          idMembresia: formData.idMembresia,
          nombreMembresia: selectedPlan?.nombre || "",
          fecha: new Date().toISOString().split('T')[0],
          createdAt: serverTimestamp(),
        });
      }

      onClose();
      setFormData({
        nombre: "",
        matricula: "",
        telefono: "",
        direccion: "",
        edad: "",
        enfermedad: "",
        nombreContacto: "",
        telefonoContacto: "",
        estado: "ACTIVO",
        idMembresia: "",
        idEntrenador: "",
        fotoUrl: "",
        metodo: "Efectivo",
        monto: "",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error al guardar el miembro");
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
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white">Nuevo Miembro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <MemberPhotoUpload 
            matricula={formData.matricula} 
            onPhotoUploaded={(url) => setFormData({ ...formData, fotoUrl: url })} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
              <input
                required
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cédula</label>
              <input
                required
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej. 12345678"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Edad</label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
              <input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0412..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Dirección</label>
              <input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className={`col-span-1 ${incluyeEntrenador ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <label className="block text-sm font-medium text-gray-400 mb-1">Plan de Inicio (Opcional)</label>
              <select
                required
                name="idMembresia"
                value={formData.idMembresia}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar plan obligatorio...</option>
                {membresias?.map((plan: any) => (
                  <option key={plan.id} value={plan.id}>{plan.nombre} (${plan.costo})</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-1">
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

            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-400">
                  {formData.metodo === "Divisas" ? "Monto a Pagar ($)" : "Monto a Pagar (Bs)"}
                </label>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase">
                  <Calculator className="h-3 w-3" />
                  Tasa: {tasaBCV.toLocaleString()}
                </div>
              </div>
              <input
                readOnly
                required
                type="number"
                step="0.01"
                name="monto"
                value={formData.monto}
                className="w-full bg-gray-700/30 border border-white/5 rounded-lg px-4 py-2 text-gray-400 font-bold cursor-not-allowed"
                placeholder="0.00"
              />
              {parseFloat(formData.monto) > 0 && (
                <div className="mt-2 text-xs font-bold text-gray-500 italic animate-in fade-in slide-in-from-top-1 duration-300">
                  Equivale a: <span className={formData.metodo === "Divisas" ? 'text-blue-400' : 'text-green-400'}>
                    {formData.metodo === "Divisas" 
                      ? `Bs ${(parseFloat(formData.monto) * tasaBCV).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                      : `$ ${(parseFloat(formData.monto) / tasaBCV).toFixed(2)}`}
                  </span>
                </div>
              )}
            </div>

            {incluyeEntrenador && (
              <div className="col-span-1 md:col-span-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-gray-400 mb-1">Entrenador (Opcional)</label>
                <select
                  name="idEntrenador"
                  value={formData.idEntrenador}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            <div className="col-span-1 md:col-span-2">
              <h3 className="text-gray-500 font-semibold border-b border-gray-800 pb-2 mb-4 mt-2">Emergencias</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Contacto Emergencia</label>
              <input
                name="nombreContacto"
                value={formData.nombreContacto}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono Emergencia</label>
              <input
                name="telefonoContacto"
                value={formData.telefonoContacto}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Miembro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
