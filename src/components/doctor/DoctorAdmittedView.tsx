import React, { useState, useEffect } from 'react';
import { Patient, InpatientDailyRound } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

interface DoctorAdmittedViewProps {
  onShowToast: (msg: string) => void;
}

export const DoctorAdmittedView: React.FC<DoctorAdmittedViewProps> = ({ onShowToast }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [rounds, setRounds] = useState<InpatientDailyRound[]>([]);

  // Daily Round Form State
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [vitalBp, setVitalBp] = useState('120/80');
  const [vitalPulse, setVitalPulse] = useState(72);
  const [dietInstruction, setDietInstruction] = useState('Light Sattvic Khichdi, warm jeera water');
  const [recommendDischargeToggle, setRecommendDischargeToggle] = useState(false);
  const [dischargeNote, setDischargeNote] = useState('');

  // Meds in this round
  const [newMedName, setNewMedName] = useState('');
  const [newMedFormulation, setNewMedFormulation] = useState('Kashayam');
  const [newMedDosage, setNewMedDosage] = useState('15ml twice daily');
  const [medsList, setMedsList] = useState<Array<{ name: string; formulation: string; dosage: string }>>([
    { name: 'Ksheerabala 101 Taila', formulation: 'Ayurvedic Drops', dosage: '2 drops nasal at night' },
  ]);

  // Procedures in this round
  const [newProcName, setNewProcName] = useState('');
  const [newProcDuration, setNewProcDuration] = useState('45 mins');
  const [newProcCharge, setNewProcCharge] = useState(1200);
  const [procsList, setProcsList] = useState<Array<{ name: string; duration: string; charge: number }>>([
    { name: 'Shirodhara with Ksheerabala', duration: '45 mins', charge: 1800 },
  ]);

  const loadData = () => {
    const list = dataStoreService.getAdmittedPatients();
    setPatients(list);
    if (selectedPatient) {
      const refreshed = dataStoreService.getPatientById(selectedPatient.id);
      if (refreshed) setSelectedPatient(refreshed);
      setRounds(dataStoreService.getInpatientRounds(selectedPatient.id));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dataStoreService.subscribe(loadData);
    return unsub;
  }, []);

  const handleSelectPatientForRounds = (p: Patient) => {
    setSelectedPatient(p);
    setRounds(dataStoreService.getInpatientRounds(p.id));
    setRecommendDischargeToggle(!!p.dischargeRecommended);
    setDischargeNote(p.dischargeNote || '');
    setShowRoundModal(true);
  };

  const handleAddMed = () => {
    if (!newMedName.trim()) return;
    setMedsList([...medsList, { name: newMedName.trim(), formulation: newMedFormulation, dosage: newMedDosage }]);
    setNewMedName('');
  };

  const handleRemoveMed = (idx: number) => {
    setMedsList(medsList.filter((_, i) => i !== idx));
  };

  const handleAddProc = () => {
    if (!newProcName.trim()) return;
    setProcsList([...procsList, { name: newProcName.trim(), duration: newProcDuration, charge: Number(newProcCharge) || 1000 }]);
    setNewProcName('');
  };

  const handleRemoveProc = (idx: number) => {
    setProcsList(procsList.filter((_, i) => i !== idx));
  };

  const handleSaveDailyRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const roundData: Omit<InpatientDailyRound, 'id'> = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      roomId: selectedPatient.assignedRoomId || 'R-101',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      doctorName: dataStoreService.getCurrentUser().name,
      doctorFeedback: doctorNotes || 'Patient responding favorably to detox protocol. Pulse harmonious.',
      feedbackNotes: doctorNotes || 'Patient responding favorably to detox protocol. Pulse harmonious.',
      medicinesAdded: medsList.map((m) => `${m.name} (${m.formulation}) - ${m.dosage}`),
      proceduresAdded: procsList.map((p) => `${p.name} - ${p.duration}`),
      vitals: {
        bloodPressure: vitalBp,
        pulse: vitalPulse,
        pulseNadi: vitalPulse,
      },
      dietInstruction,
      dietaryAdjustments: dietInstruction,
      dischargeRecommended: recommendDischargeToggle,
      dischargeNote: recommendDischargeToggle ? dischargeNote || 'Clinical criteria met. Cleared for billing.' : undefined,
    };

    dataStoreService.addInpatientDailyRound(roundData);

    if (recommendDischargeToggle) {
      dataStoreService.recommendDischarge(selectedPatient.id, dischargeNote);
      onShowToast(`Discharge recommended for ${selectedPatient.name}! Receptionist alerted for final billing.`);
    } else {
      onShowToast(`Daily Round recorded for ${selectedPatient.name}. Regimen updated.`);
    }

    setShowRoundModal(false);
    // Reset round fields
    setDoctorNotes('');
  };

  const handleQuickRecommendDischarge = (p: Patient) => {
    dataStoreService.recommendDischarge(p.id, 'Clinical condition stable. Approved by attending physician for final billing.');
    loadData();
    onShowToast(`Discharge flagged for ${p.name}. Receptionist can now generate final IPD bill.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">hotel</span>
            <span>Inpatient Care Unit (IPD)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admitted Inpatients &amp; Daily Rounds
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Review admitted patients in Panchakarma cottages &amp; wards. Prescribe daily medicines, schedule therapies, record clinical feedback, and recommend discharge.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-xs font-bold text-emerald-950">
              {patients.length} Active Inpatients
            </span>
          </div>
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-amber-700">task_alt</span>
            <span className="text-xs font-bold text-amber-950">
              {patients.filter((p) => p.dischargeRecommended).length} Discharge Cleared
            </span>
          </div>
        </div>
      </div>

      {/* Admitted Patients Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {patients.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">hotel</span>
            <p className="text-base font-bold text-slate-700">No patients currently admitted</p>
            <p className="text-xs text-slate-500 mt-1">
              When a doctor recommends admission from Consultation and Receptionist assigns a room, inpatients appear here.
            </p>
          </div>
        ) : (
          patients.map((patient) => {
            const hasDischargeRecommended = patient.dischargeRecommended;
            return (
              <div
                key={patient.id}
                className={`md-card p-5 flex flex-col justify-between transition-all hover:shadow-md border-2 ${
                  hasDischargeRecommended ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/90 bg-white'
                }`}
              >
                <div>
                  {/* Card Top: Room & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                        <span className="material-symbols-outlined text-[16px] align-middle mr-1">meeting_room</span>
                        {patient.assignedRoomName || 'Room Assigned'}
                      </span>
                    </div>

                    {hasDischargeRecommended ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">done_all</span>
                        Discharge Cleared
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        In-Patient Active
                      </span>
                    )}
                  </div>

                  {/* Patient Info */}
                  <div className="mt-4 flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{patient.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        ID: <span className="font-mono text-slate-700">{patient.id}</span> &bull; {patient.age}y / {patient.gender}
                      </p>
                      <p className="text-xs text-emerald-800 font-semibold mt-1">
                        {patient.activeProgram || 'Panchakarma Detox Residency'} &bull; <span className="text-slate-500">{patient.programDuration || 'Day 3 of 7'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Clinical Details */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Primary Physician:</span>
                      <span className="font-bold text-slate-800">{patient.primaryPhysician}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Dosha Constitution:</span>
                      <span className="font-bold text-amber-800">{patient.dosha.primary} ({patient.dosha.dominantState})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Admitted Since:</span>
                      <span className="font-bold text-slate-700">{patient.registrationDate}</span>
                    </div>
                  </div>

                  {/* Discharge Note banner if present */}
                  {hasDischargeRecommended && (
                    <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                      <p className="font-bold text-amber-900 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        Doctor Discharge Advice:
                      </p>
                      <p className="text-amber-800 text-[11px] mt-0.5">{patient.dischargeNote || 'Approved for final discharge.'}</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => handleSelectPatientForRounds(patient)}
                    className="md-btn-filled py-2 px-3 text-xs w-full flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white"
                  >
                    <span className="material-symbols-outlined text-[16px]">assignment</span>
                    <span>Daily Round &amp; Prescribe</span>
                  </button>

                  {!hasDischargeRecommended && (
                    <button
                      onClick={() => handleQuickRecommendDischarge(patient)}
                      className="md-btn-tonal py-1.5 px-3 text-xs w-full flex items-center justify-center gap-1 text-amber-900 bg-amber-100/70 hover:bg-amber-200 border border-amber-300"
                    >
                      <span className="material-symbols-outlined text-[15px]">meeting_room</span>
                      <span>Recommend Discharge to Receptionist</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Daily Round & Prescribing Modal */}
      {showRoundModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[24px]">clinical_notes</span>
                </div>
                <div>
                  <h2 className="text-lg font-black">
                    Daily Clinical Round &bull; {selectedPatient.name}
                  </h2>
                  <p className="text-xs text-emerald-200">
                    Room: {selectedPatient.assignedRoomName} &bull; ID: {selectedPatient.id} &bull; Attending: {dataStoreService.getCurrentUser().name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRoundModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body - Scrollable Form */}
            <form onSubmit={handleSaveDailyRound} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {/* Vitals Recording */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">monitor_heart</span>
                  1. Morning Round Vitals &amp; Pulse
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={vitalBp}
                      onChange={(e) => setVitalBp(e.target.value)}
                      placeholder="e.g. 120/80 mmHg"
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pulse (Nadi Rate)</label>
                    <input
                      type="number"
                      value={vitalPulse}
                      onChange={(e) => setVitalPulse(Number(e.target.value))}
                      placeholder="e.g. 74 bpm"
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Clinical Feedback Notes */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">rate_review</span>
                  2. Physician Observations &amp; Feedback
                </h3>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Record patient progress, digestion (Agni), sleep quality, dosha stability, or therapy adjustments..."
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Add Inpatient Medicines */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">medication</span>
                    3. Prescribe Inpatient Medicines
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800">{medsList.length} medicines scheduled</span>
                </div>

                {/* Add new medicine row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Medicine name (e.g. Triphala Churna)"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="sm:col-span-2 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <select
                    value={newMedFormulation}
                    onChange={(e) => setNewMedFormulation(e.target.value)}
                    className="text-xs font-semibold px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Kashayam">Kashayam</option>
                    <option value="Churna">Churna (Powder)</option>
                    <option value="Vati / Tablet">Vati / Tablet</option>
                    <option value="Arishta / Asava">Arishta</option>
                    <option value="Taila / Oil">Taila / Oil</option>
                    <option value="Ghrita">Ghrita (Medicated Ghee)</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMed}
                    className="md-btn-filled py-1.5 px-3 text-xs bg-emerald-800 text-white flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add Med</span>
                  </button>
                </div>

                {/* Current meds list */}
                <div className="space-y-1.5">
                  {medsList.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{m.name}</span>
                        <span className="text-slate-500 ml-2">({m.formulation})</span>
                        <span className="text-emerald-800 font-semibold ml-2">&bull; {m.dosage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Inpatient Procedures */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">spa</span>
                    4. Prescribe Daily Procedures / Panchakarma
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800">{procsList.length} procedures booked</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Procedure (e.g. Abhyanga Snana)"
                    value={newProcName}
                    onChange={(e) => setNewProcName(e.target.value)}
                    className="sm:col-span-2 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Charge ₹"
                    value={newProcCharge}
                    onChange={(e) => setNewProcCharge(Number(e.target.value))}
                    className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddProc}
                    className="md-btn-filled py-1.5 px-3 text-xs bg-emerald-800 text-white flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add Proc</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {procsList.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-slate-500 ml-2">({p.duration})</span>
                        <span className="text-emerald-800 font-bold ml-2">&bull; ₹{p.charge}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProc(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diet Instructions */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  5. Sattvic Dietary &amp; Rest Instructions
                </label>
                <input
                  type="text"
                  value={dietInstruction}
                  onChange={(e) => setDietInstruction(e.target.value)}
                  placeholder="e.g. Warm mung bean soup, avoid curd and fried items..."
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Discharge Recommendation Section */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dischargeCheck"
                      checked={recommendDischargeToggle}
                      onChange={(e) => setRecommendDischargeToggle(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="dischargeCheck" className="text-xs font-black text-amber-950 cursor-pointer">
                      Flag Patient for Discharge (Receptionist will be notified to generate final bill)
                    </label>
                  </div>
                  <span className="material-symbols-outlined text-amber-700 text-[20px]">meeting_room</span>
                </div>

                {recommendDischargeToggle && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Discharge Summary &amp; Post-Care Advice:
                    </label>
                    <input
                      type="text"
                      value={dischargeNote}
                      onChange={(e) => setDischargeNote(e.target.value)}
                      placeholder="e.g. Panchakarma cycle completed. Prescribed follow-up rasayana medicines."
                      className="w-full text-xs font-semibold px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Previous Rounds History Timeline */}
              {rounds.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">history</span>
                    Previous Rounds Logged ({rounds.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {rounds.map((r) => (
                      <div key={r.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{r.date} &bull; {r.doctorName}</span>
                          <span className="text-emerald-800">{r.vitals.bloodPressure} &bull; {r.vitals.pulse || r.vitals.pulseNadi || 72} bpm</span>
                        </div>
                        <p className="text-slate-600 mt-1">{r.feedbackNotes || r.doctorFeedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRoundModal(false)}
                  className="md-btn-outlined py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="md-btn-filled py-2 px-6 text-xs bg-emerald-800 text-white font-black"
                >
                  Save Daily Round &amp; Update Regimen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
