import apiClient from '@/lib/axios';
import type {
  RoutePreviewResponse,
  CreateItineraryPayload,
  CreateItineraryResponse,
} from '@/types';

/**
 * @fileoverview Tầng service cho tính năng Lập Kế Hoạch Lịch Trình.
 *
 * Các endpoint được sử dụng (định nghĩa trong NestJS PlacesController):
 *
 * | Phương thức | Đường dẫn                     | Bảng DB liên quan                                    |
 * |-------------|-------------------------------|------------------------------------------------------|
 * | GET         | /places/route                 | `diadiem` (tra cứu), Google Directions API (bên ngoài)|
 * | POST        | /places/itinerary-with-route  | `lichtrinh_local`, `lichtrinh_local_diadiem` ($tx)   |
 *
 * Tất cả tên trường trong request/response đều khớp chính xác với
 * tên cột Prisma schema (snake_case).
 */

// =========================================================================
// Xem Trước Tuyến Đường (Route Preview)
// =========================================================================

/**
 * Lấy polyline tuyến đường cho một danh sách Google Place ID đã sắp xếp.
 *
 * Cách hoạt động (FRONTEND_CONTEXT §4 — Xem trước thời gian thực):
 *   1. Người dùng thêm / sắp xếp lại địa điểm trong giao diện.
 *   2. Frontend gọi hàm này với mảng `google_place_id[]` hiện tại.
 *   3. Backend tra cứu `diadiem.google_place_id` → tọa độ, sau đó gọi
 *      Google Directions API và trả về polyline đã mã hóa + số liệu tổng hợp.
 *   4. Frontend giải mã polyline bằng `@mapbox/polyline` để vẽ `LineString`
 *      trên bản đồ Mapbox.
 *
 * Ánh xạ Database:
 *   - `google_place_id` → cột `diadiem.google_place_id` (VARCHAR 255, UNIQUE)
 *   - Response `polyline` → cùng định dạng lưu trong `tuyen_duong.polyline`
 *   - Response `tong_khoangcach` → Decimal → `number` (đơn vị mét)
 *   - Response `tong_thoigian` → `number` (đơn vị giây)
 *
 * @param googlePlaceIds - Mảng Google Place ID đã sắp xếp (tối thiểu 2 để tạo tuyến đường).
 * @returns Chuỗi polyline đã mã hóa cùng tổng khoảng cách / thời gian.
 * @throws AxiosError khi có lỗi mạng hoặc lỗi từ backend.
 */
export async function getRoutePolyline(
  googlePlaceIds: string[],
): Promise<RoutePreviewResponse> {
  const response = await apiClient.get<RoutePreviewResponse>('/places/route', {
    params: {
      google_place_ids: googlePlaceIds,
    },
    // Axios tự động serialize mảng thành `google_place_ids[0]=…&google_place_ids[1]=…`
    // NestJS @Query() với ValidationPipe có thể parse được định dạng này.
  });

  return response.data;
}

// =========================================================================
// Tạo Lịch Trình Mẫu (Template Itinerary Creation)
// =========================================================================

/**
 * Tạo mới một lịch trình mẫu (local/template) cùng các địa điểm liên kết.
 *
 * Cách hoạt động (FRONTEND_CONTEXT §4 — Lưu cuối cùng):
 *   1. Người dùng nhấn nút "Tạo Mẫu".
 *   2. Frontend gửi toàn bộ payload lịch trình đến backend.
 *   3. Backend chạy Prisma `$transaction` gồm:
 *      a. Tạo 1 hàng `lichtrinh_local` (tiêu đề, mô tả, v.v.)
 *      b. Tra cứu mỗi `google_place_id` → `diadiem.diadiem_id`
 *      c. Tạo các hàng `lichtrinh_local_diadiem` (bảo toàn thứ tự `thutu`)
 *   4. Trả về lịch trình hoàn chỉnh với dữ liệu địa điểm lồng nhau.
 *
 * Ánh xạ Database:
 *   - `tieude`          → `lichtrinh_local.tieude`          (VARCHAR 255, NOT NULL)
 *   - `mota`            → `lichtrinh_local.mota`            (TEXT, nullable)
 *   - `sothich_id`      → `lichtrinh_local.sothich_id`      (FK → `sothich`)
 *   - `thoigian_dukien` → `lichtrinh_local.thoigian_dukien` (VARCHAR 100, nullable)
 *   - `places[].google_place_id` → tra cứu để lấy `diadiem.diadiem_id`
 *   - `places[].thutu`           → `lichtrinh_local_diadiem.thutu`
 *   - `places[].thoigian_den`    → `lichtrinh_local_diadiem.thoigian_den` (TIME)
 *   - `places[].thoiluong`       → `lichtrinh_local_diadiem.thoiluong` (INT, phút)
 *   - `places[].ghichu`          → `lichtrinh_local_diadiem.ghichu` (TEXT)
 *
 * @param payload - Thông tin lịch trình + danh sách địa điểm đã sắp xếp.
 * @returns Lịch trình vừa tạo kèm dữ liệu bảng trung gian + địa điểm lồng nhau.
 * @throws AxiosError khi có lỗi validation, trùng lặp, hoặc lỗi server.
 */
export async function createItinerary(
  payload: CreateItineraryPayload,
): Promise<CreateItineraryResponse> {
  const response = await apiClient.post<CreateItineraryResponse>(
    '/places/itinerary-with-route',
    payload,
  );

  return response.data;
}
