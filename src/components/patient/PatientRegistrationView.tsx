import React, { useState } from 'react';
import { Patient } from '../../types';
import { dataStoreService } from '../../services/data-store.service';
import { ScreenId } from '../common/Sidebar';

interface PatientRegistrationViewProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectPatient: (patientId: string) => void;
  onShowToast: (msg: string) => void;
}

export const PatientRegistrationView: React.FC<PatientRegistrationViewProps> = ({
  onNavigate,
  onSelectPatient,
  onShowToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Patient['gender']>('Female');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [doshaEstimate, setDoshaEstimate] = useState('Vata-Pitta');

  // Slip preview state
  const [submittedSlip, setSubmittedSlip] = useState<{
    id: string;
    name: string;
    date: string;
    ageDob: string;
    blood: string;
  } | null>(null);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      const birth = new Date(val);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      setAge(`${calculatedAge} years`);
    } else {
      setAge('');
    }
  };

  const handleClear = () => {
    setFullName('');
    setDob('');
    setAge('');
    setAddress('');
    setPhone('');
    setEmergencyPhone('');
    setEmergencyName('');
    setBloodGroup('');
    setChiefComplaint('');
    setSubmittedSlip(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dob || !bloodGroup) {
      alert('Please fill out all required fields marked with *');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `BNC-${new Date().getFullYear()}-${randomNum}`;
    const todayStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const parsedAge = parseInt(age) || 30;

    const newPatient: Patient = {
      id: newId,
      name: fullName,
      dob,
      age: parsedAge,
      gender,
      phone: phone || '+1 (555) 000-0000',
      address: address || 'Main Campus Registration',
      emergencyContact: {
        name: emergencyName || 'Primary Next of Kin',
        relation: 'Family',
        phone: emergencyPhone || '+1 (555) 000-0000',
      },
      bloodGroup,
      dosha: {
        primary: doshaEstimate,
        vataPercentage: 45,
        pittaPercentage: 40,
        kaphaPercentage: 15,
        dominantState: `${doshaEstimate} Intake Evaluation`,
      },
      allergies: ['None declared on intake'],
      chronicConditions: chiefComplaint ? [chiefComplaint] : ['General Wellness Consultation'],
      careMode: 'In-Clinic Protocol',
      primaryPhysician: 'Dr. Sarah Jenkins',
      dietaryPreference: 'Standard Ayurvedic Vegetarian',
      status: 'Active Consultation',
      registrationDate: new Date().toISOString().split('T')[0],
      activeProgram: 'Ayurvedic Wellness & Intake',
      programDuration: 'Day 1 of 14',
    };

    dataStoreService.savePatient(newPatient, 'Initial Patient Intake Created', 'Reception Desk');

    // Also register an appointment in waiting queue
    dataStoreService.addAppointment({
      time: '10:45 AM',
      patientId: newId,
      patientName: fullName,
      ageGender: `${parsedAge}y / ${gender}`,
      department: 'Ayurvedic OPD',
      physician: 'Dr. Sarah Jenkins',
      chiefComplaint: chiefComplaint || 'New Patient Intake Examination',
      treatmentName: 'Initial Nadi Pariksha Assessment',
      treatmentTag: doshaEstimate,
      doshaState: doshaEstimate,
      status: 'Waiting',
      waitingMinutes: 0,
    });

    setSubmittedSlip({
      id: newId,
      name: fullName,
      date: todayStr,
      ageDob: `${parsedAge} Yrs / ${dob}`,
      blood: bloodGroup,
    });

    onShowToast(`Patient ${fullName} registered with ID ${newId}`);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-forest-deep tracking-tight">
            New Patient Registration
          </h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Enter patient details below to generate a new medical record in mock JSON.
          </p>
        </div>
        <p className="text-sm font-semibold text-secondary">Tuesday, Oct 24</p>
      </div>

      {/* Registration Form */}
      <div className="md-card overflow-hidden">
        <div className="md-card-header">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">New Patient Registration Form</h3>
              <p className="text-xs text-slate-500">Clinical intake &amp; Ayurvedic constitutional questionnaire</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
            OPD Intake
          </span>
        </div>

        <form onSubmit={handleSubmit} className="md-card-body space-y-8">
          {/* Section: Personal Details */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-lg">badge</span>
              <span>Personal Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-forest-deep mb-1.5" htmlFor="regFullName">
                  Full Name *
                </label>
                <input
                  id="regFullName"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-deep mb-1.5" htmlFor="regDob">
                  Date of Birth *
                </label>
                <input
                  id="regDob"
                  type="date"
                  required
                  value={dob}
                  onChange={handleDobChange}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-deep mb-1.5" htmlFor="regAge">
                  Age (Auto-calculated)
                </label>
                <input
                  id="regAge"
                  type="text"
                  readOnly
                  placeholder="Auto-calculated"
                  value={age}
                  className="w-full bg-surface-container-low border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface-variant cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-deep mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Patient['gender'])}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-Binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-forest-deep mb-1.5">Initial Dosha Estimate</label>
                <select
                  value={doshaEstimate}
                  onChange={(e) => setDoshaEstimate(e.target.value)}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface"
                >
                  <option value="Vata-Pitta">Vata-Pitta</option>
                  <option value="Pitta-Kapha">Pitta-Kapha</option>
                  <option value="Kapha-Vata">Kapha-Vata</option>
                  <option value="Tridoshic">Tridoshic</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section: Contact Info */}
          <section>
            <h3 className="text-base font-bold text-forest-deep mb-4 border-b border-sage-wash/60 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">contact_phone</span>
              <span>Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-forest-deep mb-1.5" htmlFor="regAddress">
                  Full Address *
                </label>
                <textarea
                  id="regAddress"
                  required
                  rows={3}
                  placeholder="Enter complete residential address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-deep mb-1.5" htmlFor="regPhone">
                  Phone Number *
                </label>
                <input
                  id="regPhone"
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-deep mb-1.5" htmlFor="regEmergency">
                  Emergency Contact Number *
                </label>
                <input
                  id="regEmergency"
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
            </div>
          </section>

          {/* Section: Medical Basics */}
          <section>
            <h3 className="text-base font-bold text-forest-deep mb-4 border-b border-sage-wash/60 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">vital_signs</span>
              <span>Medical Basics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-forest-deep mb-1.5" htmlFor="regBlood">
                  Blood Group *
                </label>
                <select
                  id="regBlood"
                  required
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary"
                >
                  <option value="" disabled>Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-forest-deep mb-1.5">Chief Symptom / Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. Lumbar discomfort, digestive acidity, stress"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-surface border border-sage-wash rounded-lg px-4 py-2.5 text-sm text-on-surface"
                />
              </div>
            </div>
          </section>

          {/* Form Action Controls */}
          <div className="flex flex-wrap sm:flex-nowrap justify-end gap-3 pt-4 border-t border-sage-wash">
            <button
              type="button"
              onClick={handleClear}
              className="md-btn md-btn-outlined flex-1 sm:flex-initial"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="md-btn md-btn-filled flex-1 sm:flex-initial"
            >
              Submit Registration
            </button>
          </div>
        </form>
      </div>

      {/* REGISTRATION SLIP PREVIEW (shown immediately upon submission) */}
      {submittedSlip && (
        <div className="md-card overflow-hidden relative shadow-md animate-in fade-in zoom-in-95">
          <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700" />

          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-emerald-700 text-2xl">local_hospital</span>
                  <h3 className="text-xl font-bold text-slate-900">Patient Registration Slip</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Bethany Nature Care Clinical Management System • Medical Intake Slip
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  Assigned Patient ID
                </p>
                <p className="text-base font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-xl inline-block font-mono border border-emerald-200">
                  {submittedSlip.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-6">
              <div>
                <span className="text-slate-500 block mb-0.5">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">{submittedSlip.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Registration Date</span>
                <span className="font-semibold text-slate-800 font-mono">{submittedSlip.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Age / DOB</span>
                <span className="font-semibold text-slate-800">{submittedSlip.ageDob}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Blood Group</span>
                <span className="font-bold text-emerald-800 text-sm">{submittedSlip.blood}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <span className="text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                Token added to Doctor Chamber OPD queue (#TK-105+)
              </span>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handlePrintSlip}
                  className="md-btn md-btn-outlined flex-1 sm:flex-initial"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => {
                    onSelectPatient(submittedSlip.id);
                    onNavigate('patient-consultation');
                  }}
                  className="md-btn md-btn-filled flex-1 sm:flex-initial"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">folder_open</span>
                  <span>Open Case Sheet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
