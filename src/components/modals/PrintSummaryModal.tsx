import React from 'react';
import { Patient, ConsultationEncounter } from '../../types';

interface PrintSummaryModalProps {
  patient: Patient;
  consultation: ConsultationEncounter;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintSummaryModal: React.FC<PrintSummaryModalProps> = ({
  patient,
  consultation,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-sage-wash print:hidden">
          <div className="flex items-center gap-2 text-forest-deep font-bold text-sm">
            <span className="material-symbols-outlined text-secondary">print</span>
            <span>Print Clinical Medical Summary</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Printable Paper Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-on-surface bg-white text-xs">
          {/* Clinic Brand Heading */}
          <div className="flex justify-between items-start border-b-2 border-primary pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-sun-warmth flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">spa</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary tracking-tight">Bethany Nature Care</h2>
                <p className="text-[11px] text-gray-500">Ayurvedic Clinical Center &amp; Panchakarma Sanatorium</p>
                <p className="text-[10px] text-gray-400">License: AYU-NAT-2024-9982 | Tel: +91 98765 43210</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded bg-gray-100 font-mono font-bold text-xs text-gray-800">
                {patient.id}
              </span>
              <p className="text-[11px] text-gray-500 mt-1">Date: {consultation.encounterDate}</p>
            </div>
          </div>

          {/* Patient Bio Strip */}
          <div className="grid grid-cols-4 gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Patient Name</span>
              <span className="font-bold text-gray-900 text-sm">{patient.name}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Age / Gender</span>
              <span className="font-medium text-gray-800">{patient.age} Yrs / {patient.gender}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Prakriti / Dosha</span>
              <span className="font-bold text-green-900">{patient.dosha.primary}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Blood Group</span>
              <span className="font-bold text-gray-900">{patient.bloodGroup}</span>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200 pb-1">
              Clinical Assessment &amp; Diagnosis
            </h4>
            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
              <p className="font-bold text-gray-900 text-sm">{consultation.ayurvedicDiagnosis}</p>
              <p className="text-gray-600 leading-relaxed">{consultation.subDiagnosisNotes}</p>
              <p className="text-[11px] text-gray-500 pt-1">
                <strong>Chief Complaints:</strong> {consultation.chiefComplaints}
              </p>
            </div>
          </div>

          {/* Vitals Baseline */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 border border-gray-200 rounded">
              <span className="text-gray-400 text-[10px] block">Blood Pressure</span>
              <span className="font-bold text-sm text-gray-900">{consultation.vitals.bloodPressure} mmHg</span>
            </div>
            <div className="p-2.5 border border-gray-200 rounded">
              <span className="text-gray-400 text-[10px] block">Pulse (Nadi)</span>
              <span className="font-bold text-sm text-gray-900">{consultation.vitals.pulseNadi} bpm</span>
            </div>
            <div className="p-2.5 border border-gray-200 rounded">
              <span className="text-gray-400 text-[10px] block">Body Weight</span>
              <span className="font-bold text-sm text-gray-900">{consultation.vitals.bodyWeightKg} kg</span>
            </div>
          </div>

          {/* Active Formulations Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-200 pb-1">
              Prescribed Formulations &amp; Schedule
            </h4>
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2 px-3">Remedy Name</th>
                  <th className="py-2 px-3">Dosage &amp; Anupana</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {consultation.prescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td className="py-2 px-3 font-semibold text-gray-900">
                      {rx.medicineName}
                      <span className="block text-[10px] text-gray-400 font-normal">{rx.formulation}</span>
                    </td>
                    <td className="py-2 px-3 text-gray-700">{rx.dosage}</td>
                    <td className="py-2 px-3 font-bold text-green-900">{rx.duration}</td>
                    <td className="py-2 px-3 font-semibold text-green-700">{rx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pathya Ahara / Dietary Advice */}
          <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900">
            <span className="font-bold block mb-0.5">Special Dietary &amp; Lifestyle Protocol:</span>
            <p className="leading-relaxed">{consultation.dietaryInstructions}</p>
          </div>

          {/* Signoff / Physician stamp */}
          <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
            <div>
              <p className="text-[11px] text-gray-500">Next Recommended Encounter:</p>
              <p className="font-bold text-gray-900 text-xs">{consultation.nextFollowUpDate}</p>
              <p className="text-[10px] text-gray-400">{consultation.nextFollowUpObjective}</p>
            </div>
            <div className="text-right space-y-1">
              <div className="w-36 border-b border-gray-400 mb-1 ml-auto" />
              <p className="font-bold text-gray-900 text-xs">{consultation.physician}</p>
              <p className="text-[10px] text-gray-500">BAMS (Ayurveda) · Registered Physician</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
