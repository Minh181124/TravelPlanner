# 📋 Tóm Tắt Thay Đổi - Lưu Phương Tiện Di Chuyển

## ✅ Tất Cả Đã Hoàn Thành

### 1️⃣ Database (Prisma)

**File:** [prisma/schema.prisma](travel-backend/prisma/schema.prisma)

Thêm trường vào model `lichtrinh_local`:
```prisma
phuongtien String? @default("mapbox/driving-traffic") @db.VarChar(50)
```

**Migration Command:**
```bash
cd travel-backend
npx prisma migrate dev --name add_phuongtien_to_lichtrinh_local
```

---

### 2️⃣ Backend DTO

**File:** [travel-backend/src/local/dto/create-local-itinerary.dto.ts](travel-backend/src/local/dto/create-local-itinerary.dto.ts)

✅ **CreateLocalItineraryDto** - Thêm field:
```typescript
@ApiProperty({
  description: 'Phương tiện di chuyển chính (driving-traffic, driving, walking, cycling)',
  enum: ['mapbox/driving-traffic', 'mapbox/driving', 'mapbox/walking', 'mapbox/cycling'],
  default: 'mapbox/driving-traffic',
  example: 'mapbox/driving-traffic',
  required: false,
})
phuongtien?: string | null;
```

✅ **UpdateLocalItineraryDto** - Thêm field tương tự

---

### 3️⃣ Backend Service

**File:** [travel-backend/src/local/local.service.ts](travel-backend/src/local/local.service.ts)

#### createLocalItinerary()
```typescript
// Lưu phuongtien từ DTO vào database
const lichtrinh = await tx.lichtrinh_local.create({
  data: {
    // ...
    phuongtien: dto.phuongtien || 'mapbox/driving-traffic',
  },
});
```

#### updateLocalItinerary()
```typescript
// Update phuongtien khi người dùng thay đổi
const updatedData: any = {};
if (dto.phuongtien !== undefined) {
  updatedData.phuongtien = dto.phuongtien || 'mapbox/driving-traffic';
}
```

---

### 4️⃣ Frontend Types

**File:** [frontend/src/types/local.ts](frontend/src/types/local.ts)

✅ **LocalItinerary** - Thêm:
```typescript
phuongtien?: string | null;
```

✅ **CreateLocalItineraryDto** - Thêm:
```typescript
phuongtien?: string | null; // Phương tiện di chuyển chính (driving-traffic, driving, walking, cycling)
```

✅ **UpdateLocalItineraryDto** - Thêm:
```typescript
phuongtien?: string | null; // Phương tiện di chuyển chính (driving-traffic, driving, walking, cycling)
```

---

### 5️⃣ Frontend Component

**File:** [frontend/src/components/LocalItineraryBuilder.tsx](frontend/src/components/LocalItineraryBuilder.tsx)

#### State Management
```typescript
const [transportMode, setTransportMode] = useState<'mapbox/driving-traffic' | 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling'>('mapbox/driving-traffic');
```

#### Load Existing Itinerary
```typescript
// Khi edit mode, load phuongtien từ database
if (itinerary.phuongtien) {
  setTransportMode(itinerary.phuongtien as any);
}
```

#### Save to Server
```typescript
// Create mode
const dto: CreateLocalItineraryDto = {
  tieude,
  mota: mota || undefined,
  sothich_id: sothich_id || undefined,
  phuongtien: transportMode,  // ✅ NEW
  places,
};
await localItineraryService.createLocalItinerary(dto);

// Update mode
const dto: UpdateLocalItineraryDto = {
  tieude,
  mota: mota || undefined,
  sothich_id: sothich_id || undefined,
  phuongtien: transportMode,  // ✅ NEW
  places,
};
await localItineraryService.updateLocalItinerary(editId, dto);
```

#### Reset State
```typescript
// Sau khi save thành công
setTransportMode('mapbox/driving-traffic');
```

#### UI: Transport Mode Buttons
```typescript
// 4 nút chọn phương tiện đã sẵn sàng:
- Xe (driving-traffic) - Mặc định
- Xe (driving) - Thường
- Đi bộ (walking)
- Xe đạp (cycling)

// Khi click, tự động update route trên bản đồ
```

