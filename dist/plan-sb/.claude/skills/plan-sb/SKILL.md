---
name: plan-SB
description: >
  화면설계서(Screen Blueprint) 자동 생성 스킬. JSON 데이터를 입력받아
  HTML/PDF 화면설계서를 자동 생성합니다. 테마 프리셋, v1/v2 스키마 자동 정규화,
  다중 프레임 타입(Design, Description, MSG Case, Component Guide)을 지원합니다.
argument-hint: "[JSON 데이터 파일경로 또는 프로젝트 요구사항]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

# 화면설계서 (Screen Blueprint) Generator

당신은 **시니어 웹 기획자**이며, 프로젝트의 화면설계서를 자동으로 생성합니다.

## 개요

JSON 데이터 파일을 입력받아 HTML/PDF 화면설계서를 출력합니다.
v1(KMVNO 전용) 스키마는 자동으로 v2(범용) 스키마로 정규화됩니다.

**파이프라인**: JSON 데이터 → 스키마 정규화 → 테마 로드 → HTML 렌더링 → PDF 내보내기 → 검증

## Step 0: 입력 감지 (런타임)

이 스킬은 JSON 데이터 파일 유무에 따라 동작 모드를 결정합니다.

| 검색 대상 | 경로 패턴 | 발견 시 | 미발견 시 |
|-----------|----------|---------|----------|
| JSON 데이터 | `data/*.json`, `input/*.json` | 바로 생성 실행 | 대화형 데이터 수집 |
| FN 산출물 | `output/{프로젝트명}/*_FN_*.md` | FN 기반 screens 자동 구성 | - |
| 이미지 | `input/*.png`, `input/pages/*.png` | uiImagePath 자동 매핑 | 빈 영역(wireframe) 표시 |

**모드 판정 출력 (필수)**:
```
[입력 감지] JSON: {발견 n건 / 미발견}, FN: {발견 n건 / 미발견}, 이미지: {n건} → {자동 / 대화형} 모드
```

### Step 0-A: 전방위 스캔

Step 0 완료 후, `output/{프로젝트명}/` 디렉토리를 전체 스캔하여 형제 산출물의 존재 여부를 파악합니다.

| 스캔 대상 | 경로 패턴 | 역할 |
|-----------|----------|------|
| FN | `output/{프로젝트명}/*_FN_*.md` | **직접 선행** — screens 자동 구성 근거 |
| REQ | `output/{프로젝트명}/*_REQ_*.md` | 보조 참조 — 프로젝트명, 요구사항 참고 |
| IA | `output/{프로젝트명}/*_IA_*.md` | 보조 참조 — 페이지 구조, 네비게이션 참고 |
| _context | `output/{프로젝트명}/_context.md` | 누적 컨텍스트 — 프로젝트명, 업종, 기능 수 |

**전방위 스캔 출력 (필수)**:
```
[전방위 스캔] FN:{n} REQ:{n} IA:{n} _context:{존재/미존재}
```

- **직접 선행** 발견 시: FN 기능 목록에서 screens 자동 구성
- **보조 참조** 발견 시: 프로젝트명, 인터페이스 경로 등을 추출하여 JSON 데이터 보강
- **_context.md** 존재 시: 프로젝트명, 업종을 로드하여 화면설계서 헤더에 일관성 유지

## 전제조건

**자동 모드** (JSON 데이터 발견 시):
- JSON 파일이 v1 또는 v2 스키마를 만족 (자동 정규화)
- v2 필수 필드: project, screens
- v1 필수 필드: project, history, assignment, interfaces, screens

**대화형 모드** (JSON 미발견 시):
- 사용자에게 프로젝트 정보를 순서대로 질의
- 질의 완료 후 JSON 파일 생성 → 자동 모드로 전환

## 정보 소유 경계

이 산출물이 소유/생산하는 정보와, ID만 참조하는 정보, 가져오면 안 되는 정보의 경계입니다.

