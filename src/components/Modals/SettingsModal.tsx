import React, { useState, useRef } from 'react';
import { StorageData, Trip } from '../../types';
import { exportAllDataAsJSON, importDataFromJSON, INITIAL_SAMPLE_TRIP } from '../../utils/storage';
import { exportToICS, resizeImageFile } from '../../utils/helpers';
import {
  X,
  Camera,
  Bell,
  Download,
  Upload,
  Calendar,
  RotateCcw,
  Check,
  Edit,
  ShieldCheck,
  FileJson,
} from 'lucide-react';

interface SettingsModalProps {
  trip: Trip;
  storageData: StorageData;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onReloadStorage: (data: StorageData) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  trip,
  storageData,
  onUpdateTrip,
  onReloadStorage,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleRequestNotification = async () => {
    if (typeof Notification === 'undefined') {
      alert('이 브라우저는 알림 기능을 지원하지 않습니다.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImageFile(file, 1280, 800, 0.85);
      onUpdateTrip({ ...trip, coverPhoto: resized });
    } catch (err) {
      console.error('Image resize failed:', err);
    }
  };

  const handleJsonImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importDataFromJSON(file);
      onReloadStorage(data);
      alert('성공적으로 데이터를 불러왔습니다!');
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : '데이터 불러오기 실패');
    }
  };

  const handleExportAllICS = () => {
    exportToICS(trip.items || [], trip.title);
  };

  const handleResetAll = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    const resetData: StorageData = {
      trips: [INITIAL_SAMPLE_TRIP],
      activeId: INITIAL_SAMPLE_TRIP.id,
    };
    onReloadStorage(resetData);
    alert('모든 데이터가 초기 예시 상태로 복구되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <h2 className="text-base font-black text-[#1b4b7a]">설정 및 데이터 관리</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={jsonInputRef}
          onChange={handleJsonImport}
          accept=".json"
          className="hidden"
        />

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* 1. Trip Cover Photo */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-lg">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1c2733]">배경 사진 교체</h4>
                <p className="text-[10px] text-[#6b7a89]">헤더 영역의 대표 사진 변경</p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#1b4b7a] hover:bg-slate-50 active:scale-95 shadow-xs"
            >
              사진 선택
            </button>
          </div>

          {/* 2. Notification Permission */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1c2733]">일정 알람 권한</h4>
                <p className="text-[10px] text-[#6b7a89]">
                  상태: {notificationStatus === 'granted' ? '허용됨 ✅' : '권한 필요'}
                </p>
              </div>
            </div>
            {notificationStatus !== 'granted' ? (
              <button
                onClick={handleRequestNotification}
                className="px-3 py-1.5 rounded-xl bg-[#d9724a] text-white text-xs font-bold hover:bg-[#c8623b] active:scale-95 shadow-xs"
              >
                권한 요청
              </button>
            ) : (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 허용됨
              </span>
            )}
          </div>

          {/* Notice about alarm condition */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
            💡 <strong>알람 안내</strong>: 브라우저 환경 특성상 탭 또는 앱이 열려 있을 때 15초 주기로 일정 시각을 검사하여 소리와 알림이 울립니다.
          </div>

          {/* 3. Export Whole Trip as .ICS */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1c2733]">캘린더 내보내기 (.ics)</h4>
                <p className="text-[10px] text-[#6b7a89]">애플 캘린더/구글 캘린더 연동 파일</p>
              </div>
            </div>
            <button
              onClick={handleExportAllICS}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50 active:scale-95 shadow-xs"
            >
              다운로드
            </button>
          </div>

          {/* 4. JSON Backup & Restore */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1c2733]">데이터 백업 및 복원</h4>
                <p className="text-[10px] text-[#6b7a89]">모든 여행과 일정을 JSON 파일로 보관</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => exportAllDataAsJSON(storageData)}
                className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#1b4b7a] hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-1 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                백업 파일 저장
              </button>
              <button
                onClick={() => jsonInputRef.current?.click()}
                className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#1b4b7a] hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-1 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                백업 불러오기
              </button>
            </div>
          </div>

          {/* 5. Full Reset */}
          <div className="pt-2">
            <button
              onClick={handleResetAll}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border active:scale-95 ${
                resetConfirm
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {resetConfirm ? '한 번 더 누르면 전체 초기화됩니다' : '초기 예시 데이터로 초기화'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
