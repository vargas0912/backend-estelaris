const { transfers, productStocks } = require('../../models/index');
const { updateFromTransfer } = require('../../services/productStocks');
const { dispatchTransfer } = require('../../services/transfers');

jest.mock('../../models/index', () => ({
  transfers: { findOne: jest.fn() },
  transferDetails: {},
  branches: {},
  users: {},
  employees: {},
  products: {},
  productStocks: { findOne: jest.fn() },
  sequelize: { transaction: jest.fn() }
}));

jest.mock('../../services/productStocks', () => ({
  ...jest.requireActual('../../services/productStocks'),
  updateFromTransfer: jest.fn(),
  revertFromTransfer: jest.fn()
}));

const { sequelize } = require('../../models/index');

const FROM_BRANCH = 1;
const TO_BRANCH = 2;

const buildTransfer = (details) => ({
  id: 10,
  from_branch_id: FROM_BRANCH,
  to_branch_id: TO_BRANCH,
  status: 'Borrador',
  details,
  save: jest.fn()
});

// Dos lotes del mismo producto en origen: el lote viejo (purch_id 3) agotado,
// el lote nuevo (purch_id 7) con stock. Un findOne por product_id+branch_id
// devuelve el lote viejo, como hace MySQL con el primer registro insertado.
const lots = [
  { product_id: 'EREN', branch_id: FROM_BRANCH, purch_id: 3, bar_code: 'EREN-3', quantity: '0.000' },
  { product_id: 'EREN', branch_id: FROM_BRANCH, purch_id: 7, bar_code: 'EREN-7', quantity: '10.000' }
];

const findLot = ({ where }) => Promise.resolve(
  lots.find(lot => Object.entries(where).every(([key, value]) => lot[key] === value)) || null
);

describe('Transfers Service - Unit Tests', () => {
  let transaction;

  beforeEach(() => {
    jest.clearAllMocks();
    transfers.findOne.mockReset();
    transaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
      LOCK: { UPDATE: 'UPDATE' }
    };
    sequelize.transaction.mockResolvedValue(transaction);
    productStocks.findOne.mockImplementation(findLot);
  });

  describe('dispatchTransfer', () => {
    test('debe validar stock contra el lote (bar_code) del ítem, no contra cualquier lote del producto', async () => {
      const transfer = buildTransfer([{ product_id: 'EREN', purch_id: 7, qty: '5.000' }]);
      transfers.findOne
        .mockResolvedValueOnce(transfer)
        .mockResolvedValueOnce({ id: 10, status: 'En_Transito' });

      const result = await dispatchTransfer(10, 1, FROM_BRANCH);

      expect(result).toEqual({ id: 10, status: 'En_Transito' });
      expect(productStocks.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { bar_code: 'EREN-7', branch_id: FROM_BRANCH }
      }));
      expect(updateFromTransfer).toHaveBeenCalled();
      expect(transaction.commit).toHaveBeenCalled();
    });

    test('debe retornar INSUFFICIENT_STOCK si el lote del ítem no alcanza', async () => {
      const transfer = buildTransfer([{ product_id: 'EREN', purch_id: 7, qty: '15.000' }]);
      transfers.findOne.mockResolvedValueOnce(transfer);

      const result = await dispatchTransfer(10, 1, FROM_BRANCH);

      expect(result).toEqual({ error: 'INSUFFICIENT_STOCK', product_id: 'EREN' });
      expect(updateFromTransfer).not.toHaveBeenCalled();
      expect(transaction.rollback).toHaveBeenCalled();
    });

    test('debe retornar INSUFFICIENT_STOCK si el lote del ítem no existe en origen', async () => {
      const transfer = buildTransfer([{ product_id: 'EREN', purch_id: 99, qty: '1.000' }]);
      transfers.findOne.mockResolvedValueOnce(transfer);

      const result = await dispatchTransfer(10, 1, FROM_BRANCH);

      expect(result).toEqual({ error: 'INSUFFICIENT_STOCK', product_id: 'EREN' });
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });
});
