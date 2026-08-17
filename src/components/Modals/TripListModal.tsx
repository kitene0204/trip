import React, { useState } from 'react';
import { Trip } from '../../types';
import { X, Plus, Check, Edit2, Trash2, Calendar } from 'lucide-react';

interface TripListModalProps {
  trips: Trip[];
  activeId: string;
  onSelectTrip: (id: string) => void;
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
  onNewTrip: () => void;
  onClose: () => void;
}

export const TripListModal: React.FC<TripListModalProps> = ({
  trips,
  activeId,
  onSelectTrip,
  onEditTrip,
  onDeleteTrip,
  onNewTrip,
  onClose,
}) => {
  // Store ID of trip pending delete confirmation (double-tap safety)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      onDeleteTrip(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      // reset confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirmId((prev) => (prev === id ? null : prev));
      }, 3000);
    }
  };

  const isOnlyOne = trips.length <= 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <h2 className="text-base font-black text-[#1b4b7a]">내 여행 목록</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trips List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {trips.map((t) => {
            const isActive = t.id === activeId;
            const isDeleting = deleteConfirmId === t.id;
            const itemCount = (t.items || []).length;
            const flightCount = (t.flights || []).length;

            return (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTrip(t.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-sky-50/50 border-[#1b4b7a] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Active Indicator Icon */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isActive ? 'bg-[#1b4b7a] text-white' : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>

                  {/* Trip Details */}
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-extrabold truncate ${isActive ? 'text-[#1b4b7a]' : 'text-[#1c2733]'}`}>
                      {t.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6b7a89] mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>
                        {t.start} ~ {t.end}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-slate-600">
                        일정 {itemCount}개 {flightCount > 0 ? `· 항공 ${flightCount}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      onEditTrip(t);
                      onClose();
                    }}
                    className="p-1.5 text-slate-400 hover:text-[#1b4b7a] hover:bg-slate-100 rounded-lg active:scale-95 transition-all"
                    title="여행 정보 수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {!isOnlyOne && (
                    <button
                      onClick={(e) => handleDeleteClick(t.id, e)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 ${
                        isDeleting
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={isDeleting ? '한 번 더 누르면 삭제됩니다' : '여행 삭제'}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting && <span className="text-[10px]">확인 삭제</span>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Add new trip */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <button
            onClick={() => {
              onNewTrip();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#1b4b7a] hover:bg-[#15395d] text-white font-extrabold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>새 여행 만들기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
