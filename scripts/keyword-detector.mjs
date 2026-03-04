#!/usr/bin/env node

/**
 * Eluo Hub Keyword Detector Hook
 * 사용자 입력에서 기획 관련 키워드를 감지하여 적절한 스킬로 라우팅
 * Cross-platform: Windows, macOS, Linux
 *
 * 라우팅 우선순위:
 * 1. plan (전체 파이프라인) — "기획해줘", "기획 전체", "기획 진행"
 * 2. plan-qst (고객질의서) — "질의서", "QST", "고객에게 물어볼"
 * 3. plan-req (요구사항) — "요구사항", "REQ", "스펙 정리"
 * 4. plan-fn (기능정의) — "기능정의", "FN", "기능 명세"
 * 5. plan-ia (정보구조) — "정보구조", "IA", "사이트맵"
 * 6. plan-wbs (작업분해) — "WBS", "일정", "작업분해"
 * 7. plan-SB (화면설계) — "화면설계", "SB", "와이어프레임"
 * 8. plan-dashboard (대시보드) — "대시보드", "현황", "Dashboard"
 * 9. pm-router (프로젝트 라우터) — "수정해줘", "만들어줘", "운영", "구축"
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { readStdin } from './lib/stdin.mjs';

// ── 입력 파싱 ──

function extractPrompt(input) {
  try {
    const data = JSON.parse(input);
    if (data.prompt) return data.prompt;
    if (data.message?.content) return data.message.content;
    if (Array.isArray(data.parts)) {
      return data.parts.filter(p => p.type === 'text').map(p => p.text).join(' ');
    }
    return '';
  } catch {
    const match = input.match(/"(?:prompt|content|text)"\s*:\s*"([^"]+)"/);
    return match ? match[1] : '';
  }
}

function sanitize(text) {
  return text
    .replace(/<(\w[\w-]*)[\s>][\s\S]*?<\/\1>/g, '')
    .replace(/<\w[\w-]*(?:\s[^>]*)?\s*\/>/g, '')
    .replace(/https?:\/\/[^\s)>\]]+/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '');
}

// ── 파이프라인 상태 감지 ──

function detectPipelineState(cwd) {
  const outputDir = join(cwd, 'output', 'planning');
  const state = { qst: false, req: false, fn: false, ia: false, wbs: false };

  if (!existsSync(outputDir)) return state;

  try {
    const files = readFileSync ? require('fs').readdirSync(outputDir) : [];
    for (const f of files) {
      const lower = f.toLowerCase();
      if (lower.includes('qst')) state.qst = true;
      if (lower.includes('req')) state.req = true;
      if (lower.includes('fn') && !lower.includes('config')) state.fn = true;
      if (lower.includes('ia')) state.ia = true;
      if (lower.includes('wbs')) state.wbs = true;
    }
  } catch { /* silent */ }

  return state;
}

// ── 키워드 매칭 ──