| 구분 | 항목 | 설명 |
|------|------|------|
| **소유** | 화면 와이어프레임 | 와이어프레임 구성 요소 배치 |
| **소유** | Description 영역 | 수정 전/후, 마커, 상세 설명 |
| **소유** | MSG/Dialog Case | 메시지 케이스 정의 |
| **소유** | 컴포넌트 가이드 | UI 컴포넌트 상태/사양 |
| **소유** | 프레임 구성/배치 | Cover, History, Screen 등 프레임 순서 |
| **참조** | FN-### ID + 기능명 | FN에서 기능 ID와 이름만 참조 |
| **참조** | IA 페이지 구조 | IA에서 메뉴 경로(location)만 참조 |
| **금지** | 기능 상세 로직 복사 | FN 소유. 처리 로직을 SB에 복사 금지 |
| **금지** | 요구사항 AC 복사 | REQ 소유. 인수조건을 SB에 직접 기재 금지 |

## JSON 데이터 구조

### v2 스키마 (범용)

#### project (필수)
| 필드 | 필수 | 설명 | 예시 |
|------|------|------|------|
| id | O | 프로젝트 ID | TEST-V21 |
| title | O | 과제명 | 화면설계서 v2.1 E2E 테스트 |
| serviceName | O | 서비스명 | v2.1 Test Service |
| version | O | 버전 | 2.1 |
| date | O | 작성일 | 2026-03-03 |
| writer | O | 작성자 | 테스터 |
| company | O | 회사 정보 `{ name }` | { name: "TestCo" } |
| requestor | O | 요청자 | PM |
| outputPrefix | - | 출력 파일명 접두사 | v21-test |
| reviewers | - | 검토자 목록 | ["검토자A"] |
| approvers | - | 승인자 목록 | ["승인자A"] |
| reviewDate | - | 검토일 | 2026-03-04 |
| approveDate | - | 승인일 | 2026-03-05 |

#### theme (선택)
| 필드 | 설명 | 예시 |
|------|------|------|
| preset | 테마 프리셋명 (`themes/{preset}.json`) | default, kmvno |
| primaryColor | 주 색상 오버라이드 | #3366CC |
| accentColor | 강조 색상 오버라이드 | #CC3333 |
| logo | 로고 설정 `{ type, html }` | { type: "text", html: "Logo" } |

#### history[] (선택)
| 필드 | 필수 | 설명 |
|------|------|------|
| version | O | 버전 |
| date | O | 날짜 |
| detail | O | 변경 내용 |
| page | - | 페이지 |
| writer | O | 작성자 |
| remarkers | - | 비고 |

#### overview (선택)
| 필드 | 설명 |
|------|------|
| type | summary / assignment |
| title | 개요 제목 |
| content | `{ summary }` 또는 `{ detail }` |
| divider | `{ sub, main, bullets[] }` (assignment 타입) |
| interfaces[] | 인터페이스 목록 (assignment 타입) |

#### screens[] (필수)
| 필드 | 필수 | 설명 |
|------|------|------|
| screenType | O | 프레임 유형: `design` / `description` / `msgCase` / `component` |
| viewportType | O | Mobile / PC / Tablet |
| interfaceName | O | 인터페이스명 |
| interfaceId | - | 인터페이스 ID |
| location | O | 메뉴 경로 |
| pageName | - | 페이지명 |
| uiImagePath | - | UI 캡처 이미지 경로 |
| hasDivider | - | 디바이더 포함 여부 |
| divider | - | 디바이더 정보 (`sectionNo`, `sub`, `main`, `toc[]`) |
| wireframe[] | - | 와이어프레임 요소 배열 |
| persistent | - | Header/Footer/LNB/Breadcrumb 영속 UI |
| descriptions[] | O* | 수정 영역 설명 (*design/description 타입 필수) |
| msgCases[] | - | MSG/Dialog Case 목록 (*msgCase 타입 필수) |
| components[] | - | 컴포넌트 가이드 (*component 타입 필수) |
| modifiedDate | - | 수정일 |
| version | - | 화면 버전 |
| pmComments[] | - | PM 코멘트 |

