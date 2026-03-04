/**
 * plugin-data.js — Eluo Hub 플러그인 메타데이터
 * marketplace.json 기반 + 자산 상세
 */

const PLUGINS = [
  {
    id: 'core',
    name: 'Core',
    nameKo: '코어',
    version: '1.0.0',
    description: '공통 규칙, PM Router',
    descriptionLong: '모든 플러그인의 기반이 되는 필수 패키지. 공통 규칙(5개)과 PM Router 스킬을 포함하여 프로젝트 작업 요청을 자동으로 적절한 오케스트레이터로 라우팅합니다.',
    required: true,
    tags: ['core', 'rules', 'router'],
    color: '#6B7280',
    icon: 'core',
    assets: {
      skills: [{ name: 'pm-router', description: 'PM 자동 라우팅' }],
      commands: [],
      agents: []
    },
    dependencies: [],
    recommended: [],
    pipelinePosition: 'foundation'
  },
  {
    id: 'planning',
    name: 'Planning',
    nameKo: '기획',
    version: '1.0.0',
    description: '기획 산출물 자동 생성 (QST, REQ, FN, IA, WBS, SB, Dashboard)',
    descriptionLong: '고객질의서(QST)부터 요구사항(REQ), 기능정의(FN), 정보구조(IA), 작업분해(WBS), 화면설계서(SB), 대시보드까지 기획 전체 산출물을 자동 생성합니다.',
    required: false,
    tags: ['planning', 'requirements', 'functional-spec'],
    color: '#3B82F6',
    icon: 'planning',
    assets: {
      skills: [
        { name: 'plan', description: '기획 전체 파이프라인' },
        { name: 'plan-qst', description: '고객질의서' },
        { name: 'plan-req', description: '요구사항정의서' },
        { name: 'plan-fn', description: '기능정의서' },
        { name: 'plan-ia', description: '정보구조설계' },
        { name: 'plan-wbs', description: '작업분해구조' },
        { name: 'plan-SB', description: '화면설계서' },
        { name: 'plan-dashboard', description: '대시보드' }
      ],
      commands: [
        { name: '/planning:plan', description: '기획 전체 파이프라인' },
        { name: '/planning:qst', description: '고객질의서' },
        { name: '/planning:req', description: '요구사항정의서' },
        { name: '/planning:fn', description: '기능정의서' },
        { name: '/planning:wbs', description: '작업분해구조' },
        { name: '/planning:sb', description: '화면설계서' },
        { name: '/planning:dashboard', description: '대시보드' }
      ],
      agents: [
        { name: 'planning-orchestrator', description: '기획 오케스트레이터' },
        { name: 'planning-reviewer', description: '기획 검수자' }
      ]
    },
    dependencies: ['core'],
    recommended: [],
    pipelinePosition: 1
  }
];

/* ── 프리셋 정의 ── */
const PRESETS = {
  all: {
    name: '전체 설치',
    description: '코어 + 기획 플러그인 설치',
    plugins: ['core', 'planning']
  }
};

/* ── 통계 ── */
const STATS = {
  plugins: PLUGINS.length,
  skills: PLUGINS.reduce((sum, p) => sum + p.assets.skills.length, 0),
  commands: PLUGINS.reduce((sum, p) => sum + p.assets.commands.length, 0),
  agents: PLUGINS.reduce((sum, p) => sum + p.assets.agents.length, 0)
};
