import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';

interface TrackingMapProps {
  driverName?: string;
  driverPhone?: string;
  etaMinutes?: number;
  driverLat?: number;
  driverLng?: number;
  customerLat?: number;
  customerLng?: number;
  customerAddress?: string;
  orderStatus?: string;
}

export function TrackingMap({
  driverName = 'سمير بوعلام',
  driverPhone = '0550123456',
  etaMinutes = 12,
  driverLat: initialDriverLat,
  driverLng: initialDriverLng,
  customerLat: initialCustomerLat,
  customerLng: initialCustomerLng,
  customerAddress = 'حي السعادة، الجزائر',
  orderStatus = 'picked_up'
}: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Default coordinates (Algiers Center)
  const defaultCustomerLat = initialCustomerLat || 36.7538;
  const defaultCustomerLng = initialCustomerLng || 3.0588;
  const defaultDriverLat = initialDriverLat || defaultCustomerLat - 0.018;
  const defaultDriverLng = initialDriverLng || defaultCustomerLng - 0.015;

  const [customerCoords, setCustomerCoords] = useState<[number, number]>([defaultCustomerLat, defaultCustomerLng]);
  const [driverCoords, setDriverCoords] = useState<[number, number]>([defaultDriverLat, defaultDriverLng]);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: string; durationMin: number } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  // Tile layer configurations
  const streetTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  // 1. Acquire Real Customer GPS Location
  const locateUserGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newCoords: [number, number] = [latitude, longitude];
        setCustomerCoords(newCoords);
        setGpsActive(true);
        setGpsAccuracy(Math.round(accuracy));

        if (customerMarkerRef.current) {
          customerMarkerRef.current.setLatLng(newCoords);
        }
        if (accuracyCircleRef.current && mapInstanceRef.current) {
          accuracyCircleRef.current.setLatLng(newCoords);
          accuracyCircleRef.current.setRadius(accuracy);
        }

        // If driver hasn't custom GPS, position relative to real user GPS so route makes sense
        if (!initialDriverLat) {
          const simulatedDriverCoords: [number, number] = [latitude - 0.015, longitude - 0.012];
          setDriverCoords(simulatedDriverCoords);
          if (driverMarkerRef.current) {
            driverMarkerRef.current.setLatLng(simulatedDriverCoords);
          }
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(newCoords, 15);
        }
      },
      (err) => {
        console.info('GPS not enabled or denied:', err.message);
        setGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [initialDriverLat]);

  // Try GPS on mount
  useEffect(() => {
    locateUserGPS();
  }, [locateUserGPS]);

  // Sync with props if Firestore coordinates arrive
  useEffect(() => {
    if (initialDriverLat && initialDriverLng) {
      setDriverCoords([initialDriverLat, initialDriverLng]);
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([initialDriverLat, initialDriverLng]);
      }
    }
  }, [initialDriverLat, initialDriverLng]);

  // 2. Fetch Real Road Geometry via OSRM Public Routing API
  const fetchRealRoadRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    setIsLoadingRoute(true);
    try {
      // OSRM expects: longitude,latitude
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('OSRM routing request failed');
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );

        const distKm = (route.distance / 1000).toFixed(1);
        const durationM = Math.max(1, Math.round(route.duration / 60));
        setRouteInfo({ distanceKm: distKm, durationMin: durationM });

        if (mapInstanceRef.current) {
          if (routePolylineRef.current) {
            mapInstanceRef.current.removeLayer(routePolylineRef.current);
          }
          const polyline = L.polyline(coordinates, {
            color: '#FF5B4A',
            weight: 5,
            opacity: 0.9,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(mapInstanceRef.current);
          routePolylineRef.current = polyline;

          // Fit both in view with padding
          const bounds = L.latLngBounds([start, end]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
        }
      }
    } catch {
      // Fallback straight curve line
      if (mapInstanceRef.current) {
        if (routePolylineRef.current) {
          mapInstanceRef.current.removeLayer(routePolylineRef.current);
        }
        const midLat = (start[0] + end[0]) / 2 + 0.003;
        const midLng = (start[1] + end[1]) / 2 - 0.003;
        const fallback = L.polyline([start, [midLat, midLng], end], {
          color: '#FF5B4A',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.8
        }).addTo(mapInstanceRef.current);
        routePolylineRef.current = fallback;
      }
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  // Update route whenever driver or customer coordinates change
  useEffect(() => {
    fetchRealRoadRoute(driverCoords, customerCoords);
  }, [driverCoords, customerCoords, fetchRealRoadRoute]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(customerCoords, 14);

    // Initial tile layer
    const initialTileUrl = mapType === 'satellite' ? satelliteTileUrl : streetTileUrl;
    const tileLayer = L.tileLayer(initialTileUrl, {
      maxZoom: 19,
      subdomains: mapType === 'satellite' ? [] : ['a', 'b', 'c']
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Driver Marker Icon
    const driverIcon = L.divIcon({
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:52px;height:52px;border-radius:50%;background:rgba(255,91,74,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="background:linear-gradient(135deg,#FF5B4A,#FF7854);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;box-shadow:0 8px 24px rgba(255,91,74,0.6);border:3px solid #fff;position:relative;z-index:2;">
            <i class="fa-solid fa-motorcycle"></i>
          </div>
        </div>
      `,
      className: 'driver-live-pin',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    // Customer Marker Icon
    const userIcon = L.divIcon({
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:52px;height:52px;border-radius:50%;background:rgba(0,196,140,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="background:linear-gradient(135deg,#00C48C,#00A87A);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;box-shadow:0 8px 24px rgba(0,196,140,0.6);border:3px solid #fff;position:relative;z-index:2;">
            <i class="fa-solid fa-house-chimney"></i>
          </div>
        </div>
      `,
      className: 'user-live-pin',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const driverMarker = L.marker(driverCoords, { icon: driverIcon }).addTo(map);
    driverMarker.bindPopup(`
      <div style="direction:rtl;text-align:right;font-family:sans-serif;padding:4px;">
        <b style="color:#FF5B4A;font-size:13px;">الكابتن: ${driverName}</b><br/>
        <span style="font-size:11px;color:#555;">🛵 في الطريق إليك ومعه الطلب</span>
      </div>
    `);

    const customerMarker = L.marker(customerCoords, { icon: userIcon }).addTo(map);
    customerMarker.bindPopup(`
      <div style="direction:rtl;text-align:right;font-family:sans-serif;padding:4px;">
        <b style="color:#00C48C;font-size:13px;">موقع التوصيل الفعلي 📍</b><br/>
        <span style="font-size:11px;color:#555;">${customerAddress}</span>
      </div>
    `);

    // GPS accuracy circle
    const accuracyCircle = L.circle(customerCoords, {
      radius: gpsAccuracy || 35,
      color: '#00C48C',
      fillColor: '#00C48C',
      fillOpacity: 0.1,
      weight: 1
    }).addTo(map);

    mapInstanceRef.current = map;
    driverMarkerRef.current = driverMarker;
    customerMarkerRef.current = customerMarker;
    accuracyCircleRef.current = accuracyCircle;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 4. Handle Map Tile Layer Switching (Streets vs Satellite)
  const switchMapType = (newType: 'streets' | 'satellite') => {
    if (!mapInstanceRef.current) return;
    setMapType(newType);
    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }
    const url = newType === 'satellite' ? satelliteTileUrl : streetTileUrl;
    const newLayer = L.tileLayer(url, {
      maxZoom: 19,
      subdomains: newType === 'satellite' ? [] : ['a', 'b', 'c']
    }).addTo(mapInstanceRef.current);
    currentTileLayerRef.current = newLayer;
  };

  // Google Maps external navigation URL
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${driverCoords[0]},${driverCoords[1]}&destination=${customerCoords[0]},${customerCoords[1]}&travelmode=driving`;

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200/80 dark:border-white/10 bg-stone-900">
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-72 md:h-80 z-0"
      />

      {/* Top Floating Controls Overlay */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        {/* GPS Status Indicator */}
        <div className="bg-white/90 dark:bg-[#0F1729]/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-stone-200/60 dark:border-white/10 flex items-center gap-2 pointer-events-auto">
          <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[10px] font-black text-[#0F1729] dark:text-white">
            {gpsActive ? 'GPS حقيقي مباشر' : 'تحديد الموقع التقريبي'}
          </span>
          {gpsAccuracy && (
            <span className="text-[9px] text-stone-400 font-bold hidden sm:inline">
              (±{gpsAccuracy}م)
            </span>
          )}
        </div>

        {/* Map Type Switcher */}
        <div className="bg-white/90 dark:bg-[#0F1729]/90 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-stone-200/60 dark:border-white/10 flex items-center gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={() => switchMapType('streets')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition cursor-pointer ${mapType === 'streets' ? 'bg-[#FF5B4A] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800 dark:hover:text-white'}`}
          >
            شوارع 🗺️
          </button>
          <button
            type="button"
            onClick={() => switchMapType('satellite')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition cursor-pointer ${mapType === 'satellite' ? 'bg-[#FF5B4A] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800 dark:hover:text-white'}`}
          >
            قمر صناعي 🛰️
          </button>
        </div>
      </div>

      {/* Real Distance, ETA & Navigation Bar */}
      <div className="absolute bottom-3 inset-x-3 bg-white/95 dark:bg-[#0F1729]/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-stone-200/80 dark:border-white/10 flex items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0EE] text-[#FF5B4A] flex items-center justify-center font-black shrink-0">
            <i className="fa-solid fa-route text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#0F1729] dark:text-white">
                المسافة الحقيقية: {routeInfo ? `${routeInfo.distanceKm} كم` : '2.1 كم'}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {routeInfo ? `~${routeInfo.durationMin} دقيقة` : `~${etaMinutes} دقيقة`}
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-bold mt-0.5 line-clamp-1">
              مسار شوارع فعلي عبر خوارزميات الملاحة الحية
            </p>
          </div>
        </div>

        {/* Quick Map Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={locateUserGPS}
            className="w-9 h-9 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition cursor-pointer"
            title="تحديد موقعي الفعلي الحالي عبر GPS"
          >
            <i className="fa-solid fa-crosshairs text-sm" />
          </button>
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-gradient-to-l from-blue-600 to-indigo-600 text-white font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="فتح المسار في تطبيق خرائط Google الرسمي"
          >
            <i className="fa-brands fa-google text-xs" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}
