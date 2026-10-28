import React from 'react';
import { dataStoreService } from '../../services/data-store.service';

export const ReportsView: React.FC = () => {
  const patients = dataStoreService.getPatients();
  const rooms = dataStoreService.getRooms();
  const inventory = dataStoreService.getInventory();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-forest-deep tracking-tight">
            Clinical Analytics &amp; Reports
          </h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Holistic recovery metrics, Prakriti dosha distribution, bed occupancy &amp; formulation consumption.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-surface-container rounded-full text-secondary">
          Reporting Cycle: Oct 2024
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-sage-wash">
          <span className="text-xs text-outline font-semibold uppercase">Panchakarma Adherence</span>
          <p className="text-2xl font-bold text-forest-deep mt-1">94.2%</p>
          <p className="text-xs text-secondary mt-1">+3.1% vs previous quarter</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-sage-wash">
          <span className="text-xs text-outline font-semibold uppercase">Bed Occupancy Rate</span>
          <p className="text-2xl font-bold text-primary mt-1">85.7%</p>
          <p className="text-xs text-bark-brown mt-1">32/42 Beds Active in Care</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-sage-wash">
          <span className="text-xs text-outline font-semibold uppercase">Average Recovery Cycle</span>
          <p className="text-2xl font-bold text-forest-deep mt-1">16.4 Days</p>
          <p className="text-xs text-on-surface-variant mt-1">Target Basti / Shirodhara</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-sage-wash">
          <span className="text-xs text-outline font-semibold uppercase">Formulary Turnover</span>
          <p className="text-2xl font-bold text-forest-deep mt-1">1,420 Items</p>
          <p className="text-xs text-error mt-1">{inventory.filter((i) => i.status === 'LOW_STOCK').length} Reorders Due</p>
        </div>
      </div>

      {/* Dosha Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-sage-wash space-y-4">
          <h3 className="font-bold text-base text-forest-deep">Prakriti / Dosha Patient Profile</h3>
          <p className="text-xs text-on-surface-variant">Active patient cohort constitution breakdown</p>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-primary">Vata-Pitta Dominance</span>
                <span className="font-bold">48%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-secondary">Pitta-Kapha Dominance</span>
                <span className="font-bold">32%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-bark-brown">Kapha-Vata Dominance</span>
                <span className="font-bold">20%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-bark-brown h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Therapy Efficacy Distribution */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-sage-wash space-y-4">
          <h3 className="font-bold text-base text-forest-deep">Top Clinical Therapies Conducted</h3>
          <p className="text-xs text-on-surface-variant">Session frequency over past 30 days</p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-forest-deep block">Kati &amp; Janu Basti (Spinal/Knee)</span>
                <span className="text-on-surface-variant text-[11px]">Vata pacification protocol</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-fixed font-bold">
                142 Sessions
              </span>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-forest-deep block">Shirodhara (Medicated Oil Stream)</span>
                <span className="text-on-surface-variant text-[11px]">Insomnia, Manasa roga, stress</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-fixed font-bold">
                98 Sessions
              </span>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-forest-deep block">Abhyanga &amp; Patra Pinda Sweda</span>
                <span className="text-on-surface-variant text-[11px]">Full body herbal bolus fomentation</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-fixed font-bold">
                85 Sessions
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