#### descriptions[] 항목
| 필드 | 필수 | 설명 |
|------|------|------|
| marker | O | 마커 번호 (1, 2, 3...) |
| label | O | 영역명 |
| changeType | - | 변경 유형: 변경 / 추가 / 삭제 |
| commonNote | - | 공통 적용 노트 |
| items[] | - | 계층적 설명 (`{ num, text, level, highlight }`) |
| before | - | 수정 전 내용 (v1 호환) |
| after | - | 수정 후 내용 (v1 호환) |
| details[] | - | 상세 불릿 목록 (v1 호환) |
| continuation | - | 연속 마커: prev / next |
| overlay | - | 마커 오버레이 위치 (top, left, width, height) |

#### wireframe[] 요소
| 필드 | 설명 |
|------|------|
| type | header/nav/gnb/text/input/button/card/image/list/banner/table/group/divider |
| label | 요소 라벨 |
| marker | 연결 마커 번호 (수정 영역 표시) |
| height | 최소 높이 |
| children[] | 하위 요소 (재귀) |
| content | 텍스트 콘텐츠 |
| variant | 버튼 변형: primary/outline/text |
| items[] | 목록/네비 아이템 |
| headers[] | 테이블 헤더 |
| rows[][] | 테이블 데이터 |

### v1 스키마 (KMVNO 호환)

v1 스키마(assignment, interfaces, jiraNo/srNo 필드)는 자동으로 v2로 정규화됩니다.
상세는 `lib/schema.js`의 `normalizeV1()` 참조.

## 작성 절차

### 1. 데이터 준비
- JSON 데이터 파일 탐색 또는 대화형 수집
- 스키마 정규화: v1→v2 자동 변환, 미인식 포맷은 최소 스키마 생성
- 테마 로드: `themes/{preset}.json` → data.theme 오버라이드
- config.json 디폴트 병합 (빈 필드만)
- input/ 폴더 이미지 존재 시 uiImagePath 자동 매핑

### 2. HTML 생성
```bash
node {skill-path}/scripts/generate.js <data-file.json>
```

생성되는 프레임:
- **Cover 프레임**: 프로젝트 표지 (로고, 과제명, 버전, 검토/승인 테이블)
- **History 프레임**: 변경 이력 테이블
- **Overview 프레임**: Assignment 또는 Summary (overview 데이터 기반)
- **Screen 프레임**: screenType에 따라 분기
  - `design`: 메타정보 + 와이어프레임/이미지 + Description
  - `description`: Description Only (와이어프레임 없음)
  - `msgCase`: MSG/Dialog Case 테이블
  - `component`: UI 컴포넌트 가이드 카드
- **Divider 프레임**: hasDivider=true인 screen 앞에 자동 삽입
- **End of Document 프레임**

### 3. PDF 변환
- Playwright chromium으로 HTML → PDF 변환
- 페이지 너비: 테마 `frame.width` (기본 1200px)
- 페이지 높이: 프레임별 실제 scrollHeight 측정 → 최대값 + 20px (동적)
- 배경 인쇄 포함 (printBackground: true)
- Playwright 미설치 시 자동 설치 후 PDF 생성 (`npm install playwright` + `npx playwright install chromium`)

### 4. 검증

**Claude (MCP Playwright)** — 스킬 실행 중 시각 확인:

> **주의**: MCP Playwright는 `file://` URL을 차단합니다. 로컬 HTTP 서버를 경유해야 합니다.

1. (Bash) `python -m http.server 9988 --directory {output_디렉토리}` — 백그라운드 실행
2. `browser_navigate` — `http://localhost:9988/{파일명}.html` 열기
3. `browser_evaluate` — `.frame` 요소 수 집계 → 예상 프레임 수 대조
4. `browser_take_screenshot` — 전체 화면 시각 확인
5. (Bash) HTTP 서버 종료

**사용자 독립 실행** — 프레임별 PNG 파일로 저장:
```bash
node {skill-path}/scripts/verify.js output/{파일명}.html
# → output/verify/{파일명}-page1.png, page2.png ... 생성
# Playwright 미설치 시 자동 설치 후 실행
```

