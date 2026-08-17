export type CategoryKey = '항공' | '숙소' | '식당' | '카페' | '명소' | '이동' | '쇼핑' | '기타';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  emoji: string;
  bg: string;
  text: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  '항공': { key: '항공', label: '항공', emoji: '✈️', bg: 'bg-sky-500', text: 'text-sky-600', badgeBg: 'bg-sky-100', badgeText: 'text-sky-700' },
  '숙소': { key: '숙소', label: '숙소', emoji: '🏨', bg: 'bg-indigo-500', text: 'text-indigo-600', badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-700' },
  '식당': { key: '식당', label: '식당', emoji: '🍣', bg: 'bg-amber-500', text: 'text-amber-600', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
  '카페': { key: '카페', label: '카페', emoji: '☕', bg: 'bg-emerald-500', text: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700' },
  '명소': { key: '명소', label: '명소', emoji: '🗼', bg: 'bg-blue-500', text: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
  '이동': { key: '이동', label: '이동', emoji: '🚆', bg: 'bg-slate-600', text: 'text-slate-600', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700' },
  '쇼핑': { key: '쇼핑', label: '쇼핑', emoji: '🛍️', bg: 'bg-rose-500', text: 'text-rose-600', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700' },
  '기타': { key: '기타', label: '기타', emoji: '✨', bg: 'bg-violet-500', text: 'text-violet-600', badgeBg: 'bg-violet-100', badgeText: 'text-violet-700' },
};

export type TransportKey = '도보' | '지하철' | '버스' | '트램' | '기차' | '택시' | '항공' | '자전거';

export interface TransportInfo {
  key: TransportKey;
  label: string;
  emoji: string;
}

export const TRANSPORTS: TransportInfo[] = [
  { key: '도보', label: '도보', emoji: '🚶' },
  { key: '지하철', label: '지하철', emoji: '🚇' },
  { key: '버스', label: '버스', emoji: '🚌' },
  { key: '트램', label: '트램', emoji: '🚊' },
  { key: '기차', label: '기차', emoji: '🚆' },
  { key: '택시', label: '택시', emoji: '🚕' },
  { key: '항공', label: '항공', emoji: '✈️' },
  { key: '자전거', label: '자전거', emoji: '🚲' },
];

export interface UserDoc {
  name: string;
  data: string; // Base64 dataURL
}

export interface FlightItem {
  id: string;
  date: string; // YYYY-MM-DD
  depAirport: string; // e.g. ICN
  depCity: string; // 서울(인천)
  depTime: string; // 09:15
  arrAirport: string; // e.g. NRT
  arrCity: string; // 도쿄(나리타)
  arrTime: string; // 11:40
  flightNumber: string; // KE703
  memo?: string;
}

export interface TripItem {
  id: string;
  day: string; // YYYY-MM-DD
  time: string; // HH:mm
  cat: CategoryKey;
  name: string;
  place: string; // address or search query
  mapUrl?: string;
  memo?: string;
  move?: TransportKey;
  alarm?: string; // HH:mm
  lat?: number;
  lng?: number;
  userDocs?: UserDoc[];
}

export interface Trip {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  note: string; // e.g. "2인" or "가족 여행"
  cities: string[]; // e.g. ["도쿄", "하코네"]
  coverPhoto?: string;
  flights: FlightItem[];
  items: TripItem[];
}

export interface StorageData {
  trips: Trip[];
  activeId: string;
}
