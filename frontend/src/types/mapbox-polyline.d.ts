/**
 * Type declarations for `@mapbox/polyline`.
 * @see https://github.com/mapbox/polyline
 */
declare module '@mapbox/polyline' {
  /**
   * Decode an encoded polyline string into an array of [latitude, longitude] pairs.
   * @param encoded - Encoded polyline string (Google format).
   * @param precision - Coordinate precision (default: 5).
   * @returns Array of [lat, lng] coordinate pairs.
   */
  export function decode(encoded: string, precision?: number): [number, number][];

  /**
   * Encode an array of [latitude, longitude] pairs into a polyline string.
   * @param coordinates - Array of [lat, lng] coordinate pairs.
   * @param precision - Coordinate precision (default: 5).
   * @returns Encoded polyline string.
   */
  export function encode(coordinates: [number, number][], precision?: number): string;

  /**
   * Encode a GeoJSON LineString or array of coordinates into a polyline string.
   * @param geojson - GeoJSON object or coordinate array.
   * @param precision - Coordinate precision (default: 5).
   * @returns Encoded polyline string.
   */
  export function fromGeoJSON(
    geojson: { type: 'Feature'; geometry: { type: 'LineString'; coordinates: [number, number][] } } | [number, number][],
    precision?: number,
  ): string;

  /**
   * Decode a polyline string into a GeoJSON LineString geometry.
   * @param encoded - Encoded polyline string.
   * @param precision - Coordinate precision (default: 5).
   * @returns GeoJSON LineString geometry.
   */
  export function toGeoJSON(
    encoded: string,
    precision?: number,
  ): { type: 'LineString'; coordinates: [number, number][] };
}
