'use strict';

const { products } = require('../models/index');
const { recalculatePricesByProduct } = require('./productPrices');
const { getSystemSetting } = require('./systemSettings');

// Task 2.1 — Module-level defaults
const DEFAULT_BASE_PRICE_PCT = 25;
const DEFAULT_CREDIT_PRICE_PCT = 35;

/**
 * Task 2.1 — Rounding helper: round-half-up to 2 decimal places.
 * Uses Number.EPSILON to avoid float edge cases (e.g. 1.005 → 1.01).
 */
const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

/**
 * Task 2.4 — Main exported function.
 * Reads purchase detail lines, groups by product_id, computes weighted landed cost
 * with tax, derives base_price and credit_price from system settings, persists to
 * products table, then cascades to product_prices via recalculatePricesByProduct.
 *
 * Fire-and-forget: caller catches errors externally — this function itself resolves
 * a summary object; per-product errors are isolated via Promise.allSettled.
 *
 * @param {Array} details - Array of purchase detail objects with {product_id, qty, unit_price, tax_rate}
 * @returns {Promise<{updated: number[], skipped: number[], failed: Array<{productId, error}>}>}
 */
const updatePricesFromPurchase = async (details) => {
  // Task 2.2 + 4.6 — Guard: empty or null details
  if (!details?.length) {
    return { updated: [], skipped: [], failed: [] };
  }

  // Task 2.3 + 4.4 — Read settings in parallel, fall back to defaults
  const [baseSetting, creditSetting] = await Promise.all([
    getSystemSetting('pricing.base_price_percentage'),
    getSystemSetting('pricing.credit_price_percentage')
  ]);

  const rawBase = baseSetting ? parseFloat(baseSetting.value) : NaN;
  const rawCredit = creditSetting ? parseFloat(creditSetting.value) : NaN;
  const basePct = Number.isNaN(rawBase) ? DEFAULT_BASE_PRICE_PCT : rawBase;
  const creditPct = Number.isNaN(rawCredit) ? DEFAULT_CREDIT_PRICE_PCT : rawCredit;

  // Task 2.2 — Group lines by product_id, accumulate weighted sums
  const groups = new Map();
  for (const line of details) {
    const { product_id: productId, qty, unit_price: unitPrice, tax_rate: taxRate } = line;
    if (!groups.has(productId)) {
      groups.set(productId, { sumQty: 0, sumWeighted: 0 });
    }
    const g = groups.get(productId);
    g.sumQty += qty;
    g.sumWeighted += unitPrice * (1 + taxRate / 100) * qty;
  }

  const updated = [];
  const skipped = [];
  const failed = [];

  // Task 2.4 + 4.5 — Per-product isolation via Promise.allSettled
  const perProductTasks = Array.from(groups.entries()).map(([productId, { sumQty, sumWeighted }]) =>
    (async () => {
      // Task 4.7 — Guard: zero qty
      if (sumQty === 0) {
        console.warn(`[PricingEngine] Product ${productId} has sumQty=0 — skipping.`);
        skipped.push(productId);
        return;
      }

      const weightedCostWithTax = sumWeighted / sumQty;
      const costPrice = round2(weightedCostWithTax);
      const basePrice = round2(weightedCostWithTax * (1 + basePct / 100));
      const creditPrice = round2(weightedCostWithTax * (1 + creditPct / 100));

      // Persist to products — MUST complete before cascade (recalculate reads base_price)
      await products.update(
        { cost_price: costPrice, base_price: basePrice, credit_price: creditPrice },
        { where: { id: productId } }
      );

      // Task S-04 cascade — run sequentially AFTER update
      const cascadeResult = await recalculatePricesByProduct(productId);

      // recalculatePricesByProduct returns {error} sentinels — treat as non-fatal skips
      if (cascadeResult && cascadeResult.error) {
        console.debug(`[PricingEngine] Product ${productId} cascade skipped: ${cascadeResult.error}`);
      }

      updated.push(productId);
    })()
  );

  const results = await Promise.allSettled(perProductTasks);

  // Collect thrown failures (not sentinel errors — those land in updated)
  results.forEach((r, idx) => {
    if (r.status === 'rejected') {
      const productId = Array.from(groups.keys())[idx];
      failed.push({ productId, error: r.reason?.message || String(r.reason) });
      console.error(`[PricingEngine] Product ${productId} failed:`, r.reason?.message);
    }
  });

  console.log(`[PricingEngine] updatePricesFromPurchase done — updated: ${updated.length}, skipped: ${skipped.length}, failed: ${failed.length}`);

  return { updated, skipped, failed };
};

module.exports = { updatePricesFromPurchase };
