# Trip Planner Pro - Hướng Dẫn Cài Đặt Dự Án

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Hướng Dẫn Tạo Database trên pgAdmin](#hướng-dẫn-tạo-database-trên-pgadmin)
3. [Cấu Hình Biến Môi Trường](#cấu-hình-biến-môi-trường)
4. [Triển Khai Schema với Prisma](#triển-khai-schema-với-prisma)
5. [Khởi Chạy Dự Án](#khởi-chạy-dự-án)
6. [Xử Lý Lỗi (Troubleshooting)](#xử-lý-lỗi-troubleshooting)

---

## 🖥️ Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo hệ thống của bạn có:

| Công Cụ | Phiên Bản | Ghi Chú |
|---------|-----------|--------|
| **Node.js** | v20 trở lên | Để chạy Frontend và Backend |
| **PostgreSQL Server** | v12+ | Database chính của dự án |
| **pgAdmin 4** | Mới nhất | Quản lý giao diện PostgreSQL (tuỳ chọn) |
| **npm** | v10+ | Quản lý package (đi kèm Node.js) |

### Kiểm Tra Phiên Bản Đã Cài Đặt

```bash
node --version
npm --version
```

Nếu chưa cài đặt, vui lòng tải từ:
- **Node.js**: https://nodejs.org/ (khuyến nghị LTS)
- **PostgreSQL**: https://www.postgresql.org/download/
- **pgAdmin 4**: https://www.pgadmin.org/download/

---

## 🗄️ Hướng Dẫn Tạo Database trên pgAdmin

### Bước 1: Mở pgAdmin

1. Khởi động **pgAdmin 4** trên trình duyệt (mặc định: `http://localhost:5050`)
2. Đăng nhập bằng email và mật khẩu đã cấu hình

### Bước 2: Tạo Server Connection (Nếu Chưa Có)

1. Trên bảng điều khiển bên trái, bấm chuột phải vào **Servers** → **Create** → **Server...**
2. Tại tab **General**:
   - **Name**: `LocalPostgres` (tên tùy ý)
3. Tại tab **Connection**:
   - **Host name/address**: `localhost` (hoặc `127.0.0.1`)
   - **Port**: `5432` (mặc định PostgreSQL)
   - **Username**: `postgres` (tài khoản mặc định)
   - **Password**: Nhập mật khẩu PostgreSQL của bạn
4. Bấm **Save**

### Bước 3: Tạo Database Mới

1. Trong cây thư mục bên trái, nhấp mở **Servers** → **LocalPostgres** (hoặc tên server của bạn)
2. Chuột phải vào **Databases** → **Create** → **Database...**
3. Tại cửa sổ popup:
   - **Database**: `trip_planner_db`
   - **Owner**: `postgres` (hoặc user của bạn)
   - **Encoding**: `UTF8` (mặc định)
4. Bấm **Save**

✅ Đã tạo thành công database `trip_planner_db`!

---

## 🔐 Cấu Hình Biến Môi Trường

### Backend (.env)

Tạo file `.env` trong thư mục `travel-backend/`:

```ini
# Database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/trip_planner_db?schema=public"

# Mapbox API Token
MAPBOX_ACCESS_TOKEN="your_mapbox_token_here"

# Port (tuỳ chọn, mặc định 3001)
PORT=3001

# Environment
NODE_ENV=development
```

### Hướng Dẫn Điền DATABASE_URL

Định dạng chuẩn PostgreSQL:

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Ví dụ chi tiết:**

```
postgresql://postgres:MyPassword123@localhost:5432/trip_planner_db?schema=public
```

| Thành Phần | Mô Tả | Ví Dụ |
|-----------|-------|--------|
| `postgres` | Tên người dùng PostgreSQL | hoặc username của bạn |
| `MyPassword123` | Mật khẩu PostgreSQL | mật khẩu đã cấu hình |
| `localhost` | Địa chỉ server | hoặc IP server từ xa |
| `5432` | Port PostgreSQL | (mặc định) |
| `trip_planner_db` | Tên database | phải trùng với step trên |

### Frontend (.env.local)

Tạo file `.env.local` trong thư mục `frontend/`:

```ini
# Mapbox Token
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"

# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

---

## 🔄 Triển Khai Schema với Prisma

Sau khi cấu hình DATABASE_URL, hãy đồng bộ schema Prisma với PostgreSQL:

### Bước 1: Tạo Prisma Client

```bash
cd travel-backend
npx prisma generate
```

Lệnh này tạo ra **Prisma Client** từ `schema.prisma`, cho phép kết nối tới database.

### Bước 2: Chạy Migration

```bash
npx prisma migrate dev --name init
```

Lệnh này sẽ:
- ✅ Tạo tất cả các bảng từ `schema.prisma`
- ✅ Thiết lập các quan hệ (Foreign Keys)
- ✅ Tạo các constraints (Primary Key, Unique, etc.)

**⏳ Quá trình:**

Bạn có thể thấy:

```
Need to install the following packages:
@prisma/migrate
y
...
✔ Generated Prisma Client (X.X.X) to ./node_modules/.prisma/client in XXms
✔ Created migration folder(s) and migration_lock.toml file.
✔ Executed migrations in XXms
```

✅ Hoàn thành! Tất cả bảng đã được tạo trong PostgreSQL.

### Bước 3: Kiểm Tra Schema (Tuỳ Chọn)

Để xem schema bằng giao diện:

```bash
npx prisma studio
```

Trình duyệt sẽ mở `http://localhost:5555`, cho phép bạn xem và chỉnh sửa dữ liệu trực tiếp.

---

## 🚀 Khởi Chạy Dự Án

### 1. Cài Đặt Dependencies

Cài đặt các thư viện cần thiết cho cả Frontend và Backend:

**Backend:**

```bash
cd travel-backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 2. Khởi Chạy Backend

Chạy NestJS Backend:

```bash
cd travel-backend
npm run start:dev
```

✅ Backend chạy trên `http://localhost:3001`

Bạn sẽ thấy:

```
[Nest] 12345  - 03/31/2026, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
...
[Nest] 12345  - 03/31/2026, 10:30:02 AM     LOG [InstanceLoader] ... has been initialized
[Nest] 12345  - 03/31/2026, 10:30:02 AM     LOG [RoutesResolver] Mapped { /api/... }
```

### 3. Khởi Chạy Frontend

Chạy Next.js Frontend (trên terminal khác):

```bash
cd frontend
npm run dev
```

✅ Frontend chạy trên `http://localhost:3000`

Bạn sẽ thấy:

```
▲ Next.js 16.X.X
- Local:        http://localhost:3000
- Environments: .env.local
```

### 4. Mở Ứng Dụng

1. Mở trình duyệt và truy cập: **http://localhost:3000**
2. Ứng dụng **Trip Planner Pro** sẽ tải lên! 🎉

---

## 🔧 Xử Lý Lỗi (Troubleshooting)

### ❌ Lỗi: `Can't reach database server`

**Nguyên nhân:**
- PostgreSQL server chưa chạy
- Port hoặc host sai trong DATABASE_URL

**Giải pháp:**

1. **Kiểm tra PostgreSQL đang chạy:**
   - **Windows**: Mở **Services** (`services.msc`) tìm `postgresql-x64-XX`
   - **macOS**: Kiểm tra trong System Preferences
   - **Linux**: Chạy `sudo systemctl status postgresql`

2. **Kiểm tra Port trong pgAdmin:**
   - Mở **pgAdmin** → **Servers** → bấm chuột phải **Properties**
   - Kiểm tra **Connection → Port** (mặc định `5432`)
   - Cập nhật `.env` với port chính xác

3. **Kiểm tra DATABASE_URL:**
   ```bash
   # Trong travel-backend/.env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/trip_planner_db?schema=public"
   ```

### ❌ Lỗi: `permission denied for schema public`

**Nguyên nhân:**
- User PostgreSQL không có quyền tạo bảng

**Giải pháp:**

1. Mở **pgAdmin**
2. Tìm **Servers** → **LocalPostgres** → **Login/Group Roles**
3. Chuột phải user (thường là `postgres`) → **Properties**
4. Tab **Privileges** → Đảm bảo các tùy chọn được tích:
   - ✅ Can login?
   - ✅ Superuser?
   - ✅ Can create databases?
5. Nhấn **Save** → Thử lại

### ❌ Lỗi: `database "trip_planner_db" does not exist`

**Nguyên nhân:**
- Database chưa được tạo hoặc tên sai

**Giải pháp:**

1. Kiểm tra database đã tồn tại:
   ```bash
   ngx prisma db push
   ```

2. Hoặc tạo lại database theo [Hướng Dẫn Tạo Database](#-hướng-dẫn-tạo-database-trên-pgadmin):
   - Tên phải đúng: `trip_planner_db` (không có dấu cách, không viết hoa)

### ❌ Lỗi: `npm ERR! code ENOENT` khi chạy `npm run dev`

**Nguyên nhân:**
- Chưa cài đặt dependencies hoặc đang ở folder sai

**Giải pháp:**

```bash
# Chắc chắn bạn ở thư mục đúng
cd frontend

# Cài đặt lại từ đầu
rm -rf node_modules package-lock.json
npm install

# Chạy lại
npm run dev
```

### ❌ Lỗi: `Port 3000 already in use`

**Nguyên nhân:**
- Port 3000 đã bị chiếm dụng

**Giải pháp:**

```bash
# Chạy frontend trên port khác
npm run dev -- -p 3001
```

### ❌ Lỗi: `Port 3001 already in use` (Backend)

**Giải pháp:**

1. **Tìm process đang dùng port:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   
   # macOS/Linux
   lsof -i :3001
   ```

2. **Đóng process hoặc chạy Backend trên port khác:**
   ```bash
   # Cập nhật travel-backend/.env
   PORT=3002
   ```

---

## ✨ Kiểm Tra Sau Khi Cài Đặt

Sau khi hoàn thành, kiểm tra:

- [ ] Backend chạy trên `http://localhost:3001`
- [ ] Frontend chạy trên `http://localhost:3000`
- [ ] Ứng dụng tải lên mà không lỗi
- [ ] Có thể tìm kiếm địa điểm trên bản đồ
- [ ] Dữ liệu được lưu trong database

---

## 📚 Tài Liệu Tham Khảo

- **PostgreSQL**: https://www.postgresql.org/docs/
- **Prisma ORM**: https://www.prisma.io/docs/
- **Next.js**: https://nextjs.org/docs
- **NestJS**: https://docs.nestjs.com/
- **Mapbox**: https://docs.mapbox.com/

---

## 🤝 Hỗ Trợ

Nếu gặp vấn đề không được giải quyết:

1. Kiểm tra lại toàn bộ các bước cài đặt
2. Xem tệp `.env` có chính xác không
3. Kiểm tra log chi tiết:
   - Backend: Xem output console
   - Frontend: Mở **Developer Tools** (F12) → **Console**
4. Liên hệ với nhóm phát triển

---

**Happy Planning! 🗺️✈️**
