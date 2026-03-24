"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        async (decodedText) => {
          if (!isProcessing) {
            handleScan(decodedText);
          }
        },
        (err) => {
          // Normal scanning errors (no QR found in frame)
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Error clearing scanner", e));
        scannerRef.current = null;
      }
    };
  }, [isOpen, isProcessing]);

  const handleScan = async (memberId: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const memberDoc = await getDoc(doc(db, "miembros", memberId));
      if (memberDoc.exists()) {
        const memberData = memberDoc.data();
        
        // Register visit
        await addDoc(collection(db, "visitas"), {
          memberId: memberId,
          nombre: memberData.nombre,
          fecha: serverTimestamp(),
          tipo: "QR_ENTRY"
        });

        setScanResult(memberData);
        
        // Auto-close success message after 3 seconds and allow new scan
        setTimeout(() => {
          setScanResult(null);
          setIsProcessing(false);
        }, 3000);
      } else {
        throw new Error("Miembro no encontrado");
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar QR");
      setTimeout(() => {
        setError(null);
        setIsProcessing(false);
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-8">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all z-10"
        >
          <X className="h-6 w-6 text-gray-400" />
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="inline-flex p-3 bg-indigo-500/20 rounded-2xl mb-4">
            <Camera className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Escáner de Acceso</h2>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Coloca el código QR frente a la cámara</p>
        </div>

        <div className="relative aspect-square w-full max-w-[320px] mx-auto overflow-hidden rounded-[2.5rem] border-2 border-dashed border-white/10 bg-black/40 mb-8 flex items-center justify-center">
          <div id="reader" className="w-full h-full"></div>
          
          {/* Overlay for results */}
          {scanResult && (
            <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
              <CheckCircle2 className="h-20 w-20 text-white mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-white mb-1">¡BIENVENIDO!</h3>
              <p className="text-white/90 font-medium text-lg">{scanResult.nombre}</p>
              <div className="mt-4 px-4 py-2 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest">
                ACCESO AUTORIZADO
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-rose-500/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
              <AlertCircle className="h-20 w-20 text-white mb-4" />
              <h3 className="text-2xl font-bold text-white mb-1">ERROR</h3>
              <p className="text-white/90 font-medium">{error}</p>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">Evolution Fitness Gym - Sistema de Control</p>
      </div>
    </div>
  );
}
