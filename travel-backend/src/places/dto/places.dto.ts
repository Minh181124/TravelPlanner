import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO cho request tìm kiếm địa điểm qua Mapbox Search Box API.
 */
export class SearchPlaceDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm địa điểm (VD: "Bến Thành", "Landmark 81")',
    example: 'Highlands Coffee',
  })
  keyword: string;

  @ApiProperty({
    description: 'Session token từ Frontend để gộp các lần search thành 1 session Mapbox duy nhất',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  session_token: string;

  @ApiProperty({
    description: 'Vĩ độ người dùng (Frontend tự động lấy)',
    example: 10.7760,
    required: false,
    type: Number
  })
  lat?: number;

  @ApiProperty({
    description: 'Kinh độ người dùng (Frontend tự động lấy)',
    example: 106.6991,
    required: false,
    type: Number
  })
  lng?: number;
}

/**
 * DTO cho request lấy tuyến đường giữa các địa điểm.
 */
export class GetRouteDto {
  @ApiProperty({
    description: 'Danh sách Mapbox IDs để tính tuyến đường (Lấy từ kết quả search)',
    example: ['mapbox://places/adr.123...', 'mapbox://places/adr.456...'],
    type: [String],
  })
  placeIds: string[];

  @ApiProperty({
    description: 'Tọa độ trực tiếp từ Frontend (ưu tiên dùng thay vì truy vấn DB)',
    example: [{ lng: 106.6297, lat: 10.8231 }, { lng: 106.7009, lat: 10.7769 }],
    required: false,
  })
  coordinates?: { lng: number; lat: number }[];

  @ApiProperty({
    description: 'Phương tiện di chuyển (Dropdown lựa chọn)',
    enum: [
      'mapbox/driving-traffic', 
      'mapbox/driving', 
      'mapbox/walking', 
      'mapbox/cycling'
    ],
    default: 'mapbox/driving-traffic',
    required: false,
  })
  profile?: string;
}

/**
 * DTO cho request tạo lịch trình mẫu (lichtrinh_local).
 */
export class CreateSampleItineraryDto {
  @ApiProperty({
    description: 'Tiêu đề lịch trình',
    example: 'Khám phá Quận 1 trong 1 ngày',
  })
  title: string;

  @ApiProperty({
    description: 'Mô tả ngắn cho lịch trình',
    example: 'Lịch trình tham quan các điểm nổi bật tại trung tâm Sài Gòn',
  })
  description: string;

  @ApiProperty({
    description:
      'Danh sách Mapbox Place IDs (google_place_id) theo thứ tự mong muốn',
    example: ['dXJuOm1ieHBvaTo...abc', 'dXJuOm1ieHBvaTo...xyz'],
    type: [String],
  })
  mapboxPlaceIds: string[];
}