/**
 * @fileoverview Định nghĩa các TypeScript interface dựa trên Prisma schema
 * trong `schema_reference.md`.
 *
 * QUY TẮC QUAN TRỌNG:
 *   - Mỗi tên trường sử dụng đúng tên cột snake_case từ database.
 *   - KHÔNG BAO GIỜ dùng `id` chung chung — luôn dùng `diadiem_id`, `tuyen_duong_id`, v.v.
 *   - Các cột Prisma `Decimal` (vd: `danhgia`, `tong_khoangcach`) → `number` ở frontend.
 *   - Các trường có dấu `?` trong Prisma → `T | null` trong TypeScript.
 */

// ---------------------------------------------------------------------------
// diadiem — Bảng địa điểm chính (điểm tham quan, nhà hàng, v.v.)
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `diadiem` trong Prisma.
 *
 * Cách hoạt động:
 *   - `diadiem_id`: Khóa chính (PK), tự động tăng — dùng để liên kết với
 *     các bảng trung gian như `lichtrinh_local_diadiem`.
 *   - `google_place_id`: ID duy nhất từ Google Places API — dùng để tra cứu
 *     và tránh lưu trùng lặp (UNIQUE constraint).
 *   - `danhgia`: Kiểu Decimal(3,2) trong DB → number ở frontend vì
 *     JSON không có kiểu Decimal riêng.
 *   - `lat`, `lng`: Tọa độ GPS dùng để hiển thị marker trên bản đồ Mapbox.
 *
 * | Cột DB           | Kiểu TS          | Ghi chú                           |
 * |------------------|------------------|-----------------------------------|
 * | diadiem_id       | number           | PK, autoincrement                 |
 * | google_place_id  | string           | Google Place ID duy nhất          |
 * | ten              | string           | Tên địa điểm                      |
 * | diachi           | string \| null   | Địa chỉ (tùy chọn trong Prisma)  |
 * | lat              | number \| null   | Vĩ độ (Float)                     |
 * | lng              | number \| null   | Kinh độ (Float)                   |
 * | loai             | string \| null   | Loại / danh mục                   |
 * | danhgia          | number \| null   | Điểm đánh giá TB — Decimal → number |
 * | soluotdanhgia    | number \| null   | Số lượt đánh giá                  |
 * | giatien          | number \| null   | Mức giá                           |
 * | ngaycapnhat      | string \| null   | ISO timestamp                     |
 */
export interface DiaDiem {
  diadiem_id: number;
  google_place_id: string;
  ten: string;
  diachi: string | null;
  lat: number | null;
  lng: number | null;
  loai: string | null;
  /** Decimal(3,2) trong Prisma → number ở frontend */
  danhgia: number | null;
  soluotdanhgia: number | null;
  giatien: number | null;
  ngaycapnhat: string | null;
}

// ---------------------------------------------------------------------------
// chitiet_diadiem — Chi tiết mở rộng của địa điểm
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `chitiet_diadiem` trong Prisma.
 *
 * Cách hoạt động:
 *   - Liên kết với bảng `diadiem` qua `diadiem_id` (FK, ON DELETE CASCADE).
 *   - Lưu trữ thông tin bổ sung như mô tả Google, số điện thoại, website.
 *   - `giomocua`: Dữ liệu JSON giờ mở cửa từ Google — lưu dạng Json trong DB.
 */
export interface ChiTietDiaDiem {
  chitiet_diadiem_id: number;
  diadiem_id: number | null;
  mota_google: string | null;
  mota_tonghop: string | null;
  sodienthoai: string | null;
  website: string | null;
  /** Dữ liệu JSON giờ mở cửa từ Google */
  giomocua: Record<string, unknown> | null;
  ngaycapnhat: string | null;
}

