# 전체 파이프라인 통합 환경

이 환경에는 **기획 파이프라인 6개 스킬 전체**가 설치되어 있습니다.

## 파이프라인

```
[QST] → [REQ] → [FN] → [IA] → [WBS] → [SB]
```

각 단계 완료 후 `output/{프로젝트명}/context/{skill}.md`에 컨텍스트를 저장하며, 다음 단계에서 자동 참조합니다.

---

## plan-qst: 고객질의서

**파이프라인 위치**: `[QST] → REQ → FN → IA → WBS → SB`

### Step 0: 선행 파악
1. `output/{프로젝트명}/context/` 스캔 → `context/qst.md` 존재 시 이전 버전 참조
2. 스캔 출력: `[전방위 스캔] REQ:{n} FN:{n} IA:{n} WBS:{n} context/qst.md:{존재/미존재}`

### Step 1: 기확정 항목 식별
PROJECT.md 읽기 → 기확정 항목 추출 → `[Step 0] 기확정: {n}건 | 질의 후보: {n}건`

### Step 2: 질의서 생성
SKILL.md 지식 참조 — 구축/운영 분기, 업종 프리셋, 선택형(A/B/C/D)

### Step 3: Self-Check
checklist.md + DA 3챌린지 실행 → `[Self-Check] plan-qst | 판정: PASS/FAIL`

### Step 4: 저장 + 렌더링
- MD: `output/{프로젝트명}/{YYYYMMDD}/QST_{코드}_{버전}.md`
- context: `output/{프로젝트명}/context/qst.md` (overwrite)
- 렌더링: `node .claude/skills/plan-qst/scripts/render.js {파일}.md`

---

## plan-req: 요구사항정의서

**파이프라인 위치**: `QST → [REQ] → FN → IA → WBS → SB`

### Step 0: 선행 파악
1. `context/qst.md` 존재 시 → 연계 모드 (QST 핵심 지표 로드)
2. 스캔 출력: `[전방위 스캔] QST:{n} FN:{n} context/req.md:{존재/미존재}`

### Step 1: 요구사항 수집
연계 모드: QST 미확인 항목 기반 | 독립 모드: 사용자 직접 입력

### Step 2: 요구사항정의서 생성
SKILL.md 지식 참조 — FR/NFR 분리, AC EARS 패턴, 우선순위(Must/Should/Could)

### Step 3: Self-Check
checklist.md + DA 3챌린지 → `[Self-Check] plan-req | 판정: PASS/FAIL`

### Step 4: 저장 + 렌더링
- MD: `output/{프로젝트명}/{YYYYMMDD}/REQ_{코드}_{버전}.md`
- context: `output/{프로젝트명}/context/req.md` (overwrite)
- 렌더링: `node .claude/skills/plan-req/scripts/render.js {파일}.md`

---

## plan-fn: 기능정의서

**파이프라인 위치**: `QST → REQ → [FN] → IA → WBS → SB`

### Step 0: 선행 파악
1. `context/req.md` 존재 시 → 연계 모드 (FR 목록 로드)
2. 스캔 출력: `[전방위 스캔] REQ:{n} IA:{n} context/fn.md:{존재/미존재}`

### Step 1: FN 항목 구성
연계 모드: FR→FN 1:N 분해 | 독립 모드: 기능 직접 정의

### Step 2: 기능정의서 생성
SKILL.md 지식 참조 — 복잡도별 분기(4탭/처리+에러/서술), 검증 3단계

### Step 3: Self-Check
checklist.md + DA 3챌린지 → `[Self-Check] plan-fn | 판정: PASS/FAIL`

### Step 4: 저장 + 렌더링
- MD: `output/{프로젝트명}/{YYYYMMDD}/FN_{코드}_{버전}.md`
- context: `output/{프로젝트명}/context/fn.md` (overwrite)
- 렌더링: `node .claude/skills/plan-fn/scripts/render.js {파일}.md`

---

## plan-ia: 정보구조설계

**파이프라인 위치**: `QST → REQ → FN → [IA] → WBS → SB`

### Step 0: 선행 파악
1. `context/fn.md` 존재 시 → 연계 모드 (FN 기능 목록 로드)
2. 스캔 출력: `[전방위 스캔] FN:{n} context/ia.md:{존재/미존재}`

### Step 1: IA 구조 수집
연계 모드: FN 기반 자동 구성 | 독립 모드: 서비스 유형 질의