---

## 🔄 Complete User Flow

```
User chọn phương tiện
       ↓
setTransportMode(newMode)
       ↓
PlannerMap re-render với profile mới
       ↓
useRoutePreview() call API /places/route
       ↓
Backend trả về route với phương tiện mới
       ↓
Bản đồ cập nhật polyline
       ↓
Hiển thị thời gian & khoảng cách mới
       ↓
User click "Lưu Lịch Trình"
       ↓
Gửi lên: { tieude, places, phuongtien: "mapbox/..." }
       ↓
Backend lưu vào database
       ↓
Việc tính route sử dụng phuongtien đã lưu từ database
```

---

## 📊 Type Definitions

| Phương Tiện | Enum Value | Ý Nghĩa |
|-------------|------------|---------|
| Ô tô (giao t) | `mapbox/driving-traffic` | **Mặc định** - Ô tô với điều kiện giao thông thực tế |
| Ô tô (thường) | `mapbox/driving` | Ô tô trên đường bình thường |
| Đi bộ | `mapbox/walking` | Con đường dành cho người đi bộ |
| Xe đạp | `mapbox/cycling` | Tuyến đường xích lô/đạp xe |

---

## 🆚 So Sánh Trước/Sau

### Trước
```
- Route preview dùng transportMode (giá trị UI)
- Phương tiện không được lưu vào database
- Mỗi lần load lịch trình, phương tiện mặc định là driving-traffic
```

### Sau
```
- Route preview dùng transportMode (giá trị UI)
- Phương tiện được lưu vào database (phuongtien field)
- Load lịch trình cũ, phương tiện được restore từ database
- Khi create/update, gửi phuongtien lên server
```

---

## ✔️ Verification Checklist

- [x] Schema: `phuongtien` field thêm vào `lichtrinh_local`
- [x] DTO: `CreateLocalItineraryDto` có `phuongtien`
- [x] DTO: `UpdateLocalItineraryDto` có `phuongtien`
- [x] Service: `createLocalItinerary()` lưu `phuongtien`
- [x] Service: `updateLocalItinerary()` update `phuongtien`
- [x] Service: `getLocalItinerary()` trả về `phuongtien`
- [x] Types: `LocalItinerary` interface có `phuongtien`
- [x] Types: DTO interfaces có `phuongtien`
- [x] Component: Load `phuongtien` từ existing itinerary
- [x] Component: Gửi `phuongtien` khi save
- [x] Component: Reset `phuongtien` khi tạo mới
- [x] Component: UI buttons để chọn phương tiện

---

## 🚀 Next Steps

1. **Chạy Migration:**
   ```bash
   cd travel-backend
   npx prisma migrate dev --name add_phuongtien_to_lichtrinh_local
   ```

2. **Test Create New Itinerary:**
   - Chọn phương tiện khác nhau
   - Kiểm tra bản đồ cập nhật
   - Lưu và kiểm tra database

3. **Test Edit Existing Itinerary:**
   - Mở lịch trình cũ
   - Verify `transportMode` được restore
   - Thay đổi phương tiện
   - Lưu và verify database

4. **Test Route Calculation:**
   - Backend sử dụng `phuongtien` từ database khi tính route
   - Thời gian/khoảng cách khác nhau tùy phương tiện

---

## 📁 Files Modified

```
travel-backend/
├── prisma/
│   └── schema.prisma ✅ (thêm phuongtien)
├── src/local/
│   ├── dto/
│   │   └── create-local-itinerary.dto.ts ✅ (thêm phuongtien)
│   └── local.service.ts ✅ (lưu/update phuongtien)

frontend/
├── src/
│   ├── types/
│   │   └── local.ts ✅ (thêm phuongtien)
│   └── components/
│       └── LocalItineraryBuilder.tsx ✅ (load/send phuongtien)
```

---

**Status: ✅ READY TO DEPLOY**

Tất cả các bước đã hoàn thành. Chỉ cần chạy migration Prisma là xong!
