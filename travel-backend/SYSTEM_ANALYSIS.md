# Phân tích Hệ thống: Trip Planner Pro

## 1. Mục tiêu
Xây dựng ứng dụng hỗ trợ lập lịch trình du lịch tại TP.HCM, tập trung vào trải nghiệm bản đồ tương tác và tối ưu hóa lộ trình.

## 2. Tính năng cốt lõi (MVP)
- **Khám phá địa điểm**: Sử dụng Mapbox Search SDK để tìm kiếm. Kết quả được lưu (Upsert) vào bảng `diadiem` với `google_place_id` (Mapbox ID).
- **Xem trước lộ trình (Real-time)**: Khi người dùng kéo thả thay đổi thứ tự điểm đến, Frontend gọi API `/places/route` để lấy chuỗi Polyline và vẽ lên bản đồ.
- **Lưu lịch trình mẫu (Templates)**: Hệ thống cho phép tạo các tour mẫu vào bảng `lichtrinh_local`. Quá trình này phải thực hiện qua Database Transaction để đảm bảo dữ liệu ở 3 bảng (`lichtrinh_local`, `lichtrinh_local_diadiem`, `tuyen_duong`) luôn đồng bộ.
- **Tích hợp AI**: Sử dụng Gemini API để phân tích danh sách địa điểm và viết đoạn mô tả ngắn (Summary) cho lịch trình.

## 3. Cấu trúc Dữ liệu (Prisma/MySQL)
- `diadiem`: Lưu tọa độ (lat, lng) và thông tin cơ bản.
- `lichtrinh_local`: Chứa tiêu đề và mô tả tour mẫu.
- `lichtrinh_local_diadiem`: Lưu thứ tự (`thutu`) các điểm đến trong tour.
- `tuyen_duong`: Lưu trữ chuỗi `polyline` mã hóa, khoảng cách (mét) và thời gian (giây).