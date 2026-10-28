import React, { useState } from 'react';
import { Appointment, Patient } from '../../types';
import { dataStoreService } from '../../services/data-store.service';
import { ScreenId } from '../common/Sidebar';

interface DoctorDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectPatient: (patientId: string) => void;
  onShowToast: (msg: string) => void;
}

export const DoctorDashboardView: React.FC<DoctorDashboardViewProps> = ({
  onNavigate,
  onSelectPatient,
  onShowToast,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(dataStoreService.getAppointments());
  const [statusFilter, setStatusFilter] = useState<'All' | 'Scheduled' | 'In Consultation' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Quick Vitals State
  const [vitalsPatientId, setVitalsPatientId] = useState('BNC-1042');
  const [vitalBp, setVitalBp] = useState('120/80');
  const [vitalPulse, setVitalPulse] = useState(72);
  const [vitalWeight, setVitalWeight] = useState(74);

  // New Walk-in State
  const [walkInName, setWalkInName] = useState('');
  const [walkInAge, setWalkInAge] = useState(38);
  const [walkInGender, setWalkInGender] = useState('Female');
  const [walkInComplaint, setWalkInComplaint] = useState('');
  const [walkInDosha, setWalkInDosha] = useState('Vata-Pitta');

  const refreshData = () => {
    setAppointments(dataStoreService.getAppointments());
  };

  const handleStartConsultation = (apt: Appointment) => {
    dataStoreService.updateAppointmentStatus(apt.id, 'In Consultation');
    refreshData();
    onShowToast(`Consultation started for ${apt.patientName} (${apt.tokenNumber})`);
    onSelectPatient(apt.patientId);
    onNavigate('patient-consultation');
  };

  const handleCompleteConsultation = (apt: Appointment) => {
    const invoice = dataStoreService.completeAppointmentAndSendToBilling(apt.id);
    refreshData();
    onShowToast(`Consultation completed for ${apt.patientName}! Assigned to Receptionist for billing (${invoice.id}).`);
  };

  const handleCallPatient = (apt: Appointment) => {
    onShowToast(`📢 Chime: Patient ${apt.patientName} (${apt.tokenNumber}) called to Chamber 03`);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const consultation = dataStoreService.getConsultationByPatientId(vitalsPatientId);
    consultation.vitals.bloodPressure = vitalBp;
    consultation.vitals.pulseNadi = Number(vitalPulse);
    consultation.vitals.bodyWeightKg = Number(vitalWeight);
    dataStoreService.saveConsultation(consultation);
    setShowVitalsModal(false);
    onShowToast('Vital signs baseline updated successfully in mock JSON.');
  };

  const handleSaveWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName) return;

    const patientId = `BNC-PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient: Patient = {
      id: patientId,
      name: walkInName,
      dob: '1986-04-12',
      age: walkInAge,
      gender: walkInGender as Patient['gender'],
      phone: '+91 98000 ' + Math.floor(10000 + Math.random() * 90000),
      address: 'Bethany Wellness Walk-in Guest',
      emergencyContact: {
        name: 'Family Member',
        relation: 'Spouse',
        phone: '+91 98000 00000',
      },
      bloodGroup: 'O+',
      dosha: {
        primary: walkInDosha,
        vataPercentage: 40,
        pittaPercentage: 40,
        kaphaPercentage: 20,
        dominantState: 'Initial Walk-in evaluation',
      },
      allergies: ['None declared'],
      chronicConditions: [walkInComplaint || 'Fatigue'],
      careMode: 'Outpatient Walk-in',
      primaryPhysician: 'Dr. Sarah Jenkins',
      dietaryPreference: 'Standard Ayurvedic Vegetarian',
      status: 'Active Consultation',
      registrationDate: new Date().toISOString().split('T')[0],
    };

    dataStoreService.savePatient(newPatient);

    dataStoreService.addAppointment({
      time: 'Just Now',
      patientId,
      patientName: walkInName,
      ageGender: `${walkInAge}y / ${walkInGender}`,
      department: 'Ayurvedic OPD',
      physician: 'Dr. Sarah Jenkins',
      chiefComplaint: walkInComplaint || 'Acute Symptom Consultation',
      treatmentName: 'Nadi Pariksha & Evaluation',
      treatmentTag: walkInDosha,
      doshaState: walkInDosha,
      status: 'Waiting',
      waitingMinutes: 0,
    });

    refreshData();
    setShowWalkInModal(false);
    setWalkInName('');
    setWalkInComplaint('');
    onShowToast(`Walk-in patient ${walkInName} registered and added to waiting queue.`);
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'In Consultation'
        ? apt.status === 'In Consultation'
        : statusFilter === 'Scheduled'
        ? apt.status === 'Scheduled' || apt.status === 'Waiting' || apt.status === 'Checked In' || apt.status === 'Confirmed'
        : apt.status === statusFilter;

    const matchesSearch =
      !searchQuery ||
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doshaState.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const nextPatient = appointments.find((a) => a.status === 'Waiting') || appointments[1];

  return (
    <div className="space-y-6">
      {/* Page Title & Main Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl md:text-3xl text-forest-deep font-bold tracking-tight">
            Doctor Clinical Dashboard
          </h1>
          <p className="font-body-md text-sm md:text-base text-on-surface-variant mt-1">
            Holistic outpatient workflow, diagnostic queue, and therapeutic adherence monitoring.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('doctor-appointments')}
            className="md-btn md-btn-tonal flex-1 sm:flex-initial"
            title="View appointments and dispatch billing to receptionist"
          >
            <span className="material-symbols-outlined text-[20px] text-emerald-800">calendar_month</span>
            <span className="truncate">My Appointments</span>
          </button>
          <button
            onClick={() => onNavigate('doctor-admitted')}
            className="md-btn md-btn-tonal flex-1 sm:flex-initial"
            title="Inpatient daily rounds & discharge recommendations"
          >
            <span className="material-symbols-outlined text-[20px] text-emerald-800">hotel</span>
            <span className="truncate">Admitted Rounds</span>
          </button>
          <button
            onClick={() => setShowVitalsModal(true)}
            className="md-btn md-btn-tonal flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[20px] text-bark-brown">medical_services</span>
            <span className="truncate">Quick Vitals</span>
          </button>
          <button
            onClick={() => setShowWalkInModal(true)}
            className="md-btn md-btn-filled flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="truncate">New Walk-in</span>
          </button>
        </div>
      </div>

      {/* METRIC BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Consultations */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Consultations</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">stethoscope</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-emerald-950 font-mono tabular-nums">
                {appointments.length}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">Scheduled</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center text-xs font-semibold">
            <div className="bg-emerald-50 py-1 rounded-lg text-emerald-800">
              <span className="font-bold">{appointments.filter((a) => a.status === 'Completed').length}</span> Done
            </div>
            <div className="bg-amber-50 py-1 rounded-lg text-amber-800">
              <span className="font-bold">{appointments.filter((a) => a.status === 'In Consultation').length}</span> In-Prog
            </div>
            <div className="bg-slate-100 py-1 rounded-lg text-slate-700">
              <span className="font-bold">{appointments.filter((a) => a.status === 'Waiting' || a.status === 'Scheduled').length}</span> Left
            </div>
          </div>
        </div>

        {/* Card 2: Waiting Queue */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waiting Queue</span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-emerald-950 font-mono tabular-nums">
                {appointments.filter((a) => a.status === 'Waiting').length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Patients waiting in lobby</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Avg. wait: <strong className="text-slate-800 font-mono">12 mins</strong></span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Ready
            </span>
          </div>
        </div>

        {/* Card 3: Prescriptions Issued */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescriptions Issued</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">prescriptions</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-emerald-950 font-mono tabular-nums">14</span>
              <span className="text-xs text-slate-500 font-medium">this week</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Formulations logged</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">+3 vs last week</span>
          </div>
        </div>

        {/* Card 4: Therapy Follow-ups */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Therapy Follow-ups</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">self_improvement</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-emerald-950 font-mono tabular-nums">5</span>
              <span className="text-xs text-amber-700 font-bold">due today</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Panchakarma track</span>
            <span className="text-emerald-800 font-bold">2 Reviewed</span>
          </div>
        </div>
      </div>

      {/* MAIN APPOINTMENTS TABLE + NEXT PATIENT RAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* TABLE MODULE (3 cols wide on desktop) */}
        <div className="lg:col-span-3 md-card flex flex-col">
          {/* Card Header & Filter Chips */}
          <div className="md-card-header bg-slate-50/70">
            <div>
              <h2 className="text-base font-bold text-emerald-950">
                Today's Appointments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage consultation orders, clinical notes, and herbal dispensations.
              </p>
            </div>

            {/* Quick Filter Segmented Buttons */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
              {(['All', 'Scheduled', 'In Consultation', 'Completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  {filter === 'All' ? `All (${appointments.length})` : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Search Sub-Toolbar */}
          <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, ID, or Dosha..."
                className="w-full pl-9 pr-4 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto text-slate-500 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">filter_list</span>
              <span>Sorted by Token # (Ascending)</span>
            </div>
          </div>

          {/* Appointments Responsive M3 Table */}
          <div className="overflow-x-auto">
            <table className="md-table">
              <thead>
                <tr>
                  <th>Token / Time</th>
                  <th>Patient Name &amp; ID</th>
                  <th>Age / Gender</th>
                  <th>Chief Complaint / Treatment</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => {
                  const isInConsultation = apt.status === 'In Consultation';
                  const isWaiting = apt.status === 'Waiting';
                  const isCompleted = apt.status === 'Completed';

                  return (
                    <tr
                      key={apt.id}
                      className={isInConsultation ? 'bg-emerald-50/60' : ''}
                    >
                      <td>
                        <span className="font-extrabold text-emerald-950 font-mono block">{apt.tokenNumber}</span>
                        <span className="text-slate-500 text-xs font-semibold font-mono">{apt.time}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            onSelectPatient(apt.patientId);
                            onNavigate('patient-consultation');
                          }}
                          className="font-bold text-slate-900 hover:text-emerald-800 text-left cursor-pointer transition-colors"
                        >
                          {apt.patientName}
                        </button>
                        <span className="text-slate-400 text-xs font-mono block">{apt.patientId}</span>
                      </td>
                      <td className="text-slate-600 text-xs font-medium">{apt.ageGender}</td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-900 text-xs">{apt.treatmentName}</span>
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                            {apt.treatmentTag}
                          </span>
                        </div>
                      </td>
                      <td>
                        {isInConsultation && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-white text-xs font-bold shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                            In Chamber
                          </span>
                        )}
                        {isWaiting && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Waiting
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                            <span className="material-symbols-outlined text-[14px] text-emerald-700">check_circle</span>
                            Completed
                          </span>
                        )}
                        {!isInConsultation && !isWaiting && !isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                            {apt.status}
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                          {isInConsultation ? (
                            <>
                              <button
                                onClick={() => {
                                  onSelectPatient(apt.patientId);
                                  onNavigate('patient-consultation');
                                }}
                                className="md-btn md-btn-filled text-[11px] py-1.5 px-3 min-h-[32px]"
                              >
                                <span>Open Case Sheet</span>
                              </button>
                              <button
                                onClick={() => handleCompleteConsultation(apt)}
                                className="md-btn md-btn-tonal text-[11px] py-1.5 px-2.5 min-h-[32px]"
                                title="Finish & Sign Off"
                              >
                                <span>Sign Off</span>
                              </button>
                            </>
                          ) : isWaiting ? (
                            <button
                              onClick={() => handleStartConsultation(apt)}
                              className="md-btn md-btn-tonal text-[11px] py-1.5 px-3 min-h-[32px]"
                            >
                              <span className="material-symbols-outlined text-sm">play_arrow</span>
                              <span>Start Consultation</span>
                            </button>
                          ) : isCompleted ? (
                            <button
                              onClick={() => {
                                onSelectPatient(apt.patientId);
                                onNavigate('patient-consultation');
                              }}
                              className="md-btn md-btn-outlined text-[11px] py-1.5 px-3 min-h-[32px]"
                            >
                              <span>Prescribe Refill</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onSelectPatient(apt.patientId);
                                onNavigate('patient-consultation');
                              }}
                              className="md-btn md-btn-outlined text-[11px] py-1.5 px-3 min-h-[32px]"
                            >
                              <span>View History</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-emerald-950 font-bold shadow-2xs">
                OPD Chamber 03 Active
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NEXT IN QUEUE & BOTANICAL PROTOCOL */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card: Next in Queue */}
          {nextPatient && (
            <div className="md-card">
              <div className="md-card-header bg-emerald-50/70">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700 text-[20px]">
                    record_voice_over
                  </span>
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Next in Queue
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200">
                  Lobby Waiting
                </span>
              </div>

              <div className="md-card-body space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                    {nextPatient.patientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-emerald-950 leading-tight">
                      {nextPatient.patientName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {nextPatient.patientId} · Token {nextPatient.tokenNumber}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-amber-800 text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      <span>Waiting for {nextPatient.waitingMinutes || 14} mins</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Dosha Constitution:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      {nextPatient.doshaState || 'Vata-Kapha Predominant'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Scheduled Therapy:</span>
                    <span className="font-bold text-slate-800">{nextPatient.treatmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Allergies / Cautions:</span>
                    <span className="text-amber-900 font-medium bg-amber-50 px-2 py-1 rounded-md block border border-amber-200">No mustard oil external applications</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => handleCallPatient(nextPatient)}
                    className="md-btn md-btn-filled w-full font-bold"
                >
                  <span className="material-symbols-outlined text-base">notifications_active</span>
                  <span>Call Patient to Chamber</span>
                </button>
                <button
                  onClick={() => {
                    onSelectPatient(nextPatient.patientId);
                    onNavigate('patient-consultation');
                  }}
                  className="md-btn md-btn-outlined w-full"
                >
                  <span className="material-symbols-outlined text-base">folder_open</span>
                  <span>Open Case Sheet</span>
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Botanical Protocol Notice */}
          <div className="bg-surface-container-low border border-sage-wash rounded-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[18px]">eco</span>
              <span>Seasonal Ritucharya Alert</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Sharad Ritu protocol is in effect. Patients with high Pitta manifestation should be evaluated for
              mild Tikta Ghrita intake and cooling sheetali pranayama instructions.
            </p>
            <div className="mt-3 pt-2 border-t border-sage-wash/40 flex items-center justify-between text-xs text-secondary font-semibold">
              <span className="flex items-center gap-1 cursor-pointer hover:underline">
                View Formulary Directives
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK VITALS ENTRY MODAL */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sage-wash mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">monitor_heart</span>
                <h3 className="font-bold text-forest-deep text-base">Quick Vitals Entry</h3>
              </div>
              <button
                onClick={() => setShowVitalsModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-forest-deep mb-1">Select Patient</label>
                <select
                  value={vitalsPatientId}
                  onChange={(e) => setVitalsPatientId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                >
                  <option value="BNC-1042">Robert Chen (BNC-1042)</option>
                  <option value="BNC-PT-8821">Ananya Sharma (BNC-PT-8821)</option>
                  <option value="BNC-PT-9042">Rohan Mehra (BNC-PT-9042)</option>
                  <option value="BNC-PT-8710">Deepa Nair (BNC-PT-8710)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitalBp}
                    onChange={(e) => setVitalBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">Pulse (Nadi)</label>
                  <input
                    type="number"
                    value={vitalPulse}
                    onChange={(e) => setVitalPulse(Number(e.target.value))}
                    placeholder="72"
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={vitalWeight}
                    onChange={(e) => setVitalWeight(Number(e.target.value))}
                    placeholder="74"
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-sage-wash flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-sage-wash hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-container"
                >
                  Save Baseline Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW WALK-IN PATIENT MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sage-wash mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">person_add</span>
                <h3 className="font-bold text-forest-deep text-base">New Walk-in Patient Entry</h3>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveWalkIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-forest-deep mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Meenakshi Sundaram"
                  className="w-full text-xs p-2.5 rounded-lg bg-surface border border-sage-wash"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">Age</label>
                  <input
                    type="number"
                    value={walkInAge}
                    onChange={(e) => setWalkInAge(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">Gender</label>
                  <select
                    value={walkInGender}
                    onChange={(e) => setWalkInGender(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">Initial Dosha Estimate</label>
                  <select
                    value={walkInDosha}
                    onChange={(e) => setWalkInDosha(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  >
                    <option value="Vata-Pitta">Vata-Pitta</option>
                    <option value="Pitta-Kapha">Pitta-Kapha</option>
                    <option value="Kapha-Vata">Kapha-Vata</option>
                    <option value="Tridoshic">Tridoshic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest-deep mb-1">Chief Complaint</label>
                  <input
                    type="text"
                    value={walkInComplaint}
                    onChange={(e) => setWalkInComplaint(e.target.value)}
                    placeholder="e.g. Acute migraine, digestive pain"
                    className="w-full text-xs p-2 rounded-lg bg-surface border border-sage-wash"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-sage-wash flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-sage-wash hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-container"
                >
                  Generate Token & Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
