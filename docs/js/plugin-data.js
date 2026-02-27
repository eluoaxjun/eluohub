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
    recommended: ['design'],
    pipelinePosition: 1
  },
  {
    id: 'design',
    name: 'Design',
    nameKo: '디자인',
    version: '1.0.0',
    description: '벤치마킹, HTML 시안 A/B/C 생성, 스타일가이드',
    descriptionLong: '경쟁사 벤치마킹 분석과 HTML 기반 디자인 시안(A/B/C 멀티 시안)을 자동 생성합니다. 스타일가이드(Design Knowledge)를 포함합니다.',
    required: false,
    tags: ['design', 'benchmark', 'html-mockup'],
    color: '#8B5CF6',
    icon: 'design',
    assets: {
      skills: [
        { name: 'design', description: '디자인 전체 파이프라인' },
        { name: 'design-benchmark', description: '벤치마킹 분석' }
      ],
      commands: [
        { name: '/design:design', description: '디자인 전체 파이프라인' },
        { name: '/design:benchmark', description: '벤치마킹 분석' }
      ],
      agents: [
        { name: 'design-orchestrator', description: '디자인 오케스트레이터' },
        { name: 'design-reviewer', description: '디자인 검수자' }
      ]
    },
    dependencies: ['core'],
    recommended: ['planning', 'publish'],
    pipelinePosition: 2
  },
  {
    id: 'publish',
    name: 'Publish',
    nameKo: '퍼블리싱',
    version: '1.0.0',
    description: '시맨틱 HTML, CSS Custom Properties, 바닐라 JS',
    descriptionLong: '디자인 시안을 프로덕션 코드로 변환합니다. 시맨틱 HTML5 마크업, CSS Custom Properties 기반 스타일링, 바닐라 JS 인터랙션을 3단계로 구현합니다.',
    required: false,
    tags: ['publish', 'html', 'css', 'javascript'],
    color: '#10B981',
    icon: 'publish',
    assets: {
      skills: [
        { name: 'publish', description: '퍼블리싱 전체 (Markup → Style → Interaction)' },
        { name: 'publish-markup', description: '시맨틱 HTML 마크업' },
        { name: 'publish-style', description: 'CSS 스타일링' },
        { name: 'publish-interaction', description: 'JS 인터랙션' }
      ],
      commands: [
        { name: '/publish:publish', description: '퍼블리싱 전체 파이프라인' }
      ],
      agents: [
        { name: 'publish-orchestrator', description: '퍼블리싱 오케스트레이터' },
        { name: 'publish-reviewer', description: '퍼블리싱 검수자' }
      ]
    },
    dependencies: ['core'],
    recommended: ['design', 'qa'],
    pipelinePosition: 3
  },
  {
    id: 'qa',
    name: 'QA',
    nameKo: 'QA',
    version: '1.0.0',
    description: '기능/접근성/성능 테스트, WCAG 2.1 AA, Core Web Vitals',
    descriptionLong: '기능 테스트(TC 자동 생성), WCAG 2.1 AA 접근성 검증, Core Web Vitals 성능 테스트를 통합 실행합니다. 비주얼 리그레션 테스트를 지원합니다.',
    required: false,
    tags: ['qa', 'testing', 'accessibility', 'performance'],
    color: '#F59E0B',
    icon: 'qa',
    assets: {
      skills: [
        { name: 'qa', description: 'QA 전체 파이프라인' },
        { name: 'qa-functional', description: '기능 테스트' },
        { name: 'qa-accessibility', description: '접근성 테스트' },
        { name: 'qa-performance', description: '성능 테스트' }
      ],
      commands: [
        { name: '/qa:qa-run', description: 'QA 전체 실행' },
        { name: '/qa:qa', description: '테스트계획서 생성' }
      ],
      agents: [
        { name: 'qa-orchestrator', description: 'QA 오케스트레이터' },
        { name: 'qa-reviewer', description: 'QA 검수자' }
      ]
    },
    dependencies: ['core'],
    recommended: ['publish'],
    pipelinePosition: 4
  },
  {
    id: 'ops',
    name: 'Ops',
    nameKo: '운영',
    version: '1.0.0',
    description: '유지운영 요청접수, 티켓관리, Notion 동기화',
    descriptionLong: '유지운영 요청을 접수하고, 티켓으로 관리하며, Notion과 동기화합니다. 요청 유형 분류, 영향도 분석, 파이프라인 자동 실행을 지원합니다.',
    required: false,
    tags: ['ops', 'maintenance', 'notion'],
    color: '#EF4444',
    icon: 'ops',
    assets: {
      skills: [
        { name: 'maintenance-intake', description: '요청 접수 및 분류' },
        { name: 'notion-ticket', description: 'Notion 태스크 관리' }
      ],
      commands: [
        { name: '/ops:maintenance', description: '유지운영 요청 접수' }
      ],
      agents: [
        { name: 'maintenance-orchestrator', description: '운영 오케스트레이터' }
      ]
    },
    dependencies: ['core'],
    recommended: ['planning', 'publish'],
    pipelinePosition: 'ops'
  }
];

/* ── 프리셋 정의 ── */
const PRESETS = {
  all: {
    name: '전체 설치',
    description: '6개 플러그인 전부 설치',
    plugins: ['core', 'planning', 'design', 'publish', 'qa', 'ops']
  },
  build: {
    name: '구축 모드',
    description: '신규 프로젝트 구축용 (기획→디자인→퍼블리싱→QA)',
    plugins: ['core', 'planning', 'design', 'publish', 'qa']
  },
  ops: {
    name: '운영 모드',
    description: '유지운영용 (기획+퍼블리싱+운영)',
    plugins: ['core', 'planning', 'publish', 'ops']
  }
};

/* ── 통계 ── */
const STATS = {
  plugins: PLUGINS.length,
  skills: PLUGINS.reduce((sum, p) => sum + p.assets.skills.length, 0),
  commands: PLUGINS.reduce((sum, p) => sum + p.assets.commands.length, 0),
  agents: PLUGINS.reduce((sum, p) => sum + p.assets.agents.length, 0)
};
