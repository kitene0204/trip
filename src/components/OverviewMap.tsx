import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { Trip, TripItem } from '../types';
import { fetchOsrmRoute } from '../utils/helpers';
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface OverviewMapProps {
  trip: Trip;
  selectedDate: string;
  onNavigateToCard: (itemId: string) => void;
}

// Pixel art SVG generators for different transport modes
function getPixelSvg(mode: string = '도보'): string {
  switch (mode) {
    case '택시':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-10 h-10 drop-shadow-md car-bob">
          <!-- Taxi Body -->
          <rect x="5" y="14" width="22" height="10" rx="3" fill="#f59e0b" stroke="#1c2733" stroke-width="1.5"/>
          <rect x="9" y="8" width="14" height="7" rx="2" fill="#fcd34d" stroke="#1c2733" stroke-width="1.5"/>
          <!-- Windows -->
          <rect x="11" y="10" width="4" height="4" fill="#38bdf8"/>
          <rect x="17" y="10" width="5" height="4" fill="#38bdf8"/>
          <!-- Taxi Cap -->
          <rect x="14" y="5" width="4" height="3" fill="#ffffff" stroke="#1c2733" stroke-width="1"/>
          <!-- Wheels -->
          <circle cx="9" cy="24" r="3.5" fill="#1c2733"/>
          <circle cx="9" cy="24" r="1.5" fill="#94a3b8"/>
          <circle cx="23" cy="24" r="3.5" fill="#1c2733"/>
          <circle cx="23" cy="24" r="1.5" fill="#94a3b8"/>
          <!-- Lights -->
          <rect x="25" y="16" width="2" height="3" fill="#ef4444"/>
          <rect x="5" y="16" width="2" height="3" fill="#ffffff"/>
        </svg>
      `;
    case '지하철':
    case '기차':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-10 h-10 drop-shadow-md">
          <!-- Train Body -->
          <rect x="6" y="8" width="20" height="17" rx="3" fill="#1b4b7a" stroke="#1c2733" stroke-width="1.5"/>
          <rect x="6" y="20" width="20" height="4" fill="#3f7cb0"/>
          <!-- Windows -->
          <rect x="9" y="11" width="14" height="6" rx="1" fill="#bae6fd" stroke="#1c2733" stroke-width="1"/>
          <!-- Front Headlights -->
          <circle cx="10" cy="22" r="1.5" fill="#fef08a"/>
          <circle cx="22" cy="22" r="1.5" fill="#fef08a"/>
          <!-- Wheels/Tracks -->
          <rect x="8" y="25" width="4" height="3" fill="#475569"/>
          <rect x="20" y="25" width="4" height="3" fill="#475569"/>
        </svg>
      `;
    case '트램':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-10 h-10 drop-shadow-md">
          <!-- Pantograph (Overhead power connector) -->
          <path d="M16 2 L12 6 L20 6 Z" fill="none" stroke="#1c2733" stroke-width="1.5"/>
          <line x1="16" y1="6" x2="16" y2="8" stroke="#1c2733" stroke-width="1.5"/>
          <!-- Tram Body -->
          <rect x="6" y="8" width="20" height="17" rx="3" fill="#4f46e5" stroke="#1c2733" stroke-width="1.5"/>
          <rect x="9" y="11" width="6" height="6" fill="#e0e7ff"/>
          <rect x="17" y="11" width="6" height="6" fill="#e0e7ff"/>
          <!-- Front Lights -->
          <circle cx="10" cy="22" r="1.5" fill="#fde047"/>
          <circle cx="22" cy="22" r="1.5" fill="#fde047"/>
          <rect x="8" y="25" width="16" height="2" fill="#334155"/>
        </svg>
      `;
    case '버스':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-10 h-10 drop-shadow-md car-bob">
          <!-- Bus Body -->
          <rect x="5" y="8" width="22" height="17" rx="3" fill="#059669" stroke="#1c2733" stroke-width="1.5"/>
          <!-- Windows -->
          <rect x="8" y="11" width="4" height="5" fill="#a7f3d0"/>
          <rect x="14" y="11" width="4" height="5" fill="#a7f3d0"/>
          <rect x="20" y="11" width="4" height="5" fill="#a7f3d0"/>
          <!-- Wheels -->
          <circle cx="10" cy="25" r="3" fill="#1c2733"/>
          <circle cx="22" cy="25" r="3" fill="#1c2733"/>
        </svg>
      `;
    case '항공':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-10 h-10 drop-shadow-md">
          <circle cx="16" cy="16" r="14" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
          <text x="16" y="22" font-size="16" text-anchor="middle" fill="#ffffff">✈️</text>
        </svg>
      `;
    case '자전거':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-10 h-10 drop-shadow-md">
          <circle cx="16" cy="16" r="14" fill="#0d9488" stroke="#ffffff" stroke-width="1.5"/>
          <text x="16" y="22" font-size="16" text-anchor="middle" fill="#ffffff">🚲</text>
        </svg>
      `;
    default: // 도보 (Walking Traveler with backpack & 2-frame stepping legs)
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-10 h-10 drop-shadow-md">
          <!-- Shadow -->
          <ellipse cx="16" cy="29" rx="7" ry="2" fill="rgba(0,0,0,0.2)"/>
          <!-- Backpack -->
          <rect x="7" y="11" width="5" height="9" rx="1.5" fill="#d9724a" stroke="#1c2733" stroke-width="1"/>
          <!-- Body / Clothes -->
          <rect x="12" y="11" width="8" height="10" rx="2" fill="#1b4b7a" stroke="#1c2733" stroke-width="1"/>
          <!-- Head / Hair / Hat -->
          <circle cx="16" cy="7" r="4.5" fill="#fde047" stroke="#1c2733" stroke-width="1"/>
          <rect x="13" y="4" width="6" height="3" rx="1" fill="#e0a94e"/>
          <!-- Animated Legs (2-frame walk) -->
          <g class="walking-anim">
            <line x1="14" y1="21" x2="12" y2="28" stroke="#1c2733" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="18" y1="21" x2="20" y2="28" stroke="#1c2733" stroke-width="2.5" stroke-linecap="round"/>
          </g>
        </svg>
      `;
  }
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
  const isAnimatingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Synchronize index to current time on date change
  useEffect(() => {
    if (itemsWithCoords.length === 0) {
      setCurrentIndex(0);
      return;
    }
    const now = new Date();
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nextIdx = itemsWithCoords.findIndex((it) => (it.time || '') >= currentHM);
    setCurrentIndex(nextIdx !== -1 ? nextIdx : 0);
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

  // 2. Fetch OSRM Road Routes for each sequential pair
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

  // 3. Render Numbered Markers & Polylines
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
        opacity: isPast ? 0.95 : 0.6,
      });

      polylinesGroupRef.current?.addLayer(poly);
    });

    // Initial bounding fit
    if (latLngBounds.length > 0 && !isAnimatingRef.current) {
      map.fitBounds(L.latLngBounds(latLngBounds), {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [itemsWithCoords, routeSegments, currentIndex, onNavigateToCard]);

  // 4. Smooth Road Path Animated Character Movement
  const animateCharacterAlongPath = useCallback(
    (fromIdx: number, toIdx: number) => {
      const map = mapInstanceRef.current;
      if (!map || itemsWithCoords.length === 0) return;

      const targetItem = itemsWithCoords[toIdx];
      if (!targetItem?.lat || !targetItem?.lng) return;

      // Extract dense points along the path between fromIdx and toIdx
      let pathPoints: [number, number][] = [];

      if (fromIdx < toIdx && routeSegments.length > 0) {
        for (let s = fromIdx; s < toIdx && s < routeSegments.length; s++) {
          pathPoints.push(...routeSegments[s]);
        }
      } else if (fromIdx > toIdx && routeSegments.length > 0) {
        for (let s = fromIdx - 1; s >= toIdx && s >= 0; s--) {
          const reversed = [...routeSegments[s]].reverse();
          pathPoints.push(...reversed);
        }
      }

      if (pathPoints.length < 2) {
        const fromItem = itemsWithCoords[fromIdx];
        if (fromItem?.lat && fromItem?.lng) {
          pathPoints = [
            [fromItem.lat, fromItem.lng],
            [targetItem.lat, targetItem.lng],
          ];
        } else {
          pathPoints = [[targetItem.lat, targetItem.lng]];
        }
      }

      // Calculate total path distance in meters to gauge duration between 1.6s ~ 4.0s
      let totalDist = 0;
      for (let i = 0; i < pathPoints.length - 1; i++) {
        const p1 = L.latLng(pathPoints[i][0], pathPoints[i][1]);
        const p2 = L.latLng(pathPoints[i + 1][0], pathPoints[i + 1][1]);
        totalDist += p1.distanceTo(p2);
      }

      const durationMs = Math.min(4000, Math.max(1600, (totalDist / 1000) * 800));

      const mode = targetItem.move || '도보';
      const svgHtml = getPixelSvg(mode);

      const charIcon = L.divIcon({
        className: 'leaflet-char-icon',
        html: `<div class="cursor-pointer -translate-x-1/2 -translate-y-1/2">${svgHtml}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (!charMarkerRef.current) {
        charMarkerRef.current = L.marker(pathPoints[0], {
          icon: charIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      } else {
        charMarkerRef.current.setIcon(charIcon);
        charMarkerRef.current.setLatLng(pathPoints[0]);
      }

      isAnimatingRef.current = true;
      const startTime = performance.now();

      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);

        // Ease in-out quadratic for smooth acceleration and deceleration
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        const targetDist = ease * totalDist;

        // Find position along pathPoints
        let accDist = 0;
        let currentLatLng: [number, number] = pathPoints[pathPoints.length - 1];

        for (let i = 0; i < pathPoints.length - 1; i++) {
          const p1 = L.latLng(pathPoints[i][0], pathPoints[i][1]);
          const p2 = L.latLng(pathPoints[i + 1][0], pathPoints[i + 1][1]);
          const segDist = p1.distanceTo(p2);

          if (accDist + segDist >= targetDist || i === pathPoints.length - 2) {
            const segRatio = segDist > 0 ? (targetDist - accDist) / segDist : 1;
            const clampedRatio = Math.max(0, Math.min(1, segRatio));
            const lat = pathPoints[i][0] + (pathPoints[i + 1][0] - pathPoints[i][0]) * clampedRatio;
            const lng = pathPoints[i][1] + (pathPoints[i + 1][1] - pathPoints[i][1]) * clampedRatio;
            currentLatLng = [lat, lng];
            break;
          }
          accDist += segDist;
        }

        if (charMarkerRef.current) {
          charMarkerRef.current.setLatLng(currentLatLng);
        }

        // Keep character in view by panning if it approaches edge
        if (map && !map.getBounds().pad(-0.15).contains(currentLatLng)) {
          map.panTo(currentLatLng, { animate: false });
        }

        if (progress < 1) {
          animFrameIdRef.current = requestAnimationFrame(step);
        } else {
          isAnimatingRef.current = false;
          if (charMarkerRef.current) {
            charMarkerRef.current.setLatLng([targetItem.lat!, targetItem.lng!]);
          }
        }
      };

      animFrameIdRef.current = requestAnimationFrame(step);
    },
    [itemsWithCoords, routeSegments]
  );

  // Trigger animation when index changes
  const prevIndexRef = useRef<number>(currentIndex);
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      animateCharacterAlongPath(prevIndexRef.current, currentIndex);
      prevIndexRef.current = currentIndex;
    } else {
      // First mount position
      const currentItem = itemsWithCoords[currentIndex];
      if (currentItem?.lat && currentItem?.lng && mapInstanceRef.current) {
        const mode = currentItem.move || '도보';
        const svgHtml = getPixelSvg(mode);
        const charIcon = L.divIcon({
          className: 'leaflet-char-icon',
          html: `<div class="cursor-pointer -translate-x-1/2 -translate-y-1/2">${svgHtml}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        if (!charMarkerRef.current) {
          charMarkerRef.current = L.marker([currentItem.lat, currentItem.lng], {
            icon: charIcon,
            zIndexOffset: 1000,
          }).addTo(mapInstanceRef.current);
        } else {
          charMarkerRef.current.setIcon(charIcon);
          charMarkerRef.current.setLatLng([currentItem.lat, currentItem.lng]);
        }
      }
    }
  }, [currentIndex, animateCharacterAlongPath, itemsWithCoords]);

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
