"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, X, MapPin, Sparkles, Calendar, 
  ChevronRight, Globe, ShieldCheck, Zap 
} from 'lucide-react';

export default function PlannerPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header - Glassmorphism */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Globe className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              TripPlanner Pro
            </span>
          </div>
          
          <nav className="hidden md:flex gap-8 items-center font-medium text-slate-600">
            <Link href="#" className="hover:text-indigo-600 transition">Khám phá</Link>
            <Link href="#" className="hover:text-indigo-600 transition">Tính năng</Link>
            <Link href="/local" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2">
              Bắt đầu ngay <ChevronRight size={18} />
            </Link>
          </nav>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
            <div className="absolute bottom-0 right-[-5%] w-[30%] h-[50%] bg-violet-50 rounded-full blur-[120px] opacity-60" />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100 animate-fade-in">
              <Sparkles size={16} />
              <span>Cá nhân hóa hành trình bằng AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Lên kế hoạch chuyến đi <br />
              <span className="text-indigo-600">chỉ trong vài giây.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Tạm biệt việc lên lịch thủ công. Hệ thống thông minh sẽ tự động tối ưu hóa lộ trình, thời gian và ngân sách dựa trên sở thích của riêng bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/local" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-indigo-200">
                Tạo lịch trình đầu tiên
              </Link>
              <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors">
                Xem bản demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto py-20 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="text-amber-500" />}
              title="Tốc độ AI cực nhanh"
              desc="Tự động hóa mọi bước từ đặt chỗ đến sắp xếp thời gian di chuyển chỉ với một câu lệnh."
            />
            <FeatureCard 
              icon={<MapPin className="text-emerald-500" />}
              title="Địa điểm chọn lọc"
              desc="Đề xuất các địa điểm 'hidden gem' ít người biết nhưng cực kỳ đáng trải nghiệm."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-blue-500" />}
              title="Lưu trữ an toàn"
              desc="Toàn bộ lịch trình được đồng bộ hóa và bảo mật tuyệt đối, truy cập mọi lúc mọi nơi."
            />
          </div>
        </section>
      </main>

      {/* Footer Simple */}
      <footer className="border-t border-slate-100 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 TripPlanner Pro. Được phát triển bởi đội ngũ đam mê xê dịch.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-[32px] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}