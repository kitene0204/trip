import React, { useState, useRef } from 'react';
import { CATEGORIES, CategoryKey, TransportKey, TRANSPORTS, TripItem, UserDoc } from '../../types';
import { resizeImageFile, searchCoordinates } from '../../utils/helpers';
import { X, MapPin, Bell, Paperclip, Trash2, Clock, Calendar, Check, Search, Loader2 } from 'lucide-react';

interface ItemModalProps {
  item: Partial<TripItem> | null;
  defaultDay: string;
  onSave: (item: TripItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  defaultDay,
  onSave,
  onDelete,
  onClose,
}) => {
  const isEditing = !!item?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cat, setCat] = useState<CategoryKey>(item?.cat || '명소');
  const [day, setDay] = useState<string>(item?.day || defaultDay);
  const [time, setTime] = useState<string>(item?.time || '10:00');
  const [name, setName] = useState<string>(item?.name || '');
  const [place, setPlace] = useState<string>(item?.place || '');
  const [mapUrl, setMapUrl] = useState<string>(item?.mapUrl || '');
  const [move, setMove] = useState<TransportKey | undefined>(item?.move || '도보');
  const [alarm, setAlarm] = useState<string>(item?.alarm || '');
  const [memo, setMemo] = useState<string>(item?.memo || '');
  const [lat, setLat] = useState<number | undefined>(item?.lat);
  const [lng, setLng] = useState<number | undefined>(item?.lng);
  const [userDocs, setUserDocs] = useState<UserDoc[]>(item?.userDocs || []);

  const [isSearchingCoords, setIsSearchingCoords] = useState(false);
  const [coordSuccessMsg, setCoordSuccessMsg] = useState<string | null>(
    item?.lat && item?.lng ? `위치 좌표 등록됨 (${item.lat.toFixed(4)}, ${item.lng.toFixed(4)})` : null
  );

  const handleLookupCoords = async () => {
    const query = place.trim() || name.trim();
    if (!query) return;
    setIsSearchingCoords(true);
    try {
      const coords = await searchCoordinates(query);
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
        setCoordSuccessMsg(`좌표 찾기 성공! (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
      } else {
        setCoordSuccessMsg('좌표를 찾을 수 없습니다. 장소명을 더 상세히 입력해주세요.');
      }
    } finally {
      setIsSearchingCoords(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: UserDoc[] = [...userDocs];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const resized = await resizeImageFile(file, 1200, 1200, 0.8);
          newDocs.push({ name: file.name, data: resized });
        } catch (err) {
          console.error(err);
        }
      } else {
        // PDF or other documents
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (evt) => {
            if (evt.target?.result) {
              newDocs.push({ name: file.name, data: evt.target.result as string });
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    setUserDocs(newDocs);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveDoc = (index: number) => {
    setUserDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalLat = lat;
    let finalLng = lng;

    // If no coordinates yet, automatically search once
    if (finalLat === undefined || finalLng === undefined) {
      const query = place.trim() || name.trim();
      if (query) {
        const found = await searchCoordinates(query);
        if (found) {
          finalLat = found.lat;
          finalLng = found.lng;
        }
      }
    }

    const newItem: TripItem = {
      id: item?.id || `item-${Date.now()}`,
      day,
      time,
      cat,
      name: name.trim(),
      place: place.trim(),
      mapUrl: mapUrl.trim(),
      move,
      alarm: alarm.trim() || undefined,
      memo: memo.trim(),
      lat: finalLat,
      lng: finalLng,
      userDocs,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <h2 className="text-base font-black text-[#1b4b7a]">
            {isEditing ? '일정 수정' : '새 일정 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* 1. Category Chips */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1.5 block">카테고리</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
                const info = CATEGORIES[key];
                const isSelected = cat === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setCat(key)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                      isSelected
                        ? 'bg-[#1b4b7a] text-white border-[#1b4b7a] shadow-sm scale-102'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{info.emoji}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Date and Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#3f7cb0]" />
                <span>날짜</span>
              </label>
              <input
                type="date"
                required
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#3f7cb0]" />
                <span>시간</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Name */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 block">
              일정 이름 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 시부야 스카이 전망대, 스시 잔마이"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
            />
          </div>

          {/* 4. Place / Search query & Auto Coordinate Search */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#3f7cb0]" />
                <span>지도 검색어 / 주소</span>
              </span>
              <button
                type="button"
                onClick={handleLookupCoords}
                disabled={isSearchingCoords}
                className="text-[11px] text-[#3f7cb0] font-bold hover:underline flex items-center gap-1"
              >
                {isSearchingCoords ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Search className="w-3 h-3" />
                )}
                좌표 자동 검색
              </button>
            </label>
            <input
              type="text"
              placeholder="예: SHIBUYA SKY, Tokyo (비우면 일정 이름으로 검색)"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
            />
            {coordSuccessMsg && (
              <p className="text-[11px] text-[#3f7cb0] mt-1 font-semibold">{coordSuccessMsg}</p>
            )}
          </div>

          {/* 5. Google Map URL (optional custom link) */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 block">구글맵 링크 (선택)</label>
            <input
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
            />
          </div>

          {/* 6. Transport Mode Chips */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1.5 block">이동 방법</label>
            <div className="flex flex-wrap gap-1.5">
              {TRANSPORTS.map((t) => {
                const isSelected = move === t.key;
                return (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => setMove(t.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-[#1b4b7a] text-white border-[#1b4b7a] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Alarm Time */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-[#d9724a]" />
              <span>알람 시간 (선택)</span>
            </label>
            <input
              type="time"
              value={alarm}
              onChange={(e) => setAlarm(e.target.value)}
              placeholder="예: 09:30"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
            />
          </div>

          {/* 8. Memo */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 block">메모 / 준비물</label>
            <textarea
              rows={2}
              placeholder="예약 번호, 추천 메뉴, 챙길 것 등"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none resize-none"
            />
          </div>

          {/* 9. Attachments (PDF / Photos) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#6b7a89] flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-[#3f7cb0]" />
                <span>예약 서류 / 사진 첨부</span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-[#1b4b7a] font-bold hover:underline"
              >
                + 파일 선택
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,.pdf"
              className="hidden"
            />

            {userDocs.length > 0 && (
              <div className="space-y-1.5">
                {userDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="truncate max-w-[240px] font-medium text-[#1c2733]">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (item.id) onDelete(item.id);
                  onClose();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold active:scale-95 transition-all"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1b4b7a] hover:bg-[#15395d] text-white text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
