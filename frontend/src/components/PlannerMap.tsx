'use client';

import { useMemo } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl/mapbox';
import { useRoutePreview } from '@/hooks/useRoutePreview';
import { Loader2, AlertCircle, MapPin } from 'lucide-react';
import type { DiaDiem, RouteData } from '@/types';
import type {
  LineLayerSpecification,
  CircleLayerSpecification,
} from 'react-map-gl/mapbox';

/**
 * Kiểu nhẹ chỉ chứa các trường mà PlannerMap thực sự dùng.
 * Cho phép truyền vào đối tượng DiaDiem đầy đủ hoặc chỉ 4 trường cần thiết.
 */
type PlannerMapPlace = Pick<DiaDiem, 'diadiem_id' | 'ten' | 'lat' | 'lng'>;

import 'mapbox-gl/dist/mapbox-gl.css';

// ---------------------------------------------------------------------------
// Hằng số
// ---------------------------------------------------------------------------

/**
 * Token Mapbox GL lấy từ biến môi trường.
 * Cần đặt `NEXT_PUBLIC_MAPBOX_TOKEN` trong file `.env.local`.
 */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

/**
 * Vị trí mặc định khi bản đồ khởi tạo: TP. Hồ Chí Minh.
 * Sử dụng `lat` và `lng` tương tự cấu trúc của bảng `diadiem`.
 */
const DEFAULT_VIEW = {
  longitude: 106.6297,
  latitude: 10.8231,
  zoom: 12,
} as const;

// ---------------------------------------------------------------------------
// Kiểu dáng Layer trên bản đồ
// ---------------------------------------------------------------------------

/**
 * Style cho layer đường polyline tuyến đường.
 * Màu Indigo-500 nổi bật trên nền bản đồ Mapbox streets.
 */
const routeLineLayer: LineLayerSpecification = {
  id: 'route-line',
  type: 'line',
  source: 'route-source',
  paint: {
    'line-color': '#6366f1', // Indigo-500
    'line-width': 4,
    'line-opacity': 0.85,
  },
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
};

/**
 * Style cho layer các điểm waypoint dọc theo tuyến đường.
 */
