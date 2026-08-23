"use client";
import React, { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

export default function LiveTrackingMap({ userId }: { userId: string }) {
  const [viewState, setViewState] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    zoom: 16
  });
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        const response = await fetch(`${apiUrl}/api/users/${userId}/location`);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.lastLatitude && result.data?.lastLongitude) {
            const lat = result.data.lastLatitude;
            const lng = result.data.lastLongitude;

            // Pin stays fixed at the exact coordinate from DB
            setPinLocation({ lat, lng });

            // Only fly to location on first load
            if (!pinLocation) {
              setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
            }

            if (result.data.lastLocationAt) {
              setLastUpdated(new Date(result.data.lastLocationAt).toLocaleTimeString());
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
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
        Mapbox Token is missing from .env
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={MAP_STYLES[mapStyle]}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Red Pin Marker — stays fixed on the exact coordinate, does not move when you pan/zoom */}
        {pinLocation && (
          <Marker longitude={pinLocation.lng} latitude={pinLocation.lat} anchor="bottom">
            {/* Google Maps style red pin */}
            <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="#E53E3E" />
              <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="url(#pin_gradient)" />
              <circle cx="16" cy="15" r="6" fill="white" />
              <circle cx="16" cy="15" r="3" fill="#E53E3E" />
              <defs>
                <linearGradient id="pin_gradient" x1="16" y1="0" x2="16" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FC8181" />
                  <stop offset="1" stopColor="#C53030" />
                </linearGradient>
              </defs>
            </svg>
          </Marker>
        )}
      </Map>

      {/* Map / Satellite Toggle Button */}
      <button
        onClick={() => setMapStyle(prev => prev === 'streets' ? 'satellite' : 'streets')}
        className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm font-semibold text-slate-700 hover:bg-white transition-colors z-10 border border-slate-200 cursor-pointer"
      >
        {mapStyle === 'streets' ? '🛰️ Satellite View' : '🗺️ Map View'}
      </button>

      {/* Last Updated Badge */}
      {lastUpdated && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-slate-700 z-10">
          📍 Last updated: {lastUpdated}
        </div>
      )}
    </div>
  );
}
