/**
 * LOCAL ITINERARY Types - Tạo lịch trình Local (mẫu)
 */

/**
 * Một địa điểm trong lịch trình Local
 */
export interface LocalPlaceItem {
  mapboxPlaceId: string; // Mapbox Place ID (google_place_id)
  ten: string; // Tên địa điểm
  diachi: string; // Địa chỉ đầy đủ (số nhà, tên đường, phường/xã)
  lat: number; // Vĩ độ
  lng: number; // Kinh độ
  ghichu?: string | null; // Mẹo vặt / Ghi chú
  thoiluong?: number | null; // Thời lượng tham quan (phút)
}

/**
 * DTO cho request tạo lịch trình Local mới
 * POST /local/itineraries
 */
export interface CreateLocalItineraryDto {
  tieude: string; // Tiêu đề lịch trình
  mota?: string | null; // Mô tả chi tiết
  sothich_id?: number | null; // ID sở thích (danh mục)
  phuongtien?: string | null; // Phương tiện di chuyển chính (driving-traffic, driving, walking, cycling)
  places: LocalPlaceItem[]; // Danh sách địa điểm
}

/**
 * DTO cho request cập nhật lịch trình Local
 * PUT /local/itineraries/:id
 * Tất cả fields đều optional vì có thể update một phần
 */
export interface UpdateLocalItineraryDto {
  tieude?: string; // Tiêu đề lịch trình
  mota?: string | null; // Mô tả chi tiết
  sothich_id?: number | null; // ID sở thích (danh mục)
  phuongtien?: string | null; // Phương tiện di chuyển chính (driving-traffic, driving, walking, cycling)
  places?: LocalPlaceItem[]; // Danh sách địa điểm (thay thế toàn bộ)
}

/**
 * Sở thích (danh mục) cho dropdown
 */
export interface SoThich {
  sothich_id: number;
  ten: string;
  mota?: string | null;
}

/**
 * Response từ endpoint GET /local/itineraries/:id
 * hoặc PUT /local/itineraries/:id
 */
export interface LocalItinerary {
  lichtrinh_local_id: number;
  nguoidung_id: number | null;
  tieude: string;
  mota: string | null;
  sothich_id: number | null;
  phuongtien?: string | null;
  thoigian_dukien?: string | null;
  luotthich?: number;
  ngaytao: string | null;
  sothich?: SoThich | null;
  lichtrinh_local_diadiem: LocalItineraryPlace[];
}

/**
 * Chi tiết địa điểm trong lịch trình Local (dùng trong response)
 */
export interface LocalItineraryPlace {
  lichtrinh_local_diadiem_id: number;
  thutu: number | null;
  ghichu: string | null;
  thoiluong: number | null;
  diadiem: {
    diadiem_id: number;
    google_place_id: string;
    ten: string;
    diachi: string | null;
    lat: number | null;
    lng: number | null;
  };
}
