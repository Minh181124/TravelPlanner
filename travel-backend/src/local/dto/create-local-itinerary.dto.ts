import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO cho một địa điểm trong lịch trình Local
 */
export class LocalPlaceItemDto {
  @ApiProperty({
    description: 'Mapbox Place ID (google_place_id)',
    example: 'dXJuOm1ieHBvaTo123',
  })
  mapboxPlaceId: string;

  @ApiProperty({
    description: 'Tên địa điểm',
    example: 'Nhà Thờ Đức Bà',
  })
  ten: string;

  @ApiProperty({
    description: 'Vĩ độ (Latitude)',
    example: 10.7726,
    type: Number,
  })
  lat: number;

  @ApiProperty({
    description: 'Kinh độ (Longitude)',
    example: 106.6984,
    type: Number,
  })
  lng: number;

  @ApiProperty({
    description: 'Mẹo vặt / Ghi chú của Local về điểm này',
    example: 'Nên đến vào buổi sáng để tránh nóng',
    required: false,
  })
  ghichu?: string | null;

  @ApiProperty({
    description: 'Thời lượng tham quan (phút)',
    example: 60,
    required: false,
  })
  thoiluong?: number | null;
}

/**
 * DTO cho request tạo lịch trình Local mới (/api/local/itineraries)
 */
export class CreateLocalItineraryDto {
  @ApiProperty({
    description: 'Tiêu đề lịch trình',
    example: 'Một ngày ở Sài Gòn',
  })
  tieude: string;

  @ApiProperty({
    description: 'Mô tả chi tiết',
    example: 'Khám phá những điểm nổi bật nhất của thành phố',
    required: false,
  })
  mota?: string | null;

  @ApiProperty({
    description: 'ID sở thích / danh mục lịch trình',
    example: 1,
    required: false,
  })
  sothich_id?: number | null;

  @ApiProperty({
    description: 'Danh sách các địa điểm trong lịch trình (theo thứ tự)',
    type: [LocalPlaceItemDto],
    example: [
      {
        mapboxPlaceId: 'place1',
        ten: 'Nhà Thờ Đức Bà',
        lat: 10.7726,
        lng: 106.6984,
        ghichu: 'Nên ghé vào buổi sáng',
        thoiluong: 60,
      },
      {
        mapboxPlaceId: 'place2',
        ten: 'Dinh Độc Lập',
        lat: 10.7956,
        lng: 106.6948,
        ghichu: 'Vé vào khoảng 50k',
        thoiluong: 45,
      },
    ],
  })
  places: LocalPlaceItemDto[];
}

/**
 * DTO cho request cập nhật lịch trình Local (PUT /api/local/itineraries/:id)
 * Tất cả fields đều optional vì có thể update một phần
 */
export class UpdateLocalItineraryDto {
  @ApiProperty({
    description: 'Tiêu đề lịch trình',
    example: 'Một ngày ở Sài Gòn - Phiên bản 2',
    required: false,
  })
  tieude?: string;

  @ApiProperty({
    description: 'Mô tả chi tiết',
    example: 'Khám phá những điểm nổi bật nhất của thành phố',
    required: false,
  })
  mota?: string | null;

  @ApiProperty({
    description: 'ID sở thích / danh mục lịch trình',
    example: 2,
    required: false,
  })
  sothich_id?: number | null;

  @ApiProperty({
    description: 'Danh sách các địa điểm trong lịch trình (thay thế toàn bộ danh sách cũ)',
    type: [LocalPlaceItemDto],
    required: false,
    example: [
      {
        mapboxPlaceId: 'place1',
        ten: 'Nhà Thờ Đức Bà',
        lat: 10.7726,
        lng: 106.6984,
        ghichu: 'Nên ghé vào buổi sáng',
        thoiluong: 90,
      },
    ],
  })
  places?: LocalPlaceItemDto[];
}
