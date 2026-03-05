# Eluo Hub

웹 에이전시 기획-디자인-퍼블리싱-QA-운영 자동화 플러그인 마켓플레이스.

Claude Code 플러그인 시스템 기반으로, 프로젝트에 필요한 단계만 선택 설치하여 사용합니다.

## 플러그인 목록

| 플러그인 | 설명 | 필수 |
|----------|------|------|
| **core** | 공통 규칙, PM Router | O |
| **planning** | 기획 산출물 자동 생성 (QST, REQ, FN, IA, WBS, SB, Dashboard) | |
| **design** | 벤치마킹, HTML 시안 A/B/C 생성, 스타일가이드 | | 작업 중
| **publish** | 시맨틱 HTML, CSS Custom Properties, 바닐라 JS 퍼블리싱 | |작업 중
| **qa** | 기능/접근성/성능 테스트, WCAG 2.1 AA, Core Web Vitals | |작업 중
| **ops** | 유지운영 요청접수, 티켓관리, Notion 동기화 | | 별도 배포 예정

## 설치

### 방법 1: 스크립트 설치 (VSCode / CLI 공통)

```bash
git clone https://github.com/eluoaxjun/eluohub.git
cd eluohub
node install.mjs
```

설치 후 Claude Code를 재시작하면 플러그인이 활성화됩니다.

제거 시:
```bash
node uninstall.mjs
```

### 방법 2: CLI 터미널 (`/plugin` 명령)

Claude Code 터미널에서 직접 설치할 수 있습니다:

```
/plugin marketplace add eluoaxjun/eluohub
/plugin install eluo-hub@eluo-hub
```

## 커맨드

### Planning

| 커맨드 | 설명 |
|--------|------|
| `/planning:plan` | 기획 전체 파이프라인 |
| `/planning:qst` | 고객질의서 |
| `/planning:req` | 요구사항정의서 |
| `/planning:fn` | 기능정의서 |
| `/planning:wbs` | 작업분해구조 |
| `/planning:sb` | 화면설계서 자동 생성 |
| `/planning:dashboard` | 대시보드 |

### Design

| 커맨드 | 설명 |
|--------|------|
| `/design:design` | 디자인 전체 파이프라인 |
| `/design:benchmark` | 벤치마킹 분석 |

### Publish

| 커맨드 | 설명 |
|--------|------|
| `/publish:publish` | 퍼블리싱 전체 (Markup → Style → Interaction) |

### QA

| 커맨드 | 설명 |
|--------|------|
| `/qa:qa-run` | QA 전체 (기능 + 접근성 + 성능) |

### Ops

| 커맨드 | 설명 |
|--------|------|
| `/ops:maintenance` | 유지운영 요청 접수 + 티켓 관리 |

## 요구사항

- Claude Code v2.1 이상
- Node.js 18+ (스크립트 설치 시)

## 라이선스

Eluo Digital Agency 내부 사용.
