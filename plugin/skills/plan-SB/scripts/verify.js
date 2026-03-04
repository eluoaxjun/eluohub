#!/usr/bin/env node
/**
 * 화면설계서 출력물 검증기
 * Usage: node verify.js <output.html> [--output-dir path]
 *
 * HTML 파일을 열어 각 .frame 요소를 개별 스크린샷으로 캡처하여 검증합니다.
 */

const path = require('path');
const fs = require('fs');

async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir' && args[i + 1]) {
      flags.outputDir = args[++i];
    } else if (!args[i].startsWith('--')) {
      positional.push(args[i]);
    }
  }

  const htmlFile = positional[0];
  if (!htmlFile) {
    console.error('Usage: node verify.js <output.html> [--output-dir path]');
    console.error('Example: node verify.js output/KMVNO-5628.html');
    process.exit(1);
  }

  const htmlPath = path.resolve(htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.error(`File not found: ${htmlPath}`);
    process.exit(1);
  }

  const verifyDir = flags.outputDir
    ? path.resolve(flags.outputDir)
    : path.join(path.dirname(htmlPath), 'verify');

  if (!fs.existsSync(verifyDir)) fs.mkdirSync(verifyDir, { recursive: true });

  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    console.error('[ERROR] Playwright not installed.');
    console.error('  Install: npm install playwright');
    process.exit(1);
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 각 .frame 요소를 개별 스크린샷
  const frames = await page.$$('.frame');
  const baseName = path.basename(htmlFile, '.html');

  for (let i = 0; i < frames.length; i++) {
    const filename = path.join(verifyDir, `${baseName}-page${i + 1}.png`);
    await frames[i].screenshot({ path: filename });
    console.log(`[OK] Page ${i + 1}: ${filename}`);
  }

  await browser.close();

  // 검증 결과 요약
  console.log(`\n${'='.repeat(48)}`);
  console.log('[검증 결과]');
  console.log('='.repeat(48));
  console.log(`입력: ${htmlPath}`);
  console.log(`총 프레임: ${frames.length}개`);
  console.log(`스크린샷: ${verifyDir}`);
  console.log('='.repeat(48));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
