"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { syncBCVRate } from "@/lib/bcv";
import { Settings as SettingsIcon, Save, RefreshCw, Zap, Building2, Landmark, Phone, MapPin } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    gymName: "Evolution Fitness Gym",
    tasaBCV: "0.00",
    autoBCV: true,
    direccion: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "ajustes", "general"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(prev => ({ ...prev, ...snapshot.data() }));
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSyncBCV = async () => {
    setSyncing(true);
    await syncBCVRate();
    setSyncing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "ajustes", "general"), settings, { merge: true });
      alert("Configuración guardada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  if (loading) return <div className="p-8 text-gray-500">Cargando ajustes...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-indigo-900/30 rounded-xl">
          <SettingsIcon className="h-6 w-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Gimnasio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Información General</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nombre del Gimnasio</label>
                <input
                  name="gymName"
                  value={settings.gymName}
                  onChange={handleChange}
                  className="w-full bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Teléfono de Contacto</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    name="telefono"
                    value={settings.telefono}
                    onChange={handleChange}
                    className="w-full bg-gray-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                  <input
                    name="direccion"
                    value={settings.direccion}
                    onChange={handleChange}
                    className="w-full bg-gray-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Tasa BCV */}
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Moneda y Tasa</h3>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                <Zap className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase">Auto Sync</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">Actualización Automática</p>
                  <p className="text-xs text-gray-500">Sincronizar con DolarApi cada vez que abras la app.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="autoBCV"
                    checked={settings.autoBCV}
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Tasa de Cambio (BsS por $)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    name="tasaBCV"
                    value={settings.tasaBCV}
                    onChange={handleChange}
                    disabled={settings.autoBCV}
                    className="flex-1 bg-gray-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-50 disabled:bg-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleSyncBCV}
                    disabled={syncing}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 rounded-xl text-white transition-all shadow-lg shadow-blue-500/20"
                    title="Sincronizar ahora"
                  >
                    <RefreshCw className={`h-5 w-5 ${syncing ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
                <p className="text-[11px] text-blue-300 italic">
                  * La tasa se utiliza para calcular los montos en bolívares durante el registro de pagos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/30"
          >
            <Save className="h-5 w-5" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
