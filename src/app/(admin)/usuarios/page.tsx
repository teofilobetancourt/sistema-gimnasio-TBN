"use client";

import React, { useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldCheck, User, Star, Trash2, Edit2 } from "lucide-react";

export default function UsuariosPage() {
  const { data: usuarios, loading } = useCollection("usuarios");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-900/30 rounded-xl">
          <ShieldCheck className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">Administradores del Sistema</h1>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl mb-8 flex items-start gap-3">
        <Star className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-100">
          <p className="font-bold mb-1">Nota sobre seguridad:</p>
          <p>Para crear nuevos administradores (cuentas de acceso), debes hacerlo desde la **Consola de Firebase - Authentication**. Una vez creados, aparecerán aquí para asignarles nombres y roles específicos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-gray-500">Cargando administradores...</div>
        ) : usuarios.length === 0 ? (
          <div className="col-span-2 bg-gray-900 border border-gray-800 p-20 rounded-3xl text-center">
             <User className="h-16 w-16 text-gray-700 mx-auto mb-4" />
             <p className="text-gray-500 italic">No hay perfiles de usuario vinculados en Firestore todavía.</p>
          </div>
        ) : usuarios.map((user: any) => (
          <div key={user.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl group hover:border-red-500/30 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold border border-red-500/30">
                {user.nombre?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user.nombre || "Sin nombre"}</h3>
                <p className="text-xs text-gray-400 font-mono italic">{user.id}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
              <div className="flex items-center gap-2">
                 <span className="px-2 py-1 rounded-lg bg-red-500 text-[10px] font-bold text-white uppercase tracking-tighter">
                   {user.rol || "ADMIN"}
                 </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button className="p-2 bg-red-500/5 hover:bg-red-500/20 rounded-lg text-red-500 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
