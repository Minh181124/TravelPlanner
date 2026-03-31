"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, AlertCircle, Plus, Edit2, Trash2, Eye, 
  Filter, X, Calendar, MapPin, Heart, Clock, ChevronDown, ChevronLeft 
} from 'lucide-react';
import { localItineraryService } from '@/services/localItineraryService';
import type { LocalItinerary } from '@/types/local';

export default function LocalItinerariesPage() {
  const router = useRouter();
  
  // --- States ---
  const [itineraries, setItineraries] = useState<LocalItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSothich, setFilterSothich] = useState<string>('Tất cả');
  const [viewingItinerary, setViewingItinerary] = useState<LocalItinerary | null>(null);

  // --- Actions ---
  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await localItineraryService.getAllLocalItineraries();
      setItineraries(data);
    } catch (err: any) {
      setError('Không thể kết nối với máy chủ dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await localItineraryService.deleteLocalItinerary(id);
      setItineraries(itineraries.filter((it) => it.lichtrinh_local_id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError('Lỗi khi xóa bản ghi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = useMemo(() => {
    const sets = new Set(itineraries.map(it => it.sothich?.ten).filter(Boolean));
    return ['Tất cả', ...Array.from(sets)];
  }, [itineraries]);

  const filteredData = itineraries.filter(it => 
    filterSothich === 'Tất cả' || it.sothich?.ten === filterSothich
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20 relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Nút Quay lại trang chủ */}
        <button
          onClick={() => router.push('/')}
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-700 transition-colors mb-8"
        >
          <div className="p-2 rounded-full bg-white border-2 border-slate-300 group-hover:bg-indigo-50 group-hover:border-indigo-300 transition-all shadow-sm">
            <ChevronLeft size={18} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Quay lại trang chủ</span>
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-indigo-700 rounded-full" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Kho lưu trữ</span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Lịch Trình <span className="text-indigo-700">Local</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">Quản lý và điều chỉnh các hành trình mẫu của hệ thống.</p>
          </div>
          
          <Link
            href="/local/builder"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={20} />
            Tạo Mới
          </Link>
        </div>

        {/* Toolbar: Filter Section */}
        <div className="flex items-center gap-3 mb-10 relative">
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[11px] transition-all border shadow-sm ${
                isFilterOpen 
                ? 'bg-slate-800 border-slate-800 text-white' 
                : 'bg-white border-slate-300 text-slate-600 hover:border-indigo-400'
              }`}
            >
              <Filter size={14} className={isFilterOpen ? 'text-indigo-400' : 'text-slate-400'} />
              <span className="uppercase tracking-widest">Lọc theo sở thích</span>
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-60 bg-white border-2 border-slate-300 rounded-[20px] shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2">
                    <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1 text-center">Danh mục sở thích</p>
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterSothich(cat!);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all ${
                            filterSothich === cat 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setFilterSothich('Tất cả')}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
              filterSothich === 'Tất cả' 
              ? 'bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-200' 
              : 'bg-white border-slate-300 text-slate-500 hover:border-indigo-400 shadow-sm'
            }`}
          >
            Tất cả
          </button>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-indigo-700" size={40} />
            <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.3em]">Đang cập nhật...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border-2 border-slate-300 shadow-inner">
            <p className="text-slate-400 font-bold italic">Không tìm thấy dữ liệu phù hợp.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredData.map((itinerary) => (
              <div
                key={itinerary.lichtrinh_local_id}
                className="group bg-white rounded-[24px] border-2 border-slate-300 p-6 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50/40 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {itinerary.tieude}
                      </h3>
                      {itinerary.sothich && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-md border-2 border-slate-300">
                          {itinerary.sothich.ten}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[14px] font-medium leading-relaxed max-w-2xl line-clamp-2">
                      {itinerary.mota || 'Chưa có thông tin mô tả chi tiết.'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-[12px] font-bold text-slate-400">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <MapPin size={14} className="text-indigo-600" />
                        <span className="text-slate-600">{itinerary.lichtrinh_local_diadiem?.length || 0} điểm dừng</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{itinerary.ngaytao ? new Date(itinerary.ngaytao).toLocaleDateString('vi-VN') : 'Mới tạo'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-rose-500/80">
                        <Heart size={14} fill="currentColor" />
                        <span>{itinerary.luotthich || 0} yêu thích</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-center">
                    <button
                      onClick={() => setViewingItinerary(itinerary)}
                      className="p-3.5 bg-white border-2 border-slate-300 text-slate-400 rounded-xl hover:text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm"
                      title="Xem nhanh"
                    >
                      <Eye size={20} />
                    </button>
                    <Link
                      href={`/local/builder/${itinerary.lichtrinh_local_id}`}
                      className="p-3.5 bg-white border-2 border-slate-300 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
                    >
                      <Edit2 size={20} />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(itinerary.lichtrinh_local_id)}
                      className="p-3.5 bg-white border-2 border-slate-300 text-slate-400 rounded-xl hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-all shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- View Detail Modal --- */}
      {viewingItinerary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setViewingItinerary(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl border-2 border-slate-300 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-white bg-indigo-700 px-3 py-1 rounded-full uppercase tracking-[0.2em]">Thông tin chi tiết</span>
                  <h2 className="text-3xl font-black text-slate-800 leading-tight">{viewingItinerary.tieude}</h2>
                </div>
                <button onClick={() => setViewingItinerary(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-transparent hover:border-slate-300">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 border-2 border-slate-300 rounded-[20px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Thời gian</p>
                  <div className="flex items-center gap-3">
                    <Clock className="text-indigo-600" size={20} />
                    <span className="font-bold text-slate-700 text-lg">{new Date(viewingItinerary.ngaytao!).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div className="p-5 bg-slate-50 border-2 border-slate-300 rounded-[20px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Địa điểm</p>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-emerald-600" size={20} />
                    <span className="font-bold text-slate-700 text-lg">{viewingItinerary.lichtrinh_local_diadiem?.length || 0} điểm dừng</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lộ trình:</h4>
                <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {viewingItinerary.lichtrinh_local_diadiem?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-300 rounded-2xl hover:border-indigo-400 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-700 line-clamp-1">{item.diadiem?.ten || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link 
                  href={`/local/builder/${viewingItinerary.lichtrinh_local_id}`}
                  className="flex-[2] py-4 bg-indigo-700 text-white text-center font-bold rounded-2xl hover:bg-indigo-800 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Chỉnh sửa ngay
                </Link>
                <button 
                  onClick={() => setViewingItinerary(null)}
                  className="flex-1 py-4 bg-white text-slate-500 border-2 border-slate-300 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirm Overlay --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in duration-200 border-2 border-slate-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trash2 size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 leading-none">Xóa dữ liệu?</h3>
              <p className="text-slate-500 text-sm font-medium">Bạn có chắc muốn xóa lịch trình này khỏi hệ thống? Thao tác này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Hủy</button>
              <button 
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}