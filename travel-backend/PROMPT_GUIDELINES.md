# AI Coding Standards for Travel Planner Project

## Tech Stack
- **Framework:** NestJS (Modular Architecture)
- **ORM:** Prisma (MySQL) - Target Database: MySQL 8.0
- **API Documentation:** Swagger (available at /api)
- **Communication:** Axios for External APIs (Mapbox Directions/Search, Gemini AI)

## Rules
1. **Module Pattern**: Mỗi tính năng mới phải có đầy đủ Module, Service, Controller theo chuẩn NestJS.
2. **Prisma Integration**: 
   - Luôn dùng `PrismaService` inject vào Constructor. Không viết SQL thuần.
   - Khi thực hiện lưu Lịch trình (Itinerary), BẮT BUỘC dùng `this.prisma.$transaction` để đảm bảo tính toàn vẹn dữ liệu giữa các bảng liên quan.
3. **Error Handling**: Sử dụng `HttpException` hoặc các lớp con (`NotFoundException`, `BadRequestException`) của NestJS để trả về lỗi chuẩn REST API.
4. **DTOs & Validation**: 
   - Luôn tạo DTO cho request body.
   - Sử dụng `class-validator` (như `@IsString`, `@IsArray`) để kiểm tra dữ liệu đầu vào.
5. **Naming & Typing**: 
   - Table names (e.g., `diadiem`, `tuyen_duong`) phải khớp 100% với Prisma Client.
   - Sử dụng CamelCase cho biến và PascalCase cho Class/Interface trong code.
6. **Map Logic**: 
   - Dữ liệu đường đi phải được lưu dưới dạng chuỗi `polyline` mã hóa trong bảng `tuyen_duong`.
   - Sử dụng `google_place_id` làm định danh cho Mapbox Place ID để tương thích với cấu trúc bảng hiện tại.