"use client";

import React, { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import { Layers, MapPin, Clock } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAP_STYLES = {
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
};

export default function LiveTrackingMap({ userId }: { userId: string }) {
  const [viewState, setViewState] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    zoom: 16,
  });
  const [pinLocation, setPinLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        const response = await fetch(`${apiUrl}/api/users/${userId}/location`);

        if (response.ok) {
          const result = await response.json();
          if (
            result.success &&
            result.data?.lastLatitude &&
            result.data?.lastLongitude
          ) {
            const lat = result.data.lastLatitude;
            const lng = result.data.lastLongitude;

            setPinLocation({ lat, lng });

            if (!pinLocation) {
              setViewState((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
              }));
            }

            if (result.data.lastLocationAt) {
              setLastUpdated(
                new Date(result.data.lastLocationAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch location", err);
      }
    };

    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const mapboxToken = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!mapboxToken) {
    return (
      <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-xs font-semibold">
        Mapbox Token is missing from .env
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xs border border-slate-200/80 animate-enter">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={MAP_STYLES[mapStyle]}
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
      >
        {pinLocation && (
          <Marker
            longitude={pinLocation.lng}
            latitude={pinLocation.lat}
            anchor="bottom"
          >
            <div className="relative flex flex-col items-center">
              {/* Radar pulse ring */}
              <div className="absolute -bottom-1 w-8 h-8 rounded-full bg-purple-500/25 animate-ping" />
              {/* Pin body */}
              <div className="w-8 h-8 rounded-2xl bg-[var(--brand-600)] text-white flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
                <MapPin size={16} />
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* Map / Satellite Toggle Button */}
      <button
        type="button"
        onClick={() =>
          setMapStyle((prev) => (prev === "streets" ? "satellite" : "streets"))
        }
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg text-xs font-bold text-[var(--text-primary)] hover:bg-white transition-all active:scale-[0.96] press-effect border border-slate-200/80 flex items-center gap-2 cursor-pointer z-10"
      >
        <Layers size={14} className="text-[var(--brand-600)]" />
        <span>{mapStyle === "streets" ? "Satellite View" : "Street Map"}</span>
      </button>

      {/* Last Updated Badge */}
      {lastUpdated && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-xs font-bold text-[var(--text-primary)] z-10 border border-slate-200/80 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-2xs" />
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Last ping:
          </span>
          <span className="text-xs text-[var(--text-primary)] font-extrabold tabular-nums">
            {lastUpdated}
          </span>
        </div>
      )}
    </div>
  );
}
