import { StorageData, Trip } from '../types';

const STORAGE_KEY = 'travel_planner_v1_data';

export const INITIAL_SAMPLE_TRIP: Trip = {
  id: 'trip-sample-tokyo-2026',
  title: '도쿄 먹부림 & 힐링 여행',
  start: '2026-10-10',
  end: '2026-10-13',
  note: '2인',
  cities: ['도쿄'],
  coverPhoto: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
  flights: [
    {
      id: 'flight-1',
      date: '2026-10-10',
      depAirport: 'ICN',
      depCity: '서울(인천)',
      depTime: '09:15',
      arrAirport: 'NRT',
      arrCity: '도쿄(나리타)',
      arrTime: '11:40',
      flightNumber: 'KE703',
      memo: '터미널 2, 사전 좌석 지정 완료',
    },
    {
      id: 'flight-2',
      date: '2026-10-13',
      depAirport: 'HND',
      depCity: '도쿄(하네다)',
      depTime: '19:45',
      arrAirport: 'GMP',
      arrCity: '서울(김포)',
      arrTime: '22:15',
      flightNumber: 'KE708',
      memo: '출국 2시간 전 도착',
    },
  ],
  items: [
    // Day 1: 2026-10-10
    {
      id: 'item-101',
      day: '2026-10-10',
      time: '13:30',
      cat: '식당',
      name: '츠키지 장외시장 스시 잔마이',
      place: 'Tsukiji Outer Market, Chuo City, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Tsukiji+Outer+Market',
      memo: '신선한 참치 세트와 계란말이 먹기! 현금 준비',
      move: '지하철',
      alarm: '13:00',
      lat: 35.6655,
      lng: 139.7708,
      userDocs: [],
    },
    {
      id: 'item-102',
      day: '2026-10-10',
      time: '15:30',
      cat: '숙소',
      name: '호텔 그레이서리 신주쿠',
      place: 'Hotel Gracery Shinjuku, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Hotel+Gracery+Shinjuku',
      memo: '체크인 및 짐 보관 (예약번호: HG-8921)',
      move: '지하철',
      alarm: '15:00',
      lat: 35.6953,
      lng: 139.7020,
      userDocs: [],
    },
    {
      id: 'item-103',
      day: '2026-10-10',
      time: '17:30',
      cat: '명소',
      name: '시부야 스카이 전망대',
      place: 'SHIBUYA SKY, Tokyo',
      mapUrl: 'https://maps.google.com/?q=SHIBUYA+SKY',
      memo: '일몰 30분 전 입장 필수! 모바일 바코드 준비',
      move: '지하철',
      alarm: '17:00',
      lat: 35.6590,
      lng: 139.7020,
      userDocs: [],
    },
    {
      id: 'item-104',
      day: '2026-10-10',
      time: '20:00',
      cat: '식당',
      name: '시부야 모토무라 규카츠',
      place: 'Gyukatsu Motomura Shibuya, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Gyukatsu+Motomura+Shibuya',
      memo: '웨이팅 30분 예상, 마 소스 추가',
      move: '도보',
      alarm: '19:40',
      lat: 35.6586,
      lng: 139.7056,
      userDocs: [],
    },
    // Day 2: 2026-10-11
    {
      id: 'item-201',
      day: '2026-10-11',
      time: '10:00',
      cat: '명소',
      name: '아사쿠사 센소지',
      place: 'Senso-ji, Asakusa, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Senso-ji',
      memo: '나카미세 거리 구경 & 운세 제비 뽑기',
      move: '지하철',
      alarm: '09:30',
      lat: 35.7148,
      lng: 139.7967,
      userDocs: [],
    },
    {
      id: 'item-202',
      day: '2026-10-11',
      time: '12:30',
      cat: '카페',
      name: '후게츠도 디저트 카페',
      place: 'Fugetsudo Cafe, Ginza, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Fugetsudo+Tokyo',
      memo: '말차 파르페 & 아이스 아메리카노',
      move: '지하철',
      lat: 35.6715,
      lng: 139.7650,
      userDocs: [],
    },
    {
      id: 'item-203',
      day: '2026-10-11',
      time: '15:00',
      cat: '쇼핑',
      name: '긴자 식스 (GINZA SIX)',
      place: 'Ginza Six, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Ginza+Six',
      memo: '츠타야 서점 옥상 정원 및 텍스리펀 쇼핑',
      move: '도보',
      lat: 35.6696,
      lng: 139.7640,
      userDocs: [],
    },
    // Day 3: 2026-10-12
    {
      id: 'item-301',
      day: '2026-10-12',
      time: '09:30',
      cat: '명소',
      name: '신주쿠 교엔 국립정원',
      place: 'Shinjuku Gyoen National Garden, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Shinjuku+Gyoen',
      memo: '산책 & 벤치 힐링, 입장료 500엔',
      move: '도보',
      lat: 35.6852,
      lng: 139.7101,
      userDocs: [],
    },
    {
      id: 'item-302',
      day: '2026-10-12',
      time: '13:00',
      cat: '식당',
      name: '이치란 라멘 신주쿠중앙동구점',
      place: 'Ichiran Shinjuku Chuo-Higashiguchi, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Ichiran+Shinjuku',
      memo: '비법소스 3배, 반숙란 추가',
      move: '도보',
      lat: 35.6908,
      lng: 139.7032,
      userDocs: [],
    },
    // Day 4: 2026-10-13
    {
      id: 'item-401',
      day: '2026-10-13',
      time: '11:00',
      cat: '기타',
      name: '호텔 체크아웃 & 도쿄역 락커',
      place: 'Tokyo Station, Tokyo',
      mapUrl: 'https://maps.google.com/?q=Tokyo+Station',
      memo: '수하물 보관 후 도쿄역 1번가 라멘 스트리트',
      move: '지하철',
      lat: 35.6812,
      lng: 139.7671,
      userDocs: [],
    },
  ],
};

export function loadStorageData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialData: StorageData = {
        trips: [INITIAL_SAMPLE_TRIP],
        activeId: INITIAL_SAMPLE_TRIP.id,
      };
      saveStorageData(initialData);
      return initialData;
    }
    const parsed = JSON.parse(raw) as StorageData;
    if (!parsed.trips || parsed.trips.length === 0) {
      const initialData: StorageData = {
        trips: [INITIAL_SAMPLE_TRIP],
        activeId: INITIAL_SAMPLE_TRIP.id,
      };
      saveStorageData(initialData);
      return initialData;
    }
    // ensure activeId is valid
    const hasActive = parsed.trips.some((t) => t.id === parsed.activeId);
    if (!hasActive) {
      parsed.activeId = parsed.trips[0].id;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load storage data, using fallback:', e);
    return {
      trips: [INITIAL_SAMPLE_TRIP],
      activeId: INITIAL_SAMPLE_TRIP.id,
    };
  }
}

export function saveStorageData(data: StorageData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
}

export function exportAllDataAsJSON(data: StorageData) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel_planner_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Export JSON failed', e);
  }
}

export function importDataFromJSON(file: File): Promise<StorageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && Array.isArray(json.trips) && json.trips.length > 0) {
          saveStorageData(json);
          resolve(json);
        } else {
          reject(new Error('올바른 백업 파일 형식이 아닙니다.'));
        }
      } catch (err) {
        reject(new Error('JSON 파싱 오류가 발생했습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsText(file);
  });
}