const SKILL_KEYWORDS = [
  {
    name: 'plan',
    priority: 1,
    patterns: [
      /기획\s*(해줘|해주세요|진행|전체|시작|해봐)/,
      /기획\s*산출물/,
      /전체\s*파이프라인/,
      /planning\s*(pipeline|전체|start)/i,
    ]
  },
  {
    name: 'plan-qst',
    priority: 2,
    patterns: [
      /고객\s*질의서/,
      /\bQST\b/i,
      /질의서\s*(만들|생성|작성)/,
      /고객에게\s*(물어|확인|질문)/,
      /클라이언트\s*질문/,
      /인터뷰\s*질문/,
      /확인\s*사항\s*정리/,
      /고객한테\s*뭘\s*물어/,
    ]
  },
  {
    name: 'plan-req',
    priority: 3,
    patterns: [
      /요구\s*사항\s*(정의|도출|작성|분석|정리)?/,
      /\bREQ\b/i,
      /스펙\s*(정리|문서|작성)/,
      /뭘\s*만들어야/,
      /기능\s*요구\s*사항/,
      /필요한\s*기능\s*정리/,
    ]
  },
  {
    name: 'plan-fn',
    priority: 4,
    patterns: [
      /기능\s*정의\s*(서|해|작성|생성)?/,
      /기능\s*명세/,
      /\bFN\b(?!\s*키)/i,
      /기능\s*설계/,
      /기능\s*상세/,
      /기능을?\s*정의/,
      /기능\s*분해/,
      /기능\s*목록\s*작성/,
      /기능\s*스펙/,
      /어떤\s*기능이\s*필요/,
      /기능별\s*상세/,
    ]
  },
  {
    name: 'plan-ia',
    priority: 5,
    patterns: [
      /정보\s*구조/,
      /사이트\s*맵/,
      /\bIA\b/,
      /페이지\s*구조/,
      /메뉴\s*구조/,
      /네비게이션\s*설계/,
      /URL\s*설계/i,
      /사이트\s*구조/,
      /페이지\s*(목록|구성)/,
      /메뉴\s*체계/,
    ]
  },
  {
    name: 'plan-wbs',
    priority: 6,
    patterns: [
      /\bWBS\b/i,
      /작업\s*분해/,
      /일정\s*(산정|계획|짜|잡아)/,
      /스케줄/,
      /마일스톤/,
      /작업\s*목록/,
      /공수\s*산정/,
      /얼마나\s*걸리/,
    ]
  },
  {
    name: 'plan-SB',
    priority: 7,
    patterns: [
      /화면\s*설계/,
      /\bSB\b/,
      /와이어\s*프레임/,
      /화면\s*명세/,
      /스토리\s*보드/,
    ]
  },
  {
    name: 'plan-dashboard',
    priority: 8,
    patterns: [
      /대시\s*보드/,
      /\bDashboard\b/i,
      /전체\s*현황/,
      /산출물\s*현황/,
      /진행\s*현황\s*정리/,
      /프로젝트\s*현황/,
      /진행\s*상황\s*요약/,
      /현황판/,
      /KPI\s*정리/i,
      /지금까지\s*뭐\s*했/,
      /산출물\s*정리/,
    ]
  },
  {
    name: 'pm-router',
    priority: 9,
    patterns: [
      /수정\s*해\s*(줘|주세요)/,
      /추가\s*해\s*(줘|주세요)/,
      /만들어\s*(줘|주세요)/,
      /\b리뉴얼\b/,
      /\b(운영|구축|전환)\b.*\b(모드|시작|진행)\b/,
      /홈페이지\s*(만들|구축|리뉴얼)/,
      /사이트\s*(만들|구축|리뉴얼)/,
      /프로젝트\s*(진행|시작)/,
    ]
  }
];

// ── 훅 출력 ──

function createHookOutput(additionalContext) {
  return {
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext
    }
  };
}

function createSkillInvocation(skillName, originalPrompt, pipelineContext = '') {
  const contextSection = pipelineContext ? `\n\n파이프라인 상태:\n${pipelineContext}` : '';

  return `[ELUO HUB: ${skillName.toUpperCase()} 감지]

적절한 스킬을 Skill 도구로 호출하십시오:

Skill: ${skillName}${contextSection}

사용자 요청:
${originalPrompt}

IMPORTANT: 위 스킬을 즉시 호출하십시오. 스킬 로드 없이 진행하지 마십시오.`;
}

// ── 메인 ──

async function main() {
  try {
    const input = await readStdin();
    if (!input.trim()) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    let data = {};
    try { data = JSON.parse(input); } catch {}
    const cwd = data.cwd || data.directory || process.cwd();

    const prompt = extractPrompt(input);
    if (!prompt) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    const cleanPrompt = sanitize(prompt);

    // 키워드 매칭
    const matches = [];
    for (const skill of SKILL_KEYWORDS) {
      for (const pattern of skill.patterns) {
        if (pattern.test(cleanPrompt)) {
          matches.push(skill);
          break;
        }
      }
    }

    // 매칭 없음 → 패스스루
    if (matches.length === 0) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    // 우선순위 정렬 → 최상위 1개 선택
    matches.sort((a, b) => a.priority - b.priority);
    const selected = matches[0];

    // 파이프라인 상태 감지 (plan-req, plan-fn 등 개별 스킬일 때)
    let pipelineContext = '';
    if (selected.priority >= 2 && selected.priority <= 8) {
      const state = detectPipelineState(cwd);
      const existing = [];
      if (state.qst) existing.push('QST');
      if (state.req) existing.push('REQ');
      if (state.fn) existing.push('FN');
      if (state.ia) existing.push('IA');
      if (state.wbs) existing.push('WBS');

      if (existing.length > 0) {
        pipelineContext = `기존 산출물: ${existing.join(', ')}`;
      }
    }

    console.log(JSON.stringify(createHookOutput(
      createSkillInvocation(selected.name, prompt, pipelineContext)
    )));

  } catch (error) {
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