// ---------------------------------------------------------------------------
// hinhanh_diadiem — Hình ảnh của địa điểm
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `hinhanh_diadiem` trong Prisma.
 *
 * Cách hoạt động:
 *   - Liên kết với `diadiem` qua `diadiem_id`.
 *   - `photo_reference`: Mã tham chiếu ảnh từ Google Places Photo API.
 *   - `url`: Đường dẫn ảnh đã được xử lý / lưu cache.
 */
export interface HinhAnhDiaDiem {
  hinhanh_diadiem_id: number;
  diadiem_id: number | null;
  photo_reference: string | null;
  url: string | null;
}

// ---------------------------------------------------------------------------
// danhgia_diadiem — Đánh giá / nhận xét của người dùng về địa điểm
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `danhgia_diadiem` trong Prisma.
 *
 * Cách hoạt động:
 *   - Liên kết với `diadiem` qua `diadiem_id` và `nguoidung` qua `nguoidung_id`.
 *   - `sosao`: Số sao đánh giá (có CHECK constraint trong DB).
 */
export interface DanhGiaDiaDiem {
  danhgia_diadiem_id: number;
  nguoidung_id: number | null;
  diadiem_id: number | null;
  sosao: number | null;
  noidung: string | null;
  ngaytao: string | null;
}

// ---------------------------------------------------------------------------
// lichtrinh_local — Lịch trình mẫu (template)
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `lichtrinh_local` trong Prisma.
 *
 * Cách hoạt động:
 *   - Được tạo qua workflow "Tạo Mẫu" (POST /places/itinerary-with-route).
 *   - Chứa thông tin cơ bản của lịch trình: tiêu đề, mô tả, sở thích, v.v.
 *   - Khi fetch bằng Prisma, dùng `.include` để lấy kèm:
 *     • `lichtrinh_local_diadiem[]` → các hàng bảng trung gian (sắp xếp theo `thutu`)
 *     • mỗi hàng trung gian `.diadiem` → dữ liệu đầy đủ của địa điểm
 */
export interface LichTrinhLocal {
  lichtrinh_local_id: number;
  nguoidung_id: number | null;
  tieude: string;
  mota: string | null;
  sothich_id: number | null;
  thoigian_dukien: string | null;
  luotthich: number | null;
  ngaytao: string | null;

  /** Được nạp khi sử dụng Prisma `.include({ lichtrinh_local_diadiem: true })` */
  lichtrinh_local_diadiem?: LichTrinhLocalDiaDiem[];
}

// ---------------------------------------------------------------------------
// lichtrinh_local_diadiem — Bảng trung gian: lịch trình mẫu ↔ địa điểm
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `lichtrinh_local_diadiem` trong Prisma.
 *
 * Cách hoạt động:
 *   - Bảng trung gian nối `lichtrinh_local` với `diadiem`.
 *   - QUAN TRỌNG: Luôn sắp xếp theo cột `thutu` (thứ tự) trước khi render
 *     danh sách địa điểm trong UI.
 *   - `thoigian_den`: Kiểu TIME trong DB → chuỗi ISO "HH:mm:ss" ở frontend.
 *   - `thoiluong`: Thời lượng tham quan tính bằng phút.
 */
export interface LichTrinhLocalDiaDiem {
  lichtrinh_local_diadiem_id: number;
  lichtrinh_local_id: number | null;
  diadiem_id: number | null;
  /** Thứ tự hiển thị — sắp xếp tăng dần trước khi render */
  thutu: number | null;
  /** Thời gian đến (kiểu TIME → chuỗi ISO "HH:mm:ss") */
  thoigian_den: string | null;
  /** Thời lượng tham quan tính bằng phút */
  thoiluong: number | null;
  ghichu: string | null;

  /** Được nạp khi sử dụng Prisma `.include({ diadiem: true })` */
  diadiem?: DiaDiem;
}

