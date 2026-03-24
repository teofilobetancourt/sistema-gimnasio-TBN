"use client";

import React, { useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { Plus, Search, Dumbbell, Phone, MapPin, Edit2, LayoutGrid, List as ListIcon, Monitor, X, ChevronRight, ChevronLeft, Clock } from "lucide-react";
import AddTrainerModal from "@/components/AddTrainerModal";

export default function TrainingPage() {
  const { data: entrenadores, loading } = useCollection("entrenadores");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"directorio" | "propaganda">("directorio");

  const activeTrainers = entrenadores.filter((e: any) => e.estado === "ACTIVO");

  const filtered = entrenadores.filter((e: any) => 
    e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Training</h1>
          <p className="text-gray-400 text-sm mt-1">Directorio y perfiles promocionales de entrenadores</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors shadow-lg shadow-pink-600/20"
        >
          <Plus className="h-4 w-4" />
          Registrar Entrenador
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("directorio")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "directorio" ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-white"
            }`}
          >
            <ListIcon className="h-4 w-4" />
            Directorio
          </button>
          <button
            onClick={() => setActiveTab("propaganda")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "propaganda" ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Propaganda
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64 md:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full p-2 pl-9 text-sm border rounded-lg bg-gray-900 border-gray-800 placeholder-gray-500 text-white focus:ring-pink-500 focus:border-pink-500 transition-all"
              placeholder="Buscar entrenador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === "propaganda" && activeTrainers.length > 0 && (
            <button
              onClick={() => {
                window.open('/training/billboard', '_blank', 'noopener,noreferrer');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-600/20"
            >
              <Monitor className="h-4 w-4" />
              Modo Publicidad
            </button>
          )}
        </div>
      </div>

      {activeTab === "directorio" ? (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-800 shadow-xl">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-900 text-gray-400 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 border-r border-gray-700">Entrenador</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Cédula</th>
              <th className="px-6 py-4">Turno / Horario</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Cargando entrenadores...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No se encontraron entrenadores.
                </td>
              </tr>
            ) : (
              filtered.map((entrenador: any) => (
                <tr key={entrenador.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 border-r border-gray-700">
                    <div className="flex items-center gap-3">
                      {entrenador.urlImagen ? (
                        <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden border border-pink-500/20">
                           <img src={entrenador.urlImagen} alt={entrenador.nombre} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-pink-900/50 flex items-center justify-center border border-pink-500/20">
                          <Dumbbell className="h-5 w-5 text-pink-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white text-base">{entrenador.nombre}</div>
                        <div className="text-xs text-pink-400 font-medium">
                           {entrenador.especialidad || "General"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {entrenador.telefono || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-400">
                   {entrenador.cedula}
                  </td>
                  <td className="px-6 py-4">
                   <div className="text-sm font-medium text-white">{entrenador.turno || "Ambos"}</div>
                   <div className="text-xs text-gray-400">{entrenador.horario || "No especificado"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entrenador.estado === "ACTIVO" 
                        ? "bg-green-900/50 text-green-400 border border-green-500/20" 
                        : "bg-red-900/50 text-red-400 border border-red-500/20"
                    }`}>
                      {entrenador.estado || "ACTIVO"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="p-2 bg-gray-600/20 hover:bg-gray-600/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Editar Entrenador"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.filter((e: any) => e.estado === "ACTIVO").map((entrenador: any) => (
             <div key={entrenador.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl group hover:border-pink-500/50 transition-all">
                <div className="h-48 bg-gray-800 relative w-full flex items-center justify-center">
                   {entrenador.urlImagen ? (
                      <img src={entrenador.urlImagen} alt={entrenador.nombre} className="h-full w-full object-cover" />
                   ) : (
                      <Dumbbell className="h-16 w-16 text-gray-700" />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80 mt-20"></div>
                   <div className="absolute bottom-4 left-4 right-4">
                     <span className="px-2.5 py-1 bg-pink-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full mb-2 inline-block">
                        {entrenador.especialidad || "Entrenador"}
                     </span>
                     <h3 className="text-xl font-bold text-white drop-shadow-md">{entrenador.nombre}</h3>
                   </div>
                </div>
                <div className="p-5">
                   <dl className="space-y-3">
                     <div>
                       <dt className="text-xs text-gray-500 uppercase tracking-wider font-bold">Turno y Horario</dt>
                       <dd className="text-sm font-medium text-white flex items-center justify-between mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            entrenador.turno === "Mañana" ? "bg-amber-500/20 text-amber-500" : 
                            entrenador.turno === "Tarde" ? "bg-indigo-500/20 text-indigo-400" : 
                            "bg-pink-500/20 text-pink-400"
                          }`}>
                            {entrenador.turno || "Ambos"}
                          </span>
                          <span className="text-gray-400">{entrenador.horario}</span>
                       </dd>
                     </div>
                     <div className="pt-3 border-t border-gray-800">
                        <button className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                           <Phone className="h-3.5 w-3.5" />
                           Contactar
                        </button>
                     </div>
                   </dl>
                </div>
             </div>
          ))}
          {filtered.filter((e: any) => e.estado === "ACTIVO").length === 0 && (
             <div className="col-span-1 md:col-span-2 lg:col-span-4 p-12 flex flex-col items-center justify-center bg-gray-900/50 border border-gray-800 border-dashed rounded-2xl">
                <Dumbbell className="h-12 w-12 text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Sin entrenadores activos</h3>
                <p className="text-gray-500 text-sm">Registra un entrenador para ver su tarjeta promocional aquí.</p>
             </div>
          )}
        </div>
      )}

      <AddTrainerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
