"use client";

import React, { useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, Edit2, Check, X, List } from "lucide-react";

export default function MembresiasPage() {
  const { data: membresias, loading } = useCollection("membresias");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", costo: "", duracion: "30", incluyeEntrenador: false });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "membresias", editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "membresias"), formData);
        setIsAdding(false);
      }
      setFormData({ nombre: "", costo: "", duracion: "30", incluyeEntrenador: false });
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este plan?")) {
      await deleteDoc(doc(db, "membresias", id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-900/30 rounded-xl">
            <List className="h-6 w-6 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold">Planes / Membresías</h1>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(isAdding || editingId) && (
          <div className="col-span-1 md:col-span-2 bg-gray-900/50 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl animate-in slide-in-from-top-4">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nombre del Plan</label>
                <input 
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej. Mensualidad King"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Costo ($)</label>
                <input 
                  required
                  type="number"
                  value={formData.costo}
                  onChange={(e) => setFormData({...formData, costo: e.target.value})}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="25.00"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Días</label>
                <input 
                  required
                  type="number"
                  value={formData.duracion}
                  onChange={(e) => setFormData({...formData, duracion: e.target.value})}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 w-full md:w-auto">
                <input 
                  type="checkbox"
                  id="incluyeEntrenador"
                  checked={formData.incluyeEntrenador}
                  onChange={(e) => setFormData({...formData, incluyeEntrenador: e.target.checked})}
                  className="w-4 h-4 text-purple-600 bg-gray-950 border-white/10 rounded focus:ring-purple-500"
                />
                <label htmlFor="incluyeEntrenador" className="text-sm font-bold text-gray-300">Incluye Entrenador</label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="p-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
                  <Check className="h-5 w-5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="col-span-2 text-center py-10 text-gray-500">Cargando planes...</div>
        ) : membresias.map((plan: any) => (
          <div key={plan.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl relative group hover:border-purple-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {plan.nombre}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-gray-400 text-sm">Vigencia: {plan.duracion} días</p>
                  {plan.incluyeEntrenador && (
                    <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase rounded-full">
                      Con Entrenador
                    </span>
                  )}
                </div>
              </div>
              <div className="text-2xl font-black text-purple-400">${plan.costo}</div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingId(plan.id);
                  setFormData({ 
                    nombre: plan.nombre, 
                    costo: plan.costo, 
                    duracion: plan.duracion,
                    incluyeEntrenador: plan.incluyeEntrenador || false 
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg text-sm transition-colors"
              >
                <Edit2 className="h-3 w-3" /> Editar
              </button>
              <button 
                onClick={() => handleDelete(plan.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
