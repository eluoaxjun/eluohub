#!/usr/bin/env node
/**
 * HTML 목업 → 스크린샷 변환 (Playwright 기반)
 * Usage: node mockup-capture.js <html-file> [output-dir] [--viewport=1920x1080] [--mobile]
 *
 * AI가 생성한 HTML 목업 파일을 Playwright로 열고 스크린샷을 촬영한다.
 * 마커 번호가 HTML 내에 CSS absolute로 이미 배치되어 있으므로
 * overlay 좌표 추정이 필요 없다.
 *
 * 사용 시나리오 (plan-sb Mode A/C):
 *   1. AI가 변경 후 UI를 HTML로 작성 (마커 포함)
 *   2. 이 스크립트로 PC/MO 스크린샷 생성
 *   3. 스크린샷을 input/에 저장
 *   4. JSON의 uiImagePath에 경로 지정
 *   5. generate.js로 최종 PDF 생성
 *
 * 결과: {output-dir}/mockup-pc.png, mockup-mo.png
 */

const fs = require('fs');
const path = require('path');

// 인자 파싱
const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));

const htmlFile = positional[0];
const outputDir = positional[1] || path.join(process.cwd(), 'input');

if (!htmlFile) {
  console.error('Usage: node mockup-capture.js <html-file> [output-dir] [options]');
  console.error('');
  console.error('Options:');
  console.error('  --viewport=WxH   PC 뷰포트 (기본: 1920x1080)');
  console.error('  --mobile         MO 스크린샷도 생성 (375x812)');
  console.error('  --mobile-only    MO만 생성');
  console.error('  --full-page      전체 페이지 캡쳐 (스크롤 포함)');
  console.error('  --name=PREFIX    출력 파일명 프리픽스 (기본: mockup)');
  process.exit(1);
}

const htmlPath = path.resolve(htmlFile);
if (!fs.existsSync(htmlPath)) {
  console.error(`File not found: ${htmlPath}`);
  process.exit(1);
}

// 옵션 파싱
const viewportFlag = flags.find(f => f.startsWith('--viewport='));
const pcViewport = viewportFlag
  ? { width: parseInt(viewportFlag.split('=')[1].split('x')[0]), height: parseInt(viewportFlag.split('=')[1].split('x')[1]) }
  : { width: 1920, height: 1080 };

const mobileViewport = { width: 375, height: 812 };
const doMobile = flags.includes('--mobile') || flags.includes('--mobile-only');
const mobileOnly = flags.includes('--mobile-only');
const fullPage = flags.includes('--full-page');
const nameFlag = flags.find(f => f.startsWith('--name='));
const namePrefix = nameFlag ? nameFlag.split('=')[1] : 'mockup';

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error('[mockup-capture] playwright 패키지를 찾을 수 없습니다.');
    console.error('설치: npm install playwright && npx playwright install chromium');
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  const captured = [];

  // PC 스크린샷
  if (!mobileOnly) {
    const page = await browser.newPage();
    await page.setViewportSize(pcViewport);
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    const pcPath = path.join(outputDir, `${namePrefix}-pc.png`);
    await page.screenshot({ path: pcPath, fullPage });
    captured.push({ type: 'PC', file: `${namePrefix}-pc.png`, viewport: pcViewport });
    console.log(`[OK] PC: ${pcPath} (${pcViewport.width}x${pcViewport.height}${fullPage ? ', full-page' : ''})`);
    await page.close();
  }

  // MO 스크린샷
  if (doMobile) {
    const page = await browser.newPage();
    await page.setViewportSize(mobileViewport);
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    const moPath = path.join(outputDir, `${namePrefix}-mo.png`);
    await page.screenshot({ path: moPath, fullPage });
    captured.push({ type: 'MO', file: `${namePrefix}-mo.png`, viewport: mobileViewport });
    console.log(`[OK] MO: ${moPath} (${mobileViewport.width}x${mobileViewport.height}${fullPage ? ', full-page' : ''})`);
    await page.close();
  }

  await browser.close();

  // 캡쳐 정보 저장
  const infoPath = path.join(outputDir, `${namePrefix}-info.json`);
  fs.writeFileSync(infoPath, JSON.stringify({
    source: path.basename(htmlPath),
    captured: new Date().toISOString().slice(0, 10),
    screenshots: captured,
    note: 'mockup-capture.js로 생성. JSON의 uiImagePath에 파일명을 지정하여 사용.'
  }, null, 2), 'utf-8');

  console.log(`\n=== 목업 캡쳐 완료 (${captured.length}건) ===`);
  console.log('→ JSON의 uiImagePath에 파일명을 지정하세요:');
  for (const c of captured) {
    console.log(`  ${c.type}: "uiImagePath": "input/${c.file}"`);
  }
}

main().catch(err => {
  console.error('[mockup-capture] 오류:', err.message);
  process.exit(1);
});
