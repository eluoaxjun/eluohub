const STRONG = /화면\s*설계|화면설계서|SB|와이어\s*프레임|화면\s*명세|스토리\s*보드/i;
const WEAK   = /화면\s*(그려|만들어|기획|설계)|페이지\s*(기획|설계|명세|만들어)|UI\s*(설계|기획)|로그인\s*화면|회원가입\s*화면|화면\s*구성/i;
const SKILL_NAME = 'plan-sb';

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
          additionalContext: `[ELUO HUB: ${SKILL_NAME} 감지]\n\nplanning-orchestrator 에이전트를 호출하여 진행하십시오.\n\n사용자 요청:\n${prompt}`
        }
      }));
    } else {
      console.log(JSON.stringify({ continue: true }));
    }
  } catch {
    console.log(JSON.stringify({ continue: true }));
  }
});
