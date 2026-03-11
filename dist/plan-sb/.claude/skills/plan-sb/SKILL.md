---
name: plan-sb
description: >
  화면설계서(Screen Blueprint) 자동 생성 스킬. JSON 데이터를 입력받아
  HTML/PDF 화면설계서를 자동 생성합니다. 테마 프리셋, v1/v2 스키마 자동 정규화,
  다중 프레임 타입(Design, Description, MSG Case, Component Guide)을 지원합니다.
argument-hint: "[JSON 데이터 파일경로 또는 프로젝트 요구사항]"
---

## 페르소나

시니어 웹 기획자. JSON 데이터를 입력받아 화면 와이어프레임·Description·MSG Case·컴포넌트 가이드를 포함한 HTML/PDF 화면설계서를 생성한다.

## 정보 소유 경계

| 구분 | 항목 |
|------|------|
| **소유** | 화면 와이어프레임, Description 영역, MSG/Dialog Case, 컴포넌트 가이드, 프레임 구성/배치 |
| **참조** | FN-### ID + 기능명 (기능명만), IA 페이지 경로(location) |
| **금지** | FN 처리 로직·알고리즘 복사, REQ AC 수치 기준 직접 기재 |

## JSON 작성 전 필수 체크

JSON 데이터를 새로 작성하거나 새 필드를 추가할 때는 반드시 아래 파일을 먼저 읽는다:
- `scripts/template.js` — `renderWfElement`, `renderDescriptionTableV2`, `renderComponentGuide`, `renderScreen` 함수에서 실제 지원 필드 확인
- `scripts/lib/schema.js` — `normalizeScreen`에서 passthrough 필드 확인

문서에 없는 필드는 template.js에서 렌더링되지 않는다.

## JSON 데이터 구조 (v2 스키마)

### project 필수 필드
`id`, `title`, `serviceName`, `version`, `date`, `writer`, `company.name`, `requestor`

### screens[] 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| screenType | O | `design` / `description` / `msgCase` / `component` |
| viewportType | O | Mobile / PC / Tablet |
| interfaceName | O | 인터페이스명 |
| location | O | 메뉴 경로 |
| descriptions[] | O* | design/description 타입 필수 (marker + label + items[]) |
| msgCases[] | O* | msgCase 타입 필수 |
| components[] | O* | component 타입 필수 |
| uiImagePath | - | UI 캡처 이미지 경로 |
| hasDivider | - | true 시 앞에 Divider 프레임 자동 삽입 |
| wireframe[] | - | 와이어프레임 요소 배열 |

### wireframe[] 요소 타입
`header` / `nav` / `gnb` / `text` / `input` / `button` / `card` / `image` / `list` / `banner` / `table` / `group` / `divider`

### v1 → v2 자동 정규화
`assignment`, `interfaces`, `jiraNo`/`srNo` 필드는 자동으로 v2로 변환. 상세: `lib/schema.js normalizeV1()`

## 프레임 타입별 생성 로직

| 프레임 | 생성 조건 |
|--------|----------|
| Cover | 항상 생성 (표지) |
| History | `history[]` 1건 이상 |
| Overview | `overview` 데이터 존재 |
| Divider | `hasDivider: true`인 screen 앞 자동 삽입 |
| Screen | `screens[]` 전수 (screenType별 분기) |
| End of Document | 항상 생성 (마지막) |

## 출력 명세

- HTML 파일명: `{outputPrefix}.html` (outputPrefix 미설정 시: `{프로젝트명}_SB_{YYYYMMDD}_{버전}.html`)
- PDF 파일명: `{outputPrefix}.pdf`
- 저장 경로: `output/{프로젝트명}/{YYYYMMDD}/`
- 생성 커맨드: `node .claude/skills/plan-sb/scripts/generate.js <data-file.json>`

## 16:9 슬라이드 명세 (v2)

- **화면 규격**: 1920×1080px 고정 (overflow:hidden)
- **PDF 출력**: margin:0 (`@page { size: 1920px 1080px; }`)
- **슬라이드 구조**: slide-header(54px) + slide-body(flex:1) + slide-footer(36px)
- **Design 레이아웃**: 좌 60% wireframe-area + 우 40% description-panel
- **MSG Case 자동 분리**: `screenType:'design'` + `msgCases` 동시 존재 시 별도 슬라이드 자동 생성 (인라인 혼재 금지)

## fnRef 필드 명세

`descriptions[].fnRef: string[]` — FN 코드 배열

```json
{
  "marker": 2,
  "label": "쿠폰 입력 영역",
  "fnRef": ["FN-042", "FN-043"],
  "items": [{ "text": "쿠폰 코드 입력 필드 + [적용] 버튼" }]
}
```

- 렌더링: Description 패널 하단 `[FN 참조]` 섹션 — 기능명만 표시
- 처리 로직·AC 복사 금지

## Description 역할 재정의

| 항목 | 연계 모드 (context/fn.md 존재) | 독립 모드 (fn.md 없음) |
|------|-------------------------------|----------------------|
| UI 배치/레이아웃 설명 | 허용 | 허용 |
| 시각 상태 (hover, disabled 등) | 허용 | 허용 |
| 변경 이유 | 허용 | 허용 |
| 기능 동작 의도 | **금지** (fnRef로 위임) | **허용** ("클릭 시 ~한다") |
| 처리 로직·알고리즘 | 금지 | 금지 |
| AC 수치 기준 | 금지 | 금지 |

- **연계 모드**: fnRef 빈 배열이면 verify.js WARN 발생
- **독립 모드**: fnRef: [] → Description 패널 fnRef 섹션 생략

