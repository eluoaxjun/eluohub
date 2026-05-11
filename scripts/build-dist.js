#!/usr/bin/env node
/**
 * build-dist.js — 마스터 → dist 자동 동기화 + 정합성 검출
 *
 * Usage: node scripts/build-dist.js [--check-only] [--package=plan-sb]
 *
 * 동작:
 *  1) 각 dist 패키지의 SKILL.md를 마스터(C:\Users\hj.moon\.claude\skills)에서 복사
 *  2) orchestrator skills 목록을 자기 스킬로 단독화
 *  3) 메타 파일 시점 정합성 검증 (SKILL.md 시점 ± 1일 이내)
 *  4) rules 화이트리스트 적용
 *  5) plan-sb 한정: scripts/, themes/, references/, example/ 동기화
 *
 * --check-only: 변경 없이 갭만 보고
 */

const fs = require('fs');
const path = require('path');

const MASTER_SKILLS = 'C:/Users/hj.moon/.claude/skills';
const MASTER_RULES = 'C:/Users/hj.moon/.claude/lib/rules';
const DIST_ROOT = 'D:/eluo-hub_v4/dist';

// 패키지별 화이트리스트
// ccd-autogate: 6패키지 공통 (CCD 자동 게이트 도메인별 임계값 + DA/DQG/Self-Check 자동 결정 단일 소스)
const PKG_CONFIG = {
  'plan-qst': { rules: ['change-mgmt','cron-patterns','pipeline','pm-direction','quality','traceability','anti-rationalization','artifact-scope','environment','ccd-autogate'] },
  'plan-req': { rules: ['change-mgmt','cron-patterns','pipeline','pm-direction','quality','traceability','anti-rationalization','artifact-scope','environment','handoff-schema','ccd-autogate'] },
  'plan-fn':  { rules: ['change-mgmt','cron-patterns','pipeline','pm-direction','quality','traceability','anti-rationalization','artifact-scope','environment','handoff-schema','ccd-autogate'] },
  'plan-ia':  { rules: ['change-mgmt','cron-patterns','pipeline','pm-direction','quality','traceability','anti-rationalization','artifact-scope','environment','handoff-schema','ccd-autogate'] },
  'plan-wbs': { rules: ['change-mgmt','cron-patterns','pipeline','pm-direction','quality','traceability','anti-rationalization','artifact-scope','environment','handoff-schema','ccd-autogate'] },
  'plan-sb':  { rules: ['change-mgmt','cron-patterns','pipeline','pm-direction','quality','traceability','anti-rationalization','artifact-scope','environment','handoff-schema','cli-internalization','ccd-autogate'], hasScripts: true }
};

const checkOnly = process.argv.includes('--check-only');
const pkgFilter = (process.argv.find(a => a.startsWith('--package=')) || '').split('=')[1];

const issues = [];
const summary = [];

function log(msg) { console.log(msg); summary.push(msg); }

function syncFile(src, dst) {
  if (!fs.existsSync(src)) return false;
  if (checkOnly) {
    if (!fs.existsSync(dst)) { issues.push(`MISSING: ${dst}`); return false; }
    const sStat = fs.statSync(src), dStat = fs.statSync(dst);
    if (sStat.mtimeMs > dStat.mtimeMs + 1000) {
      issues.push(`STALE: ${dst} (master ${sStat.mtime.toISOString()}, dist ${dStat.mtime.toISOString()})`);
    }
    return true;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return true;
}

function syncDir(srcDir, dstDir, filterFn = () => true) {
  if (!fs.existsSync(srcDir)) return;
  if (!checkOnly) fs.mkdirSync(dstDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!filterFn(entry.name)) continue;
    const src = path.join(srcDir, entry.name);
    const dst = path.join(dstDir, entry.name);
    if (entry.isDirectory()) syncDir(src, dst, filterFn);
    else syncFile(src, dst);
  }
}