### 5. 결과 출력

```
================================================
[화면설계서 생성 결과]
================================================
프로젝트: {id}
과제명: {title}
서비스: {serviceName}
------------------------------------------------
[생성 프레임]
총 프레임: {n}개
- Cover: 1
- History: 1
- Overview: 1
- Screen Design: {n}
- Divider: {n}
- End of Document: 1
------------------------------------------------
[출력 파일]
HTML: output/{프로젝트명}/{outputPrefix}.html
PDF: output/{프로젝트명}/{outputPrefix}.pdf
================================================
```

## 컨텍스트 전파

### _context.md 읽기 (Step 0에서 수행)

`output/{프로젝트명}/_context.md`가 존재하면 아래 필드를 로드하여 화면설계서 작성에 활용합니다.

| 필드 | 활용 |
|------|------|
| 프로젝트명 | Cover 프레임 과제명과 일관성 확인 |
| 업종 | 와이어프레임 구성 시 업종별 일반 패턴 참고 |
| FN 수 | Screen 수 대비 FN 수 합리성 검증 |

### _context.md 기록 (완료 시 필수)

산출물 생성 완료 후 `output/{프로젝트명}/_context.md`에 아래 블록을 **추가(append)** 합니다.

```markdown
## SB 요약
- 생성일: {YYYY-MM-DD}
- 총 프레임: {n}개
- Screen 수: {n}개 (design:{n} / description:{n} / msgCase:{n} / component:{n})
- 테마: {preset}
- 출력: {outputPrefix}.html, {outputPrefix}.pdf
```

### Mini-PM 자가 점검 (3문항)

| ID | 점검 문항 | 판정 기준 |
|----|----------|----------|
| PM-1 | JSON 스키마 필수 필드가 모두 채워졌는가? | 필수 필드 누락 0건 = Pass |
| PM-2 | _context.md의 프로젝트명과 Cover 프레임 과제명이 일치하는가? | 불일치 0건 = Pass |
| PM-3 | Screen 수가 FN 기능 수 대비 합리적 범위인가? | FN 존재 시 검증, 미존재 시 N/A |

```
[Mini-PM] PM-1: {Pass/Fail} | PM-2: {Pass/Fail/N/A} | PM-3: {Pass/Fail/N/A}
```

## Step 0-F: 폴더 보장 (독립/파이프라인 공통)

산출물 저장 전에 아래 폴더 구조를 확인하고, 없으면 자동 생성합니다.

```
1. PROJECT.md 존재 여부로 프로젝트 루트 결정 (미존재 → CWD)
2. input/ 디렉토리 → 없으면 생성
3. output/{프로젝트명}/ 디렉토리 → 없으면 생성
```

**출력 (필수)**:
```
[폴더 보장] input/: {존재/생성} | output/{프로젝트명}/: {존재/생성}
```

## 출력 형식
- HTML 파일명: `{프로젝트명}_SB_{YYYYMMDD}_{버전}.html`
- PDF 파일명: `{프로젝트명}_SB_{YYYYMMDD}_{버전}.pdf`
- 저장 경로: `output/{프로젝트명}/`
- 예시: `비짓강남_SB_20260305_v1.0.html`

## 품질 체크 (Self-Check)

산출물 생성 완료 후 아래 검증을 자동 수행합니다.

### 입력 검증

| ID | 검증 항목 | 유형 | 판정 기준 |
|----|----------|------|----------|
| V1 | JSON 파일 존재 + 파싱 가능 | E | JSON 파일 로드 + 파싱 성공. Fail 시 생성 중단 |
| V2 | 스키마 필수 필드 완전성 | E | project + screens 존재 (v2) 또는 project + assignment + screens 존재 (v1) |

### 내부 구조 검증

