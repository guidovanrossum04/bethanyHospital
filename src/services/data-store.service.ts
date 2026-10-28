import {
  Patient,
  ConsultationEncounter,
  VisitHistoryItem,
  RoomFacility,
  InventoryItem,
  Appointment,
  AuditLog,
  User,
  Prescription,
  ClinicalProcedure,
  InpatientDailyRound,
  BillingInvoice,
  BillItem,
  DoctorProfile,
  ReceptionistProfile,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_CONSULTATION,
  INITIAL_VISIT_HISTORY,
  INITIAL_AUDIT_LOGS,
  INITIAL_ROOMS,
  INITIAL_INVENTORY,
  INITIAL_APPOINTMENTS,
  INITIAL_USERS,
  INITIAL_DOCTORS,
  INITIAL_RECEPTIONISTS,
  INITIAL_PROCEDURES,
  INITIAL_INPATIENT_ROUNDS,
  INITIAL_INVOICES,
} from '../data/initial-mock-data';

const STORAGE_KEYS = {
  PATIENTS: 'bnc_mock_patients',
  CONSULTATIONS: 'bnc_mock_consultations',
  VISIT_HISTORY: 'bnc_mock_visit_history',
  AUDIT_LOGS: 'bnc_mock_audit_logs',
  ROOMS: 'bnc_mock_rooms',
  INVENTORY: 'bnc_mock_inventory',
  APPOINTMENTS: 'bnc_mock_appointments',
  CURRENT_USER: 'bnc_mock_current_user',
  THEME: 'bnc_app_theme',
  DOCTORS: 'bnc_mock_doctors',
  RECEPTIONISTS: 'bnc_mock_receptionists',
  PROCEDURES: 'bnc_mock_procedures',
  INPATIENT_ROUNDS: 'bnc_mock_inpatient_rounds',
  INVOICES: 'bnc_mock_invoices',
};

type Listener = () => void;

