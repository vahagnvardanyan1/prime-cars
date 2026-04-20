"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { TextReveal } from "./TextReveal";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { FiPlus, FiMinus } from "react-icons/fi";

const USA_GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const shippingFromCities = [
  { name: "New York, NY", coordinates: [-74.01, 40.71] as [number, number] },
  { name: "Norfolk, VA", coordinates: [-76.29, 36.85] as [number, number] },
  { name: "Savannah, GA", coordinates: [-81.1, 32.08] as [number, number] },
  { name: "Miami, FL", coordinates: [-80.19, 25.76] as [number, number] },
  { name: "Houston, TX", coordinates: [-95.37, 29.76] as [number, number] },
  { name: "Los Angeles, CA", coordinates: [-118.24, 34.05] as [number, number] },
  { name: "Tacoma, WA", coordinates: [-122.44, 47.25] as [number, number] },
  { name: "Kapolei, HI", coordinates: [-158.09, 21.34] as [number, number] },
  { name: "Anchorage, AK", coordinates: [-149.9, 61.22] as [number, number] },
  { name: "Etobicoke, ON", coordinates: [-79.56, 43.64] as [number, number] },
];

const shippingToDestinations = [
  { name: "Gyumri, Armenia", coordinates: [43.84, 40.79] as [number, number] },
  { name: "Rotterdam, Netherlands", coordinates: [4.48, 51.92] as [number, number] },
  { name: "Klaipeda, Lithuania", coordinates: [21.14, 55.71] as [number, number] },
  { name: "Poti, Georgia", coordinates: [41.67, 42.15] as [number, number] },
  { name: "Aqaba, Jordan", coordinates: [35.01, 29.53] as [number, number] },
  { name: "Salalah, Oman", coordinates: [54.09, 17.02] as [number, number] },
  { name: "Sohar, Oman", coordinates: [56.73, 24.36] as [number, number] },
  { name: "Jebel Ali, U.A.E", coordinates: [55.03, 25.01] as [number, number] },
  { name: "Gdynia, Poland", coordinates: [18.54, 54.52] as [number, number] },
];

function ContainerIcon({ color }: { color: string }) {
  const dark = color === "#22c55e" ? "#16a34a" : "#2563eb";
  const light = color === "#22c55e" ? "#4ade80" : "#60a5fa";
  return (
    <g transform="translate(-12, -10) scale(0.8)" className="cursor-pointer">
      {/* Top face (parallelogram) */}
      <polygon points="6,0 24,0 30,4 12,4" fill={light} />
      {/* Front face */}
      <rect x="6" y="0" width="18" height="12" fill={color} />
      {/* Side face */}
      <polygon points="24,0 30,4 30,16 24,12" fill={dark} />
      {/* Front ridges */}
      <rect x="8" y="1" width="1.5" height="10" fill="white" fillOpacity="0.2" />
      <rect x="11.5" y="1" width="1.5" height="10" fill="white" fillOpacity="0.2" />
      <rect x="15" y="1" width="1.5" height="10" fill="white" fillOpacity="0.2" />
      <rect x="18.5" y="1" width="1.5" height="10" fill="white" fillOpacity="0.2" />
      {/* Bottom edge */}
      <polygon points="6,12 24,12 30,16 12,16" fill={dark} fillOpacity="0.5" />
    </g>
  );
}

export function ShippingMap() {
  const [tab, setTab] = useState<"from" | "to">("from");
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([20, 40]);
  const [usaZoom, setUsaZoom] = useState(1);
  const [usaCenter, setUsaCenter] = useState<[number, number]>([-96, 38]);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  const handleMarkerHover = (name: string, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        name,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const currentZoom = tab === "from" ? usaZoom : zoom;
  const handleZoomIn = () => {
    if (tab === "from") {
      setUsaZoom((z) => Math.min(z * 1.5, 8));
    } else {
      setZoom((z) => Math.min(z * 1.5, 8));
    }
  };
  const handleZoomOut = () => {
    if (tab === "from") {
      setUsaZoom((z) => Math.max(z / 1.5, 1));
    } else {
      setZoom((z) => Math.max(z / 1.5, 1));
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <TextReveal
          text={t("home.shipping.title")}
          as="h2"
          className="mb-4"
        />
        <TextReveal
          text={t("home.shipping.description")}
          as="p"
          className="text-gray-600 dark:text-gray-400 mb-8"
          delay={0.3}
          wordDelay={0.03}
        />

        <div className="inline-flex rounded-full bg-gray-200 dark:bg-white/[0.08] p-1">
          <button
            type="button"
            onClick={() => setTab("from")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              tab === "from"
                ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t("home.shipping.from")}
          </button>
          <button
            type="button"
            onClick={() => setTab("to")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              tab === "to"
                ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t("home.shipping.to")}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] relative"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            aria-label="Zoom in"
          >
            <FiPlus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={currentZoom <= 1}
            className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-40"
            aria-label="Zoom out"
          >
            <FiMinus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg shadow-lg pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y - 40, transform: "translateX(-50%)" }}
          >
            {tooltip.name}
          </div>
        )}

        {tab === "from" ? (
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 1000 }}
            className="w-full h-auto"
            style={{ maxHeight: 500 }}
          >
            <ZoomableGroup
              zoom={usaZoom}
              center={usaCenter}
              onMoveEnd={({ coordinates, zoom: z }) => {
                setUsaCenter(coordinates as [number, number]);
                setUsaZoom(z);
              }}
            >
              <Geographies geography={USA_GEO_URL}>
                {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#d1d5db"
                      stroke="#fff"
                      strokeWidth={0.5}
                      className="dark:fill-gray-700 dark:stroke-gray-600 outline-none"
                    />
                  ))
                }
              </Geographies>
              {shippingFromCities.map((city) => (
                <Marker
                  key={city.name}
                  coordinates={city.coordinates}
                  onMouseEnter={(e) => handleMarkerHover(city.name, e as unknown as React.MouseEvent)}
                  onMouseMove={(e) => handleMarkerHover(city.name, e as unknown as React.MouseEvent)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <ContainerIcon color="#22c55e" />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        ) : (
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 280, center: [35, 38] }}
            className="w-full h-auto"
            style={{ maxHeight: 500 }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ coordinates, zoom: z }) => {
                setCenter(coordinates as [number, number]);
                setZoom(z);
              }}
            >
              <Geographies geography={WORLD_GEO_URL}>
                {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#d1d5db"
                      stroke="#fff"
                      strokeWidth={0.5}
                      className="dark:fill-gray-700 dark:stroke-gray-600 outline-none"
                    />
                  ))
                }
              </Geographies>
              {shippingToDestinations.map((country) => (
                <Marker
                  key={country.name}
                  coordinates={country.coordinates}
                  onMouseEnter={(e) => handleMarkerHover(country.name, e as unknown as React.MouseEvent)}
                  onMouseMove={(e) => handleMarkerHover(country.name, e as unknown as React.MouseEvent)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <ContainerIcon color="#429de6" />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        )}
      </div>

      <div className="flex justify-center gap-8 mt-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-4 h-3 rounded-sm bg-[#22c55e]" />
          {t("home.shipping.warehouses")}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-3 rounded-sm bg-[#429de6]" />
          {t("home.shipping.destinations")}
        </div>
      </div>
    </div>
  );
}
