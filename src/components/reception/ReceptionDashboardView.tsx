import React, { useState } from 'react';
import { Appointment } from '../../types';
import { dataStoreService } from '../../services/data-store.service';
import { ScreenId } from '../common/Sidebar';

interface ReceptionDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectPatient: (patientId: string) => void;
  onShowToast: (msg: string) => void;
}

export const ReceptionDashboardView: React.FC<ReceptionDashboardViewProps> = ({
  onNavigate,
  onSelectPatient,
  onShowToast,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(dataStoreService.getAppointments());

  const handleUpdateStatus = (id: string, newStatus: Appointment['status'], patientName: string) => {
    dataStoreService.updateAppointmentStatus(id, newStatus);
    setAppointments(dataStoreService.getAppointments());
    onShowToast(`Updated status of ${patientName} to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Section Title and Date */}
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-gray-900 tracking-tight">Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Today's operational snapshot.</p>
        </div>
        <p className="text-sm font-semibold text-secondary">Tuesday, Oct 24</p>
      </div>

      {/* Primary Modules Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Billing & Invoices Card (Highlighted) */}
        <div
          onClick={() => onNavigate('reception-billing')}
          className="md-card md-card-interactive p-6 flex flex-col justify-between group border-2 border-emerald-500 bg-gradient-to-br from-white to-emerald-50/40"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
                Active Desk
              </span>
            </div>
            <h3 className="text-lg font-bold text-emerald-950 mb-1">Invoices &amp; Billing</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
              OPD consultations, generate discharge bills, request admin discounts, collect payments &amp; print receipts.
            </p>
          </div>
          <div className="flex items-center text-emerald-800 font-bold text-sm group-hover:translate-x-1 transition-transform">
            <span>Manage Bills</span>
            <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
          </div>
        </div>

        {/* Room Admissions Queue */}
        <div
          onClick={() => onNavigate('reception-admissions')}
          className="md-card md-card-interactive p-6 flex flex-col justify-between group border-2 border-amber-300 bg-gradient-to-br from-white to-amber-50/30"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-2xl">hotel_class</span>
              </div>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
                Doctor Referrals
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Admissions &amp; Beds</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
              Assign rooms to patients referred by doctors for Panchakarma inpatient admission.
            </p>
          </div>
          <div className="flex items-center text-amber-900 font-bold text-sm group-hover:translate-x-1 transition-transform">
            <span>Assign Rooms</span>
            <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
          </div>
        </div>

        {/* Patient Registration Card */}
        <div
          onClick={() => onNavigate('patient-registration')}
          className="md-card md-card-interactive p-6 flex flex-col justify-between group"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors shadow-2xs">
                <span className="material-symbols-outlined text-2xl">person_add</span>
              </div>
              <span className="bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-full">
                Front Intake
              </span>
            </div>
            <h3 className="text-lg font-bold text-emerald-950 mb-1">Patient Registration</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
              Intake new walk-in patients, register emergency contacts, and establish dosha profiles.
            </p>
          </div>
          <div className="flex items-center text-emerald-800 font-bold text-sm group-hover:translate-x-1 transition-transform">
            <span>Register New</span>
            <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
          </div>
        </div>

        {/* Facility Management Card */}
        <div
          onClick={() => onNavigate('facilities')}
          className="md-card md-card-interactive p-6 flex flex-col justify-between group"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors shadow-2xs">
                <span className="material-symbols-outlined text-2xl">meeting_room</span>
              </div>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                Live Status
              </span>
            </div>
            <h3 className="text-lg font-bold text-emerald-950 mb-1">Facility Cottages</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
              Monitor room occupancy, hygiene sanitation status, and bed turn-around times.
            </p>
          </div>
          <div className="flex items-center text-emerald-800 font-bold text-sm group-hover:translate-x-1 transition-transform">
            <span>View Rooms</span>
            <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* Today's Appointments Table Section */}
      <div className="md-card">
        <div className="md-card-header bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700">calendar_today</span>
            <h3 className="text-base font-bold text-emerald-950">Today's Outpatient Appointments</h3>
          </div>
          <button
            onClick={() => onNavigate('doctor-dashboard')}
            className="md-btn md-btn-sm md-btn-tonal cursor-pointer"
          >
            <span>View Full Schedule</span>
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="md-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Time</th>
                <th>Department</th>
                <th>Physician</th>
                <th>Status</th>
                <th className="text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 8).map((apt) => {
                const isCheckedIn = apt.status === 'Checked In';
                const isWaiting = apt.status === 'Waiting';
                const isConfirmed = apt.status === 'Confirmed';
                const isDelayed = apt.status === 'Delayed';
                const isCompleted = apt.status === 'Completed';

                return (
                  <tr key={apt.id}>
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
                      <span className="block text-xs text-slate-400 font-mono">{apt.patientId}</span>
                    </td>
                    <td className="text-slate-600 font-mono font-medium">{apt.time}</td>
                    <td className="text-slate-800 font-medium">{apt.department}</td>
                    <td className="text-slate-600 font-medium">{apt.physician}</td>
                    <td>
                      {isCheckedIn && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Checked In
                        </span>
                      )}
                      {isWaiting && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Waiting
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                          Confirmed
                        </span>
                      )}
                      {isDelayed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-200">
                          Delayed
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Completed
                        </span>
                      )}
                      {!isCheckedIn && !isWaiting && !isConfirmed && !isDelayed && !isCompleted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {apt.status}
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {!isCheckedIn && !isCompleted && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Checked In', apt.patientName)}
                            className="md-btn md-btn-sm md-btn-tonal cursor-pointer"
                          >
                            Check In
                          </button>
                        )}
                        {isCheckedIn && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'Waiting', apt.patientName)}
                            className="md-btn md-btn-sm bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer"
                          >
                            Call Lobby
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onSelectPatient(apt.patientId);
                            onNavigate('patient-consultation');
                          }}
                          className="md-btn md-btn-sm md-btn-outlined p-1.5 hover:border-emerald-600 transition-colors"
                          title="Open Patient Record"
                        >
                          <span className="material-symbols-outlined text-base">folder_open</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
