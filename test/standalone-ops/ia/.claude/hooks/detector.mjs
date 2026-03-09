const STRONG = /정보\s*구조|사이트\s*맵|IA|페이지\s*구조|메뉴\s*구조|네비게이션\s*설계|사이트\s*구조/i;
const WEAK   = /사이트\s*구조\s*잡|메뉴\s*어떻게|페이지\s*구성|URL\s*어떻게|메뉴\s*체계/i;
const SKILL_NAME = 'plan-ia';

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
