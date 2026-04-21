import { getSites } from "@/app/actions/sites";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SiteMapPage() {
  const cookieStore = await cookies();
  const selectedSiteId = cookieStore.get("pssgo_selected_site_id")?.value;
  
  let allSites = await getSites();
  
  // Show all sites from the authorized provider regardless of individual site selection
  let displaySites = allSites;

  const validSites = displaySites.filter(s => s.lat && s.lng);
  
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body, html { margin: 0; padding: 0; height: 100%; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; overflow: hidden; }
            #map { height: 100%; width: 100%; }
        </style>
        <!-- Load MarkerClusterer Library -->
        <script src="https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"></script>
    </head>
    <body>
        <div id="map"></div>
        <script>
            window.sitesData = ${JSON.stringify(validSites.map(s => ({ 
                lat: parseFloat(s.lat), 
                lng: parseFloat(s.lng), 
                name: s.name, 
                address: s.address || 'ไม่ได้ระบุที่อยู่',
                total_vehicles: s.total_vehicles || 0,
                max_vehicles: s.package_max_vehicles || s.max_vehicles || 0
            })))};

            function initMap() {
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 6,
                    center: { lat: 13.7563, lng: 100.5018 },
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true
                });

                var bounds = new google.maps.LatLngBounds();
                var infoWindow = new google.maps.InfoWindow();
                var markers = [];

                window.sitesData.forEach(function(site) {
                    var usagePercent = site.max_vehicles > 0 ? Math.min(100, Math.round((site.total_vehicles / site.max_vehicles) * 100)) : 0;
                    var utilColor = usagePercent > 90 ? '#ef4444' : (usagePercent > 75 ? '#f59e0b' : '#3b82f6'); // Tailwind Blue 500

                    var labelStr = site.total_vehicles + (site.max_vehicles > 0 ? '/' + site.max_vehicles : '');

                    // Dynamically draw marker with text
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    ctx.font = 'bold 12px sans-serif';
                    var textWidth = ctx.measureText(labelStr).width;
                    var boxWidth = Math.max(textWidth + 24, 50);
                    var boxHeight = 24;
                    var ptrHeight = 8;
                    canvas.width = boxWidth + 4; // padding for stroke
                    canvas.height = boxHeight + ptrHeight + 4;
                    
                    var cx = canvas.width / 2;
                    var cy = 2; // top margin
                    
                    ctx.beginPath();
                    var r = 6;
                    ctx.moveTo(2 + r, cy);
                    ctx.lineTo(boxWidth + 2 - r, cy);
                    ctx.quadraticCurveTo(boxWidth + 2, cy, boxWidth + 2, cy + r);
                    ctx.lineTo(boxWidth + 2, cy + boxHeight - r);
                    ctx.quadraticCurveTo(boxWidth + 2, cy + boxHeight, boxWidth + 2 - r, cy + boxHeight);
                    // Pointer
                    ctx.lineTo(cx + 6, cy + boxHeight);
                    ctx.lineTo(cx, cy + boxHeight + ptrHeight);
                    ctx.lineTo(cx - 6, cy + boxHeight);
                    
                    ctx.lineTo(2 + r, cy + boxHeight);
                    ctx.quadraticCurveTo(2, cy + boxHeight, 2, cy + boxHeight - r);
                    ctx.lineTo(2, cy + r);
                    ctx.quadraticCurveTo(2, cy, 2 + r, cy);
                    ctx.closePath();
                    
                    // Fill standard and Shadow
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetY = 2;
                    ctx.fillStyle = utilColor;
                    ctx.fill();
                    
                    // Reset shadow for stroke & text
                    ctx.shadowColor = 'transparent';
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(labelStr, cx, cy + (boxHeight / 2));

                    var marker = new google.maps.Marker({
                        position: { lat: site.lat, lng: site.lng },
                        title: site.name,
                        icon: {
                            url: canvas.toDataURL(),
                            anchor: new google.maps.Point(cx, cy + boxHeight + ptrHeight)
                        }
                    });

                    marker.addListener('click', function() {
                        var contentString = '<div style="font-family:sans-serif;min-width:200px;">' +
                            '<div style="font-weight:bold;font-size:15px;color:#0f172a;margin-bottom:4px;">' + site.name + '</div>' +
                            '<div style="font-size:12px;color:#64748b;line-height:1.4;margin-bottom:12px;">' + site.address + '</div>' +
                            '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px;">' +
                               '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;">' +
                                  '<span style="color:#475569;font-weight:600;">รถลงทะเบียนแล้ว</span>' +
                                  '<span style="font-weight:bold;color:#0f172a;">' + site.total_vehicles + ' <span style="color:#94a3b8;font-weight:normal;">/ ' + (site.max_vehicles > 0 ? site.max_vehicles : '∞') + ' คัน</span></span>' +
                               '</div>' +
                               (site.max_vehicles > 0 ? 
                               '<div style="width:100%;background:#e2e8f0;border-radius:4px;height:6px;overflow:hidden;">' +
                                   '<div style="width:' + usagePercent + '%;background:' + utilColor + ';height:100%;"></div>' +
                               '</div>' : '') +
                            '</div>' +
                        '</div>';

                        infoWindow.setContent(contentString);
                        infoWindow.open(map, marker);
                    });

                    bounds.extend(marker.position);
                    markers.push(marker);
                });
                
                // Add MarkerClusterer
                new markerClusterer.MarkerClusterer({ map: map, markers: markers });

                if (window.sitesData.length > 0) {
                    map.fitBounds(bounds);
                    google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
                       if (map.getZoom() > 16) map.setZoom(16);
                    });
                }
            }
        </script>
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&callback=initMap"></script>
    </body>
    </html>
  `;

  return (
    <div className="min-h-full font-sans selection:bg-teal-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col h-[calc(100vh-2rem)]">
        
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">แผนที่สถานที่</h1>
              <span className="px-3 py-1 bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-full uppercase tracking-wider">Maps</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              ตรวจสอบพิกัดที่ตั้งของสถานที่ หรือลานจอดรถที่ให้บริการบนแผนที่ร่วมกันแบบภาพรวม
            </p>
          </div>
          <Link href="/sites" className="text-teal-600 hover:text-teal-700 font-bold border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            แก้ไขพิกัดสถานที่
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5 flex-1 flex flex-col relative min-h-0 z-10">
            {displaySites.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-zinc-50 dark:bg-zinc-900">
                     <div className="w-16 h-16 bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-100 dark:outline-zinc-800/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                     </div>
                     <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ไม่พบข้อมูลสถานที่</p>
                     <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">กรุณาเพิ่มสถานที่ หรือตั้งค่าพิกัดเพื่อให้ระบบปักหมุดบนแผนที่</p>
                 </div>
            ) : (
                 <div className="flex-1 w-full h-full relative">
                    <iframe 
                        title="Interactive Site Map"
                        srcDoc={mapHtml}
                        className="w-full h-full border-none"
                    />

                    {/* Floating Info Overlay showing sites missing coordinates */}
                    {displaySites.filter(s => !s.lat || !s.lng).length > 0 && (
                        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-amber-200 dark:border-amber-900/30 z-[400] pointer-events-auto">
                            <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500 font-bold text-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                สถานที่ที่ไม่ได้ระบุพิกัด ({displaySites.filter(s => !s.lat || !s.lng).length})
                            </div>
                            <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {displaySites.filter(s => !s.lat || !s.lng).map(site => (
                                    <li key={site.id} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                                        <span className="text-amber-500 mt-0.5">•</span>
                                        <span className="font-semibold">{site.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                 </div>
            )}
        </div>
      </main>
    </div>
  );
}
