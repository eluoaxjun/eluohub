import { readFileSync } from 'fs';

const PATTERN = /기능\s*정의|기능정의서|FN|기능\s*명세|기능\s*설계|기능\s*상세|기능\s*분해|기능\s*목록|기능\s*스펙/i;
const SKILL_NAME = 'plan-fn';

let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = data.prompt || '';
    if (PATTERN.test(prompt)) {
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
