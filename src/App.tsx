import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FlightItem, StorageData, Trip, TripItem } from './types';
import { loadStorageData, saveStorageData } from './utils/storage';
import { getDatesBetween } from './utils/helpers';
import { Header } from './components/Header';
import { DateChips } from './components/DateChips';
import { ScheduleView } from './components/ScheduleView';
import { OverviewMap } from './components/OverviewMap';
import { ItemModal } from './components/Modals/ItemModal';
import { FlightModal } from './components/Modals/FlightModal';
import { TripModal } from './components/Modals/TripModal';
import { TripListModal } from './components/Modals/TripListModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { GuideModal } from './components/Modals/GuideModal';
import { AlarmManager, ToastMessage } from './components/AlarmManager';

export default function App() {
  // 1. Storage & State Management
  const [storageData, setStorageData] = useState<StorageData>(() => loadStorageData());

  const activeTrip = useMemo<Trip>(() => {
    const found = storageData.trips.find((t) => t.id === storageData.activeId);
    return found || storageData.trips[0];
  }, [storageData]);

  // Derived dates for the active trip
  const tripDates = useMemo<string[]>(() => {
    if (!activeTrip.start || !activeTrip.end) return [];
    return getDatesBetween(activeTrip.start, activeTrip.end);
  }, [activeTrip.start, activeTrip.end]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return activeTrip.start || new Date().toISOString().slice(0, 10);
  });

  // Keep selectedDate in sync when activeTrip changes
  useEffect(() => {
    if (activeTrip.start) {
      if (!tripDates.includes(selectedDate)) {
        setSelectedDate(activeTrip.start);
      }
    }
  }, [activeTrip, tripDates, selectedDate]);

  // Tab: 'schedule' or 'overview'
  const [activeTab, setActiveTab] = useState<'schedule' | 'overview'>('schedule');

  // Highlighted item card ID for animation when navigating from map
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Modals state
  const [itemModalState, setItemModalState] = useState<{
    isOpen: boolean;
    item: Partial<TripItem> | null;
  }>({ isOpen: false, item: null });

  const [flightModalState, setFlightModalState] = useState<{
    isOpen: boolean;
    flight: Partial<FlightItem> | null;
  }>({ isOpen: false, flight: null });

  const [tripModalState, setTripModalState] = useState<{
    isOpen: boolean;
    trip: Partial<Trip> | null;
  }>({ isOpen: false, trip: null });

  const [isTripListOpen, setIsTripListOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Lock background scroll when any sheet or modal is open
  const isAnyModalOpen =
    itemModalState.isOpen ||
    flightModalState.isOpen ||
    tripModalState.isOpen ||
    isTripListOpen ||
    isSettingsOpen ||
    isGuideOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isAnyModalOpen]);

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const msg: ToastMessage = { id: `toast-${Date.now()}`, text, type };
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev?.id === msg.id ? null : prev));
    }, 2800);
  }, []);

  // Save to localStorage helper
  const updateStorage = useCallback((newData: StorageData) => {
    setStorageData(newData);
    saveStorageData(newData);
  }, []);

  // 2. Trip CRUD
  const handleSaveTrip = (updatedTrip: Trip) => {
    const exists = storageData.trips.some((t) => t.id === updatedTrip.id);
    let newTrips: Trip[];
    if (exists) {
      newTrips = storageData.trips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
      showToast('여행 정보가 수정되었습니다.');
    } else {
      newTrips = [...storageData.trips, updatedTrip];
      showToast('새 여행이 생성되었습니다!');
    }
    updateStorage({
      trips: newTrips,
      activeId: updatedTrip.id,
    });
  };

  const handleDeleteTrip = (tripId: string) => {
    if (storageData.trips.length <= 1) {
      showToast('최소 1개의 여행은 유지되어야 합니다.', 'error');
      return;
    }
    const newTrips = storageData.trips.filter((t) => t.id !== tripId);
    const newActiveId = storageData.activeId === tripId ? newTrips[0].id : storageData.activeId;
    updateStorage({
      trips: newTrips,
      activeId: newActiveId,
    });
    showToast('여행이 삭제되었습니다.');
  };

  const handleSelectTrip = (tripId: string) => {
    updateStorage({
      ...storageData,
      activeId: tripId,
    });
    showToast('여행이 전환되었습니다.');
  };

  const handleUpdateCoverPhoto = (photoDataUrl: string) => {
    const updated = { ...activeTrip, coverPhoto: photoDataUrl };
    handleSaveTrip(updated);
    showToast('배경 사진이 변경되었습니다.');
  };

  // 3. Schedule Item CRUD
  const handleSaveItem = (item: TripItem) => {
    const currentItems = activeTrip.items || [];
    const exists = currentItems.some((it) => it.id === item.id);
    let newItems: TripItem[];
    if (exists) {
      newItems = currentItems.map((it) => (it.id === item.id ? item : it));
      showToast('일정이 수정되었습니다.');
    } else {
      newItems = [...currentItems, item];
      showToast('새 일정이 등록되었습니다.');
    }
    const updatedTrip: Trip = { ...activeTrip, items: newItems };
    handleSaveTrip(updatedTrip);
  };

  const handleDeleteItem = (itemId: string) => {
    const newItems = (activeTrip.items || []).filter((it) => it.id !== itemId);
    const updatedTrip: Trip = { ...activeTrip, items: newItems };
    handleSaveTrip(updatedTrip);
    showToast('일정이 삭제되었습니다.');
  };

  // 4. Flight CRUD
  const handleSaveFlight = (flight: FlightItem) => {
    const currentFlights = activeTrip.flights || [];
    const exists = currentFlights.some((f) => f.id === flight.id);
    let newFlights: FlightItem[];
    if (exists) {
      newFlights = currentFlights.map((f) => (f.id === flight.id ? flight : f));
      showToast('항공편이 수정되었습니다.');
    } else {
      newFlights = [...currentFlights, flight];
      showToast('새 항공편이 추가되었습니다.');
    }
    const updatedTrip: Trip = { ...activeTrip, flights: newFlights };
    handleSaveTrip(updatedTrip);
  };

  const handleDeleteFlight = (flightId: string) => {
    const newFlights = (activeTrip.flights || []).filter((f) => f.id !== flightId);
    const updatedTrip: Trip = { ...activeTrip, flights: newFlights };
    handleSaveTrip(updatedTrip);
    showToast('항공편이 삭제되었습니다.');
  };

  // 5. Navigate from Map Pin to Schedule Card
  const handleNavigateToCard = useCallback(
    (itemId: string) => {
      const item = (activeTrip.items || []).find((it) => it.id === itemId);
      if (item) {
        setSelectedDate(item.day);
      }
      setActiveTab('schedule');
      setHighlightedItemId(itemId);

      setTimeout(() => {
        const el = document.getElementById(`item-card-${itemId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      setTimeout(() => {
        setHighlightedItemId((prev) => (prev === itemId ? null : prev));
      }, 3000);
    },
    [activeTrip.items]
  );

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center p-0 lg:p-6 select-none overflow-x-hidden">
      {/* Alarm audio & toast dispatcher */}
      <AlarmManager
        currentTrip={activeTrip}
        toast={toast}
        onCloseToast={() => setToast(null)}
      />

      {/* Main Container: Mobile Frame on Desktop or Full Responsive */}
      <main className="w-full max-w-[1040px] lg:h-[780px] bg-white lg:rounded-[32px] shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-[#e5e9ee] min-h-screen lg:min-h-0">
        
        {/* Left / Mobile Column (390px - 440px on desktop, full width on mobile) */}
        <section
          className={`w-full lg:w-[420px] flex-shrink-0 flex flex-col bg-white border-r border-[#e5e9ee] relative ${
            activeTab === 'overview' ? 'hidden lg:flex' : 'flex'
          }`}
          style={{ height: '100%' }}
        >
          {/* Header */}
          <Header
            trip={activeTrip}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenTripList={() => setIsTripListOpen(true)}
            onOpenNewTrip={() => setTripModalState({ isOpen: true, trip: null })}
            onOpenGuide={() => setIsGuideOpen(true)}
            onUpdateCoverPhoto={handleUpdateCoverPhoto}
          />

          {/* Date Chips */}
          <DateChips
            dates={tripDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            cityList={activeTrip.cities}
          />

          {/* Schedule View */}
          <ScheduleView
            trip={activeTrip}
            selectedDate={selectedDate}
            onAddItem={(day) => setItemModalState({ isOpen: true, item: { day } })}
            onEditItem={(item) => setItemModalState({ isOpen: true, item })}
            onDeleteItem={handleDeleteItem}
            onAddFlight={() => setFlightModalState({ isOpen: true, flight: { date: selectedDate } })}
            onEditFlight={(flight) => setFlightModalState({ isOpen: true, flight })}
            onDeleteFlight={handleDeleteFlight}
            onOpenSettings={() => setIsSettingsOpen(true)}
            highlightedItemId={highlightedItemId}
          />
        </section>

        {/* Right / Map Column (Interactive overview map) */}
        <section
          className={`flex-1 flex flex-col bg-[#e3eaef] relative min-h-[500px] lg:min-h-0 ${
            activeTab === 'schedule' ? 'hidden lg:flex' : 'flex'
          }`}
          style={{ height: '100%' }}
        >
          {/* Mobile top navigation toggle if viewing map on mobile */}
          <div className="lg:hidden bg-[#1b4b7a] text-white px-4 py-3 flex items-center justify-between shadow-md safe-top z-30">
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
            >
              ← 일정 목록으로
            </button>
            <span className="font-extrabold text-sm truncate max-w-[180px]">
              {selectedDate} 오버뷰
            </span>
            <div className="w-16" />
          </div>

          <OverviewMap
            trip={activeTrip}
            selectedDate={selectedDate}
            onNavigateToCard={handleNavigateToCard}
          />
        </section>
      </main>

      {/* Modals & Bottom Sheets */}
      {itemModalState.isOpen && (
        <ItemModal
          item={itemModalState.item}
          defaultDay={selectedDate}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
          onClose={() => setItemModalState({ isOpen: false, item: null })}
        />
      )}

      {flightModalState.isOpen && (
        <FlightModal
          flight={flightModalState.flight}
          defaultDate={selectedDate}
          onSave={handleSaveFlight}
          onDelete={handleDeleteFlight}
          onClose={() => setFlightModalState({ isOpen: false, flight: null })}
        />
      )}

      {tripModalState.isOpen && (
        <TripModal
          trip={tripModalState.trip}
          onSave={handleSaveTrip}
          onDelete={handleDeleteTrip}
          onClose={() => setTripModalState({ isOpen: false, trip: null })}
          isOnlyTrip={storageData.trips.length <= 1}
        />
      )}

      {isTripListOpen && (
        <TripListModal
          trips={storageData.trips}
          activeId={storageData.activeId}
          onSelectTrip={handleSelectTrip}
          onEditTrip={(trip) => setTripModalState({ isOpen: true, trip })}
          onDeleteTrip={handleDeleteTrip}
          onNewTrip={() => setTripModalState({ isOpen: true, trip: null })}
          onClose={() => setIsTripListOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          trip={activeTrip}
          storageData={storageData}
          onUpdateTrip={handleSaveTrip}
          onReloadStorage={updateStorage}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}
    </div>
  );
}
