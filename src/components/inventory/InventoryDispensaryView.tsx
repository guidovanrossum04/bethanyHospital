import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { dataStoreService } from '../../services/data-store.service';

interface InventoryDispensaryViewProps {
  onShowToast: (msg: string) => void;
}

export const InventoryDispensaryView: React.FC<InventoryDispensaryViewProps> = ({ onShowToast }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(dataStoreService.getInventory());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newClassification, setNewClassification] = useState<InventoryItem['classification']>('Herbal Powders');
  const [newQty, setNewQty] = useState(50);
  const [newBatch, setNewBatch] = useState('BTH-2024-88');
  const [newExpiry, setNewExpiry] = useState('2026-12-31');
  const [newPrice, setNewPrice] = useState(22.5);
  const [newRack, setNewRack] = useState('Rack B-04');
  const [newPackaging, setNewPackaging] = useState('250g Jar');

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const refreshInventory = () => {
    setInventory(dataStoreService.getInventory());
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItemIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedItemIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRemoveSelected = () => {
    if (selectedItemIds.length === 0) return;
    if (
      confirm(
        `Are you sure you want to remove ${selectedItemIds.length} selected item(s) from herbal inventory?`
      )
    ) {
      dataStoreService.deleteInventoryItems(selectedItemIds);
      refreshInventory();
      setSelectedItemIds([]);
      onShowToast(`Removed ${selectedItemIds.length} item(s) from inventory registry.`);
    }
  };

  const handleQuickRestock = (item: InventoryItem) => {
    dataStoreService.restockItem(item.id, 25);
    refreshInventory();
    onShowToast(`Restocked +25 units for ${item.name} (${item.code}).`);
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;

    dataStoreService.addInventoryItem({
      code: newCode.toUpperCase(),
      name: newName,
      packaging: newPackaging,
      classification: newClassification,
      batchNumber: newBatch,
      expiryDate: `Exp: ${new Date(newExpiry).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })}`,
      expiryIso: newExpiry,
      stockLevel: Number(newQty),
      maxCapacity: Number(newQty) + 50,
      unitPrice: Number(newPrice),
      costPrice: Number((newPrice * 0.55).toFixed(2)),
      reorderThreshold: 15,
      storageRack: newRack,
    });

    refreshInventory();
    setShowAddModal(false);
    setNewName('');
    setNewCode('');
    onShowToast(`Remedy ${newName} successfully cataloged into dispensary inventory.`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    dataStoreService.updateInventoryItem(editingItem);
    refreshInventory();
    setEditingItem(null);
    onShowToast(`Inventory details for ${editingItem.name} updated.`);
  };

  const handleExportCsv = () => {
    const headers = 'Item Code,Short Code,Remedy Name,Classification,Batch,Expiry,Stock Level,Unit Price,Storage Rack\n';
    const rows = inventory
      .map(
        (i) =>
          `"${i.code}","${i.shortCode}","${i.name}","${i.classification}","${i.batchNumber}","${i.expiryDate}",${i.stockLevel},${i.unitPrice},"${i.storageRack}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bethany-herbal-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Herbal Inventory CSV exported successfully.');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStockStatus('ALL');
  };

  const filteredItems = inventory.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.batchNumber.toLowerCase().includes(q) ||
      item.classification.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'ALL' || item.classification === selectedCategory;

    const matchesStock =
      selectedStockStatus === 'ALL' || item.status === selectedStockStatus;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = inventory.filter(
    (i) => i.status === 'LOW_STOCK' || i.status === 'CRITICAL'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Page Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Herbal Dispensary
            </span>
            <span className="text-on-surface-variant text-xs font-medium">| Main Depot</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-forest-deep tracking-tight">
            Store Management
          </h2>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Manage herbal remedies, pharmaceutical inventory, and stock replenishment across clinical
            suites.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2.5 rounded-xl shadow-xs text-forest-deep text-xs font-semibold border border-sage-wash/50">
            <span className="material-symbols-outlined text-secondary text-lg">event_available</span>
            <span>Tuesday, Oct 24</span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
            <button
              disabled={selectedItemIds.length === 0}
              onClick={handleRemoveSelected}
              className={`md-btn flex-1 sm:flex-initial transition-all ${
                selectedItemIds.length > 0
                  ? 'bg-error-container text-error hover:bg-error hover:text-white shadow-xs cursor-pointer'
                  : 'bg-surface-container-high text-on-surface-variant opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
              <span className="truncate">Remove Item</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="md-btn md-btn-filled flex-1 sm:flex-initial"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span className="truncate">Add New Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Inventory
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">1,420</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center">
                <span className="material-symbols-outlined text-sm">arrow_upward</span> +4.8%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Across 8 clinical classifications</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-red-600">
              Low Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-600 font-mono tabular-nums">{lowStockCount || 3}</span>
              <span className="text-xs font-bold text-red-700">Require Reorder</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate" title="Ashwagandha, Brahmi, Triphala">
              Ashwagandha, Brahmi, Triphala...
            </p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Expiring in 60d
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">schedule</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">12</span>
              <span className="text-xs text-amber-800 font-bold">Batch audit req.</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Review herbal decoctions</p>
          </div>
        </div>

        {/* Categories */}
        <div className="md-card md-card-interactive p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Category Depth
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">category</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">8</span>
              <span className="text-xs text-emerald-800 font-bold">Active Sections</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Oils, Churnas, Guggulus, Elixirs</p>
          </div>
        </div>
      </div>

      {/* Main Store Content Section */}
      <div className="md-card overflow-hidden flex flex-col">
        {/* Filter Bar & Search Controls */}
        <div className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 border-b border-slate-200">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (AYU-104), remedy, or batch..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 border border-slate-200"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white pl-3.5 pr-8 py-2.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none border border-slate-200 cursor-pointer"
              >
                <option value="ALL">All Classifications</option>
                <option value="Ayurvedic Oils">Ayurvedic Oils</option>
                <option value="Herbal Powders">Herbal Powders</option>
                <option value="Capsules & Vati">Capsules & Vati</option>
                <option value="Elixirs & Arishta">Elixirs & Arishta</option>
                <option value="Clinical Supplies">Clinical Supplies</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="appearance-none bg-white pl-3.5 pr-8 py-2.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none border border-slate-200 cursor-pointer"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="CRITICAL">Critical Low</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
                expand_more
              </span>
            </div>

            <button
              onClick={resetFilters}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              onClick={handleExportCsv}
              className="md-btn md-btn-tonal py-2 px-3.5"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips Status Bar */}
        <div className="px-5 py-2.5 bg-emerald-50/50 flex items-center justify-between text-xs text-slate-700 border-b border-emerald-100/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-emerald-700">tune</span>
            <span>
              Showing 1 to <strong>{filteredItems.length}</strong> of <strong>1,420</strong> catalog remedies
            </span>
            {selectedItemIds.length > 0 && (
              <span className="ml-3 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[11px]">
                {selectedItemIds.length} Selected
              </span>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="md-table-container">
          <table className="md-table">
            <thead>
              <tr>
                <th className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredItems.length > 0 && selectedItemIds.length === filteredItems.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                </th>
                <th>Item Name &amp; Code</th>
                <th>Classification</th>
                <th>Batch &amp; Expiry</th>
                <th>Stock Level</th>
                <th>Unit MRP</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const isCritical = item.status === 'CRITICAL';
                const isLowStock = item.status === 'LOW_STOCK';
                const percent = Math.min(100, Math.round((item.stockLevel / item.maxCapacity) * 100));

                return (
                  <tr
                    key={item.id}
                    className={isSelected ? 'bg-emerald-50/70' : ''}
                  >
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(item.id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-emerald-100">
                          {item.shortCode}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                          <p className="text-slate-500 font-mono text-[11px]">
                            {item.code} · {item.packaging}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {item.classification}
                      </span>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <p className="font-mono text-slate-900 font-medium">{item.batchNumber}</p>
                        <p
                          className={`font-semibold ${
                            isCritical || isLowStock ? 'text-red-600' : 'text-slate-500'
                          }`}
                        >
                          {item.expiryDate}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isCritical || isLowStock
                                ? 'bg-red-50 text-red-700'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCritical || isLowStock ? 'bg-red-500' : 'bg-emerald-600'
                              }`}
                            />
                            {item.statusText}
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical || isLowStock ? 'bg-red-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-bold text-slate-900 text-sm font-mono tabular-nums">
                        ${item.unitPrice.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        Cost: ${item.costPrice.toFixed(2)}
                      </p>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickRestock(item)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer border border-emerald-200/60"
                          title="Fast Restock (+25 Units)"
                        >
                          <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Item Details"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 text-xs text-slate-600">
          <div>
            Showing 1–{filteredItems.length} of 1,420 catalog remedies
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <button className="w-8 h-8 rounded-lg bg-emerald-700 text-white shadow-xs">1</button>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">2</button>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700">18</button>
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW REMEDY / STOCK */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-sage-wash">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">add_box</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-forest-deep">Add Herbal Remedy / Stock</h4>
                  <p className="text-xs text-on-surface-variant">Bethany Nature Care Pharmacy Registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Remedy Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Haritaki Churna"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Item Code (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. AYU-510"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Classification</label>
                  <select
                    value={newClassification}
                    onChange={(e) =>
                      setNewClassification(e.target.value as InventoryItem['classification'])
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs"
                  >
                    <option>Ayurvedic Oils</option>
                    <option>Herbal Powders</option>
                    <option>Capsules & Vati</option>
                    <option>Elixirs & Arishta</option>
                    <option>Clinical Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Initial Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Unit Price ($) *</label>
                  <input
                    type="number"
                    step={0.01}
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Packaging Spec</label>
                  <input
                    type="text"
                    value={newPackaging}
                    onChange={(e) => setNewPackaging(e.target.value)}
                    placeholder="250g Jar"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Depot Storage Rack</label>
                  <input
                    type="text"
                    value={newRack}
                    onChange={(e) => setNewRack(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-sage-wash text-on-surface text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-sage-wash flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold cursor-pointer"
                >
                  Save into Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ITEM DETAILS */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-300/80 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-sage-wash mb-4">
              <h3 className="font-bold text-forest-deep text-base">Edit {editingItem.name}</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-forest-deep mb-1">Stock Level (Units)</label>
                <input
                  type="number"
                  min={0}
                  value={editingItem.stockLevel}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, stockLevel: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-lg bg-surface border border-sage-wash"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step={0.01}
                    value={editingItem.unitPrice}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unitPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-lg bg-surface border border-sage-wash"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-deep mb-1">Depot Rack</label>
                  <input
                    type="text"
                    value={editingItem.storageRack}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, storageRack: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg bg-surface border border-sage-wash"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-sage-wash flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded-lg border border-sage-wash"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold rounded-lg bg-primary text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
