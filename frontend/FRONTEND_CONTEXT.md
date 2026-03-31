# Frontend Development Context - Trip Planner Pro

## 1. Tech Stack Constraints
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **Map Engine:** Mapbox GL (`react-map-gl`)
- **API Client:** Axios (Base URL: http://localhost:3000)

## 2. Database Schema Alignment (CRITICAL)
Always use the exact field names from `schema.prisma`. Do NOT use generic names like 'id' or 'title'.
- **Place Object:** Use `diadiem_id`, `google_place_id`, `ten`, `diachi`, `lat`, `lng`.
- **Itinerary Object:** Use `lichtrinh_local_id` or `lichtrinh_nguoidung_id`, `tieude`, `mota`.
- **Route Object:** Use `tuyen_duong_id`, `polyline`, `tong_khoangcach`, `tong_thoigian`.

## 3. Component Architecture
- `src/components/`: Modular UI units.
- `src/services/`: API call functions (e.g., `placesService`).
- `src/hooks/`: Reusable logic (e.g., `useRoutePreview`).
- `src/types/`: TypeScript interfaces defined in `index.ts`.

## 4. Key Workflows
1. **Real-time Preview:** - When the user adds/reorders places, call `GET /places/route` with an array of `google_place_id`.
   - Backend returns a `polyline` string.
   - Frontend decodes this string using `@mapbox/polyline` to render on the map.
2. **Final Save:** - Call `POST /places/itinerary-with-route` only when the "Create Template" button is clicked.
   - This triggers a Database Transaction on the backend.

## 5. Coding Rules
- Use `'use client'` directive for components using Mapbox or React Hooks.
- Prefer Lucide React for iconography.
- Handle loading states for Map and API calls.
- Always use the `@/` alias for imports (e.g., `@/components/Map`).