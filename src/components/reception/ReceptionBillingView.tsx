import React, { useState, useEffect } from 'react';
import { BillingInvoice, Patient } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

interface ReceptionBillingViewProps {
  onShowToast: (msg: string) => void;
}

export const ReceptionBillingView: React.FC<ReceptionBillingViewProps> = ({ onShowToast }) => {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [dischargeReadyPatients, setDischargeReadyPatients] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<BillingInvoice | null>(null);
  const [invoiceForDiscount, setInvoiceForDiscount] = useState<BillingInvoice | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(500);
  const [discountReason, setDiscountReason] = useState<string>('Senior Citizen & Panchakarma Package Concession');
  const [invoiceForPayment, setInvoiceForPayment] = useState<BillingInvoice | null>(null);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Credit Card' | 'UPI' | 'Insurance'>('UPI');
  const [printInvoiceModal, setPrintInvoiceModal] = useState<BillingInvoice | null>(null);

  const loadData = () => {
    const list = dataStoreService.getBillingInvoices();
    setInvoices(list);

    // Get patients whose doctor recommended discharge
    const admitted = dataStoreService.getPatients().filter((p) => p.dischargeRecommended);
    setDischargeReadyPatients(admitted);
  };

  useEffect(() => {
    loadData();
    const unsub = dataStoreService.subscribe(loadData);
    return unsub;
  }, []);

  const handleGenerateDischargeBill = (patient: Patient) => {
    const invoice = dataStoreService.generateDischargeBill(patient.id);
    loadData();
    onShowToast(`Final IPD Bill ${invoice.id} generated for ${patient.name} (Total: ₹${invoice.finalTotal})`);
    setSelectedInvoiceForDetails(invoice);
  };

  const handleRequestDiscountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForDiscount) return;

    dataStoreService.requestBillDiscount(
      invoiceForDiscount.id,
      Number(discountAmount),
      Math.round((Number(discountAmount) / invoiceForDiscount.subtotal) * 100),
      discountReason,
      dataStoreService.getCurrentUser().name
    );

    loadData();
    onShowToast(`Discount request of ₹${discountAmount} for ${invoiceForDiscount.id} sent to Admin approval queue.`);
    setInvoiceForDiscount(null);
  };

  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForPayment) return;

    dataStoreService.finalizeAndPayBill(invoiceForPayment.id, paymentMode);
    loadData();
    onShowToast(`Payment of ₹${invoiceForPayment.finalTotal} collected via ${paymentMode}! Receipt generated.`);
    
    // Automatically open print modal for receipt
    const updated = dataStoreService.getBillingInvoiceById(invoiceForPayment.id);
    setInvoiceForPayment(null);
    if (updated) setPrintInvoiceModal(updated);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inv.id.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.patientId.toLowerCase().includes(q) ||
        inv.doctorName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Billing Counter &bull; Reception Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Patient Invoices &amp; Revenue Billing
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Review doctor-completed consultations, generate final IPD discharge bills, request admin discount approvals, and print official clinical fee summaries.
          </p>
        </div>

        {/* Quick totals pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Pending Receipts</span>
            <span className="text-base font-black text-emerald-950">
              {invoices.filter((i) => i.status !== 'Paid').length} Invoices
            </span>
          </div>
          <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Paid Invoices</span>
            <span className="text-base font-black text-slate-800">
              {invoices.filter((i) => i.status === 'Paid').length} Cleared
            </span>
          </div>
        </div>
      </div>

      {/* Discharge Cleared by Doctor Alert Banner */}
      {dischargeReadyPatients.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[26px]">emergency_home</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-black text-amber-950">
                  Doctor Recommends Inpatient Discharge ({dischargeReadyPatients.length} Pending Bills)
                </h3>
                <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-black uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium mt-1">
                Attending physicians have flagged the following admitted patients for discharge. Generate their itemized final IPD room &amp; treatment bill below.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dischargeReadyPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{patient.name}</p>
                      <p className="text-xs text-slate-500">
                        {patient.assignedRoomName || 'Room'} &bull; {patient.id}
                      </p>
                      <p className="text-[11px] text-amber-800 font-semibold mt-0.5 italic">
                        &ldquo;{patient.dischargeNote || 'Treatment completed'}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={() => handleGenerateDischargeBill(patient)}
                      className="md-btn-filled py-1.5 px-3 text-xs bg-emerald-800 hover:bg-emerald-900 text-white shrink-0 ml-2"
                    >
                      Generate Bill
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="md-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Pending Bill Generation', 'Pending Discount Approval', 'Finalized', 'Paid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Invoices' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search invoice #, patient, doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="md-table-container">
        <table className="md-table">
          <thead>
            <tr>
              <th>Invoice &amp; Date</th>
              <th>Patient &amp; Doctor</th>
              <th>Bill Category</th>
              <th>Medicines &amp; Procedures</th>
              <th>Financial Breakdown</th>
              <th>Status</th>
              <th className="text-right">Counter Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[40px] text-slate-300">
                      receipt
                    </span>
                    <p className="text-sm font-bold text-slate-700">No invoices found</p>
                    <p className="text-xs text-slate-500">
                      Doctor consultations and IPD discharges automatically create invoices here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'Paid';
                const isPendingDiscount = inv.status === 'Pending Discount Approval';

                // Count items
                const medCount = inv.items.filter((i) => i.category === 'Medicine').length;
                const procCount = inv.items.filter((i) => i.category === 'Procedure').length;

                return (
                  <tr key={inv.id} className="hover:bg-emerald-50/40 transition-colors">
                    {/* Invoice ID & Date */}
                    <td>
                      <div>
                        <span className="font-extrabold text-emerald-950 font-mono text-xs block">
                          {inv.id}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {inv.createdAt}
                        </span>
                        {inv.receiptNumber && (
                          <span className="text-[10px] text-emerald-700 font-mono block mt-0.5 font-bold">
                            Rcpt: {inv.receiptNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Patient & Doctor */}
                    <td>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {inv.patientName}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>ID: {inv.patientId}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-800 font-semibold">{inv.doctorName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Bill Category */}
                    <td>
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-extrabold uppercase">
                        {inv.billType === 'OPD_CONSULTATION' ? 'OPD Consult' : 'IPD Discharge'}
                      </span>
                    </td>

                    {/* Medicines & Procedures */}
                    <td>
                      <button
                        onClick={() => setSelectedInvoiceForDetails(inv)}
                        className="text-left group cursor-pointer"
                        title="Click to view all line items, medicines and procedures"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-800 group-hover:text-emerald-800 group-hover:underline">
                            {inv.items.length} Line Items
                          </span>
                          <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-emerald-700">
                            visibility
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {medCount} Meds &bull; {procCount} Procedures
                        </p>
                      </button>
                    </td>

                    {/* Financial Breakdown */}
                    <td>
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">₹{inv.finalTotal}</span>
                          {inv.discountApprovedAmount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              -₹{inv.discountApprovedAmount} Off
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Sub: ₹{inv.subtotal} + Tax 5%: ₹{inv.taxAmount}
                        </p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : isPendingDiscount
                            ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                            : 'bg-blue-50 text-blue-900 border-blue-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isPaid ? 'bg-emerald-500' : isPendingDiscount ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                        />
                        {inv.status}
                      </span>
                      {isPendingDiscount && inv.discountRequested && (
                        <p className="text-[10px] text-amber-800 font-bold mt-1">
                          Awaiting Admin for ₹{inv.discountRequested.amount}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Itemized Line Items */}
                        <button
                          onClick={() => setSelectedInvoiceForDetails(inv)}
                          className="md-btn-outlined py-1.5 px-2.5 text-xs"
                          title="View patient medicine, procedure and consultation breakdown"
                        >
                          Details
                        </button>

                        {/* Request Discount from Admin (if not paid & not already pending) */}
                        {!isPaid && !isPendingDiscount && (
                          <button
                            onClick={() => {
                              setInvoiceForDiscount(inv);
                              setDiscountAmount(Math.min(500, Math.floor(inv.subtotal * 0.15)));
                            }}
                            className="md-btn-tonal py-1.5 px-2.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                            title="Request discount approval from Admin to finalize bill"
                          >
                            Discount
                          </button>
                        )}

                        {/* Finalize & Collect Payment */}
                        {!isPaid && !isPendingDiscount && (
                          <button
                            onClick={() => setInvoiceForPayment(inv)}
                            className="md-btn-filled py-1.5 px-3 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
                            title="Collect payment and generate receipt"
                          >
                            Pay ₹{inv.finalTotal}
                          </button>
                        )}

                        {/* Print / Download Summary History */}
                        <button
                          onClick={() => setPrintInvoiceModal(inv)}
                          className="md-btn-outlined py-1.5 px-2 text-xs flex items-center gap-1 text-slate-700 hover:bg-slate-100"
                          title="Print / Download overall summary history & tax invoice"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                          <span className="hidden sm:inline">Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Itemized Details Modal (Shows Medicine, Procedure, Consultation) */}
      {selectedInvoiceForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">receipt</span>
                </div>
                <div>
                  <h2 className="text-lg font-black">Itemized Clinical Bill &bull; {selectedInvoiceForDetails.id}</h2>
                  <p className="text-xs text-emerald-200">
                    Patient: {selectedInvoiceForDetails.patientName} &bull; Doctor: {selectedInvoiceForDetails.doctorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceForDetails(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoiceForDetails.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.description}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              item.category === 'Medicine'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.category === 'Procedure'
                                ? 'bg-purple-100 text-purple-800'
                                : item.category === 'Room Stay'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">₹{item.unitPrice}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-bold text-slate-900">₹{selectedInvoiceForDetails.subtotal}</span>
                </div>
                {selectedInvoiceForDetails.discountApprovedAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Approved Admin Discount:</span>
                    <span>-₹{selectedInvoiceForDetails.discountApprovedAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST / Healthcare Service Tax (5%):</span>
                  <span>₹{selectedInvoiceForDetails.taxAmount}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Final Payable Total:</span>
                  <span className="text-emerald-900 text-base">₹{selectedInvoiceForDetails.finalTotal}</span>
                </div>
              </div>

              {/* Discount Status info if present */}
              {selectedInvoiceForDetails.discountRequested && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
                  <p className="font-bold text-amber-900">
                    Discount Status: {selectedInvoiceForDetails.discountRequested.status}
                  </p>
                  <p className="text-slate-700 mt-1">
                    Requested: ₹{selectedInvoiceForDetails.discountRequested.amount} by {selectedInvoiceForDetails.discountRequested.requestedBy}. Reason: {selectedInvoiceForDetails.discountRequested.reason}
                  </p>
                  {selectedInvoiceForDetails.discountRequested.adminNote && (
                    <p className="text-emerald-800 font-semibold mt-1">
                      Admin Decision Note: {selectedInvoiceForDetails.discountRequested.adminNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  const inv = selectedInvoiceForDetails;
                  setSelectedInvoiceForDetails(null);
                  setPrintInvoiceModal(inv);
                }}
                className="md-btn-outlined py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Bill</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceForDetails(null)}
                className="md-btn-filled py-2 px-5 text-xs bg-emerald-800 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Request Discount from Admin Modal */}
      {invoiceForDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-amber-700 to-amber-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">price_change</span>
                <div>
                  <h3 className="font-black text-base">Request Admin Discount</h3>
                  <p className="text-xs text-amber-100">{invoiceForDiscount.id} &bull; Subtotal: ₹{invoiceForDiscount.subtotal}</p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceForDiscount(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRequestDiscountSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Discount requests are forwarded to the Center Director / Administrator dashboard for review before finalizing the bill.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  min={50}
                  max={invoiceForDiscount.subtotal}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Approx. {Math.round((discountAmount / invoiceForDiscount.subtotal) * 100)}% of subtotal
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Justification / Discount Reason
                </label>
                <textarea
                  rows={3}
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  className="w-full text-xs font-medium p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Senior Citizen, Panchakarma Package Privilege, Director Reference..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInvoiceForDiscount(null)}
                  className="md-btn-outlined py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="md-btn-filled py-2 px-5 text-xs bg-amber-700 hover:bg-amber-800 text-white font-bold"
                >
                  Send for Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Payment Collection Modal */}
      {invoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">payments</span>
                <div>
                  <h3 className="font-black text-base">Collect Payment &bull; {invoiceForPayment.id}</h3>
                  <p className="text-xs text-emerald-200">{invoiceForPayment.patientName}</p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceForPayment(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCollectPaymentSubmit} className="p-6 space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Total Payable Amount</span>
                <span className="text-3xl font-black text-emerald-950 block mt-1">₹{invoiceForPayment.finalTotal}</span>
                {invoiceForPayment.discountApprovedAmount > 0 && (
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">
                    (Includes ₹{invoiceForPayment.discountApprovedAmount} Admin Approved Discount)
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['UPI', 'Credit Card', 'Cash', 'Insurance'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        paymentMode === mode
                          ? 'border-emerald-700 bg-emerald-800 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInvoiceForPayment(null)}
                  className="md-btn-outlined py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="md-btn-filled py-2 px-6 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-black"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Downloadable / Printable Overall Summary History & Tax Invoice */}
      {printInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden">
            {/* Top Toolbar (Non-printable) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-emerald-400">print</span>
                <span className="text-sm font-bold">Printable Clinical History &amp; Official Fee Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setPrintInvoiceModal(null)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-white text-slate-900 font-sans print:p-0">
              {/* Clinic Header */}
              <div className="flex items-start justify-between border-b-2 border-emerald-900 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-bold text-2xl">
                    <span className="material-symbols-outlined text-[32px]">spa</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
                      Bethany Nature Care &amp; Hospital
                    </h1>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      NABH Accredited Integrated Ayurveda &amp; Panchakarma Center
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Reg. No: AYUSH-MH-44201 &bull; GSTIN: 27AABCB1042K1Z9
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase">
                    Tax Invoice &amp; Clinical Summary
                  </span>
                  <p className="font-mono font-bold text-sm text-slate-900 mt-2">
                    {printInvoiceModal.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    Date: {printInvoiceModal.createdAt}
                  </p>
                  {printInvoiceModal.receiptNumber && (
                    <p className="text-xs font-bold text-emerald-800">
                      Receipt: {printInvoiceModal.receiptNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Patient & Doctor Demographics */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                    Patient Profile
                  </h4>
                  <p className="font-black text-sm text-slate-900">{printInvoiceModal.patientName}</p>
                  <p className="text-slate-600 mt-0.5">Patient ID: <span className="font-mono font-bold">{printInvoiceModal.patientId}</span></p>
                  <p className="text-slate-600">Care Mode: Outpatient / Inpatient Clinical Regimen</p>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-wider mb-1">
                    Attending Physician
                  </h4>
                  <p className="font-black text-sm text-slate-900">{printInvoiceModal.doctorName}</p>
                  <p className="text-slate-600 mt-0.5">Dept: Panchakarma &amp; Kayachikitsa</p>
                  <p className="text-slate-600">Payment Status: <span className="font-bold text-emerald-800">{printInvoiceModal.status} {printInvoiceModal.paymentMode ? `(${printInvoiceModal.paymentMode})` : ''}</span></p>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider mb-2">
                  Itemized Medicines, Procedures &amp; Care Details
                </h4>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item / Service Details</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {printInvoiceModal.items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {idx + 1}. {it.description}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{it.category}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">₹{it.unitPrice}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Ledger */}
              <div className="flex justify-end">
                <div className="w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{printInvoiceModal.subtotal}</span>
                  </div>
                  {printInvoiceModal.discountApprovedAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Approved Discount:</span>
                      <span>-₹{printInvoiceModal.discountApprovedAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5%):</span>
                    <span>₹{printInvoiceModal.taxAmount}</span>
                  </div>
                  <div className="border-t-2 border-emerald-900 pt-2 flex justify-between text-sm font-black text-emerald-950">
                    <span>Total Amount Paid:</span>
                    <span>₹{printInvoiceModal.finalTotal}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Certification */}
              <div className="pt-10 grid grid-cols-2 gap-12 text-xs">
                <div className="border-t border-slate-300 pt-2 text-center">
                  <p className="font-bold text-slate-800">Authorized Receptionist / Cashier</p>
                  <p className="text-[11px] text-slate-500">Bethany Nature Care Hospital Counter</p>
                </div>
                <div className="border-t border-slate-300 pt-2 text-center">
                  <p className="font-bold text-slate-800">Attending Physician Sign &amp; Stamp</p>
                  <p className="text-[11px] text-slate-500">{printInvoiceModal.doctorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
