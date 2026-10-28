import React, { useState } from 'react';
import { Patient, Prescription } from '../../types';
import { dataStoreService } from '../../services/data-store.service';
import { ScreenId } from '../common/Sidebar';

interface PatientConsultationViewProps {
  patientId: string;
  onNavigate: (screen: ScreenId) => void;
  onOpenPrintModal: (patientId: string) => void;
  onShowToast: (msg: string) => void;
}

export const PatientConsultationView: React.FC<PatientConsultationViewProps> = ({
  patientId,
  onNavigate,
  onOpenPrintModal,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'consultation' | 'diet' | 'vitals'>('consultation');
  const [patient, setPatient] = useState<Patient>(
    dataStoreService.getPatientById(patientId) || dataStoreService.getPatients()[0]
  );
  const [consultation, setConsultation] = useState(
    dataStoreService.getConsultationByPatientId(patient.id)
  );
  const [visitHistory] = useState(dataStoreService.getVisitHistory(patient.id));

  // Modal for Adding Prescription
  const [showAddRxModal, setShowAddRxModal] = useState(false);
  const [rxName, setRxName] = useState('');
  const [rxForm, setRxForm] = useState('Herbal Powders');
  const [rxPackaging, setRxPackaging] = useState('200g Jar · Standardized Extract');
  const [rxDosage, setRxDosage] = useState('1 tsp twice daily after meals with warm water');
  const [rxDuration, setRxDuration] = useState('14 Days');

  // Past prescription details modal / preview
  const [activePastRx, setActivePastRx] = useState<{ date: string; text: string; notes?: string } | null>(null);

  const refreshConsultation = () => {
    setPatient(dataStoreService.getPatientById(patient.id) || patient);
    setConsultation(dataStoreService.getConsultationByPatientId(patient.id));
  };

  const handleAddPrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxName) return;

    dataStoreService.addPrescription(patient.id, {
      medicineName: rxName,
      formulation: rxPackaging,
      dosage: rxDosage,
      duration: rxDuration,
      status: 'Active',
      category: rxForm,
    });

    refreshConsultation();
    setShowAddRxModal(false);
    setRxName('');
    onShowToast(`Prescription for ${rxName} added to patient medical record.`);
  };

  const handleDeleteRx = (rxId: string, name: string) => {
    if (confirm(`Discontinue and remove ${name} from active formulation schedule?`)) {
      dataStoreService.deletePrescription(patient.id, rxId);
      refreshConsultation();
      onShowToast(`${name} marked as Discontinued.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================== PATIENT PROFILE HEADER CARD ==================== */}
      <section className="md-card p-6 md:p-8 relative overflow-hidden">
        {/* Subtle decorative watermark icon */}
        <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none select-none text-emerald-950">
          <span className="material-symbols-outlined text-[180px]">spa</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Patient Avatar & Core Bio */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center font-black text-2xl md:text-3xl shrink-0 shadow-md ring-4 ring-emerald-500/10">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-950 tracking-tight">
                  {patient.name}
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                  MRN: {patient.id}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {patient.status}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200">
                  {patient.careMode}
                </span>
              </div>

              {/* Responsive Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-2.5 gap-x-6 text-xs pt-1">
                <div>
                  <span className="block text-slate-500 font-medium">Age &amp; Gender</span>
                  <span className="text-sm font-bold text-slate-800">
                    {patient.age} Yrs · {patient.gender}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Prakriti / Dosha</span>
                  <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-800">
                    <span className="material-symbols-outlined text-sm text-emerald-600">nature</span>
                    {patient.dosha.primary}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Blood Group</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{patient.bloodGroup}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Primary Physician</span>
                  <span className="text-sm font-bold text-slate-800">{patient.primaryPhysician}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-slate-500 font-medium">Emergency Phone</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{patient.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Responsive Green Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full lg:w-auto pt-2 lg:pt-0">
            <button
              onClick={() => onOpenPrintModal(patient.id)}
              className="md-btn md-btn-outlined flex-1 sm:flex-initial"
              type="button"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print Medical Summary</span>
            </button>
            <button
              onClick={() => onNavigate('patient-edit')}
              className="md-btn md-btn-tonal flex-1 sm:flex-initial"
              type="button"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Update Details</span>
            </button>
            <button
              onClick={() => setShowAddRxModal(true)}
              className="md-btn md-btn-filled flex-1 sm:flex-initial"
              type="button"
            >
              <span className="material-symbols-outlined text-base">medication</span>
              <span>New Prescription</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== WORKSPACE NAVIGATION TABS ==================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <nav aria-label="Tabs" className="flex space-x-2 md:space-x-3 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('consultation')}
            className={`md-btn md-btn-sm transition-all ${
              activeTab === 'consultation'
                ? 'bg-emerald-800 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 border border-slate-200'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-base">prescriptions</span>
            <span>Consultation &amp; Prescriptions</span>
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`md-btn md-btn-sm transition-all ${
              activeTab === 'diet'
                ? 'bg-emerald-800 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 border border-slate-200'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-base">restaurant</span>
            <span>Diet &amp; Lifestyle Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`md-btn md-btn-sm transition-all ${
              activeTab === 'vitals'
                ? 'bg-emerald-800 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 border border-slate-200'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-base">vital_signs</span>
            <span>Vital Signs Log</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Last clinical update: Today, 10:15 AM</span>
        </div>
      </div>

      {/* ==================== TAB 1: CONSULTATION & PRESCRIPTION HISTORY ==================== */}
      {activeTab === 'consultation' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT PRIMARY WORKSPACE (8 Columns) */}
          <div className="xl:col-span-8 space-y-6">
            {/* SECTION 1: Current Consultation & Diagnosis Card */}
            <section className="md-card">
              <div className="md-card-header bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                    <span className="material-symbols-outlined text-xl">stethoscope</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">
                      Current Consultation &amp; Clinical Diagnosis
                    </h3>
                    <p className="text-xs text-slate-500">
                      Encounter Date: {consultation.encounterDate} · {consultation.cycleInfo}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs">
                  Session #{consultation.sessionNumber}
                </span>
              </div>

              <div className="md-card-body space-y-6">
                {/* Bento Diagnostic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chief Complaints Card */}
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base text-amber-700">report_problem</span>
                      <span>Chief Complaints</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {consultation.chiefComplaints}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {consultation.complaintTags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-white text-amber-900 border border-amber-200 text-[11px] font-bold shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ayurvedic Diagnosis Card */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base text-emerald-700">psychiatry</span>
                      <span>Ayurvedic Clinical Assessment</span>
                    </div>
                    <p className="text-base font-extrabold text-emerald-950">{consultation.ayurvedicDiagnosis}</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {consultation.subDiagnosisNotes}
                    </p>
                  </div>
                </div>

                {/* Vitals Baseline Metric Cards Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base text-emerald-700">monitor_heart</span>
                      <span>Vital Signs Baseline</span>
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">Recorded by {consultation.vitals.recordedBy}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* BP Metric Card */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Blood Pressure</span>
                      <div className="text-2xl font-black text-emerald-950 font-mono tabular-nums mt-1">
                        {consultation.vitals.bloodPressure}
                      </div>
                      <span className="inline-block mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {consultation.vitals.bpAssessment}
                      </span>
                    </div>

                    {/* Pulse Metric Card */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Pulse (Nadi)</span>
                      <div className="text-2xl font-black text-emerald-950 font-mono tabular-nums mt-1">
                        {consultation.vitals.pulseNadi}
                      </div>
                      <span className="inline-block mt-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {consultation.vitals.nadiGati}
                      </span>
                    </div>

                    {/* Weight Metric Card */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Body Weight</span>
                      <div className="text-2xl font-black text-emerald-950 font-mono tabular-nums mt-1">
                        {consultation.vitals.bodyWeightKg}
                      </div>
                      <span className="inline-block mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {consultation.vitals.weightChange}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Active Prescriptions & Herbal Formulations Card */}
            <section className="md-card">
              <div className="md-card-header bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                    <span className="material-symbols-outlined text-xl">medication_liquid</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">
                      Prescription &amp; Ayurvedic Medicine Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Active Formulations &amp; Dispensary Schedule
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddRxModal(true)}
                  className="md-btn md-btn-sm md-btn-tonal"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add Formulation</span>
                </button>
              </div>

              <div className="md-card-body space-y-5">
                {/* Responsive M3 Medicine Table */}
                <div className="md-table-container">
                  <table className="md-table">
                    <thead>
                      <tr>
                        <th>Medicine Name &amp; Formulation</th>
                        <th>Dosage &amp; Frequency</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultation.prescriptions.map((rx) => (
                        <tr key={rx.id}>
                          <td>
                            <div className="font-bold text-slate-900 text-sm">{rx.medicineName}</div>
                            <div className="text-xs text-slate-500">{rx.formulation}</div>
                          </td>
                          <td className="font-medium text-slate-800">
                            {rx.dosage}
                          </td>
                          <td className="font-bold text-emerald-800 font-mono tabular-nums">
                            {rx.duration}
                          </td>
                          <td>
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                              {rx.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => handleDeleteRx(rx.id, rx.medicineName)}
                              className="md-btn md-btn-sm p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Discontinue Formulation"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Special Dietary Instructions Callout Card */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-700 shrink-0 mt-0.5 text-xl">restaurant</span>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-950 block uppercase tracking-wider">
                      Special Dietary &amp; Pathya Instructions
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {consultation.dietaryInstructions}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT TIMELINE & PAST RECORDS (4 Columns) */}
          <div className="xl:col-span-4 space-y-6">
            {/* SECTION 3: Visit Timeline Card */}
            <section className="md-card">
              <div className="md-card-header bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">history</span>
                  <h3 className="text-base font-bold text-emerald-950">Visit Timeline</h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold px-2.5 py-0.5 rounded-full bg-slate-100">
                  {visitHistory.length} Recorded
                </span>
              </div>

              <div className="md-card-body">
                {/* Continuous Timeline Stream */}
                <div className="relative pl-6 space-y-7 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {visitHistory.map((vh) => {
                    const dotColor =
                      vh.colorTag === 'primary'
                        ? 'bg-emerald-700 ring-emerald-100'
                        : vh.colorTag === 'secondary'
                        ? 'bg-emerald-500 ring-emerald-100'
                        : 'bg-amber-600 ring-amber-100';

                    return (
                      <div key={vh.id} className="relative group">
                        <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full ring-4 ${dotColor}`} />
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-950 font-mono">{vh.date}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                              {vh.encounterType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium mt-1 leading-snug">
                            {vh.summary}
                          </p>

                          {/* Interactive Expander Actions */}
                          <div className="mt-2.5 flex items-center gap-3 text-xs">
                            <button
                              onClick={() =>
                                setActivePastRx({
                                  date: vh.date,
                                  text: vh.prescriptionSummary || 'Standard formulation schedule.',
                                  notes: vh.clinicalNotes,
                                })
                              }
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold transition-colors cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              <span>View Past Rx</span>
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              onClick={() =>
                                setActivePastRx({
                                  date: vh.date,
                                  text: vh.prescriptionSummary || '',
                                  notes: vh.clinicalNotes || 'Patient responding positively to protocol.',
                                })
                              }
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold transition-colors cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-sm">notes</span>
                              <span>Doctor's Notes</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <button
                    onClick={() => onShowToast('Full archival chart exported to review.')}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">folder_open</span>
                    <span>Open Complete Archival Chart</span>
                  </button>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS & SCHEDULE CARD */}
            <div className="md-card p-5 space-y-3 bg-gradient-to-br from-emerald-50/70 to-white">
              <div className="flex items-center gap-2 text-emerald-950 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-emerald-700 text-base">event_upcoming</span>
                <span>Next Recommended Session</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Target Follow-up: <strong className="text-emerald-950 font-bold">{consultation.nextFollowUpDate}</strong> for{' '}
                {consultation.nextFollowUpObjective}
              </p>
              <button
                onClick={() => onShowToast(`Appointment successfully scheduled for ${consultation.nextFollowUpDate}`)}
                className="md-btn md-btn-filled w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-base">schedule_send</span>
                <span>Schedule Next Appointment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: DIET & LIFESTYLE PLAN ==================== */}
      {activeTab === 'diet' && (
        <div className="md-card">
          <div className="md-card-header bg-slate-50/70">
            <div>
              <h3 className="text-base font-bold text-emerald-950">Ayurvedic Diet &amp; Ahara/Vihara Regimen</h3>
              <p className="text-xs text-slate-500">
                Customized for {patient.name} ({patient.dosha.primary} Prakriti)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
              {patient.dietaryPreference}
            </span>
          </div>

          <div className="md-card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pathya Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-lg text-emerald-700">check_circle</span>
                  <span>Pathya (Recommended Foods &amp; Healing Habits)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside leading-relaxed font-medium">
                  <li>Warm soups, mung dal kitchari cooked with ghee, ginger, and cumin.</li>
                  <li>Boiled warm milk with pinch of nutmeg and Ashwagandha before bedtime.</li>
                  <li>Light whole grains (quinoa, aged basmati rice) and steamed seasonal squash.</li>
                  <li>Daily gentle Shiro Abhyanga (scalp oil massage) with warm Brahmi oil.</li>
                </ul>
              </div>

              {/* Apathya Card */}
              <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200/90 space-y-3">
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-lg text-red-700">cancel</span>
                  <span>Apathya (Contraindicated Foods &amp; Habits)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside leading-relaxed font-medium">
                  <li>Cold, refrigerated drinks or ice water (extinguishes Jatharagni).</li>
                  <li>Dry crackers, raw salads, and heavy astringent nightshades (brinjal, bell peppers).</li>
                  <li>Late-night screen use and caffeinated stimulants past 3:00 PM.</li>
                  <li>Strenuous high-impact weightlifting during active Basti therapy cycles.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: VITAL SIGNS LOG ==================== */}
      {activeTab === 'vitals' && (
        <div className="md-card">
          <div className="md-card-header bg-slate-50/70">
            <div>
              <h3 className="text-base font-bold text-emerald-950">Vital Signs &amp; Nadi Pariksha Log</h3>
              <p className="text-xs text-slate-500">Encounter history and hemodynamic tracking</p>
            </div>
            <button
              onClick={() => onShowToast('Vitals export ready.')}
              className="md-btn md-btn-sm md-btn-outlined"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export Chart</span>
            </button>
          </div>

          <div className="md-card-body">
            <div className="md-table-container">
              <table className="md-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Blood Pressure</th>
                    <th>Pulse (Nadi Gati)</th>
                    <th>Body Weight</th>
                    <th>Verifier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold text-slate-900 font-mono">Oct 24, 2024 · 09:45 AM</td>
                    <td className="font-extrabold text-emerald-800 font-mono tabular-nums">120/80 mmHg <span className="text-xs font-semibold text-emerald-600">(Optimal)</span></td>
                    <td className="font-medium text-slate-800 font-mono tabular-nums">72 bpm (Sarpa Gati)</td>
                    <td className="font-bold text-slate-900 font-mono tabular-nums">74.0 kg <span className="text-xs text-emerald-700 font-bold">(-0.8kg)</span></td>
                    <td className="text-slate-500 font-medium">Nurse Annapurna</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-900 font-mono">Oct 10, 2024 · 10:15 AM</td>
                    <td className="font-extrabold text-slate-800 font-mono tabular-nums">124/82 mmHg</td>
                    <td className="font-medium text-slate-800 font-mono tabular-nums">74 bpm (Manduka Gati)</td>
                    <td className="font-bold text-slate-900 font-mono tabular-nums">74.8 kg</td>
                    <td className="text-slate-500 font-medium">Dr. Sarah Jenkins</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-900 font-mono">Sep 15, 2024 · 11:30 AM</td>
                    <td className="font-extrabold text-slate-800 font-mono tabular-nums">128/86 mmHg</td>
                    <td className="font-medium text-slate-800 font-mono tabular-nums">78 bpm (Sarpa-Manduka)</td>
                    <td className="font-bold text-slate-900 font-mono tabular-nums">75.5 kg</td>
                    <td className="text-slate-500 font-medium">Nurse Annapurna</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRESCRIPTION FORMULATION */}
      {showAddRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sage-wash mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">medication</span>
                <h3 className="font-bold text-forest-deep text-base">Prescribe Herbal Formulation</h3>
              </div>
              <button
                onClick={() => setShowAddRxModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPrescriptionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-forest-deep mb-1">
                  Medicine / Herb Name *
                </label>
                <input
                  type="text"
                  required
                  value={rxName}
                  onChange={(e) => setRxName(e.target.value)}
                  placeholder="e.g. Shatavari Gulam, Gokshuradi Guggulu"
                  className="w-full text-xs p-2.5 rounded-lg bg-surface border border-sage-wash"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">
                    Classification
                  </label>
                  <select
                    value={rxForm}
                    onChange={(e) => setRxForm(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  >
                    <option>Herbal Powders</option>
                    <option>Ayurvedic Oils</option>
                    <option>Capsules & Vati</option>
                    <option>Elixirs & Arishta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">
                    Formulation / Packaging
                  </label>
                  <input
                    type="text"
                    value={rxPackaging}
                    onChange={(e) => setRxPackaging(e.target.value)}
                    placeholder="200ml Glass, 60s Bottle"
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-deep mb-1">
                  Dosage & Anupana (Medium) *
                </label>
                <input
                  type="text"
                  required
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  placeholder="e.g. 1 tsp twice daily after meals with warm milk"
                  className="w-full text-xs p-2.5 rounded-lg bg-surface border border-sage-wash"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-deep mb-1">Duration</label>
                <select
                  value={rxDuration}
                  onChange={(e) => setRxDuration(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                >
                  <option>7 Days</option>
                  <option>14 Days</option>
                  <option>21 Days</option>
                  <option>30 Days</option>
                  <option>60 Days</option>
                </select>
              </div>

              <div className="pt-3 border-t border-sage-wash flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRxModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-sage-wash hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-container"
                >
                  Add to Patient Rx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW PAST RX & DOCTOR NOTES */}
      {activePastRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sage-wash mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history_edu</span>
                <h3 className="font-bold text-forest-deep text-base">
                  Encounter Record - {activePastRx.date}
                </h3>
              </div>
              <button
                onClick={() => setActivePastRx(null)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-forest-deep block mb-1">Prescription Summary:</span>
                <p className="p-3 rounded-lg bg-surface-container-low text-on-surface leading-relaxed border border-sage-wash">
                  {activePastRx.text}
                </p>
              </div>

              {activePastRx.notes && (
                <div>
                  <span className="font-bold text-forest-deep block mb-1">Physician Clinical Notes:</span>
                  <p className="p-3 rounded-lg bg-sun-warmth/60 text-bark-brown leading-relaxed border border-bark-brown/20 font-medium">
                    {activePastRx.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-sage-wash flex justify-end">
              <button
                onClick={() => setActivePastRx(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
