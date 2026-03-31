import axios from 'axios';

/**
 * Instance Axios đã cấu hình sẵn cho NestJS backend API.
 *
 * Cách hoạt động:
 *   - Base URL được đọc từ biến môi trường `NEXT_PUBLIC_API_URL`
 *     (đặt trong `.env.local`), mặc định là http://localhost:3000.
 *   - Timeout 15 giây để tránh request treo quá lâu.
 *   - Tất cả request mặc định gửi Content-Type: application/json.
 */
const apiClient = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

export default apiClient;
