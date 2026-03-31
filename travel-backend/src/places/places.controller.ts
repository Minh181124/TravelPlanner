import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { SearchPlaceDto, GetRouteDto, CreateSampleItineraryDto } from './dto/places.dto';

/**
 * PlacesController — Điều phối các endpoint liên quan đến địa điểm và lộ trình.
 */
@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  /**
   * POST /places/search
   * Tìm kiếm địa điểm qua Mapbox Search API và lưu/cập nhật vào DB.
   */
  @Post('search')
  @ApiOperation({
    summary: 'Tìm kiếm và lưu địa điểm',
    description:
      'Sử dụng Mapbox Search Box API để tìm địa điểm, lấy tọa độ chính xác và lưu vào database.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách địa điểm đã xử lý thành công' })
  @ApiResponse({ status: 502, description: 'Lỗi kết nối Mapbox API' })
  async searchAndSave(@Body() dto: SearchPlaceDto) {
    return this.placesService.searchAndSave(dto.keyword, dto.lat, dto.lng);
  }

  /**
   * POST /places/route
   * Lấy tuyến đường giữa các địa điểm qua Mapbox Directions API.
   */
  @Post('route')
  @ApiOperation({
    summary: 'Lấy tuyến đường',
    description:
      'Sử dụng Mapbox Directions API để tính toán lộ trình dựa trên danh sách ID địa điểm và phương tiện chọn lựa.',
  })
  @ApiResponse({ status: 200, description: 'Thông tin tuyến đường thành công' })
  @ApiResponse({ status: 400, description: 'Cần ít nhất 2 địa điểm để tạo lộ trình' })
  @ApiResponse({ status: 502, description: 'Lỗi kết nối Mapbox Directions API' })
  async getRoute(@Body() dto: GetRouteDto) {
    // Truyền placeIds, profile (phương tiện), và coordinates từ Frontend vào Service
    return this.placesService.getRoute(dto.placeIds, dto.profile, dto.coordinates);
  }

  /**
   * POST /places/itinerary
   * Tạo lịch trình mẫu (lichtrinh_local) từ danh sách địa điểm.
   */
  @Post('itinerary')
  @ApiOperation({
    summary: 'Tạo lịch trình mẫu',
    description:
      'Tạo một lịch trình mẫu (lichtrinh_local) gồm tiêu đề, mô tả và danh sách địa điểm theo thứ tự.',
  })
  @ApiResponse({ status: 201, description: 'Tạo lịch trình mẫu thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Một số địa điểm không tồn tại trong DB' })
  async createSampleItinerary(@Body() dto: CreateSampleItineraryDto) {
    return this.placesService.createSampleItinerary(
      dto.title,
      dto.description,
      dto.mapboxPlaceIds,
    );
  }

  /**
   * POST /places/itinerary-with-route
   * Tạo lịch trình mẫu KÈM tuyến đường (gọi Mapbox Directions → lưu polyline vào DB).
   */
  @Post('itinerary-with-route')
  @ApiOperation({
    summary: 'Tạo lịch trình mẫu kèm tuyến đường',
    description:
      'Tạo lịch trình (lichtrinh_local), gọi Mapbox Directions API lấy polyline, lưu tất cả vào DB trong 1 transaction.',
  })
  @ApiResponse({ status: 201, description: 'Tạo lịch trình kèm tuyến đường thành công' })
  @ApiResponse({ status: 400, description: 'Cần ít nhất 2 địa điểm' })
  @ApiResponse({ status: 404, description: 'Địa điểm không tồn tại trong DB' })
  @ApiResponse({ status: 502, description: 'Lỗi kết nối Mapbox Directions API' })
  async createSampleItineraryWithRoute(@Body() dto: CreateSampleItineraryDto) {
    return this.placesService.createSampleItineraryWithRoute(
      dto.title,
      dto.description,
      dto.mapboxPlaceIds,
    );
  }
}