import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocalService } from './local.service';
import { CreateLocalItineraryDto, UpdateLocalItineraryDto } from './dto/create-local-itinerary.dto';

@ApiTags('Local - Lịch Trình Mẫu')
@Controller('local')
export class LocalController {
  constructor(private readonly localService: LocalService) {}

  /**
   * POST /local/itineraries
   * Tạo lịch trình Local mới
   */
  @Post('itineraries')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Tạo lịch trình Local mới',
    description:
      'Tạo một lịch trình mẫu (lichtrinh_local) với danh sách địa điểm, mẹo vặt, và thời lượng',
  })
  @ApiResponse({ status: 201, description: 'Tạo lịch trình Local thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async createLocalItinerary(@Body() dto: CreateLocalItineraryDto) {
    return this.localService.createLocalItinerary(dto);
  }

  /**
   * GET /local/itineraries
   * Lấy danh sách tất cả lịch trình Local (có phân trang)
   */
  @Get('itineraries')
  @ApiOperation({
    summary: 'Lấy danh sách tất cả lịch trình Local',
    description:
      'Lấy danh sách tất cả lịch trình Local với hỗ trợ phân trang (page, limit)',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async getAllLocalItineraries(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.localService.getAllLocalItineraries(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  /**
   * GET /local/itineraries/:id
   * Lấy chi tiết lịch trình Local
   */
  @Get('itineraries/:id')
  @ApiOperation({
    summary: 'Lấy chi tiết lịch trình Local',
    description: 'Lấy thông tin chi tiết của một lịch trình Local, bao gồm danh sách địa điểm',
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch trình' })
  async getLocalItinerary(@Param('id') id: string) {
    return this.localService.getLocalItinerary(parseInt(id, 10));
  }

  /**
   * PUT /local/itineraries/:id
   * Cập nhật lịch trình Local
   */
  @Put('itineraries/:id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cập nhật lịch trình Local',
    description:
      'Cập nhật tiêu đề, mô tả, sở thích và danh sách địa điểm của lịch trình Local. Nếu có places mới, sẽ re-sync toàn bộ danh sách',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật lịch trình Local thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch trình' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async updateLocalItinerary(
    @Param('id') id: string,
    @Body() dto: UpdateLocalItineraryDto,
  ) {
    return this.localService.updateLocalItinerary(parseInt(id, 10), dto);
  }

  /**
   * DELETE /local/itineraries/:id
   * Xóa lịch trình Local
   */
  @Delete('itineraries/:id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Xóa lịch trình Local',
    description:
      'Xóa một lịch trình Local và tất cả các bản ghi liên quan (cascade delete lichtrinh_local_diadiem)',
  })
  @ApiResponse({ status: 200, description: 'Xóa lịch trình Local thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch trình' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async deleteLocalItinerary(@Param('id') id: string) {
    return this.localService.deleteLocalItinerary(parseInt(id, 10));
  }

  /**
   * GET /local/so-thich
   * Lấy danh sách sở thích (dropdown)
   */
  @Get('so-thich')
  @ApiOperation({
    summary: 'Lấy danh sách sở thích',
    description: 'Dùng cho Dropdown chọn sở thích khi tạo lịch trình Local',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách sở thích thành công' })
  async getSoThichList() {
    return this.localService.getSoThichList();
  }
}