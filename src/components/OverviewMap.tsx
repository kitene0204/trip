import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { Trip, TripItem } from '../types';
import { fetchOsrmRoute } from '../utils/helpers';
import { ChevronLeft, ChevronRight, Compass, MapPin as MapPinIcon, Navigation } from 'lucide-react';

interface OverviewMapProps {
  trip: Trip;
  selectedDate: string;
  onNavigateToCard: (itemId: string) => void;
}

export const OverviewMap: React.FC<OverviewMapProps> = ({
  trip,
  selectedDate,
  onNavigateToCard,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylinesGroupRef = useRef<L.LayerGroup | null>(null);
  const charMarkerRef = useRef<L.Marker | null>(null);

  // Filter items for the selected day that have valid coordinates
  const dayItems = useMemo(() => {
    return (trip.items || [])
      .filter((it) => it.day === selectedDate)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [trip.items, selectedDate]);

  const itemsWithCoords = useMemo(() => {
    return dayItems.filter((it) => typeof it.lat === 'number' && typeof it.lng === 'number');
  }, [dayItems]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [routeSegments, setRouteSegments] = useState<[number, number][][]>([]);
  const [characterPos, setCharacterPos] = useState<[number, number] | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize current index based on current time or 0
  useEffect(() => {
    if (itemsWithCoords.length === 0) {
      setCurrentIndex(0);
      return;
    }
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Find first item after current time
    const nextIdx = itemsWithCoords.findIndex((it) => (it.time || '') >= currentHM);
    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
    } else {
      setCurrentIndex(0);
    }
  }, [selectedDate, itemsWithCoords]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([35.6895, 139.6917], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      polylinesGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Fetch OSRM Road Routes for each sequential pair of points
  useEffect(() => {
    let isCancelled = false;

    async function loadRoutes() {
      if (itemsWithCoords.length < 2) {
        setRouteSegments([]);
        return;
      }

      const segments: [number, number][][] = [];
      for (let i = 0; i < itemsWithCoords.length - 1; i++) {
        const from = itemsWithCoords[i];
        const to = itemsWithCoords[i + 1];
        if (from.lat && from.lng && to.lat && to.lng) {
          const osrm = await fetchOsrmRoute([
            [from.lat, from.lng],
            [to.lat, to.lng],
          ]);
          if (osrm && osrm.length > 0) {
            segments.push(osrm);
          } else {
            // fallback straight line
            segments.push([
              [from.lat, from.lng],
              [to.lat, to.lng],
            ]);
          }
        }
      }

      if (!isCancelled) {
        setRouteSegments(segments);
      }
    }

    loadRoutes();

    return () => {
      isCancelled = true;
    };
  }, [itemsWithCoords]);

  // 3. Render Markers & Polylines on the Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current || !polylinesGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    polylinesGroupRef.current.clearLayers();

    if (itemsWithCoords.length === 0) return;

    const latLngBounds: L.LatLngExpression[] = [];

    // Add Numbered Markers with persistent top labels
    itemsWithCoords.forEach((item, idx) => {
      const lat = item.lat!;
      const lng = item.lng!;
      latLngBounds.push([lat, lng]);

      const isCurrent = idx === currentIndex;
      const isPast = idx < currentIndex;

      const markerHtml = `
        <div class="custom-map-pin" style="transform: translate(-50%, -100%);">
          <div class="pin-label">${item.time ? item.time + ' ' : ''}${item.name}</div>
          <div class="pin-bubble" style="background-color: ${
            isCurrent ? '#d9724a' : isPast ? '#3f7cb0' : '#1b4b7a'
          };">
            <span>${idx + 1}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-custom-div-icon',
        html: markerHtml,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      marker.on('click', () => {
        onNavigateToCard(item.id);
      });
      markersGroupRef.current?.addLayer(marker);
    });

    // Draw Polylines: Solid for past, Dashed for upcoming
    routeSegments.forEach((seg, idx) => {
      const isPast = idx < currentIndex;

      const poly = L.polyline(seg, {
        color: isPast ? '#1b4b7a' : '#94a3b8',
        weight: isPast ? 4 : 3,
        dashArray: isPast ? undefined : '6, 6',
        opacity: isPast ? 0.9 : 0.6,
      });

      polylinesGroupRef.current?.addLayer(poly);
    });

    // Fit bounds smoothly
    if (latLngBounds.length > 0) {
      map.fitBounds(L.latLngBounds(latLngBounds), {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [itemsWithCoords, routeSegments, currentIndex, onNavigateToCard]);

  // 4. Animated Character on the active path
  const getTransportIconHtml = useCallback((mode?: string) => {
    switch (mode) {
      case '지하철':
      case '기차':
        return `<div class="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-lg shadow-lg border-2 border-white">🚆</div>`;
      case '택시':
        return `<div class="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg shadow-lg border-2 border-white car-bob">🚕</div>`;
      case '버스':
        return `<div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg shadow-lg border-2 border-white">🚌</div>`;
      case '트램':
        return `<div class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg shadow-lg border-2 border-white">🚊</div>`;
      case '항공':
        return `<div class="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center text-lg shadow-lg border-2 border-white">✈️</div>`;
      case '자전거':
        return `<div class="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-lg shadow-lg border-2 border-white">🚲</div>`;
      default: // 도보
        return `<div class="w-9 h-9 rounded-full bg-[#d9724a] text-white flex items-center justify-center text-lg shadow-lg border-2 border-white walking-anim">🚶</div>`;
    }
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || itemsWithCoords.length === 0) return;

    // Target position is itemsWithCoords[currentIndex]
    const targetItem = itemsWithCoords[currentIndex];
    if (!targetItem || typeof targetItem.lat !== 'number' || typeof targetItem.lng !== 'number') return;

    const targetPos: [number, number] = [targetItem.lat, targetItem.lng];

    // Smoothly animate character marker to targetPos
    if (charMarkerRef.current) {
      charMarkerRef.current.remove();
    }

    const mode = targetItem.move || '도보';
    const iconHtml = getTransportIconHtml(mode);

    const charIcon = L.divIcon({
      className: 'leaflet-char-icon',
      html: iconHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker(targetPos, { icon: charIcon, zIndexOffset: 1000 }).addTo(map);
    charMarkerRef.current = marker;
    setCharacterPos(targetPos);

    // Pan map to character if outside current bounds
    if (!map.getBounds().contains(targetPos)) {
      map.panTo(targetPos, { animate: true, duration: 0.8 });
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentIndex, itemsWithCoords, getTransportIconHtml]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(itemsWithCoords.length - 1, prev + 1));
  };

  const handleNow = () => {
    if (itemsWithCoords.length === 0) return;
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nextIdx = itemsWithCoords.findIndex((it) => (it.time || '') >= currentHM);
    const targetIndex = nextIdx !== -1 ? nextIdx : itemsWithCoords.length - 1;
    setCurrentIndex(targetIndex);

    const targetItem = itemsWithCoords[targetIndex];
    if (targetItem?.lat && targetItem?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.setView([targetItem.lat, targetItem.lng], 15, { animate: true });
    }
  };

  const currentItem = itemsWithCoords[currentIndex];
  const progressRatio = itemsWithCoords.length > 0 ? ((currentIndex + 1) / itemsWithCoords.length) * 100 : 0;

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-[#e3eaef] overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Top Floating Info Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-md border border-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1b4b7a] text-white flex items-center justify-center font-bold text-xs">
              {currentIndex + 1}
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#6b7a89] uppercase tracking-wider">
                여정 포인트
              </div>
              <div className="text-xs font-black text-[#1c2733] truncate max-w-[170px]">
                {currentItem ? currentItem.name : '등록된 장소 없음'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (mapInstanceRef.current && itemsWithCoords.length > 0) {
                  const bounds = L.latLngBounds(
                    itemsWithCoords.map((it) => [it.lat!, it.lng!])
                  );
                  mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
                }
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1b4b7a] active:scale-95 transition-all"
              title="전체 경로 한눈에 보기"
            >
              <Compass className="w-4 h-4" />
            </button>
            {currentItem && (
              <button
                onClick={() => onNavigateToCard(currentItem.id)}
                className="px-2.5 py-1.5 rounded-xl bg-[#1b4b7a] text-white text-[11px] font-bold hover:bg-[#15395d] active:scale-95 transition-all shadow-xs"
              >
                일정 보기 ↗
              </button>
            )}
          </div>
        </div>
      </div>

      {/* If No Coordinates Found for this day */}
      {itemsWithCoords.length === 0 && (
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-6 z-20 pointer-events-auto">
          <div className="bg-white rounded-3xl p-6 text-center max-w-xs shadow-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mx-auto">
              📍
            </div>
            <h3 className="text-base font-extrabold text-[#1c2733]">좌표 정보가 없습니다</h3>
            <p className="text-xs text-[#6b7a89] leading-relaxed">
              선택한 날짜의 일정에 장소명을 입력하면 지도 위 위치와 이동 경로가 자동으로 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Timeline & Controls Status Bar */}
      {itemsWithCoords.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white space-y-3">
            {/* Top Row: Navigation Controls & Current Step Name */}
            <div className="flex items-center justify-between gap-3">
              {/* Previous / Now / Next Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    currentIndex === 0
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#1b4b7a] active:scale-95'
                  }`}
                  title="이전 일정"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleNow}
                  className="px-3 h-9 rounded-xl bg-[#1b4b7a] hover:bg-[#15395d] text-white text-xs font-black active:scale-95 transition-all shadow-sm"
                  title="현재 시각 기준 위치"
                >
                  NOW
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= itemsWithCoords.length - 1}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    currentIndex >= itemsWithCoords.length - 1
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#1b4b7a] active:scale-95'
                  }`}
                  title="다음 일정"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Next/Current place info */}
              <div className="text-right min-w-0 flex-1">
                <div className="text-[10px] font-bold text-[#6b7a89] uppercase tracking-wider">
                  {currentItem?.time ? `[${currentItem.time}]` : ''} 현재 목적지
                </div>
                <div className="text-xs font-extrabold text-[#1b4b7a] truncate">
                  {currentItem?.name}
                </div>
              </div>
            </div>

            {/* Bottom Row: Journey Progress & Mode */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#6b7a89]">
                  오늘의 여정 {currentIndex + 1} / {itemsWithCoords.length}
                </span>
                <span className="text-[#d9724a] flex items-center gap-1">
                  <span>{currentItem?.move || '도보'}</span>
                  <span>이동 중</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d9724a] transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progressRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
