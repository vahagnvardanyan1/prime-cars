"use client";

import { useState, useRef, useEffect } from "react";
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
import { useIsMobile } from "@/components/ui/use-mobile";

// Land fill colors per theme. Used for default + hover + pressed
// so react-simple-maps' built-in hover lighten doesn't fire.

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const shippingFromCities = [
  { name: "New York, NY", coordinates: [-74.04, 40.67] as [number, number] },
  { name: "Norfolk, VA", coordinates: [-76.33, 36.92] as [number, number] },
  { name: "Savannah, GA", coordinates: [-81.14, 32.13] as [number, number] },
  { name: "Miami, FL", coordinates: [-80.16, 25.78] as [number, number] },
  { name: "Houston, TX", coordinates: [-95.26, 29.72] as [number, number] },
  { name: "Los Angeles, CA", coordinates: [-118.27, 33.74] as [number, number] },
  { name: "Tacoma, WA", coordinates: [-122.41, 47.27] as [number, number] },
  { name: "Kapolei, HI", coordinates: [-158.12, 21.31] as [number, number] },
  { name: "Anchorage, AK", coordinates: [-149.89, 61.24] as [number, number] },
  { name: "Toronto, ON", coordinates: [-79.37, 43.64] as [number, number] },
];

const shippingToDestinations = [
  { name: "Gyumri, Armenia", coordinates: [43.85, 40.79] as [number, number] },
  { name: "Rotterdam, Netherlands", coordinates: [4.14, 51.95] as [number, number] },
  { name: "Klaipeda, Lithuania", coordinates: [21.13, 55.72] as [number, number] },
  { name: "Poti, Georgia", coordinates: [41.65, 42.15] as [number, number] },
  { name: "Aqaba, Jordan", coordinates: [35.0, 29.52] as [number, number] },
  { name: "Salalah, Oman", coordinates: [54.0, 16.94] as [number, number] },
  { name: "Sohar, Oman", coordinates: [56.62, 24.49] as [number, number] },
  { name: "Jebel Ali, U.A.E", coordinates: [55.06, 24.98] as [number, number] },
  { name: "Gdynia, Poland", coordinates: [18.55, 54.54] as [number, number] },
  { name: "Bremerhaven, Germany", coordinates: [8.57, 53.58] as [number, number] },
];

