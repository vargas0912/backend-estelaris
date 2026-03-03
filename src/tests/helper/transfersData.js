// transfersData.js
// Fixtures para el módulo de transferencias
// Los IDs de sucursal y detalle se setean dinámicamente en los tests

const transferCreate = (fromBranchId, toBranchId) => ({
  from_branch_id: fromBranchId,
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  transport_plate: 'ABC-123',
  notes: 'Transferencia de prueba',
  items: [
    {
      product_id: 'TEST-001',
      qty: 5,
      unit_cost: 100.00,
      notes: 'Ítem de prueba'
    }
  ]
});

const transferNoFromBranch = (toBranchId) => ({
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', qty: 5, unit_cost: 100.00 }
  ]
});

const transferNoToBranch = (fromBranchId) => ({
  from_branch_id: fromBranchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', qty: 5, unit_cost: 100.00 }
  ]
});

const transferSameBranch = (branchId) => ({
  from_branch_id: branchId,
  to_branch_id: branchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', qty: 5, unit_cost: 100.00 }
  ]
});

const transferNoItems = (fromBranchId, toBranchId) => ({
  from_branch_id: fromBranchId,
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  items: []
});

const transferUpdate = () => ({
  transport_plate: 'XYZ-999',
  notes: 'Notas actualizadas'
});

const receiveAllItems = (detailId, qty) => ({
  items: [
    { detail_id: detailId, qty_received: qty }
  ]
});

const receivePartialItems = (detailId, qty) => ({
  items: [
    { detail_id: detailId, qty_received: parseFloat((qty / 2).toFixed(3)) }
  ]
});

const receiveExceedsQty = (detailId, qty) => ({
  items: [
    { detail_id: detailId, qty_received: qty + 1 }
  ]
});

module.exports = {
  transferCreate,
  transferNoFromBranch,
  transferNoToBranch,
  transferSameBranch,
  transferNoItems,
  transferUpdate,
  receiveAllItems,
  receivePartialItems,
  receiveExceedsQty
};
