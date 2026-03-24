"use client";

import React, { useState } from "react";
import { QrCode, Search, UserCheck, Calendar } from "lucide-react";
import CheckInModal from "@/components/CheckInModal";
import QRScannerModal from "@/components/QRScannerModal";
import { useCollection } from "@/hooks/useCollection";

export default function VisitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { data: visitas, loading } = useCollection("visitas");

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-8">Control de Visitas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => setIsScannerOpen(true)}
          className="rounded-2xl bg-indigo-600/20 border border-indigo-500/50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-600/30 transition-all group"
        >
          <QrCode className="h-20 w-20 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-white mb-2">Escanear QR</h3>
          <p className="text-indigo-200/60 text-sm font-medium">Registra entrada mediante carnet digital.</p>
        </div>

        <div 
          onClick={() => setIsModalOpen(true)}
          className="rounded-2xl bg-gray-800 border border-gray-700 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-700/50 transition-all"
        >
          <Search className="h-20 w-20 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Búsqueda Manual</h3>
          <p className="text-gray-400 text-sm">Busca por cédula para registrar la entrada hoy.</p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
          <UserCheck className="h-5 w-5 text-green-500" />
          Asistencias de Hoy
        </h3>
        
        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-500 text-center py-10">Cargando...</p>
          ) : visitas.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-800 p-10 text-center text-gray-500 italic">
              No hay registros de visitas para hoy todavía.
            </div>
          ) : (
            visitas.map((visita: any) => (
              <div key={visita.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-800 transition-all hover:bg-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{visita.nombreMiembro}</div>
                    <div className="text-xs text-gray-500 font-mono">{visita.matricula}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-bold text-blue-400">
                    {new Date(visita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">Entrada Registrada</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CheckInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}
