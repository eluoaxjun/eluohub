const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 사용법: node download_gdweb.js [이름:번호] [이름:번호] ...
// 예시: node download_gdweb.js 강진군문화관광재단:25856 일상과여행사이:18486
const outputDir = path.resolve(__dirname, '..', 'output', '리서치');
fs.mkdirSync(outputDir, { recursive: true });
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('사용법: node download_gdweb.js [이름:str_no] [이름:str_no] ...');
  console.error('예시: node download_gdweb.js 강진군문화관광재단:25856 일상과여행사이:18486');
  process.exit(1);
}

const targets = args.map(arg => {
  const [name, strNo] = arg.split(':');
  return { name, strNo: parseInt(strNo) };
});

(async () => {
  // Chrome 경로 자동 탐지 (Puppeteer 번들 Chrome이 없을 때 시스템 Chrome 사용)
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  const chromePath = chromePaths.find(p => fs.existsSync(p));

  const launchOptions = { headless: true };
  if (chromePath) launchOptions.executablePath = chromePath;

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // 브라우저 다운로드 경로를 output 폴더로 강제 지정 (안전장치)
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: outputDir
  });

  // GDWEB 메인 접속하여 쿠키/세션 확보 (view.asp 접속 안 함 — 자동 다운로드 방지)
  await page.goto('https://www.gdweb.co.kr', {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  for (const target of targets) {
    try {
      const imageBuffer = await page.evaluate(async (strNo) => {
        const response = await fetch(`https://www.gdweb.co.kr/sub/filedata.asp?str_no=${strNo}&sgbn=1`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
      }, target.strNo);

      if (imageBuffer.length < 1000) {
        console.error(`건너뜀 [${target.name}]: 응답 데이터가 너무 작음 (${imageBuffer.length}B) — 유효한 이미지가 아닐 수 있음`);
        continue;
      }

      const fileName = `벤치마킹_${target.name}.jpg`;
      fs.writeFileSync(path.join(outputDir, fileName), Buffer.from(imageBuffer));
      console.log(`저장 완료: ${fileName} (${(imageBuffer.length / 1024 / 1024).toFixed(1)}MB)`);
    } catch (err) {
      console.error(`다운로드 실패 [${target.name}]: ${err.message}`);
    }
  }

  await browser.close();
  console.log('전체 다운로드 완료');
})();