| # | 검증 항목 | 판정 기준 |
|---|----------|----------|
| 1 | Cover 프레임 존재 | 로고, 과제명, 버전 표시 |
| 2 | History 프레임 존재 | history[] 1건 이상 시 변경 이력 테이블 생성 |
| 3 | Overview 프레임 존재 | overview 데이터 존재 시 정상 렌더링 |
| 4 | Screen 프레임 수 = screens[] 수 | 일치하지 않으면 Fail |
| 5 | Divider 프레임 수 = hasDivider:true 수 | 일치하지 않으면 Fail |
| 6 | End of Document 프레임 존재 | 마지막 프레임 확인 |
| 7 | 메타 테이블 완전성 | 각 Screen에 Viewport, Interface, Location 표시 |
| 8 | Description 영역 완전성 | design/description 타입: marker + label 존재 |
| 9 | 와이어프레임 마커 일치 | wireframe[].marker ↔ descriptions[].marker 매핑 |
| 10 | 이미지 참조 유효성 | uiImagePath 지정 시 파일 존재 또는 placeholder 표시 |
| 11 | PDF 출력 정상 | HTML → PDF 변환 성공, 프레임 간 페이지 구분 |
| 12 | 정보 소유 경계 준수 | FN 처리 로직, REQ AC가 SB에 직접 복사되지 않았는가 |

### 교차 검증 (Cross-Validation)

| # | 검증 항목 | 판정 기준 |
|---|----------|----------|
| X1 | 프로젝트명 일관성 | _context.md의 프로젝트명과 Cover 과제명 일치. _context.md 미존재 시 N/A |
| X2 | FN↔Screen 수량 정합성 | _context.md의 FN 수와 Screen 수 비교. _context.md 미존재 시 N/A |
| X3 | IA 경로 일관성 | _context.md 또는 IA 산출물의 페이지 경로와 Screen location 비교. 미존재 시 N/A |

### Self-Check 출력

```
═══════════════════════════════════
[Self-Check] plan-SB
═══════════════════════════════════
▶ 입력 검증
| V1 | JSON 파일 존재 + 파싱    | {Pass/Fail} |
| V2 | 스키마 필수 필드 완전성    | {Pass/Fail} |
▶ 내부 구조 검증
| 1  | Cover 프레임              | {Pass/Fail} |
| 2  | History 프레임             | {Pass/Fail/N/A} |
| 3  | Overview 프레임            | {Pass/Fail/N/A} |
| 4  | Screen 프레임 수           | {Pass/Fail — n/n} |
| 5  | Divider 프레임 수          | {Pass/Fail — n/n} |
| 6  | End of Document            | {Pass/Fail} |
| 7  | 메타 테이블 완전성          | {Pass/Fail} |
| 8  | Description 완전성         | {Pass/Fail} |
| 9  | 와이어프레임 마커 일치      | {Pass/Fail/N/A} |
| 10 | 이미지 참조 유효성          | {Pass/Fail/N/A} |
| 11 | PDF 출력 정상              | {Pass/Fail/N/A} |
| 12 | 정보 소유 경계 준수         | {Pass/Fail} |
▶ 교차 검증
| X1 | 프로젝트명 일관성          | {Pass/N/A} |
| X2 | FN↔Screen 수량 정합성      | {Pass/Fail/N/A} |
| X3 | IA 경로 일관성             | {Pass/Fail/N/A} |
▶ PM Devil's Advocate
| DA1 | 범위 — 누락된 화면/프레임  | {PM-OK/WARN/BLOCK — 사유} |
| DA2 | 우선순위 — 핵심 화면 누락  | {PM-OK/WARN/BLOCK — 사유} |
| DA3 | 가정 — 미확인 UI 패턴     | {PM-OK/WARN/BLOCK — 사유} |
───────────────────────────────────
판정: {PASS — 18/18} 또는 {FAIL — n/18}
═══════════════════════════════════
```

### 상세 체크리스트
전체 항목: [checklist.md](checklist.md) 참조 (reviewer 검수 시 사용)

## 예시 데이터
참조: [example/v2-1-e2e-test.json](example/v2-1-e2e-test.json)

$ARGUMENTS
