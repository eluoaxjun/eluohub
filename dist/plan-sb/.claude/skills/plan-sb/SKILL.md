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

## 실행 흐름 요약

| 단계 | 담당 | 설명 |
|------|------|------|
| Step 0 | plan-sb | 입력 감지 (JSON/이미지/FN 스캔) |
| Step 1 | plan-sb | JSON 구성 (자동/대화형) |
| **Step 1.5** | **sb-wf-design** | **wireframe[] UX 강화 (generate.js 실행 전 필수)** |
| Step 2 | plan-sb | generate.js → HTML/PDF 생성 |
| Step 3 | plan-sb | Self-Check + PM DA |

> `sb-wf-design` 에이전트는 planning-orchestrator가 자동 호출합니다. SKILL.md 단독 실행 시에도 Step 1 완료 후 반드시 수행합니다.

## Step 0: 입력 감지

스킬 실행 시 아래 순서로 입력을 감지한다.

### 감지 우선순위

| 검색 대상 | 경로 패턴 | 발견 시 | 미발견 시 |
|-----------|----------|---------|----------|
| JSON 데이터 | `data/*.json`, `input/*.json` | 자동 모드 | 대화형 수집 모드 |
| FN 산출물 | `output/{프로젝트명}/*/FN_*.md` | screens 자동 구성 | — |
| 이미지 | `input/*.{png,jpg,jpeg,gif,webp}`, `input/pages/*.{png,jpg,jpeg}` | uiImagePath 자동 매핑 + 선택적 Vision 분석 | wireframe 표시 |

**모드 판정 출력**:
```
[입력 감지] JSON: {n건/없음} | 이미지: {n건/없음} | FN: {n건/없음} → {자동/대화형} 모드
```

### 이미지 자동 매핑 전략

이미지 발견 시 아래 순서로 screen에 매핑한다:

1. **파일명 기반 매핑**: 파일명과 `interfaceName` / `location`의 유사도가 높으면 해당 screen에 우선 매핑
   예) `login.png` → interfaceName "로그인" screen, `main_home.png` → "메인/홈" screen
2. **순서 기반 매핑**: 파일명 기반 실패 시, 파일 알파벳순 정렬과 screens[] 순서를 1:1 매핑
3. **Claude Vision 분석 (선택)**: `Read` 도구로 이미지를 읽어 레이아웃 구조를 파악하고 wireframe[] 초안을 자동 도출
   - 분석 항목: 헤더·GNB 유무, 섹션 구분, CTA 버튼 위치, 입력폼 영역, 이미지 블록
   - 분석 결과를 wireframe[] 초안으로 작성 → 사용자 확인 후 확정

매핑된 이미지는 해당 screen의 `uiImagePath` 필드에 `../../../input/{파일명}` 형태로 설정한다.

### 기존 SB JSON 포맷 유지 모드

`input/*.json` 또는 `data/*.json`이 기존 SB 산출물인 경우:
- screens[]의 기존 구조(interfaceName, location, viewportType, screenType)는 **변경하지 않음**
- wireframe[], descriptions[], msgCases[] 만 수정·보강
- 포맷 자동 판별:

| 판별 기준 | 처리 방식 |
|-----------|----------|
| `"$schema"` 필드 존재 | v2 → 직접 사용 |
| `"assignment"` 필드 존재 | v1 → `lib/schema.js normalizeV1()` 자동 정규화 |
| 미인식 포맷 | 필수 필드(`project`, `screens[]`)만 추출해 최소 스키마 생성 |

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
| uiImagePath | - | UI 캡처 이미지 경로. 설정 시 해당 화면은 이미지 표시 모드로 전환 (wireframe/wfElements 렌더링 비활성화) |
| hasDivider | - | `true` + `divider` 객체 **둘 다** 설정 시 앞에 Divider 프레임 자동 삽입. `hasDivider: true` 단독으로는 생성되지 않음 |
| wireframe[] | - | 와이어프레임 요소 배열 |

### wireframe[] 요소 타입 및 구성 패턴

허용 타입: `header` / `nav` / `gnb` / `text` / `input` / `button` / `card` / `image` / `list` / `banner` / `table` / `group` / `divider`

> **핵심 원칙**: 단순 타입 나열 금지. children 구조로 실제 UI 레이아웃을 표현한다.

#### 패턴 1 — GNB (글로벌 네비게이션)

```json
{
  "type": "header",
  "label": "GNB",
  "marker": 1,
  "height": 60,
  "children": [
    { "type": "text", "label": "서비스 로고" },
    { "type": "nav", "label": "메인 메뉴", "items": ["메뉴1", "메뉴2", "메뉴3", "마이페이지"] },
    { "type": "input", "label": "통합 검색창" }
  ]
}
```
- children의 text → 좌측 로고, nav → 중앙 메뉴, input → 우측 검색창으로 자동 배치
- nav.items[]는 탭 형태로 렌더링 (첫 번째 항목이 활성 탭)

#### 패턴 2 — 카테고리 탭 / 필터 버튼 행

```json
{
  "type": "group",
  "label": "카테고리 탭",
  "marker": 2,
  "height": 50,
  "children": [
    { "type": "button", "label": "전체", "variant": "primary" },
    { "type": "button", "label": "기획", "variant": "outline" },
    { "type": "button", "label": "디자인", "variant": "outline" },
    { "type": "button", "label": "개발", "variant": "outline" }
  ]
}
```
- children이 모두 button → 자동으로 가로 flex 배치 (필터 바)
- variant: `primary`(선택됨) / `outline`(미선택) 구분

