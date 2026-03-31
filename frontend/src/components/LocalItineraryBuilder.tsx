'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import PlannerMap from './PlannerMap';
import { PlaceItem } from './PlaceItem';
import { localItineraryService } from '@/services/localItineraryService';
import type { LocalPlaceItem, SoThich, CreateLocalItineraryDto, UpdateLocalItineraryDto } from '@/types/local';

const SearchBox = dynamic(
  () => import('@mapbox/search-js-react').then((mod) => mod.SearchBox),
  { ssr: false }
);

export interface LocalItineraryBuilderProps {
  editId?: number;
}

/**
 * Component chính cho trang tạo/chỉnh sửa lịch trình Local
 * Cho phép tìm kiếm, thêm địa điểm, nhập mẹo vặt, xem trước bản đồ, và lưu lịch trình
 */
export default function LocalItineraryBuilder({ editId }: LocalItineraryBuilderProps) {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  const isEditMode = !!editId;

  const [tieude, setTieude] = useState('');
  const [mota, setMota] = useState('');
  const [sothich_id, setSothicId] = useState<number | undefined>();
  const [places, setPlaces] = useState<LocalPlaceItem[]>([]);
  const [searchSuggestion, setSearchSuggestion] = useState<LocalPlaceItem | null>(null);

  const [soThichList, setSoThichList] = useState<SoThich[]>([]);
  const [isLoadingSoThich, setIsLoadingSoThich] = useState(true);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load danh sách sở thích
        const soThichData = await localItineraryService.getSoThichList();
        setSoThichList(soThichData);

        // Nếu đang edit, load dữ liệu lịch trình hiện có
        if (isEditMode && editId) {
          const itinerary = await localItineraryService.getLocalItinerary(editId);
          setTieude(itinerary.tieude);
          setMota(itinerary.mota || '');
          setSothicId(itinerary.sothich_id || undefined);

          // Chuyển đổi dữ liệu địa điểm từ response sang LocalPlaceItem
          if (itinerary.lichtrinh_local_diadiem && Array.isArray(itinerary.lichtrinh_local_diadiem)) {
            const convertedPlaces: LocalPlaceItem[] = itinerary.lichtrinh_local_diadiem
              .sort((a: any, b: any) => (a.thutu || 0) - (b.thutu || 0))
              .map((item: any) => ({
                mapboxPlaceId: item.diadiem.google_place_id,
                ten: item.diadiem.ten,
                lat: item.diadiem.lat || 0,
                lng: item.diadiem.lng || 0,
                ghichu: item.ghichu || undefined,
                thoiluong: item.thoiluong || 60,
              }));
            setPlaces(convertedPlaces);
          }
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        setSubmitStatus('error');
        setSubmitMessage('Lỗi tải dữ liệu lịch trình');
      } finally {
        setIsLoadingSoThich(false);
        setIsLoadingEdit(false);
      }
    };

    loadData();
  }, [editId, isEditMode]);

  const handleSearchRetrieve = (res: any) => {
    if (!res.features || res.features.length === 0) return;

    const feature = res.features[0];
    const searchPlace: LocalPlaceItem = {
      mapboxPlaceId: feature.properties.mapbox_id,
      ten: feature.properties.name,
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      ghichu: undefined,
      thoiluong: 60,
    };

    // Lưu vào suggestion thay vì auto-add
    setSearchSuggestion(searchPlace);
  };

  const handleAddPlaceFromSuggestion = () => {
    if (!searchSuggestion) return;

    if (places.some((p) => p.mapboxPlaceId === searchSuggestion.mapboxPlaceId)) {
      alert('Địa điểm này đã có trong lịch trình!');
      return;
    }

    setPlaces([...places, searchSuggestion]);
    setSearchSuggestion(null); // Clear suggestion sau khi thêm
  };

  const handleGhichuChange = (index: number, ghichu: string) => {
    const updated = [...places];
    updated[index].ghichu = ghichu || undefined;
    setPlaces(updated);
  };

  const handleThoiluongChange = (index: number, thoiluong: number) => {
    const updated = [...places];
    updated[index].thoiluong = thoiluong || undefined;
    setPlaces(updated);
  };

  const handleRemovePlace = (index: number) => {
    setPlaces(places.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Nếu không có destination (dropped outside), không làm gì
    if (!destination) {
      return;
    }

    // Nếu dropped tại cùng vị trí, không làm gì
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Reorder mảng places
    const newPlaces = Array.from(places);
    const [removed] = newPlaces.splice(source.index, 1);
    newPlaces.splice(destination.index, 0, removed);

    setPlaces(newPlaces);
    // Note: Polyline sẽ tự động cập nhật vì places đã thay đổi
  };

  // ========== MEMOIZED PROPS (FIX: Prevent infinite Mapbox API calls) ==========
  const memoizedGooglePlaceIds = useMemo(
    () => places.map((p) => p.mapboxPlaceId),
    [places]
  );

  const memoizedPlacesForMap = useMemo(
    () =>
      places.map((p, i) => ({
        diadiem_id: i,
        ten: p.ten,
        lat: p.lat,
        lng: p.lng,
      })),
    [places]
  );

  const memoizedSelectedPlaces = useMemo(
    () =>
      places.map((p) => ({
        geometry: { coordinates: [p.lng, p.lat] },
      })),
    [places]
  );

  const handleSubmit = async () => {
    if (!tieude.trim()) {
      setSubmitMessage('Vui lòng nhập tiêu đề lịch trình');
      setSubmitStatus('error');
      return;
    }

    if (places.length < 2) {
      setSubmitMessage('Cần ít nhất 2 địa điểm để tạo lịch trình');
      setSubmitStatus('error');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus('idle');

      if (isEditMode && editId) {
        // Mode chỉnh sửa
        const dto: UpdateLocalItineraryDto = {
          tieude,
          mota: mota || undefined,
          sothich_id: sothich_id || undefined,
          places,
        };

        await localItineraryService.updateLocalItinerary(editId, dto);

        setSubmitStatus('success');
        setSubmitMessage(`Cập nhật lịch trình "${tieude}" thành công!`);

        setTimeout(() => {
          window.location.href = '/local';
        }, 2000);
      } else {
        // Mode tạo mới
        const dto: CreateLocalItineraryDto = {
          tieude,
          mota: mota || undefined,
          sothich_id: sothich_id || undefined,
          places,
        };

        await localItineraryService.createLocalItinerary(dto);

        setSubmitStatus('success');
        setSubmitMessage(`Tạo lịch trình "${tieude}" thành công!`);

        setTimeout(() => {
          setTieude('');
          setMota('');
          setSothicId(undefined);
          setPlaces([]);
          setSubmitStatus('idle');
        }, 2000);
      }
    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(
        error.response?.data?.message || 
        (isEditMode ? 'Lỗi cập nhật lịch trình. Vui lòng thử lại!' : 'Lỗi tạo lịch trình. Vui lòng thử lại!')
      );
      console.error('Lỗi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
    <div className="flex flex-col md:grid md:grid-cols-3 gap-6 h-full overflow-hidden p-6">
      {/* FORM - Left Side */}
      <div className="md:col-span-1 space-y-6 overflow-y-auto border-r border-slate-200 pr-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Chỉnh Sửa Lịch Trình' : 'Tạo Lịch Trình'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isEditMode
              ? 'Cập nhật lịch trình mẫu'
              : 'Xây dựng lịch trình mẫu và lưu vào hệ thống'}
          </p>
        </div>

        {isLoadingEdit ? (
          <div className="space-y-4">
            <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-24 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Một ngày ở Sài Gòn"
                value={tieude}
                onChange={(e) => setTieude(e.target.value)}
                maxLength={255}
                className="w-full px-4 py-2 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mô tả <span className="text-slate-400">(tuỳ chọn)</span>
              </label>
              <textarea
                placeholder="Mô tả chi tiết về lịch trình này..."
                value={mota}
                onChange={(e) => setMota(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sở thích <span className="text-slate-400">(tuỳ chọn)</span>
              </label>
              <select
                value={sothich_id || ''}
                onChange={(e) => setSothicId(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={isLoadingSoThich}
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              >
                <option value="">-- Chọn sở thích --</option>
                {soThichList.map((st) => (
                  <option key={st.sothich_id} value={st.sothich_id} className="text-slate-900">
                    {st.ten}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tìm & Thêm Địa Điểm
              </label>
              <SearchBox
                accessToken={MAPBOX_TOKEN}
                onRetrieve={handleSearchRetrieve}
                placeholder="Tìm địa điểm..."
              />

              {/* Hiển thị suggestion khi có kết quả tìm kiếm */}
              {searchSuggestion && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{searchSuggestion.ten}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Lat: {searchSuggestion.lat.toFixed(4)}, Lng: {searchSuggestion.lng.toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={handleAddPlaceFromSuggestion}
                    className="ml-3 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || places.length < 2}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  {isEditMode ? 'Cập Nhật Lịch Trình' : 'Lưu Lịch Trình'}
                </>
              )}
            </button>

            {submitMessage && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  submitStatus === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {submitStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{submitMessage}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* MAP & PLACES - Right Side */}
      <div className="md:col-span-2 h-full flex flex-col overflow-hidden">
        {/* Map Container - Fixed Height */}
        <div className="h-[500px] rounded-xl border border-slate-200 overflow-hidden shadow-lg flex-shrink-0">
          <PlannerMap
            googlePlaceIds={memoizedGooglePlaceIds}
            places={memoizedPlacesForMap}
            selectedPlaces={memoizedSelectedPlaces}
          />
        </div>

        {/* Places List - Scrollable */}
        <div className="mt-6 max-h-[calc(100vh-480px)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 sticky top-0 bg-slate-50 pb-2">
            📍 Danh Sách Địa Điểm ({places.length})
          </h3>

          {places.length === 0 ? (
            <p className="text-xs text-slate-500">Tìm kiếm và thêm địa điểm bên trái</p>
          ) : (
            <Droppable droppableId="places-list">
              {(provided, snapshot) => (
                <div
                  className="space-y-3"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {places.map((place, index) => (
                    <Draggable key={`place-${index}`} draggableId={`place-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`transition-all ${
                            snapshot.isDragging
                              ? 'opacity-50 shadow-lg scale-105'
                              : 'opacity-100'
                          }`}
                        >
                          <div {...provided.dragHandleProps}>
                            <PlaceItem
                              place={place}
                              index={index}
                              onGhichuChange={handleGhichuChange}
                              onThoiluongChange={handleThoiluongChange}
                              onRemove={handleRemovePlace}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      </div>
    </div>
    </DragDropContext>
  );
}