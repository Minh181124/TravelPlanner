'use client';

import apiClient from '@/lib/axios';
import type { CreateLocalItineraryDto, UpdateLocalItineraryDto, LocalItinerary, SoThich } from '@/types/local';

/**
 * Service cho Local Itineraries - Tạo lịch trình mẫu
 */
export const localItineraryService = {
  /**
   * Lấy danh sách sở thích (dropdown)
   */
  async getSoThichList() {
    try {
      const response = await apiClient.get('/local/so-thich');
      return response.data.data;
    } catch (error: any) {
      console.error('Lỗi lấy danh sách sở thích:', error);
      throw error;
    }
  },

  /**
   * Tạo lịch trình Local mới
   */
  async createLocalItinerary(dto: CreateLocalItineraryDto) {
    try {
      const response = await apiClient.post('/local/itineraries', dto);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi tạo lịch trình Local:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả lịch trình Local (phân trang tuỳ chọn)
   */
  async getAllLocalItineraries(page?: number, limit?: number) {
    try {
      const params = new URLSearchParams();
      if (page !== undefined) params.append('page', page.toString());
      if (limit !== undefined) params.append('limit', limit.toString());
      
      const url = `/local/itineraries${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiClient.get(url);
      return response.data.data;
    } catch (error: any) {
      console.error('Lỗi lấy danh sách lịch trình Local:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết lịch trình Local
   */
  async getLocalItinerary(id: number) {
    try {
      const response = await apiClient.get(`/local/itineraries/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Lỗi lấy lịch trình Local:', error);
      throw error;
    }
  },

  /**
   * Cập nhật lịch trình Local
   */
  async updateLocalItinerary(id: number, dto: UpdateLocalItineraryDto) {
    try {
      const response = await apiClient.put(`/local/itineraries/${id}`, dto);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi cập nhật lịch trình Local:', error);
      throw error;
    }
  },

  /**
   * Xóa lịch trình Local
   */
  async deleteLocalItinerary(id: number) {
    try {
      const response = await apiClient.delete(`/local/itineraries/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi xóa lịch trình Local:', error);
      throw error;
    }
  },
};
