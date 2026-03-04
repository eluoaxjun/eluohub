# 기획 자동화 스킬 — 폴더 배포

Claude Code 기반 기획 자동화 스킬 5종입니다.
각 폴더가 자기완결형이므로 원하는 스킬만 다운로드하여 즉시 사용할 수 있습니다.

## 스킬 목록

| 폴더 | 설명 | 파이프라인 순서 |
|------|------|----------------|
| plan-qst | 고객질의서 — 구조화된 질의서 생성 | 1 (최상위) |
| plan-req | 요구사항정의서 — FR/NFR/AC 정의 | 2 |
| plan-fn | 기능정의서 — 상세 기능 명세 | 3 |
| plan-ia | 정보구조설계 — 사이트맵/네비게이션/URL | 4 |
| plan-wbs | 작업분해구조 — 일정/공수/크리티컬 패스 | 5 |

## 설치 방법

1. 원하는 스킬 폴더를 다운로드
2. 폴더 내 파일을 `~/.claude/` 또는 `{프로젝트}/.claude/`에 병합 복사

```
plan-req/
├── rules/           →  ~/.claude/rules/
├── skills/plan-req/ →  ~/.claude/skills/plan-req/
├── agents/          →  ~/.claude/agents/
└── AGENTS.md        →  ~/.claude/AGENTS.md
```

3. Claude Code 실행 → 자연어 또는 `/plan-req`로 호출

## 복수 스킬 설치

각 스킬의 rules/와 agents/는 동일 파일이므로 덮어쓰기해도 무해합니다.
skills/ 하위에 스킬별 폴더가 나란히 위치하므로 충돌 없습니다.

## 실행 모드

- **독립 모드**: 선행 산출물 없이 프롬프트만으로 동작
- **연계 모드**: `output/planning/`에 선행 산출물이 있으면 자동으로 ID 추적·역참조 활성화

각 스킬의 상세 사용법은 스킬 폴더 내 README.md를 참고하십시오.
