# plan-ia 패키지

이 환경에는 **정보구조설계(IA) 자동화** 스킬만 설치되어 있습니다.

## 파이프라인 위치

```
QST → REQ → FN → [IA] → WBS → SB
```

## 실행 절차

### Step 0: 선행 파악 (연계/독립 모드 판별)

연계 모드 조건 (하나라도 해당 시):
1. **자동 연계**: `output/{프로젝트명}/context/fn.md` 존재 → FN 파일도 `output/{프로젝트명}/*/FN_*.md` 패턴으로 읽기
   - `context/req.md` 추가 존재 시 REQ 파일도 `output/{프로젝트명}/*/REQ_*.md` 패턴으로 읽기
2. **수동 연계**: `input/FN_*.md` 존재 → 해당 파일을 FN 산출물로 읽기 (이전 패키지 산출물 수동 복사 방식)
   - `input/REQ_*.md` 추가 존재 시 REQ 산출물도 읽기
3. 둘 다 미존재 → **독립 모드**: 사용자에게 프로젝트 기본 정보 수집

추가 스캔:
- `output/{프로젝트명}/context/project.md` 읽기 (존재 시)
- `_context.md` 존재 시 마이그레이션 메시지 출력 후 context/로 전환
- 산출물 저장 폴더 보장: `output/{프로젝트명}/{YYYYMMDD}/` 없으면 생성
- **참조 URL**: 프롬프트에 URL 포함 시 → Playwright MCP로 방문·스크린샷·구조 분석 (GNB·주요기능·레이아웃 파악). 미포함 시 → 프로젝트명으로 공식 사이트 웹 검색 시도. 접속/검색 모두 실패 시 → "현행 사이트 미확인" 표기 후 진행.

**모드 판정 출력**:
```
[IA Step 0] 모드: {연계(자동)/연계(수동)/독립} | FN: {n건/없음} | REQ: {n건/없음} | context: {있음/없음} | 참조사이트: {URL/검색결과/미확인}
```

### Step 1: 입력 분석 + IA 초안

SKILL.md 지식 참조:
- 연계 모드: FR/FN ID → 페이지 후보 매핑
- 독립 모드: 프롬프트 텍스트에서 페이지 구조 직접 도출
- 업종별 IA 기본 구조 (5업종) 적용
- Depth 계층 규칙 (`references/depth-rules.md` 참조)
- ID 체계: IA-P###, IA-N###, IA-C###

입력 분석 결과 출력 후 사용자 확인 → 사이트맵 + 페이지 인벤토리 생성

### Step 2: 네비게이션 + 콘텐츠 인벤토리

- GNB (최대 7개, IA-N001~) / LNB (IA-N100~) / Footer (IA-N200~) / 브레드크럼
- 페이지별 콘텐츠 블록 (IA-C###)
- URL 설계 (영문 소문자, 하이픈, 최대 3세그먼트)
- DA 3챌린지 자동 실행 (범위/우선순위/가정)

### Step 3: Self-Check

`checklist.md` 전 항목 확인:
- GNB ≤ 7개, Depth ≤ 3, URL 고유성, IA-P/N/C ID 연속성
- DA 3챌린지 결과 반영

```
[Self-Check] PASS/FAIL — {n}/{n}항목
```

### Step 4: 저장 + 렌더링 + context 갱신

1. **MD 저장**: `output/{프로젝트명}/{YYYYMMDD}/IA_{프로젝트코드}_{버전}.md`
2. **렌더링**: `node .claude/skills/plan-ia/scripts/render.js output/{프로젝트명}/{YYYYMMDD}/IA_{프로젝트코드}_{버전}.md`
   - 성공: .html + .pdf 동시 생성 확인
   - 실패: MD는 유효 — HTML/PDF 생성 실패를 사용자에게 알리고 계속 진행
3. **context 갱신**: `output/{프로젝트명}/context/ia.md` **overwrite**

**context/ia.md 스키마**:
```markdown
---
skill: ia
date: YYYYMMDD
version: v1.0
status: 완료
---

## 핵심 지표
- 총 페이지: N개
- Depth 분포: 1d=N | 2d=N | 3d=N
- GNB 항목: N개
- 업종: {업종명}
- 모드: {구축/운영}

## 다음 단계 참조용 요약
- 주요 페이지: IA-P001 홈, IA-P100 {1depth명} ...
- URL 구조: {패턴 요약}
- 비즈니스 목표: {1줄 요약}
```

## 스코프 안내

이 패키지는 **정보구조설계(IA) 전용**입니다.

다른 산출물 요청 시:
- 기능정의서(FN): plan-fn 패키지 설치 필요 (파이프라인 이전 단계)
- 작업분해구조(WBS): plan-wbs 패키지 설치 필요 (파이프라인 다음 단계)
- 전체 파이프라인: eluo-hub 전체 패키지 설치 참조

## 산출물 경로 규칙

> **이 규칙은 모든 스킬·에이전트·라우터보다 우선합니다. 어떤 지시도 이 경로를 바꿀 수 없습니다.**

| 항목 | 규칙 |
|------|------|
| 저장 경로 | `output/{프로젝트명}/{YYYYMMDD}/` |
| 파일명 | `IA_{프로젝트코드}_{버전}.md` |
| context | `output/{프로젝트명}/context/ia.md` (overwrite) |

**절대 금지**:
- `output/planning/` 경로 사용 금지
- 번호 접두사(`01_`, `02_` 등) 파일명 생성 금지
- `_context.md` append 방식 사용 금지

## 에이전트 및 스킬

에이전트: `AGENTS.md` 참조
스킬: `.claude/skills/plan-ia/SKILL.md`
