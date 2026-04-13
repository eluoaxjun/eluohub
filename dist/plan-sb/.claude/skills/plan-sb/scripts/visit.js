#!/usr/bin/env node
/**
 * 참조 사이트 방문 스크립트
 * Usage: node visit.js <url> [output-dir]
 *
 * - Chromium 미설치 시 자동 설치
 * - 스크린샷 저장 + 페이지 구조(GNB·주요기능·레이아웃) 추출
 * - 결과: {output-dir}/screenshot.png + {output-dir}/structure.json
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const url = process.argv[2];
const outputDir = process.argv[3] || path.join(process.cwd(), 'input');

if (!url) {
  console.error('Usage: node visit.js <url> [output-dir]');
  process.exit(1);
}

async function ensureBrowser(chromium) {
  try {
    const browser = await chromium.launch({ headless: true });
    await browser.close();
  } catch {
    console.log('[visit.js] Chromium 미설치. 자동 설치 중...');
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    console.log('[visit.js] Chromium 설치 완료.');
  }
}

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error('[visit.js] playwright 패키지를 찾을 수 없습니다.');
    process.exit(1);
  }

  await ensureBrowser(chromium);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log(`[visit.js] 방문 중: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // 풀페이지 스크린샷 (기존 호환)
  const screenshotPath = path.join(outputDir, 'screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`[visit.js] 뷰포트 스크린샷: ${screenshotPath}`);

  // 섹션별 스크롤 뷰포트 캡쳐
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = 1080;
  const scrollSteps = Math.ceil(pageHeight / viewportHeight);
  const sectionShots = [];
  for (let i = 0; i < scrollSteps && i < 10; i++) { // 최대 10장
    await page.evaluate((y) => window.scrollTo(0, y), i * viewportHeight);
    await page.waitForTimeout(300);
    const shotPath = path.join(outputDir, `screenshot-section-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    sectionShots.push(shotPath);
  }
  console.log(`[visit.js] 섹션별 캡쳐: ${sectionShots.length}장 (페이지 높이 ${pageHeight}px)`);

  // 페이지 구조 추출 (GNB·섹션·CTA)
  const structure = await page.evaluate(() => {
    const gnbEl = document.querySelector('nav, header, [role="navigation"]');
    const gnbLinks = gnbEl
      ? [...gnbEl.querySelectorAll('a')].map(a => a.innerText.trim()).filter(Boolean).slice(0, 10)
      : [];

    const headings = [...document.querySelectorAll('h1, h2, h3')]
      .map(h => ({ tag: h.tagName, text: h.innerText.trim() }))
      .filter(h => h.text)
      .slice(0, 20);

    const ctas = [...document.querySelectorAll('a[class*="btn"], button, a[class*="cta"]')]
      .map(el => el.innerText.trim())
      .filter(Boolean)
      .slice(0, 10);

    const sectionCount = document.querySelectorAll('section, [class*="section"], [class*="block"]').length;

    // persistent header 구조 추출 (plan-sb wireframe용)
    const headerEl = document.querySelector('header') || document.querySelector('[role="banner"]');
    const persistentHeader = headerEl ? {
      logo: (() => {
        const logoEl = headerEl.querySelector('img[class*="logo"], img[alt*="logo"], a[class*="logo"] img, h1 img');
        return logoEl ? (logoEl.alt || logoEl.src.split('/').pop()) : '';
      })(),
      gnbItems: gnbLinks,
      utils: [...(headerEl.querySelectorAll('[class*="util"] a, [class*="menu"] button, [class*="search"], [class*="login"]') || [])]
        .map(el => el.innerText.trim() || el.getAttribute('aria-label') || '').filter(Boolean).slice(0, 5)
    } : null;

    return { title: document.title, url: location.href, gnb: gnbLinks, headings, ctas, sectionCount, persistentHeader };
  });

  const structurePath = path.join(outputDir, 'structure.json');
  fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2), 'utf8');
  console.log(`[visit.js] 구조 저장: ${structurePath}`);

  await browser.close();

  console.log('\n=== 사이트 분석 결과 ===');
  console.log(`타이틀: ${structure.title}`);
  console.log(`GNB: ${structure.gnb.join(' / ')}`);
  console.log(`주요 헤딩: ${structure.headings.slice(0, 5).map(h => h.text).join(' | ')}`);
  console.log(`섹션 수: ${structure.sectionCount}`);
  if (structure.persistentHeader) {
    console.log(`Header 로고: ${structure.persistentHeader.logo || '(없음)'}`);
    console.log(`Header 유틸: ${structure.persistentHeader.utils.join(' / ') || '(없음)'}`);
  }
  console.log(`스크린샷: ${screenshotPath}`);
  console.log(`구조 JSON: ${structurePath}`);
}

main().catch(err => {
  console.error('[visit.js] 오류:', err.message);
  process.exit(1);
});