function fixOrchSkills(orchPath, pkg) {
  if (!fs.existsSync(orchPath)) return;
  let c = fs.readFileSync(orchPath, 'utf8');
  const m = c.match(/^skills:\r?\n((  - [a-z-]+\r?\n)+)/m);
  if (!m) return;
  const lines = m[1].split(/\r?\n/).filter(Boolean);
  if (lines.length === 1 && lines[0].includes(pkg)) return; // already single
  if (checkOnly) {
    issues.push(`ORCH_NOT_SINGLE: ${orchPath} → ${lines.length}개 호출 (단독 패키지엔 1개여야 함)`);
    return;
  }
  c = c.replace(/^skills:\r?\n(  - [a-z-]+\r?\n)+/m, `skills:\r\n  - ${pkg}\r\n`);
  fs.writeFileSync(orchPath, c, 'utf8');
  log(`  [${pkg}] orchestrator skills ${lines.length}→1개 단독화`);
}

const targetPkgs = pkgFilter ? [pkgFilter] : Object.keys(PKG_CONFIG);
log(`=== build-dist ${checkOnly ? '(check-only)' : '(sync)'} — ${targetPkgs.length}개 패키지 ===`);

for (const pkg of targetPkgs) {
  const cfg = PKG_CONFIG[pkg];
  if (!cfg) { log(`[${pkg}] 화이트리스트 없음 — skip`); continue; }
  const distPkg = path.join(DIST_ROOT, pkg);
  if (!fs.existsSync(distPkg)) { issues.push(`PKG_MISSING: ${distPkg}`); continue; }

  log(`\n── [${pkg}] ──`);

  // 1) SKILL.md 동기화
  const srcSkill = path.join(MASTER_SKILLS, pkg, 'SKILL.md');
  const dstSkill = path.join(distPkg, '.claude/skills', pkg, 'SKILL.md');
  if (syncFile(srcSkill, dstSkill)) log(`  SKILL.md ${checkOnly ? '검증' : '동기화'}`);

  // 1-2) pm-router SKILL.md 동기화 (6 패키지 공통)
  const srcPmRouter = path.join(MASTER_SKILLS, 'pm-router', 'SKILL.md');
  const dstPmRouter = path.join(distPkg, '.claude/skills/pm-router', 'SKILL.md');
  syncFile(srcPmRouter, dstPmRouter);
  log(`  pm-router SKILL.md ${checkOnly ? '검증' : '동기화'}`);

  // 2) plan-sb 한정 자원
  if (cfg.hasScripts) {
    const srcRoot = path.join(MASTER_SKILLS, pkg);
    const dstRoot = path.join(distPkg, '.claude/skills', pkg);
    for (const sub of ['scripts','themes','references','example']) {
      const srcSub = path.join(srcRoot, sub);
      const dstSub = path.join(dstRoot, sub);
      if (fs.existsSync(srcSub)) {
        syncDir(srcSub, dstSub, n => !n.startsWith('node_modules') && !n.endsWith('.tmp') && n !== 'post-process.js' && n !== '.daemon.pid' && !n.endsWith('.log'));
      }
    }
    // commands/figma-push.md 동기화 (slash command)
    const srcCmd = path.join('C:/Users/hj.moon/.claude/commands', 'figma-push.md');
    const dstCmd = path.join(distPkg, '.claude/commands', 'figma-push.md');
    if (fs.existsSync(srcCmd)) {
      syncFile(srcCmd, dstCmd);
    }
    log(`  scripts/themes/references/example ${checkOnly ? '검증' : '동기화'}`);
  }

  // 3) rules 화이트리스트
  for (const rule of cfg.rules) {
    const src = path.join(MASTER_RULES, `${rule}.md`);
    const dst = path.join(distPkg, '.claude/rules', `${rule}.md`);
    syncFile(src, dst);
  }
  log(`  rules ${cfg.rules.length}개 ${checkOnly ? '검증' : '동기화'}`);

  // 4) orchestrator skills 단독화
  fixOrchSkills(path.join(distPkg, '.claude/agents/planning-orchestrator.md'), pkg);
}

log(`\n=== 결과 ===`);
log(`이슈: ${issues.length}건`);
issues.forEach(i => log(`  ⚠️  ${i}`));
if (issues.length > 0 && checkOnly) process.exit(1);
