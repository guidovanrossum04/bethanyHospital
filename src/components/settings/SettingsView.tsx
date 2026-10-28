import React from 'react';
import { dataStoreService } from '../../services/data-store.service';

interface SettingsViewProps {
  currentTheme: 'bethany' | 'carepulse';
  onToggleTheme: () => void;
  onOpenMockJsonModal?: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onToggleTheme,
  onShowToast,
}) => {
  const handleReset = () => {
    if (confirm('Reset all mock JSON collections back to initial factory values?')) {
      dataStoreService.resetToDefaults();
      onShowToast('All mock data reset to initial values.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="pb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-forest-deep tracking-tight">Settings &amp; Configuration</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Clinic governance, dispensary stock rules, theme preferences, and mock JSON controls.
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-sage-wash space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-forest-deep font-bold text-base">
          <span className="material-symbols-outlined text-secondary">palette</span>
          <h3>Design System &amp; Appearance Theme</h3>
        </div>
        <p className="text-xs text-on-surface-variant">
          Switch between the authentic Bethany Nature Care (Herbal Botanical) palette and CarePulse (Modern Clinical Blue).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => {
              if (currentTheme !== 'bethany') onToggleTheme();
            }}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              currentTheme === 'bethany'
                ? 'border-secondary bg-secondary-container/20 ring-2 ring-secondary'
                : 'border-sage-wash hover:bg-surface-container'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#012d1d] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">spa</span>
            </div>
            <div>
              <span className="font-bold text-xs text-forest-deep block">Bethany Nature Care</span>
              <span className="text-[11px] text-on-surface-variant">
                Ayurvedic Forest Deep Green, Sage Wash, and Sun Warmth palette.
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              if (currentTheme !== 'carepulse') onToggleTheme();
            }}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              currentTheme === 'carepulse'
                ? 'border-secondary bg-secondary-container/20 ring-2 ring-secondary'
                : 'border-sage-wash hover:bg-surface-container'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#0058bc] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">local_hospital</span>
            </div>
            <div>
              <span className="font-bold text-xs text-forest-deep block">CarePulse Clinical</span>
              <span className="text-[11px] text-on-surface-variant">
                Clean Corporate Medical Blue, High-Contrast Hospital palette.
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Database State Management */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-sage-wash space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-forest-deep font-bold text-base">
          <span className="material-symbols-outlined text-secondary">database</span>
          <h3>Database Operations &amp; Storage State</h3>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          The application operates with full reactive CRUD persistence across Patients, Consultations,
          Prescriptions, Facilities/Rooms, Herbal Dispensary Inventory, Appointments, and Audit Revision Trails.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg border border-error/50 text-error hover:bg-error-container text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset All Data to Default Seeds
          </button>
        </div>
      </div>
    </div>
  );
};