// ---------------------------------------------------------------------------
// lichtrinh_nguoidung — Lịch trình cá nhân của người dùng
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `lichtrinh_nguoidung` trong Prisma.
 *
 * Cách hoạt động:
 *   - Đại diện cho chuyến đi cá nhân của người dùng với ngày bắt đầu/kết thúc.
 *   - `trangthai`: Trạng thái lịch trình — "planning" | "ongoing" | "completed".
 *   - Khi fetch, dùng `.include` để lấy kèm `lichtrinh_nguoidung_diadiem[]`
 *     và `tuyen_duong[]`.
 */
export interface LichTrinhNguoiDung {
  lichtrinh_nguoidung_id: number;
  nguoidung_id: number | null;
  tieude: string;
  thoigian_batdau: string | null;
  thoigian_ketthuc: string | null;
  /** Trạng thái: "planning" | "ongoing" | "completed" */
  trangthai: string | null;
  ngaytao: string | null;

  /** Được nạp qua `.include` */
  lichtrinh_nguoidung_diadiem?: LichTrinhNguoiDungDiaDiem[];
  tuyen_duong?: TuyenDuong[];
}

// ---------------------------------------------------------------------------
// lichtrinh_nguoidung_diadiem — Bảng trung gian: lịch trình cá nhân ↔ địa điểm
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `lichtrinh_nguoidung_diadiem` trong Prisma.
 *
 * Cách hoạt động:
 *   - Cấu trúc tương tự `lichtrinh_local_diadiem` nhưng dành cho lịch trình
 *     cá nhân thay vì lịch trình mẫu.
 *   - Cũng phải sắp xếp theo `thutu` trước khi render.
 */
export interface LichTrinhNguoiDungDiaDiem {
  lichtrinh_nguoidung_diadiem_id: number;
  lichtrinh_nguoidung_id: number | null;
  diadiem_id: number | null;
  thutu: number | null;
  thoigian_den: string | null;
  thoiluong: number | null;
  ghichu: string | null;

  /** Được nạp khi sử dụng Prisma `.include({ diadiem: true })` */
  diadiem?: DiaDiem;
}

// ---------------------------------------------------------------------------
// RouteData — Dữ liệu tuyến đường trả về từ API /places/route (preview)
// ---------------------------------------------------------------------------

/**
 * Ánh xạ dữ liệu tuyến đường từ endpoint POST /places/route (hook useRoutePreview).
 *
 * Cách hoạt động:
 *   - Backend trả về:
 *     • `polyline`: Chuỗi polyline đã mã hóa — giải mã bằng `@mapbox/polyline`
 *     • `tong_khoangcach`: Khoảng cách tổng cộng tính bằng mét (number)
 *     • `tong_thoigian`: Tổng thời gian tính bằng giây (number)
 *   - Frontend sẽ chuyển đổi:
 *     • mét → km: `(tong_khoangcach / 1000).toFixed(1)`
 *     • giây → phút: `Math.round(tong_thoigian / 60)`
 */
export interface RouteData {
  /** Chuỗi polyline đã mã hóa — dùng @mapbox/polyline để giải mã */
  polyline?: string;
  /** Khoảng cách tổng cộng tính bằng mét */
  tong_khoangcach?: number;
  /** Tổng thời gian di chuyển tính bằng giây */
  tong_thoigian?: number;
}

// ---------------------------------------------------------------------------
// tuyen_duong — Dữ liệu tuyến đường / chỉ đường
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `tuyen_duong` trong Prisma.
 *
 * Cách hoạt động:
 *   - Lưu trữ chuỗi polyline đã mã hóa (định dạng Google) mà frontend
 *     giải mã bằng `@mapbox/polyline` để vẽ lên bản đồ.
 *   - `tong_khoangcach`: Kiểu Decimal trong DB → number (đơn vị mét).
 *   - `tong_thoigian`: Tổng thời gian di chuyển tính bằng giây.
 *   - `ngay_thu_may`: Ngày thứ mấy trong lịch trình (mặc định = 1).
 *
 * | Cột DB              | Kiểu TS        | Ghi chú                       |
 * |---------------------|----------------|-------------------------------|
 * | tong_khoangcach     | number \| null | Decimal → number (mét)        |
 * | tong_thoigian       | number \| null | Tổng thời gian (giây)         |
 */
