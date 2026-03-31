import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { diadiem } from '@prisma/client';

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);
  private readonly mapboxToken: string;

  constructor(private readonly prisma: PrismaService) {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      throw new Error('MAPBOX_ACCESS_TOKEN chưa được cấu hình trong file .env');
    }
    this.mapboxToken = token;
  }

 /**
   * 1. Tìm kiếm và lưu địa điểm (GPS là tùy chọn)
   * @param keyword - Từ khóa tìm kiếm
   * @param sessionToken - Session token từ Frontend để gộp requests thành 1 session Mapbox
   * @param lat - Vĩ độ (tuỳ chọn)
   * @param lng - Kinh độ (tuỳ chọn)
   */
  async searchAndSave(keyword: string, sessionToken: string, lat?: number, lng?: number) {
    const suggestUrl = 'https://api.mapbox.com/search/searchbox/v1/suggest';
    const retrieveUrl = 'https://api.mapbox.com/search/searchbox/v1/retrieve';

    // Khung tọa độ mặc định TP.HCM
    const hcmBbox = '106.35,10.35,107.02,11.16';

    try {
      const suggestRes = await axios.get(suggestUrl, {
        params: {
          q: keyword,
          language: 'vi',
          access_token: this.mapboxToken,
          session_token: sessionToken, // Sử dụng session_token từ Frontend
          limit: 10,
          country: 'vn',
          types: 'address,poi',
          // Tự động điều chỉnh: Ưu tiên GPS nếu có, ngược lại dùng Bbox
          ...(lat && lng 
            ? { proximity: `${lng},${lat}` } 
            : { bbox: hcmBbox }
          ),
        },
      });

      const suggestions = suggestRes.data.suggestions;
      const savedPlaces: any[] = [];

      await Promise.all(
        suggestions.map(async (place: any) => {
          try {
            const detailRes = await axios.get(
              `${retrieveUrl}/${place.mapbox_id}`,
              {
                params: {
                  access_token: this.mapboxToken,
                  session_token: sessionToken, // Sử dụng cùng session_token
                },
              },
            );

            const feature = detailRes.data.features[0];
            const [pointLng, pointLat] = feature.geometry.coordinates;
            
            // Trích xuất thông tin địa chỉ đầy đủ
            const fullAddress = feature.properties.full_address || 
                               feature.properties.place_name || 
                               place.full_address || 
                               '';
            
            // Trích xuất tỉnh/thành phố từ context nếu có
            let province = '';
            if (feature.properties.context && Array.isArray(feature.properties.context)) {
              const regionContext = feature.properties.context.find((ctx: any) => ctx.id.includes('region'));
              if (regionContext) {
                province = regionContext.text;
              }
            }

            const placeData = {
              ten: feature.properties.name || place.name || 'Không rõ tên',
              diachi: fullAddress,
              lat: pointLat,
              lng: pointLng,
              loai: place.poi_category?.[0] || feature.properties.poi_category?.[0] || 'place',
              danhgia: null, // Để null theo ý Minh
              soluotdanhgia: null,
              giatien: null,
              ngaycapnhat: new Date(),
            };

            const upsertedPlace = await this.prisma.diadiem.upsert({
              where: { google_place_id: place.mapbox_id },
              update: placeData,
              create: {
                google_place_id: place.mapbox_id,
                ...placeData,
              },
            });

            // Trả về với thông tin đầy đủ (không chỉ DB record)
            savedPlaces.push({
              mapbox_id: place.mapbox_id,
              google_place_id: upsertedPlace.google_place_id,
              ten: upsertedPlace.ten,
              diachi: upsertedPlace.diachi,
              lat: upsertedPlace.lat,
              lng: upsertedPlace.lng,
              province: province,
              diadiem_id: upsertedPlace.diadiem_id,
            });
          } catch (err) {
            this.logger.warn(`Lỗi lấy chi tiết mapbox_id: ${place.mapbox_id}`, err);
          }
        }),
      );

      return {
        message: lat && lng 
          ? `Tìm kiếm quanh vị trí hiện tại của bạn` 
          : `Tìm kiếm trong khu vực TP.HCM`,
        data: savedPlaces,
      };
    } catch (error) {
      this.logger.error('Lỗi Search API:', error.message);
      throw new HttpException('Lỗi API Mapbox', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * 2. Lấy tuyến đường giữa các điểm (Dùng tọa độ từ DB)
   * profile: 'mapbox/driving-traffic', 'mapbox/driving', 'mapbox/walking', 'mapbox/cycling'
   */
    async getRoute(
  placeIds: string[], 
  profile: string = 'mapbox/driving-traffic',
  coordinatesFromFrontend?: { lng: number; lat: number }[] // Thêm cái này
) {
  if (!placeIds || placeIds.length < 2) {
    throw new HttpException('Cần ít nhất 2 điểm', HttpStatus.BAD_REQUEST);
  }

  try {
    let waypoints = '';

    // Nếu Frontend có gửi tọa độ kèm theo, dùng luôn cho nhanh
    if (coordinatesFromFrontend && coordinatesFromFrontend.length === placeIds.length) {
      waypoints = coordinatesFromFrontend.map(p => `${p.lng},${p.lat}`).join(';');
    } else {
      // Logic cũ: Tìm trong DB (phòng hờ khi load lịch trình cũ)
      const placesInDb = await this.prisma.diadiem.findMany({
        where: { google_place_id: { in: placeIds } },
      });
      const sortedPlaces = placeIds
        .map((id) => placesInDb.find((p) => p.google_place_id === id))
        .filter((p) => p !== undefined);
      
      if (sortedPlaces.length < 2) throw new HttpException('Thiếu dữ liệu DB', 404);
      waypoints = sortedPlaces.map((p) => `${p.lng},${p.lat}`).join(';');
    }

    const url = `https://api.mapbox.com/directions/v5/${profile}/${waypoints}`;
    const response = await axios.get(url, {
      params: {
        geometries: 'polyline',
        overview: 'full',
        access_token: this.mapboxToken,
      },
    });

    const route = response.data.routes[0];
    return {
      message: 'Lấy tuyến đường thành công',
      data: {
        polyline: route.geometry,
        tong_khoangcach: route.distance,    // Mét (number) — frontend tự format
        tong_thoigian: route.duration,       // Giây (number) — frontend tự format
      },
    };
  } catch (error) {
    throw new HttpException('Lỗi tính toán đường đi', 502);
  }
}
  /**
   * 3. Tạo lịch trình mẫu (lichtrinh_local) từ danh sách mapbox place IDs
   *
   * Bước 1: Map mapboxPlaceId → diadiem_id (giữ nguyên thứ tự)
   * Bước 2: Tạo bản ghi lichtrinh_local
   * Bước 3: Tạo các bản ghi lichtrinh_local_diadiem với thutu tăng dần từ 1
   */
  async createSampleItinerary(
    title: string,
    description: string,
    mapboxPlaceIds: string[],
  ) {
    // --- Validate đầu vào ---
    if (!mapboxPlaceIds || mapboxPlaceIds.length === 0) {
      throw new HttpException(
        'Cần ít nhất 1 địa điểm để tạo lịch trình',
        HttpStatus.BAD_REQUEST,
      );
    }

    // --- Bước 1: Truy vấn tất cả địa điểm theo google_place_id ---
    const placesInDb = await this.prisma.diadiem.findMany({
      where: { google_place_id: { in: mapboxPlaceIds } },
    });

    // Tạo map để tra cứu nhanh: google_place_id → diadiem record
    const placeMap = new Map(
      placesInDb.map((p) => [p.google_place_id, p]),
    );

    // Giữ nguyên thứ tự theo mảng đầu vào & kiểm tra thiếu
    const orderedPlaces = mapboxPlaceIds.map((id) => {
      const place = placeMap.get(id);
      if (!place) {
        throw new HttpException(
          `Địa điểm với google_place_id "${id}" không tồn tại trong DB. Hãy tìm kiếm trước.`,
          HttpStatus.NOT_FOUND,
        );
      }
      return place;
    });

    // --- Bước 2 & 3: Transaction đảm bảo tính toàn vẹn dữ liệu ---
    const newItinerary = await this.prisma.$transaction(async (tx) => {
      // Tạo bản ghi lịch trình chính
      const itinerary = await tx.lichtrinh_local.create({
        data: {
          tieude: title,
          mota: description,
        },
      });

      // Tạo các bản ghi trung gian (thứ tự bắt đầu từ 1)
      await Promise.all(
        orderedPlaces.map((place, index) =>
          tx.lichtrinh_local_diadiem.create({
            data: {
              lichtrinh_local_id: itinerary.lichtrinh_local_id,
              diadiem_id: place.diadiem_id,
              thutu: index + 1,
            },
          }),
        ),
      );

      // Trả về lịch trình kèm danh sách địa điểm chi tiết
      return tx.lichtrinh_local.findUnique({
        where: { lichtrinh_local_id: itinerary.lichtrinh_local_id },
        include: {
          lichtrinh_local_diadiem: {
            orderBy: { thutu: 'asc' },
            include: {
              diadiem: true,
            },
          },
        },
      });
    });

    return {
      message: 'Tạo lịch trình mẫu thành công',
      data: newItinerary,
    };
  }

  /**
   * 4. Tạo lịch trình mẫu KÈM tuyến đường (Polyline) từ Mapbox Directions API
   *
   * Flow:
   *  1. Lấy thông tin tọa độ từ DB theo mapboxPlaceIds (giữ thứ tự)
   *  2. Gọi Mapbox Directions API → lấy polyline, khoảng cách, thời gian
   *  3. Transaction:
   *     a. Tạo lichtrinh_local
   *     b. Tạo lichtrinh_local_diadiem (thutu tăng dần)
   *     c. Tạo tuyen_duong (lưu polyline vào DB)
   *  4. Trả về lịch trình đầy đủ kèm thông tin tuyến đường
   */
  async createSampleItineraryWithRoute(
    title: string,
    description: string,
    mapboxPlaceIds: string[],
  ) {
    // --- Validate ---
    if (!mapboxPlaceIds || mapboxPlaceIds.length < 2) {
      throw new HttpException(
        'Cần ít nhất 2 địa điểm để tạo lịch trình có tuyến đường',
        HttpStatus.BAD_REQUEST,
      );
    }

    // --- Bước 1: Lấy thông tin địa điểm từ DB, giữ nguyên thứ tự ---
    const placesInDb = await this.prisma.diadiem.findMany({
      where: { google_place_id: { in: mapboxPlaceIds } },
    });

    const placeMap = new Map(
      placesInDb.map((p) => [p.google_place_id, p]),
    );

    const orderedPlaces = mapboxPlaceIds.map((id) => {
      const place = placeMap.get(id);
      if (!place) {
        throw new HttpException(
          `Địa điểm "${id}" không tồn tại trong DB. Hãy gọi /places/search trước.`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (place.lat == null || place.lng == null) {
        throw new HttpException(
          `Địa điểm "${id}" thiếu tọa độ (lat/lng) trong DB.`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return place;
    });

    // --- Bước 2: Gọi Mapbox Directions API ---
    const waypoints = orderedPlaces
      .map((p) => `${p.lng},${p.lat}`)
      .join(';');

    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}`;

    let routeData: { polyline: string; distance: number; duration: number };

    try {
      const response = await axios.get(directionsUrl, {
        params: {
          alternatives: false,
          geometries: 'polyline',
          overview: 'full',
          steps: false,
          access_token: this.mapboxToken,
        },
      });

      const route = response.data.routes?.[0];
      if (!route) {
        throw new Error('Mapbox không trả về tuyến đường nào');
      }

      routeData = {
        polyline: route.geometry,            // Chuỗi polyline encoded
        distance: route.distance,            // Mét
        duration: Math.round(route.duration), // Giây (làm tròn)
      };
    } catch (error) {
      this.logger.error(
        'Lỗi Mapbox Directions khi tạo lịch trình:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Không thể lấy tuyến đường từ Mapbox. Kiểm tra lại tọa độ các điểm.',
        HttpStatus.BAD_GATEWAY,
      );
    }

    // --- Bước 3: Transaction — tạo lịch trình + địa điểm + tuyến đường ---
    const result = await this.prisma.$transaction(async (tx) => {
      // 3a. Tạo bản ghi lịch trình chính
      const itinerary = await tx.lichtrinh_local.create({
        data: {
          tieude: title,
          mota: description,
        },
      });

      // 3b. Tạo các bản ghi trung gian (thutu từ 1)
      await Promise.all(
        orderedPlaces.map((place, index) =>
          tx.lichtrinh_local_diadiem.create({
            data: {
              lichtrinh_local_id: itinerary.lichtrinh_local_id,
              diadiem_id: place.diadiem_id,
              thutu: index + 1,
            },
          }),
        ),
      );

      // 3c. Lưu tuyến đường (polyline, khoảng cách, thời gian)
      // Lưu ý: tuyen_duong trong schema chỉ link với lichtrinh_nguoidung,
      // nên lichtrinh_nguoidung_id để null. Frontend dùng polyline từ response.
      const tuyenDuong = await tx.tuyen_duong.create({
        data: {
          polyline: routeData.polyline,
          tong_khoangcach: routeData.distance,
          tong_thoigian: routeData.duration,
        },
      });

      // 3d. Query lại lịch trình đầy đủ
      const fullItinerary = await tx.lichtrinh_local.findUnique({
        where: { lichtrinh_local_id: itinerary.lichtrinh_local_id },
        include: {
          lichtrinh_local_diadiem: {
            orderBy: { thutu: 'asc' },
            include: {
              diadiem: true,
            },
          },
        },
      });

      return { fullItinerary, tuyenDuong };
    });

    // --- Bước 4: Format response cho frontend ---
    return {
      message: 'Tạo lịch trình mẫu kèm tuyến đường thành công',
      data: {
        lichTrinh: result.fullItinerary,
        tuyenDuong: {
          tuyen_duong_id: result.tuyenDuong.tuyen_duong_id,
          polyline: result.tuyenDuong.polyline,
          tongKhoangCach: `${((result.tuyenDuong.tong_khoangcach as any) / 1000).toFixed(1)} km`,
          tongThoiGian: `${Math.round((result.tuyenDuong.tong_thoigian ?? 0) / 60)} phút`,
        },
      },
    };
  }


}
