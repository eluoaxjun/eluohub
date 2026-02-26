# Eluo Hub

웹 에이전시 기획-디자인-퍼블리싱-QA-운영 자동화 플러그인 마켓플레이스.

Claude Code 플러그인 시스템 기반으로, 프로젝트에 필요한 단계만 선택 설치하여 사용합니다.

## 플러그인 목록

| 플러그인 | 설명 | 필수 |
|----------|------|------|
| **core** | 공통 규칙, PM Router | O |
| **planning** | 기획 산출물 자동 생성 (QST, REQ, FN, IA, WBS, Dashboard) | |
| **design** | 벤치마킹, HTML 시안 A/B/C 생성, 스타일가이드 | |
| **publish** | 시맨틱 HTML, CSS Custom Properties, 바닐라 JS 퍼블리싱 | |
| **qa** | 기능/접근성/성능 테스트, WCAG 2.1 AA, Core Web Vitals | |
| **ops** | 유지운영 요청접수, 티켓관리, Notion 동기화 | |

## 설치

### 1. 마켓플레이스 등록

```
/plugin marketplace add eluoaxjun/eluohub
```

### 2. 플러그인 설치

core는 필수, 나머지는 필요한 것만 선택 설치합니다.

```
/plugin install core@eluo-hub
/plugin install planning@eluo-hub
/plugin install design@eluo-hub
/plugin install publish@eluo-hub
/plugin install qa@eluo-hub
/plugin install ops@eluo-hub
```

### 3. 프로젝트별 자동 구성 (선택)

프로젝트의 `.claude/settings.json`에 추가하면 팀원이 자동으로 안내받습니다:

```json
{
  "extraKnownMarketplaces": {
    "eluo-hub": {
      "source": { "source": "github", "repo": "eluoaxjun/eluohub" }
    }
  },
  "enabledPlugins": {
    "core@eluo-hub": true,
    "planning@eluo-hub": true
  }
}
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

- Claude Code v1.0.33 이상
- `/plugin` 커맨드 지원 버전

## 라이선스

Eluo Digital Agency 내부 사용.
