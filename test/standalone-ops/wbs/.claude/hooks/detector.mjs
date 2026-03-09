const STRONG = /WBS|작업\s*분해|일정\s*(산정|계획)|스케줄|마일스톤|작업\s*목록|공수\s*산정/i;
const WEAK   = /일정\s*어떻게|얼마나\s*걸려|작업\s*나눠줘|공수\s*어떻게|언제\s*끝나/i;
const SKILL_NAME = 'plan-wbs';

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