## 품질 기준

| 항목 | 기준 |
|------|------|
| Cover 슬라이드 | 로고·과제명·버전 표시 |
| 슬라이드 수 | screens[] 수와 일치 |
| Divider 슬라이드 수 | hasDivider:true 수와 일치 |
| 마커 일치 | wireframe[].marker ↔ descriptions[].marker 매핑 |
| 정보 소유 경계 | FN 로직·REQ AC 직접 복사 0건 |
| FN 커버리지 | 연계 모드: context/fn.md 존재 시 주요 FN이 화면에 매핑 |
| overflow | verify.js WARN 0건 |
| MSG 인라인 | verify.js ERROR 0건 |

## 금지 패턴

- `*_FN_*.md` 패턴으로 FN 스캔 금지 (날짜 하위폴더 건너뜀) → `output/{프로젝트명}/*/FN_*.md` 사용
- FN 처리 로직·알고리즘·AC 수치 기준을 Description에 복사 금지
- `_context.md` append 방식 사용 금지
- `[미확인]`, `[미정]` 항목 잔존 금지
- design 슬라이드 내 msgCases 인라인 혼재 금지

## Self-Check

산출물 생성 완료 후 자동 수행합니다.

### 입력 검증

| ID | 검증 항목 | 판정 기준 |
|----|----------|----------|
| V1 | JSON 파일 존재 + 파싱 가능 | JSON 로드 + 파싱 성공. Fail 시 생성 중단 |
| V2 | 스키마 필수 필드 완전성 | `project` + `screens[]` 존재 (v1 스키마는 자동 정규화) |

### 내부 구조 검증

| # | 검증 항목 | 판정 기준 |
|---|----------|----------|
| 1 | Cover 슬라이드 존재 | 로고·과제명·버전 표시 |
| 2 | History 슬라이드 존재 | `history[]` 1건 이상 시 변경 이력 테이블 생성 |
| 3 | Overview 슬라이드 존재 | `overview` 데이터 존재 시 정상 렌더링 |
| 4 | Screen 슬라이드 수 = screens[] 수 | 일치하지 않으면 Fail |
| 5 | Divider 슬라이드 수 = hasDivider:true 수 | 일치하지 않으면 Fail |
| 6 | End of Document 존재 | 마지막 슬라이드 확인 |
| 7 | 메타 테이블 완전성 | Viewport·Interface·Location 표시 |
| 8 | Description 완전성 | design/description 타입: marker + label 존재 |
| 9 | 와이어프레임 마커 일치 | `wireframe[].marker` ↔ `descriptions[].marker` 매핑 |
| 10 | PDF 출력 정상 | 1920×1080, 슬라이드 간 페이지 구분 |
| 11 | 정보 소유 경계 준수 | FN 처리 로직·REQ AC 직접 복사 0건 |
| 12 | MSG Case 분리 | design 슬라이드 내 msgCases 인라인 혼재 0건 (verify.js ERROR 0건) |

### 교차 검증

| # | 검증 항목 | 판정 기준 |
|---|----------|----------|
| X1 | 프로젝트명 일관성 | `context/project.md` 존재 시 Cover 과제명 일치. 미존재 시 N/A |
| X2 | FN↔Screen 수량 정합성 | `context/fn.md` 존재 시 FN 수와 Screen 수 비교. 미존재 시 N/A |
| X3 | IA 경로 일관성 | `context/ia.md` 존재 시 페이지 경로와 Screen location 비교. 미존재 시 N/A |

### Self-Check 출력

```
═══════════════════════════════════
[Self-Check] plan-sb
═══════════════════════════════════
▶ 입력 검증
| V1 | JSON 존재 + 파싱      | {Pass/Fail} |
| V2 | 스키마 필수 필드       | {Pass/Fail} |
▶ 내부 구조 검증
| 1  | Cover 슬라이드        | {Pass/Fail} |
| 2  | History 슬라이드       | {Pass/Fail/N/A} |
| 3  | Overview 슬라이드      | {Pass/Fail/N/A} |
| 4  | Screen 슬라이드 수     | {Pass/Fail — n/n} |
| 5  | Divider 슬라이드 수    | {Pass/Fail — n/n} |
| 6  | End of Document       | {Pass/Fail} |
| 7  | 메타 테이블 완전성      | {Pass/Fail} |
| 8  | Description 완전성     | {Pass/Fail} |
| 9  | 마커 일치              | {Pass/Fail/N/A} |
| 10 | PDF 출력 정상          | {Pass/Fail} |
| 11 | 정보 소유 경계 준수     | {Pass/Fail} |
| 12 | MSG Case 분리          | {Pass/Fail} |
▶ 교차 검증
| X1 | 프로젝트명 일관성       | {Pass/N/A} |
| X2 | FN↔Screen 수량 정합성  | {Pass/Fail/N/A} |
| X3 | IA 경로 일관성          | {Pass/Fail/N/A} |
▶ PM Devil's Advocate
| DA1 | 범위 — 누락된 화면/프레임  | {PM-OK/WARN/BLOCK — 사유} |
| DA2 | 우선순위 — 핵심 화면 누락  | {PM-OK/WARN/BLOCK — 사유} |
| DA3 | 가정 — 미확인 UI 패턴     | {PM-OK/WARN/BLOCK — 사유} |
───────────────────────────────────
판정: {PASS — 18/18} 또는 {FAIL — n/18}
═══════════════════════════════════
```

## 예시 데이터

참조: [example/v2-1-e2e-test.json](example/v2-1-e2e-test.json)
