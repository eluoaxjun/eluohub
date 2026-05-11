#!/usr/bin/env node
/**
 * baseline-plan-sb.js — plan-sb dist 패키지 회귀 테스트 (Phase 3.3)
 *
 * Usage: node test/baseline-plan-sb.js
 *
 * 동작:
 *  1) 격리 폴더에 dist/plan-sb 복사
 *  2) v2 샘플 + v1 알뜰폰 샘플 각각 generate.js 실행
 *  3) verify.js로 ERROR 0, slide count 일치 검증
 *  4) mockup-capture.js PC + MO 캡쳐 검증
 *  5) PASS/FAIL 판정
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TMP = `C:/tmp/baseline-plan-sb-${Date.now()}`;
const DIST = 'D:/eluo-hub_v4/dist/plan-sb';

function die(msg) { console.error('[FAIL]', msg); process.exit(1); }
function pass(msg) { console.log('[PASS]', msg); }

// 1) 격리 복사
console.log(`=== baseline-plan-sb (${TMP}) ===\n`);
fs.cpSync(DIST, TMP, { recursive: true });
process.chdir(TMP);

// expectedErrors: KMVNO는 placeholder 의도된 미완성 운영 샘플이라 시각 완결성 ERROR가 정상 동작
const expectations = [
  { name: 'v2-sample', json: 'v2-1-e2e-test.json', expectedSlides: 11, expectedErrors: 0 },
  { name: 'v1-kmvno',  json: 'KMVNO-5628.json',    expectedSlides: 9,  expectedErrors: 2 }
];

for (const exp of expectations) {
  console.log(`\n── [${exp.name}] ──`);
  const src = path.join(TMP, '.claude/skills/plan-sb/example', exp.json);
  const dst = path.join(TMP, 'input', `${exp.name}.json`);
  fs.cpSync(src, dst);

  // generate
  const genOut = execSync(`node ".claude/skills/plan-sb/scripts/generate.js" "${dst}"`, { encoding: 'utf8' });
  const slideMatch = genOut.match(/슬라이드\s+(\d+)개/);
  if (!slideMatch) die(`${exp.name} generate 슬라이드 수 추출 실패`);
  const actualSlides = parseInt(slideMatch[1], 10);
  if (actualSlides !== exp.expectedSlides) die(`${exp.name} 슬라이드 수 불일치: ${actualSlides} ≠ ${exp.expectedSlides}`);
  pass(`${exp.name} generate ${actualSlides}개 슬라이드`);

  // HTML 경로 추출
  const htmlMatch = genOut.match(/\[OK\]\s+HTML:\s+(.+?\.html)/);
  if (!htmlMatch) die(`${exp.name} HTML 경로 추출 실패`);
  const htmlPath = htmlMatch[1].trim();

  // verify (exitCode 2는 ERROR 있음, but expected이면 OK)
  let verOut;
  try {
    verOut = execSync(`node ".claude/skills/plan-sb/scripts/verify.js" "${htmlPath}"`, { encoding: 'utf8' });
  } catch (e) {
    verOut = e.stdout || '';
  }
  const errMatch = verOut.match(/ERROR:\s+(\d+)건/);
  const errCount = errMatch ? parseInt(errMatch[1], 10) : 99;
  if (errCount !== exp.expectedErrors) die(`${exp.name} verify ERROR 불일치: ${errCount} ≠ 기대값 ${exp.expectedErrors}`);
  pass(`${exp.name} verify ERROR ${errCount}건 (기대값 일치)`);
}

// mockup-capture 검증
console.log('\n── [mockup-capture] ──');
fs.writeFileSync('input/mockup-baseline.html',
  '<!DOCTYPE html><html><body><h1>Baseline Test</h1><p>mockup-capture 회귀 검증</p></body></html>'
);
execSync('node .claude/skills/plan-sb/scripts/mockup-capture.js input/mockup-baseline.html input/ --name=baseline --pc-only', { stdio: 'inherit' });
execSync('node .claude/skills/plan-sb/scripts/mockup-capture.js input/mockup-baseline.html input/ --name=baseline --mobile-only', { stdio: 'inherit' });
if (!fs.existsSync('input/baseline-pc.png')) die('PC 캡쳐 미생성');
if (!fs.existsSync('input/baseline-mo.png')) die('MO 캡쳐 미생성');
const pcSize = fs.statSync('input/baseline-pc.png').size;
const moSize = fs.statSync('input/baseline-mo.png').size;
if (pcSize < 5000) die(`PC 캡쳐 비정상 크기 ${pcSize}B`);
if (moSize < 5000) die(`MO 캡쳐 비정상 크기 ${moSize}B`);
// 모바일 fullPage 버그 회귀 차단 — viewport 미명시 시 100KB 미만이어야 (1962×4246 = 1.5MB+ 였음)
if (moSize > 100000) die(`MO 캡쳐 크기 ${moSize}B — fullPage 버그 회귀 의심 (정상 < 100KB)`);
pass(`mockup-capture PC ${pcSize}B / MO ${moSize}B`);

console.log('\n=== ALL PASS — plan-sb dist baseline 통과 ===');

// 정리
process.chdir('/');
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch {}
