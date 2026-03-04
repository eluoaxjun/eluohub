#!/usr/bin/env node
/**
 * 화면설계서 자동 생성기
 * Usage: node generate.js [data-file.json] [--output-dir path]
 *
 * JSON 데이터 → HTML 렌더링 → PDF 내보내기
 */

const fs = require('fs');
const path = require('path');
const { generateHTML } = require('./template');

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

  const dataFile = positional[0];
  if (!dataFile) {
    console.error('Usage: node generate.js <data-file.json> [--output-dir path]');
    console.error('Example: node generate.js data/KMVNO-5628.json');
    process.exit(1);
  }

  const dataPath = path.resolve(dataFile);
  if (!fs.existsSync(dataPath)) {
    console.error(`File not found: ${dataPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const jiraNo = data.project.jiraNo;

  // output 디렉토리: --output-dir 또는 데이터 파일 기준 ../output/
  const outputDir = flags.outputDir
    ? path.resolve(flags.outputDir)
    : path.join(path.dirname(dataPath), '..', 'output');

  // input/ 폴더 이미지 우선 체크
  const inputDir = path.join(path.dirname(dataPath), '..', 'input');
  if (data.screens) {
    for (const screen of data.screens) {
      if (!screen.uiImagePath) continue;
      const filename = path.basename(screen.uiImagePath);
      const inputPath = path.join(inputDir, filename);
      if (fs.existsSync(inputPath)) {
        screen.uiImagePath = `../input/${filename}`;
        console.log(`[INPUT] ${filename} → input/ 폴더 사용`);
      } else {
        console.log(`[CAPTURE] ${filename} → 기존 경로 유지`);
      }
    }
  }

  // 1. HTML 생성
  const html = generateHTML(data);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const htmlPath = path.join(outputDir, `${jiraNo}.html`);
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`[OK] HTML: ${htmlPath}`);

  // 2. PDF 생성 (Playwright)
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    console.log('[SKIP] Playwright not installed. HTML only.');
    console.log('  Install: npm install playwright');
    return;
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  const pdfPath = path.join(outputDir, `${jiraNo}.pdf`);
  await page.pdf({
    path: pdfPath,
    width: '1200px',
    height: '800px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  console.log(`[OK] PDF: ${pdfPath}`);
  await browser.close();

  // 결과 요약
  const frameCount = (html.match(/class="frame"/g) || []).length;
  console.log(`\n${'='.repeat(48)}`);
  console.log('[화면설계서 생성 결과]');
  console.log('='.repeat(48));
  console.log(`과제번호: ${jiraNo}`);
  console.log(`SR번호: ${data.project.srNo}`);
  console.log(`과제명: ${data.project.title}`);
  console.log('-'.repeat(48));
  console.log(`총 프레임: ${frameCount}개`);
  console.log('-'.repeat(48));
  console.log(`HTML: ${htmlPath}`);
  console.log(`PDF: ${pdfPath}`);
  console.log('='.repeat(48));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
