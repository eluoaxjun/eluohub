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
- 저장 경로: `output/{프로젝트명}/`
- 생성 커맨드: `node .claude/skills/plan-sb/scripts/generate.js <data-file.json>`

## 16:9 슬라이드 명세 (v2)

- **화면 규격**: 1280×720px 고정 (overflow:hidden)
- **PDF 출력**: landscape, margin:0 (`@page { size: 1280px 720px landscape; }`)
- **슬라이드 구조**: slide-header(36px) + slide-body(flex:1) + slide-footer(24px)
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

## 예시 데이터

참조: [example/v2-1-e2e-test.json](example/v2-1-e2e-test.json)
