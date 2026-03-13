#!/usr/bin/env node
/**
 * 화면설계서 출력물 검증기 v2
 * Usage: node verify.js <output.html> [--output-dir path] [--context-dir path] [--data-file path]
 *
 * 검증 항목:
 * - [사전] wireframe[] type 유효성: element-types.js 등록 타입 외 사용 → WARN
 * - viewport: 1280×720 고정 확인
 * - overflow: .slide 내 scrollHeight > 720px → WARN
 * - 콘텐츠 밀도: 콘텐츠 영역 < 30% → WARN
 * - MSG Case 인라인: design 슬라이드 내 .msg-case 존재 → ERROR
 * - Description overflow: .description-panel scrollHeight > 실제 높이 → WARN
 * - fnRef 누락: 연계 모드(context/fn.md 존재)인데 fnRef 빈 슬라이드 → WARN
 */

const path = require('path');
const fs = require('fs');
const { ELEMENT_TYPES } = require('./lib/element-types');

const VALID_TYPES = new Set(ELEMENT_TYPES.map(e => e.type));

/**
 * wireframe[] JSON에서 미등록 타입 사전 검증 (HTML 렌더링 전)
 * @param {Array} screens - data.json의 screens 배열
 * @returns {string[]} 경고 메시지 배열
 */
function checkWireframeTypes(screens) {
  const warnings = [];
  screens.forEach((screen, si) => {
    if (!screen.wireframe) return;
    const check = (els, prefix) => {
      els.forEach(el => {
        if (!VALID_TYPES.has(el.type)) {
          warnings.push(`[WARN-PRE] Screen ${si + 1} (${screen.interfaceName || ''}) ${prefix}미등록 type: "${el.type}"`);
        }
        if (el.children) check(el.children, 'children > ');
      });
    };
    check(screen.wireframe, '');
  });
  return warnings;
}

