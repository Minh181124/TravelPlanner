'use client';

import apiClient from '@/lib/axios';
import type { LocalPlaceItem } from '@/types/local';

/**
 * Service cho Places - Tìm kiếm địa điểm
 */
export const placesService = {
  /**
   * Tìm kiếm địa điểm qua Backend (Backend sẽ gọi Mapbox Suggestions API)
   * Backend sẽ upsert dữ liệu vào database
   * 
   * Response từ Backend bao gồm: mapbox_id, google_place_id, ten, diachi, lat, lng, province
   */
  async searchPlaces(
    keyword: string,
    sessionToken: string,
    lat?: number,
    lng?: number
  ) {
    try {
      const response = await apiClient.post('/places/search', {
        keyword,
        session_token: sessionToken,
        lat,
        lng,
      });

      // Transform response từ backend thành LocalPlaceItem format (với đầy đủ địa chỉ)
      const places: LocalPlaceItem[] = response.data.data.map((place: any) => ({
        mapboxPlaceId: place.google_place_id || place.mapbox_id,
        ten: place.ten || 'Không rõ tên',
        diachi: place.diachi || '', // Địa chỉ đầy đủ từ Mapbox
        lat: place.lat || 0,
        lng: place.lng || 0,
        ghichu: undefined,
        thoiluong: 60,
      }));

      return places;
    } catch (error: any) {
      console.error('Lỗi tìm kiếm địa điểm:', error);
      throw error;
    }
  },
};
