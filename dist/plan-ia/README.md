# 정보구조설계 (plan-ia)

## 개요

사이트맵, 페이지 인벤토리, 네비게이션, 콘텐츠 매핑, URL 설계를 5단계 절차로 생성합니다.
REQ/FN 산출물 또는 자유 프롬프트를 입력으로 받습니다.

## 사전 준비

1. Claude Code CLI 설치
2. **Core 패키지 설치 (필수)** — `core/` 폴더의 rules/ 5개 파일을 먼저 설치
3. 이 스킬 폴더의 파일을 `~/.claude/` 또는 `{프로젝트}/.claude/`에 복사

## 폴더 구조

복사 후 최종 구조:

```
~/.claude/  (또는 {프로젝트}/.claude/)
├── skills/
│   └── plan-ia/
│       ├── SKILL.md
│       ├── checklist.md
│       ├── depth-rules.md
│       └── template.md
├── agents/
│   └── planning-reviewer.md
└── AGENTS.md
```

## 사용 방법

### 자연어 실행

> "사이트맵을 설계해줘"
> "이 프로젝트의 페이지 구조를 잡아줘"

### 슬래시 커맨드

> /plan-ia [프로젝트명 또는 REQ/FN 파일경로]

## 실행 모드

### 독립 모드
- 선행 산출물 없이 프롬프트만으로 실행
- 예: "의료기관 홈페이지의 사이트맵을 설계해줘"
- FR/FN 역참조 생략, 프롬프트에서 페이지 구조 직접 도출

### 연계 모드
- `output/planning/REQ_*.md` 또는 `FN_*.md` 존재 시 자동 활성화
- FR/FN→페이지 매핑, ID 추적성 유지

## 산출물

- **파일명**: `IA-{프로젝트명}-{버전}.md`
- **저장 경로**: `output/planning/`
- **포함 내용**: 사이트맵 트리, 페이지 인벤토리, 네비게이션 구조(GNB/LNB/Footer/브레드크럼), 콘텐츠 인벤토리, URL 설계

## 품질 검증

- **Self-Check**: 스킬 완료 시 자동 실행 (9항목 — GNB ≤7개, Depth ≤3, URL 고유성 등)
- **Reviewer**: planning-reviewer가 unit 모드로 Critical P/F 판정

## 다른 스킬과의 관계

| 관계 | 스킬 | 설명 |
|------|------|------|
| 선행 | plan-req | FR → 페이지 매핑 (없으면 독립 모드) |
| 선행 | plan-fn | FN → 페이지 매핑 (없으면 독립 모드) |
| 후행 | plan-wbs | IA 페이지 수 → 퍼블리싱 작업량 산정 |