function ContainerIcon({ color, scale = 1 }: { color: string; scale?: number }) {
  const dark = color === "#22c55e" ? "#16a34a" : "#2563eb";
  const light = color === "#22c55e" ? "#4ade80" : "#60a5fa";
  return (
    <g transform={`translate(-12, -10) scale(${scale})`} className="cursor-pointer">
      {/* Invisible tap/click target */}
      <rect x="-4" y="-6" width="40" height="28" fill="transparent" />
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

// Per-tab viewport configuration (center + scale).
// Both tabs render the same world TopoJSON via the same geoEqualEarth projection;
// only the focus differs. This keeps the two views visually consistent.
const VIEWPORTS = {
  from: {
    desktop: { center: [-105, 38] as [number, number], scale: 400 },
    mobile: { center: [-105, 38] as [number, number], scale: 200 },
  },
  to: {
    desktop: { center: [33, 38] as [number, number], scale: 700 },
    mobile: { center: [35, 35] as [number, number], scale: 320 },
  },
};

// Default zoom levels — tuned so every marker is visible without zooming.
// Mobile uses a wider field of view (lower projection scale) at zoom 1 so the
// 2.45×/1.7× desktop defaults would crop markers.
const DEFAULT_ZOOM = {
  from: { desktop: 2.45, mobile: 1 },
  to: { desktop: 1.7, mobile: 1 },
};

export function ShippingMap() {
  const [tab, setTab] = useState<"from" | "to">("from");
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{ name: string; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM.to.desktop);
  const [center, setCenter] = useState<[number, number]>(VIEWPORTS.to.desktop.center);
  const [usaZoom, setUsaZoom] = useState(DEFAULT_ZOOM.from.desktop);
  const [usaCenter, setUsaCenter] = useState<[number, number]>(VIEWPORTS.from.desktop.center);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const isMobile = useIsMobile();

  // Reset zoom + pan to the platform's default whenever the breakpoint crosses.
  // useIsMobile starts false on SSR/first paint, then flips after hydration on
  // mobile devices — this effect re-syncs the viewport to mobile-appropriate
  // defaults so all markers stay visible.
  useEffect(() => {
    const platform = isMobile ? "mobile" : "desktop";
    setUsaZoom(DEFAULT_ZOOM.from[platform]);
    setUsaCenter(VIEWPORTS.from[platform].center);
    setZoom(DEFAULT_ZOOM.to[platform]);
    setCenter(VIEWPORTS.to[platform].center);
  }, [isMobile]);

  // Hover tooltip (desktop) — follows cursor
  const handleMarkerHover = (name: string, e: React.MouseEvent) => {
    if (activeMarker) return; // click tooltip takes priority
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setHoverTooltip({
        name,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMarkerLeave = () => {
    if (!activeMarker) setHoverTooltip(null);
  };

  // Click/tap tooltip (both mobile and desktop) — anchored at bottom
  const handleMarkerClick = (name: string) => {
    setActiveMarker((prev) => (prev === name ? null : name));
    setHoverTooltip(null);
  };

  // Dismiss click tooltip when clicking empty map area
  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setActiveMarker(null);
    }
  };

  const tooltipName = activeMarker || hoverTooltip?.name || null;

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
      setUsaZoom((z) => Math.max(z / 1.5, 0.5));
    } else {
      setZoom((z) => Math.max(z / 1.5, 0.5));
    }
  };

  const markerScale = isMobile ? 0.9 : 1;

  // Both tabs share dimensions and projection — only viewport (center/scale) differs.
  const mapDimensions = isMobile
    ? { width: 400, height: 500 }
    : { width: 1800, height: 1000 };

  const tabViewport = isMobile
    ? VIEWPORTS[tab].mobile
    : VIEWPORTS[tab].desktop;

  const markers = tab === "from" ? shippingFromCities : shippingToDestinations;
  const markerColor = tab === "from" ? "#22c55e" : "#429de6";

  // Clear active marker when switching tabs
  const handleTabChange = (newTab: "from" | "to") => {
    setTab(newTab);
    setActiveMarker(null);
    setHoverTooltip(null);
  };

  return (
    <div>
      <div className="text-center mb-6">
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
            onClick={() => handleTabChange("from")}
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
            onClick={() => handleTabChange("to")}
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
        className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] relative max-w-[1000px] mx-auto"
        onMouseLeave={() => {
          setHoverTooltip(null);
        }}
        onClick={handleContainerClick}
      >
        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 md:gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-11 h-11 md:w-9 md:h-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            aria-label="Zoom in"
          >
            <FiPlus className="w-5 h-5 md:w-4 md:h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={currentZoom <= 0.5}
            className="w-11 h-11 md:w-9 md:h-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-40"
            aria-label="Zoom out"
          >
            <FiMinus className="w-5 h-5 md:w-4 md:h-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Tooltip — bottom-anchored on click/tap, cursor-following on hover (desktop only) */}
        {tooltipName && (
          <div
            className={`absolute z-10 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg shadow-lg pointer-events-none ${
              activeMarker
                ? "bottom-4 left-1/2 -translate-x-1/2"
                : ""
            }`}
            style={
              activeMarker
                ? undefined
                : hoverTooltip
                  ? { left: hoverTooltip.x, top: hoverTooltip.y - 40, transform: "translateX(-50%)" }
                  : undefined
            }
          >
            {tooltipName}
          </div>
        )}

        <ComposableMap
          key={tab}
          projection="geoEqualEarth"
          projectionConfig={{
            center: tabViewport.center,
            scale: tabViewport.scale,
          }}
          width={mapDimensions.width}
          height={mapDimensions.height}
          className="w-full h-auto"
        >
          <ZoomableGroup
            zoom={tab === "from" ? usaZoom : zoom}
            center={tab === "from" ? usaCenter : center}
            onMoveEnd={({ coordinates, zoom: z }) => {
              if (tab === "from") {
                setUsaCenter(coordinates as [number, number]);
                setUsaZoom(z);
              } else {
                setCenter(coordinates as [number, number]);
                setZoom(z);
              }
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
            {markers.map((m) => (
              <Marker
                key={m.name}
                coordinates={m.coordinates}
                onMouseEnter={(e) => handleMarkerHover(m.name, e as unknown as React.MouseEvent)}
                onMouseMove={(e) => handleMarkerHover(m.name, e as unknown as React.MouseEvent)}
                onMouseLeave={handleMarkerLeave}
                onClick={() => handleMarkerClick(m.name)}
              >
                <ContainerIcon color={markerColor} scale={markerScale} />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
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
