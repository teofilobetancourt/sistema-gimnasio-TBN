"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Share2 } from "lucide-react";

interface MemberQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

export default function MemberQRModal({ isOpen, onClose, member }: MemberQRModalProps) {
  if (!isOpen || !member) return null;

  const downloadQR = () => {
    const svg = document.getElementById("member-qr");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${member.nombre}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        <div className="absolute top-6 right-6">
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 pt-12 flex flex-col items-center text-center">
          <div className="p-6 bg-white rounded-3xl mb-6 shadow-xl shadow-white/5">
            <QRCodeSVG 
              id="member-qr"
              value={member.id} 
              size={200} 
              level="H"
              includeMargin={true}
            />
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{member.nombre}</h3>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-8">{member.matricula ? `CÉDULA: ${member.matricula}` : "MIEMBRO"}</p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all border border-white/5"
            >
              <Download className="h-4 w-4" />
              PNG
            </button>
            <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20">
              <Share2 className="h-4 w-4" />
              COMPARTIR
            </button>
          </div>
        </div>
        
        <div className="bg-indigo-600/10 p-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Evolution Fitness Gym - Carnet Digital</p>
        </div>
      </div>
    </div>
  );
}
