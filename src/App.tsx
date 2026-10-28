/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, User } from './types';
import { dataStoreService } from './services/data-store.service';
import { Sidebar, ScreenId } from './components/common/Sidebar';
import { TopNavbar } from './components/common/TopNavbar';
import { LoginView } from './components/auth/LoginView';
import { DoctorDashboardView } from './components/doctor/DoctorDashboardView';
import { DoctorAppointmentsView } from './components/doctor/DoctorAppointmentsView';
import { DoctorAdmittedView } from './components/doctor/DoctorAdmittedView';
import { PatientConsultationView } from './components/doctor/PatientConsultationView';
import { EditPatientView } from './components/patient/EditPatientView';
import { PatientRegistrationView } from './components/patient/PatientRegistrationView';
import { ReceptionDashboardView } from './components/reception/ReceptionDashboardView';
import { ReceptionAdmissionsView } from './components/reception/ReceptionAdmissionsView';
import { ReceptionBillingView } from './components/reception/ReceptionBillingView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminApprovalsView } from './components/admin/AdminApprovalsView';
import { AdminStaffView } from './components/admin/AdminStaffView';
import { FacilityManagementView } from './components/facilities/FacilityManagementView';
import { InventoryDispensaryView } from './components/inventory/InventoryDispensaryView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { PrintSummaryModal } from './components/modals/PrintSummaryModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(dataStoreService.getCurrentUser());
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('doctor-dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('BNC-1042');
  const [theme, setTheme] = useState<'bethany' | 'carepulse'>(dataStoreService.getTheme());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [showPrintSummaryModal, setShowPrintSummaryModal] = useState(false);
  const [printPatientId, setPrintPatientId] = useState('BNC-1042');

  // Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to data store updates
    const unsubscribe = dataStoreService.subscribe(() => {
      setCurrentUser(dataStoreService.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleLoginSuccess = (role: UserRole) => {
    const user = dataStoreService.switchRole(role);
    setCurrentUser(user);
    setIsLoggedIn(true);

    if (role === 'doctor') {
      setCurrentScreen('doctor-dashboard');
    } else if (role === 'receptionist') {
      setCurrentScreen('reception-dashboard');
    } else {
      setCurrentScreen('admin-dashboard');
    }

    handleShowToast(`Welcome back, ${user.name}!`);
  };

  const handleRoleChange = (role: UserRole) => {
    const user = dataStoreService.switchRole(role);
    setCurrentUser(user);
    if (role === 'doctor') {
      setCurrentScreen('doctor-dashboard');
    } else if (role === 'receptionist') {
      setCurrentScreen('reception-dashboard');
    } else {
      setCurrentScreen('admin-dashboard');
    }
    handleShowToast(`Active role changed to ${user.name} (${role.toUpperCase()})`);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'bethany' ? 'carepulse' : 'bethany';
    setTheme(nextTheme);
    dataStoreService.setTheme(nextTheme);
    handleShowToast(`Theme switched to ${nextTheme === 'bethany' ? 'Bethany Nature Care' : 'CarePulse Clinical'}`);
  };

  const handleOpenPrintModal = (patientId: string) => {
    setPrintPatientId(patientId);
    setShowPrintSummaryModal(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    handleShowToast('Logged out of system.');
  };

  // If not logged in, render authentic Login view
  if (!isLoggedIn) {
    return (
      <div className={theme === 'carepulse' ? 'theme-carepulse' : ''}>
        <LoginView onLoginSuccess={handleLoginSuccess} currentTheme={theme} />
      </div>
    );
  }

  const currentPatient =
    dataStoreService.getPatientById(selectedPatientId) || dataStoreService.getPatients()[0];
  const currentConsultation = dataStoreService.getConsultationByPatientId(printPatientId);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#edf7f0] via-[#f7fbf8] to-[#def2e4] text-slate-800 antialiased flex ${theme === 'carepulse' ? 'theme-carepulse' : ''}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-80 min-w-0 h-screen overflow-hidden">
        {/* Top App Bar */}
        <TopNavbar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          currentTheme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          patientName={`${currentPatient.name} (${currentPatient.id})`}
        />

        {/* Scrollable Viewport Canvas with Botanical Green Gradient */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-[#eef7f1]/60 via-[#f8fcf9]/40 to-[#e2f4e8]/60">
          {/* Doctor Views */}
          {currentScreen === 'doctor-dashboard' && (
            <DoctorDashboardView
              onNavigate={setCurrentScreen}
              onSelectPatient={setSelectedPatientId}
              onShowToast={handleShowToast}
            />
          )}

          {currentScreen === 'doctor-appointments' && (
            <DoctorAppointmentsView
              onSelectPatient={setSelectedPatientId}
              onNavigateToConsultation={(pid) => {
                setSelectedPatientId(pid);
                setCurrentScreen('patient-consultation');
              }}
              onShowToast={handleShowToast}
            />
          )}

          {currentScreen === 'doctor-admitted' && (
            <DoctorAdmittedView onShowToast={handleShowToast} />
          )}

          {/* Receptionist Views */}
          {currentScreen === 'reception-dashboard' && (
            <ReceptionDashboardView
              onNavigate={setCurrentScreen}
              onSelectPatient={setSelectedPatientId}
              onShowToast={handleShowToast}
            />
          )}

          {currentScreen === 'reception-admissions' && (
            <ReceptionAdmissionsView onShowToast={handleShowToast} />
          )}

          {currentScreen === 'reception-billing' && (
            <ReceptionBillingView onShowToast={handleShowToast} />
          )}

          {/* Admin Views */}
          {currentScreen === 'admin-dashboard' && (
            <AdminDashboardView
              onNavigateToApprovals={() => setCurrentScreen('admin-approvals')}
              onNavigateToStaff={() => setCurrentScreen('admin-staff')}
              onShowToast={handleShowToast}
            />
          )}

          {currentScreen === 'admin-approvals' && (
            <AdminApprovalsView onShowToast={handleShowToast} />
          )}

          {currentScreen === 'admin-staff' && (
            <AdminStaffView onShowToast={handleShowToast} />
          )}

          {/* Common Clinic Views */}
          {currentScreen === 'patient-consultation' && (
            <PatientConsultationView
              patientId={selectedPatientId}
              onNavigate={setCurrentScreen}
              onOpenPrintModal={handleOpenPrintModal}
              onShowToast={handleShowToast}
            />
          )}

          {currentScreen === 'patient-edit' && (
            <EditPatientView
              patientId={selectedPatientId}
              onNavigate={setCurrentScreen}
              onShowToast={handleShowToast}
            />
          )}

          {currentScreen === 'patient-registration' && (
            <PatientRegistrationView
              onNavigate={setCurrentScreen}
              onSelectPatient={setSelectedPatientId}
              onShowToast={handleShowToast}
            />
          )}

          {currentScreen === 'facilities' && (
            <FacilityManagementView
              onNavigate={setCurrentScreen}
              onSelectPatient={setSelectedPatientId}
              onShowToast={handleShowToast}
            />
          )}

          {currentScreen === 'inventory' && (
            <InventoryDispensaryView onShowToast={handleShowToast} />
          )}

          {currentScreen === 'reports' && <ReportsView />}

          {currentScreen === 'settings' && (
            <SettingsView
              currentTheme={theme}
              onToggleTheme={handleToggleTheme}
              onShowToast={handleShowToast}
            />
          )}
        </main>
      </div>

      {/* Printable Clinical Medical Summary Modal */}
      <PrintSummaryModal
        isOpen={showPrintSummaryModal}
        onClose={() => setShowPrintSummaryModal(false)}
        patient={dataStoreService.getPatientById(printPatientId) || currentPatient}
        consultation={currentConsultation}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-forest-deep text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-l-4 border-secondary animate-in slide-in-from-bottom-5 duration-200"
        >
          <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
