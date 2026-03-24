"use client";

import React, { useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { DollarSign, Calendar, CreditCard, Filter, Download, User, ArrowUpRight, TrendingUp, Wallet, Banknote, Clock } from "lucide-react";
import AddPaymentModal from "@/components/AddPaymentModal";
import { generateReceipt } from "@/lib/pdfGenerator";

export default function PaymentsPage() {
  const { data: pagos, loading } = useCollection("pagos");
  const { data: miembros } = useCollection("miembros");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDownload = (pago: any) => {
    const miembro = miembros.find((m: any) => m.matricula === pago.matricula);
    generateReceipt(pago, miembro);
  };

  // Modern Financial Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const totalIngresos = pagos.reduce((sum: number, p: any) => sum + (parseFloat(p.monto) || 0), 0);
  const totalHoy = pagos.filter((p: any) => p.fecha === todayStr).reduce((sum: number, p: any) => sum + (parseFloat(p.monto) || 0), 0);
  
  const byMethod = pagos.reduce((acc: any, p: any) => {
    const method = p.metodo || "Otro";
    acc[method] = (acc[method] || 0) + (parseFloat(p.monto) || 0);
    return acc;
  }, {});

  const filteredPagos = pagos.filter((p: any) => {
    const search = searchTerm.toLowerCase();
    const member = miembros.find((m: any) => m.matricula === p.matricula);
    return (
      p.matricula?.toLowerCase().includes(search) ||
      member?.nombre?.toLowerCase().includes(search) ||
      p.nombreMembresia?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-white">Dashboard de Ingresos</h1>
           <p className="text-gray-400 text-sm mt-1">Control financiero y registro de transacciones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
        >
          <DollarSign className="h-5 w-5" />
          Nuevo Ingreso
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
               <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
               <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Ventas en Divisas</div>
               <div className="text-2xl font-black text-white">${(byMethod["Divisas"] || 0).toLocaleString()}</div>
            </div>
         </div>
         <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
               <Banknote className="h-6 w-6 text-orange-500" />
            </div>
            <div>
               <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Efectivo (Bs/$)</div>
               <div className="text-2xl font-black text-white">${(byMethod["Efectivo"] || 0).toLocaleString()}</div>
            </div>
         </div>
         <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
               <ArrowUpRight className="h-6 w-6 text-purple-500" />
            </div>
            <div>
               <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Pago Móvil</div>
               <div className="text-2xl font-black text-white">${(byMethod["Pago Móvil"] || 0).toLocaleString()}</div>
            </div>
         </div>
         <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
               <Wallet className="h-6 w-6 text-blue-500" />
            </div>
            <div>
               <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Transferencias</div>
               <div className="text-2xl font-black text-white">${(byMethod["Transferencia"] || 0).toLocaleString()}</div>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
             <Filter className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full p-2.5 pl-10 text-sm border rounded-xl bg-gray-900 border-gray-800 placeholder-gray-500 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            placeholder="Buscar por cédula, nombre o plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-800/50 text-gray-400 border-b border-gray-700">
            <tr>
              <th className="px-6 py-5 hidden sm:table-cell">Fecha / Hora</th>
              <th className="px-6 py-5">Miembro</th>
              <th className="px-6 py-5 hidden md:table-cell">Concepto / Plan</th>
              <th className="px-6 py-5 text-right">Monto</th>
              <th className="px-6 py-5 hidden lg:table-cell">Método de Pago</th>
              <th className="px-6 py-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                  Sincronizando transacciones...
                </td>
              </tr>
            ) : filteredPagos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                  No se encontraron registros que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredPagos.map((pago: any) => {
                const member = miembros.find((m: any) => m.matricula === pago.matricula);
                return (
                  <tr key={pago.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full w-fit">
                        <Clock className="h-3.5 w-3.5" />
                        {pago.fecha}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                            <User className="h-4 w-4 text-indigo-400" />
                         </div>
                         <div>
                            <div className="font-bold text-white leading-tight">{member?.nombre || "Varios / Otros"}</div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter sm:inline hidden">ID: {pago.matricula}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="font-medium text-gray-300 italic">{pago.nombreMembresia || "Producto / Servicio"}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-lg font-black text-green-400">${parseFloat(pago.monto).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                         pago.metodo === "Efectivo" ? "bg-amber-900/20 text-amber-500 border-amber-500/20" :
                         pago.metodo === "Pago Móvil" ? "bg-purple-900/20 text-purple-400 border-purple-500/20" :
                         pago.metodo === "Divisas" ? "bg-green-900/20 text-green-400 border-green-500/20" :
                         "bg-blue-900/20 text-blue-400 border-blue-500/20"
                       }`}>
                         {pago.metodo || "Efectivo"}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDownload(pago)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
                        title="Generar Recibo de Pago"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AddPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
