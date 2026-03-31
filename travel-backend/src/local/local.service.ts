import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocalItineraryDto, UpdateLocalItineraryDto, LocalPlaceItemDto } from './dto/create-local-itinerary.dto';
import axios from 'axios';

@Injectable()
export class LocalService {
  private readonly logger = new Logger(LocalService.name);
  private readonly mapboxToken: string;

  constructor(private readonly prisma: PrismaService) {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      throw new Error('MAPBOX_ACCESS_TOKEN chưa được cấu hình trong file .env');
    }
    this.mapboxToken = token;
  }

  /**
   * Tạo lịch trình Local mới với danh sách địa điểm
   * 
   * Quy trình:
   * 1. Kiểm tra và ensure user tồn tại
   * 2. Upsert mỗi địa điểm vào bảng diadiem dựa trên google_place_id (mapboxPlaceId)
   * 3. Tạo 1 bản ghi lichtrinh_local
   * 4. Tạo các bản ghi lichtrinh_local_diadiem chi tiết (với thutu, thoiluong, ghichu)
   * 
   * Sử dụng prisma.$transaction để đảm bảo tính atomicity
   */
  async createLocalItinerary(
    dto: CreateLocalItineraryDto,
    nguoidung_id: number = 1, // Tạm thời gán cứng, sau có thể lấy từ Auth
  ) {
    // Validate input
    if (!dto.tieude || !dto.places || dto.places.length === 0) {
      throw new HttpException(
        'Tieude và places là bắt buộc, cần ít nhất 1 địa điểm',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.places.length === 0) {
      throw new HttpException(
        'Cần ít nhất 1 địa điểm để tạo lịch trình',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // STEP 0: Kiểm tra user tồn tại, nếu không thì tạo user test
      let user = await this.prisma.nguoidung.findUnique({
        where: { nguoidung_id },
      });

      if (!user) {
        this.logger.warn(
          `User ID ${nguoidung_id} không tồn tại. Tạo user test mặc định...`,
        );
        user = await this.prisma.nguoidung.create({
          data: {
            email: `local-test-user-${nguoidung_id}@example.com`,
            matkhau: 'default_password_hash', // Trong thực tế, phải hash password
            ten: `Local User ${nguoidung_id}`,
            trangthai: 'active',
          },
        });
        this.logger.debug(`Tạo user test thành công: ${user.nguoidung_id}`);
      }

      // Thực hiện toàn bộ transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // STEP 1: Upsert tất cả các địa điểm vào bảng diadiem
        const upsertedPlaces: any[] = [];
        for (const place of dto.places) {
          const upsertedPlace = await tx.diadiem.upsert({
            where: { google_place_id: place.mapboxPlaceId },
            update: {
              ten: place.ten,
              lat: place.lat,
              lng: place.lng,
              ngaycapnhat: new Date(),
            },
            create: {
              google_place_id: place.mapboxPlaceId,
              ten: place.ten,
              lat: place.lat,
              lng: place.lng,
              ngaycapnhat: new Date(),
            },
          });
          upsertedPlaces.push(upsertedPlace);
        }

        // STEP 2: Tạo bản ghi lichtrinh_local
        const lichtrinh = await tx.lichtrinh_local.create({
          data: {
            nguoidung_id: user.nguoidung_id,
            tieude: dto.tieude,
            mota: dto.mota || null,
            sothich_id: dto.sothich_id || null,
            ngaytao: new Date(),
          },
        });

        // STEP 3: Tạo các bản ghi lichtrinh_local_diadiem
        const details: any[] = [];
        for (let index = 0; index < upsertedPlaces.length; index++) {
          const place = dto.places[index];
          const upsertedPlace = upsertedPlaces[index];

          const detail = await tx.lichtrinh_local_diadiem.create({
            data: {
              lichtrinh_local_id: lichtrinh.lichtrinh_local_id,
              diadiem_id: upsertedPlace.diadiem_id,
              thutu: index + 1, // Thứ tự bắt đầu từ 1
              thoigian_den: null, // Có thể để null hoặc tính toán sau
              thoiluong: place.thoiluong || null,
              ghichu: place.ghichu || null,
            },
          });
          details.push(detail);
        }

        return {
          lichtrinh_local_id: lichtrinh.lichtrinh_local_id,
          tieude: lichtrinh.tieude,
          mota: lichtrinh.mota,
          sothich_id: lichtrinh.sothich_id,
          nguoidung_id: lichtrinh.nguoidung_id,
          placesCount: upsertedPlaces.length,
          places: upsertedPlaces.map((p) => ({
            diadiem_id: p.diadiem_id,
            google_place_id: p.google_place_id,
            ten: p.ten,
            lat: p.lat,
            lng: p.lng,
          })),
          details: details.map((d) => ({
            lichtrinh_local_diadiem_id: d.lichtrinh_local_diadiem_id,
            thutu: d.thutu,
            ghichu: d.ghichu,
            thoiluong: d.thoiluong,
          })),
        };
      });

      return {
        message: 'Tạo lịch trình Local thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error('Lỗi tạo lịch trình Local:', error);
      throw new HttpException(
        'Lỗi tạo lịch trình Local: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách tất cả lịch trình Local (với phân trang tuỳ chọn)
   */
  async getAllLocalItineraries(page?: number, limit?: number) {
    try {
      const skip = page && limit ? (page - 1) * limit : 0;
      const take = limit || 10; // Default 10 items per page

      const [itineraries, total] = await Promise.all([
        this.prisma.lichtrinh_local.findMany({
          skip,
          take,
          include: {
            lichtrinh_local_diadiem: {
              include: { diadiem: true },
              orderBy: { thutu: 'asc' },
            },
            sothich: true,
          },
          orderBy: { ngaytao: 'desc' }, // Lịch trình mới nhất trước
        }),
        this.prisma.lichtrinh_local.count(),
      ]);

      return {
        message: 'Lấy danh sách lịch trình Local thành công',
        data: itineraries,
        pagination: {
          total,
          page: page || 1,
          limit: take,
          pages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.logger.error('Lỗi lấy danh sách lịch trình Local:', error);
      throw new HttpException(
        'Lỗi lấy danh sách lịch trình Local: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy chi tiết lịch trình Local theo ID
   */
  async getLocalItinerary(lichtrinh_local_id: number) {
    try {
      const lichtrinh = await this.prisma.lichtrinh_local.findUnique({
        where: { lichtrinh_local_id },
        include: {
          lichtrinh_local_diadiem: {
            include: {
              diadiem: true,
            },
            orderBy: { thutu: 'asc' },
          },
          sothich: true,
        },
      });

      if (!lichtrinh) {
        throw new HttpException(
          'Không tìm thấy lịch trình Local',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Lấy thông tin lịch trình Local thành công',
        data: lichtrinh,
      };
    } catch (error) {
      throw new HttpException(
        'Lỗi lấy lịch trình Local: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách sở thích (sothich)
   */
  async getSoThichList() {
    try {
      const soThichList = await this.prisma.sothich.findMany({
        select: {
          sothich_id: true,
          ten: true,
          mota: true,
        },
      });

      return {
        message: 'Lấy danh sách sở thích thành công',
        data: soThichList,
      };
    } catch (error) {
      throw new HttpException(
        'Lỗi lấy danh sách sở thích: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật lịch trình Local theo ID
   * 
   * Quy trình:
   * 1. Kiểm tra lịch trình có tồn tại không
   * 2. Update các trường tieude, mota, sothich_id (nếu có)
   * 3. Nếu có places mới, xóa hết lichtrinh_local_diadiem cũ và tạo mới (Re-sync)
   * 
   * Sử dụng prisma.$transaction để đảm bảo tính atomicity
   */
  async updateLocalItinerary(
    lichtrinh_local_id: number,
    dto: UpdateLocalItineraryDto,
    nguoidung_id?: number,
  ) {
    // Validate input
    if (!lichtrinh_local_id || lichtrinh_local_id <= 0) {
      throw new HttpException(
        'ID lịch trình không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Kiểm tra lịch trình có tồn tại không
      const existingLichtrinh = await this.prisma.lichtrinh_local.findUnique({
        where: { lichtrinh_local_id },
      });

      if (!existingLichtrinh) {
        throw new HttpException(
          'Não tìm thấy lịch trình Local',
          HttpStatus.NOT_FOUND,
        );
      }

      // Thực hiện toàn bộ transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // STEP 1: Update các trường cơ bản của lichtrinh_local
        const updatedData: any = {};
        if (dto.tieude !== undefined) updatedData.tieude = dto.tieude;
        if (dto.mota !== undefined) updatedData.mota = dto.mota;
        if (dto.sothich_id !== undefined) updatedData.sothich_id = dto.sothich_id || null;

        // STEP 2: Nếu có places mới, re-sync lichtrinh_local_diadiem
        if (dto.places && dto.places.length > 0) {
          // Xóa tất cả lichtrinh_local_diadiem cũ
          await tx.lichtrinh_local_diadiem.deleteMany({
            where: { lichtrinh_local_id },
          });

          // Upsert tất cả các địa điểm vào bảng diadiem
          const upsertedPlaces: any[] = [];
          for (const place of dto.places) {
            const upsertedPlace = await tx.diadiem.upsert({
              where: { google_place_id: place.mapboxPlaceId },
              update: {
                ten: place.ten,
                lat: place.lat,
                lng: place.lng,
                ngaycapnhat: new Date(),
              },
              create: {
                google_place_id: place.mapboxPlaceId,
                ten: place.ten,
                lat: place.lat,
                lng: place.lng,
                ngaycapnhat: new Date(),
              },
            });
            upsertedPlaces.push(upsertedPlace);
          }

          // Tạo các bản ghi lichtrinh_local_diadiem mới với thutu chính xác
          for (let index = 0; index < upsertedPlaces.length; index++) {
            const place = dto.places[index];
            const upsertedPlace = upsertedPlaces[index];

            await tx.lichtrinh_local_diadiem.create({
              data: {
                lichtrinh_local_id,
                diadiem_id: upsertedPlace.diadiem_id,
                thutu: index + 1, // Thứ tự bắt đầu từ 1
                thoigian_den: null,
                thoiluong: place.thoiluong || null,
                ghichu: place.ghichu || null,
              },
            });
          }
        }

        // Update lichtrinh_local với các trường vừa xác định
        const lichtrinh = await tx.lichtrinh_local.update({
          where: { lichtrinh_local_id },
          data: updatedData,
          include: {
            lichtrinh_local_diadiem: {
              include: { diadiem: true },
              orderBy: { thutu: 'asc' },
            },
            sothich: true,
          },
        });

        return lichtrinh;
      });

      return {
        message: 'Cập nhật lịch trình Local thành công',
        data: result,
      };
    } catch (error) {
      this.logger.error('Lỗi cập nhật lịch trình Local:', error);
      throw new HttpException(
        'Lỗi cập nhật lịch trình Local: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa lịch trình Local theo ID
   * Xóa sẽ cascade xóa tất cả lichtrinh_local_diadiem liên quan
   */
  async deleteLocalItinerary(lichtrinh_local_id: number) {
    // Validate input
    if (!lichtrinh_local_id || lichtrinh_local_id <= 0) {
      throw new HttpException(
        'ID lịch trình không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Kiểm tra lịch trình có tồn tại không
      const existingLichtrinh = await this.prisma.lichtrinh_local.findUnique({
        where: { lichtrinh_local_id },
      });

      if (!existingLichtrinh) {
        throw new HttpException(
          'Không tìm thấy lịch trình Local',
          HttpStatus.NOT_FOUND,
        );
      }

      // Xóa lịch trình (cascade xóa lichtrinh_local_diadiem)
      await this.prisma.lichtrinh_local.delete({
        where: { lichtrinh_local_id },
      });

      return {
        message: 'Xóa lịch trình Local thành công',
        data: {
          lichtrinh_local_id,
          deleted: true,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Lỗi xóa lịch trình Local:', error);
      throw new HttpException(
        'Lỗi xóa lịch trình Local: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
