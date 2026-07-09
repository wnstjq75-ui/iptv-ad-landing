/**
 * Unit tests against shipped BudgetCalculator (budget-calculator.js).
 * Run: node test-budget-calculator.js
 */
'use strict';

const path = require('path');
const fs = require('fs');
const Calc = require(path.join(__dirname, 'budget-calculator.js'));

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed++;
  } else {
    console.log('PASS:', msg);
  }
}

// Defaults / clamps
assert(Calc.DEFAULT_MANWON === 100, 'default 100만');
assert(Calc.MIN_MANWON === 100 && Calc.MAX_MANWON === 500, 'range 100–500');
assert(Calc.STEP_MANWON === 10, 'step 10만');
assert(Calc.clampBudgetManwon(95) === 100, 'clamp min');
assert(Calc.clampBudgetManwon(510) === 500, 'clamp max');
assert(Calc.clampBudgetManwon(205) === 210 || Calc.clampBudgetManwon(205) === 200, 'step round');

// KT 단독: won / 10
const kt100 = Calc.calculateExposures(100, 'kt');
assert(kt100.exposures === 100000, 'KT 100만 → 100,000');
assert(Calc.calculateExposures(300, 'kt').exposures === 300000, 'KT 300만 → 300,000');
assert(Calc.calculateExposures(500, 'kt').exposures === 500000, 'KT 500만 → 500,000');
assert(Calc.calculateExposures(110, 'kt').exposures === 110000, 'KT 110만 step');

// SKT + LGU+: won / 5
assert(Calc.calculateExposures(100, 'sklg').exposures === 200000, 'SK 100만 → 200,000');
assert(Calc.calculateExposures(300, 'sklg').exposures === 600000, 'SK 300만 → 600,000');
assert(Calc.calculateExposures(500, 'sklg').exposures === 1000000, 'SK 500만 → 1,000,000');

// 3사 동시 송출: min 200만, half KT(/10) + half SK(/5)
assert(Calc.minManwonForProduct('all3') === 200, '3사 min 200만');
assert(Calc.clampBudgetManwon(100, 'all3') === 200, '3사 clamps 100→200');
// 200만 = 100만 KT + 100만 SK = 100,000 + 200,000 = 300,000
assert(Calc.calculateExposures(200, 'all3').exposures === 300000, '3사 200만 → 300,000');
// 300만 = 150만 each → 150,000 + 300,000 = 450,000
assert(Calc.calculateExposures(300, 'all3').exposures === 450000, '3사 300만 → 450,000');
// 500만 = 250만 each → 250,000 + 500,000 = 750,000
assert(Calc.calculateExposures(500, 'all3').exposures === 750000, '3사 500만 → 750,000');
assert(Calc.PRODUCTS.all3.label.indexOf('3사') !== -1, '3사 product exists');
assert(Calc.PRODUCTS.all3.unitLabel === '3사 통합', '3사 unit label is 3사 통합');

// Labels
assert(kt100.productLabel === 'KT 단독', 'KT label');
assert(Calc.calculateExposures(100, 'sklg').productLabel.indexOf('SKT') !== -1, 'SK label');
assert(Calc.formatExposures(100000).indexOf('100') !== -1, 'comma format');

// Structure wiring
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
assert(html.indexOf('id="pricing"') !== -1, 'pricing section');
assert(html.indexOf('budget-calculator') !== -1 || html.indexOf('ad-calc') !== -1, 'calculator markup');
assert(html.indexOf('KT 단독') !== -1, 'KT tab label');
assert(html.indexOf('SKT, LGU+') !== -1, 'SK tab');
assert(html.indexOf('3사 동시 송출') !== -1, '3사 tab');
assert(html.indexOf('pricing-tiers') === -1, 'static package tiers removed');
assert(html.indexOf('이 예산으로 상담 문의') !== -1, 'CTA budget contact');
assert(html.indexOf('패키지 상담 받기') !== -1, 'CTA package contact');
assert(html.indexOf('100만원부터') !== -1 || html.indexOf('월 100만원부터') !== -1, '100만 entry msg');
assert(html.indexOf('월 예산 기준 예상 노출 수를 계산합니다') !== -1, 'disclaimer monthly');
assert(html.indexOf('실제 계약은 3개월 단위로 진행됩니다') !== -1, 'disclaimer 3-month');
assert(Calc.PRODUCTS.sklg.bonus.indexOf('더 넓은 도달') !== -1, 'SK benefit copy');
assert(Calc.PRODUCTS.all3.bonus.indexOf('KT 1개월 보너스') !== -1, '3사 KT bonus');
assert(Calc.PRODUCTS.all3.bonus.indexOf('/') !== -1, '3사 dual benefit');
assert(html.indexOf('src="budget-calculator.js"') !== -1, 'loads math module');
assert(js.indexOf('BudgetCalculator.calculateExposures') !== -1, 'script uses real math');

const pricing = html.slice(html.indexOf('id="pricing"'), html.indexOf('id="contact"'));
assert(pricing.indexOf('type="range"') !== -1 || pricing.indexOf('ad-calc__slider') !== -1, 'slider in pricing');
assert(pricing.indexOf('min="100"') !== -1 && pricing.indexOf('max="500"') !== -1, 'slider min max');
assert(pricing.indexOf('step="10"') !== -1, 'slider step 10');
assert(pricing.indexOf('data-calc-product="all3"') !== -1, 'all3 tab in pricing');

if (failed) {
  console.error('\n' + failed + ' failed');
  process.exit(1);
}
console.log('\nAll budget calculator checks passed.');
process.exit(0);
