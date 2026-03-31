# Hướng dẫn Migration - Thêm trường phuongtien

## 🔄 Bước 1: Tạo Migration trong Prisma

Chạy lệnh sau tại thư mục **travel-backend**:

```bash
npx prisma migrate dev --name add_phuongtien_to_lichtrinh_local
```

**Giải thích:**
- `migrate dev` = Tạo migration và apply lên database dev
- `--name add_phuongtien_to_lichtrinh_local` = Tên descriptive cho migration

**Output mong đợi:**
```
✔ Environment variables loaded from .env
✔ Prisma schema loaded from prisma/schema.prisma
✔ Database connection established
✔ Migrations to apply:
  20260331_add_phuongtien_to_lichtrinh_local (1 migration)
✔ Ran all pending migrations

Generated Prisma Client (x.x.x) to ./node_modules/@prisma/client in 1.23s

✨ Done in 2.34s.
```

## 🔄 Bước 2: Cập nhật Prisma Client

Nếu lệnh trên không tự động generate, chạy:

```bash
npx prisma generate
```

## 📊 Bước 3: Verify Database

Kiểm tra để chắc chắn migration được apply:

```bash
# Xem migration status
npx prisma migrate status

# Xem schema hiện tại
npx prisma db pull
```

## 🚀 Bước 4: Reset Database (Nếu cần)

Nếu bạn muốn reset database về state mới (xóa tất cả data cũ):

```bash
# CẢNH BÁO: Lệnh này sẽ xóa tất cả data!
npx prisma migrate reset
```

**Được hỏi lại:**
```
We need to reset the "travel_db" database.

This will:
  - Drop the database
  - Create a new database
  - Run all migrations
  - Run seed scripts (if any)

Do you want to continue? (y/n)
```

Nhập `y` để xác nhận.

## ✅ Bước 5: Kiểm tra Schema

Mở file [prisma/schema.prisma](../travel-backend/prisma/schema.prisma) và xác nhận:

```prisma
model lichtrinh_local {
  lichtrinh_local_id      Int                       @id @default(autoincrement())
  nguoidung_id            Int?
  tieude                  String                    @db.VarChar(255)
  mota                    String?
  sothich_id              Int?
  phuongtien              String?                   @default("mapbox/driving-traffic") @db.VarChar(50)  // ✅ NEW
  thoigian_dukien         String?                   @db.VarChar(100)
  luotthich               Int?                      @default(0)
  ngaytao                 DateTime?                 @default(now()) @db.Timestamp(6)
  // ... rest of fields
}
```

## 📝 Các Field trong phuongtien

| Giá trị | Ý nghĩa |
|---------|---------|
| `mapbox/driving-traffic` | Ô tô với giao thông (Mặc định) |
| `mapbox/driving` | Ô tô thường |
| `mapbox/walking` | Đi bộ |
| `mapbox/cycling` | Xe đạp |

## 🔍 API Changes Summary

### Backend DTO
- ✅ `CreateLocalItineraryDto` - thêm `phuongtien?: string`
- ✅ `UpdateLocalItineraryDto` - thêm `phuongtien?: string`

### Backend Service
- ✅ `local.service.ts` - lưu/update `phuongtien` khi create/update itinerary
- ✅ `places.service.ts` - sử dụng `phuongtien` từ itinerary khi tính route

### Frontend Types
- ✅ `LocalItinerary` - thêm `phuongtien?: string`
- ✅ `CreateLocalItineraryDto` - thêm `phuongtien?: string`
- ✅ `UpdateLocalItineraryDto` - thêm `phuongtien?: string`

### Frontend Component
- ✅ `LocalItineraryBuilder.tsx`:
  - State: `transportMode` (lưu phương tiện chính)
  - Load `phuongtien` từ database khi edit
  - Gửi `phuongtien` lên server khi save
  - Reset `transportMode` khi tạo mới

## 🧪 Test Flow

1. **Tạo lịch trình mới:**
   - Chọn phương tiện (Xe, Đi bộ, Đạp xe)
   - Thêm địa điểm
   - Bản đồ cập nhật với phương tiện đã chọn
   - Lưu lịch trình

2. **Kiểm tra database:**
   ```sql
   SELECT lichtrinh_local_id, tieude, phuongtien FROM lichtrinh_local LIMIT 1;
   ```
   Kết quả mong đợi:
   ```
   | lichtrinh_local_id | tieude | phuongtien |
   |--------------------|--------|-----|
   | 1 | Một ngày ở SG | mapbox/driving-traffic |
   ```

3. **Edit lịch trình:**
   - Mở lịch trình cũ
   - Thay đổi phương tiện
   - Bản đồ tự động cập nhật
   - Lưu thay đổi
   - Verify database

## 🐛 Troubleshooting

**Lỗi: "Error: P3005 Client generation"**
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

**Lỗi: "The provided database string is invalid"**
- Kiểm tra `.env` file có `DATABASE_URL` đúng không

**Lỗi: "Migration failed"**
```bash
npx prisma migrate resolve --rolled_back
npx prisma migrate dev
```

## 📚 Tài liệu Prisma

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