class DataStoreService {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying data store listener:', err);
      }
    });
  }

  private safeGet<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return fallback;
      return JSON.parse(stored) as T;
    } catch {
      return fallback;
    }
  }

  private safeSet<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  private ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      this.safeSet(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONSULTATIONS)) {
      this.safeSet(STORAGE_KEYS.CONSULTATIONS, [INITIAL_CONSULTATION]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISIT_HISTORY)) {
      this.safeSet(STORAGE_KEYS.VISIT_HISTORY, INITIAL_VISIT_HISTORY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.safeSet(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      this.safeSet(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      this.safeSet(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.safeSet(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.safeSet(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      this.safeSet(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECEPTIONISTS)) {
      this.safeSet(STORAGE_KEYS.RECEPTIONISTS, INITIAL_RECEPTIONISTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROCEDURES)) {
      this.safeSet(STORAGE_KEYS.PROCEDURES, INITIAL_PROCEDURES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INPATIENT_ROUNDS)) {
      this.safeSet(STORAGE_KEYS.INPATIENT_ROUNDS, INITIAL_INPATIENT_ROUNDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      this.safeSet(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    }
  }

  // --- Auth / User Operations ---
  public getCurrentUser(): User {
    return this.safeGet<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  public setCurrentUser(user: User): void {
    this.safeSet(STORAGE_KEYS.CURRENT_USER, user);
  }

  public switchRole(role: 'doctor' | 'receptionist' | 'admin'): User {
    const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    this.setCurrentUser(user);
    return user;
  }

  // --- Theme Operations ---
  public getTheme(): 'bethany' | 'carepulse' {
    return this.safeGet<'bethany' | 'carepulse'>(STORAGE_KEYS.THEME, 'bethany');
  }

  public setTheme(theme: 'bethany' | 'carepulse'): void {
    this.safeSet(STORAGE_KEYS.THEME, theme);
  }

  // --- Patient Operations ---
  public getPatients(): Patient[] {
    return this.safeGet<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  }

  public getPatientById(id: string): Patient | undefined {
    return this.getPatients().find((p) => p.id.toLowerCase() === id.toLowerCase());
  }

  public savePatient(patient: Patient, auditReason?: string, authorName?: string): Patient {
    const patients = this.getPatients();
    const index = patients.findIndex((p) => p.id === patient.id);
    let updated: Patient[];

    if (index >= 0) {
      const oldPatient = patients[index];
      patients[index] = { ...patient };
      updated = [...patients];

      if (auditReason) {
        this.addAuditLog({
          id: `aud-${Date.now()}`,
          patientId: patient.id,
          timestamp: 'Just now',
          author: authorName || 'Dr. Sarah Jenkins',
          authorRole: 'Doctor / Physician',
          actionSummary: auditReason,
          fieldName: 'Patient Record Updated',
          oldValue: `${oldPatient.dietaryPreference}, ${oldPatient.phone}`,
          newValue: `${patient.dietaryPreference}, ${patient.phone}`,
        });
      }
    } else {
      updated = [patient, ...patients];
      this.addAuditLog({
        id: `aud-${Date.now()}`,
        patientId: patient.id,
        timestamp: 'Just now',
        author: authorName || 'Sarah Jenkins',
        authorRole: 'Receptionist',
        actionSummary: `New patient registration created: ${patient.name}`,
        fieldName: 'Registration',
        oldValue: '-',
        newValue: 'Initial Record Initialized',
      });
    }

    this.safeSet(STORAGE_KEYS.PATIENTS, updated);
    return patient;
  }

  public deletePatient(id: string): void {
    const filtered = this.getPatients().filter((p) => p.id !== id);
    this.safeSet(STORAGE_KEYS.PATIENTS, filtered);
  }

  // Recommend Admission
  public recommendAdmission(patientId: string, note?: string): void {
    const patient = this.getPatientById(patientId);
    if (!patient) return;
    patient.admissionRecommended = true;
    patient.admissionRecommendationNote = note || 'Physician recommends Panchakarma inpatient admission.';
    this.savePatient(patient, `Admission recommended: ${patient.admissionRecommendationNote}`);
  }

  // Recommend Discharge
  public recommendDischarge(patientId: string, note?: string): void {
    const patient = this.getPatientById(patientId);
    if (!patient) return;
    patient.dischargeRecommended = true;
    patient.dischargeNote = note || 'Treatment objective achieved. Approved for final billing & discharge.';
    this.savePatient(patient, `Discharge recommended: ${patient.dischargeNote}`);
  }

  public getAdmissionRequests(): Patient[] {
    return this.getPatients().filter(
      (p) => p.admissionRecommended && p.status !== 'In-Patient Active'
    );
  }

  // --- Consultation & Prescription Operations ---
  public getConsultations(): ConsultationEncounter[] {
    return this.safeGet<ConsultationEncounter[]>(STORAGE_KEYS.CONSULTATIONS, [INITIAL_CONSULTATION]);
  }

  public getConsultationByPatientId(patientId: string): ConsultationEncounter {
    const list = this.getConsultations();
    const found = list.find((c) => c.patientId.toLowerCase() === patientId.toLowerCase());
    if (found) return found;

    const patient = this.getPatientById(patientId);
    return {
      id: `enc-${patientId}-01`,
      patientId: patientId,
      encounterDate: 'Today, 10:15 AM',
      sessionNumber: 1,
      cycleInfo: 'Cycle 1 (Initial Evaluation)',
      physician: patient?.primaryPhysician || 'Dr. Sarah Jenkins',
      chiefComplaints: 'General malaise, joint stiffness, digestive irregularities.',
      complaintTags: ['General Assessment', 'Nadi Pariksha'],
      ayurvedicDiagnosis: `${patient?.dosha.primary || 'Vata-Pitta'} Agnimandya`,
      subDiagnosisNotes: 'Metabolic sluggishness with primary dosha vitiation.',
      vitals: {
        bloodPressure: '120/80',
        bpAssessment: 'Optimal',
        pulseNadi: 72,
        nadiGati: 'Sarpa Gati',
        bodyWeightKg: 70,
        weightChange: 'Stable',
        recordedBy: 'Nurse Annapurna',
        recordedAt: 'Today, 09:30 AM',
      },
      dietaryInstructions: 'Sattvic warm diet, avoid cold drinks, drink warm cumin-coriander water.',
      nextFollowUpDate: 'In 14 Days',
      nextFollowUpObjective: 'Evaluation of digestion and pulse rhythm stabilization.',
      prescriptions: [
        {
          id: `rx-${Date.now()}-1`,
          patientId,
          medicineName: 'Ashwagandha Churna',
          formulation: '250g Jar · Root Extract',
          dosage: '1 tsp twice daily with warm milk',
          duration: '21 Days',
          status: 'Active',
          category: 'Herbal Powders',
          price: 320,
        },
      ],
      doctorNotes: 'Initial consultation conducted. Patient initiated on gentle detox.',
    };
  }

  public saveConsultation(encounter: ConsultationEncounter): void {
    const list = this.getConsultations();
    const idx = list.findIndex((c) => c.patientId === encounter.patientId);
    if (idx >= 0) {
      list[idx] = encounter;
    } else {
      list.push(encounter);
    }
    this.safeSet(STORAGE_KEYS.CONSULTATIONS, [...list]);
  }

  public addPrescription(patientId: string, prescription: Omit<Prescription, 'id' | 'patientId'>): Prescription {
    const consultation = this.getConsultationByPatientId(patientId);
    const newRx: Prescription = {
      ...prescription,
      id: `rx-${Date.now()}`,
      patientId,
    };
    consultation.prescriptions = [newRx, ...consultation.prescriptions];
    this.saveConsultation(consultation);
    return newRx;
  }

  public deletePrescription(patientId: string, rxId: string): void {
    const consultation = this.getConsultationByPatientId(patientId);
    consultation.prescriptions = consultation.prescriptions.filter((r) => r.id !== rxId);
    this.saveConsultation(consultation);
  }

  // --- Clinical Procedures Operations ---
  public getProcedures(patientId?: string): ClinicalProcedure[] {
    const all = this.safeGet<ClinicalProcedure[]>(STORAGE_KEYS.PROCEDURES, INITIAL_PROCEDURES);
    if (patientId) {
      return all.filter((p) => p.patientId.toLowerCase() === patientId.toLowerCase());
    }
    return all;
  }

  public addProcedure(proc: Omit<ClinicalProcedure, 'id'>): ClinicalProcedure {
    const all = this.getProcedures();
    const newProc: ClinicalProcedure = {
      ...proc,
      id: `proc-${Date.now()}`,
    };
    this.safeSet(STORAGE_KEYS.PROCEDURES, [newProc, ...all]);
    return newProc;
  }

  public updateProcedureStatus(id: string, status: ClinicalProcedure['status']): void {
    const all = this.getProcedures();
    const p = all.find((item) => item.id === id);
    if (p) {
      p.status = status;
      this.safeSet(STORAGE_KEYS.PROCEDURES, [...all]);
    }
  }

  // --- Inpatient Daily Rounds Operations (for Admitted patients) ---
  public getAdmittedPatients(): Patient[] {
    return this.getPatients().filter(
      (p) => p.status === 'In-Patient Active' || !!p.assignedRoomId
    );
  }

  public getInpatientRounds(patientId?: string): InpatientDailyRound[] {
    const all = this.safeGet<InpatientDailyRound[]>(STORAGE_KEYS.INPATIENT_ROUNDS, INITIAL_INPATIENT_ROUNDS);
    if (patientId) {
      return all.filter((r) => r.patientId.toLowerCase() === patientId.toLowerCase());
    }
    return all;
  }

  public addInpatientDailyRound(round: Omit<InpatientDailyRound, 'id'>): InpatientDailyRound {
    const all = this.getInpatientRounds();
    const newRound: InpatientDailyRound = {
      ...round,
      id: `round-${Date.now()}`,
    };
    this.safeSet(STORAGE_KEYS.INPATIENT_ROUNDS, [newRound, ...all]);

    // If medicines were added, append to active prescriptions
    if (round.medicinesAdded && round.medicinesAdded.length > 0) {
      const consultation = this.getConsultationByPatientId(round.patientId);
      const formattedMeds: Prescription[] = round.medicinesAdded.map((m, idx) => {
        if (typeof m === 'string') {
          return {
            id: `rx-round-${Date.now()}-${idx}`,
            patientId: round.patientId,
            medicineName: m,
            formulation: 'Inpatient Regimen',
            dosage: 'As instructed in daily round',
            duration: 'Inpatient stay',
            status: 'Active',
            category: 'Herbal Medicine',
            price: 280,
          };
        }
        return m;
      });
      consultation.prescriptions = [...formattedMeds, ...consultation.prescriptions];
      this.saveConsultation(consultation);
    }

    // If procedures were added, save to procedures collection
    if (round.proceduresAdded && round.proceduresAdded.length > 0) {
      round.proceduresAdded.forEach((p) => {
        if (typeof p === 'string') {
          this.addProcedure({
            patientId: round.patientId,
            procedureName: p,
            therapist: 'Assigned Panchakarma Therapist',
            sessionDate: round.date,
            duration: '45 mins',
            status: 'Scheduled',
            charge: 1200,
          });
        } else {
          this.addProcedure(p);
        }
      });
    }

    // If discharge recommended, flag patient
    if (round.dischargeRecommended) {
      this.recommendDischarge(round.patientId, round.dischargeReason || 'Doctor marked discharge from rounds');
    }

    return newRound;
  }

  // --- Visit History Operations ---
  public getVisitHistory(patientId: string): VisitHistoryItem[] {
    const all = this.safeGet<VisitHistoryItem[]>(STORAGE_KEYS.VISIT_HISTORY, INITIAL_VISIT_HISTORY);
    return all.filter((v) => v.patientId.toLowerCase() === patientId.toLowerCase());
  }

  public addVisitHistory(item: VisitHistoryItem): void {
    const all = this.safeGet<VisitHistoryItem[]>(STORAGE_KEYS.VISIT_HISTORY, INITIAL_VISIT_HISTORY);
    this.safeSet(STORAGE_KEYS.VISIT_HISTORY, [item, ...all]);
  }

  // --- Audit Logs Operations ---
  public getAuditLogs(patientId: string): AuditLog[] {
    const all = this.safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    return all.filter((a) => a.patientId.toLowerCase() === patientId.toLowerCase());
  }

  public addAuditLog(log: AuditLog): void {
    const all = this.safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.safeSet(STORAGE_KEYS.AUDIT_LOGS, [log, ...all]);
  }

  // --- Facilities / Room Operations ---
  public getRooms(): RoomFacility[] {
    return this.safeGet<RoomFacility[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }

  public updateRoom(room: RoomFacility): void {
    const rooms = this.getRooms();
    const idx = rooms.findIndex((r) => r.id === room.id);
    if (idx >= 0) {
      rooms[idx] = { ...room };
      this.safeSet(STORAGE_KEYS.ROOMS, [...rooms]);
    }
  }

  public addRoom(
    room: Partial<RoomFacility> & { roomNumber: string; name: string; tariffPerDay: number }
  ): RoomFacility {
    const rooms = this.getRooms();
    const id = `room-${Date.now()}`;
    const newRoom: RoomFacility = {
      ...room,
      id,
      roomNumber: room.roomNumber,
      name: room.name,
      shortName: room.shortName || room.name,
      type: room.type || 'AC',
      category: (room.category as RoomFacility['category']) || 'Cottage',
      wing: room.wing || 'Vata Serenity Wing',
      floor: room.floor || 'Ground Floor',
      status: 'Available',
      tariffPerDay: room.tariffPerDay,
      tariffNote: room.tariffNote || 'Panchakarma Diet & Care included',
      features: room.features || room.amenities || ['Wooden Droni Bed', 'Steam Chamber'],
      amenities: room.amenities || room.features || ['Wooden Droni Bed', 'Steam Chamber'],
      careStaffAssigned: room.careStaffAssigned || 'Care Staff Assigned',
      svgType: room.svgType || 'lotus',
    };
    this.safeSet(STORAGE_KEYS.ROOMS, [newRoom, ...rooms]);
    return newRoom;
  }

  public assignPatientToRoom(
    roomId: string,
    patientId: string,
    patientName?: string,
    physician?: string,
    days: number = 7
  ): void {
    const rooms = this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const patient = this.getPatientById(patientId);
    const resolvedName = patientName || patient?.name || 'Inpatient Patient';
    const resolvedPhysician = physician || patient?.primaryPhysician || 'Dr. Sarah Jenkins';

    room.status = 'Occupied';
    room.currentOccupant = {
      patientId,
      patientName: resolvedName,
      physician: resolvedPhysician,
      initials: resolvedName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      stayProgress: `Day 1 of ${days}`,
      expectedDischarge: `In ${days} days`,
      admissionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    room.sanitization = undefined;
    this.updateRoom(room);

    // Update patient assigned room
    if (patient) {
      patient.assignedRoomId = roomId;
      patient.assignedRoomName = room.name;
      patient.status = 'In-Patient Active';
      patient.admissionRecommended = false; // cleared once assigned
      this.savePatient(patient, `Room ${room.name} assigned for ${days} days stay.`);
    }
  }

  public markRoomReady(roomId: string): void {
    const rooms = this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    room.status = 'Available';
    room.currentOccupant = undefined;
    room.sanitization = undefined;
    this.updateRoom(room);
  }

  public dischargeRoom(roomId: string): void {
    const rooms = this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const patientId = room.currentOccupant?.patientId;
    if (patientId) {
      const patient = this.getPatientById(patientId);
      if (patient) {
        patient.status = 'Discharged';
        patient.assignedRoomId = undefined;
        patient.assignedRoomName = undefined;
        patient.dischargeRecommended = false;
        this.savePatient(patient, `Patient discharged from ${room.name}. Final bill ready.`);
      }
    }

    room.status = 'Sanitizing';
    room.currentOccupant = undefined;
    room.sanitization = {
      protocol: 'Herbal Fumigation Protocol',
      description: 'Neem & camphor fogging. Est. release: 15:00',
      estTimeLeft: 'Ready in 40m',
    };
    this.updateRoom(room);
  }

  // --- Inventory / Dispensary Operations ---
  public getInventory(): InventoryItem[] {
    return this.safeGet<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  }

  public addInventoryItem(item: Omit<InventoryItem, 'id' | 'shortCode' | 'status' | 'statusText'>): InventoryItem {
    const items = this.getInventory();
    const shortCode = item.name.substring(0, 3).toUpperCase();
    let status: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL' = 'IN_STOCK';
    let statusText = `In Stock (${item.stockLevel} units)`;

    if (item.stockLevel <= 5) {
      status = 'CRITICAL';
      statusText = `Critical (${item.stockLevel} left)`;
    } else if ((item.reorderThreshold && item.stockLevel <= item.reorderThreshold) || item.stockLevel <= 15) {
      status = 'LOW_STOCK';
      statusText = `Low Stock (${item.stockLevel} left)`;
    }

    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      shortCode,
      status,
      statusText,
    };

    this.safeSet(STORAGE_KEYS.INVENTORY, [newItem, ...items]);
    return newItem;
  }

  public updateInventoryItem(item: InventoryItem): void {
    const items = this.getInventory();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      if (item.stockLevel <= 5) {
        item.status = 'CRITICAL';
        item.statusText = `Critical (${item.stockLevel} left)`;
      } else if (item.stockLevel <= 15) {
        item.status = 'LOW_STOCK';
        item.statusText = `Low Stock (${item.stockLevel} left)`;
      } else {
        item.status = 'IN_STOCK';
        item.statusText = `In Stock (${item.stockLevel} units)`;
      }

      items[idx] = { ...item };
      this.safeSet(STORAGE_KEYS.INVENTORY, [...items]);
    }
  }

  public restockItem(id: string, additionalUnits: number = 25): void {
    const items = this.getInventory();
    const item = items.find((i) => i.id === id);
    if (!item) return;

    item.stockLevel += additionalUnits;
    if (item.stockLevel > item.maxCapacity) {
      item.maxCapacity = item.stockLevel + 20;
    }
    this.updateInventoryItem(item);
  }

  public deleteInventoryItems(ids: string[]): void {
    const filtered = this.getInventory().filter((i) => !ids.includes(i.id));
    this.safeSet(STORAGE_KEYS.INVENTORY, filtered);
  }

  // --- Appointments Operations ---
  public getAppointments(): Appointment[] {
    return this.safeGet<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  public getMyAppointments(physicianName?: string): Appointment[] {
    const all = this.getAppointments();
    if (!physicianName) return all;
    return all.filter((a) =>
      a.physician.toLowerCase().includes(physicianName.toLowerCase()) ||
      physicianName.toLowerCase().includes(a.physician.toLowerCase())
    );
  }

  public updateAppointmentStatus(id: string, status: Appointment['status']): void {
    const apts = this.getAppointments();
    const apt = apts.find((a) => a.id === id);
    if (apt) {
      apt.status = status;
      this.safeSet(STORAGE_KEYS.APPOINTMENTS, [...apts]);
    }
  }

  public addAppointment(apt: Omit<Appointment, 'id' | 'tokenNumber'>): Appointment {
    const apts = this.getAppointments();
    const tokenNumber = `#TK-${105 + apts.length}`;
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
      tokenNumber,
    };
    this.safeSet(STORAGE_KEYS.APPOINTMENTS, [newApt, ...apts]);
    return newApt;
  }

  // --- Complete Appointment & Send to Receptionist Billing ---
  public completeAppointmentAndSendToBilling(appointmentId: string): BillingInvoice {
    const apts = this.getAppointments();
    const apt = apts.find((a) => a.id === appointmentId);
    if (apt) {
      apt.status = 'Completed';
      this.safeSet(STORAGE_KEYS.APPOINTMENTS, [...apts]);
    }

    const patientId = apt?.patientId || 'BNC-1042';
    const patientName = apt?.patientName || 'Robert Chen';
    const doctorName = apt?.physician || 'Dr. Sarah Jenkins';

    // Retrieve active consultation prescriptions & procedures
    const consultation = this.getConsultationByPatientId(patientId);
    const procedures = this.getProcedures(patientId).filter((p) => p.status === 'Completed' || p.status === 'Scheduled');

    const items: BillItem[] = [
      {
        id: `bi-${Date.now()}-1`,
        description: `Physician OPD Consultation & Nadi Pariksha (${doctorName})`,
        category: 'Consultation',
        quantity: 1,
        unitPrice: 800,
        total: 800,
      },
    ];

    // Add prescriptions as line items
    consultation.prescriptions.slice(0, 3).forEach((rx, idx) => {
      const price = rx.price || 320;
      items.push({
        id: `bi-rx-${Date.now()}-${idx}`,
        description: `${rx.medicineName} (${rx.formulation})`,
        category: 'Medicine',
        quantity: 1,
        unitPrice: price,
        total: price,
      });
    });

    // Add procedures as line items
    procedures.slice(0, 2).forEach((proc, idx) => {
      items.push({
        id: `bi-proc-${Date.now()}-${idx}`,
        description: `${proc.procedureName} (${proc.duration})`,
        category: 'Procedure',
        quantity: 1,
        unitPrice: proc.charge,
        total: proc.charge,
      });
    });

    const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
    const taxRate = 0.05;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const finalTotal = Number((subtotal + taxAmount).toFixed(2));

    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newInvoice: BillingInvoice = {
      id: invoiceId,
      patientId,
      patientName,
      doctorName,
      appointmentId,
      billType: 'OPD_CONSULTATION',
      status: 'Pending Bill Generation',
      createdAt: 'Just now',
      items,
      subtotal,
      discountApprovedAmount: 0,
      taxRate,
      taxAmount,
      finalTotal,
    };

    if (apt) {
      apt.billedInvoiceId = invoiceId;
      this.safeSet(STORAGE_KEYS.APPOINTMENTS, [...apts]);
    }

    const invoices = this.getBillingInvoices();
    this.safeSet(STORAGE_KEYS.INVOICES, [newInvoice, ...invoices]);
    return newInvoice;
  }

  // --- Billing Invoices Operations ---
  public getBillingInvoices(): BillingInvoice[] {
    return this.safeGet<BillingInvoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  }

  public getBillingInvoiceById(id: string): BillingInvoice | undefined {
    return this.getBillingInvoices().find((i) => i.id.toLowerCase() === id.toLowerCase());
  }

  public generateDischargeBill(patientId: string): BillingInvoice {
    const patient = this.getPatientById(patientId);
    const patientName = patient?.name || 'Inpatient Patient';
    const doctorName = patient?.primaryPhysician || 'Dr. Sarah Jenkins';
    const room = this.getRooms().find((r) => r.id === patient?.assignedRoomId) || this.getRooms()[0];
    const tariff = room.tariffPerDay || 3500;
    const days = 3;

    const procedures = this.getProcedures(patientId);
    const consultation = this.getConsultationByPatientId(patientId);

    const items: BillItem[] = [
      {
        id: `ipd-${Date.now()}-1`,
        description: `${room.name} (${days} Days Inpatient Care)`,
        category: 'Room Stay',
        quantity: days,
        unitPrice: tariff,
        total: days * tariff,
      },
      {
        id: `ipd-${Date.now()}-2`,
        description: `Daily Senior Physician Clinical Supervision (${doctorName})`,
        category: 'Consultation',
        quantity: days,
        unitPrice: 800,
        total: days * 800,
      },
    ];

    procedures.forEach((proc, idx) => {
      items.push({
        id: `ipd-proc-${Date.now()}-${idx}`,
        description: `${proc.procedureName} (${proc.duration})`,
        category: 'Procedure',
        quantity: 1,
        unitPrice: proc.charge,
        total: proc.charge,
      });
    });

    consultation.prescriptions.forEach((rx, idx) => {
      const price = rx.price || 350;
      items.push({
        id: `ipd-rx-${Date.now()}-${idx}`,
        description: `${rx.medicineName} (${rx.formulation})`,
        category: 'Medicine',
        quantity: 1,
        unitPrice: price,
        total: price,
      });
    });

    items.push({
      id: `ipd-nurs-${Date.now()}`,
      description: 'Sattvic Herbal Nutrition & Specialized Nursing Care',
      category: 'Nursing',
      quantity: days,
      unitPrice: 500,
      total: days * 500,
    });

    const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
    const taxRate = 0.05;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const finalTotal = Number((subtotal + taxAmount).toFixed(2));

    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(200 + Math.random() * 800)}`;

    const newInvoice: BillingInvoice = {
      id: invoiceId,
      patientId,
      patientName,
      doctorName,
      roomId: room.id,
      billType: 'IPD_DISCHARGE',
      status: 'Pending Bill Generation',
      createdAt: 'Just now',
      items,
      subtotal,
      discountApprovedAmount: 0,
      taxRate,
      taxAmount,
      finalTotal,
    };

    const invoices = this.getBillingInvoices();
    this.safeSet(STORAGE_KEYS.INVOICES, [newInvoice, ...invoices]);
    return newInvoice;
  }

  // Request Discount from Receptionist -> sent to Admin
  public requestBillDiscount(
    invoiceId: string,
    amount: number,
    percentage: number | undefined,
    reason: string,
    requestedBy: string
  ): void {
    const invoices = this.getBillingInvoices();
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    inv.discountRequested = {
      amount,
      percentage,
      reason,
      requestedBy,
      requestedAt: 'Just now',
      status: 'PENDING',
    };
    inv.status = 'Pending Discount Approval';
    this.safeSet(STORAGE_KEYS.INVOICES, [...invoices]);
  }

  // Admin approves discount
  public approveDiscount(invoiceId: string, approvedAmount?: number, adminNote?: string): void {
    const invoices = this.getBillingInvoices();
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || !inv.discountRequested) return;

    const discountVal = approvedAmount !== undefined ? approvedAmount : inv.discountRequested.amount;
    inv.discountRequested.status = 'APPROVED';
    inv.discountRequested.adminNote = adminNote || 'Approved by Center Administrator.';
    inv.discountRequested.approvedBy = 'Director Ashok Rao (Admin)';
    inv.discountRequested.reviewedAt = 'Just now';

    inv.discountApprovedAmount = discountVal;
    const discountedSubtotal = Math.max(0, inv.subtotal - discountVal);
    inv.taxAmount = Number((discountedSubtotal * inv.taxRate).toFixed(2));
    inv.finalTotal = Number((discountedSubtotal + inv.taxAmount).toFixed(2));
    inv.status = 'Finalized';

    this.safeSet(STORAGE_KEYS.INVOICES, [...invoices]);
  }

  // Admin rejects discount
  public rejectDiscount(invoiceId: string, adminNote?: string): void {
    const invoices = this.getBillingInvoices();
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || !inv.discountRequested) return;

    inv.discountRequested.status = 'REJECTED';
    inv.discountRequested.adminNote = adminNote || 'Discount request not compliant with current institutional tariff.';
    inv.discountRequested.approvedBy = 'Director Ashok Rao (Admin)';
    inv.discountRequested.reviewedAt = 'Just now';

    inv.discountApprovedAmount = 0;
    inv.taxAmount = Number((inv.subtotal * inv.taxRate).toFixed(2));
    inv.finalTotal = Number((inv.subtotal + inv.taxAmount).toFixed(2));
    inv.status = 'Finalized';

    this.safeSet(STORAGE_KEYS.INVOICES, [...invoices]);
  }

  // Finalize and Pay Bill
  public finalizeAndPayBill(
    invoiceId: string,
    paymentMode: 'Cash' | 'Credit Card' | 'UPI' | 'Insurance'
  ): void {
    const invoices = this.getBillingInvoices();
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    inv.status = 'Paid';
    inv.paymentMode = paymentMode;
    inv.paidAt = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    inv.receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    this.safeSet(STORAGE_KEYS.INVOICES, [...invoices]);
  }

  public getPendingDiscountApprovals(): BillingInvoice[] {
    return this.getBillingInvoices().filter(
      (inv) => inv.discountRequested && inv.discountRequested.status === 'PENDING'
    );
  }

  // --- Staff & Doctor Management (Admin) ---
  public getDoctors(): DoctorProfile[] {
    return this.safeGet<DoctorProfile[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  }

  public addDoctor(doctor: Omit<DoctorProfile, 'id' | 'activePatientsCount'>): DoctorProfile {
    const docs = this.getDoctors();
    const newDoc: DoctorProfile = {
      ...doctor,
      id: `doc-${Date.now()}`,
      activePatientsCount: 0,
    };
    this.safeSet(STORAGE_KEYS.DOCTORS, [newDoc, ...docs]);
    return newDoc;
  }

  public getReceptionists(): ReceptionistProfile[] {
    return this.safeGet<ReceptionistProfile[]>(STORAGE_KEYS.RECEPTIONISTS, INITIAL_RECEPTIONISTS);
  }

  public addReceptionist(rec: Omit<ReceptionistProfile, 'id'>): ReceptionistProfile {
    const recs = this.getReceptionists();
    const newRec: ReceptionistProfile = {
      ...rec,
      id: `rec-${Date.now()}`,
    };
    this.safeSet(STORAGE_KEYS.RECEPTIONISTS, [newRec, ...recs]);
    return newRec;
  }

  // --- Overall Business Analytics Metrics (Admin) ---
  public getBusinessMetrics() {
    const invoices = this.getBillingInvoices();
    const patients = this.getPatients();
    const rooms = this.getRooms();
    const appointments = this.getAppointments();

    const paidInvoices = invoices.filter((i) => i.status === 'Paid');
    const totalRevenue = paidInvoices.reduce((acc, curr) => acc + curr.finalTotal, 0);

    const opdRevenue = paidInvoices
      .filter((i) => i.billType === 'OPD_CONSULTATION')
      .reduce((acc, curr) => acc + curr.finalTotal, 0);

    const ipdRevenue = paidInvoices
      .filter((i) => i.billType === 'IPD_DISCHARGE')
      .reduce((acc, curr) => acc + curr.finalTotal, 0);

    const occupiedBeds = rooms.filter((r) => r.status === 'Occupied').length;
    const occupancyRate = Math.round((occupiedBeds / rooms.length) * 100);

    return {
      totalRevenue,
      opdRevenue,
      ipdRevenue,
      totalPatients: patients.length,
      activeInpatients: patients.filter((p) => p.status === 'In-Patient Active').length,
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter((a) => a.status === 'Completed').length,
      occupancyRate,
      pendingDiscountsCount: this.getPendingDiscountApprovals().length,
    };
  }

  // --- Mock JSON Management Operations ---
  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify([INITIAL_CONSULTATION]));
    localStorage.setItem(STORAGE_KEYS.VISIT_HISTORY, JSON.stringify(INITIAL_VISIT_HISTORY));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    localStorage.setItem(STORAGE_KEYS.RECEPTIONISTS, JSON.stringify(INITIAL_RECEPTIONISTS));
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(INITIAL_PROCEDURES));
    localStorage.setItem(STORAGE_KEYS.INPATIENT_ROUNDS, JSON.stringify(INITIAL_INPATIENT_ROUNDS));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    this.notify();
  }

  public getRawDatabase(): Record<string, unknown> {
    return {
      patients: this.getPatients(),
      consultations: this.getConsultations(),
      visitHistory: this.safeGet(STORAGE_KEYS.VISIT_HISTORY, INITIAL_VISIT_HISTORY),
      auditLogs: this.safeGet(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
      facilitiesRooms: this.getRooms(),
      herbalInventory: this.getInventory(),
      appointments: this.getAppointments(),
      doctors: this.getDoctors(),
      receptionists: this.getReceptionists(),
      procedures: this.getProcedures(),
      inpatientDailyRounds: this.getInpatientRounds(),
      billingInvoices: this.getBillingInvoices(),
    };
  }
}

export const dataStoreService = new DataStoreService();
