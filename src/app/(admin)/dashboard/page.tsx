"use client";

import React, { useState, useEffect } from "react";
import { useCollection } from "@/hooks/useCollection";
import { 
  Users, 
  User,
  Activity, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  RefreshCw,
  Zap,
  DollarSign,
  MessageCircle
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { syncBCVRate } from "@/lib/bcv";
import { RevenueChart, MembersHistoryChart } from "@/components/DashboardCharts";
import MemberDetailModal from "@/components/MemberDetailModal";

export default function DashboardPage() {
  const { data: miembros, loading: loadingMiembros } = useCollection("miembros");
  const { data: pagos, loading: loadingPagos } = useCollection("pagos");
  const [tasaBCV, setTasaBCV] = useState("0.00");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    // Listen to settings for real-time rate changes
    const unsub = onSnapshot(doc(db, "ajustes", "general"), (snapshot) => {
      if (snapshot.exists()) {
        setTasaBCV(snapshot.data().tasaBCV || "0.00");
      }
    });

    // Auto-sync on mount
    syncBCVRate();

    return () => unsub();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncBCVRate();
    setIsSyncing(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

  // Stats Calculation
  const activos = miembros.filter((m: any) => m.estado === "ACTIVO");
  const vencidos = miembros.filter((m: any) => m.estado === "VENCIDO" || (m.fechaFin && new Date(m.fechaFin) < new Date()));
  const porVencer = miembros.filter((m: any) => {
    if (!m.fechaFin) return false;
    const diff = new Date(m.fechaFin).getTime() - new Date().getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 7;
  });

  const pagosHoy = pagos.filter((p: any) => p.fecha === today);
  const pagosSemana = pagos.filter((p: any) => p.fecha >= lastWeekDate.toISOString().split('T')[0]);
  const pagosMes = pagos.filter((p: any) => p.fecha >= lastMonthDate.toISOString().split('T')[0]);
  
  const totalIngresos = pagos.reduce((acc: number, p: any) => acc + (parseFloat(p.monto) || 0), 0);
  const ingresoDiario = pagosHoy.reduce((acc: number, p: any) => acc + (parseFloat(p.monto) || 0), 0);
  const ingresoSemanal = pagosSemana.reduce((acc: number, p: any) => acc + (parseFloat(p.monto) || 0), 0);
  const ingresoMensual = pagosMes.reduce((acc: number, p: any) => acc + (parseFloat(p.monto) || 0), 0);

  const statsTop = [
    { name: "Mensualidad Hoy", value: pagosHoy.length, icon: Calendar, color: "bg-rose-500", shadow: "shadow-rose-500/20" },
    { name: "Mensualidad Semana", value: pagosSemana.length, icon: Activity, color: "bg-red-500", shadow: "shadow-red-500/20" },
    { name: "Mensualidad Mes", value: pagosMes.length, icon: Clock, color: "bg-indigo-500", shadow: "shadow-indigo-500/20" },
    { name: "Total Mensualidades", value: pagos.length, icon: TrendingUp, color: "bg-purple-500", shadow: "shadow-purple-500/20" },
  ];

  const statsBottom = [
    { name: "Ingreso Diario", value: `$${ingresoDiario.toFixed(2)}`, icon: DollarSign, color: "bg-teal-500", shadow: "shadow-teal-500/20" },
    { name: "Ingreso Semanal", value: `$${ingresoSemanal.toFixed(2)}`, icon: CreditCard, color: "bg-green-500", shadow: "shadow-green-500/20" },
    { name: "Ingreso Mensual", value: `$${ingresoMensual.toFixed(2)}`, icon: Calendar, color: "bg-orange-500", shadow: "shadow-orange-500/20" },
    { name: "Ingreso Total", value: `$${totalIngresos.toFixed(2)}`, icon: TrendingUp, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
  ];

  // Chart Data Processing
  const getRevenueData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTotal = pagos
        .filter((p: any) => p.fecha === date)
        .reduce((sum: number, p: any) => sum + Number(p.monto || 0), 0);
      return { name: date.split("-").slice(1).reverse().join("/"), value: dayTotal };
    });
  };

  const getMembersData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const count = miembros.filter((m: any) => {
        const regDate = m.fechaRegistro?.toDate ? m.fechaRegistro.toDate() : new Date(m.fechaRegistro);
        return regDate.toISOString().split('T')[0] <= date;
      }).length;
      return { name: date.split("-").slice(1).reverse().join("/"), value: count };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* BCV Tasa Alert */}
      <div className="glass-panel flex items-center justify-between p-4 px-6 border border-blue-500/20 shadow-lg shadow-blue-500/10 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-base font-medium text-blue-100 italic">
            Tasa BCV Actual: <span className="font-bold">BsS {tasaBCV}</span>
          </p>
        </div>
        <button 
          onClick={handleManualSync}
          disabled={isSyncing}
          className="text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          {isSyncing ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
          {isSyncing ? "SINCRONIZANDO..." : "ACTUALIZAR TASA"}
        </button>
      </div>

      {/* Top Grid - Membership Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsTop.map((stat) => (
          <div key={stat.name} className={`relative overflow-hidden group bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:bg-gray-800/50 shadow-xl ${stat.shadow}`}>
            <div className={`inline-flex p-3 rounded-2xl ${stat.color} mb-4 shadow-lg group-hover:rotate-6 transition-transform`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-gray-400 text-base font-medium">{stat.name}</p>
            <h3 className="text-4xl font-bold text-white mt-1">{stat.value}</h3>
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="h-24 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart 
          data={getRevenueData()} 
          title="Ingresos (Ult. 7 días)" 
          color="#3b82f6" 
          dataKey="value" 
        />
        <MembersHistoryChart 
          data={getMembersData()} 
          title="Crecimiento de Miembros" 
          color="#8b5cf6" 
          dataKey="value" 
        />
      </div>

      {/* Middle Section - Member Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <StatusList title="Membresías Vencidas" subtitle="Miembros finalizados" items={vencidos} color="text-rose-500" icon={AlertCircle} count={vencidos.length} onSelect={(m: any) => { setSelectedMember(m); setIsDetailOpen(true); }} />
        <StatusList title="Membresías por Vencer" subtitle="Próximos 7 días" items={porVencer} color="text-orange-500" icon={Clock} count={porVencer.length} onSelect={(m: any) => { setSelectedMember(m); setIsDetailOpen(true); }} />
        <StatusList title="Membresías Activas" subtitle="Miembros vigentes" items={activos} color="text-emerald-500" icon={CheckCircle2} count={activos.length} onSelect={(m: any) => { setSelectedMember(m); setIsDetailOpen(true); }} />
      </div>

      <MemberDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        member={selectedMember} 
      />

      {/* Bottom Grid - Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsBottom.map((stat) => (
          <div key={stat.name} className={`relative overflow-hidden group bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:bg-gray-800/50 shadow-xl ${stat.shadow}`}>
            <div className={`inline-flex p-3 rounded-2xl ${stat.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusList({ title, subtitle, items, color, icon: Icon, count, onSelect }: any) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((i: any) => 
    i.nombre?.toLowerCase().includes(search.toLowerCase()) || 
    i.matricula?.toLowerCase().includes(search.toLowerCase())
  );

  const handleWhatsApp = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (!item.telefono) return;
    
    // Format Venezuelan numbers (remove non-digits, replace leading 0 with 58)
    let phone = item.telefono.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "58" + phone.substring(1);
    
    let message = "";
    const endDate = item.fechaFin ? new Date(item.fechaFin).toLocaleDateString('es-ES') : "recientemente";
    
    if (title.includes("Vencidas")) {
      message = `¡Hola ${item.nombre}! 👋 Te escribimos de Evolution Fitness Gym para recordarte que tu membresía se encuentra vencida desde el ${endDate}. ¡Te esperamos pronto para renovar y seguir entrenando! 💪`;
    } else if (title.includes("por Vencer")) {
      message = `¡Hola ${item.nombre}! 👋 Te recordamos desde Evolution Fitness Gym que tu membresía está próxima a vencer el ${endDate}. ¡Renueva a tiempo para no perder tu progreso! 💪`;
    } else {
      message = `¡Hola ${item.nombre}! 👋 Saludos desde Evolution Fitness Gym.`;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gray-900/40 border border-white/5 rounded-3xl p-6 flex flex-col h-[400px] backdrop-blur-xl group transition-all hover:border-white/10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`h-5 w-5 ${color}`} />
            <h3 className="font-bold text-white text-base">{title}</h3>
          </div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">{subtitle}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-lg bg-white/5 text-sm font-bold ${color} border border-white/10`}>
          {count}
        </span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
        <input 
          placeholder="Buscar nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-700"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {filtered.map((item: any, i: number) => (
          <div 
            key={item.id || i} 
            onClick={() => onSelect(item)}
            className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group/item cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-gray-700 font-bold">{i + 1}.</div>
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-indigo-500/10 overflow-hidden flex items-center justify-center">
                    {item.fotoUrl ? (
                      <img src={item.fotoUrl} alt={item.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-indigo-400" />
                    )}
                 </div>
                 <div className="text-sm text-gray-400 group-hover/item:text-white transition-colors">{item.nombre}</div>
              </div>
            </div>
            {item.telefono && (
              <button 
                onClick={(e) => handleWhatsApp(e, item)}
                className="opacity-0 group-hover/item:opacity-100 p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                title="Notificar por WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 italic text-sm py-10">
            No hay miembros en esta lista.
          </div>
        )}
      </div>
    </div>
  );
}
