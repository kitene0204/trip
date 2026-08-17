import React, { useMemo } from 'react';
import { CATEGORIES, FlightItem, Trip, TripItem, UserDoc } from '../types';
import { exportToICS, openDataUrlInNewWindow } from '../utils/helpers';
import {
  Plane,
  Navigation,
  MapPin,
  Calendar,
  Paperclip,
  Edit2,
  Trash2,
  Bell,
  Plus,
  Settings as SettingsIcon,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ScheduleViewProps {
  trip: Trip;
  selectedDate: string;
  onAddItem: (day: string) => void;
  onEditItem: (item: TripItem) => void;
  onDeleteItem: (id: string) => void;
  onAddFlight: () => void;
  onEditFlight: (flight: FlightItem) => void;
  onDeleteFlight: (id: string) => void;
  onOpenSettings: () => void;
  highlightedItemId: string | null;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  trip,
  selectedDate,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddFlight,
  onEditFlight,
  onDeleteFlight,
  onOpenSettings,
  highlightedItemId,
}) => {
  // Filter flights for this trip (or show flights relevant to selected date / all)
  const currentDayFlights = useMemo(() => {
    return (trip.flights || []).filter((f) => !f.date || f.date === selectedDate);
  }, [trip.flights, selectedDate]);

  // Filter and sort items for the selected day
  const dayItems = useMemo(() => {
    return (trip.items || [])
      .filter((it) => it.day === selectedDate)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [trip.items, selectedDate]);

  // Aggregate all user documents from all items
  const allDocs = useMemo(() => {
    const docs: { doc: UserDoc; item: TripItem }[] = [];
    (trip.items || []).forEach((it) => {
      if (it.userDocs && it.userDocs.length > 0) {
        it.userDocs.forEach((d) => {
          docs.push({ doc: d, item: it });
        });
      }
    });
    return docs;
  }, [trip.items]);

  const handleOpenDirections = (item: TripItem) => {
    const query = encodeURIComponent(item.place || item.name);
    const url = item.mapUrl && item.mapUrl.trim()
      ? item.mapUrl
      : `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenMapSearch = (item: TripItem) => {
    const query = encodeURIComponent(item.place || item.name);
    const url = item.mapUrl && item.mapUrl.trim()
      ? item.mapUrl
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadSingleICS = (item: TripItem) => {
    exportToICS([item], `${item.name}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
      {/* (A) Flight Cards Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1b4b7a]">
            <Plane className="w-3.5 h-3.5" />
            <span>항공편 정보</span>
          </div>
          <button
            onClick={onAddFlight}
            className="text-[11px] font-bold text-[#3f7cb0] hover:text-[#1b4b7a] transition-colors flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" />
            항공편 추가
          </button>
        </div>

        {currentDayFlights.length > 0 ? (
          currentDayFlights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white border border-dashed border-[#3f7cb0]/40 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-[#1b4b7a] transition-all"
            >
              <div className="flex items-center justify-between">
                {/* Departure */}
                <div className="text-center w-24">
                  <span className="text-[10px] font-bold text-[#6b7a89] block">{flight.depCity}</span>
                  <span className="text-xl font-black text-[#1b4b7a] tracking-tight">{flight.depAirport}</span>
                  <span className="text-xs font-bold text-[#1c2733] block mt-0.5">{flight.depTime}</span>
                </div>

                {/* Plane Graphic */}
                <div className="flex-1 px-3 flex flex-col items-center">
                  <div className="w-full border-t border-slate-300 relative my-2">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs">
                      ✈️
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#d9724a] bg-orange-50 px-2 py-0.5 rounded-full mt-1">
                    {flight.flightNumber}
                  </span>
                </div>

                {/* Arrival */}
                <div className="text-center w-24">
                  <span className="text-[10px] font-bold text-[#6b7a89] block">{flight.arrCity}</span>
                  <span className="text-xl font-black text-[#1b4b7a] tracking-tight">{flight.arrAirport}</span>
                  <span className="text-xs font-bold text-[#1c2733] block mt-0.5">{flight.arrTime}</span>
                </div>
              </div>

              {flight.memo && (
                <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-[#6b7a89] line-clamp-1">
                  📝 {flight.memo}
                </div>
              )}

              {/* Edit/Delete mini buttons */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditFlight(flight)}
                  className="p-1 text-slate-400 hover:text-[#1b4b7a] hover:bg-slate-100 rounded-md"
                  title="항공편 수정"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDeleteFlight(flight.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                  title="항공편 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-50/80 border border-slate-200 border-dashed rounded-xl p-3 text-center text-xs text-[#6b7a89]">
            등록된 항공편이 없습니다. 필요시 상단의 [+ 항공편 추가]를 눌러주세요.
          </div>
        )}
      </div>

      {/* (B) Reservation Documents Vault (예약 서류함) */}
      {allDocs.length > 0 && (
        <div className="bg-white border border-[#e5e9ee] rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c2733]">
            <Paperclip className="w-3.5 h-3.5 text-[#3f7cb0]" />
            <span>예약 서류함 ({allDocs.length}개)</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {allDocs.map(({ doc, item }, idx) => (
              <button
                key={idx}
                onClick={() => openDataUrlInNewWindow(doc.data, doc.name)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-left transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#3f7cb0] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1c2733] truncate group-hover:text-[#1b4b7a]">
                      {doc.name}
                    </div>
                    <div className="text-[10px] text-[#6b7a89] truncate">
                      {item.day} · {item.name}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#3f7cb0] px-2 py-0.5 rounded bg-white border border-slate-200 flex-shrink-0">
                  열기 ↗
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* (C) Daily Schedule Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1c2733]">
            <Clock className="w-3.5 h-3.5 text-[#d9724a]" />
            <span>오늘의 일정 ({dayItems.length}개)</span>
          </div>
          <span className="text-[11px] text-[#6b7a89]">시간순 정렬</span>
        </div>

        {dayItems.length === 0 ? (
          <div className="bg-white border border-[#e5e9ee] rounded-2xl p-8 text-center shadow-sm flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-1">
              🗓️
            </div>
            <p className="text-sm font-bold text-[#1c2733]">아직 일정이 없어요</p>
            <p className="text-xs text-[#6b7a89] max-w-[200px]">
              하단의 [+ 일정 추가] 버튼을 눌러 새로운 일정을 등록해보세요.
            </p>
            <button
              onClick={() => onAddItem(selectedDate)}
              className="mt-3 px-4 py-2 rounded-xl bg-[#1b4b7a] text-white text-xs font-bold shadow-sm hover:bg-[#15395d] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              일정 추가하기
            </button>
          </div>
        ) : (
          dayItems.map((item, index) => {
            const catInfo = CATEGORIES[item.cat] || CATEGORIES['기타'];
            const isHighlighted = highlightedItemId === item.id;

            return (
              <div
                key={item.id}
                id={`item-card-${item.id}`}
                className={`bg-white border rounded-2xl p-4 shadow-sm transition-all relative group ${
                  isHighlighted
                    ? 'card-highlight border-[#d9724a] bg-orange-50/20'
                    : 'border-[#e5e9ee] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Category Emoji Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${catInfo.badgeBg}`}
                  >
                    {catInfo.emoji}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    {/* Time & Badges */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#1b4b7a] tracking-tight">
                          {item.time || '시간 미정'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${catInfo.badgeBg} ${catInfo.badgeText}`}
                        >
                          {catInfo.label}
                        </span>
                        {item.move && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#6b7a89] flex items-center gap-0.5">
                            {item.move === '도보' ? '🚶' : item.move === '지하철' ? '🚇' : item.move === '버스' ? '🚌' : item.move === '택시' ? '🚕' : '🚆'}
                            {item.move}
                          </span>
                        )}
                      </div>

                      {item.alarm && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                          <Bell className="w-3 h-3" />
                          <span>{item.alarm}</span>
                        </div>
                      )}
                    </div>

                    {/* Place Name */}
                    <h3 className="text-sm sm:text-base font-extrabold text-[#1c2733] leading-snug break-words">
                      {item.name}
                    </h3>

                    {/* Address / Location Search query */}
                    {item.place && (
                      <p className="text-[11px] text-[#6b7a89] mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{item.place}</span>
                      </p>
                    )}

                    {/* Memo */}
                    {item.memo && (
                      <div className="mt-2 p-2 rounded-xl bg-[#f6f8fa] text-[11px] text-[#1c2733] font-medium leading-relaxed border border-slate-100 whitespace-pre-wrap">
                        {item.memo}
                      </div>
                    )}

                    {/* Attached files indicator */}
                    {item.userDocs && item.userDocs.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {item.userDocs.map((doc, dIdx) => (
                          <button
                            key={dIdx}
                            onClick={() => openDataUrlInNewWindow(doc.data, doc.name)}
                            className="text-[10px] font-bold text-[#3f7cb0] bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md border border-sky-100 flex items-center gap-1"
                          >
                            <Paperclip className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[120px]">{doc.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleOpenDirections(item)}
                          className="px-2.5 py-1 bg-[#1b4b7a] text-white hover:bg-[#15395d] active:scale-95 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs"
                          title="구글 지도 길찾기"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          길찾기
                        </button>
                        <button
                          onClick={() => handleOpenMapSearch(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#1c2733] active:scale-95 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          title="구글 지도에서 위치 보기"
                        >
                          <MapPin className="w-2.5 h-2.5 text-slate-500" />
                          지도보기
                        </button>
                        <button
                          onClick={() => handleDownloadSingleICS(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#1c2733] active:scale-95 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          title="캘린더(.ics) 다운로드"
                        >
                          <Calendar className="w-2.5 h-2.5 text-slate-500" />
                          캘린더
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 text-slate-500 hover:text-[#1b4b7a] hover:bg-slate-100 rounded-lg active:scale-95 transition-all"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg active:scale-95 transition-all"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* (D) Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-20">
        <div className="flex items-center gap-3 pointer-events-auto shadow-xl rounded-2xl bg-white p-2 border border-[#e5e9ee]">
          <button
            onClick={() => onAddItem(selectedDate)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#1b4b7a] hover:bg-[#15395d] text-white font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>일정 추가</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1c2733] active:scale-95 transition-all border border-slate-200"
            title="설정 및 백업"
          >
            <SettingsIcon className="w-5 h-5 text-[#1b4b7a]" />
          </button>
        </div>
      </div>
    </div>
  );
};
