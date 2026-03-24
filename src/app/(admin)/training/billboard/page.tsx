"use client";

import React, { useState, useEffect } from "react";
import { useCollection } from "@/hooks/useCollection";
import { X, ChevronRight, ChevronLeft, Clock, Phone, Dumbbell } from "lucide-react";
import Link from "next/link";

export default function BillboardPage() {
  const { data: entrenadores, loading } = useCollection("entrenadores");
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeTrainers = entrenadores.filter((e: any) => e.estado === "ACTIVO");

  useEffect(() => {
    let interval: any;
    if (activeTrainers.length > 0) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeTrainers.length);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [activeTrainers.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Cargando Staff...</div>
      </div>
    );
  }

  if (activeTrainers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-10 text-center">
        <Dumbbell className="h-20 w-20 text-gray-800 mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Sin Entrenadores Activos</h1>
        <p className="text-gray-500 text-xl">Registra entrenadores en el sistema para ver la publicidad aquí.</p>
        <Link href="/training" className="mt-8 px-6 py-3 bg-pink-600 text-white rounded-lg font-bold">Volver al Sistema</Link>
      </div>
    );
  }

  const current = activeTrainers[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden select-none">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 opacity-40 blur-2xl scale-110 grayscale-[0.5]">
         <img 
           src={current?.urlImagen} 
           alt="bg" 
           className="w-full h-full object-cover" 
         />
      </div>

      {/* Close Button (Window.close for separate window) */}
      <button 
        onClick={() => window.close()}
        className="absolute top-8 right-8 z-[110] p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all group"
        title="Cerrar Publicidad"
      >
        <X className="h-8 w-8 group-hover:scale-110 transition-transform" />
      </button>

      <div className="relative z-[110] h-full flex flex-col md:flex-row items-center justify-center p-8 md:p-20 gap-12">
         {/* Left: Huge Portrait */}
         <div className="relative w-full md:w-1/2 aspect-[3/4] max-h-[85vh] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(219,39,119,0.3)] border-4 border-white/20 animate-in zoom-in slide-in-from-left-20 duration-700">
            <img 
              src={current?.urlImagen} 
              alt={current?.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            
            <div className="absolute bottom-10 left-10 right-10">
               <div className="bg-pink-600 inline-block px-6 py-2 rounded-full text-white text-xl font-black uppercase tracking-widest mb-4 shadow-xl">
                  {current?.especialidad}
               </div>
               <h2 className="text-6xl md:text-8xl font-black text-white leading-tight drop-shadow-2xl">
                 {current?.nombre.split(' ')[0]} <br/>
                 <span className="text-pink-500">{current?.nombre.split(' ').slice(1).join(' ')}</span>
               </h2>
            </div>
         </div>

         {/* Right: Info Panels */}
         <div className="w-full md:w-1/2 flex flex-col justify-center gap-8 animate-in fade-in slide-in-from-right-20 duration-700 delay-300">
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-3xl">
               <div className="flex items-center gap-4 mb-2">
                 <Clock className="h-8 w-8 text-pink-500" />
                 <h3 className="text-gray-400 text-2xl font-bold uppercase tracking-widest">Disponibilidad</h3>
               </div>
               <div className="text-5xl md:text-7xl font-black text-white mt-4 italic">
                  {current?.turno}
               </div>
               <div className="text-2xl md:text-3xl text-pink-400/80 font-medium mt-2 bg-pink-500/10 inline-block px-4 py-1 rounded-lg">
                  {current?.horario}
               </div>
            </div>

            <div className="flex items-center gap-6">
               {activeTrainers.map((_, idx) => (
                 <div 
                   key={idx} 
                   className={`h-3 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-24 bg-pink-500' : 'w-4 bg-white/20'}`}
                 />
               ))}
            </div>

            <p className="text-gray-500 text-xl italic font-serif">
              "Entrenamiento personalizado enfocado en resultados reales. ¡Únete a nuestro equipo hoy mismo!"
            </p>

            <div className="flex items-center gap-4 mt-4">
               <div className="p-4 bg-pink-600/20 rounded-2xl border border-pink-500/30">
                  <Phone className="h-8 w-8 text-pink-400" />
               </div>
               <div>
                  <div className="text-gray-500 text-sm font-bold uppercase tracking-tighter">Reservar Sesión</div>
                  <div className="text-white text-3xl font-black">{current?.telefono}</div>
               </div>
            </div>
         </div>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-12 text-white/30 text-sm font-black tracking-widest uppercase">
         <span>EVOLUTION FITNESS</span>
         <div className="flex items-center gap-4">
            <ChevronLeft className="h-6 w-6" />
            <span className="text-white font-mono text-xl">{String(currentSlide + 1).padStart(2, '0')} / {String(activeTrainers.length).padStart(2, '0')}</span>
            <ChevronRight className="h-6 w-6" />
         </div>
         <span>TRAINING STAFF</span>
      </div>
    </div>
  );
}
