import { readFileSync } from 'fs';

const PATTERN = /고객\s*질의서|질의서|QST|고객에게\s*(물어|확인)|클라이언트\s*질문|인터뷰\s*질문|확인\s*사항\s*정리/i;
const SKILL_NAME = 'plan-qst';

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
