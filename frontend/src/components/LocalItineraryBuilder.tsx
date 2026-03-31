'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, CheckCircle, Plus, Search, X, Car, Footprints, Bike } from 'lucide-react';
import { generateUUID } from '@/lib/uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import PlannerMap from './PlannerMap';
import { PlaceItem } from './PlaceItem';
import { localItineraryService } from '@/services/localItineraryService';
import { placesService } from '@/services/placesService';
import { useRoutePreview } from '@/hooks/useRoutePreview';
import type { LocalPlaceItem, SoThich, CreateLocalItineraryDto, UpdateLocalItineraryDto } from '@/types/local';

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

  // Search-related state
  const [sessionToken, setSessionToken] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<LocalPlaceItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Transport mode state
  const [transportMode, setTransportMode] = useState<'mapbox/driving-traffic' | 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling'>('mapbox/driving-traffic');

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
          // Load phương tiện từ database
          if (itinerary.phuongtien) {
            setTransportMode(itinerary.phuongtien as any);
          }

          // Chuyển đổi dữ liệu địa điểm từ response sang LocalPlaceItem
          if (itinerary.lichtrinh_local_diadiem && Array.isArray(itinerary.lichtrinh_local_diadiem)) {
            const convertedPlaces: LocalPlaceItem[] = itinerary.lichtrinh_local_diadiem
              .sort((a: any, b: any) => (a.thutu || 0) - (b.thutu || 0))
              .map((item: any) => ({
                mapboxPlaceId: item.diadiem.google_place_id,
                ten: item.diadiem.ten,
                diachi: item.diadiem.diachi || 'Không có địa chỉ',
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

  // Initialize session token on client-side only (prevents hydration mismatch)
  useEffect(() => {
    setSessionToken(generateUUID());
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If search input is empty, clear results
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Set debounce timer (300ms)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await placesService.searchPlaces(value, sessionToken);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce delay
  }, [sessionToken]);

  const handleSelectSearchResult = (place: LocalPlaceItem) => {
    if (places.some((p) => p.mapboxPlaceId === place.mapboxPlaceId)) {
      alert('Địa điểm này đã có trong lịch trình!');
      return;
    }

    setPlaces([...places, place]);
    setSearchInput(''); // Clear search input
    setSearchResults([]); // Clear results
    setShowSearchResults(false);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchResults([]);
    setShowSearchResults(false);
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

  // Get route info for display
  const { routeData, isLoading: isLoadingRoute } = useRoutePreview(
    memoizedGooglePlaceIds,
    memoizedSelectedPlaces,
    transportMode
  );

  // Format route display values
  const routeDisplay = useMemo(() => {
    if (!routeData) return null;
    const distance = routeData.tong_khoangcach ?? 0;
    const duration = routeData.tong_thoigian ?? 0;
    const distanceKm = (distance / 1000).toFixed(1);
    const durationMin = Math.round(duration / 60);
    return { distance: distanceKm, duration: durationMin };
  }, [routeData]);

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
          phuongtien: transportMode,
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
          phuongtien: transportMode,
          places,
        };

        await localItineraryService.createLocalItinerary(dto);

        setSubmitStatus('success');
        setSubmitMessage(`Tạo lịch trình "${tieude}" thành công!`);

        setTimeout(() => {
          setTieude('');
          setMota('');
          setSothicId(undefined);
          setTransportMode('mapbox/driving-traffic');
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
                className="w-full px-4 py-2 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
                className="w-full px-4 py-2 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 resize-none"
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
                className="w-full px-4 py-2 text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:bg-slate-100"
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
              
              {/* Custom Search Input */}
              <div className="relative">
                <div className="flex items-center px-4 py-2 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 focus-within:border-transparent">
                  <Search className="h-4 w-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Tìm địa điểm... (gõ chữ và chờ kết quả)"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="flex-1 px-0 py-0 text-slate-900 placeholder-slate-400 border-0 focus:outline-none"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="ml-2 p-1 hover:bg-slate-100 rounded-md"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                        <span className="ml-2 text-sm text-slate-600">Đang tìm kiếm...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((place, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSearchResult(place)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-0 focus:outline-none"
                          >
                            <p className="text-sm font-medium text-slate-900">{place.ten}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              📍 {place.diachi || 'Không có địa chỉ'}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        Không tìm thấy địa điểm nào
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-slate-500">
                💡 Session token: {sessionToken.substring(0, 8)}... (để gộp API calls)
              </div>
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
        {/* Transport Mode Selector */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 rounded-t-lg">
          <span className="text-sm font-semibold text-slate-700">Phương tiện:</span>
          
          <button
            onClick={() => setTransportMode('mapbox/driving-traffic')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              transportMode === 'mapbox/driving-traffic'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Car className="h-4 w-4" />
            <span className="text-sm font-medium">Xe</span>
          </button>

          <button
            onClick={() => setTransportMode('mapbox/driving')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              transportMode === 'mapbox/driving'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Car className="h-4 w-4" />
            <span className="text-sm font-medium">Xe (thường)</span>
          </button>

          <button
            onClick={() => setTransportMode('mapbox/walking')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              transportMode === 'mapbox/walking'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Footprints className="h-4 w-4" />
            <span className="text-sm font-medium">Đi bộ</span>
          </button>

          <button
            onClick={() => setTransportMode('mapbox/cycling')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              transportMode === 'mapbox/cycling'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Bike className="h-4 w-4" />
            <span className="text-sm font-medium">Xe đạp</span>
          </button>
        </div>

        {/* Map Container - Fixed Height */}
        <div className="h-[500px] rounded-xl border border-slate-200 overflow-hidden shadow-lg flex-shrink-0">
          <PlannerMap
            googlePlaceIds={memoizedGooglePlaceIds}
            places={memoizedPlacesForMap}
            selectedPlaces={memoizedSelectedPlaces}
            profile={transportMode}
          />
        </div>

        {/* Places List - Scrollable */}
        <div className="mt-6 max-h-[calc(100vh-480px)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 flex-1">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-50 pb-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              📍 Danh Sách Địa Điểm ({places.length})
            </h3>
            
            {/* Route Info Display */}
            {places.length >= 2 && routeDisplay && (
              <div className="flex items-center gap-2 text-xs text-slate-600 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
                {isLoadingRoute && <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />}
                <span>⏱️ {routeDisplay.duration} phút</span>
                <span>•</span>
                <span>📏 {routeDisplay.distance} km</span>
              </div>
            )}
          </div>

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