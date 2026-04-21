"use client";

import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useMemo } from "react";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem",
};

export default function PublicSitesMap({ sites }: { sites: any[] }) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    const [selectedSite, setSelectedSite] = useState<any | null>(null);

    // Filter out sites without lat/lng and parse them to floats
    const validSites = useMemo(() => {
        return sites
            .filter(s => s.lat && s.lng)
            .map(s => ({
                ...s,
                lat: parseFloat(s.lat),
                lng: parseFloat(s.lng)
            }));
    }, [sites]);

    const center = useMemo(() => {
        if (validSites.length > 0) {
            return { lat: validSites[0].lat, lng: validSites[0].lng };
        }
        return { lat: 13.7563, lng: 100.5018 }; // Default to Bangkok
    }, [validSites]);

    if (!isLoaded) {
        return (
            <div className="w-full h-full rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
                <div className="flex flex-col items-center gap-2">
                    <svg className="w-6 h-6 text-[#14b8a6] animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-zinc-500 font-medium text-xs">กำลังโหลดแผนที่...</span>
                </div>
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={validSites.length > 0 ? 11 : 5}
            options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            }}
            onClick={() => setSelectedSite(null)}
        >
            {validSites.map((site) => (
                <Marker
                    key={site.id}
                    position={{ lat: site.lat, lng: site.lng }}
                    onClick={() => setSelectedSite(site)}
                />
            ))}

            {selectedSite && (
                <InfoWindow
                    position={{ lat: selectedSite.lat, lng: selectedSite.lng }}
                    onCloseClick={() => setSelectedSite(null)}
                >
                    <div className="p-1 max-w-[200px]">
                        <h3 className="font-bold text-sm text-slate-800 mb-1">{selectedSite.name}</h3>
                        <p className="text-[10px] text-slate-500 mb-2 line-clamp-2">{selectedSite.address}</p>
                        <button 
                            onClick={() => window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${selectedSite.lat},${selectedSite.lng}`}
                            className="w-full bg-[#14b8a6] text-white text-xs font-bold py-1.5 rounded-lg active:scale-95 transition-transform"
                        >
                            เปิดนำทาง
                        </button>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
