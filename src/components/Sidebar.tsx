"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Activity, 
  Settings, 
  LogOut,
  List,
  ShieldCheck,
  Camera,
  Dumbbell,
  Menu,
  X as CloseIcon
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useState } from "react";
import QRScannerModal from "./QRScannerModal";

const menuItems = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Miembros", href: "/members", icon: Users },
  { name: "Caja / Pagos", href: "/payments", icon: CreditCard },
  { name: "Membresías", href: "/membresias", icon: List },
  { name: "Training", href: "/training", icon: Dumbbell },
  { name: "Entradas", href: "/visits", icon: Activity },
  { name: "Usuarios", href: "/usuarios", icon: ShieldCheck },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-[#8e24aa] text-white rounded-xl shadow-lg md:hidden border border-white/20"
      >
        {isMobileOpen ? <CloseIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-[#8e24aa] to-[#5e35b1] text-white shadow-2xl overflow-hidden transition-transform duration-300 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        {/* Subtle glass effect overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none"></div>

        <div className="flex h-full flex-col relative z-10 px-4 py-8">
          <div className="mb-10 px-2 flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Evolution</h1>
              <p className="text-xs uppercase tracking-widest text-purple-200 font-bold">Fitness Gym</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1">
            {/* QR Scanner Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-sm font-bold bg-white/20 text-white shadow-xl backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all mb-6 group"
            >
              <div className="p-1.5 bg-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                <Camera className="h-4 w-4" />
              </div>
              <span>ESCÁNER ENTRADAS</span>
            </button>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name} className="list-none">
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                      isActive 
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/10" 
                        : "text-purple-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </nav>

          <div className="mt-auto px-2">
            <div className="bg-white/5 rounded-2xl p-2 border border-white/10 mb-6 group/logout">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-purple-200 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <LogOut className="h-5 w-5 transition-transform group-hover/logout:-translate-x-1" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
            
            <div className="px-4 pb-4">
              <p className="text-xs text-purple-300/50 font-bold uppercase tracking-[0.2em] text-center">Version 2.0.0 Premium</p>
            </div>
          </div>
        </div>
      </aside>

      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
}
