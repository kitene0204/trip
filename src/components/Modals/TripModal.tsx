import React, { useState } from 'react';
import { Trip } from '../../types';
import { X, Calendar, MapPin, Users, Check, Trash2 } from 'lucide-react';

interface TripModalProps {
  trip: Partial<Trip> | null;
  onSave: (trip: Trip) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  isOnlyTrip?: boolean;
}

export const TripModal: React.FC<TripModalProps> = ({
  trip,
  onSave,
  onDelete,
  onClose,
  isOnlyTrip = false,
}) => {
  const isEditing = !!trip?.id;

  const [title, setTitle] = useState<string>(trip?.title || '');
  const [start, setStart] = useState<string>(trip?.start || new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState<string>(
    trip?.end || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
  );
  const [note, setNote] = useState<string>(trip?.note || '2인');
  const [citiesInput, setCitiesInput] = useState<string>(
    trip?.cities && trip.cities.length > 0 ? trip.cities.join(', ') : '도쿄'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cities = citiesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const updatedTrip: Trip = {
      id: trip?.id || `trip-${Date.now()}`,
      title: title.trim(),
      start,
      end,
      note: note.trim(),
      cities: cities.length > 0 ? cities : ['여행지'],
      coverPhoto: trip?.coverPhoto,
      flights: trip?.flights || [],
      items: trip?.items || [],
    };

    onSave(updatedTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-base font-black text-[#1b4b7a]">
            {isEditing ? '여행 정보 수정' : '새 여행 만들기'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 block">
              여행 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 도쿄 먹부림 힐링 여행, 오사카 가족 여행"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#3f7cb0]" />
                <span>시작일</span>
              </label>
              <input
                type="date"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#3f7cb0]" />
                <span>종료일</span>
              </label>
              <input
                type="date"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Note / Subtitle */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#3f7cb0]" />
              <span>부제 / 인원 (예: 2인, 나홀로 여행, 가족 4인)</span>
            </label>
            <input
              type="text"
              placeholder="예: 2인"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
            />
          </div>

          {/* Cities (Comma separated) */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#3f7cb0]" />
              <span>방문 도시 (쉼표로 구분)</span>
            </label>
            <input
              type="text"
              placeholder="예: 도쿄, 하코네, 요코하마"
              value={citiesInput}
              onChange={(e) => setCitiesInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:border-[#1b4b7a] focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {isEditing && onDelete && !isOnlyTrip ? (
              <button
                type="button"
                onClick={() => {
                  if (trip?.id) onDelete(trip.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold active:scale-95 flex items-center gap-1"
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
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 active:scale-95"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#1b4b7a] text-white text-xs font-black hover:bg-[#15395d] active:scale-95 flex items-center gap-1 shadow-md"
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
