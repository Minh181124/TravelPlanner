"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, AlertCircle, Plus, Edit2, Trash2, Eye, 
  Filter, X, Calendar, MapPin, Heart, Clock, ChevronDown, ChevronLeft,
  Navigation, Map as MapIcon
} from 'lucide-react';
import PlannerMap from '@/components/PlannerMap';
import { localItineraryService } from '@/services/localItineraryService';
import type { LocalItinerary } from '@/types/local';

// Danh sách sở thích gợi ý cho hệ thống
const SOTHICH_LIST = [
  { id: 1, ten: 'Văn hóa' },
  { id: 2, ten: 'Ẩm thực' },
  { id: 3, ten: 'Nghỉ dưỡng' },
  { id: 4, ten: 'Mua sắm' },
  { id: 5, ten: 'Khám phá' },
  { id: 6, ten: 'Check-in' }
];

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
  
  // Trạng thái chờ để Mapbox render sau khi Modal animation kết thúc
  const [isMapReady, setIsMapReady] = useState(false);

  // --- Actions ---
  useEffect(() => {
    loadItineraries();
  }, []);

  // Xử lý logic hiển thị bản đồ
  useEffect(() => {
    if (viewingItinerary) {
      const timer = setTimeout(() => setIsMapReady(true), 400); 
      return () => clearTimeout(timer);
    } else {
      setIsMapReady(false);
    }
  }, [viewingItinerary]);

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

  // --- Logic Lọc ---
  const categories = useMemo(() => {
    return ['Tất cả', ...SOTHICH_LIST.map(s => s.ten)];
  }, []);

  const filteredData = itineraries.filter(it => 
    filterSothich === 'Tất cả' || it.sothich?.ten === filterSothich
  );

  const getTransportModeName = (mode?: string | null) => {
    const modeMap: Record<string, string> = {
      'mapbox/driving-traffic': '🚗 Xe (đông đúc)',
      'mapbox/driving': '🚗 Xe (thường)',
      'mapbox/walking': '🚶 Đi bộ',
      'mapbox/cycling': '🚴 Xe đạp',
    };
    return modeMap[mode || ''] || '🚗 Không xác định';
  };

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
            <p className="text-slate-500 font-medium text-sm">Quản lý và điều chỉnh các hành trình mẫu của hệ thống AI.</p>
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
                    <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1 text-center">Danh mục gợi ý</p>
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

          {filterSothich !== 'Tất cả' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase animate-in zoom-in">
              {filterSothich}
              <button onClick={() => setFilterSothich('Tất cả')}><X size={14} /></button>
            </div>
          )}

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
            <p className="text-slate-400 font-bold italic">Không tìm thấy lịch trình "{filterSothich}" nào.</p>
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
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-tighter rounded-md border-2 border-indigo-100">
                          {itinerary.sothich.ten}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[14px] font-medium leading-relaxed max-w-2xl line-clamp-2">
                      {itinerary.mota || 'Chưa có thông tin mô tả chi tiết.'}
                    </p>
                    
                    <div className="flex items-center gap-6 text-[12px] font-bold text-slate-400">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <MapPin size={14} className="text-indigo-600" />
                        <span className="text-slate-600">{itinerary.lichtrinh_local_diadiem?.length || 0} điểm dừng</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{itinerary.ngaytao ? new Date(itinerary.ngaytao).toLocaleDateString('vi-VN') : 'Mới tạo'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-center">
                    <button
                      onClick={() => setViewingItinerary(itinerary)}
                      className="p-3.5 bg-white border-2 border-slate-300 text-slate-400 rounded-xl hover:text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm"
                      title="Xem chi tiết"
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

      {/* --- MODAL CHI TIẾT VỚI MAPBOX INTERACTIVE --- */}
      {viewingItinerary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setViewingItinerary(null)} />
          <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[32px] shadow-2xl border-2 border-slate-300 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* Cột Trái: Thông tin */}
              <div className="w-full md:w-1/3 border-r-2 border-slate-100 flex flex-col h-full bg-slate-50/50">
                <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-white bg-indigo-700 px-3 py-1 rounded-full uppercase tracking-[0.2em] inline-block">Review hành trình</span>
                    <h2 className="text-2xl font-black text-slate-800 leading-tight">{viewingItinerary.tieude}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Mô tả</p>
                      <p className="text-sm font-medium text-slate-600">{viewingItinerary.mota || 'Không có mô tả chi tiết.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-center">
                        <Clock size={16} className="text-indigo-600 mx-auto mb-1" />
                        <p className="text-[9px] font-black text-slate-400 uppercase">Ngày tạo</p>
                        <p className="font-bold text-slate-700 text-sm">{new Date(viewingItinerary.ngaytao!).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-center">
                        <Navigation size={16} className="text-emerald-600 mx-auto mb-1" />
                        <p className="text-[9px] font-black text-slate-400 uppercase">Phương tiện</p>
                        <p className="font-bold text-slate-700 text-[10px]">{getTransportModeName(viewingItinerary.phuongtien)}</p>
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest pt-3 flex items-center gap-2">
                      Điểm dừng ({viewingItinerary.lichtrinh_local_diadiem?.length})
                      <MapIcon size={14} className="text-indigo-400" />
                    </h4>
                    
                    <div className="space-y-2">
                      {viewingItinerary.lichtrinh_local_diadiem?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-700 truncate text-xs">{item.diadiem?.ten || 'Địa điểm không tên'}</p>
                            <p className="text-[10px] text-slate-400">{item.thoiluong ? `⏱️ Dừng ${item.thoiluong} phút` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t-2 border-slate-100">
                  <button onClick={() => setViewingItinerary(null)} className="w-full py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all">Đóng</button>
                </div>
              </div>

              {/* Cột Phải: MAPBOX INTERACTIVE */}
              <div className="flex-1 h-full relative bg-slate-100 min-h-[400px] md:min-h-0">
                {isMapReady && viewingItinerary.lichtrinh_local_diadiem ? (
                  <div className="absolute inset-0 w-full h-full">
                    <PlannerMap
                      googlePlaceIds={viewingItinerary.lichtrinh_local_diadiem.map((l: any) => l.diadiem?.google_place_id || '')}
                      places={viewingItinerary.lichtrinh_local_diadiem.map((l: any, i: number) => ({
                        diadiem_id: l.lichtrinh_local_diadiem_id || i,
                        ten: l.diadiem?.ten || '',
                        lat: l.diadiem?.lat || 0,
                        lng: l.diadiem?.lng || 0,
                      }))}
                      selectedPlaces={viewingItinerary.lichtrinh_local_diadiem.map((l: any) => ({
                        geometry: { coordinates: [l.diadiem?.lng || 0, l.diadiem?.lat || 0] },
                      }))}
                      profile={(viewingItinerary.phuongtien as any) || 'mapbox/driving-traffic'}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 opacity-30" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang khởi tạo bản đồ...</p>
                  </div>
                )}
                
                {/* Close Button cho mobile */}
                <button onClick={() => setViewingItinerary(null)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg border-2 border-slate-300 md:hidden z-20"><X size={24} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirm Overlay --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in border-2 border-slate-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner"><Trash2 size={40} /></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 leading-none">Xóa dữ liệu?</h3>
              <p className="text-slate-500 text-sm font-medium">Bạn có chắc muốn xóa lịch trình này?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Hủy</button>
              <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={isDeleting} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all">{isDeleting ? 'Đang xóa...' : 'Xác nhận'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}