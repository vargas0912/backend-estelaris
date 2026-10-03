// transfersData.js
// Fixtures para el módulo de transferencias
// Los IDs de sucursal, detalle y lote (purchId) se setean dinámicamente en los tests

const transferCreate = (fromBranchId, toBranchId, purchId) => ({
  from_branch_id: fromBranchId,
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  transport_plate: 'ABC-123',
  notes: 'Transferencia de prueba',
  items: [
    {
      product_id: 'TEST-001',
      purch_id: purchId,
      qty: 5,
      unit_cost: 100.00,
      notes: 'Ítem de prueba'
    }
  ]
});

const transferNoFromBranch = (toBranchId, purchId) => ({
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', purch_id: purchId, qty: 5, unit_cost: 100.00 }
  ]
});

const transferNoToBranch = (fromBranchId, purchId) => ({
  from_branch_id: fromBranchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', purch_id: purchId, qty: 5, unit_cost: 100.00 }
  ]
});

const transferSameBranch = (branchId, purchId) => ({
  from_branch_id: branchId,
  to_branch_id: branchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', purch_id: purchId, qty: 5, unit_cost: 100.00 }
  ]
});

const transferNoItems = (fromBranchId, toBranchId) => ({
  from_branch_id: fromBranchId,
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  items: []
});

const transferNoPurchId = (fromBranchId, toBranchId) => ({
  from_branch_id: fromBranchId,
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', qty: 5, unit_cost: 100.00 }
  ]
});

const transferDuplicateLot = (fromBranchId, toBranchId, purchId) => ({
  from_branch_id: fromBranchId,
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', purch_id: purchId, qty: 6, unit_cost: 100.00 },
    { product_id: 'TEST-001', purch_id: purchId, qty: 6, unit_cost: 100.00 }
  ]
});

const transferTwoLotsSameProduct = (fromBranchId, toBranchId, purchIdA, purchIdB) => ({
  from_branch_id: fromBranchId,
  to_branch_id: toBranchId,
  transfer_date: '2026-03-02',
  items: [
    { product_id: 'TEST-001', purch_id: purchIdA, qty: 2, unit_cost: 100.00 },
    { product_id: 'TEST-001', purch_id: purchIdB, qty: 3, unit_cost: 100.00 }
  ]
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
  transferNoPurchId,
  transferDuplicateLot,
  transferTwoLotsSameProduct,
  transferUpdate,
  receiveAllItems,
  receivePartialItems,
  receiveExceedsQty
};
