"use client";

import React, { useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { Plus, Search, User, Phone, MapPin, QrCode, Dumbbell } from "lucide-react";
import AddMemberModal from "@/components/AddMemberModal";
import MemberQRModal from "@/components/MemberQRModal";

export default function MembersPage() {
  const { data: miembros, loading } = useCollection("miembros");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const filteredMiembros = miembros.filter((m: any) => 
    m.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.matricula?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowQR = (member: any) => {
    setSelectedMember(member);
    setIsQRModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Gestión de Miembros</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Miembro
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full p-3 pl-10 text-sm border rounded-lg bg-gray-800 border-gray-700 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Buscar por nombre o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-800 shadow-xl">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-900 text-gray-400 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4">Miembro</th>
              <th className="px-6 py-4 hidden sm:table-cell">Contacto</th>
              <th className="px-6 py-4 hidden md:table-cell">Cédula</th>
              <th className="px-6 py-4 hidden lg:table-cell">Entrenador</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Cargando miembros...
                </td>
              </tr>
            ) : filteredMiembros.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No se encontraron miembros.
                </td>
              </tr>
            ) : (
              filteredMiembros.map((miembro: any) => (
                <tr key={miembro.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-900 overflow-hidden flex items-center justify-center border border-indigo-500/30">
                        {miembro.fotoUrl ? (
                          <img src={miembro.fotoUrl} alt={miembro.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{miembro.nombre}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                           <MapPin className="h-3 w-3" /> {miembro.direccion || "Sin dirección"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {miembro.telefono || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell font-mono text-indigo-400">
                   {miembro.matricula}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-400">
                    {miembro.nombreEntrenador ? (
                      <span className="flex items-center gap-1.5 border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-md max-w-max">
                        <Dumbbell className="h-3 w-3" />
                        {miembro.nombreEntrenador}
                      </span>
                    ) : (
                      <span className="text-gray-600 italic">Libre</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      miembro.estado === "ACTIVO" 
                        ? "bg-green-900 text-green-300" 
                        : "bg-red-900 text-red-300"
                    }`}>
                      {miembro.estado || "VENCIDO"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleShowQR(miembro)}
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition-colors"
                        title="Ver QR"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button className="font-medium text-gray-400 hover:text-white transition-colors">Ver ficha</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <MemberQRModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        member={selectedMember} 
      />
    </div>
  );
}
