import React, { useState } from 'react';
import { User } from '../../types';
import { ScreenId } from './Sidebar';

interface TopNavbarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  currentUser: User;
  onRoleChange: (role: 'doctor' | 'receptionist' | 'admin') => void;
  currentTheme: 'bethany' | 'carepulse';
  onToggleTheme: () => void;
  onOpenMockJsonModal?: () => void;
  onToggleMobileSidebar: () => void;
  patientName?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentScreen,
  onNavigate,
  currentUser,
  onRoleChange,
  currentTheme,
  onToggleTheme,
  onToggleMobileSidebar,
  patientName = 'Robert Chen (BNC-1042)',
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumbs = () => {
    switch (currentScreen) {
      case 'doctor-dashboard':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container border border-secondary/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Ayurvedic OPD 03 · Operational
            </span>
          </div>
        );
      case 'reception-dashboard':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Front Office</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">Reception Overview</span>
          </div>
        );
      case 'patient-consultation':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <button
              onClick={() => onNavigate('doctor-dashboard')}
              className="inline-flex items-center gap-1 text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Appointments</span>
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-forest-deep font-semibold">Patient Record: {patientName}</span>
          </div>
        );
      case 'patient-edit':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <button
              onClick={() => onNavigate('patient-consultation')}
              className="text-secondary hover:underline cursor-pointer"
            >
              Patients & Consultations
            </button>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-semibold">{patientName}</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-secondary font-semibold">Update Record</span>
          </div>
        );
      case 'patient-registration':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Admissions</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">New Patient Registration</span>
          </div>
        );
      case 'facilities':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>Inpatient & Wellness Suites</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-semibold">Facilities Management</span>
          </div>
        );
      case 'inventory':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Herbal Dispensary
            </span>
            <span className="text-on-surface-variant text-xs font-medium">| Main Depot</span>
          </div>
        );
      case 'doctor-appointments':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Doctor Portal</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">My Appointments &amp; Billing Dispatch</span>
          </div>
        );
      case 'doctor-admitted':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Inpatient Care</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">Admitted &amp; Daily Rounds</span>
          </div>
        );
      case 'reception-billing':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Reception Desk</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">Invoices &amp; Revenue Billing</span>
          </div>
        );
      case 'reception-admissions':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Reception Desk</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">Doctor Admission Referrals &amp; Bed Assignment</span>
          </div>
        );
      case 'admin-dashboard':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Hospital Executive</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">Business Dashboard &amp; Master History</span>
          </div>
        );
      case 'admin-approvals':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Admin Approvals</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">Discount Authorizations</span>
          </div>
        );
      case 'admin-staff':
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-secondary font-semibold">Administration</span>
            <span>/</span>
            <span className="text-forest-deep font-semibold">Facilities, Doctors &amp; Receptionist Staff</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span className="text-forest-deep font-semibold">Bethany Nature Care</span>
          </div>
        );
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 flex justify-between items-center w-full sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] shrink-0">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 md:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <div className="hidden sm:block">{getBreadcrumbs()}</div>
      </div>

      {/* Right: Actions, Date, Role Switcher, Avatar */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Today's Date Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50/70 rounded-full text-emerald-800 text-xs font-semibold border border-emerald-200/80">
          <span className="material-symbols-outlined text-base text-emerald-700">calendar_today</span>
          <span>Today: Oct 24, 2024</span>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="hidden sm:inline-flex md-btn md-btn-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors shadow-2xs"
          title="Toggle Theme (Bethany Nature Care vs CarePulse)"
        >
          <span className="material-symbols-outlined text-sm text-emerald-700">
            {currentTheme === 'bethany' ? 'nature' : 'local_hospital'}
          </span>
          <span className="capitalize">{currentTheme === 'bethany' ? 'Ayurvedic Green' : 'Clinical Blue'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-sm text-emerald-950">Clinical Notifications</span>
                <span className="text-[11px] text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50">3 unread</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100/60">
                  <p className="font-semibold text-emerald-950">Room 203 Fumigation Done</p>
                  <p className="text-slate-600">Bamboo Suite now ready for sanitization sign-off.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-100">
                  <p className="font-semibold text-red-700">Low Stock Alert: Triphala Churna</p>
                  <p className="text-slate-600">Only 3 units left in Depot Rack A-03.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100/60">
                  <p className="font-semibold text-emerald-950">Next in Lobby: Rohan Mehra</p>
                  <p className="text-slate-600">Token #TK-102 waiting for 14 minutes.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* User Identity and Quick Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 text-left p-1.5 rounded-xl hover:bg-emerald-50/80 transition-colors cursor-pointer"
          >
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-emerald-950 leading-tight">
                ROLE: {currentUser.role.toUpperCase()} / {currentUser.name}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium leading-tight">
                {currentUser.designation}
              </p>
            </div>

            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full border border-emerald-200 object-cover ring-2 ring-emerald-100 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-200 shrink-0">
                {currentUser.initials}
              </div>
            )}
            <span className="material-symbols-outlined text-base text-slate-500 hidden sm:inline">
              expand_more
            </span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Switch Active Role
                </p>
                <p className="text-[11px] text-slate-400">Test the app as Doctor, Receptionist, or Admin</p>
              </div>

              <button
                onClick={() => {
                  onRoleChange('doctor');
                  setShowRoleMenu(false);
                  onNavigate('doctor-dashboard');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  currentUser.role === 'doctor'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'hover:bg-emerald-50 text-slate-700'
                }`}
              >
                <div>
                  <p>Dr. Sarah Jenkins</p>
                  <span className="text-[10px] text-emerald-700">Ayurvedic Physician (Doctor OPD)</span>
                </div>
                {currentUser.role === 'doctor' && (
                  <span className="material-symbols-outlined text-sm text-emerald-700 font-bold">check</span>
                )}
              </button>

              <button
                onClick={() => {
                  onRoleChange('receptionist');
                  setShowRoleMenu(false);
                  onNavigate('reception-dashboard');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  currentUser.role === 'receptionist'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'hover:bg-emerald-50 text-slate-700'
                }`}
              >
                <div>
                  <p>Sarah Jenkins</p>
                  <span className="text-[10px] text-emerald-700">Reception & Admissions Desk</span>
                </div>
                {currentUser.role === 'receptionist' && (
                  <span className="material-symbols-outlined text-sm text-emerald-700 font-bold">check</span>
                )}
              </button>

              <button
                onClick={() => {
                  onRoleChange('admin');
                  setShowRoleMenu(false);
                  onNavigate('facilities');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  currentUser.role === 'admin'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'hover:bg-emerald-50 text-slate-700'
                }`}
              >
                <div>
                  <p>Director Ashok Rao</p>
                  <span className="text-[10px] text-emerald-700">Center Administrator (Full Access)</span>
                </div>
                {currentUser.role === 'admin' && (
                  <span className="material-symbols-outlined text-sm text-emerald-700 font-bold">check</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
