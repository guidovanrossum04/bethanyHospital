import React, { useState, useEffect } from 'react';
import { DoctorProfile, ReceptionistProfile, FacilityRoom } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

interface AdminStaffViewProps {
  onShowToast: (msg: string) => void;
}

export const AdminStaffView: React.FC<AdminStaffViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'receptionists' | 'rooms'>('doctors');

  // Lists
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [receptionists, setReceptionists] = useState<ReceptionistProfile[]>([]);
  const [rooms, setRooms] = useState<FacilityRoom[]>([]);

  // Modals for adding
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddReceptionistModal, setShowAddReceptionistModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // Doctor Form Fields
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('Panchakarma & Detox Therapy');
  const [docQualification, setDocQualification] = useState('BAMS, MD (Ayu)');
  const [docRegNumber, setDocRegNumber] = useState('');
  const [docRoomNumber, setDocRoomNumber] = useState('Consulting Suite 104');
  const [docSchedule, setDocSchedule] = useState('Mon - Sat (09:00 - 17:00)');
  const [docFee, setDocFee] = useState(800);

  // Receptionist Form Fields
  const [recName, setRecName] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPhone, setRecPhone] = useState('+91 98');
  const [recDesk, setRecDesk] = useState('Counter 2 (Inpatient Admissions)');
  const [recShift, setRecShift] = useState('Morning Shift (08:00 - 16:00)');

  // Room Form Fields
  const [roomNumber, setRoomNumber] = useState('105');
  const [roomName, setRoomName] = useState('Sandalwood Cottage');
  const [roomWing, setRoomWing] = useState('Kapha Serenity Wing');
  const [roomType, setRoomType] = useState<'Deluxe Panchakarma Cottage' | 'Premium Herbal Suite' | 'General Detox Ward' | 'Ayurvedic Treatment Chamber'>('Deluxe Panchakarma Cottage');
  const [roomTariff, setRoomTariff] = useState(4200);
  const [roomAmenities, setRoomAmenities] = useState('Herbal steam box, Wooden Droni bed, En-suite bath, Garden patio');
  const [roomCareStaff, setRoomCareStaff] = useState('Nurse Priya & Therapist Arun');

  const loadData = () => {
    setDoctors(dataStoreService.getDoctors());
    setReceptionists(dataStoreService.getReceptionists());
    setRooms(dataStoreService.getRooms());
  };

  useEffect(() => {
    loadData();
    const unsub = dataStoreService.subscribe(loadData);
    return unsub;
  }, []);

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    dataStoreService.addDoctor({
      name: docName.startsWith('Dr.') ? docName.trim() : `Dr. ${docName.trim()}`,
      specialization: docSpecialization,
      department: docSpecialization,
      qualification: docQualification,
      regNumber: docRegNumber || `AYU-MH-${Math.floor(1000 + Math.random() * 9000)}`,
      roomNumber: docRoomNumber,
      opdSchedule: docSchedule,
      consultationFee: Number(docFee) || 800,
      phone: '+91 98450 ' + Math.floor(10000 + Math.random() * 90000),
      email: `${docName.toLowerCase().replace(/[^a-z]/g, '')}@bethanynaturecare.org`,
    });

    loadData();
    onShowToast(`Doctor ${docName} successfully onboarded to clinic roster!`);
    setShowAddDoctorModal(false);
    setDocName('');
  };

  const handleAddReceptionistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recName.trim()) return;

    dataStoreService.addReceptionist({
      name: recName.trim(),
      email: recEmail.trim() || `${recName.toLowerCase().replace(/\s+/g, '.')}@bethanynaturecare.org`,
      phone: recPhone,
      deskStation: recDesk,
      deskNumber: recDesk,
      shift: recShift as any,
      status: 'ON_DUTY',
    });

    loadData();
    onShowToast(`Receptionist ${recName} successfully registered!`);
    setShowAddReceptionistModal(false);
    setRecName('');
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    dataStoreService.addRoom({
      roomNumber,
      name: roomName.trim(),
      wing: roomWing,
      type: 'AC',
      category: 'Cottage',
      tariffPerDay: Number(roomTariff) || 3500,
      amenities: roomAmenities.split(',').map((s) => s.trim()).filter(Boolean),
      careStaffAssigned: roomCareStaff,
      floor: 'Ground Floor',
    });

    loadData();
    onShowToast(`Facility Room ${roomName} (${roomNumber}) successfully created!`);
    setShowAddRoomModal(false);
    setRoomName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">domain_add</span>
            <span>Administrative Infrastructure</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Facilities, Doctors &amp; Receptionist Staff
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Configure clinic capacity, onboard practicing Ayurvedic physicians, assign front-desk staff, and establish room tariffs.
          </p>
        </div>

        {/* Add Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'doctors' && (
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="md-btn-filled py-2 px-4 text-xs font-bold bg-emerald-800 text-white flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Add Doctor</span>
            </button>
          )}
          {activeTab === 'receptionists' && (
            <button
              onClick={() => setShowAddReceptionistModal(true)}
              className="md-btn-filled py-2 px-4 text-xs font-bold bg-emerald-800 text-white flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Add Receptionist</span>
            </button>
          )}
          {activeTab === 'rooms' && (
            <button
              onClick={() => setShowAddRoomModal(true)}
              className="md-btn-filled py-2 px-4 text-xs font-bold bg-emerald-800 text-white flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_home</span>
              <span>Add Room &amp; Facility</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/70">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'doctors'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">stethoscope</span>
          <span>Doctors ({doctors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('receptionists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'receptionists'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">desk</span>
          <span>Receptionists ({receptionists.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rooms'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">hotel</span>
          <span>Rooms &amp; Facilities ({rooms.length})</span>
        </button>
      </div>

      {/* TAB 1: DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">
              Active Medical Faculty &amp; Specialists
            </h2>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="md-btn-tonal py-1.5 px-3 text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>New Physician</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <div key={doc.id} className="md-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px] uppercase">
                      Physician
                    </span>
                    <span className="text-xs font-bold text-slate-500">Reg: {doc.regNumber}</span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-900 text-white font-black text-base flex items-center justify-center shrink-0">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{doc.name}</h3>
                      <p className="text-xs text-emerald-800 font-bold">{doc.specialization}</p>
                      <p className="text-xs text-slate-500">{doc.qualification}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chamber:</span>
                      <span className="font-bold text-slate-800">{doc.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">OPD Timings:</span>
                      <span className="font-bold text-slate-800">{doc.opdSchedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">OPD Fee:</span>
                      <span className="font-extrabold text-emerald-900">₹{doc.consultationFee}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Active Patients: <b className="text-slate-800">{doc.activePatientsCount}</b></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RECEPTIONISTS */}
      {activeTab === 'receptionists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">
              Front-Desk Billing &amp; Admission Staff
            </h2>
            <button
              onClick={() => setShowAddReceptionistModal(true)}
              className="md-btn-tonal py-1.5 px-3 text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>New Receptionist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {receptionists.map((rec) => (
              <div key={rec.id} className="md-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-black text-[10px] uppercase">
                      Front-Desk
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                      {rec.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white font-black text-base flex items-center justify-center shrink-0">
                      {rec.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{rec.name}</h3>
                      <p className="text-xs text-blue-900 font-bold">{rec.deskNumber}</p>
                      <p className="text-xs text-slate-500">{rec.shift}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-medium text-slate-800">{rec.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contact:</span>
                      <span className="font-bold text-slate-800">{rec.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <span>Authorized for Billing &amp; Discounts</span>
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ROOMS & FACILITIES */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">
              Facility Rooms &amp; Panchakarma Cottages
            </h2>
            <button
              onClick={() => setShowAddRoomModal(true)}
              className="md-btn-tonal py-1.5 px-3 text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>New Room</span>
            </button>
          </div>

          <div className="md-table-container">
            <table className="md-table">
              <thead>
                <tr>
                  <th>Room / Cottage</th>
                  <th>Wing &amp; Type</th>
                  <th>Tariff / Day</th>
                  <th>Status</th>
                  <th>Amenities</th>
                  <th>Assigned Care Staff</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <div>
                        <span className="font-black text-slate-900 text-xs">{room.name}</span>
                        <p className="text-[11px] font-mono text-slate-500">#{room.roomNumber}</p>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-slate-800">{room.wing}</span>
                      <p className="text-[11px] text-emerald-800">{room.type}</p>
                    </td>
                    <td>
                      <span className="font-black text-emerald-950 text-xs">₹{room.tariffPerDay}</span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${
                          room.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : room.status === 'Occupied'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-blue-50 text-blue-900 border-blue-300'
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(room.amenities || room.features || []).map((am: string, idx: number) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {am}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-700 font-medium">{room.careStaffAssigned}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Add Doctor */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">person_add</span>
                <h3 className="font-black text-base">Onboard Physician / Doctor</h3>
              </div>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Vaidya"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={docSpecialization}
                    onChange={(e) => setDocSpecialization(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={docQualification}
                    onChange={(e) => setDocQualification(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Reg #</label>
                  <input
                    type="text"
                    placeholder="e.g. AYU-MH-8442"
                    value={docRegNumber}
                    onChange={(e) => setDocRegNumber(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={docFee}
                    onChange={(e) => setDocFee(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consulting Chamber</label>
                  <input
                    type="text"
                    value={docRoomNumber}
                    onChange={(e) => setDocRoomNumber(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">OPD Schedule</label>
                  <input
                    type="text"
                    value={docSchedule}
                    onChange={(e) => setDocSchedule(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="md-btn-outlined py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="md-btn-filled py-2 px-6 text-xs bg-emerald-800 text-white font-black"
                >
                  Save &amp; Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Receptionist */}
      {showAddReceptionistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-blue-800 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">how_to_reg</span>
                <h3 className="font-black text-base">Register Front-Desk Receptionist</h3>
              </div>
              <button
                onClick={() => setShowAddReceptionistModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddReceptionistSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neha Sharma"
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="neha.s@bethany.org"
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={recPhone}
                    onChange={(e) => setRecPhone(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Counter</label>
                  <input
                    type="text"
                    value={recDesk}
                    onChange={(e) => setRecDesk(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift</label>
                  <input
                    type="text"
                    value={recShift}
                    onChange={(e) => setRecShift(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddReceptionistModal(false)}
                  className="md-btn-outlined py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="md-btn-filled py-2 px-6 text-xs bg-blue-800 text-white font-black"
                >
                  Save &amp; Register Receptionist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Room & Facilities Details */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">add_home</span>
                <h3 className="font-black text-base">Add Facility Room / Cottage</h3>
              </div>
              <button
                onClick={() => setShowAddRoomModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tariff / Day (₹)</label>
                  <input
                    type="number"
                    required
                    value={roomTariff}
                    onChange={(e) => setRoomTariff(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jasmine Cottage"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wing</label>
                  <input
                    type="text"
                    value={roomWing}
                    onChange={(e) => setRoomWing(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  >
                    <option value="Deluxe Panchakarma Cottage">Deluxe Panchakarma Cottage</option>
                    <option value="Premium Herbal Suite">Premium Herbal Suite</option>
                    <option value="General Detox Ward">General Detox Ward</option>
                    <option value="Ayurvedic Treatment Chamber">Ayurvedic Treatment Chamber</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amenities (Comma-separated)</label>
                <input
                  type="text"
                  value={roomAmenities}
                  onChange={(e) => setRoomAmenities(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Care Staff</label>
                <input
                  type="text"
                  value={roomCareStaff}
                  onChange={(e) => setRoomCareStaff(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="md-btn-outlined py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="md-btn-filled py-2 px-6 text-xs bg-emerald-800 text-white font-black"
                >
                  Save &amp; Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