export interface TuyenDuong {
  tuyen_duong_id: number;
  lichtrinh_nguoidung_id: number | null;
  /** Chuỗi polyline đã mã hóa — giải mã bằng `@mapbox/polyline` */
  polyline: string | null;
  /** Decimal trong Prisma → number ở frontend (tổng khoảng cách, đơn vị mét) */
  tong_khoangcach: number | null;
  /** Tổng thời gian di chuyển tính bằng giây */
  tong_thoigian: number | null;
  /** Ngày thứ mấy trong lịch trình (mặc định = 1) */
  ngay_thu_may: number | null;
  ngaytao: string | null;
}

// ---------------------------------------------------------------------------
// nguoidung — Người dùng
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `nguoidung` trong Prisma.
 *
 * Cách hoạt động:
 *   - `matkhau`: Hash mật khẩu — KHÔNG BAO GIỜ gửi về frontend trong thực tế.
 *   - `trangthai`: Trạng thái tài khoản, mặc định "active".
 */
export interface NguoiDung {
  nguoidung_id: number;
  email: string;
  /** Hash mật khẩu — không nên gửi về frontend */
  matkhau: string;
  ten: string | null;
  avatar: string | null;
  trangthai: string | null;
  ngaytao: string | null;
  ngaycapnhat: string | null;
}

// ---------------------------------------------------------------------------
// sothich — Danh mục sở thích
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `sothich` trong Prisma.
 *
 * Cách hoạt động:
 *   - Bảng danh mục sở thích (vd: "Ẩm thực", "Văn hóa", "Thiên nhiên").
 *   - Được liên kết với `lichtrinh_local` qua FK `sothich_id` để phân loại
 *     lịch trình theo chủ đề.
 */
export interface SoThich {
  sothich_id: number;
  ten: string;
  mota: string | null;
}

// ---------------------------------------------------------------------------
// nguoidung_sothich — Bảng trung gian: người dùng ↔ sở thích
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `nguoidung_sothich` trong Prisma.
 *
 * Cách hoạt động:
 *   - Bảng trung gian liên kết người dùng với sở thích (quan hệ N-N).
 */
export interface NguoiDungSoThich {
  nguoidung_sothich_id: number;
  nguoidung_id: number | null;
  sothich_id: number | null;
}

// ---------------------------------------------------------------------------
// luu_diadiem — Địa điểm đã lưu / đánh dấu
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `luu_diadiem` trong Prisma.
 *
 * Cách hoạt động:
 *   - Cho phép người dùng "lưu" (bookmark) một địa điểm yêu thích.
 *   - Liên kết qua `nguoidung_id` và `diadiem_id`.
 */
export interface LuuDiaDiem {
  luu_diadiem_id: number;
  nguoidung_id: number | null;
  diadiem_id: number | null;
  ngaytao: string | null;
}

// ---------------------------------------------------------------------------
// meovat_diadiem — Mẹo vặt / tips cho địa điểm
// ---------------------------------------------------------------------------

/**
 * Ánh xạ đến model `meovat_diadiem` trong Prisma.
 *
 * Cách hoạt động:
 *   - Người dùng có thể chia sẻ mẹo vặt (tips) cho từng địa điểm.
 *   - `thoidiem_dep`: Gợi ý thời điểm đẹp nhất để ghé thăm.
 */
export interface MeoVatDiaDiem {
  meovat_diadiem_id: number;
  diadiem_id: number | null;
  nguoidung_id: number | null;
  noidung: string;
  thoidiem_dep: string | null;
  ngaytao: string | null;
}

// =========================================================================
// DTO (Data Transfer Object) cho API Request / Response
// =========================================================================

// ---------------------------------------------------------------------------
// GET /places/route — Xem trước tuyến đường (Route Preview)
// ---------------------------------------------------------------------------

