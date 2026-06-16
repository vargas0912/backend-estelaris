'use strict';

// Mock models
jest.mock('../../models/index', () => ({
  products: {
    update: jest.fn()
  }
}));

// Mock recalculatePricesByProduct from productPrices service
jest.mock('../../services/productPrices', () => ({
  recalculatePricesByProduct: jest.fn()
}));

// Mock getSystemSetting from systemSettings service
jest.mock('../../services/systemSettings', () => ({
  getSystemSetting: jest.fn()
}));

const { products } = require('../../models/index');
const { recalculatePricesByProduct } = require('../../services/productPrices');
const { getSystemSetting } = require('../../services/systemSettings');
const { updatePricesFromPurchase } = require('../../services/productPricing');

describe('ProductPricing Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: settings present with standard values
    getSystemSetting.mockImplementation((key) => {
      if (key === 'base_price_percentage') return Promise.resolve({ value: '25' });
      if (key === 'credit_price_percentage') return Promise.resolve({ value: '35' });
      return Promise.resolve(null);
    });
    products.update.mockResolvedValue([1]);
    recalculatePricesByProduct.mockResolvedValue({ product_id: 1, updated: 1 });
  });

  // Task 4.1 — Single line per product, S-01 scenario 1 + S-02 happy path
  test('4.1 Single line per product: cost=116.00, base=145.00, credit=156.60', async () => {
    const details = [
      { product_id: 1, qty: 5, unit_price: 100.00, tax_rate: 16 }
    ];

    const result = await updatePricesFromPurchase(details);

    expect(products.update).toHaveBeenCalledTimes(1);
    expect(products.update).toHaveBeenCalledWith(
      { cost_price: 116.00, base_price: 145.00, credit_price: 156.60 },
      { where: { id: 1 } }
    );
    expect(recalculatePricesByProduct).toHaveBeenCalledWith(1);
    expect(result.updated).toContain(1);
  });

  // Task 4.2 — Multiple lines same product, same tax_rate
  test('4.2 Multiple lines same product same tax_rate: weighted_cost=132.24', async () => {
    const details = [
      { product_id: 2, qty: 3, unit_price: 100.00, tax_rate: 16 },
      { product_id: 2, qty: 7, unit_price: 120.00, tax_rate: 16 }
    ];

    await updatePricesFromPurchase(details);

    expect(products.update).toHaveBeenCalledTimes(1);
    const callArgs = products.update.mock.calls[0][0];
    expect(callArgs.cost_price).toBe(132.24);
    expect(callArgs.base_price).toBe(165.30);
    expect(callArgs.credit_price).toBe(178.52);
  });

  // Task 4.3 — Multiple lines same product, DIFFERENT tax_rates
  test('4.3 Multiple lines same product different tax_rates: weighted_cost=111.20', async () => {
    const details = [
      { product_id: 3, qty: 4, unit_price: 100.00, tax_rate: 16 },
      { product_id: 3, qty: 6, unit_price: 100.00, tax_rate: 8 }
    ];

    await updatePricesFromPurchase(details);

    expect(products.update).toHaveBeenCalledTimes(1);
    const callArgs = products.update.mock.calls[0][0];
    expect(callArgs.cost_price).toBe(111.20);
    expect(callArgs.base_price).toBe(139.00);
    expect(callArgs.credit_price).toBe(150.12);
  });

  // Task 4.4 — Settings absent → defaults (25 / 35)
  test('4.4 Settings absent: falls back to defaults 25% and 35%', async () => {
    getSystemSetting.mockResolvedValue(null);

    const details = [
      { product_id: 4, qty: 5, unit_price: 100.00, tax_rate: 16 }
    ];

    await expect(updatePricesFromPurchase(details)).resolves.not.toThrow();

    const callArgs = products.update.mock.calls[0][0];
    expect(callArgs.cost_price).toBe(116.00);
    expect(callArgs.base_price).toBe(145.00);
    expect(callArgs.credit_price).toBe(156.60);
  });

  // Task 4.5 — One product fails, others still processed (allSettled isolation)
  test('4.5 One product update throws: other products still processed', async () => {
    products.update
      .mockRejectedValueOnce(new Error('DB error product 1'))
      .mockResolvedValueOnce([1]);

    const details = [
      { product_id: 1, qty: 5, unit_price: 100.00, tax_rate: 16 },
      { product_id: 2, qty: 3, unit_price: 80.00, tax_rate: 16 }
    ];

    const result = await updatePricesFromPurchase(details);

    expect(products.update).toHaveBeenCalledTimes(2);
    expect(result.failed.length).toBe(1);
    expect(result.failed[0].productId).toBe(1);
    expect(result.updated).toContain(2);
  });

  // Task 4.6 — Empty/null details → early return, no DB calls
  test('4.6a Empty details array: returns early, no DB calls', async () => {
    const result = await updatePricesFromPurchase([]);

    expect(products.update).not.toHaveBeenCalled();
    expect(recalculatePricesByProduct).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  test('4.6b Null details: returns early, no DB calls', async () => {
    const result = await updatePricesFromPurchase(null);

    expect(products.update).not.toHaveBeenCalled();
    expect(recalculatePricesByProduct).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  // Task 4.7 — Σqty === 0 → product skipped, others proceed
  test('4.7 Zero qty product is skipped, other products proceed', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const details = [
      { product_id: 5, qty: 0, unit_price: 100.00, tax_rate: 16 },
      { product_id: 6, qty: 3, unit_price: 80.00, tax_rate: 16 }
    ];

    const result = await updatePricesFromPurchase(details);

    // Product 5 skipped, product 6 updated
    expect(result.skipped).toContain(5);
    expect(result.updated).toContain(6);
    expect(products.update).toHaveBeenCalledTimes(1);
    expect(products.update.mock.calls[0][1]).toEqual({ where: { id: 6 } });

    consoleSpy.mockRestore();
  });

  // Task 4.5 continued — recalculatePricesByProduct returns {error} sentinel → non-fatal skip
  test('4.5b recalculatePricesByProduct returns error sentinel: treated as skip, not failure', async () => {
    recalculatePricesByProduct.mockResolvedValue({ error: 'PRODUCT_NOT_FOUND_OR_INACTIVE' });

    const details = [
      { product_id: 1, qty: 5, unit_price: 100.00, tax_rate: 16 },
      { product_id: 2, qty: 3, unit_price: 80.00, tax_rate: 16 }
    ];

    const result = await updatePricesFromPurchase(details);

    expect(products.update).toHaveBeenCalledTimes(2);
    // No failures — sentinel is non-fatal
    expect(result.failed.length).toBe(0);
  });
});