async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir' && args[i + 1]) {
      flags.outputDir = args[++i];
    } else if (args[i] === '--context-dir' && args[i + 1]) {
      flags.contextDir = args[++i];
    } else if (args[i] === '--data-file' && args[i + 1]) {
      flags.dataFile = args[++i];
    } else if (!args[i].startsWith('--')) {
      positional.push(args[i]);
    }
  }

  const htmlFile = positional[0];
  if (!htmlFile) {
    console.error('Usage: node verify.js <output.html> [--output-dir path] [--context-dir path]');
    console.error('Example: node verify.js output/PROJECT/20240101/SB_P001_v1.html');
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

  // 연계 모드 판별: context/fn.md 존재 여부
  let isLinkedMode = false;
  if (flags.contextDir) {
    isLinkedMode = fs.existsSync(path.join(path.resolve(flags.contextDir), 'fn.md'));
  } else {
    // htmlFile 기준 상위 경로에서 context/fn.md 탐색 (output/{project}/{date}/... → output/{project}/context/fn.md)
    const dateDir = path.dirname(htmlPath);
    const projectDir = path.dirname(dateDir);
    const contextFn = path.join(projectDir, 'context', 'fn.md');
    isLinkedMode = fs.existsSync(contextFn);
  }

  // ─── [사전 검증] wireframe[] 타입 유효성 ────────────────────────────────
  const preWarns = [];
  if (flags.dataFile) {
    const dataPath = path.resolve(flags.dataFile);
    if (fs.existsSync(dataPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        if (data.screens) {
          const typeWarns = checkWireframeTypes(data.screens);
          preWarns.push(...typeWarns);
        }
      } catch (e) {
        preWarns.push(`[WARN-PRE] data-file 파싱 실패: ${e.message}`);
      }
    } else {
      preWarns.push(`[WARN-PRE] data-file 없음: ${dataPath}`);
    }
  }

  console.log(`[INFO] 검증 대상: ${htmlPath}`);
  console.log(`[INFO] 연계 모드: ${isLinkedMode ? 'YES (context/fn.md 존재)' : 'NO (독립 모드)'}`);
  console.log(`[INFO] 스크린샷 저장: ${verifyDir}`);
  if (flags.dataFile) {
    console.log(`[INFO] 사전 검증 (wireframe 타입): ${preWarns.length === 0 ? 'PASS' : `${preWarns.length}건 WARN`}`);
  }
  console.log('');

  // Playwright 자동 설치
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

  // 1280×720 뷰포트로 실행 (v2 고정 규격)
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const baseName = path.basename(htmlFile, '.html');

  // ─── 검증 수행 (브라우저 내 평가) ───────────────────────────────────────

  const verifyResults = await page.evaluate((linkedMode) => {
    const SLIDE_HEIGHT = 720;
    const results = {
      slideCount: 0,
      errors: [],
      warns: [],
      infos: []
    };

    const slides = document.querySelectorAll('.slide');
    results.slideCount = slides.length;

    if (slides.length === 0) {
      results.errors.push('[ERROR] .slide 요소를 찾을 수 없음 — v2 template.js 출력이 맞는지 확인');
      return results;
    }

    slides.forEach((slide, idx) => {
      const slideNum = idx + 1;
      const slideId = slide.dataset.slideId || `slide-${slideNum}`;
      const slideType = slide.dataset.slideType || 'unknown';

      // ① overflow 감지: .slide-body 또는 .slide 전체 scrollHeight
      const body = slide.querySelector('.slide-body');
      const checkEl = body || slide;
      const scrollH = checkEl.scrollHeight;
      const clientH = checkEl.clientHeight;
      if (scrollH > clientH + 2) {
        results.warns.push(
          `[WARN] 슬라이드 ${slideNum} (${slideId}) overflow: scrollHeight=${scrollH}px > clientHeight=${clientH}px (+${scrollH - clientH}px)`
        );
      }

      // ② 콘텐츠 밀도: 슬라이드 전체 면적 대비 콘텐츠 요소 면적
      const contentEls = slide.querySelectorAll('p, li, td, th, .desc-row, .wireframe-area img, .wireframe-placeholder');
      let contentArea = 0;
      contentEls.forEach(el => {
        const r = el.getBoundingClientRect();
        contentArea += r.width * r.height;
      });
      const slideArea = 1280 * SLIDE_HEIGHT;
      const density = contentArea / slideArea;
      if (density < 0.30 && !['cover', 'end', 'divider', 'overview', 'history'].includes(slideType)) {
        results.warns.push(
          `[WARN] 슬라이드 ${slideNum} (${slideId}) 콘텐츠 밀도 부족: ${(density * 100).toFixed(1)}% < 30% (공백 과다)`
        );
      }

      // ③ MSG Case 인라인 혼재: design 슬라이드 내 .msg-case 존재 → ERROR
      if (slideType === 'design') {
        const inlineMsgCase = slide.querySelector('.msg-case');
        if (inlineMsgCase) {
          results.errors.push(
            `[ERROR] 슬라이드 ${slideNum} (${slideId}) design 슬라이드 내 .msg-case 인라인 혼재 — 별도 슬라이드로 분리 필요`
          );
        }
      }

      // ④ Description 패널 overflow
      const descPanel = slide.querySelector('.description-panel');
      if (descPanel) {
        const dpScroll = descPanel.scrollHeight;
        const dpClient = descPanel.clientHeight;
        if (dpScroll > dpClient + 2) {
          results.warns.push(
            `[WARN] 슬라이드 ${slideNum} (${slideId}) description-panel overflow: scrollHeight=${dpScroll}px > clientHeight=${dpClient}px`
          );
        }
      }

      // ⑤ fnRef 참조 누락: 연계 모드인데 description이 있는 design 슬라이드에 fnRef 없음
      if (linkedMode && slideType === 'design') {
        const descRows = slide.querySelectorAll('.desc-row');
        const fnRefSection = slide.querySelector('.fn-ref-section');
        if (descRows.length > 0 && !fnRefSection) {
          results.warns.push(
            `[WARN] 슬라이드 ${slideNum} (${slideId}) 연계 모드인데 fnRef 섹션 없음 — description fnRef 필드 확인 필요`
          );
        }
      }
    });

    return results;
  }, isLinkedMode);

  // ─── 스크린샷 캡처 ───────────────────────────────────────────────────────

  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    const filename = path.join(verifyDir, `${baseName}-slide${String(i + 1).padStart(3, '0')}.png`);
    await slides[i].screenshot({ path: filename });
    console.log(`[SHOT] Slide ${i + 1}: ${path.basename(filename)}`);
  }

  await browser.close();

  // ─── 결과 출력 ───────────────────────────────────────────────────────────

  const hasError = verifyResults.errors.length > 0;

  console.log('');
  console.log('='.repeat(60));
  console.log('[검증 결과] plan-sb v2 — 1280×720 landscape');
  console.log('='.repeat(60));
  console.log(`입력: ${htmlPath}`);
  console.log(`총 슬라이드: ${verifyResults.slideCount}개`);
  console.log(`스크린샷: ${verifyDir}`);
  console.log('');

  if (preWarns.length === 0 && verifyResults.errors.length === 0 && verifyResults.warns.length === 0) {
    console.log('[PASS] 모든 검증 항목 통과');
  }

  preWarns.forEach(w => console.log(w));
  verifyResults.errors.forEach(e => console.log(e));
  verifyResults.warns.forEach(w => console.log(w));

  console.log('');
  console.log(`PRE-WARN: ${preWarns.length}건 / ERROR: ${verifyResults.errors.length}건 / WARN: ${verifyResults.warns.length}건`);
  console.log('='.repeat(60));

  // ERROR 1건 이상이면 비정상 종료
  if (hasError) {
    process.exit(2);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
