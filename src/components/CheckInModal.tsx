"use client";

import React, { useState } from "react";
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, CheckCircle, Search } from "lucide-react";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInModal({ isOpen, onClose }: CheckInModalProps) {
  const [matricula, setMatricula] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberInfo, setMemberInfo] = useState<any>(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!matricula) return;
    setLoading(true);
    try {
      const q = query(collection(db, "miembros"), where("matricula", "==", matricula), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setMemberInfo({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
      } else {
        alert("Miembro no encontrado");
        setMemberInfo(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!memberInfo) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "visitas"), {
        idMiembro: memberInfo.id,
        nombreMiembro: memberInfo.nombre,
        matricula: memberInfo.matricula,
        fecha: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
      onClose();
      setMatricula("");
      setMemberInfo(null);
    } catch (error) {
      console.error(error);
      alert("Error al registrar visita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            Check-in de Miembro
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              required
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cédula (Ej. 12345678)"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-gray-800 border border-gray-700 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {memberInfo && (
            <div className="rounded-xl bg-blue-900/20 border border-blue-500/30 p-4 animate-in slide-in-from-top-2">
              <div className="font-bold text-white text-lg">{memberInfo.nombre}</div>
              <div className="text-blue-300 text-sm mb-2">Cédula: {memberInfo.matricula}</div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  memberInfo.estado === 'ACTIVO' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {memberInfo.estado}
                </span>
                {memberInfo.fechaFin && (
                  <span className="text-xs text-gray-400">Vence: {memberInfo.fechaFin}</span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !memberInfo}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Confirmar Entrada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
