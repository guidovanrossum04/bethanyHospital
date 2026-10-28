import React, { useState, useEffect } from 'react';
import { Appointment, Patient, VisitHistoryItem, BillingInvoice } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

interface DoctorAppointmentsViewProps {
  onSelectPatient: (patientId: string) => void;
  onNavigateToConsultation: (patientId: string) => void;
  onShowToast: (msg: string) => void;
}

export const DoctorAppointmentsView: React.FC<DoctorAppointmentsViewProps> = ({
  onSelectPatient,
  onNavigateToConsultation,
  onShowToast,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterMode, setFilterMode] = useState<'my' | 'all'>('my');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Patient History Modal State
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [patientHistoryList, setPatientHistoryList] = useState<VisitHistoryItem[]>([]);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  // Billing Invoice Confirmation Modal
  const [justGeneratedInvoice, setJustGeneratedInvoice] = useState<BillingInvoice | null>(null);

  const currentUser = dataStoreService.getCurrentUser();

  const loadAppointments = () => {
    const list = dataStoreService.getAppointments();
    setAppointments(list);
  };

  useEffect(() => {
    loadAppointments();
    const unsub = dataStoreService.subscribe(loadAppointments);
    return unsub;
  }, []);

  const handleCompleteAndBill = (apt: Appointment) => {
    const invoice = dataStoreService.completeAppointmentAndSendToBilling(apt.id);
    loadAppointments();
    setJustGeneratedInvoice(invoice);
    onShowToast(`Appointment ${apt.tokenNumber} completed! Invoice ${invoice.id} sent to Receptionist billing.`);
  };

  const handleOpenPatientHistory = (patientId: string) => {
    const patient = dataStoreService.getPatientById(patientId);
    if (!patient) return;
    setSelectedPatientForHistory(patient);
    const history = dataStoreService.getVisitHistory(patientId);
    setPatientHistoryList(history);
    if (history.length > 0) {
      setExpandedVisitId(history[0].id);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (filterMode === 'my' && currentUser.name) {
      const matchDoctor =
        apt.physician.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        currentUser.name.toLowerCase().includes(apt.physician.toLowerCase());
      if (!matchDoctor) return false;
    }

    if (statusFilter !== 'all' && apt.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        apt.patientName.toLowerCase().includes(q) ||
        apt.tokenNumber.toLowerCase().includes(q) ||
        apt.treatmentName.toLowerCase().includes(q) ||
        apt.physician.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">stethoscope</span>
            <span>Doctor Portal &bull; OPD Outpatient</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Appointments &amp; Billing Dispatch
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Review booked consultations, inspect full historical prescriptions/procedures, and assign completed visits to Receptionist for billing.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-950">
              {appointments.filter((a) => a.status !== 'Completed').length} Pending
            </span>
          </div>
          <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-slate-600">done_all</span>
            <span className="text-xs font-bold text-slate-800">
              {appointments.filter((a) => a.status === 'Completed').length} Billed
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="md-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle My vs All */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/70">
          <button
            onClick={() => setFilterMode('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'my'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Appointments ({currentUser.name})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Doctors ({appointments.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed / Billed</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search patient, token, treatment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Appointments List - Responsive Material Design Table / Cards */}
      <div className="md-table-container">
        <table className="md-table">
          <thead>
            <tr>
              <th>Token &amp; Time</th>
              <th>Patient &amp; Demographics</th>
              <th>Chief Complaint &amp; Treatment</th>
              <th>Physician</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[40px] text-slate-300">
                      event_busy
                    </span>
                    <p className="text-sm font-bold text-slate-700">No appointments found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => {
                const isCompleted = apt.status === 'Completed';
                return (
                  <tr key={apt.id} className="hover:bg-emerald-50/40 transition-colors">
                    {/* Token & Time */}
                    <td>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-emerald-950 font-mono text-xs">
                          {apt.tokenNumber}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>
                          <span>{apt.time}</span>
                        </div>
                      </div>
                    </td>

                    {/* Patient & Demographics */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center shrink-0">
                          {apt.patientName.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              onSelectPatient(apt.patientId);
                              handleOpenPatientHistory(apt.patientId);
                            }}
                            className="font-bold text-slate-900 hover:text-emerald-800 text-left hover:underline transition-colors block text-sm"
                          >
                            {apt.patientName}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>ID: {apt.patientId}</span>
                            <span>&bull;</span>
                            <span>{apt.ageGender}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Chief Complaint & Treatment */}
                    <td>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{apt.chiefComplaint}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[10px] font-extrabold uppercase">
                            {apt.treatmentName}
                          </span>
                          <span className="text-[11px] text-amber-700 font-medium">
                            {apt.doshaState}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Physician */}
                    <td>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">{apt.physician}</span>
                        <p className="text-[11px] text-slate-500">{apt.department}</p>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : apt.status === 'In Consultation'
                            ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCompleted ? 'bg-slate-500' : apt.status === 'In Consultation' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        {apt.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* History Button */}
                        <button
                          onClick={() => handleOpenPatientHistory(apt.patientId)}
                          className="md-btn-outlined py-1.5 px-3 text-xs flex items-center gap-1.5"
                          title="View previous all appointment history with medicine and procedures"
                        >
                          <span className="material-symbols-outlined text-[16px]">history</span>
                          <span>History</span>
                        </button>

                        {/* Consultation Button */}
                        {!isCompleted && (
                          <button
                            onClick={() => {
                              onSelectPatient(apt.patientId);
                              onNavigateToConsultation(apt.patientId);
                            }}
                            className="md-btn-tonal py-1.5 px-3 text-xs flex items-center gap-1.5"
                            title="Open interactive consultation workbench"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit_note</span>
                            <span>Consult</span>
                          </button>
                        )}

                        {/* Assign to Receptionist for Billing */}
                        {!isCompleted ? (
                          <button
                            onClick={() => handleCompleteAndBill(apt)}
                            className="md-btn-filled py-1.5 px-3 text-xs flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white"
                            title="Complete appointment and forward to Receptionist for bill generation"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Complete &amp; Bill</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            <span>Billed ({apt.billedInvoiceId || 'INV-Done'})</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Patient History Modal with Full Previous Appointment History */}
      {selectedPatientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                  <span className="material-symbols-outlined text-[28px]">folder_shared</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black">{selectedPatientForHistory.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-100 text-xs font-bold font-mono">
                      {selectedPatientForHistory.id}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 font-medium mt-0.5">
                    {selectedPatientForHistory.age}y &bull; {selectedPatientForHistory.gender} &bull; Blood: {selectedPatientForHistory.bloodGroup} &bull; Dosha: {selectedPatientForHistory.dosha.primary} ({selectedPatientForHistory.dosha.dominantState})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientForHistory(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {/* Summary Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Allergies &amp; Chronic</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedPatientForHistory.allergies.map((a, i) => (
                      <span key={i} className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md">
                        {a}
                      </span>
                    ))}
                    {selectedPatientForHistory.chronicConditions.map((c, i) => (
                      <span key={i} className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Physician</span>
                  <p className="text-sm font-bold text-slate-900 mt-2">{selectedPatientForHistory.primaryPhysician}</p>
                  <p className="text-xs text-emerald-700 font-medium">{selectedPatientForHistory.careMode}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Status</span>
                  <p className="text-sm font-bold text-slate-900 mt-2">{selectedPatientForHistory.status}</p>
                  {selectedPatientForHistory.assignedRoomName && (
                    <p className="text-xs text-slate-600">Room: {selectedPatientForHistory.assignedRoomName}</p>
                  )}
                </div>
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800">clinical_notes</span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Previous Appointment History ({patientHistoryList.length} Clinical Encounters)
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Itemized Medicines &bull; Procedures &bull; Clinical Feedbacks
                </span>
              </div>

              {/* Visit History Timeline with Detailed Accordion */}
              {patientHistoryList.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200">
                  No previous consultation records logged yet for this patient.
                </div>
              ) : (
                <div className="space-y-4">
                  {patientHistoryList.map((visit) => {
                    const isExpanded = expandedVisitId === visit.id;
                    return (
                      <div
                        key={visit.id}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                      >
                        {/* Visit Card Header */}
                        <div
                          onClick={() => setExpandedVisitId(isExpanded ? null : visit.id)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-50/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center border border-emerald-200 text-xs">
                              {visit.date.split(' ')[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900">{visit.diagnosis || visit.summary}</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                  {visit.type || visit.encounterType || 'Follow-up'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {visit.date} &bull; Attending: <span className="font-semibold text-slate-700">{visit.doctorName}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                              {visit.prescriptions?.length || 0} Meds &bull; {visit.procedures?.length || 0} Procedures
                            </span>
                            <span className="material-symbols-outlined text-slate-400">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-5">
                            {/* Vitals & Clinical Note */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                <span className="text-slate-500 font-bold text-[10px] uppercase">Blood Pressure</span>
                                <p className="font-extrabold text-slate-900 mt-0.5">{visit.vitals?.bloodPressure || '120/80 mmHg'}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                <span className="text-slate-500 font-bold text-[10px] uppercase">Pulse Rate</span>
                                <p className="font-extrabold text-slate-900 mt-0.5">{visit.vitals?.pulse || visit.vitals?.pulseNadi || 72} bpm</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                <span className="text-slate-500 font-bold text-[10px] uppercase">Temperature</span>
                                <p className="font-extrabold text-slate-900 mt-0.5">{visit.vitals?.temperature || '98.6 °F'}</p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                <span className="text-slate-500 font-bold text-[10px] uppercase">Weight / BMI</span>
                                <p className="font-extrabold text-slate-900 mt-0.5">{visit.vitals?.weightKg || visit.vitals?.bodyWeightKg || 72} kg (BMI {visit.vitals?.bmi || 23.5})</p>
                              </div>
                            </div>

                            {/* Doctor Feedback / Notes */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                              <span className="text-emerald-800 font-bold text-[11px] uppercase tracking-wider block mb-1">
                                Clinical Feedback &amp; Physician Assessment
                              </span>
                              <p className="text-slate-700 leading-relaxed font-medium">{visit.notes || visit.clinicalNotes || visit.summary}</p>
                            </div>

                            {/* Prescribed Medicines */}
                            <div>
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-emerald-700">medication</span>
                                Prescribed Medicines ({visit.prescriptions?.length || 0})
                              </h4>
                              {visit.prescriptions && visit.prescriptions.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                      <tr>
                                        <th className="py-2 px-3">Medicine Name</th>
                                        <th className="py-2 px-3">Formulation</th>
                                        <th className="py-2 px-3">Dosage / Timing</th>
                                        <th className="py-2 px-3">Duration</th>
                                        <th className="py-2 px-3">Instructions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {visit.prescriptions.map((rx, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                          <td className="py-2 px-3 font-bold text-slate-900">{rx.medicineName}</td>
                                          <td className="py-2 px-3 text-slate-600">{rx.formulation}</td>
                                          <td className="py-2 px-3 font-semibold text-emerald-800">{rx.dosage} ({rx.timing || 'After meals'})</td>
                                          <td className="py-2 px-3 text-slate-600">{rx.duration}</td>
                                          <td className="py-2 px-3 text-slate-500 italic">{rx.instructions || rx.notes || 'As prescribed'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No medicinal prescriptions recorded for this visit.</p>
                              )}
                            </div>

                            {/* Procedures Administered */}
                            <div>
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-emerald-700">spa</span>
                                Clinical Procedures &amp; Therapies ({visit.procedures?.length || 0})
                              </h4>
                              {visit.procedures && visit.procedures.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {visit.procedures.map((proc, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                                      <div className="flex items-center justify-between font-bold text-slate-900">
                                        <span>{proc.procedureName}</span>
                                        <span className="text-emerald-800">₹{proc.charge}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        Therapist: <span className="font-semibold">{proc.therapistName || proc.therapist}</span> &bull; {proc.duration}
                                      </p>
                                      {(proc.remarks || proc.notes) && (
                                        <p className="text-[11px] text-slate-600 mt-1 italic">&ldquo;{proc.remarks || proc.notes}&rdquo;</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No physical procedures recorded for this visit.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Patient records synced with Central Ayurveda EHR Ledger
              </span>
              <button
                onClick={() => setSelectedPatientForHistory(null)}
                className="md-btn-filled py-2 px-5 text-xs bg-emerald-800 text-white"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Created Notification Toast/Dialog */}
      {justGeneratedInvoice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white rounded-3xl p-5 shadow-2xl border-2 border-emerald-500 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">send</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Dispatched to Receptionist</h4>
                <button
                  onClick={() => setJustGeneratedInvoice(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Invoice <span className="font-mono font-bold text-emerald-950">{justGeneratedInvoice.id}</span> generated for{' '}
                <span className="font-bold">{justGeneratedInvoice.patientName}</span>. Total ₹{justGeneratedInvoice.finalTotal}.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Status: Pending Receptionist Generation / Payment
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