const waypointCircleLayer: CircleLayerSpecification = {
  id: 'waypoint-dots',
  type: 'circle',
  source: 'waypoint-source',
  paint: {
    'circle-radius': 7,
    'circle-color': '#6366f1',
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#ffffff',
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props cho component PlannerMap.
 *
 * Cách hoạt động:
 *   - `googlePlaceIds`: Mảng `diadiem.google_place_id` đã sắp xếp theo thứ tự
 *     người dùng muốn → truyền vào hook `useRoutePreview` để lấy polyline.
 *   - `places`: Mảng object `DiaDiem` (từ bảng `diadiem`) để hiển thị
 *     marker có đánh số trên bản đồ, sử dụng `lat` và `lng`.
 *   - `routeCoordinates`: Mảng [lng, lat][] tọa độ đã giải mã từ polyline
 *     (auto-populated từ hook, không cần truyền từ ngoài).
 *   - `routeData`: Dữ liệu tuyến đường từ Backend gồm tong_khoangcach, tong_thoigian
 *     (auto-populated từ hook, không cần truyền từ ngoài).
 */
export interface PlannerMapProps {
  /** Danh sách `google_place_id` đã sắp xếp để xem trước tuyến đường */
  googlePlaceIds: string[];
  /** Danh sách đối tượng địa điểm (tùy chọn) để hiển thị marker có nhãn */
  places?: PlannerMapPlace[];
  /** Đối tượng Mapbox Feature gốc (có geometry.coordinates) để gửi tọa độ cho backend */
  selectedPlaces?: any[];
  /** Mảng tọa độ [lng, lat][] của tuyến đường (tự động từ hook useRoutePreview) */
  routeCoordinates?: [number, number][];
  /** Dữ liệu tuyến đường từ Backend: { polyline, tong_khoangcach, tong_thoigian } */
  routeData?: RouteData;
  /** Phương tiện di chuyển (driving-traffic, driving, walking, cycling) */
  profile?: string;
  /** Class CSS bổ sung */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Bản đồ Mapbox tương tác hiển thị:
 *   1. Polyline tuyến đường lấy qua hook `useRoutePreview`.
 *   2. Marker có đánh số cho mỗi địa điểm trong lịch trình.
 *   3. Overlay trạng thái loading / error.
 *
 * Cách hoạt động:
 *   - Sử dụng `react-map-gl` (wrapper của Mapbox GL JS).
 *   - Hook `useRoutePreview` quản lý logic debounce + fetch polyline.
 *   - Polyline được chuyển thành GeoJSON LineString để render trên layer.
 *   - Marker sử dụng `diadiem.lat` và `diadiem.lng` để định vị,
 *     và `diadiem.ten` để hiển thị tooltip khi hover.
 *   - Badge tổng hợp hiển thị `tong_khoangcach` (km) và `tong_thoigian` (phút)
 *     — ánh xạ từ `tuyen_duong.tong_khoangcach` và `tuyen_duong.tong_thoigian`.
 *
 * @see useRoutePreview — quản lý việc lấy polyline có debounce
 * @see DiaDiem — interface địa điểm từ bảng `diadiem`
 */
export default function PlannerMap({
  googlePlaceIds,
  places = [],
  selectedPlaces = [],
  profile = 'mapbox/driving-traffic',
  className = '',
}: PlannerMapProps) {
  const { coordinates, routeData, isLoading, error } =
    useRoutePreview(googlePlaceIds, selectedPlaces, profile);

  // -----------------------------------------------------------------------
  // Tính toán giá trị hiển thị cho badge (vô và giây)
  // -----------------------------------------------------------------------

  /**
   * Chuyển mét sang km và giây sang phút, với đảm bảo dữ liệu hợp lệ.
   * Đồng thời kiểm tra các giá trị NaN/undefined trước khi tính toán.
   */
  const displayRouteValues = useMemo(() => {
    if (!routeData) return null;

    // Lấy khoảng cách — đặt 0 nếu không có
    const distance = routeData.tong_khoangcach ?? 0;
    const isValidDistance = typeof distance === 'number' && !isNaN(distance) && distance > 0;

    // Lấy thời gian — đặt 0 nếu không có
    const duration = routeData.tong_thoigian ?? 0;
    const isValidDuration = typeof duration === 'number' && !isNaN(duration) && duration > 0;

    return {
      distance: isValidDistance ? (distance / 1000).toFixed(1) : 'N/A',
      duration: isValidDuration ? Math.round(duration / 60) : 'N/A',
      isValid: isValidDistance && isValidDuration,
    };
  }, [routeData]);

  // -----------------------------------------------------------------------
  // Nguồn dữ liệu GeoJSON (memo để tránh tạo lại object mỗi lần render)
  // -----------------------------------------------------------------------

  /**
   * Chuyển polyline thành GeoJSON LineString.
   * Tọa độ [lng, lat][] đã được giải mã từ `tuyen_duong.polyline`.
   */
  const routeGeoJSON = useMemo(() => {
    if (coordinates.length < 2) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates,
      },
    };
  }, [coordinates]);

  /**
   * Chuyển danh sách địa điểm thành GeoJSON FeatureCollection (Points).
   * Sử dụng `diadiem.lng`, `diadiem.lat` cho tọa độ và `diadiem.ten` cho nhãn.
   */
  const waypointGeoJSON = useMemo(() => {
    const points = places
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({
        type: 'Feature' as const,
        properties: { ten: p.ten },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.lng!, p.lat!],
        },
      }));
    return {
      type: 'FeatureCollection' as const,
      features: points,
    };
  }, [places]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      id="planner-map-container"
      className={`relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-lg ${className}`}
    >
      <Map
        id="planner-map"
        initialViewState={DEFAULT_VIEW}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
        reuseMaps
      >
        {/* ---- Polyline tuyến đường ---- */}
        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLineLayer} />
          </Source>
        )}

        {/* ---- Các điểm waypoint ---- */}
        {waypointGeoJSON.features.length > 0 && (
          <Source id="waypoint-source" type="geojson" data={waypointGeoJSON}>
            <Layer {...waypointCircleLayer} />
          </Source>
        )}

        {/* ---- Marker có đánh số (sử dụng diadiem_id làm key) ---- */}
        {places
          .filter((p) => p.lat != null && p.lng != null)
          .map((place, idx) => (
            <Marker
              key={place.diadiem_id}
              longitude={place.lng!}
              latitude={place.lat!}
              anchor="bottom"
            >
              <div className="flex flex-col items-center group cursor-pointer">
                {/* Ghim có đánh số */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-bold shadow-md ring-2 ring-white transition-transform group-hover:scale-110">
                  {idx + 1}
                </div>
                {/* Tooltip hiển thị tên địa điểm (diadiem.ten) khi hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  {place.ten}
                </div>
              </div>
            </Marker>
          ))}
      </Map>

      {/* ---- Badge tổng hợp tuyến đường (tong_khoangcach, tong_thoigian) ---- */}
      {displayRouteValues && !isLoading && !error && displayRouteValues.isValid && (
        <div className="absolute top-3 left-3 flex items-center gap-3 rounded-lg bg-white/90 backdrop-blur-sm px-4 py-2 shadow-md text-sm font-medium text-slate-700 border border-slate-100">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-indigo-500" />
            {displayRouteValues.distance} km
          </span>
          <span className="w-px h-4 bg-slate-300" />
          <span>{displayRouteValues.duration} phút</span>
        </div>
      )}

      {/* ---- Overlay trạng thái đang tải ---- */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] z-10">
          <div className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 shadow-lg text-sm font-medium text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            Đang tải tuyến đường…
          </div>
        </div>
      )}

      {/* ---- Overlay thông báo lỗi ---- */}
      {error && !isLoading && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 shadow-md z-10">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
}
