import React from 'react';
import { X, Map, Calendar, Bell, Navigation, Plane, FileText } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="text-base font-black text-[#1b4b7a]">여행 플래너 사용 가이드</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-[#1c2733] leading-relaxed">
          {/* Card 1: Map Overview */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-[#1b4b7a]">
              <Map className="w-4 h-4 text-[#3f7cb0]" />
              <span>1. 생동감 넘치는 애니메이션 오버뷰 지도</span>
            </div>
            <p className="text-[#6b7a89]">
              상단의 [오버뷰] 탭을 누르면 OpenStreetMap과 OSRM 도로 경로를 기반으로 일정 동선을 시각화합니다.
              이동 수단(도보, 지하철, 택시 등)에 맞춰 픽셀아트 캐릭터가 움직입니다.
            </p>
          </div>

          {/* Card 2: Flights & Vault */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-[#1b4b7a]">
              <Plane className="w-4 h-4 text-[#d9724a]" />
              <span>2. 항공편 카드 & 예약 서류함</span>
            </div>
            <p className="text-[#6b7a89]">
              출발/도착 공항과 항공편 정보를 깔끔한 보딩패스 카드로 확인하세요. 바우처, E-티켓, 여권 사진을 일정에 첨부하면 [예약 서류함]에서 언제든 새 창으로 바로 열어볼 수 있습니다.
            </p>
          </div>

          {/* Card 3: Google Maps & ICS */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-emerald-800">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>3. 구글 지도 길찾기 & 캘린더 연동</span>
            </div>
            <p className="text-emerald-900/80">
              각 일정 카드의 [길찾기] 버튼으로 구글 지도 경로를 1초 만에 실행하고, [캘린더] 버튼으로 알람이 포함된 .ics 파일을 다운받아 스마트폰 기본 캘린더에 넣을 수 있습니다.
            </p>
          </div>

          {/* Card 4: Alarm & Offline LocalStorage */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-amber-800">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>4. 브라우저 로컬 저장 & 자동 알람</span>
            </div>
            <p className="text-amber-900/80">
              모든 데이터는 기기의 브라우저 로컬 스토리지에 안전하게 저장되며 로그인 없이 바로 동작합니다. 설정 메뉴에서 언제든 전체 백업 JSON을 내보내고 복원할 수 있습니다.
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#1b4b7a] text-white font-bold text-xs hover:bg-[#15395d] active:scale-98 transition-all shadow-md"
            >
              확인 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
