# plan-sb 패키지

이 환경에는 **화면설계서(SB) 자동화** 스킬만 설치되어 있습니다.

## 파이프라인 위치

```
QST → REQ → FN → IA → WBS → [SB]
```

파이프라인 최종 단계입니다.

## 실행 절차

### Step 0: 선행 파악 (모드 판별)

연계 모드 조건 (하나라도 해당 시):

| 조건 | 방식 | 참조 파일 |
|------|------|----------|
| `output/{프로젝트명}/context/fn.md` 존재 | 자동 연계 | FN 기능 목록에서 screens 자동 구성 |
| `output/{프로젝트명}/context/ia.md` 존재 | 자동 연계 | IA 페이지 경로를 location에 반영 |
| `input/FN_*.md` 존재 | 수동 연계 | 이전 패키지 FN 산출물 수동 복사 방식 |
| `input/IA_*.md` 존재 | 수동 연계 | IA 산출물 수동 복사 방식 |
| 모두 미존재 | 독립 모드 | 사용자에게 직접 화면 구성 정보 수집 |

JSON 파일 스캔:
- `data/*.json`, `input/*.json` 존재 시 → 자동 모드
  - 기존 SB 산출물 JSON인 경우: screens[] 구조(interfaceName, location, viewportType) 유지하며 수정·보강
  - v1 스키마(`assignment` 필드 존재) → 자동 정규화 후 사용
  - 미인식 포맷 → 필수 필드(`project`, `screens[]`)만 추출해 최소 스키마 생성
- 미발견 시 → 대화형 수집 모드 (사용자에게 프로젝트 정보 질의 후 JSON 생성)

이미지 스캔:
- `input/*.{png,jpg,jpeg,gif,webp}`, `input/pages/*.{png,jpg,jpeg}` 존재 시 → uiImagePath 자동 매핑
  - 파일명 기반 매핑(interfaceName 유사도) → 실패 시 정렬 순서 기반 1:1 매핑
  - `Read` 도구로 이미지를 읽어 레이아웃 Vision 분석 → wireframe[] 초안 자동 도출
- 미발견 시 → wireframe 표시 (기본 동작)

FN 산출물 스캔 (연계 모드):
- **반드시** `output/{프로젝트명}/*/FN_*.md` 패턴 사용 (날짜 하위폴더 포함)
- `*_FN_*.md` 패턴 **금지** (날짜 하위폴더 건너뜀)

`_context.md` 파일이 존재하면 "v1 컨텍스트 파일이 감지되었습니다. `context/` 폴더로 전환합니다."를 출력 후 해당 내용을 참조하고 `context/sb.md`로 갱신합니다.

context 파일 없을 시: `mkdir -p output/{프로젝트명}/context/` 생성

**참조 URL**: 프롬프트에 URL 포함 시 → Playwright MCP로 방문·스크린샷·구조 분석 (GNB·주요기능·레이아웃 파악). 미포함 시 → 프로젝트명으로 공식 사이트 웹 검색 시도. 접속/검색 모두 실패 시 → "현행 사이트 미확인" 표기 후 진행.

```
[SB Step 0] 모드: {연계/독립} | JSON: {n건/없음} | 이미지: {n건/없음} | FN: {n건/없음} | IA: {있음/없음} | 참조사이트: {URL/검색결과/미확인}
→ Step 1 진입
```

### Step 1: JSON 데이터 준비

**자동 모드** (JSON 발견 시):
- v1/v2 스키마 자동 정규화 (`lib/schema.js normalizeV1()`)
- 미인식 포맷: 필수 필드만 추출해 최소 스키마 생성 후 진행
- 연계 모드: `context/fn.md`에서 FN ID + 기능명 추출 → screens 자동 구성
- 이미지 발견 시: uiImagePath 자동 매핑 + Vision 분석으로 wireframe[] 초안 보강

**대화형 모드** (JSON 미발견 시):
- 프로젝트 정보 순차 수집 (id, title, serviceName, version, date, writer, company.name)
- 이미지 발견 시: 이미지 기반으로 화면 목록 제안 → 사용자 확인 후 JSON 생성
- 이미지 미발견 시: 화면 목록 직접 수집 → JSON 파일 생성 → 자동 모드로 전환

```
[Step 1] 스키마: {v1→v2 정규화/v2 직접/최소 스키마} | screens: {n개} | 이미지 매핑: {n건/없음}
```

### Step 2: HTML/PDF 생성

JSON 데이터 준비 완료 후 generate.js를 실행합니다:

```
node .claude/skills/plan-sb/scripts/generate.js <data-file.json>
```

- 성공 시: `output/{프로젝트명}/{outputPrefix}.html` + `.pdf` 동시 생성 확인
- 실패 시: 오류 메시지를 사용자에게 전달하고 중단

### Step 3: Self-Check

`.claude/skills/plan-sb/checklist.md` 전 항목을 확인합니다.

- Screen 프레임 수 = screens[] 수 일치 확인
- Divider 프레임 수 = hasDivider:true 수 일치 확인
- 마커 매핑: wireframe[].marker ↔ descriptions[].marker

```
[Self-Check] PASS {n}/{n} | FAIL {n}/{n}
→ FAIL 1건 이상 시 수정 후 재확인
```

### Step 4: context 갱신

**context/sb.md 갱신 (overwrite)**:
```markdown
---
skill: sb
date: YYYYMMDD
version: v1.0
status: 완료
---
## 핵심 지표
- outputPrefix: {outputPrefix}
- 총 프레임: N개
- Screen: N개 (design:N / description:N / msgCase:N / component:N)
- 테마: {preset}
## 다음 단계 참조용 요약
- HTML: output/{프로젝트명}/{outputPrefix}.html
- PDF: output/{프로젝트명}/{outputPrefix}.pdf
```

**절대 금지**: `_context.md` append 방식 사용 금지

## 스코프 안내

이 환경에서 실행 가능한 스킬: **plan-sb 단 1개**

**스코프 외 요청 시**:
"이 환경은 화면설계서(plan-sb) 전용입니다. 해당 기능은 다음 패키지에서 실행하십시오:"

| 요청 | 패키지 |
|------|--------|
| 고객질의서 | plan-qst |
| 요구사항정의서 | plan-req |
| 기능정의서 | plan-fn |
| 정보구조설계 | plan-ia |
| 작업분해구조 | plan-wbs |

## 산출물 경로 규칙

> **이 규칙은 모든 스킬·에이전트·라우터보다 우선합니다.**

| 항목 | 규칙 |
|------|------|
| 저장 경로 | `output/{프로젝트명}/` (날짜 폴더 없음 — HTML/PDF 고정 파일) |
| 파일명 | JSON `outputPrefix` 필드 값 사용 |
| context | `output/{프로젝트명}/context/sb.md` (overwrite) |
| FN 스캔 | `output/{프로젝트명}/*/FN_*.md` (날짜 하위폴더 포함 필수) |

**절대 금지**:
- `output/planning/` 경로 사용 금지
- `*_FN_*.md` 패턴으로 FN 스캔 금지 (날짜 하위폴더 건너뜀)
- 번호 접두사(`01_`, `02_` 등) 파일명 생성 금지
- `_context.md` append 방식 사용 금지

## 에이전트 및 스킬

에이전트: `AGENTS.md` 참조
스킬: `.claude/skills/plan-sb/SKILL.md`
