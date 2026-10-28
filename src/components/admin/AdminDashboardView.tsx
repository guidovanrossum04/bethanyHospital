import React, { useState, useEffect } from 'react';
import { Patient, VisitHistoryItem, BillingInvoice } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

interface AdminDashboardViewProps {
  onNavigateToApprovals: () => void;
  onNavigateToStaff: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigateToApprovals,
  onNavigateToStaff,
  onShowToast,
}) => {
  const [metrics, setMetrics] = useState(dataStoreService.getBusinessMetrics());
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientVisits, setPatientVisits] = useState<VisitHistoryItem[]>([]);
  const [patientInvoices, setPatientInvoices] = useState<BillingInvoice[]>([]);
  const [searchPatientQuery, setSearchPatientQuery] = useState('');

  const loadData = () => {
    setMetrics(dataStoreService.getBusinessMetrics());
    const pts = dataStoreService.getPatients();
    setPatients(pts);

    if (selectedPatient) {
      const refreshed = pts.find((p) => p.id === selectedPatient.id);
      if (refreshed) {
        setSelectedPatient(refreshed);
        setPatientVisits(dataStoreService.getVisitHistory(refreshed.id));
        setPatientInvoices(dataStoreService.getBillingInvoices().filter((i) => i.patientId === refreshed.id));
      }
    } else if (pts.length > 0) {
      setSelectedPatient(pts[0]);
      setPatientVisits(dataStoreService.getVisitHistory(pts[0].id));
      setPatientInvoices(dataStoreService.getBillingInvoices().filter((i) => i.patientId === pts[0].id));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dataStoreService.subscribe(loadData);
    return unsub;
  }, []);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setPatientVisits(dataStoreService.getVisitHistory(p.id));
    setPatientInvoices(dataStoreService.getBillingInvoices().filter((i) => i.patientId === p.id));
  };

  const filteredPatients = patients.filter((p) => {
    if (!searchPatientQuery.trim()) return true;
    const q = searchPatientQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.primaryPhysician.toLowerCase().includes(q)
    );
  });

  const doctors = dataStoreService.getDoctors();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">shield_person</span>
            <span>Executive Center Administration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Overall Hospital Business &amp; Operations Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Holistic view of clinical revenue, bed occupancy, doctor caseloads, discount authorizations, and global patient master histories.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToApprovals}
            className="md-btn-tonal py-2 px-3.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Discounts ({metrics.pendingDiscountsCount})</span>
          </button>
          <button
            onClick={onNavigateToStaff}
            className="md-btn-filled py-2 px-4 text-xs font-bold bg-emerald-800 text-white flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Add Staff / Rooms</span>
          </button>
        </div>
      </div>

      {/* Pending Discount Approval Alert Banner if any */}
      {metrics.pendingDiscountsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[26px]">price_change</span>
            </div>
            <div>
              <h3 className="font-black text-amber-950 text-base">
                {metrics.pendingDiscountsCount} Receptionist Discount Request(s) Awaiting Admin Finalization
              </h3>
              <p className="text-xs text-amber-900/80 font-medium">
                Receptionists have submitted fee concessions on pending invoices. Review, approve or decline to release bills.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToApprovals}
            className="md-btn-filled py-2 px-4 text-xs bg-amber-700 hover:bg-amber-800 text-white font-black shrink-0"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Core Business Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="md-card p-5 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white border-0 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Total Realized Revenue</span>
            <span className="p-2 rounded-xl bg-white/10 text-emerald-300">
              <span className="material-symbols-outlined text-[20px]">currency_rupee</span>
            </span>
          </div>
          <p className="text-3xl font-black mt-3">₹{metrics.totalRevenue.toLocaleString()}</p>
          <div className="flex items-center justify-between text-xs text-emerald-200/80 mt-2 pt-2 border-t border-white/10">
            <span>OPD: ₹{metrics.opdRevenue.toLocaleString()}</span>
            <span>IPD: ₹{metrics.ipdRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Inpatient Occupancy */}
        <div className="md-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bed Occupancy Rate</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <span className="material-symbols-outlined text-[20px]">hotel</span>
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{metrics.occupancyRate}%</p>
          <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
            {metrics.activeInpatients} Active Inpatients in Care
          </p>
        </div>

        {/* Patients & Caseload */}
        <div className="md-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Patients</span>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{metrics.totalPatients}</p>
          <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
            Active EHR Master Dossiers
          </p>
        </div>

        {/* OPD Completed Appointments */}
        <div className="md-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultations Billed</span>
            <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{metrics.completedAppointments}</p>
          <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
            Out of {metrics.totalAppointments} Booked Sessions
          </p>
        </div>
      </div>

      {/* Doctor Performance & Caseload Overview */}
      <div className="md-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-800">badge</span>
            Medical Staff Caseload &amp; Physician Roster
          </h2>
          <span className="text-xs font-bold text-slate-500">{doctors.length} Registered Senior Physicians</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0">
                {doc.name.replace('Dr. ', '').charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm">{doc.name}</h4>
                <p className="text-xs text-emerald-800 font-semibold">{doc.specialization || doc.department}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{doc.qualification} &bull; Reg: {doc.regNumber || 'AYU-Active'}</p>
                <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                  <span className="text-slate-600">OPD Fee: <b className="text-slate-900">₹{doc.consultationFee}</b></span>
                  <span className="font-bold text-emerald-800">{doc.opdSchedule}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Patient History Master Dossier Ledger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-800">folder_shared</span>
              Patient Complete Master History Ledger
            </h2>
            <p className="text-xs text-slate-600">
              Audit the comprehensive longitudinal EHR for any patient: all OPD visits, medications, clinical therapies, and financial invoices.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search patient name or ID..."
              value={searchPatientQuery}
              onChange={(e) => setSearchPatientQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selector List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs space-y-2 max-h-[580px] overflow-y-auto">
            <span className="text-xs font-bold text-slate-500 uppercase px-2 block">Select Patient Dossier</span>
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPatient(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold">{p.name}</span>
                    <span className="text-xs font-mono font-bold text-slate-500">{p.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{p.age}y / {p.gender}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-800 font-semibold">{p.dosha.primary}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Patient Comprehensive Dossier View */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6 max-h-[580px] overflow-y-auto">
            {selectedPatient ? (
              <>
                {/* Dossier Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-bold text-lg">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{selectedPatient.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Patient ID: <span className="font-mono font-bold">{selectedPatient.id}</span> &bull; Phone: {selectedPatient.phone} &bull; Blood: {selectedPatient.bloodGroup}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase">
                    {selectedPatient.status}
                  </span>
                </div>

                {/* Clinical Metadata Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">Prakriti Dosha</span>
                    <span className="font-extrabold text-amber-900">{selectedPatient.dosha.primary} ({selectedPatient.dosha.dominantState})</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">Attending Doctor</span>
                    <span className="font-extrabold text-slate-900">{selectedPatient.primaryPhysician}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">Care Protocol</span>
                    <span className="font-extrabold text-emerald-800">{selectedPatient.careMode}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">Room / Ward</span>
                    <span className="font-extrabold text-slate-900">{selectedPatient.assignedRoomName || 'Outpatient'}</span>
                  </div>
                </div>

                {/* Historical Consultations with Medicine & Procedures */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">clinical_notes</span>
                    Historical Clinical Consultations ({patientVisits.length})
                  </h4>

                  {patientVisits.map((v) => (
                    <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 text-sm">{v.date} &bull; {v.diagnosis || v.summary}</span>
                        <span className="text-emerald-800">{v.doctorName}</span>
                      </div>
                      <p className="text-slate-600 italic">&ldquo;{v.notes || v.clinicalNotes || v.summary}&rdquo;</p>

                      {/* Medicines */}
                      {v.prescriptions && v.prescriptions.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Medicines Prescribed:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {v.prescriptions.map((rx, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                                {rx.medicineName} ({rx.dosage})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Procedures */}
                      {v.procedures && v.procedures.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Procedures Administered:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {v.procedures.map((pr, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[11px] font-bold">
                                {pr.procedureName} ({pr.duration})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Billing History Ledger */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">receipt_long</span>
                    Financial &amp; Invoicing Ledger ({patientInvoices.length})
                  </h4>

                  {patientInvoices.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No invoices logged for this patient yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {patientInvoices.map((inv) => (
                        <div key={inv.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-slate-900">{inv.id}</span>
                            <span className="text-slate-500 ml-2">&bull; {inv.createdAt}</span>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {inv.items.length} items &bull; Subtotal: ₹{inv.subtotal} {inv.discountApprovedAmount > 0 ? `(-₹${inv.discountApprovedAmount} discount)` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-900 text-sm block">₹{inv.finalTotal}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Select a patient on the left to inspect their master history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
