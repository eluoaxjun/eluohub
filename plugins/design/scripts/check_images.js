/**
 * 이미지 URL 검증 스크립트
 * 사용법: node scripts/check_images.js <HTML파일경로> [HTML파일경로2] ...
 *
 * HTML 파일에서 모든 이미지 URL을 추출하고 HTTP 요청으로 유효성을 검증한다.
 * 결과를 JSON 형태로 stdout에 출력한다.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('사용법: node scripts/check_images.js <HTML파일경로> [HTML파일경로2] ...');
  console.error('예시: node scripts/check_images.js output/디자인/디자인_까사미아_메인_v1_A.html');
  process.exit(1);
}

/**
 * HTML 문자열에서 모든 이미지 URL을 추출한다.
 * - <img src="...">
 * - <img srcset="...">
 * - <source srcset="...">
 * - background-image: url(...)
 * - background: ... url(...)
 */
function extractImageUrls(html) {
  const urls = new Set();

  // <img src="..."> 또는 <img ... src="...">
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgSrcRegex.exec(html)) !== null) {
    urls.add(match[1]);
  }

  // srcset 속성 (img, source 태그)
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    // srcset은 "url 크기, url 크기" 형태
    const entries = match[1].split(',');
    for (const entry of entries) {
      const url = entry.trim().split(/\s+/)[0];
      if (url) urls.add(url);
    }
  }

  // CSS background-image: url(...) 또는 background: ... url(...)
  const bgRegex = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    const url = match[1].trim();
    // data URI는 제외
    if (!url.startsWith('data:')) {
      urls.add(url);
    }
  }

  return Array.from(urls);
}

/**
 * URL에 HTTP HEAD 요청을 보내 유효성을 검증한다.
 * 타임아웃: 10초
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    // 상대 경로나 프로토콜 없는 URL은 건너뛴다
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      resolve({ url, status: 'skip', reason: '상대경로 또는 로컬 파일', statusCode: null });
      return;
    }

    const client = url.startsWith('https') ? https : http;

    const req = client.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
      // 리다이렉트 따라가기
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        checkUrl(res.headers.location).then(resolve);
        return;
      }

      const contentType = res.headers['content-type'] || '';
      const isImage = contentType.startsWith('image/');

      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({
          url,
          status: 'ok',
          statusCode: res.statusCode,
          contentType,
          isImage
        });
      } else {
        resolve({
          url,
          status: 'broken',
          reason: `HTTP ${res.statusCode}`,
          statusCode: res.statusCode,
          contentType
        });
      }
    });

    req.on('error', (err) => {
      resolve({
        url,
        status: 'broken',
        reason: err.message,
        statusCode: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'broken',
        reason: '타임아웃 (10초)',
        statusCode: null
      });
    });

    req.end();
  });
}

async function processFile(filePath) {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    return { file: filePath, error: '파일을 찾을 수 없음', urls: [] };
  }

  const html = fs.readFileSync(absolutePath, 'utf-8');
  const urls = extractImageUrls(html);

  console.error(`[${path.basename(filePath)}] 이미지 URL ${urls.length}개 발견`);

  const results = [];
  for (const url of urls) {
    const result = await checkUrl(url);
    results.push(result);

    const icon = result.status === 'ok' ? 'O' : result.status === 'skip' ? '-' : 'X';
    console.error(`  [${icon}] ${url.substring(0, 80)}${url.length > 80 ? '...' : ''} ${result.status === 'broken' ? '← ' + result.reason : ''}`);
  }

  const okCount = results.filter(r => r.status === 'ok').length;
  const brokenCount = results.filter(r => r.status === 'broken').length;
  const skipCount = results.filter(r => r.status === 'skip').length;
  const notImageCount = results.filter(r => r.status === 'ok' && !r.isImage).length;

  return {
    file: filePath,
    summary: {
      total: urls.length,
      ok: okCount,
      broken: brokenCount,
      skipped: skipCount,
      notImage: notImageCount
    },
    broken: results.filter(r => r.status === 'broken'),
    notImage: results.filter(r => r.status === 'ok' && !r.isImage),
    all: results
  };
}

(async () => {
  const allResults = [];

  for (const filePath of args) {
    const result = await processFile(filePath);
    allResults.push(result);
  }

  // 최종 결과를 JSON으로 stdout에 출력
  console.log(JSON.stringify(allResults, null, 2));

  // 요약을 stderr에 출력
  console.error('\n=== 전체 요약 ===');
  let totalBroken = 0;
  for (const result of allResults) {
    if (result.error) {
      console.error(`${result.file}: ${result.error}`);
    } else {
      console.error(`${path.basename(result.file)}: 전체 ${result.summary.total}개 | 정상 ${result.summary.ok}개 | 깨짐 ${result.summary.broken}개 | 건너뜀 ${result.summary.skipped}개`);
      totalBroken += result.summary.broken;
    }
  }

  // 깨진 이미지가 있으면 exit code 1
  process.exit(totalBroken > 0 ? 1 : 0);
})();