#### 패턴 3 — 카드 그리드

```json
{
  "type": "group",
  "label": "콘텐츠 카드 그리드",
  "marker": 3,
  "height": 400,
  "children": [
    {
      "type": "card",
      "label": "카드 제목",
      "children": [
        { "type": "image", "label": "썸네일" },
        { "type": "text", "label": "카드 설명" },
        { "type": "button", "label": "자세히 보기", "variant": "outline" }
      ]
    },
    { "type": "card", "label": "카드 제목" },
    { "type": "card", "label": "카드 제목" }
  ]
}
```
- children이 모두 card → 자동으로 CSS grid 배치 (3열 기본, 2개=2열, 4개이상=4열)
- card.children에 image(썸네일) + text(설명) + button(CTA) 구성 권장

#### 패턴 4 — 입력 폼

```json
{
  "type": "group",
  "label": "로그인 폼",
  "marker": 2,
  "height": 200,
  "children": [
    { "type": "input", "label": "이메일 입력" },
    { "type": "input", "label": "비밀번호 입력" },
    { "type": "button", "label": "로그인", "variant": "primary" },
    { "type": "text", "label": "비밀번호 찾기 | 회원가입" }
  ]
}
```

#### 패턴 5 — 히어로 배너

```json
{
  "type": "banner",
  "label": "메인 히어로 배너",
  "marker": 2,
  "height": 300
}
```

#### 패턴 6 — 리스트형 목록

```json
{
  "type": "list",
  "label": "공지사항 목록",
  "marker": 3,
  "items": ["공지사항 제목 1", "공지사항 제목 2", "공지사항 제목 3"]
}
```

#### 패턴 7 — 테이블

```json
{
  "type": "table",
  "label": "주문 목록",
  "marker": 4,
  "headers": ["주문번호", "상품명", "금액", "상태"],
  "rows": [
    ["#001", "상품명", "50,000원", "배송중"]
  ]
}
```

#### wireframe[] 구성 원칙

1. **header는 반드시 첫 번째 요소**로 배치
2. **group은 반드시 children 1개 이상** 포함 (빈 group 금지)
3. **descriptions marker 수와 wireframe marker 수 일치** 필수
4. **모든 요소에 label 필수** (빈 label 금지)
5. **height는 실제 UI 비율을 반영**: header 50~70px, 필터 바 45~60px, 카드 그리드 300~500px

### v1 → v2 자동 정규화
`assignment`, `interfaces`, `jiraNo`/`srNo` 필드는 자동으로 v2로 변환. 상세: `lib/schema.js normalizeV1()`

## 프레임 타입별 생성 로직

| 프레임 | 생성 조건 |
|--------|----------|
| Cover | 항상 생성 (표지) |
| History | `history[]` 1건 이상 |
| Overview | `overview` 데이터 존재 |
| Divider | `hasDivider: true` **+** `divider` 객체가 모두 설정된 screen 앞 자동 삽입 |
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
| 5 | Divider 슬라이드 수 = `hasDivider:true` + `divider` 객체 모두 설정된 수 | 일치하지 않으면 Fail |
| 6 | End of Document 존재 | 마지막 슬라이드 확인 |
| 7 | 메타 테이블 완전성 | Viewport·Interface·Location 표시 |
| 8 | Description 완전성 | design/description 타입: marker + label 존재 |
| 9 | 와이어프레임 마커 일치 | `wireframe[].marker` ↔ `descriptions[].marker` 매핑 |
| 10 | 이미지 참조 유효성 | `uiImagePath` 지정 시: ① 파일 존재, ② 5KB 이상, ③ 이미지 확장자 확인. 미달 시 WARN |
| 11 | PDF 출력 정상 | 1920×1080, 슬라이드 간 페이지 구분 |
| 12 | 정보 소유 경계 준수 | FN 처리 로직·REQ AC 직접 복사 0건 |
| 13 | MSG Case 분리 | design 슬라이드 내 msgCases 인라인 혼재 0건 (verify.js ERROR 0건) |

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
| 10 | 이미지 참조 유효성      | {Pass/Fail/N/A} |
| 11 | PDF 출력 정상          | {Pass/Fail} |
| 12 | 정보 소유 경계 준수     | {Pass/Fail} |
| 13 | MSG Case 분리          | {Pass/Fail} |
▶ 교차 검증
| X1 | 프로젝트명 일관성       | {Pass/N/A} |
| X2 | FN↔Screen 수량 정합성  | {Pass/Fail/N/A} |
| X3 | IA 경로 일관성          | {Pass/Fail/N/A} |
▶ PM Devil's Advocate
| DA1 | 범위 — 누락된 화면/프레임  | {PM-OK/WARN/BLOCK — 사유} |
| DA2 | 우선순위 — 핵심 화면 누락  | {PM-OK/WARN/BLOCK — 사유} |
| DA3 | 가정 — 미확인 UI 패턴     | {PM-OK/WARN/BLOCK — 사유} |
───────────────────────────────────
판정: {PASS — 19/19} 또는 {FAIL — n/19}
═══════════════════════════════════
```

## 예시 데이터

참조: [example/v2-1-e2e-test.json](example/v2-1-e2e-test.json)
