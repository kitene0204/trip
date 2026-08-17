import React, { useRef } from 'react';
import { Trip } from '../types';
import { formatKoreanTripSummary, getDDayText, resizeImageFile } from '../utils/helpers';
import { Camera, ChevronDown, Plus, BookOpen } from 'lucide-react';

interface HeaderProps {
  trip: Trip;
  activeTab: 'schedule' | 'overview';
  onTabChange: (tab: 'schedule' | 'overview') => void;
  onOpenTripList: () => void;
  onOpenNewTrip: () => void;
  onOpenGuide: () => void;
  onUpdateCoverPhoto: (photoDataUrl: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  trip,
  activeTab,
  onTabChange,
  onOpenTripList,
  onOpenNewTrip,
  onOpenGuide,
  onUpdateCoverPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dDay = getDDayText(trip.start, trip.end);
  const summaryText = formatKoreanTripSummary(trip);

  // Derive city and year label
  const year = trip.start ? trip.start.split('-')[0] : new Date().getFullYear().toString();
  const cityText = trip.cities && trip.cities.length > 0 ? trip.cities.join(', ') : '';
  const cityYearLabel = cityText ? `${cityText} · ${year}` : year;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImageFile(file, 1280, 800, 0.85);
      onUpdateCoverPhoto(resized);
    } catch (err) {
      console.error('Image resize failed:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const defaultCover = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop';
  const coverUrl = trip.coverPhoto || defaultCover;

  return (
    <header className="relative w-full select-none flex-shrink-0">
      {/* Hidden file input for photo replacement */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1) Top App Bar */}
      <div className="bg-[#1b4b7a] text-white px-4 py-3 flex items-center justify-between shadow-md safe-top sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-lg shadow-inner">
            🌏
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">여행 플래너</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Guide Button */}
          <button
            onClick={onOpenGuide}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1 text-white/90"
            title="사용법 보기"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#e0a94e]" />
            <span>가이드</span>
          </button>

          {/* Current Trip Dropdown Trigger */}
          <button
            onClick={onOpenTripList}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold max-w-[140px] truncate text-white"
            title="내 여행 목록"
          >
            <span className="truncate">{trip.title || '여행 선택'}</span>
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
          </button>

          {/* New Trip Button */}
          <button
            onClick={onOpenNewTrip}
            className="w-8 h-8 rounded-full bg-[#d9724a] hover:bg-[#c8623b] active:scale-90 transition-all flex items-center justify-center text-white font-bold shadow-md"
            title="새 여행 만들기"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2) Hero Section with Background */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden flex flex-col justify-end p-5 text-white shadow-inner">
        {/* Background Image & Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(27, 75, 122, 0.4) 0%, rgba(15, 23, 42, 0.85) 100%), url('${coverUrl}')`,
          }}
        />

        {/* Change Photo Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-3 right-3 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 active:scale-90 transition-all border border-white/20 shadow-lg z-10"
          title="배경 사진 변경"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide shadow-sm ${
                dDay.isEnded
                  ? 'bg-slate-500/80 text-white'
                  : dDay.isOngoing
                  ? 'bg-[#e0a94e] text-[#1c2733]'
                  : 'bg-[#d9724a] text-white'
              }`}
            >
              {dDay.text}
            </span>
            <span className="text-xs font-semibold text-white/80 tracking-wider uppercase">
              {cityYearLabel}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md text-white">
            {trip.title || '새로운 여행'}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-white/90 drop-shadow line-clamp-1">
            {summaryText}
          </p>
        </div>
      </div>

      {/* 3) Page Tabs */}
      <div className="grid grid-cols-2 bg-white border-b border-[#e5e9ee] shadow-sm">
        <button
          onClick={() => onTabChange('schedule')}
          className={`py-3 text-center text-sm font-bold transition-all relative ${
            activeTab === 'schedule'
              ? 'text-[#1b4b7a]'
              : 'text-[#6b7a89] hover:text-[#1c2733]'
          }`}
        >
          일정
          {activeTab === 'schedule' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b4b7a]" />
          )}
        </button>
        <button
          onClick={() => onTabChange('overview')}
          className={`py-3 text-center text-sm font-bold transition-all relative ${
            activeTab === 'overview'
              ? 'text-[#1b4b7a]'
              : 'text-[#6b7a89] hover:text-[#1c2733]'
          }`}
        >
          오버뷰
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b4b7a]" />
          )}
        </button>
      </div>
    </header>
  );
};
