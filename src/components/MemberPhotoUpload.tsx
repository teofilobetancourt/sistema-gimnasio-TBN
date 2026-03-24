"use client";

import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, X, RefreshCw, Check } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

interface MemberPhotoUploadProps {
  onPhotoUploaded: (url: string) => void;
  matricula: string;
}

export default function MemberPhotoUpload({ onPhotoUploaded, matricula }: MemberPhotoUploadProps) {
  const [mode, setMode] = useState<"initial" | "camera" | "upload">("initial");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPreview(imageSrc);
      setMode("initial");
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setMode("initial");
      };
      reader.readAsDataURL(file);
    }
  };

  const savePhoto = async () => {
    if (!preview || !matricula) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `miembros/${matricula}_profile.jpg`);
      // uploadString uses base64
      await uploadString(storageRef, preview, "data_url");
      const downloadURL = await getDownloadURL(storageRef);
      onPhotoUploaded(downloadURL);
      alert("Foto guardada correctamente");
    } catch (error) {
      console.error("Error saving photo:", error);
      alert("Error al guardar la foto en el servidor.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-400 mb-1">Foto de Perfil (Opcional)</label>
      
      <div className="relative h-48 w-48 mx-auto bg-gray-800 border-2 border-dashed border-gray-700 rounded-2xl overflow-hidden flex items-center justify-center group transition-all hover:border-indigo-500">
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <button 
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : mode === "camera" ? (
          <div className="absolute inset-0">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="h-full w-full object-cover"
              videoConstraints={{ facingMode: "user" }}
            />
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2">
              <button 
                onClick={capture}
                className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all scale-90 hover:scale-100"
              >
                <Camera className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setMode("initial")}
                className="p-3 bg-gray-900/80 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <UserIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <div className="flex flex-col gap-2">
               <button 
                type="button"
                onClick={() => setMode("camera")}
                className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-all"
               >
                 Abrir Cámara
               </button>
               <label className="cursor-pointer text-xs font-bold bg-white/5 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">
                 Subir Archivo
                 <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
               </label>
            </div>
          </div>
        )}
      </div>

      {preview && !uploading && (
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={savePhoto}
            className="flex items-center gap-2 text-xs font-black bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Check className="h-4 w-4" />
            CONFIRMAR Y SUBIR FOTO
          </button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-emerald-500 text-xs font-bold animate-pulse">
          <RefreshCw className="h-4 w-4 animate-spin" />
          SUBIENDO...
        </div>
      )}
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
