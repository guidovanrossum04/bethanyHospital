import React, { useState } from 'react';
import { RoomFacility, Patient } from '../../types';
import { dataStoreService } from '../../services/data-store.service';
import { ScreenId } from '../common/Sidebar';

interface FacilityManagementViewProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectPatient: (patientId: string) => void;
  onShowToast: (msg: string) => void;
}

export const FacilityManagementView: React.FC<FacilityManagementViewProps> = ({
  onNavigate,
  onSelectPatient,
  onShowToast,
}) => {
  const [rooms, setRooms] = useState<RoomFacility[]>(dataStoreService.getRooms());
  const [patients] = useState<Patient[]>(dataStoreService.getPatients());

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'AC' | 'NON_AC' | 'AVAILABLE' | 'OCCUPIED'>('ALL');
  const [wingFilter, setWingFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoomForAssign, setSelectedRoomForAssign] = useState<RoomFacility | null>(null);
  const [assignPatientId, setAssignPatientId] = useState(patients[0]?.id || 'BNC-1042');
  const [assignDays, setAssignDays] = useState(7);

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [sourceRoom, setSourceRoom] = useState<RoomFacility | null>(null);
  const [targetRoomId, setTargetRoomId] = useState('');

  const refreshRooms = () => {
    setRooms(dataStoreService.getRooms());
  };

  const handleOpenAssignModal = (room: RoomFacility) => {
    setSelectedRoomForAssign(room);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForAssign) return;

    const patient = patients.find((p) => p.id === assignPatientId) || patients[0];
    dataStoreService.assignPatientToRoom(
      selectedRoomForAssign.id,
      patient.id,
      patient.name,
      patient.primaryPhysician,
      assignDays
    );

    refreshRooms();
    setShowAssignModal(false);
    onShowToast(`Patient ${patient.name} assigned to ${selectedRoomForAssign.shortName}`);
  };

  const handleMarkReady = (room: RoomFacility) => {
    dataStoreService.markRoomReady(room.id);
    refreshRooms();
    onShowToast(`${room.shortName} marked Available for admission.`);
  };

  const handleDischarge = (room: RoomFacility) => {
    if (confirm(`Discharge patient from ${room.shortName} and initiate Herbal Fumigation sanitization?`)) {
      dataStoreService.dischargeRoom(room.id);
      refreshRooms();
      onShowToast(`${room.shortName} vacated. Initiated Herbal Fumigation Protocol.`);
    }
  };

  const handleOpenShiftModal = (room: RoomFacility) => {
    setSourceRoom(room);
    const available = rooms.filter((r) => r.status === 'Available' && r.id !== room.id);
    setTargetRoomId(available[0]?.id || '');
    setShowShiftModal(true);
  };

  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceRoom || !targetRoomId) return;

    const target = rooms.find((r) => r.id === targetRoomId);
    if (!target || !sourceRoom.currentOccupant) return;

    // Reassign to target
    dataStoreService.assignPatientToRoom(
      target.id,
      sourceRoom.currentOccupant.patientId,
      sourceRoom.currentOccupant.patientName,
      sourceRoom.currentOccupant.physician
    );

    // Free source room for sanitization
    dataStoreService.dischargeRoom(sourceRoom.id);

    refreshRooms();
    setShowShiftModal(false);
    onShowToast(`Patient shifted to ${target.shortName}. Source room scheduled for fumigation.`);
  };

  // Filter application
  const filteredRooms = rooms.filter((room) => {
    if (wingFilter !== 'ALL') {
      if (!room.wing.includes(wingFilter) && !room.floor.includes(wingFilter)) return false;
    }
    if (categoryFilter === 'AC') return room.type === 'AC';
    if (categoryFilter === 'NON_AC') return room.type === 'Non-AC';
    if (categoryFilter === 'AVAILABLE') return room.status === 'Available';
    if (categoryFilter === 'OCCUPIED') return room.status === 'Occupied';
    return true;
  });

  const acRooms = filteredRooms.filter((r) => r.type === 'AC');
  const nonAcRooms = filteredRooms.filter((r) => r.type === 'Non-AC');

  const totalBeds = 42;
  const availableBeds = rooms.filter((r) => r.status === 'Available').length + 29; // scaled for total campus
  const occupiedBeds = totalBeds - availableBeds;
  const sanitizingBeds = rooms.filter((r) => r.status === 'Sanitizing').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>Inpatient &amp; Wellness Suites</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-semibold">Facilities Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
            Room &amp; Bed Availability
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Monitor live room occupancy, bed availability, and tariffs across AC and Non-AC holistic care
            cottages &amp; suites.
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => {
              refreshRooms();
              onShowToast('Facilities status synchronized.');
            }}
            className="md-btn md-btn-elevated flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-lg text-secondary">refresh</span>
            <span>Refresh Status</span>
          </button>
          <button
            onClick={() => {
              onShowToast('Discharge Summary Registry generated.');
            }}
            className="md-btn md-btn-tonal flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-lg">summarize</span>
            <span>Discharge Summary</span>
          </button>
          <button
            onClick={() => {
              const firstAvail = rooms.find((r) => r.status === 'Available');
              if (firstAvail) handleOpenAssignModal(firstAvail);
            }}
            className="md-btn md-btn-filled flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-lg">hotel</span>
            <span>Book Room / Bed</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Rooms / Beds */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Rooms / Beds
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">bedroom_parent</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">{totalBeds}</span>
            <span className="text-xs text-slate-500 font-medium">Beds</span>
          </div>
          <div className="mt-3 flex items-center gap-3 pt-3 bg-emerald-50/50 rounded-xl px-3 py-2 text-xs border border-emerald-100/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="font-semibold text-emerald-950 tabular-nums">{availableBeds} Available</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-600 tabular-nums">{occupiedBeds} Occupied</span>
            </div>
          </div>
        </div>

        {/* Metric 2: AC Suites */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AC Suites &amp; Deluxe
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">mode_fan</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-900 tracking-tight font-mono tabular-nums">18</span>
            <span className="text-xs text-slate-500 font-medium">Beds</span>
          </div>
          <div className="mt-3 flex items-center gap-3 pt-3 bg-teal-50/50 rounded-xl px-3 py-2 text-xs border border-teal-100/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="font-semibold text-slate-800 tabular-nums">12 Available</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="text-slate-600 tabular-nums">6 Occupied</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Non-AC Cottages */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              NON-AC ROOMS
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">cottage</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">24</span>
            <span className="text-xs text-slate-500 font-medium">Beds</span>
          </div>
          <div className="mt-3 flex items-center gap-3 pt-3 bg-amber-50/40 rounded-xl px-3 py-2 text-xs border border-amber-100/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="font-semibold text-slate-800 tabular-nums">20 Available</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-600 tabular-nums">4 Occupied</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Sanitization / Maintenance */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sanitization &amp; Maint.
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">sanitizer</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-900 tracking-tight font-mono tabular-nums">
              {sanitizingBeds || 2}
            </span>
            <span className="text-xs text-slate-500 font-medium">Beds</span>
          </div>
          <div className="mt-3 flex items-center gap-2 pt-3 bg-purple-50/40 rounded-xl px-3 py-2 text-xs border border-purple-100/60">
            <span className="material-symbols-outlined text-sm text-purple-700">schedule</span>
            <span className="text-slate-600">Fumigation protocol active</span>
          </div>
        </div>
      </div>

      {/* Filter & View Controls Bar */}
      <div className="md-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Rooms (42)
          </button>
          <button
            onClick={() => setCategoryFilter('AC')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === 'AC'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            AC Deluxe &amp; Suites (18)
          </button>
          <button
            onClick={() => setCategoryFilter('NON_AC')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === 'NON_AC'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Non-AC Rooms (24)
          </button>
          <button
            onClick={() => setCategoryFilter('AVAILABLE')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              categoryFilter === 'AVAILABLE'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Available Only (32)</span>
          </button>
          <button
            onClick={() => setCategoryFilter('OCCUPIED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === 'OCCUPIED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Occupied (10)
          </button>
        </div>

        {/* Wings and Floors Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-lg text-emerald-700">domain</span>
            <select
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-4"
            >
              <option value="ALL">All Wings &amp; Floors</option>
              <option value="Ground Floor">Ground Floor - Herbal Garden View</option>
              <option value="First Floor">First Floor - Ayurvedic Healing Wing</option>
              <option value="Eco-Zone">Eco-Zone Cottages</option>
            </select>
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-lg">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER LIST VIEW TABLE IF SELECTED */}
      {viewMode === 'list' ? (
        <div className="md-card overflow-hidden">
          <div className="md-card-header">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">view_list</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Room &amp; Bed Directory</h3>
                <p className="text-xs text-slate-500">Live occupancy register with tariffs and assignment controls</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
              {filteredRooms.length} Rooms Listed
            </span>
          </div>

          <div className="md-table-container">
            <table className="md-table">
              <thead>
                <tr>
                  <th>Room / Wing</th>
                  <th>Type &amp; Specs</th>
                  <th>Occupancy Status</th>
                  <th>Current Occupant / Note</th>
                  <th>Tariff Rate</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => {
                  const isAvailable = room.status === 'Available';
                  const isOccupied = room.status === 'Occupied';
                  const isSanitizing = room.status === 'Sanitizing';

                  return (
                    <tr key={room.id}>
                      <td>
                        <div className="font-bold text-slate-900 text-sm">{room.name}</div>
                        <div className="text-slate-500 text-xs font-mono">{room.wing} • {room.floor}</div>
                      </td>
                      <td>
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          room.type === 'AC' ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {room.type} Suite
                        </span>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">
                          {room.features.slice(0, 2).join(', ')}
                        </div>
                      </td>
                      <td>
                        {isAvailable && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Available
                          </span>
                        )}
                        {isOccupied && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Occupied
                          </span>
                        )}
                        {isSanitizing && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                            Sanitizing
                          </span>
                        )}
                      </td>
                      <td>
                        {isOccupied && room.currentOccupant ? (
                          <div>
                            <div className="font-semibold text-slate-900 text-xs">{room.currentOccupant.patientName}</div>
                            <div className="text-slate-500 text-[11px] font-mono">
                              {room.currentOccupant.patientId} • {room.currentOccupant.stayProgress}
                            </div>
                          </div>
                        ) : isSanitizing && room.sanitization ? (
                          <div className="text-xs text-amber-900">
                            <span className="font-semibold">{room.sanitization.protocol}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Ready for immediate intake</span>
                        )}
                      </td>
                      <td>
                        <div className="font-extrabold text-emerald-900 font-mono tabular-nums text-sm">
                          ₹{room.tariffPerDay.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500"> / day</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{room.tariffNote}</div>
                      </td>
                      <td className="text-right">
                        {isAvailable && (
                          <button
                            onClick={() => handleOpenAssignModal(room)}
                            className="md-btn md-btn-filled py-1.5 px-3 text-xs"
                          >
                            <span className="material-symbols-outlined text-base">person_add</span>
                            <span>Assign</span>
                          </button>
                        )}
                        {isOccupied && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                if (room.currentOccupant) {
                                  onSelectPatient(room.currentOccupant.patientId);
                                  onNavigate('patient-consultation');
                                }
                              }}
                              className="md-btn md-btn-outlined py-1 px-2.5 text-xs"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => handleOpenShiftModal(room)}
                              className="md-btn md-btn-tonal py-1 px-2.5 text-xs"
                            >
                              Shift
                            </button>
                          </div>
                        )}
                        {isSanitizing && (
                          <button
                            onClick={() => handleMarkReady(room)}
                            className="md-btn md-btn-tonal py-1.5 px-3 text-xs"
                          >
                            Mark Ready
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-6">
          {/* SECTION A: AC Deluxe Suites */}
          {acRooms.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">ac_unit</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Air-Conditioned Suites &amp; Deluxe Rooms</h2>
                    <p className="text-xs text-slate-500">
                      Climate-regulated therapeutic suites with private courtyards and dedicated nurse stations
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  12 Vacant / 6 Occupied
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {acRooms.map((room) => renderRoomCard(room))}
              </div>
            </div>
          )}

          {/* SECTION B: Non-AC Rooms */}
          {nonAcRooms.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-800 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">nature</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Non-AC Rooms</h2>
                    <p className="text-xs text-slate-500">
                      Natural cross-ventilation, terracotta tile roofs, surrounded by Tulsi and aromatic medicinal
                      flora
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  20 Vacant / 4 Occupied
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {nonAcRooms.map((room) => renderRoomCard(room))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ASSIGN PATIENT TO ROOM */}
      {showAssignModal && selectedRoomForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sage-wash mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">hotel</span>
                <h3 className="font-bold text-forest-deep text-base">
                  Assign Patient to {selectedRoomForAssign.shortName}
                </h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-forest-deep mb-1">Select Patient</label>
                <select
                  value={assignPatientId}
                  onChange={(e) => setAssignPatientId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-surface border border-sage-wash text-on-surface"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) · {p.dosha.primary}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-forest-deep mb-1">Therapy Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={assignDays}
                  onChange={(e) => setAssignDays(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                />
              </div>

              <div className="p-3 bg-sun-warmth/60 rounded-lg border border-bark-brown/20">
                <span className="font-bold text-bark-brown block">Tariff: ₹{selectedRoomForAssign.tariffPerDay} / day</span>
                <span className="text-on-surface-variant">{selectedRoomForAssign.tariffNote}</span>
              </div>

              <div className="pt-3 border-t border-sage-wash flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-sage-wash hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold rounded-lg bg-primary text-white hover:bg-primary-container cursor-pointer"
                >
                  Confirm Room Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHIFT BED */}
      {showShiftModal && sourceRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sage-wash mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">swap_horiz</span>
                <h3 className="font-bold text-forest-deep text-base">
                  Shift Bed - {sourceRoom.currentOccupant?.patientName}
                </h3>
              </div>
              <button
                onClick={() => setShowShiftModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleShiftSubmit} className="space-y-4 text-xs">
              <p className="text-on-surface-variant">
                Transfer patient from <strong>{sourceRoom.shortName}</strong> to an available suite.
              </p>

              <div>
                <label className="block font-semibold text-forest-deep mb-1">Target Available Room</label>
                <select
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-surface border border-sage-wash"
                >
                  {rooms
                    .filter((r) => r.status === 'Available')
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.shortName} ({r.type}) - ₹{r.tariffPerDay}/day
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-3 border-t border-sage-wash flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-sage-wash hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold rounded-lg bg-secondary text-white hover:bg-secondary/90 cursor-pointer"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderRoomCard(room: RoomFacility) {
    const isAvailable = room.status === 'Available';
    const isOccupied = room.status === 'Occupied';
    const isSanitizing = room.status === 'Sanitizing';

    return (
      <div
        key={room.id}
        className="md-card md-card-interactive flex flex-col justify-between overflow-hidden"
      >
        <div>
          {/* Header strip */}
          <div
            className={`px-5 py-3.5 flex items-center justify-between border-b ${
              isSanitizing
                ? 'bg-purple-50/60 border-purple-100'
                : isOccupied
                ? 'bg-slate-50 border-slate-200'
                : 'bg-emerald-50/50 border-emerald-100/60'
            }`}
          >
            <div>
              <span
                className={`text-xs uppercase tracking-wider font-semibold block ${
                  isSanitizing
                    ? 'text-purple-700'
                    : isOccupied
                    ? 'text-slate-500'
                    : 'text-emerald-800'
                }`}
              >
                {room.wing} • {room.floor}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{room.name}</h3>
            </div>

            {isAvailable && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Available
              </span>
            )}
            {isOccupied && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                Occupied
              </span>
            )}
            {isSanitizing && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                Sanitizing
              </span>
            )}
          </div>

          {/* Graphic Bed Canvas & Specs */}
          <div className="p-5 space-y-4">
            {/* Bed Vector Graphic Canvas */}
            <div className="h-28 bg-slate-50 rounded-xl flex items-center justify-center p-3 relative overflow-hidden border border-slate-100">
              {isSanitizing ? (
                <svg
                  className="h-20 w-auto text-purple-600"
                  fill="none"
                  viewBox="0 0 120 70"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect fill="#6f3800" height="46" opacity="0.7" rx="3" width="8" x="8" y="14" />
                  <rect fill="#ffffff" height="30" rx="4" stroke="#ffb781" strokeWidth="2" width="88" x="16" y="24" />
                  <rect fill="#ffdcc4" height="22" opacity="0.4" rx="3" width="78" x="22" y="28" />
                  <circle cx="60" cy="38" fill="#ea9147" opacity="0.15" r="14" />
                  <path d="M60 30L62 36L68 38L62 40L60 46L58 40L52 38L58 36L60 30Z" fill="#ea9147" />
                  <rect fill="#6f3800" height="10" opacity="0.7" rx="1" width="4" x="18" y="54" />
                  <rect fill="#6f3800" height="10" opacity="0.7" rx="1" width="4" x="98" y="54" />
                </svg>
              ) : isOccupied ? (
                <svg
                  className="h-20 w-auto text-slate-400"
                  fill="none"
                  viewBox="0 0 120 70"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect fill="#717973" height="46" rx="3" width="8" x="8" y="14" />
                  <rect fill="#e2e3df" height="30" rx="4" stroke="#c1c8c2" strokeWidth="2" width="88" x="16" y="24" />
                  <rect fill="#f3f4f0" height="22" rx="3" width="78" x="22" y="28" />
                  <rect fill="#a5d0b9" height="22" opacity="0.5" rx="3" width="64" x="36" y="28" />
                  <rect fill="#c1c8c2" height="16" rx="2" width="16" x="24" y="31" />
                  <rect fill="#717973" height="24" opacity="0.6" rx="2" width="10" x="106" y="32" />
                  <line stroke="#717973" strokeWidth="1.5" x1="112" x2="112" y1="12" y2="32" />
                  <circle cx="112" cy="12" fill="#717973" r="3" />
                  <rect fill="#717973" height="10" rx="1" width="4" x="18" y="54" />
                  <rect fill="#717973" height="10" rx="1" width="4" x="98" y="54" />
                </svg>
              ) : (
                <svg
                  className="h-20 w-auto text-emerald-600"
                  fill="none"
                  viewBox="0 0 120 70"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect fill="#1b4332" height="46" rx="3" width="8" x="8" y="14" />
                  <rect fill="#edeeea" height="30" rx="4" stroke="#c1c8c2" strokeWidth="2" width="88" x="16" y="24" />
                  <rect fill="#ffffff" height="22" rx="3" width="78" x="22" y="28" />
                  <rect fill="#b0f1cc" height="22" opacity="0.65" rx="3" width="48" x="52" y="28" />
                  <rect fill="#d8e2dc" height="16" rx="2" width="16" x="24" y="31" />
                  <rect fill="#ffffff" height="12" rx="2" width="14" x="24" y="33" />
                  <rect fill="#606C38" height="24" opacity="0.8" rx="2" width="10" x="106" y="32" />
                  <circle cx="111" cy="40" fill="#FEFAE0" r="1.5" />
                  <rect fill="#1b4332" height="10" rx="1" width="4" x="18" y="54" />
                  <rect fill="#1b4332" height="10" rx="1" width="4" x="98" y="54" />
                </svg>
              )}
            </div>

            {/* Occupant or Sanitization Notice Card */}
            {isOccupied && room.currentOccupant && (
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    {room.currentOccupant.initials}
                  </span>
                  <div>
                    <span className="text-xs text-slate-900 block leading-tight font-semibold">
                      {room.currentOccupant.patientName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ID: {room.currentOccupant.patientId} • {room.currentOccupant.physician}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                  {room.currentOccupant.stayProgress}
                </span>
              </div>
            )}

            {isSanitizing && room.sanitization && (
              <div className="bg-purple-50/70 rounded-xl p-3 flex items-center gap-3 border border-purple-100">
                <span className="material-symbols-outlined text-purple-700 text-lg">
                  cleaning_services
                </span>
                <div>
                  <p className="text-xs text-purple-950 font-semibold">{room.sanitization.protocol}</p>
                  <p className="text-[11px] text-purple-800">{room.sanitization.description}</p>
                </div>
              </div>
            )}

            {/* Features tags */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              {room.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-600">check</span>
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tariff & Action Footer */}
        <div className="p-5 pt-0">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-4 border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 block">Tariff Rate</span>
              <span className="text-lg font-bold text-emerald-950 font-mono tabular-nums">
                ₹{room.tariffPerDay.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500 font-sans">/ day</span>
              </span>
            </div>
            <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md font-semibold">
              {room.tariffNote}
            </span>
          </div>

          {isAvailable && (
            <button
              onClick={() => handleOpenAssignModal(room)}
              className="md-btn md-btn-filled w-full"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Assign Patient</span>
            </button>
          )}

          {isOccupied && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (room.currentOccupant) {
                    onSelectPatient(room.currentOccupant.patientId);
                    onNavigate('patient-consultation');
                  }
                }}
                className="md-btn md-btn-outlined py-1.5 px-2 text-xs"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                <span className="truncate">Profile</span>
              </button>
              <button
                onClick={() => handleOpenShiftModal(room)}
                className="md-btn md-btn-tonal py-1.5 px-2 text-xs"
              >
                <span className="material-symbols-outlined text-base">swap_horiz</span>
                <span className="truncate">Shift Bed</span>
              </button>
            </div>
          )}

          {isSanitizing && (
            <button
              onClick={() => handleMarkReady(room)}
              className="md-btn md-btn-tonal w-full"
            >
              <span className="material-symbols-outlined text-base">task_alt</span>
              <span>Mark Ready for Admission</span>
            </button>
          )}
        </div>
      </div>
    );
  }
};
