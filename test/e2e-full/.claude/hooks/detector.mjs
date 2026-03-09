// ─────────────────────────────────────────────────────────────
// 전체 파이프라인 통합 detector.mjs
// 감지 순서: QST → REQ → FN → IA → WBS → SB
// STRONG(공식 키워드) + WEAK(자연어 변형) 이중 패턴
// ─────────────────────────────────────────────────────────────

const SKILLS = [
  {
    name: 'plan-qst',
    STRONG: /고객\s*질의서|질의서|QST|고객에게\s*(물어|확인)|클라이언트\s*질문|인터뷰\s*질문|확인\s*사항\s*정리/i,
    WEAK:   /고객한테\s*뭘|확인할\s*것|인터뷰\s*준비|고객\s*문의\s*정리|클라이언트\s*확인|고객\s*질문\s*목록|뭘\s*물어봐야/i
  },
  {
    name: 'plan-req',
    STRONG: /요구\s*사항|REQ|스펙\s*(정리|문서)|뭘\s*만들어야|기능\s*요구\s*사항|필요한\s*기능\s*정리/i,
    WEAK:   /필요한\s*기능|스펙\s*뭐야|요구사항\s*분석|어떻게\s*만들어야|뭐가\s*필요한지/i
  },
  {
    name: 'plan-fn',
    STRONG: /기능\s*정의|기능정의서|FN|기능\s*명세|기능\s*설계|기능\s*상세|기능\s*분해|기능\s*목록|기능\s*스펙/i,
    WEAK:   /기능을\s*어떻게|기능\s*뭐가\s*필요|어떤\s*기능|기능별\s*상세/i
  },
  {
    name: 'plan-ia',
    STRONG: /정보\s*구조|사이트\s*맵|IA|페이지\s*구조|메뉴\s*구조|네비게이션\s*설계|사이트\s*구조/i,
    WEAK:   /사이트\s*구조\s*잡|메뉴\s*어떻게|페이지\s*구성|URL\s*어떻게|메뉴\s*체계/i
  },
  {
    name: 'plan-wbs',
    STRONG: /WBS|작업\s*분해|일정\s*(산정|계획)|스케줄|마일스톤|작업\s*목록|공수\s*산정/i,
    WEAK:   /일정\s*어떻게|얼마나\s*걸려|작업\s*나눠줘|공수\s*어떻게|언제\s*끝나/i
  },
  {
    name: 'plan-sb',
    STRONG: /화면\s*설계|화면설계서|SB|와이어\s*프레임|화면\s*명세|스토리\s*보드/i,
    WEAK:   /화면\s*(그려|만들어|기획|설계)|페이지\s*(기획|설계|명세|만들어)|UI\s*(설계|기획)|로그인\s*화면|회원가입\s*화면|화면\s*구성/i
  }
];

let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = data.prompt || '';

    for (const skill of SKILLS) {
      if (skill.STRONG.test(prompt) || skill.WEAK.test(prompt)) {
        console.log(JSON.stringify({
          continue: true,
          hookSpecificOutput: {
            hookEventName: 'UserPromptSubmit',
            additionalContext: `[ELUO HUB: ${skill.name} 감지]\n\nCLAUDE.md의 실행 절차(Step 0~4)에 따라 ${skill.name} 스킬을 실행하십시오.\n\n사용자 요청:\n${prompt}`
          }
        }));
        return;
      }
    }

    console.log(JSON.stringify({ continue: true }));
  } catch {
    console.log(JSON.stringify({ continue: true }));
  }
});
