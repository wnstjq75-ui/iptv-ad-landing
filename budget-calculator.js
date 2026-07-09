/**
 * Pure 30-day budget → complete-view exposure calculator.
 * Used by pricing simulator UI and node unit tests.
 *
 * KT 단독: 10원당 1회 → exposures = budgetWon / 10
 * SKT+LGU+ 통합: 5원당 1회 → exposures = budgetWon / 5
 * 3사 동시 송출: 예산 절반 KT(/10) + 절반 SKT+LGU+(/5), 최소 200만원
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BudgetCalculator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PRODUCTS = {
    kt: {
      id: 'kt',
      label: 'KT 단독',
      unitPrice: 10,
      unitLabel: '10원당 1회',
      minManwon: 100,
      bonus: 'KT 1개월 보너스 송출 제공',
    },
    sklg: {
      id: 'sklg',
      label: 'SKT, LGU+',
      unitPrice: 5,
      unitLabel: '5원당 1회',
      minManwon: 100,
      bonus: '동일 예산 대비 더 넓은 도달 가능',
    },
    all3: {
      id: 'all3',
      label: '3사 동시 송출',
      // 예산 50% KT(10원) + 50% SKT+LGU+(5원) — 내부 계산용
      unitPrice: null,
      unitLabel: '3사 통합',
      minManwon: 200,
      bonus: 'KT 1개월 보너스 송출 제공 / 최대 커버리지·브랜드 캠페인 적합',
    },
  };

  var MIN_MANWON = 100;
  var MAX_MANWON = 500;
  var STEP_MANWON = 10;
  var DEFAULT_MANWON = 100;

  function getProduct(productId) {
    return PRODUCTS[productId] || PRODUCTS.kt;
  }

  function minManwonForProduct(productId) {
    var p = getProduct(productId);
    return p.minManwon || MIN_MANWON;
  }

  function clampBudgetManwon(manwon, productId) {
    var min = productId ? minManwonForProduct(productId) : MIN_MANWON;
    var n = Math.round(Number(manwon) / STEP_MANWON) * STEP_MANWON;
    if (isNaN(n)) n = Math.max(DEFAULT_MANWON, min);
    if (n < min) n = min;
    if (n > MAX_MANWON) n = MAX_MANWON;
    return n;
  }

  function manwonToWon(manwon, productId) {
    return clampBudgetManwon(manwon, productId) * 10000;
  }

  /**
   * 3사: 예산의 절반은 KT 단가(/10), 절반은 SKT+LGU+ 단가(/5)
   * exposures = (won/2)/10 + (won/2)/5 = won/20 + won/10 = 3*won/20
   */
  function exposuresAll3(won) {
    var half = won / 2;
    var ktPart = Math.floor(half / PRODUCTS.kt.unitPrice);
    var skPart = Math.floor(half / PRODUCTS.sklg.unitPrice);
    return ktPart + skPart;
  }

  /**
   * @param {number} budgetManwon - budget in 만원
   * @param {string} productId - 'kt' | 'sklg' | 'all3'
   */
  function calculateExposures(budgetManwon, productId) {
    var product = getProduct(productId);
    var manwon = clampBudgetManwon(budgetManwon, product.id);
    var won = manwon * 10000;
    var exposures;

    if (product.id === 'all3') {
      exposures = exposuresAll3(won);
    } else {
      exposures = Math.floor(won / product.unitPrice);
    }

    return {
      budgetManwon: manwon,
      budgetWon: won,
      productId: product.id,
      productLabel: product.label,
      unitPrice: product.unitPrice,
      unitLabel: product.unitLabel,
      minManwon: product.minManwon || MIN_MANWON,
      bonus: product.bonus || '',
      exposures: exposures,
    };
  }

  function formatExposures(n) {
    return Math.floor(Number(n) || 0).toLocaleString('ko-KR');
  }

  function formatManwon(n, productId) {
    return clampBudgetManwon(n, productId).toLocaleString('ko-KR') + '만원';
  }

  return {
    PRODUCTS: PRODUCTS,
    MIN_MANWON: MIN_MANWON,
    MAX_MANWON: MAX_MANWON,
    STEP_MANWON: STEP_MANWON,
    DEFAULT_MANWON: DEFAULT_MANWON,
    minManwonForProduct: minManwonForProduct,
    clampBudgetManwon: clampBudgetManwon,
    manwonToWon: manwonToWon,
    getProduct: getProduct,
    exposuresAll3: exposuresAll3,
    calculateExposures: calculateExposures,
    formatExposures: formatExposures,
    formatManwon: formatManwon,
  };
});
