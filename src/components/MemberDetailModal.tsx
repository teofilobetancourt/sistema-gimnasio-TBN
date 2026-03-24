"use client";

import React from "react";
import { X, User, Phone, Calendar, Clock, MapPin, Activity, Dumbbell, MessageCircle } from "lucide-react";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

export default function MemberDetailModal({ isOpen, onClose, member }: MemberDetailModalProps) {
  if (!isOpen || !member) return null;

  const handleWhatsApp = () => {
    if (!member.telefono) return;
    let phone = member.telefono.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "58" + phone.substring(1);
    const url = `https://wa.me/${phone}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-gray-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Header with Pattern */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all z-20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-6">
            <div className="h-32 w-32 rounded-3xl border-4 border-gray-950 bg-gray-900 overflow-hidden shadow-2xl relative group">
              {member.fotoUrl ? (
                <img src={member.fotoUrl} alt={member.nombre} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-500/10">
                  <User className="h-16 w-16 text-indigo-500" />
                </div>
              )}
              <div className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-gray-950 ${member.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            </div>

            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-black text-white leading-none mb-1">{member.nombre}</h2>
              <div className="flex items-center gap-3">
                <span className="text-indigo-400 font-mono text-sm uppercase tracking-widest font-bold">{member.matricula}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${member.estado === 'ACTIVO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {member.estado || 'MIEMBRO'}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Card */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Activity className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Plan Actual</span>
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">{member.nombreMembresia || "Sin Plan Activo"}</p>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs">Vence: {member.fechaFin ? new Date(member.fechaFin).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Trainer Card */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Dumbbell className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Entrenador</span>
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">{member.nombreEntrenador || "Entrenamiento Libre"}</p>
                <p className="text-xs text-gray-500 mt-1">Personalizado (Asignado)</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-1 md:col-span-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-900 rounded-xl">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-600 tracking-tighter">Teléfono de contacto</p>
                  <p className="text-lg font-bold text-white">{member.telefono || "Sin teléfono"}</p>
                </div>
              </div>
              <button 
                onClick={handleWhatsApp}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="h-4 w-4" />
                WHATSAPP
              </button>
            </div>

            {/* Emergency Info */}
            {(member.nombreContacto || member.telefonoContacto) && (
              <div className="bg-rose-500/5 rounded-2xl p-4 border border-rose-500/10 col-span-1 md:col-span-2">
                <p className="text-[10px] font-black uppercase text-rose-500/60 tracking-widest mb-2">En caso de Emergencia</p>
                <div className="flex items-center justify-between">
                   <div className="font-bold text-white">{member.nombreContacto || "N/A"}</div>
                   <div className="font-mono text-rose-400 text-sm">{member.telefonoContacto || "N/A"}</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
             <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">Evolution Fitness Gym Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}
