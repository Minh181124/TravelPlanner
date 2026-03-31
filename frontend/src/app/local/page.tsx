'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { localItineraryService } from '@/services/localItineraryService';
import type { LocalItinerary } from '@/types/local';

/**
 * Page: /local
 * Danh sách tất cả lịch trình Local mẫu với chức năng Edit & Delete
 */
export default function LocalItinerariesPage() {
  const [itineraries, setItineraries] = useState<LocalItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setError(err.message || 'Lỗi tải danh sách lịch trình');
      console.error('Error:', err);
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
      setError(err.message || 'Lỗi xóa lịch trình');
      console.error('Error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Lịch Trình Local</h1>
            <p className="text-slate-600 mt-2">Quản lý các lịch trình mẫu đã tạo</p>
          </div>
          <Link
            href="/local/builder"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} />
            Tạo Mới
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Có lỗi xảy ra</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-600 mb-4">Chưa có lịch trình Local nào</p>
            <Link
              href="/local/builder"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
              Tạo Lịch Trình Đầu Tiên
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {itineraries.map((itinerary) => (
              <div
                key={itinerary.lichtrinh_local_id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {itinerary.tieude}
                    </h3>
                    {itinerary.mota && (
                      <p className="text-slate-600 text-sm mt-1">{itinerary.mota}</p>
                    )}
                  </div>
                  {itinerary.sothich && (
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                      {itinerary.sothich.ten}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <span>📍 {itinerary.lichtrinh_local_diadiem?.length || 0} địa điểm</span>
                  {itinerary.ngaytao && (
                    <span>📅 {new Date(itinerary.ngaytao).toLocaleDateString('vi-VN')}</span>
                  )}
                  {itinerary.luotthich !== undefined && (
                    <span>❤️ {itinerary.luotthich} lượt thích</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                  <Link
                    href={`/local/${itinerary.lichtrinh_local_id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                  >
                    <Eye size={16} />
                    Xem
                  </Link>
                  <Link
                    href={`/local/builder/${itinerary.lichtrinh_local_id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                  >
                    <Edit2 size={16} />
                    Chỉnh Sửa
                  </Link>
                  <button
                    onClick={() =>
                      deleteConfirm === itinerary.lichtrinh_local_id
                        ? handleDelete(itinerary.lichtrinh_local_id)
                        : setDeleteConfirm(itinerary.lichtrinh_local_id)
                    }
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                  >
                    {deleteConfirm === itinerary.lichtrinh_local_id ? (
                      <>
                        <Trash2 size={16} />
                        Xác Nhận Xóa?
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Xóa
                      </>
                    )}
                  </button>
                  {deleteConfirm === itinerary.lichtrinh_local_id && (
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      disabled={isDeleting}
                      className="text-sm font-medium text-slate-700 px-2 py-1.5 rounded hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
