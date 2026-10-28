export type UserRole = 'doctor' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  qualification?: string;
  department?: string;
  initials: string;
  avatarUrl?: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface DoshaProfile {
  primary: string;
  secondary?: string;
  vataPercentage: number;
  pittaPercentage: number;
  kaphaPercentage: number;
  dominantState: string; // e.g. 'Pitta Aggravated'
}

export interface Patient {
  id: string; // e.g. 'BNC-1042'
  name: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  phone: string;
  address: string;
  emergencyContact: EmergencyContact;
  bloodGroup: string;
  dosha: DoshaProfile;
  allergies: string[];
  chronicConditions: string[];
  careMode: string; // 'In-Clinic Protocol', 'Outpatient', 'Panchakarma Residency'
  primaryPhysician: string;
  assignedRoomId?: string;
  assignedRoomName?: string;
  dietaryPreference: string;
  status: 'Active Consultation' | 'In-Patient Active' | 'Discharged' | 'Scheduled';
  activeProgram?: string;
  programDuration?: string; // 'Day 12 of 21'
  registrationDate: string;
  admissionRecommended?: boolean;
  admissionRecommendationNote?: string;
  dischargeRecommended?: boolean;
  dischargeNote?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  medicineName: string;
  formulation: string; // e.g. '250g Jar · Root Extract'
  dosage: string; // '1 tsp twice daily after meals with warm milk'
  duration: string; // '21 Days'
  status: 'Active' | 'Completed' | 'Discontinued';
  category: string;
  price?: number;
  notes?: string;
  timing?: string;
  instructions?: string;
}

export interface ClinicalProcedure {
  id: string;
  patientId: string;
  procedureName: string; // e.g. 'Abhyanga Full Body Massage', 'Shirodhara Medicated Oil', 'Kati Basti', 'Swedana Herbal Steam'
  therapist: string;
  therapistName?: string;
  sessionDate: string;
  duration: string; // '45 mins'
  status: 'Scheduled' | 'In Progress' | 'Completed';
  notes?: string;
  remarks?: string;
  charge: number; // e.g. 1500
}

export interface VitalSigns {
  bloodPressure: string; // '120/80'
  bpAssessment?: string; // 'Optimal'
  pulseNadi?: number; // 72
  pulse?: number;
  nadiGati?: string; // 'Sarpa Gati (Snake pulse)'
  bodyWeightKg?: number; // 74
  weightKg?: number;
  bmi?: number;
  weightChange?: string; // 'Stable -0.8kg'
  temperature?: string;
  recordedBy?: string;
  recordedAt?: string;
}

export interface InpatientDailyRound {
  id: string;
  patientId: string;
  patientName?: string;
  roomId: string;
  date: string;
  doctorName: string;
  vitals: VitalSigns;
  medicinesAdded: Prescription[] | string[];
  proceduresAdded: ClinicalProcedure[] | string[];
  doctorFeedback?: string;
  feedbackNotes?: string;
  dietaryAdjustments?: string;
  dietInstruction?: string;
  dischargeRecommended?: boolean;
  dischargeReason?: string;
  dischargeNote?: string;
}

export interface ConsultationEncounter {
  id: string;
  patientId: string;
  encounterDate: string;
  sessionNumber: number;
  cycleInfo: string; // 'Follow-up Cycle 2'
  physician: string;
  chiefComplaints: string;
  complaintTags: string[];
  ayurvedicDiagnosis: string;
  subDiagnosisNotes: string;
  vitals: VitalSigns;
  dietaryInstructions: string;
  nextFollowUpDate: string;
  nextFollowUpObjective: string;
  prescriptions: Prescription[];
  procedures?: ClinicalProcedure[];
  doctorNotes?: string;
  admissionRecommended?: boolean;
  admissionNote?: string;
  billed?: boolean;
  billedInvoiceId?: string;
}

export interface VisitHistoryItem {
  id: string;
  patientId: string;
  date: string;
  encounterType?: 'Intake' | 'Comprehensive' | 'Follow-up' | 'Inpatient Round' | string;
  type?: string;
  summary: string;
  diagnosis?: string;
  doctorName: string;
  colorTag: string; // 'primary' | 'secondary' | 'bark-brown'
  notes?: string;
  vitals?: VitalSigns;
  prescriptionSummary?: string;
  prescriptions?: Prescription[];
  procedures?: ClinicalProcedure[];
  clinicalNotes?: string;
  vitalsSummary?: string;
}

