import React, { useState, useEffect } from 'react';
import { BillingInvoice } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

interface AdminApprovalsViewProps {
  onShowToast: (msg: string) => void;
}

export const AdminApprovalsView: React.FC<AdminApprovalsViewProps> = ({ onShowToast }) => {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [adjustedAmount, setAdjustedAmount] = useState<number>(0);
  const [adminDecisionNote, setAdminDecisionNote] = useState<string>('');

  const loadData = () => {
    setInvoices(dataStoreService.getBillingInvoices());
  };

  useEffect(() => {
    loadData();
    const unsub = dataStoreService.subscribe(loadData);
    return unsub;
  }, []);

  const pendingRequests = invoices.filter(
    (inv) => inv.discountRequested && inv.discountRequested.status === 'PENDING'
  );

  const resolvedRequests = invoices.filter(
    (inv) => inv.discountRequested && inv.discountRequested.status !== 'PENDING'
  );

  const handleOpenReviewModal = (inv: BillingInvoice) => {
    setSelectedInvoice(inv);
    setAdjustedAmount(inv.discountRequested?.amount || 0);
    setAdminDecisionNote(
      `Approved concession as per Center Director clinical welfare guidelines. Release bill.`
    );
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    dataStoreService.approveDiscount(selectedInvoice.id, Number(adjustedAmount), adminDecisionNote);
    loadData();
    onShowToast(`Discount of ₹${adjustedAmount} approved for invoice ${selectedInvoice.id}! Bill finalized for reception collection.`);
    setSelectedInvoice(null);
  };

  const handleReject = () => {
    if (!selectedInvoice) return;
    const reason = adminDecisionNote || 'Tariff exemption criteria not met under current institutional budget.';
    dataStoreService.rejectDiscount(selectedInvoice.id, reason);
    loadData();
    onShowToast(`Discount request rejected for ${selectedInvoice.id}. Bill finalized at full standard tariff.`);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Admin Approvals Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Billing Discount Authorizations
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Review fee concession requests submitted by receptionists during billing. Approved discounts finalize invoices and recalculate taxes immediately.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
            <span className="text-xs font-bold text-amber-950">
              {pendingRequests.length} Pending Approvals
            </span>
          </div>
        </div>
      </div>

      {/* Pending Discount Requests Queue */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600">pending_actions</span>
          Pending Receptionist Discount Submissions ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500">
            <span className="material-symbols-outlined text-[48px] text-emerald-400">task_alt</span>
            <p className="text-base font-bold text-slate-700 mt-2">No pending discount authorizations</p>
            <p className="text-xs text-slate-500 mt-0.5">
              When a receptionist requests a bill concession, it will appear here for administrator decision.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingRequests.map((inv) => {
              const req = inv.discountRequested!;
              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-3xl border-2 border-amber-300 p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="font-mono font-bold text-xs text-slate-900">{inv.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                        Pending Admin Review
                      </span>
                    </div>

                    {/* Patient & Financial Details */}
                    <div className="mt-3">
                      <h3 className="font-black text-slate-900 text-base">{inv.patientName}</h3>
                      <p className="text-xs text-slate-500">
                        Doctor: <span className="font-semibold text-slate-700">{inv.doctorName}</span> &bull; ID: {inv.patientId}
                      </p>

                      <div className="mt-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Standard Subtotal:</span>
                          <span className="font-bold text-slate-900">₹{inv.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-amber-950 font-black text-sm">
                          <span>Requested Discount:</span>
                          <span className="text-amber-800">₹{req.amount} ({req.percentage}%)</span>
                        </div>
                        <div className="pt-2 border-t border-amber-200">
                          <span className="text-[10px] font-bold uppercase text-amber-900 block">Requester Reason:</span>
                          <p className="text-slate-800 italic mt-0.5">&ldquo;{req.reason}&rdquo;</p>
                          <p className="text-[10px] text-slate-500 mt-1">Submitted by: {req.requestedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReviewModal(inv)}
                      className="md-btn-filled py-2 px-3 text-xs w-full flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
                    >
                      <span className="material-symbols-outlined text-[16px]">gavel</span>
                      <span>Review &amp; Authorize</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Resolved Requests */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-700">history</span>
          Discount Decision History ({resolvedRequests.length})
        </h2>

        <div className="md-table-container">
          <table className="md-table">
            <thead>
              <tr>
                <th>Invoice &amp; Patient</th>
                <th>Requested Concession</th>
                <th>Decision &amp; Approved Amount</th>
                <th>Administrator Note</th>
                <th>Reviewed By</th>
                <th>Final Invoice Total</th>
              </tr>
            </thead>
            <tbody>
              {resolvedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No past discount decisions logged.
                  </td>
                </tr>
              ) : (
                resolvedRequests.map((inv) => {
                  const req = inv.discountRequested!;
                  const isApproved = req.status === 'APPROVED';
                  return (
                    <tr key={inv.id}>
                      <td>
                        <span className="font-extrabold text-slate-900 text-xs block">{inv.patientName}</span>
                        <span className="font-mono text-[11px] text-slate-500">{inv.id}</span>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-slate-800">₹{req.amount}</span>
                        <span className="text-[11px] text-slate-500 block">Reason: {req.reason}</span>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-red-100 text-red-900 border border-red-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isApproved ? 'check' : 'close'}
                          </span>
                          {req.status} (₹{inv.discountApprovedAmount})
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-700 italic">
                          &ldquo;{req.adminNote || 'Processed'}&rdquo;
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-slate-800">{req.approvedBy || 'Director (Admin)'}</span>
                      </td>
                      <td>
                        <span className="text-sm font-black text-emerald-950">₹{inv.finalTotal}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Authorize Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
                <div>
                  <h3 className="font-black text-base">Discount Authorization &bull; {selectedInvoice.id}</h3>
                  <p className="text-xs text-emerald-200">{selectedInvoice.patientName} &bull; Subtotal ₹{selectedInvoice.subtotal}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleApprove} className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Receptionist Requester:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.discountRequested?.requestedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Requested Concession:</span>
                  <span className="font-bold text-amber-800">₹{selectedInvoice.discountRequested?.amount} ({selectedInvoice.discountRequested?.percentage}%)</span>
                </div>
                <div className="pt-1 text-slate-700 italic">
                  &ldquo;{selectedInvoice.discountRequested?.reason}&rdquo;
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Approved Discount Amount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  max={selectedInvoice.subtotal}
                  value={adjustedAmount}
                  onChange={(e) => setAdjustedAmount(Number(e.target.value))}
                  className="w-full text-sm font-black px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  New revised bill total will be approximately ₹{Math.max(0, Math.round((selectedInvoice.subtotal - adjustedAmount) * 1.05))} (including 5% GST).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Decision Note &amp; Authorization Remarks
                </label>
                <textarea
                  rows={2}
                  value={adminDecisionNote}
                  onChange={(e) => setAdminDecisionNote(e.target.value)}
                  className="w-full text-xs font-medium p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="e.g. Approved 10% privilege concession..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReject}
                  className="md-btn-outlined py-2 px-4 text-xs text-red-700 border-red-300 hover:bg-red-50"
                >
                  Reject Concession
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="md-btn-outlined py-2 px-3 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="md-btn-filled py-2 px-5 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-black"
                  >
                    Approve &amp; Finalize Bill
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
