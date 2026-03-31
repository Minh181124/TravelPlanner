"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, Map } from "lucide-react";
import LocalItineraryBuilder from "@/components/LocalItineraryBuilder";

/**
 * Page: /local/builder
 * Đồ án: AI Trip Planner - Đã fix lỗi clipping pixel và dropdown
 */
export default function LocalBuilderPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 relative overflow-x-hidden">
      {/* Hiệu ứng nền Modern AI - Tăng độ mờ để tập trung vào nội dung */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-indigo-50/60 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[45%] bg-violet-50/60 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12 space-y-10 relative">
        
        {/* Header Section: Back Button + Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-6">
            {/* Nút quay lại thiết kế tinh tế */}
            <button 
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <div className="p-2 rounded-full bg-slate-100 group-hover:bg-indigo-50 transition-colors shadow-sm">
                <ChevronLeft size={20} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Trở về trang chủ</span>
            </button>

            {/* Tiêu đề tương phản cao */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-indigo-600 rounded-full" />
                <span className="text-[10px] font-black tracking-[0.4em] text-indigo-600 uppercase">
                  Công cụ tạo mẫu
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Trình tạo <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-violet-600 to-indigo-700">lịch trình</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-md text-sm">
                Xây dựng lộ trình mẫu cho hệ thống AI của Khôi tại Gò Vấp.
              </p>
            </div>
          </div>

          {/* Badge trạng thái */}
          <div className="hidden lg:flex items-center gap-4 px-6 py-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-amber-50 p-2.5 rounded-2xl">
              <Sparkles className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hệ thống</p>
              <p className="text-sm font-bold text-slate-700">Đang sẵn sàng</p>
            </div>
          </div>
        </div>

        {/* Khu vực nội dung chính - FIX LỖI THIẾU PIXEL TẠI ĐÂY */}
        <div className="relative group">
          {/* Lớp bóng đổ gradient phía sau */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-[42px] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          {/* Container chính: 
            - QUAN TRỌNG: Bỏ overflow-hidden để dropdown không bị cắt.
            - border-2 border-slate-300: Viền dày hơn và đậm hơn để rõ ràng.
            - overflow-x-hidden: Tránh tràn ngang
          */}
          <div className="relative bg-white rounded-[32px] border-2 border-slate-300 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] min-h-[650px] overflow-x-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <div className="w-full h-full rounded-[31px]">
                <LocalItineraryBuilder />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Loading Skeleton thiết kế đồng bộ
 */
function LoadingFallback() {
  return (
    <div className="animate-pulse p-10 space-y-10">
      <div className="flex justify-between items-center">
        <div className="h-10 bg-slate-100 rounded-xl w-64" />
        <div className="h-10 bg-indigo-50 rounded-xl w-40" />
      </div>
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-50 rounded-[28px]" />
          ))}
        </div>
        <div className="lg:col-span-2 h-[550px] bg-slate-50 rounded-[32px] flex items-center justify-center">
          <Map className="text-slate-200" size={64} />
        </div>
      </div>
    </div>
  );
}