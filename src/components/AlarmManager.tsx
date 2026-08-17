import React, { useEffect, useState, useRef } from 'react';
import { Trip } from '../types';
import { playAlarmSound } from '../utils/helpers';
import { Bell, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface AlarmNotification {
  id: string;
  tripTitle: string;
  itemName: string;
  time: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

interface AlarmManagerProps {
  currentTrip: Trip;
  toast: ToastMessage | null;
  onCloseToast: () => void;
}

export const AlarmManager: React.FC<AlarmManagerProps> = ({
  currentTrip,
  toast,
  onCloseToast,
}) => {
  const [activeAlert, setActiveAlert] = useState<AlarmNotification | null>(null);
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  // 15-second interval alarm checker
  useEffect(() => {
    const checkAlarms = () => {
      if (!currentTrip || !currentTrip.items) return;

      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;

      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      currentTrip.items.forEach((item) => {
        // check if item alarm or time matches
        const targetTime = item.alarm || item.time;
        if (!targetTime) return;

        // alarm triggers on item day at targetTime
        const alarmKey = `${item.id}-${item.day}-${targetTime}`;
        if (item.day === todayStr && targetTime === currentHM) {
          if (!triggeredAlarmsRef.current.has(alarmKey)) {
            triggeredAlarmsRef.current.add(alarmKey);

            // Play sound
            playAlarmSound();

            // Show top popup
            setActiveAlert({
              id: item.id,
              tripTitle: currentTrip.title,
              itemName: item.name,
              time: targetTime,
            });

            // Browser notification if permitted
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              try {
                new Notification(`[여행 플래너] 일정 알람: ${item.name}`, {
                  body: `${targetTime} - ${currentTrip.title}\n${item.place || item.memo || ''}`,
                  icon: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=192&auto=format&fit=crop&q=80',
                });
              } catch (e) {
                console.warn('Notification error:', e);
              }
            }
          }
        }
      });
    };

    // Run immediately and every 15 seconds
    checkAlarms();
    const interval = setInterval(checkAlarms, 15000);

    return () => clearInterval(interval);
  }, [currentTrip]);

  return (
    <>
      {/* 1. Alarm Alert Banner at Top */}
      {activeAlert && (
        <div className="fixed top-4 left-4 right-4 max-w-sm mx-auto z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-[#d9724a] text-white p-4 rounded-2xl shadow-2xl border-2 border-white/40 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#d9724a] flex items-center justify-center flex-shrink-0 animate-bounce">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                  일정 알람 ({activeAlert.time})
                </span>
                <button
                  onClick={() => setActiveAlert(null)}
                  className="text-white/80 hover:text-white p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-sm font-black mt-1 truncate">{activeAlert.itemName}</h4>
              <p className="text-xs text-white/90 truncate">{activeAlert.tripTitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Toast Notifications at Bottom */}
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 max-w-xs mx-auto z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 justify-center">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-100">{toast.text}</span>
          </div>
        </div>
      )}
    </>
  );
};
