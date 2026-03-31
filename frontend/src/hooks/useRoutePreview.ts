'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/lib/axios';
import axios from 'axios';
import type { RouteData } from '@/types';

/** Giải mã chuỗi polyline sang [lng, lat] */
async function decodePolyline(encoded: string): Promise<[number, number][]> {
  const polylineLib = await import('@mapbox/polyline');
  const decoded: [number, number][] = polylineLib.decode(encoded);
  return decoded.map(([lat, lng]) => [lng, lat]);
}

/**
 * Validate và chuẩn hóa dữ liệu route từ Backend.
 * ĐẺ bảo rằng cả tong_khoangcach và tong_thoigian đà có giá trị hợp lệ (number và > 0).
 */
function validateAndNormalizeRouteData(data: any): RouteData | null {
  if (!data || typeof data !== 'object') {
    console.warn('[useRoutePreview] Invalid route data structure:', data);
    return null;
  }

  const distance = data.tong_khoangcach ?? data.distance; // Fallback to 'distance' if tong_khoangcach not present
  const duration = data.tong_thoigian ?? data.duration; // Fallback to 'duration' if tong_thoigian not present
  const polyline = data.polyline;

  // Kiểm tra polyline
  if (typeof polyline !== 'string' || polyline.trim().length === 0) {
    console.warn('[useRoutePreview] Missing or invalid polyline:', polyline);
    return null;
  }

  // Kiểm tra khoảng cách
  if (typeof distance !== 'number' || isNaN(distance) || distance <= 0) {
    console.warn('[useRoutePreview] Invalid distance:', distance);
    return null;
  }

  // Kiểm tra thời gian
  if (typeof duration !== 'number' || isNaN(duration) || duration <= 0) {
    console.warn('[useRoutePreview] Invalid duration:', duration);
    return null;
  }

  // Development mode: Log validated data
  if (process.env.NODE_ENV === 'development') {
    console.debug('[useRoutePreview] Validated route data:', {
      polyline: polyline.substring(0, 30) + '...',
      tong_khoangcach: distance,
      tong_thoigian: duration,
    });
  }

  return {
    polyline,
    tong_khoangcach: distance,
    tong_thoigian: duration,
  };
}

const DEBOUNCE_MS = 500;

export function useRoutePreview(
  googlePlaceIds: string[],
  selectedPlaces: any[] = []
) {
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRoute = useCallback(async (ids: string[], places: any[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      // Lấy tọa độ trực tiếp từ object Mapbox Search Feature
      const coords = places
        .filter(p => p?.geometry?.coordinates)
        .map(p => ({
          lng: p.geometry.coordinates[0],
          lat: p.geometry.coordinates[1]
        }));

      // Gọi API Backend qua apiClient (baseURL đã cấu hình sẵn)
      const response = await apiClient.post('/places/route', {
        placeIds: ids,
        coordinates: coords 
      }, { signal: controller.signal });

      // Validate và chuẩn hóa dữ liệu trước sử dụng
      const result = response.data.data;
      const validatedRouteData = validateAndNormalizeRouteData(result);

      if (validatedRouteData && validatedRouteData.polyline) {
        const decodedCoords = await decodePolyline(validatedRouteData.polyline);
        setCoordinates(decodedCoords);
        setRouteData(validatedRouteData);
      } else {
        setError('Không thể xử lý dữ liệu tuyến đường');
        setCoordinates([]);
        setRouteData(null);
      }
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      setError(err.message || 'Không thể tải tuyến đường');
      setCoordinates([]);
      setRouteData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (googlePlaceIds.length < 2) {
      setCoordinates([]);
      setRouteData(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      fetchRoute(googlePlaceIds, selectedPlaces);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current!);
  }, [googlePlaceIds.join(','), fetchRoute]);

  return { coordinates, routeData, isLoading, error };
}