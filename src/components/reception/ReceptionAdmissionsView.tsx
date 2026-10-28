import React, { useState, useEffect } from 'react';
import { Patient, FacilityRoom } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

interface ReceptionAdmissionsViewProps {
  onShowToast: (msg: string) => void;
}

export const ReceptionAdmissionsView: React.FC<ReceptionAdmissionsViewProps> = ({ onShowToast }) => {
  const [admissionRequests, setAdmissionRequests] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<FacilityRoom[]>([]);
  const [selectedPatientForRoom, setSelectedPatientForRoom] = useState<Patient | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [admittedPatients, setAdmittedPatients] = useState<Patient[]>([]);

  const loadData = () => {
    setAdmissionRequests(dataStoreService.getAdmissionRequests());
    setRooms(dataStoreService.getRooms());
    setAdmittedPatients(dataStoreService.getAdmittedPatients());
  };

  useEffect(() => {
    loadData();
    const unsub = dataStoreService.subscribe(loadData);
    return unsub;
  }, []);

  const handleOpenAssignModal = (patient: Patient) => {
    setSelectedPatientForRoom(patient);
    const available = rooms.filter((r) => r.status === 'Available');
    if (available.length > 0) {
      setSelectedRoomId(available[0].id);
    }
  };

  const handleConfirmRoomAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForRoom || !selectedRoomId) return;

    dataStoreService.assignPatientToRoom(selectedRoomId, selectedPatientForRoom.id);
    loadData();
    const room = rooms.find((r) => r.id === selectedRoomId);
    onShowToast(`Patient ${selectedPatientForRoom.name} successfully admitted to ${room?.name || 'Room'}!`);
    setSelectedPatientForRoom(null);
  };

  const availableRooms = rooms.filter((r) => r.status === 'Available');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">meeting_room</span>
            <span>Reception Desk &bull; Admissions &amp; Bed Allocation</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Doctor Admission Requests &amp; Room Assignment
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            When attending doctors recommend inpatient Panchakarma or clinical residency, allocate available herbal cottages or suite beds here.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-bold text-amber-950">
              {admissionRequests.length} Pending Doctor Admissions
            </span>
          </div>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-700">hotel</span>
            <span className="text-xs font-bold text-emerald-950">
              {availableRooms.length} Available Rooms
            </span>
          </div>
        </div>
      </div>

      {/* Doctor Admission Requests Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600">notification_important</span>
            Pending Doctor Admission Referrals ({admissionRequests.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Requires Receptionist Room Assignment
          </span>
        </div>

        {admissionRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500">
            <span className="material-symbols-outlined text-[40px] text-emerald-300">check_circle</span>
            <p className="text-sm font-bold text-slate-700 mt-1">All admission requests assigned</p>
            <p className="text-xs text-slate-500">No doctor referrals currently waiting for room assignment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admissionRequests.map((patient) => (
              <div
                key={patient.id}
                className="bg-white p-5 rounded-3xl border-2 border-amber-300 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase">
                      Admission Recommended
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{patient.id}</span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center shrink-0">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{patient.name}</h3>
                      <p className="text-xs text-slate-500">{patient.age}y &bull; {patient.gender} &bull; Blood: {patient.bloodGroup}</p>
                      <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                        Attending: {patient.primaryPhysician}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Admission Note */}
                  <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs">
                    <span className="text-[10px] font-bold text-amber-900 uppercase block">Doctor Recommendation Note</span>
                    <p className="text-slate-800 font-medium mt-0.5">
                      {patient.admissionRecommendationNote || 'Physician advises inpatient detox and panchakarma care.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenAssignModal(patient)}
                    className="md-btn-filled py-2 px-3 text-xs w-full flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
                  >
                    <span className="material-symbols-outlined text-[16px]">hotel</span>
                    <span>Assign Room &amp; Admit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currently Occupied / Admitted Patients Overview */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-700">hotel</span>
          Currently Admitted Inpatients ({admittedPatients.length})
        </h2>

        <div className="md-table-container">
          <table className="md-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Assigned Room / Bed</th>
                <th>Care Mode &amp; Program</th>
                <th>Primary Physician</th>
                <th>Admit Date</th>
                <th>Discharge Status</th>
              </tr>
            </thead>
            <tbody>
              {admittedPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No active inpatients in facility rooms.
                  </td>
                </tr>
              ) : (
                admittedPatients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                        <p className="text-[11px] text-slate-500">ID: {p.id} &bull; {p.age}y/{p.gender}</p>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                        {p.assignedRoomName || 'Room'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-800">{p.activeProgram || 'Panchakarma Protocol'}</span>
                      <p className="text-[11px] text-slate-500">{p.programDuration || 'In Progress'}</p>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-slate-800">{p.primaryPhysician}</span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600">{p.registrationDate}</span>
                    </td>
                    <td>
                      {p.dischargeRecommended ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                          Discharge Cleared by Doctor
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase">
                          Active Inpatient
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Assignment Modal */}
      {selectedPatientForRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">meeting_room</span>
                <div>
                  <h3 className="font-black text-base">Assign Room &amp; Admit Patient</h3>
                  <p className="text-xs text-emerald-200">{selectedPatientForRoom.name} ({selectedPatientForRoom.id})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientForRoom(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmRoomAssignment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block">Doctor Admission Request:</span>
                <p className="text-slate-600 mt-1 italic">
                  &ldquo;{selectedPatientForRoom.admissionRecommendationNote || 'Physician advises inpatient stay.'}&rdquo;
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Available Facility Room / Cottage:
                </label>
                {availableRooms.length === 0 ? (
                  <p className="text-xs text-red-600 font-bold p-3 bg-red-50 rounded-xl">
                    No rooms currently available! Please wait for sanitation or discharge.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {availableRooms.map((room) => (
                      <label
                        key={room.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedRoomId === room.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="roomSelect"
                            value={room.id}
                            checked={selectedRoomId === room.id}
                            onChange={() => setSelectedRoomId(room.id)}
                            className="text-emerald-800"
                          />
                          <div>
                            <span className="block">{room.name} ({room.roomNumber})</span>
                            <span className="text-[11px] text-slate-500 font-normal">
                              {room.wing} &bull; {room.type}
                            </span>
                          </div>
                        </div>
                        <span className="text-emerald-900 font-extrabold">₹{room.tariffPerDay}/day</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForRoom(null)}
                  className="md-btn-outlined py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableRooms.length === 0}
                  className="md-btn-filled py-2 px-6 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-black disabled:opacity-50"
                >
                  Confirm Bed Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
