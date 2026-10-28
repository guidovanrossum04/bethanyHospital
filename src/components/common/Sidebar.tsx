import React from 'react';
import { User } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

export type ScreenId =
  | 'doctor-dashboard'
  | 'doctor-appointments'
  | 'doctor-admitted'
  | 'patient-consultation'
  | 'patient-edit'
  | 'patient-registration'
  | 'reception-dashboard'
  | 'reception-admissions'
  | 'reception-billing'
  | 'admin-dashboard'
  | 'admin-approvals'
  | 'admin-staff'
  | 'facilities'
  | 'inventory'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  currentUser: User;
  onLogout: () => void;
  onOpenMockJsonModal?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const role = currentUser.role;

  // Real-time badge indicators from mock data store
  const pendingAppointmentsCount = dataStoreService.getAppointments().filter((a) => a.status !== 'Completed').length;
  const activeInpatientsCount = dataStoreService.getAdmittedPatients().length;
  const pendingAdmissionsCount = dataStoreService.getAdmissionRequests().length;
  const pendingInvoicesCount = dataStoreService.getBillingInvoices().filter((i) => i.status !== 'Paid').length;
  const pendingDiscountsCount = dataStoreService.getPendingDiscountApprovals().length;

  let navItems: Array<{
    key: string;
    id: ScreenId;
    label: string;
    icon: string;
    badge?: string;
    isActive: boolean;
  }> = [];

  if (role === 'doctor') {
    navItems = [
      {
        key: 'nav-doc-dash',
        id: 'doctor-dashboard',
        label: 'Doctor Dashboard',
        icon: 'space_dashboard',
        isActive: currentScreen === 'doctor-dashboard',
      },
      {
        key: 'nav-doc-apts',
        id: 'doctor-appointments',
        label: 'My Appointments & Bill',
        icon: 'calendar_month',
        badge: `${pendingAppointmentsCount} Due`,
        isActive: currentScreen === 'doctor-appointments',
      },
      {
        key: 'nav-doc-admitted',
        id: 'doctor-admitted',
        label: 'Admitted & Daily Rounds',
        icon: 'hotel',
        badge: `${activeInpatientsCount} Inpts`,
        isActive: currentScreen === 'doctor-admitted',
      },
      {
        key: 'nav-doc-consult',
        id: 'patient-consultation',
        label: 'Patient Consultation',
        icon: 'stethoscope',
        isActive: currentScreen === 'patient-consultation' || currentScreen === 'patient-edit',
      },
      {
        key: 'nav-facilities',
        id: 'facilities',
        label: 'Facility Rooms',
        icon: 'meeting_room',
        isActive: currentScreen === 'facilities',
      },
      {
        key: 'nav-inventory',
        id: 'inventory',
        label: 'Store / Dispensary',
        icon: 'medication',
        isActive: currentScreen === 'inventory',
      },
      {
        key: 'nav-reports',
        id: 'reports',
        label: 'Clinical Reports',
        icon: 'insights',
        isActive: currentScreen === 'reports',
      },
    ];
  } else if (role === 'receptionist') {
    navItems = [
      {
        key: 'nav-rec-dash',
        id: 'reception-dashboard',
        label: 'Reception Desk',
        icon: 'desk',
        isActive: currentScreen === 'reception-dashboard',
      },
      {
        key: 'nav-rec-reg',
        id: 'patient-registration',
        label: 'Patient Registration',
        icon: 'how_to_reg',
        badge: '+New',
        isActive: currentScreen === 'patient-registration',
      },
      {
        key: 'nav-rec-admit',
        id: 'reception-admissions',
        label: 'Room Admissions Queue',
        icon: 'hotel_class',
        badge: pendingAdmissionsCount > 0 ? `${pendingAdmissionsCount} Recom` : undefined,
        isActive: currentScreen === 'reception-admissions',
      },
      {
        key: 'nav-rec-bill',
        id: 'reception-billing',
        label: 'Invoices & Billing',
        icon: 'receipt_long',
        badge: `${pendingInvoicesCount} Open`,
        isActive: currentScreen === 'reception-billing',
      },
      {
        key: 'nav-facilities',
        id: 'facilities',
        label: 'Facility Rooms',
        icon: 'hotel',
        isActive: currentScreen === 'facilities',
      },
      {
        key: 'nav-inventory',
        id: 'inventory',
        label: 'Store / Dispensary',
        icon: 'medication',
        isActive: currentScreen === 'inventory',
      },
    ];
  } else {
    // Admin
    navItems = [
      {
        key: 'nav-adm-dash',
        id: 'admin-dashboard',
        label: 'Business Dashboard',
        icon: 'analytics',
        isActive: currentScreen === 'admin-dashboard',
      },
      {
        key: 'nav-adm-approvals',
        id: 'admin-approvals',
        label: 'Discount Approvals',
        icon: 'verified_user',
        badge: pendingDiscountsCount > 0 ? `${pendingDiscountsCount} Pending` : undefined,
        isActive: currentScreen === 'admin-approvals',
      },
      {
        key: 'nav-adm-staff',
        id: 'admin-staff',
        label: 'Staff & Facilities Admin',
        icon: 'badge',
        isActive: currentScreen === 'admin-staff',
      },
      {
        key: 'nav-facilities',
        id: 'facilities',
        label: 'Rooms Management',
        icon: 'hotel',
        isActive: currentScreen === 'facilities',
      },
      {
        key: 'nav-inventory',
        id: 'inventory',
        label: 'Store / Dispensary',
        icon: 'medication',
        isActive: currentScreen === 'inventory',
      },
      {
        key: 'nav-reports',
        id: 'reports',
        label: 'Executive Reports',
        icon: 'insights',
        isActive: currentScreen === 'reports',
      },
    ];
  }

  const handleItemClick = (screen: ScreenId) => {
    onNavigate(screen);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-white/90 z-40 md:hidden backdrop-blur-md transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-80 z-50 flex flex-col justify-between p-6 bg-white border-r border-slate-200/90 shadow-[2px_0_8px_rgba(0,0,0,0.03)] shrink-0 transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-5">
          {/* Brand Header */}
          <div className="flex items-center gap-3.5 px-1 pb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-emerald-500/30">
              <span className="material-symbols-outlined text-[28px]" data-icon="spa">
                spa
              </span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-emerald-950 tracking-tight leading-snug">
                Bethany Nature Care
              </h1>
              <p className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
                Clinical Management
              </p>
            </div>
          </div>

          {/* Current Role Indicator Pill */}
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Portal:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold capitalize">
              {role} View
            </span>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-340px)] pr-1">
            {navItems.map((item) => {
              const isActive = item.isActive;
              return (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer group min-h-[48px] ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-md shadow-emerald-900/15'
                      : 'text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-2xs'
                          : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 group-hover:text-emerald-900'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[21px]"
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <span className={`text-[13.5px] leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/80 shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer with User Card & Logout */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between px-1.5 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full border-2 border-emerald-200 object-cover ring-2 ring-emerald-100 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-200 shrink-0 shadow-xs">
                  {currentUser.initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-950 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-700 font-medium truncate">{currentUser.designation}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0">
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors text-xs font-bold cursor-pointer border border-slate-200 shadow-2xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Switch Role / Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
