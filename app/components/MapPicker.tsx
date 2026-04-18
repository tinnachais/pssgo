"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};

export default function GoogleMapPicker({ 
  defaultLat, 
  defaultLng 
}: { 
  defaultLat?: number; 
  defaultLng?: number;
}) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [position, setPosition] = useState({ 
    lat: defaultLat || 13.7563, 
    lng: defaultLng || 100.5018 
  });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
          <div className="flex flex-col items-center gap-3">
              <svg className="w-8 h-8 text-zinc-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-zinc-500 font-medium text-sm">กำลังโหลด Google Maps...</span>
          </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-zinc-300 dark:border-zinc-700 relative z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={13}
        onClick={onMapClick}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
        }}
      >
        <Marker position={position} />
      </GoogleMap>
      <input type="hidden" name="lat" value={position.lat} />
      <input type="hidden" name="lng" value={position.lng} />
      
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
         <div className="absolute top-2 left-2 right-2 bg-rose-500 text-white px-3 py-2 rounded-lg shadow-md z-[1000] text-xs font-bold text-center">
            คุณยังไม่ได้ตั้งค่า NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ในไฟล์ .env.local แผนที่อาจแสดงขุ่นหรือมี Logo For development purposes only
         </div>
      )}
      
      <div className="absolute bottom-2 right-12 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg shadow-md z-[1000] text-xs font-mono border border-zinc-200 dark:border-zinc-700">
        Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
      </div>
    </div>
  );
}
