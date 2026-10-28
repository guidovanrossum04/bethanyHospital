import React, { useState } from 'react';
import { Patient, AuditLog } from '../../types';
import { dataStoreService } from '../../services/data-store.service';
import { ScreenId } from '../common/Sidebar';

interface EditPatientViewProps {
  patientId: string;
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

export const EditPatientView: React.FC<EditPatientViewProps> = ({
  patientId,
  onNavigate,
  onShowToast,
}) => {
  const patient = dataStoreService.getPatientById(patientId) || dataStoreService.getPatients()[0];

  // Form Fields
  const [fullName, setFullName] = useState(patient.name);
  const [dob, setDob] = useState(patient.dob);
  const [age, setAge] = useState(patient.age);
  const [gender, setGender] = useState(patient.gender);
  const [phone, setPhone] = useState(patient.phone);
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContact.name);
  const [emergencyRelation, setEmergencyRelation] = useState(patient.emergencyContact.relation);
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContact.phone);

  const [doshaPrimary, setDoshaPrimary] = useState(patient.dosha.primary);
  const [bloodGroup, setBloodGroup] = useState(patient.bloodGroup);
  const [allergiesText, setAllergiesText] = useState(patient.allergies.join(', '));
  const [chronicConditionsText, setChronicConditionsText] = useState(
    patient.chronicConditions.join(', ')
  );

  const [assignedRoom, setAssignedRoom] = useState(
    patient.assignedRoomName || 'Room 101 - Lotus Suite (AC)'
  );
  const [dietaryPreference, setDietaryPreference] = useState(patient.dietaryPreference);
  const [auditReason, setAuditReason] = useState(
    'Updated dosage tolerance and changed dietary protocol for monsoon season'
  );

  // Dynamic Audit logs for this patient
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(dataStoreService.getAuditLogs(patient.id));

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      const birthYear = new Date(val).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear)) {
        setAge(Math.max(1, currentYear - birthYear));
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditReason.trim()) {
      alert('Clinical Governance Protocol requires an explicit audit reason note.');
      return;
    }

    const updatedPatient: Patient = {
      ...patient,
      name: fullName,
      dob,
      age: Number(age),
      gender: gender as Patient['gender'],
      phone,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
      bloodGroup,
      dosha: {
        ...patient.dosha,
        primary: doshaPrimary,
      },
      allergies: allergiesText.split(',').map((s) => s.trim()).filter(Boolean),
      chronicConditions: chronicConditionsText.split(',').map((s) => s.trim()).filter(Boolean),
      assignedRoomName: assignedRoom,
      dietaryPreference,
    };

    dataStoreService.savePatient(updatedPatient, auditReason, 'Dr. Sarah Jenkins');
    setAuditLogs(dataStoreService.getAuditLogs(patient.id));
    onShowToast(`Patient details for ${fullName} updated and revision history recorded in mock JSON.`);
  };

  const handleExportAudit = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${patient.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Audit trail JSON exported for ${patient.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Context Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-forest-deep tracking-tight">
              Edit Patient Record - {patient.name} ({patient.id})
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> {patient.status}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Holistic Panchakarma Therapy & Chronic Wellness Rehabilitation Program
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportAudit}
            className="md-btn md-btn-elevated flex-1 sm:flex-initial"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span className="truncate">Export Audit Trail</span>
          </button>
          <button
            onClick={() => onNavigate('patient-consultation')}
            className="md-btn md-btn-tonal flex-1 sm:flex-initial"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span className="truncate">Clinical Chart View</span>
          </button>
        </div>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Form - Update Patient Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Personal Details Card */}
            <div className="md-card overflow-hidden">
              <div className="md-card-header">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Personal Details</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">Bio &amp; Identification</span>
              </div>

              <div className="p-6 space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block font-semibold text-forest-deep mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-bark-brown/30 bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary text-sm text-on-surface px-3.5 py-2.5"
                    />
                  </div>
                  {/* Date of Birth / Age */}
                  <div>
                    <label className="block font-semibold text-forest-deep mb-1.5">
                      Date of Birth / Age ({age} Yrs)
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dob}
                        onChange={handleDobChange}
                        className="w-full rounded-lg border border-bark-brown/30 bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary text-sm text-on-surface px-3.5 py-2.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Gender */}
                  <div>
                    <label className="block font-semibold text-forest-deep mb-1.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Patient['gender'])}
                      className="w-full rounded-lg border border-bark-brown/30 bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary text-sm text-on-surface px-3.5 py-2.5"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-Binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                  {/* Phone Number */}
                  <div>
                    <label className="block font-semibold text-forest-deep mb-1.5">Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-bark-brown/30 bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary text-sm text-on-surface px-3.5 py-2.5"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-3 text-outline text-[18px]">
                        call
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Relation */}
                <div>
                  <label className="block font-semibold text-forest-deep mb-1.5">
                    Emergency Contact & Relation
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="sm:col-span-5 rounded-lg border border-bark-brown/30 bg-surface text-sm text-on-surface px-3.5 py-2.5"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="sm:col-span-3 rounded-lg border border-bark-brown/30 bg-surface text-sm text-on-surface px-3.5 py-2.5"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="sm:col-span-4 rounded-lg border border-bark-brown/30 bg-surface text-sm text-on-surface px-3.5 py-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Clinical & Wellness Classification Card */}
            <div className="md-card overflow-hidden">
              <div className="md-card-header">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">vital_signs</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Clinical &amp; Wellness Classification
                  </h3>
                </div>
                <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                  Ayurvedic Diagnostics
                </span>
              </div>

              <div className="p-6 space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Dosha / Constitution */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1.5">
                      Dosha / Constitution
                    </label>
                    <select
                      value={doshaPrimary}
                      onChange={(e) => setDoshaPrimary(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 px-3.5 py-2.5"
                    >
                      <option value="Vata-Pitta">Vata-Pitta dominant</option>
                      <option value="Vata Dominant">Vata Dominant</option>
                      <option value="Pitta Dominant">Pitta Dominant</option>
                      <option value="Kapha Dominant">Kapha Dominant</option>
                      <option value="Pitta-Kapha">Pitta-Kapha dominant</option>
                      <option value="Tridoshic">Tridoshic Balanced</option>
                    </select>

                    <div className="flex gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        Vata (55%)
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        Pitta (35%)
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        Kapha (10%)
                      </span>
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1.5">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 px-3.5 py-2.5"
                    >
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>O+</option>
                      <option>O-</option>
                    </select>
                  </div>
                </div>

                {/* Known Allergies */}
                <div>
                  <label className="block font-semibold text-slate-900 mb-1.5">Known Allergies</label>
                  <input
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 px-3.5 py-2.5"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Separate multiple allergens with commas. Includes botanical oil and dietary contraindications.
                  </p>
                </div>

                {/* Chronic Conditions */}
                <div>
                  <label className="block font-semibold text-slate-900 mb-1.5">Chronic Conditions</label>
                  <input
                    type="text"
                    value={chronicConditionsText}
                    onChange={(e) => setChronicConditionsText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 px-3.5 py-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Ongoing Therapies / Room Allocation Card */}
            <div className="md-card overflow-hidden">
              <div className="md-card-header">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">meeting_room</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Therapies &amp; Campus Allocation
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">In-Patient Residency</span>
              </div>

              <div className="p-6 space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Assigned Room/Bed */}
                  <div>
                    <label className="block font-semibold text-forest-deep mb-1.5">
                      Assigned Room / Bed
                    </label>
                    <select
                      value={assignedRoom}
                      onChange={(e) => setAssignedRoom(e.target.value)}
                      className="w-full rounded-lg border border-bark-brown/30 bg-surface text-sm text-on-surface px-3.5 py-2.5"
                    >
                      <option>Room 101 - Lotus Suite (AC)</option>
                      <option>Room 102 - Neem Room (Non-AC)</option>
                      <option>Room 103 - Sandalwood Suite (AC)</option>
                      <option>Room 201 - Tulsi Haven (Non-AC)</option>
                      <option>Room 203 - Bamboo Suite (AC)</option>
                      <option>Out-Patient / Day Care Only</option>
                    </select>
                  </div>

                  {/* Dietary Preference */}
                  <div>
                    <label className="block font-semibold text-forest-deep mb-1.5">
                      Dietary Preference
                    </label>
                    <select
                      value={dietaryPreference}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      className="w-full rounded-lg border border-bark-brown/30 bg-surface text-sm text-on-surface px-3.5 py-2.5"
                    >
                      <option>Strict Sattvic Vegetarian</option>
                      <option>Standard Ayurvedic Vegetarian</option>
                      <option>Kitchari Detox Cleanse Protocol</option>
                      <option>Low-Sodium Pitta Pacifying</option>
                      <option>Raw Juicing & Herbal Broth</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Mandatory Audit Reason Note Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-secondary/40 p-6 shadow-xs ring-1 ring-secondary/20">
              <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-secondary mt-0.5 text-[22px]">
                  edit_note
                </span>
                <div>
                  <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider">
                    Reason for Update Note <span className="text-error font-bold">*</span>
                  </label>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                    Clinical Governance Protocol requires an explicit audit log reason for every modification made to active patient records.
                  </p>
                </div>
              </div>

              <textarea
                required
                rows={3}
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="State reason for changes (e.g. Updated dosage tolerance and changed dietary protocol for monsoon season)"
                className="w-full rounded-lg border border-bark-brown/40 bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm text-on-surface px-3.5 py-2.5"
              />

              <div className="flex justify-between items-center mt-2 text-xs text-outline">
                <span>Field will be cryptographically attributed to Dr. Sarah Jenkins</span>
                <span>{auditReason.length} / 250 chars</span>
              </div>
            </div>

            {/* Form Action Footer */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-3 pt-2 pb-6">
              <button
                type="button"
                onClick={() => onNavigate('patient-consultation')}
                className="md-btn md-btn-outlined flex-1 sm:flex-initial"
              >
                Cancel / Back
              </button>
              <button
                type="submit"
                className="md-btn md-btn-filled flex-1 sm:flex-initial"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Audit Log & Change History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Audit Card Header & Container */}
          <div className="bg-surface-container-lowest rounded-xl border border-sage-wash/60 overflow-hidden shadow-xs sticky top-24">
            <div className="px-6 py-4 bg-sun-warmth/60 border-b border-sage-wash/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-forest-deep">
                <span className="material-symbols-outlined text-[20px] text-bark-brown">verified_user</span>
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Patient Details Audit & Revision History
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                {auditLogs.length} Logs Recorded
              </span>
            </div>

            {/* Audit Trail Timeline Content */}
            <div className="p-6">
              <div className="relative border-l-2 border-sage-wash ml-3.5 space-y-7 pl-6 my-2">
                {auditLogs.map((log, idx) => (
                  <div key={log.id || idx} className="relative group">
                    <div
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ring-4 ${
                        idx === 0
                          ? 'bg-secondary ring-secondary-fixed/50'
                          : 'bg-surface-container-highest ring-surface-variant'
                      } flex items-center justify-center`}
                    />

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-forest-deep">{log.timestamp}</span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-bark-brown">
                          stethoscope
                        </span>
                        {log.author}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">
                      {log.actionSummary}
                    </p>

                    {log.oldValue && log.newValue && (
                      <div className="bg-surface-container-low p-2.5 rounded-lg border border-sage-wash/50 space-y-1.5 text-xs">
                        <div className="text-[11px] text-outline font-medium">Field: {log.fieldName}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant line-through text-[11px]">
                            {log.oldValue}
                          </span>
                          <span className="material-symbols-outlined text-outline text-[14px]">
                            arrow_forward
                          </span>
                          <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold text-[11px] border border-secondary/20">
                            {log.newValue}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Compliance Footer Badge inside Audit Card */}
              <div className="mt-6 pt-4 border-t border-sage-wash/40 flex items-center justify-between text-outline text-xs">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-bark-brown">lock</span>
                  Tamper-Evident System Log
                </span>
                <span>SHA-256 Validated</span>
              </div>
            </div>
          </div>

          {/* Quick Reference Patient Summary Card */}
          <div className="bg-surface-container-low rounded-xl border border-sage-wash/60 p-5 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-forest-deep uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-bark-brown text-[18px]">info</span>
              <span>Current Ayurvedic Care Summary</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-sage-wash/40">
                <span className="text-outline block">Dosha State</span>
                <span className="font-bold text-forest-deep">{patient.dosha.dominantState}</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-sage-wash/40">
                <span className="text-outline block">Primary Protocol</span>
                <span className="font-bold text-forest-deep">{patient.activeProgram}</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-sage-wash/40">
                <span className="text-outline block">Active Duration</span>
                <span className="font-bold text-forest-deep">{patient.programDuration}</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-sage-wash/40">
                <span className="text-outline block">Treating Doctor</span>
                <span className="font-bold text-forest-deep">{patient.primaryPhysician}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
