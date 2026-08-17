import React, { useState } from 'react';
import { FlightItem } from '../../types';
import { X, Plane, Trash2, Check, Calendar, Clock } from 'lucide-react';

interface FlightModalProps {
  flight: Partial<FlightItem> | null;
  defaultDate: string;
  onSave: (flight: FlightItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const FlightModal: React.FC<FlightModalProps> = ({
  flight,
  defaultDate,
  onSave,
  onDelete,
  onClose,
}) => {
  const isEditing = !!flight?.id;

  const [date, setDate] = useState<string>(flight?.date || defaultDate);
  const [depAirport, setDepAirport] = useState<string>(flight?.depAirport || 'ICN');
  const [depCity, setDepCity] = useState<string>(flight?.depCity || '서울(인천)');
  const [depTime, setDepTime] = useState<string>(flight?.depTime || '09:15');
  const [arrAirport, setArrAirport] = useState<string>(flight?.arrAirport || 'NRT');
  const [arrCity, setArrCity] = useState<string>(flight?.arrCity || '도쿄(나리타)');
  const [arrTime, setArrTime] = useState<string>(flight?.arrTime || '11:40');
  const [flightNumber, setFlightNumber] = useState<string>(flight?.flightNumber || 'KE703');
  const [memo, setMemo] = useState<string>(flight?.memo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFlight: FlightItem = {
      id: flight?.id || `flight-${Date.now()}`,
      date,
      depAirport: depAirport.toUpperCase().trim(),
      depCity: depCity.trim(),
      depTime,
      arrAirport: arrAirport.toUpperCase().trim(),
      arrCity: arrCity.trim(),
      arrTime,
      flightNumber: flightNumber.toUpperCase().trim(),
      memo: memo.trim(),
    };
    onSave(newFlight);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-[#1b4b7a]">
              {isEditing ? '항공편 수정' : '새 항공편 추가'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Flight Number & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#6b7a89] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#3f7cb0]" />
                <span>탑승 날짜</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#6b7a89] mb-1 block">편명</label>
              <input
                type="text"
                required
                placeholder="예: KE703, OZ102"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1c2733] focus:bg-white focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Departure Group */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-[#1b4b7a]">출발지 정보</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#6b7a89] block mb-0.5">공항코드</label>
                <input
                  type="text"
                  required
                  placeholder="ICN"
                  maxLength={4}
                  value={depAirport}
                  onChange={(e) => setDepAirport(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-black text-[#1c2733] uppercase text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6b7a89] block mb-0.5">도시/공항명</label>
                <input
                  type="text"
                  required
                  placeholder="서울(인천)"
                  value={depCity}
                  onChange={(e) => setDepCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#1c2733]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6b7a89] block mb-0.5">출발시각</label>
                <input
                  type="time"
                  required
                  value={depTime}
                  onChange={(e) => setDepTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#1c2733]"
                />
              </div>
            </div>
          </div>

          {/* Arrival Group */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-[#1b4b7a]">도착지 정보</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#6b7a89] block mb-0.5">공항코드</label>
                <input
                  type="text"
                  required
                  placeholder="NRT"
                  maxLength={4}
                  value={arrAirport}
                  onChange={(e) => setArrAirport(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-black text-[#1c2733] uppercase text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6b7a89] block mb-0.5">도시/공항명</label>
                <input
                  type="text"
                  required
                  placeholder="도쿄(나리타)"
                  value={arrCity}
                  onChange={(e) => setArrCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#1c2733]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6b7a89] block mb-0.5">도착시각</label>
                <input
                  type="time"
                  required
                  value={arrTime}
                  onChange={(e) => setArrTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#1c2733]"
                />
              </div>
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="text-xs font-bold text-[#6b7a89] mb-1 block">메모 (터미널, 좌석 등)</label>
            <input
              type="text"
              placeholder="예: 제2여객터미널, 좌석 28A"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-[#1c2733] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (flight.id) onDelete(flight.id);
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
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 active:scale-95"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1b4b7a] text-white text-xs font-black hover:bg-[#15395d] active:scale-95 flex items-center gap-1 shadow-md"
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
