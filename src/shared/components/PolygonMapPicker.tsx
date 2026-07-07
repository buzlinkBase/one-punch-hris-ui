import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet/dist/leaflet.css";
import type { GeoJsonPolygon } from "@/shared/types/geo.types";

// Fix default marker icons broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CEBU_CENTER: [number, number] = [10.3157, 123.8854];

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en", "User-Agent": "OnePunchHRIS/1.0" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.display_name as string) ?? null;
  } catch {
    return null;
  }
}

function polygonCentroid(coords: number[][]): [number, number] {
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  return [lat, lng];
}

interface GeomanControlProps {
  value: GeoJsonPolygon | null;
  onChange: (polygon: GeoJsonPolygon | null) => void;
  onAddressFound?: (address: string) => void;
}

function GeomanControl({ value, onChange, onAddressFound }: GeomanControlProps) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  const extractPolygon = (layer: L.Layer): GeoJsonPolygon | null => {
    const geojson = (layer as L.Polygon).toGeoJSON();
    if (geojson.geometry?.type === "Polygon") return geojson.geometry as GeoJsonPolygon;
    return null;
  };

  const clearExistingLayer = () => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
  };

  const handlePolygonChange = async (polygon: GeoJsonPolygon | null) => {
    onChange(polygon);
    if (polygon && onAddressFound) {
      const [lat, lng] = polygonCentroid(polygon.coordinates[0]);
      const address = await reverseGeocode(lat, lng);
      if (address) onAddressFound(address);
    }
  };

  useEffect(() => {
    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawText: false,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    });

    if (value) {
      clearExistingLayer();
      const coords = value.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
      const layer = L.polygon(coords, { color: "#1DA081", fillOpacity: 0.2 }).addTo(map);
      layerRef.current = layer;
      map.fitBounds((layer as L.Polygon).getBounds(), { padding: [40, 40] });
    }

    map.on("pm:create", (e) => {
      clearExistingLayer();
      layerRef.current = e.layer;
      handlePolygonChange(extractPolygon(e.layer));
    });

    map.on("pm:edit", (e) => {
      handlePolygonChange(extractPolygon(e.layer));
    });

    map.on("pm:remove", () => {
      layerRef.current = null;
      onChange(null);
    });

    return () => {
      map.pm.removeControls();
      map.off("pm:create");
      map.off("pm:edit");
      map.off("pm:remove");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

interface PolygonMapPickerProps {
  value: GeoJsonPolygon | null;
  onChange: (polygon: GeoJsonPolygon | null) => void;
  /** Called with the reverse-geocoded address after a polygon is drawn/edited. Only fires when address is not yet set. */
  onAddressFound?: (address: string) => void;
  height?: number;
}

export function PolygonMapPicker({ value, onChange, onAddressFound, height = 400 }: PolygonMapPickerProps) {
  // Lazy initialisers avoid synchronous setState in an effect body.
  // `hadInitialValue` lets the geolocation effect skip without referencing `value` as a dep.
  const hadInitialValue = useRef(!!value);
  const [center, setCenter] = useState<[number, number]>(() =>
    value ? polygonCentroid(value.coordinates[0]) : CEBU_CENTER,
  );
  const [ready, setReady] = useState(() => !!value);

  useEffect(() => {
    if (hadInitialValue.current) return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setReady(true);
      },
      () => setReady(true),
    );
  }, []);

  if (!ready) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", borderRadius: 8, color: "#9ca3af", fontSize: 13 }}>
        Locating...
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <MapContainer center={center} zoom={14} style={{ height }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeomanControl value={value} onChange={onChange} onAddressFound={onAddressFound} />
      </MapContainer>
    </div>
  );
}