/**
 * Cấu trúc dữ liệu trả về từ `GET /places/route?google_place_ids[]=...`.
 *
 * Cách hoạt động:
 *   - Backend gọi Google Directions API và trả về chuỗi polyline đã mã hóa
 *     cùng với tổng khoảng cách / thời gian.
 *   - Frontend dùng `@mapbox/polyline.decode()` để chuyển thành tọa độ
 *     [lat, lng] rồi đảo thành [lng, lat] cho GeoJSON / Mapbox.
 */
export interface RoutePreviewResponse {
  /** Chuỗi polyline đã mã hóa — cần giải mã bằng `@mapbox/polyline` */
  polyline: string;
  /** Tổng khoảng cách tính bằng mét (Decimal → number) */
  tong_khoangcach: number;
  /** Tổng thời gian di chuyển tính bằng giây */
  tong_thoigian: number;
}

// ---------------------------------------------------------------------------
// POST /places/itinerary-with-route — Tạo lịch trình mẫu
// ---------------------------------------------------------------------------

/**
 * Dữ liệu của một địa điểm trong payload tạo lịch trình.
 *
 * Cách hoạt động:
 *   - `google_place_id`: Dùng để backend tra cứu `diadiem.diadiem_id` tương ứng.
 *   - `thutu`: Bảo toàn thứ tự hiển thị do người dùng sắp xếp (bắt đầu từ 1).
 *   - Dữ liệu này sẽ được lưu vào bảng `lichtrinh_local_diadiem`.
 */
export interface ItineraryPlaceInput {
  google_place_id: string;
  /** Thứ tự hiển thị (bắt đầu từ 1) */
  thutu: number;
  thoigian_den?: string | null;
  /** Thời lượng tham quan tính bằng phút */
  thoiluong?: number | null;
  ghichu?: string | null;
}

/**
 * Body request cho `POST /places/itinerary-with-route`.
 *
 * Cách hoạt động:
 *   - Backend chạy Prisma `$transaction` để tạo nguyên tử (atomic):
 *     1. Tạo 1 hàng trong bảng `lichtrinh_local` (tiêu đề, mô tả, v.v.)
 *     2. Tra cứu mỗi `google_place_id` → `diadiem.diadiem_id`
 *     3. Tạo các hàng `lichtrinh_local_diadiem` (bảo toàn `thutu` thứ tự)
 *   - Nếu bất kỳ bước nào lỗi, toàn bộ transaction sẽ rollback.
 *
 * Ánh xạ các trường:
 *   - `tieude`          → `lichtrinh_local.tieude`          (VARCHAR 255, NOT NULL)
 *   - `mota`            → `lichtrinh_local.mota`            (TEXT, nullable)
 *   - `sothich_id`      → `lichtrinh_local.sothich_id`      (FK → `sothich`)
 *   - `thoigian_dukien` → `lichtrinh_local.thoigian_dukien` (VARCHAR 100, nullable)
 */
export interface CreateItineraryPayload {
  tieude: string;
  mota?: string | null;
  sothich_id?: number | null;
  thoigian_dukien?: string | null;
  /** Danh sách địa điểm đã sắp xếp theo thứ tự */
  places: ItineraryPlaceInput[];
}

/**
 * Dữ liệu trả về đầy đủ sau khi tạo lịch trình.
 *
 * Cách hoạt động:
 *   - Kế thừa `LichTrinhLocal` và bổ sung mảng `lichtrinh_local_diadiem`
 *     đã được nạp sẵn (include) cùng dữ liệu `diadiem` lồng nhau.
 *   - Frontend dùng dữ liệu này để hiển thị ngay lịch trình vừa tạo
 *     mà không cần gọi API thêm.
 */
export interface CreateItineraryResponse extends LichTrinhLocal {
  lichtrinh_local_diadiem: (LichTrinhLocalDiaDiem & {
    diadiem: DiaDiem;
  })[];
}
