#!/usr/bin/env node
/**
 * 기획 산출물 MD → HTML → PDF 렌더러
 * Usage: node render.js <input.md>
 * Output: <input>.html + <input>.pdf (MD와 동일 디렉토리)
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const mdFile = process.argv[2];
  if (!mdFile) {
    console.error('Usage: node render.js <input.md>');
    process.exit(1);
  }

  const mdPath = path.resolve(mdFile);
  if (!fs.existsSync(mdPath)) {
    console.error(`File not found: ${mdPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(mdPath, 'utf-8');

  // 1. Frontmatter 파싱
  const meta = parseFrontmatter(content);
  const mdBody = removeFrontmatter(content);

  // 2. marked 로드 (auto-install)
  let markedLib;
  try {
    markedLib = require('marked');
  } catch {
    console.log('[INFO] marked not found. 자동 설치 중...');
    const { execSync } = require('child_process');
    execSync('npm install marked --no-save', { stdio: 'inherit', cwd: __dirname });
    markedLib = require('marked');
  }
  const markedFn = markedLib.marked || markedLib;

  // 3. MD → HTML body 변환
  const htmlBody = markedFn(mdBody);

  // 4. TOC 생성 (H2 기준)
  const toc = buildToc(mdBody);

  // 5. 메타데이터 추출
  const title = meta.title || path.basename(mdPath, '.md');
  const version = meta.version || '';
  const date = meta.date || new Date().toISOString().slice(0, 10);
  const author = meta.author || meta.writer || '';

  // 6. A4 HTML 템플릿 적용
  const html = buildHtml({ title, version, date, author, toc, body: htmlBody });

  // 7. HTML 저장
  const basePath = mdPath.replace(/\.md$/, '');
  const htmlPath = basePath + '.html';
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`[OK] HTML: ${htmlPath}`);

  // 8. PDF 생성 (Playwright, A4)
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    console.log('[INFO] Playwright not found. 자동 설치 중...');
    const { execSync } = require('child_process');
    execSync('npm install playwright --no-save', { stdio: 'inherit', cwd: __dirname });
    execSync('npx playwright install chromium', { stdio: 'inherit', cwd: __dirname });
    playwright = require('playwright');
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  const pdfPath = basePath + '.pdf';
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  });

  console.log(`[OK] PDF: ${pdfPath}`);
  await browser.close();
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    if (key) meta[key] = val;
  }
  return meta;
}

function removeFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function buildToc(mdBody) {
  const h2regex = /^## (.+)$/gm;
  const items = [];
  let match;
  while ((match = h2regex.exec(mdBody)) !== null) {
    const text = match[1];
    const id = text.toLowerCase().replace(/[^\w가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    items.push(`<li><a href="#${id}">${text}</a></li>`);
  }
  if (!items.length) return '';
  return `<nav class="toc"><h2 class="toc-title">목차</h2><ul>${items.join('')}</ul></nav>`;
}

function buildHtml({ title, version, date, author, toc, body }) {
  const bodyWithBreaks = body.replace(/<h2>(.+?)<\/h2>/g, (_, text) => {
    const id = text.toLowerCase().replace(/[^\w가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `<h2 id="${id}" class="page-break">${text}</h2>`;
  });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif; font-size: 11pt; color: #1a1a2e; line-height: 1.7; }
  .doc-header { background: #1a1a2e; color: #fff; padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; }
  .doc-header .logo { font-size: 16pt; font-weight: 700; letter-spacing: 0.05em; }
  .doc-header .meta { text-align: right; font-size: 9pt; opacity: 0.8; line-height: 1.6; }
  .doc-title-bar { background: #f0f4ff; border-left: 4px solid #4a6cf7; padding: 16px 40px; }
  .doc-title-bar h1 { font-size: 18pt; color: #1a1a2e; }
  .doc-title-bar .subtitle { font-size: 9pt; color: #666; margin-top: 4px; }
  .toc { margin: 32px 40px; padding: 24px; background: #f9fafb; border-radius: 6px; }
  .toc-title { font-size: 12pt; margin-bottom: 12px; color: #1a1a2e; }
  .toc ul { list-style: none; padding-left: 0; }
  .toc li { padding: 4px 0; }
  .toc a { color: #4a6cf7; text-decoration: none; font-size: 10pt; }
  .content { padding: 0 40px 60px; }
  h1 { font-size: 20pt; margin: 32px 0 16px; color: #1a1a2e; }
  h2.page-break { font-size: 15pt; margin: 0 0 16px; padding: 12px 16px; background: #f0f4ff; border-left: 4px solid #4a6cf7; color: #1a1a2e; page-break-before: always; }
  h2.page-break:first-of-type { page-break-before: avoid; }
  h3 { font-size: 12pt; margin: 20px 0 10px; color: #2d3a6e; }
  h4 { font-size: 11pt; margin: 16px 0 8px; color: #3a4a7e; }
  p { margin: 8px 0; }
  ul, ol { padding-left: 24px; margin: 8px 0; }
  li { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }
  th { background: #1a1a2e; color: #fff; padding: 8px 12px; text-align: left; font-weight: 600; }
  td { border: 1px solid #dde3f0; padding: 7px 12px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  code { background: #f0f4ff; border-radius: 3px; padding: 1px 5px; font-family: 'D2Coding', 'Consolas', monospace; font-size: 9pt; }
  pre { background: #1a1a2e; color: #e8eaf6; border-radius: 6px; padding: 16px; margin: 12px 0; overflow-x: auto; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #4a6cf7; padding: 8px 16px; margin: 12px 0; color: #666; background: #f9fafb; }
  hr { border: none; border-top: 1px solid #dde3f0; margin: 24px 0; }
  .doc-footer { background: #f0f4ff; border-top: 1px solid #dde3f0; padding: 8px 40px; display: flex; justify-content: space-between; font-size: 8pt; color: #888; margin-top: 32px; }
  @media print {
    h2.page-break { page-break-before: always; }
    h2.page-break:first-of-type { page-break-before: avoid; }
  }
</style>
</head>
<body>
<header class="doc-header">
  <div class="logo">ELUO</div>
  <div class="meta">${author ? `작성자: ${author}<br>` : ''}작성일: ${date}${version ? `<br>버전: ${version}` : ''}</div>
</header>
<div class="doc-title-bar">
  <h1>${title}</h1>
  <div class="subtitle">${version ? `v${version} &nbsp;|&nbsp; ` : ''}${date}</div>
</div>
${toc}
<div class="content">
${bodyWithBreaks}
</div>
<footer class="doc-footer">
  <span>${title}</span>
  <span>${date}</span>
</footer>
</body>
</html>`;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
