"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    // Optionally, render a loading spinner or null during loading
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#0f111a] text-white">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 lg:p-10 pt-20 md:pt-8 lg:pt-10">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
