/**
 * Structure tests for #why IPTV-hero section (TV-centered persuasion).
 * Reads shipped index.html + styles.css only.
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

let passed = 0;
let failed = 0;

function ok(name, cond) {
  if (cond) {
    console.log('PASS: ' + name);
    passed++;
  } else {
    console.log('FAIL: ' + name);
    failed++;
  }
}

const whyMatch = html.match(/id="why"[\s\S]*?<\/section>/);
ok('why section exists', !!whyMatch);
const why = whyMatch ? whyMatch[0] : '';

ok('title 왜 광고주들은 다시 TV로 돌아오는가', /왜 광고주들은[\s\S]*다시 TV로 돌아오는가/.test(why));
ok(
  'IPTV subcopy 신뢰감 + 데이터 기반 각인',
  /TV 시청 환경의 신뢰감에 데이터 기반 송출을 더해/.test(why) ||
    /브랜드를 더 크게 각인/.test(why)
);

ok('TV hero structure why-stage', /why-stage/.test(why) && /why-stage__tv/.test(why));
ok('large TV mock why-tv', /why-tv__screen/.test(why) && /YOUR BRAND|why-tv__brand/.test(why));
ok('mobile secondary only', /why-stage__mobile/.test(why) && /phone-mock--mini/.test(why));

// IPTV strength points
[
  '브랜드 신뢰감',
  '반복 노출',
  '큰 화면',
  '지역·채널 타겟 송출',
  '완전시청 기준 리포트',
].forEach((k) => ok('iptv strength: ' + k, why.includes(k)));

// Mobile limits (not strengths)
[
  '작은 화면',
  '빠른 스크롤',
  '순간 노출',
  '분산된 주의',
].forEach((k) => ok('mobile limit: ' + k, why.includes(k)));

ok('insights TV 브랜딩', /TV 브랜딩/.test(why));
ok(
  'hero message TV 반복 노출',
  /TV 화면의 반복 노출이 브랜드를 더 오래 남깁니다/.test(why) ||
    /작은 화면의 순간 노출보다/.test(why)
);
ok(
  'footer IPTV 브랜드 솔루션',
  /지역·채널·관심사 기반 송출을 더한 브랜드 광고 솔루션/.test(why)
);

// Banned: online advantages + balanced-role framing
const banned = [
  '빠른 테스트 가능',
  '클릭·전환 중심',
  '단기 성과 확인에 적합',
  '성과 광고와 브랜드 광고는 서로 다른 역할을 합니다',
  '클릭과 전환 중심의 운영에 강점',
  '온라인 퍼포먼스 광고',
  'why-exp__side--online',
  '보여도 흘러감',
  '보이면 기억됨',
  '스크롤 속 광고는 지나가지만',
];
banned.forEach((b) => ok('banned absent: ' + b, !why.includes(b)));

ok('no equal dual why-exp sides', !/why-exp__side--online/.test(why) && !/why-exp__side--iptv/.test(why));
ok('legacy table compare gone', !/why-compare__list/.test(why));

// CSS
ok('CSS why-stage', /\.why-stage\s*\{/.test(css));
ok('CSS why-tv', /\.why-tv__screen|\.why-tv\s*\{/.test(css));
ok(
  'CSS mobile 768 stack',
  /@media \(max-width:\s*768px\)[\s\S]{0,15000}?\.why-stage[\s\S]{0,400}?flex-direction:\s*column/.test(css)
);
ok(
  'CSS hide legacy why-exp',
  /\.section--why \.why-exp[\s\S]{0,200}display:\s*none/.test(css) ||
    /\.why-exp[\s\S]{0,40}display:\s*none\s*!important/.test(css)
);

console.log('');
console.log(failed === 0 ? 'All why IPTV-hero checks passed.' : failed + ' check(s) failed.');
console.log('Total: ' + (passed + failed) + ' (' + passed + ' passed, ' + failed + ' failed)');
process.exit(failed > 0 ? 1 : 0);
