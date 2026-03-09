const STRONG = /요구\s*사항|REQ|스펙\s*(정리|문서)|뭘\s*만들어야|기능\s*요구\s*사항|필요한\s*기능\s*정리/i;
const WEAK   = /필요한\s*기능|스펙\s*뭐야|요구사항\s*분석|어떻게\s*만들어야|뭐가\s*필요한지/i;
const SKILL_NAME = 'plan-req';

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
