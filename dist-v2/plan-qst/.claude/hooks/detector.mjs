// STRONG: 공식 키워드 (즉시 감지)
const STRONG = /고객\s*질의서|질의서|QST|고객에게\s*(물어|확인)|클라이언트\s*질문|인터뷰\s*질문|확인\s*사항\s*정리/i;
// WEAK: 자연어 변형 (의도 포착)
const WEAK   = /고객한테\s*뭘|확인할\s*것|인터뷰\s*준비|고객\s*문의\s*정리|클라이언트\s*확인|고객\s*질문\s*목록|뭘\s*물어봐야/i;

const SKILL_NAME = 'plan-qst';

let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = data.prompt || '';
    if (STRONG.test(prompt) || WEAK.test(prompt)) {
      console.log(JSON.stringify({
        continue: true,
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: `[ELUO HUB: ${SKILL_NAME} 감지]\n\nCLAUDE.md의 실행 절차(Step 0~4)에 따라 plan-qst 스킬을 실행하십시오.\n\n사용자 요청:\n${prompt}`
        }
      }));
    } else {
      console.log(JSON.stringify({ continue: true }));
    }
  } catch {
    console.log(JSON.stringify({ continue: true }));
  }
});
