'use client';

import { Trash2, GripVertical } from 'lucide-react';
import type { LocalPlaceItem } from '@/types/local';

interface PlaceItemProps {
  place: LocalPlaceItem;
  index: number;
  onGhichuChange: (index: number, ghichu: string) => void;
  onThoiluongChange: (index: number, thoiluong: number) => void;
  onRemove: (index: number) => void;
}

/**
 * Component hiển thị một địa điểm trong lịch trình Local
 * Cho phép người dùng nhập mẹo vặt (ghichu) và thời lượng tham quan
 */
export function PlaceItem({
  place,
  index,
  onGhichuChange,
  onThoiluongChange,
  onRemove,
}: PlaceItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
      {/* Drag Handle */}
      <div className="pt-1 text-slate-400 cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Thông tin Địa Điểm */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-sm font-bold">
            {index + 1}
          </span>
          <h3 className="font-semibold text-slate-900">{place.ten}</h3>
        </div>
        
        {/* Địa chỉ */}
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          📍 {place.diachi || 'Không có địa chỉ'}
        </p>

        {/* Ghi chú / Mẹo vặt */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mẹo vặt <span className="text-slate-400">(tuỳ chọn)</span>
            </label>
            <input
              type="text"
              placeholder="Nhập mẹo vặt hoặc lưu ý về địa điểm này..."
              value={place.ghichu || ''}
              onChange={(e) => onGhichuChange(index, e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Thời lượng tham quan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Thời lượng tham quan <span className="text-slate-400">(phút)</span>
            </label>
            <input
              type="number"
              min="0"
              step="15"
              placeholder="60"
              value={place.thoiluong || ''}
              onChange={(e) => onThoiluongChange(index, parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Xoá Button */}
      <button
        onClick={() => onRemove(index)}
        className="pt-1 text-red-500 hover:text-red-700 transition-colors"
        title="Xoá địa điểm này"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}
