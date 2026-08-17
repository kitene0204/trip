import { Trip, TripItem } from '../types';

/**
 * Days of the week in Korean
 */
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function getDayOfWeekKorean(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return WEEKDAYS[date.getDay()] || '';
}

/**
 * Returns formatted month/day (e.g., "1/10")
 */
export function formatMonthDay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
}

/**
 * Calculates array of YYYY-MM-DD dates between start and end
 */
export function getDatesBetween(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [startDate];

  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }

  return dates.length > 0 ? dates : [startDate];
}

/**
 * Computes Korean trip date summary: "1월 10일 (토) – 1월 13일 (화) · 3박 4일 · 2인"
 */
export function formatKoreanTripSummary(trip: Trip): string {
  if (!trip.start || !trip.end) return trip.note || '';

  const [sy, sm, sd] = trip.start.split('-').map(Number);
  const [ey, em, ed] = trip.end.split('-').map(Number);

  const sDate = new Date(sy, sm - 1, sd);
  const eDate = new Date(ey, em - 1, ed);

  const sWeekday = WEEKDAYS[sDate.getDay()];
  const eWeekday = WEEKDAYS[eDate.getDay()];

  const diffTime = eDate.getTime() - sDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const nights = Math.max(0, diffDays);
  const days = nights + 1;

  const startFormatted = `${sm}월 ${sd}일 (${sWeekday})`;
  const endFormatted = `${em}월 ${ed}일 (${eWeekday})`;

  const parts = [`${startFormatted} – ${endFormatted}`, `${nights}박 ${days}일`];
  if (trip.note && trip.note.trim()) {
    parts.push(trip.note.trim());
  }

  return parts.join(' · ');
}

/**
 * Computes D-Day badge: "D-30", "D-DAY", "여행 3일차", "여행 종료"
 */
export function getDDayText(startDate: string, endDate: string): { text: string; isOngoing: boolean; isEnded: boolean } {
  if (!startDate || !endDate) return { text: 'D-DAY', isOngoing: false, isEnded: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);

  const sDate = new Date(sy, sm - 1, sd);
  const eDate = new Date(ey, em - 1, ed);

  const diffStartMs = sDate.getTime() - today.getTime();
  const diffStartDays = Math.round(diffStartMs / (1000 * 60 * 60 * 24));

  const diffEndMs = today.getTime() - eDate.getTime();
  const diffEndDays = Math.round(diffEndMs / (1000 * 60 * 60 * 24));

  if (diffStartDays > 0) {
    return { text: `D-${diffStartDays}`, isOngoing: false, isEnded: false };
  } else if (diffStartDays === 0) {
    return { text: 'D-DAY', isOngoing: true, isEnded: false };
  } else if (diffEndDays <= 0) {
    const currentDay = Math.abs(diffStartDays) + 1;
    return { text: `여행 ${currentDay}일차`, isOngoing: true, isEnded: false };
  } else {
    return { text: '여행 종료', isOngoing: false, isEnded: true };
  }
}

/**
 * Resizes an image file to max dimensions via Canvas and outputs a base64 data URL
 */
export function resizeImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 dataURL to Blob and open in new tab
 */
export function openDataUrlInNewWindow(dataUrl: string, fileName = 'document') {
  try {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    
    // Open in new tab or popup
    const newWin = window.open(blobUrl, '_blank');
    if (!newWin) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.target = '_blank';
      a.click();
    }
  } catch (err) {
    console.error('Failed to open document:', err);
    window.open(dataUrl, '_blank');
  }
}

/**
 * Creates and triggers download of .ics calendar file for a Trip or TripItem
 */
export function exportToICS(items: TripItem[], tripTitle = '여행 일정') {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Travel Planner//KR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + tripTitle,
  ];

  items.forEach((item) => {
    const dayDigits = item.day.replace(/-/g, '');
    const timeDigits = (item.time || '09:00').replace(/:/g, '') + '00';
    const startIso = `${dayDigits}T${timeDigits}`;
    
    // default 1 hour duration
    const endHour = parseInt((item.time || '09:00').split(':')[0], 10) + 1;
    const endHourStr = String(Math.min(23, endHour)).padStart(2, '0');
    const endMinuteStr = (item.time || '09:00').split(':')[1] || '00';
    const endIso = `${dayDigits}T${endHourStr}${endMinuteStr}00`;

    let event = [
      'BEGIN:VEVENT',
      `UID:${item.id}-${Date.now()}@travelplanner`,
      `DTSTAMP:${startIso}Z`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:[${item.cat}] ${item.name}`,
      `LOCATION:${item.place || ''}`,
      `DESCRIPTION:${item.memo || ''}`,
    ];

    if (item.alarm) {
      // Calculate alarm offset in minutes if alarm time specified
      const [aH, aM] = item.alarm.split(':').map(Number);
      const [tH, tM] = (item.time || '09:00').split(':').map(Number);
      const diffMins = Math.max(0, (tH * 60 + tM) - (aH * 60 + aM));
      event.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:알림: ${item.name}`,
        `TRIGGER:-PT${diffMins}M`,
        'END:VALARM'
      );
    }

    event.push('END:VEVENT');
    icsContent.push(...event);
  });

  icsContent.push('END:VCALENDAR');
  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tripTitle.replace(/\s+/g, '_')}_일정.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Web Audio API synthesizer for clean alarm beep
 */
export function playAlarmSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play two pleasant notification chords
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

/**
 * Nominatim OpenStreetMap Geocoding API
 */
export async function searchCoordinates(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!query || !query.trim()) return null;
  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encoded}`, {
      headers: {
        'Accept-Language': 'ko,en',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.warn('Geocoding lookup error:', err);
  }
  return null;
}

/**
 * OSRM Road routing API
 * Coordinates are passed as [lng, lat] to OSRM
 */
export async function fetchOsrmRoute(waypoints: [number, number][]): Promise<[number, number][] | null> {
  if (waypoints.length < 2) return null;
  try {
    // waypoints formatted as lng,lat;lng,lat
    const coordsParam = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code === 'Ok' && json.routes && json.routes.length > 0) {
      const geojsonCoords = json.routes[0].geometry.coordinates as [number, number][];
      // Convert back to [lat, lng] for Leaflet
      return geojsonCoords.map(([lng, lat]) => [lat, lng]);
    }
  } catch (e) {
    console.warn('OSRM routing fetch failed, falling back to straight lines:', e);
  }
  return null;
}