### Step 2: 정보구조설계 생성
SKILL.md 지식 참조 — 사이트맵, 페이지 인벤토리, URL 설계, 네비게이션

### Step 3: Self-Check
checklist.md + DA 3챌린지 → `[Self-Check] plan-ia | 판정: PASS/FAIL`

### Step 4: 저장 + 렌더링
- MD: `output/{프로젝트명}/{YYYYMMDD}/IA_{코드}_{버전}.md`
- context: `output/{프로젝트명}/context/ia.md` (overwrite)
- 렌더링: `node .claude/skills/plan-ia/scripts/render.js {파일}.md`

---

## plan-wbs: 작업분해구조

**파이프라인 위치**: `QST → REQ → FN → IA → [WBS] → SB`

### Step 0: 선행 파악
1. `context/fn.md`, `context/ia.md` 존재 시 → 연계 모드
2. 스캔 출력: `[전방위 스캔] FN:{n} IA:{n} context/wbs.md:{존재/미존재}`

### Step 1: 작업 목록 수집
연계 모드: FN+IA 기반 자동 구성 | 독립 모드: 사용자 직접 입력

### Step 2: WBS 생성
SKILL.md 지식 참조 — 단계별 작업, 공수 산정, 크리티컬 패스

### Step 3: Self-Check
checklist.md + DA 3챌린지 → `[Self-Check] plan-wbs | 판정: PASS/FAIL`

### Step 4: 저장 + 렌더링
- MD: `output/{프로젝트명}/{YYYYMMDD}/WBS_{코드}_{버전}.md`
- context: `output/{프로젝트명}/context/wbs.md` (overwrite)
- 렌더링: `node .claude/skills/plan-wbs/scripts/render.js {파일}.md`

---

## plan-sb: 화면설계서

**파이프라인 위치**: `QST → REQ → FN → IA → WBS → [SB]`

### Step 0: 선행 파악 (모드 판별)
`output/{프로젝트명}/context/` 스캔:
- `context/fn.md` 존재 → 연계 모드 (FN 기능 목록에서 screens 자동 구성)
- `context/ia.md` 존재 → IA 페이지 경로를 location에 반영
- 없음 → 독립 모드

JSON 스캔: `data/*.json`, `input/*.json` 존재 시 자동 모드
FN 스캔: `output/{프로젝트명}/*/FN_*.md` (날짜 하위폴더 포함 필수)

출력: `[SB Step 0] 모드: {연계/독립} | JSON: {n건/없음} | FN: {n건/없음} | IA: {있음/없음}`

### Step 1: JSON 데이터 준비
자동 모드 (JSON 발견) → v1/v2 스키마 정규화
대화형 모드 (JSON 미발견) → 화면 목록 수집 → JSON 생성

### Step 2: HTML/PDF 생성
```
node .claude/skills/plan-sb/scripts/generate.js <data-file.json>
```

### Step 3: Self-Check
checklist.md 전 항목 확인 → `[Self-Check] plan-sb | 판정: PASS/FAIL`

### Step 4: context 갱신
`output/{프로젝트명}/context/sb.md` (overwrite)

---

## 스코프 안내

이 환경은 기획 파이프라인 **6개 스킬 전체**를 지원합니다.

| 스킬 | 키워드 |
|------|--------|
| plan-qst | 고객질의서, QST, 고객에게 물어볼 |
| plan-req | 요구사항, REQ, 스펙 정리 |
| plan-fn | 기능정의서, FN, 기능 명세 |
| plan-ia | 정보구조, 사이트맵, IA |
| plan-wbs | WBS, 일정 산정, 공수 |
| plan-sb | 화면설계서, SB, 와이어프레임 |

## 산출물 경로 규칙

> **이 규칙은 모든 스킬·에이전트·라우터보다 우선합니다.**

| 항목 | 규칙 |
|------|------|
| 저장 경로 | `output/{프로젝트명}/{YYYYMMDD}/` |
| 파일명 | `{SKILL}_{프로젝트코드}_{버전}.md` |
| context | `output/{프로젝트명}/context/{skill}.md` (overwrite, 날짜 폴더 밖) |

**절대 금지**:
- `output/planning/` 경로 사용 금지
- 번호 접두사(`01_`, `02_` 등) 파일명 생성 금지
- `_context.md` append 방식 사용 금지

## 에이전트 및 스킬

에이전트: `AGENTS.md` 참조
스킬: `.claude/skills/{skill}/SKILL.md`
