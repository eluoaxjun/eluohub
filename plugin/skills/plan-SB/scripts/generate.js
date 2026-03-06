#!/usr/bin/env node
/**
 * 화면설계서 자동 생성기 v2
 * Usage: node generate-screen-design.js [data-file.json]
 *
 * JSON 데이터 → 스키마 정규화 → 테마 로드 → HTML 렌더링 → PDF 내보내기
 */

const fs = require('fs');
const path = require('path');
const { normalizeSchema } = require('./lib/schema');
const { loadTheme } = require('./lib/theme');
const { generateHTML } = require('./template');

async function main() {
  const dataFile = process.argv[2];
  if (!dataFile) {
    console.error('Usage: node generate-screen-design.js <data-file.json>');
    console.error('Example: node generate-screen-design.js data/KMVNO-5628.json');
    process.exit(1);
  }

  const dataPath = path.resolve(dataFile);
  if (!fs.existsSync(dataPath)) {
    console.error(`File not found: ${dataPath}`);
    process.exit(1);
  }

  // 0. config.json 디폴트 로드 → JSON 병합 → 스키마 정규화 → 테마 로드
  const configPath = path.join(__dirname, 'config.json');
  let config = { defaults: {} };
  if (fs.existsSync(configPath)) {
    try { config = JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch {}
  }
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const data = normalizeSchema(raw, config.defaults);
  const theme = loadTheme(data);

  const outputPrefix = data.project.outputPrefix || data.project.id || 'output';
  console.log(`[SCHEMA] ${raw.$schema ? 'v2' : 'v1'} → normalized (preset: ${theme.preset || 'default'})`);

  // 1. input/ 폴더 이미지 우선 체크
  const inputDir = path.join(process.cwd(), 'input');
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

  // 2. HTML 생성
  const html = generateHTML(data, theme);
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const htmlPath = path.join(outputDir, `${outputPrefix}.html`);
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`[OK] HTML: ${htmlPath}`);

  // 3. PDF 생성 (Playwright)
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    console.log('[INFO] Playwright not found. 자동 설치 중...');
    const { execSync } = require('child_process');
    const installDir = path.join(__dirname, '..');
    execSync('npm install playwright --no-save', { stdio: 'inherit', cwd: installDir });
    execSync('npx playwright install chromium', { stdio: 'inherit', cwd: installDir });
    playwright = require('playwright');
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // 프레임별 실제 높이 측정 → 최대 높이로 PDF 페이지 사이즈 결정
  const frameHeights = await page.evaluate(() => {
    const frames = document.querySelectorAll('.frame');
    return Array.from(frames).map(f => f.scrollHeight);
  });
  const maxFrameHeight = Math.max(theme.frame.minHeight, ...frameHeights);
  const pdfHeight = maxFrameHeight + 20; // 여유 마진
  console.log(`[PDF] 프레임 ${frameHeights.length}개, 최대 높이: ${maxFrameHeight}px → 페이지: ${pdfHeight}px`);

  const pdfPath = path.join(outputDir, `${outputPrefix}.pdf`);
  await page.pdf({
    path: pdfPath,
    width: `${theme.frame.width}px`,
    height: `${pdfHeight}px`,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  console.log(`[OK] PDF: ${pdfPath}`);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