export interface BillItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Medicine' | 'Procedure' | 'Room Stay' | 'Nursing';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BillingInvoice {
  id: string; // 'INV-2024-001'
  patientId: string;
  patientName: string;
  doctorName: string;
  appointmentId?: string;
  roomId?: string;
  billType: 'OPD_CONSULTATION' | 'IPD_DISCHARGE';
  status: 'Pending Bill Generation' | 'Pending Discount Approval' | 'Finalized' | 'Paid';
  createdAt: string;
  items: BillItem[];
  subtotal: number;
  discountRequested?: {
    amount: number;
    percentage?: number;
    reason: string;
    requestedBy: string;
    requestedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNote?: string;
    approvedBy?: string;
    reviewedAt?: string;
  };
  discountApprovedAmount: number;
  taxRate: number; // 0.05
  taxAmount: number;
  finalTotal: number;
  paymentMode?: 'Cash' | 'Credit Card' | 'UPI' | 'Insurance';
  paidAt?: string;
  receiptNumber?: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  qualification: string;
  specialization?: string;
  department: string;
  regNumber?: string;
  roomNumber?: string;
  consultationFee: number;
  phone: string;
  email: string;
  opdSchedule: string;
  activePatientsCount: number;
  avatarUrl?: string;
}

export interface ReceptionistProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  shift: 'Morning (07:00 - 15:00)' | 'Evening (14:00 - 22:00)' | 'General (09:00 - 18:00)' | string;
  deskStation: string;
  deskNumber?: string;
  status?: string;
}

export interface RoomFacility {
  id: string;
  roomNumber: string;
  name: string; // 'Room 101 - Lotus Suite (AC)'
  shortName: string; // 'Lotus Suite'
  type: 'AC' | 'Non-AC' | string;
  category: 'Suite' | 'Deluxe' | 'Cottage' | 'Room';
  wing: string; // 'Wing A', 'Wing B', 'Eco-Zone 1', 'Eco-Zone 2'
  floor: string; // 'Ground Floor', 'First Floor', 'Second Floor'
  status: 'Available' | 'Occupied' | 'Sanitizing';
  tariffPerDay: number;
  tariffNote: string; // 'All-inclusive care', 'Ayurvedic Diet incl.'
  features: string[];
  amenities?: string[];
  careStaffAssigned?: string;
  svgType: 'lotus' | 'sandalwood' | 'bamboo' | 'neem' | 'tulsi' | 'jasmine';
  currentOccupant?: {
    patientId: string;
    patientName: string;
    physician: string;
    initials: string;
    stayProgress: string; // 'Day 4 of 7'
    expectedDischarge: string; // 'Tom. 11am'
    admissionDate?: string;
  };
  sanitization?: {
    protocol: string; // 'Herbal Fumigation Protocol'
    description: string; // 'Neem & camphor fogging. Est. release: 14:30'
    estTimeLeft: string; // 'Ready in 45m'
  };
}

export type FacilityRoom = RoomFacility;

export interface InventoryItem {
  id: string;
  code: string; // 'AYU-104'
  shortCode: string; // 'ASH'
  name: string;
  packaging: string; // '250g Jar'
  classification: 'Herbal Powders' | 'Ayurvedic Oils' | 'Capsules & Vati' | 'Elixirs & Arishta' | 'Clinical Supplies';
  batchNumber: string; // 'BTH-2023-88'
  expiryDate: string; // 'Nov 2024'
  expiryIso: string;
  stockLevel: number;
  maxCapacity: number;
  unitPrice: number;
  costPrice: number;
  reorderThreshold?: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL';
  statusText: string; // 'Low Stock (14 left)'
  storageRack: string;
}

export interface Appointment {
  id: string;
  tokenNumber: string; // '#TK-101'
  time: string; // '09:30 AM'
  patientId: string;
  patientName: string;
  ageGender: string; // '34y / Female'
  department: string;
  physician: string;
  chiefComplaint: string;
  treatmentName: string;
  treatmentTag: string;
  doshaState: string;
  status: 'Scheduled' | 'In Consultation' | 'Waiting' | 'Completed' | 'Checked In' | 'Confirmed' | 'Delayed';
  waitingMinutes?: number;
  consultationFee?: number;
  billedInvoiceId?: string;
}

export interface AuditLog {
  id: string;
  patientId: string;
  timestamp: string;
  author: string;
  authorRole: string;
  actionSummary: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}
