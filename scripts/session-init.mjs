#!/usr/bin/env node

/**
 * Eluo Hub Session Init Hook
 * 세션 시작 시 프로젝트 컨텍스트를 자동으로 감지하여 Claude에 주입
 * Cross-platform: Windows, macOS, Linux
 *
 * 감지 항목:
 * 1. PROJECT.md 존재 여부 및 프로젝트 정보
 * 2. output/planning/ 내 기존 산출물 현황
 * 3. input/ 내 참고 자료 존재 여부
 * 4. .claude/CLAUDE.md 프로젝트 설정 여부
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { readStdin } from './lib/stdin.mjs';

// ── 프로젝트 감지 ──

function detectProject(cwd) {
  const result = {
    hasProject: false,
    projectName: '',
    deliverables: [],
    hasInput: false,
    inputFiles: [],
    hasClaudeMd: false,
  };

  // PROJECT.md 확인
  const projectMd = join(cwd, 'PROJECT.md');
  if (existsSync(projectMd)) {
    result.hasProject = true;
    try {
      const content = readFileSync(projectMd, 'utf-8');
      const nameMatch = content.match(/^#\s+(.+)/m);
      if (nameMatch) result.projectName = nameMatch[1].trim();
    } catch { /* silent */ }
  }

  // output/planning/ 산출물 스캔
  const planningDir = join(cwd, 'output', 'planning');
  if (existsSync(planningDir)) {
    try {
      const files = readdirSync(planningDir);
      for (const f of files) {
        const lower = f.toLowerCase();
        if (lower.endsWith('.md') || lower.endsWith('.html')) {
          if (lower.includes('qst')) result.deliverables.push('QST (고객질의서)');
          else if (lower.includes('req')) result.deliverables.push('REQ (요구사항정의서)');
          else if (lower.includes('fn')) result.deliverables.push('FN (기능정의서)');
          else if (lower.includes('ia')) result.deliverables.push('IA (정보구조설계)');
          else if (lower.includes('wbs')) result.deliverables.push('WBS (작업분해구조)');
          else if (lower.includes('sb')) result.deliverables.push('SB (화면설계서)');
          else if (lower.includes('dashboard')) result.deliverables.push('Dashboard (대시보드)');
        }
      }
      // 중복 제거
      result.deliverables = [...new Set(result.deliverables)];
    } catch { /* silent */ }
  }

  // input/ 참고 자료 확인
  const inputDir = join(cwd, 'input');
  if (existsSync(inputDir)) {
    result.hasInput = true;
    try {
      result.inputFiles = readdirSync(inputDir)
        .filter(f => !f.startsWith('.'))
        .slice(0, 10); // 최대 10개
    } catch { /* silent */ }
  }

  // .claude/CLAUDE.md 확인
  const claudeMd = join(cwd, '.claude', 'CLAUDE.md');
  if (existsSync(claudeMd)) {
    result.hasClaudeMd = true;
  }

  return result;
}

// ── 컨텍스트 메시지 생성 ──

function buildContext(project) {
  // 프로젝트 정보가 전혀 없으면 출력 안 함
  if (!project.hasProject && project.deliverables.length === 0 && !project.hasInput) {
    return '';
  }

  const lines = ['[Eluo Hub] 프로젝트 컨텍스트 감지됨\n'];

  if (project.hasProject && project.projectName) {
    lines.push(`프로젝트: ${project.projectName}`);
  }

  if (project.deliverables.length > 0) {
    lines.push(`\n기존 산출물 (${project.deliverables.length}건):`);
    for (const d of project.deliverables) {
      lines.push(`  - ${d}`);
    }
  }

  if (project.hasInput && project.inputFiles.length > 0) {
    lines.push(`\n참고 자료 (input/): ${project.inputFiles.length}건`);
  }

  if (project.hasClaudeMd) {
    lines.push('\n프로젝트 CLAUDE.md: 있음');
  }

  // 다음 단계 제안
  if (project.deliverables.length > 0) {
    const has = (name) => project.deliverables.some(d => d.startsWith(name));
    const suggestions = [];

    if (!has('QST') && !has('REQ')) suggestions.push('/planning:qst 또는 /planning:req');
    else if (has('QST') && !has('REQ')) suggestions.push('/planning:req (QST 기반)');
    else if (has('REQ') && !has('FN')) suggestions.push('/planning:fn (REQ 기반)');
    else if (has('FN') && !has('IA')) suggestions.push('/planning:ia (FN 기반)');
    else if (has('FN') && !has('WBS')) suggestions.push('/planning:wbs (FN 기반)');

    if (suggestions.length > 0) {
      lines.push(`\n다음 단계 추천: ${suggestions.join(', ')}`);
    }
  }

  return lines.join('\n');
}

// ── 메인 ──

async function main() {
  try {
    const input = await readStdin();

    let data = {};
    try { data = JSON.parse(input); } catch {}
    const cwd = data.cwd || data.directory || process.cwd();

    const project = detectProject(cwd);
    const context = buildContext(project);

    if (context) {
      console.log(JSON.stringify({
        continue: true,
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: context
        }
      }));
    } else {
      console.log(JSON.stringify({ continue: true }));
    }

  } catch (error) {
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
