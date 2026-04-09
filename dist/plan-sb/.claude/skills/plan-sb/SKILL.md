---
name: plan-sb
description: >
  화면설계서(Screen Blueprint, SB) 자동 생성 스킬. JSON 데이터를 입력받아
  HTML/PDF 화면설계서를 자동 생성합니다.
  트리거: "화면설계서 만들어줘", "SB 생성", "와이어프레임 설계서", "화면 명세서 작성",
  "스크린 설계", "UI 명세서", "화면 설계 해줘", "SB 파일 만들어줘" 등.
  입력: FN 산출물(연계 모드) 또는 프로젝트 요구사항(독립 모드).
  테마 프리셋, v1/v2 스키마 자동 정규화, 다중 프레임 타입
  (Design, Description, MSG Case, Component Guide)을 지원합니다.
argument-hint: "[JSON 데이터 파일경로 또는 프로젝트 요구사항]"
---

## 응답 제약

- **MUST**: 출력은 이 SKILL.md에 정의된 섹션 구조와 순서를 따를 것
- **MUST**: 출력 마지막에 `[Self-Check] PASS / 미충족: {항목}` 마커 포함
- **MUST NOT**: 이 스킬의 산출물 범위 외 파일·코드·타 도메인 수정 금지
  - 허용 범위: 화면설계서(SB) JSON 데이터 생성·수정 + generate.js 실행
  - 예시 위반: plan-sb가 CSS 파일 직접 편집 / FN 명세서 수정 / REQ 내용 변경
- **MUST NOT**: 산출물 외 설명·추천·코멘트 추가 금지
- **MUST NOT**: 선행 산출물 미존재 시 추측 금지 → 사용자에게 확인

**범위 이탈 감지 시 즉시 중단 후 아래 형식으로 리포트**:
```
[범위 이탈 감지] 요청 작업: {작업 내용}
→ 이 스킬(plan-sb) 허용 범위 외 작업입니다.
→ 해당 작업은 {적합한 스킬명} 스킬에서 수행하십시오.
```

---

## 페르소나

시니어 웹 기획자. JSON 데이터를 입력받아 화면 와이어프레임·Description·MSG Case·컴포넌트 가이드를 포함한 HTML/PDF 화면설계서를 생성한다.

## 실행 흐름 요약

| 단계 | 담당 | 설명 |
|------|------|------|
| Step 0 | plan-sb | 입력 감지 (JSON/이미지/FN 스캔) + 참조 사이트 방문(선택) |
| **Step 0.5** | **plan-sb** | **기획 확정 게이트 — 변경 범위·마커 수·표현 모드를 사용자 확인 후 진행** |
| Step 1 | plan-sb | JSON 구성 (자동/대화형) |
| **Step 1.5** | **sb-wf-design** | **wireframe[] UX 강화 (generate.js 실행 전 필수)** |
| **Step 1.7** | **plan-sb** | **와이어프레임 렌더링 방식 결정 (Option A 권장 / Option B 한정)** |
| Step 2 | plan-sb | generate.js → HTML/PDF 생성 |
| Step 3 | plan-sb | Self-Check + PM DA |

> `sb-wf-design` 에이전트는 planning-orchestrator가 자동 호출합니다. SKILL.md 단독 실행 시에도 Step 1 완료 후 반드시 수행합니다.

## 실행 모드

| 모드 | 조건 | 동작 |
|------|------|------|
| **연계 모드** | `output/{프로젝트명}/*/FN_*.md` 존재 | FN 기반 screens 자동 구성, fnRef 매핑, 추적성 유지 |
| **독립 모드** | FN 미존재, 프롬프트/이미지/URL 입력 | 프롬프트 기반 직접 구성, fnRef 생략, ID 역참조 없음 |

**연계 모드 권장**: 파이프라인(QST→REQ→FN→SB)을 거친 연계 실행이 독립 실행보다 **더 정확하고 완결성 높은 산출물**을 생성합니다.
- 연계: FN의 검증기준·AC가 Description에 자동 반영, ID 추적 체인 유지, 누락 화면 0건
- 독립: 프롬프트 해석에 의존하여 기능 누락·범위 불일치 위험. 빠른 프로토타이핑에 적합

**모드 판정 출력**: `[실행 모드] 연계 (FN {n}건) / 독립 (프롬프트 기반)`

## Step 0: 입력 감지

### 현행 사이트 분석 (운영 모드 필수)

운영 수정 요청 시 현행 사이트를 **반드시 먼저 분석**한다.

```bash
node .claude/skills/plan-sb/scripts/visit.js {URL}
```
- 결과: `input/screenshot.png` + `input/structure.json` → AI가 uiImagePath로 바로 참조 가능
- Chromium 미설치 시 자동 설치
- **반드시 프로젝트 루트에서 실행** (scripts 폴더에서 실행 금지)

### output 폴더 구조

```
output/{serviceName}/{YYYYMMDD}/
├── {outputPrefix}.html          ← 전달용
├── {outputPrefix}.pdf           ← 전달용
└── _ref/                        ← 참조 추적 (전달 불필요)
    └── sources.json             ← 어떤 input을 참조했는지 자동 기록
```

`sources.json`은 generate.js가 자동 생성. input/ 폴더의 모든 파일과 각 screen의 uiImagePath 매핑을 기록.

**분석 절차**:
1. visit.js로 스크린샷 + 구조 추출
2. screenshot.png를 Read(Vision)로 열어 **현행 레이아웃 파악** (섹션 구분, 배너 위치, GNB 구조, 카드 배치)
3. structure.json에서 GNB 메뉴명, 헤딩 구조, CTA 위치 확인
4. 수정 대상 영역을 **현행 기준으로 특정** → wireframe에 반영

**출력 마커**: `[현행 분석] {URL} → GNB {n}개 / 섹션 {n}개 / 수정 대상: {영역}`

### PDF/PPT 포맷 참고 (포맷 파일 제공 시)

사용자가 기존 화면설계서 PDF/PPT를 포맷 참고용으로 제공하면 아래를 분석한다.

**PDF 읽기 방법** (우선순위 순):
1. **pdf-capture.js 실행 (권장)** — pdf.js 기반으로 PDF 각 페이지를 고해상도 이미지로 변환. poppler 불필요.
   ```bash
   node scripts/pdf-capture.js "{PDF절대경로}" input/
   ```
   생성된 `input/pdf-page-*.png` → Read(Vision)으로 시각 분석. pdf-info.json에 페이지 수/파일 목록 기록.
2. **Read(pdf, pages)** — `Read(file_path, pages: "1-5")` 로 직접 읽기. poppler 설치 시에만 동작.
3. **Read 직접 실패 + pdf-capture.js 없는 환경** — 사용자에게 pdf-capture.js 설치 안내.

> **금지**: `node -e` 인라인 원라이너로 PDF를 열지 않는다. 반드시 pdf-capture.js를 사용한다.

**MUST NOT**: 사용자에게 PDF 스크린샷을 직접 찍어달라고 요청. 자동화 스킬이므로 도구가 처리해야 함.

**분석 대상**:
1. **공통 장표 구조** — 표지/목차/변경이력/본문/끝 장표 순서 + 포함 여부
2. **헤더/푸터 스타일** — 로고 위치, 프로젝트명 표기, 페이지 번호 형식, 배경색/폰트
3. **메타 테이블 형식** — 작성자/검토자/승인자 배치, 일자 형식, 버전 표기
4. **Description 영역** — 넘버링 방식(①②③ / 1.1.1 / 마커), 들여쓰기 수준, 강조 표기
5. **구성 명칭** — 인터페이스명/화면ID 표기 방식, location 경로 형식
6. **와이어프레임 스타일** — 선 굵기, 배경색, 마커 형태, 이미지 영역 표현

**적용 규칙**:
- 분석 결과를 `theme`, `project` 필드에 반영 (로고 경로, 색상, 회사명 등)
- 장표 순서가 다르면 screens[] 순서를 포맷에 맞춤
- Description 넘버링이 다르면 marker 형식 조정
- **포맷 파일의 콘텐츠(텍스트/이미지)는 참고하지 않음** — 구조·스타일만 추출

**출력 마커**: `[포맷 참고] {파일명} → 장표 {n}종 / 헤더: {스타일} / Description: {형식}`

### 입력 감지

스킬 실행 시 아래 순서로 입력을 감지한다.

| 검색 대상 | 경로 패턴 | 발견 시 | 미발견 시 |
|-----------|----------|---------|----------|
| JSON 데이터 | `data/*.json`, `input/*.json` | 자동 모드 | 대화형 수집 모드 |
| FN 산출물 | `output/{프로젝트명}/*/FN_*.md` | screens 자동 구성 | — |
| 이미지 | `input/*.{png,jpg,jpeg,gif,webp}` | uiImagePath 자동 매핑 + 선택적 Vision 분석 | wireframe 표시 |
| **PDF/PPT 포맷** | `input/*.{pdf,ppt,pptx}` | 포맷 분석 → 테마 JSON 자동 생성 (§ PDF/PPT 포맷 참고 절차) | default.json 테마 사용 |

**PDF/PPT 제공 방식별 처리**:
| 제공 방식 | 처리 |
|----------|------|
| 로컬 파일 (`input/` 내 존재) | Read 도구로 직접 분석 |
| URL 링크 | WebFetch로 다운로드 → `input/`에 저장 → Read로 분석 |

분석 완료 후 → `themes/{프로젝트코드}.json` 자동 생성 → generate.js에 적용

**모드 판정 출력**: `[입력 감지] JSON: {n건/없음} | 이미지: {n건/없음} | FN: {n건/없음} | 포맷: {n건/없음} → {자동/대화형} 모드`

### Step 0.5: 기획 확정 게이트 (JSON 생성 전 필수)

리서치·분석 완료 후, **JSON 구성(Step 1)에 진입하기 전** 아래 항목을 사용자에게 확인받는다.

| 확인 항목 | 설명 | 예시 |
|----------|------|------|
| **변경 범위** | 어떤 영역을 어떻게 변경하는지 | "추천 요금제 영역: 그리드→캐러셀, 필터 추가" |
| **마커 수** | Description 몇 개로 설명할지 | "PC 6개, MO 6개" |
| **화면 표현 모드** | 아래 3가지 중 어느 것인지 | "Mode A (HTML 목업)" |
| **MSG Case 필요 여부** | Empty/Error/Loading 중 해당 항목 | "Empty + Error 필요" |

**금지**: 이 확인 없이 바로 JSON을 생성하면 범위 초과·기능 임의 추가가 발생한다.

**출력 마커**: `[기획 확정] 범위: {요약} | 마커: PC {n}개 MO {n}개 | 모드: {A/B/C} | MSG: {상태 목록}`

### 화면 표현 모드 분기

기획의도를 확인한 후 아래 3가지 모드 중 하나를 결정한다.

| 모드 | 조건 | 좌측 패널 (60%) | 설명 |
|------|------|-----------------|------|
| **Mode A: HTML 목업** | 신규 구축 / 변경 후 모습을 보여줘야 할 때 | AI가 HTML 목업 생성 → Playwright 스크린샷 → uiImagePath | 변경 후 UI를 실제처럼 보여줌. PC/MO 동일 방식 |
| **Mode B: 현행 이미지 + 마커** | 운영 수정 / 현행 이미지 위에 변경 지점만 표시할 때 | 현행 캡쳐 이미지 + 빨간 마커 번호 오버레이 | 변경 전 이미지 기준으로 "여기가 바뀝니다" 표시. Description에 수정 전/후 기재 |
| **Mode C: 현행 이미지 참고 + HTML 목업** | 현행 구조를 참고하되 변경 후를 보여줘야 할 때 | 현행 캡쳐를 분석하여 레이아웃 구조 파악 → 변경 후 HTML 목업 생성 | 현행 이미지는 input/ 참고용, 산출물에는 변경 후 목업 |

**중요 규칙**:
- **현행 캡쳐 = 참고 자료(input/)** — 산출물의 uiImagePath에 현행 캡쳐를 그대로 넣지 않는다 (Mode B 제외)
- Mode A/C에서 HTML 목업 생성 시: 마커 번호를 HTML 내에 CSS absolute로 직접 배치 → overlay 좌표 추정 불필요
- Mode B에서만 uiImagePath에 현행 이미지 사용 + overlay 좌표 지정
- **PC와 MO는 동일 모드를 사용** — PC는 목업이고 MO는 wireframe[] 같은 혼재 금지

### HTML 목업 마커+점선 스타일 (Mode A/C 필수)

HTML 목업에 마커를 배치할 때 아래 CSS를 반드시 포함한다. 넘버링(빨간 원)과 점선 테두리를 함께 표시해야 변경 영역이 명확히 구분된다.

```css
/* 마커 넘버링 (빨간 원) */
.marker { position:absolute; width:28px; height:28px; border-radius:50%;
  background:#e4002b; color:#fff; font-size:13px; font-weight:700;
  display:flex; align-items:center; justify-content:center;
  z-index:10; box-shadow:0 2px 4px rgba(0,0,0,0.3); }

/* 변경 영역 점선 테두리 */
.mark-area { border:2px dashed #e4002b; border-radius:6px;
  position:relative; padding:4px; }
```

**적용 규칙**:
- 변경 대상 요소를 `mark-area` 클래스로 감싼다
- `.marker`는 `mark-area` 안에 CSS absolute로 좌상단(-12px, -12px)에 배치
- MO는 마커 크기를 24px로 축소 (`.marker { width:24px; height:24px; font-size:11px; }`)

**목업 캡쳐 명령**:
```bash
node scripts/mockup-capture.js input/mockup-pc.html input/ --name=recommend-new
node scripts/mockup-capture.js input/mockup-mo.html input/ --mobile-only --name=recommend-new --full-page
```

### 캡쳐 출처 분류 (이미지 입력 시 필수)

이미지 입력 감지 시 아래 기준으로 출처를 분류한다.

| 출처 | 판별 기준 | 콘텐츠 처리 |
|------|----------|------------|
| **타겟 사이트 캡쳐** (운영 수정) | 타겟 URL 도메인과 일치 / 사용자 "현행 사이트" 언급 | 콘텐츠 보존 — 텍스트·상품명·가격 그대로 유지, 수정 지시만 반영 |
| **레퍼런스 사이트 캡쳐** (리뉴얼) | 타겟과 다른 도메인 / 사용자 "참고", "레퍼런스" 언급 | 레이아웃·패턴만 참조 — 텍스트·상품명·가격은 타겟에서 별도 수집 |
| **판별 불가** | 도메인 불명·사용자 언급 없음 | 사용자에게 1회 확인: "이 이미지는 수정 대상 사이트인가요, 참고 사이트인가요?" |

**출력 마커**: `[캡쳐 출처] 타겟/레퍼런스/미분류 → {처리 방식}`

**MUST NOT**: 레퍼런스 캡쳐의 텍스트(상품명, 가격, 카피)를 타겟 산출물에 그대로 사용 금지

### 기존 SB JSON 재사용 분기

`input/*.json`이 기존 SB 산출물인 경우 아래 분기를 따른다.

| 판별 기준 | 처리 방식 |
|-----------|----------|
| `"$schema"` 필드 존재 | v2 → 직접 사용 |
| `"assignment"` 필드 존재 | v1 → `lib/schema.js normalizeV1()` 자동 정규화 |
| 미인식 포맷 | 필수 필드(`project`, `screens[]`)만 추출해 최소 스키마 생성 |

**기존 JSON 수정 모드 (MUST)**:
1. 기존 JSON 발견 시 **전체 재생성 금지** — wireframe[], descriptions[], msgCases[]만 수정·보강
2. 사용자 지시가 "N번 스크린 수정"이면 해당 스크린만 수정, 나머지 screens[] 보존
3. project, history, overview, theme 등 메타데이터는 사용자가 명시적으로 요청한 경우만 수정
4. 수정 전 기존 JSON을 `input/{원본파일명}.backup.json`으로 백업

### 삽입 위치 맥락 자동화

사용자가 "이 부분에 추가", "배너 아래에" 등 위치를 지시할 때 자동으로 맥락을 파악한다.

| 사용자 표현 | 삽입 위치 판단 | JSON 반영 |
|------------|--------------|----------|
| "맨 위에 추가" | header 바로 아래 | wireframe[1] (header 다음) |
| "배너 아래에" | banner 타입 요소 다음 | banner 요소 인덱스 + 1 |
| "푸터 위에" | 마지막 요소 앞 | wireframe[length-1] 앞 |
| "N번 마커 영역에" | descriptions[N] 위치 | marker N에 해당하는 wireframe 요소 |
| "이미지에서 보라색 배너 부분" | Vision 분석으로 pixel 위치 특정 | 해당 영역의 wireframe 요소 |

**출력 마커**: `[삽입 위치] {위치 설명} → wireframe[{인덱스}] 뒤`

## Step 1.7: 와이어프레임 렌더링 방식 결정

**Option A (권장) — wireframe[] 배열 자동 렌더링**

신규 스크린은 무조건 Option A 사용. generate.js가 `wireframe[]`를 읽어 `renderWfElement()`로 자동 렌더링.

- 장점: flex-direction 상속 버그 없음, verify.js 자동 검증 가능
- 방법: `wireframe[]` 배열을 완성하면 별도 HTML 작성 불필요

**Option B (한정) — wfHtml 직접 작성**

18개 레이아웃 패턴 외의 복잡한 커스텀 배치만 사용. ⚠️ deprecated 방향. flex-direction 상속 버그 주의.

> **패턴 1~10, CSS 클래스 목록, Option B HTML 예시**: `references/wireframe-patterns.md` 참조

**wireframe[] 허용 타입** (진실의 원천: `scripts/lib/element-types.js`):
`header` / `gnb` / `nav` / `text` / `input` / `button` / `card` / `image` / `gallery` / `map` / `list` / `banner` / `divider` / `table` / `popup` / `group` / `tag`

**wireframe[] 구성 원칙**:
1. header는 반드시 첫 번째 요소
2. group은 반드시 children 1개 이상 (빈 group 금지)
3. descriptions marker 수와 wireframe marker 수 일치 필수
4. 모든 요소에 label 필수 (빈 label 금지)
5. height 비율은 아래 **「와이어프레임 UI 비율 원칙」** 섹션의 테이블을 따른다. 합계 ≈ 990px (±50px), 초과 시 overflow.

### 와이어프레임 UI 비율 원칙

**wireframe은 좌측 60% 영역에서 독립적으로 "화면처럼 보여야" 한다.** Description(우측 40%)의 텍스트 양에 따라 와이어프레임 비율이 달라지면 안 된다.

**비율 산정 기준**: 실제 화면의 viewport 비율을 990px 높이에 축소 적용

| 실제 화면 영역 | 실제 비율 | 990px 환산 | height 범위 |
|--------------|----------|-----------|------------|
| Header + GNB | 8~10% | 80~100px | 60~100px |
| 히어로/메인배너 | 30~40% | 300~400px | 250~350px |
| 콘텐츠 영역 (카드/리스트) | 35~45% | 350~450px | 300~450px |
| 필터/탭/검색 바 | 4~6% | 40~60px | 40~60px |
| 페이지네이션/CTA | 5~7% | 50~70px | 40~60px |
| 푸터 | 8~10% | 80~100px | 60~100px |

**MUST**: wireframe의 height 비율은 **실제 화면의 시각적 비중**으로 결정한다. Description 항목이 많아도 wireframe의 height를 줄이거나 늘리지 않는다.

**MUST NOT**:
- Description 항목 수에 맞춰 wireframe 요소 수를 조정 (wireframe은 화면 구조, description은 설명)
- height 없이 모든 요소를 auto로 두기 (주요 영역 최소 3개 이상 height 명시)
- 한 요소에 height 500px 이상 (배너라도 350px 이하, 나머지 영역이 눌림)

### 레이아웃 구성 규칙 (화면설계서다운 와이어프레임)

wireframe[]은 **실제 화면 레이아웃을 시각적으로 표현**해야 한다. 텍스트 라벨을 세로로 나열하는 것은 와이어프레임이 아니다.

**핵심 원칙: group으로 구조를 잡아라**

| 하고 싶은 것 | 잘못된 구성 | 올바른 구성 |
|-------------|-----------|-----------|
| 가로 2열 배치 | text 2개 나열 | `group { layout:"horizontal", children: [A, B] }` |
| 카드 그리드 | card 4개 나열 | `group { children: [card, card, card, card] }` (자동 그리드) |
| 헤더 + 본문 + 푸터 | text 3개 나열 | `header` + `group(본문)` + `group(푸터)` |
| 좌우 분할 | text 2개 나열 | `group { layout:"horizontal", children: [좌측group, 우측group] }` |

**group.layout 속성값**:
- `"default"` — 세로 쌓기 (기본)
- `"horizontal"` — 가로 배치, children 균등 분할
- `"card-grid"` — 카드 그리드 (children이 전부 card면 자동 적용)
- `"btn-row"` — 버튼 가로 정렬 (children이 전부 button이면 자동 적용)
- `"popup"` — 팝업 구조 (close/image/nav/footer role 기반)
- `"tags"` — 태그 가로 나열

### 팝업/모달/바텀시트 구성 패턴

**센터 모달 팝업** — `type:"popup"` 사용:
```json
{
  "type": "popup",
  "label": "이벤트 팝업",
  "marker": 1,
  "height": 400,
  "imageLabel": "이벤트 배너 이미지 (480×640px)",
  "actions": ["오늘 하루 안 보기", "닫기"],
  "close": true,
  "nav": false
}
```
렌더러가 자동으로: 어두운 배경 + 가운데 팝업 프레임 + 닫기(✕) 버튼 + 이미지 영역 + 하단 액션 바 생성.

**커스텀 팝업** — `group { layout:"popup" }` + children role 사용:
```json
{
  "type": "group",
  "layout": "popup",
  "marker": 1,
  "height": 450,
  "children": [
    { "type": "button", "role": "close", "label": "✕", "marker": 2 },
    { "type": "image", "role": "image", "label": "프로모션 배너", "marker": 3, "height": 300 },
    { "type": "group", "role": "footer", "marker": 4, "children": [
      { "type": "text", "label": "오늘 하루 안 보기" },
      { "type": "text", "label": "|" },
      { "type": "text", "label": "닫기" }
    ]}
  ]
}
```
role 종류: `close`(절대위치 우상단), `image`(이미지 영역), `nav`(좌우 네비), `footer`(하단 액션)

**바텀시트** — `containerType:"floating-panel"` 또는 group 조합:
```json
{
  "screenType": "design",
  "containerType": "floating-panel",
  "containerSize": { "width": 375, "height": 600 },
  "wireframe": [
    { "type": "text", "label": "━━━ 드래그 핸들", "height": 30, "marker": 1 },
    { "type": "image", "label": "배너 이미지", "height": 400, "marker": 2 },
    { "type": "group", "layout": "horizontal", "height": 48, "marker": 3, "children": [
      { "type": "text", "label": "오늘 하루 안 보기" },
      { "type": "text", "label": "닫기" }
    ]}
  ]
}
```

### 일반 페이지 레이아웃 구성 예시

**상품 목록 페이지**:
```json
[
  { "type": "header", "label": "로고 | GNB 메뉴", "height": 60, "marker": 1 },
  { "type": "banner", "label": "프로모션 배너", "height": 200, "marker": 2 },
  { "type": "group", "layout": "horizontal", "height": 45, "marker": 3, "children": [
    { "type": "nav", "label": "카테고리 필터" },
    { "type": "input", "label": "검색", "placeholder": "상품 검색" }
  ]},
  { "type": "group", "height": 400, "marker": 4, "children": [
    { "type": "card", "label": "상품 카드", "height": 180 },
    { "type": "card", "label": "상품 카드", "height": 180 },
    { "type": "card", "label": "상품 카드", "height": 180 },
    { "type": "card", "label": "상품 카드", "height": 180 }
  ]},
  { "type": "group", "layout": "horizontal", "height": 40, "marker": 5, "children": [
    { "type": "button", "label": "이전" },
    { "type": "text", "label": "1 2 3 4 5" },
    { "type": "button", "label": "다음" }
  ]}
]
```

**MUST NOT — 레이아웃 안티패턴**:
- 모든 요소를 같은 depth에 flat하게 나열 → group으로 논리 영역을 묶어야 함
- text를 나열해서 UI를 표현 → button, input, card, nav 등 적절한 타입 사용
- group 없이 children 속성을 가진 요소가 없음 → 최소 1~2개 group 필수
- height를 지정하지 않고 전부 자동 → 주요 영역에 반드시 height 명시

### 오버레이 좌표 지정 가이드 (uiImagePath + overlay 사용 시)

캡쳐 이미지 위에 마커 오버레이를 배치할 때, **추정 금지 — pixel 측정 필수**.

**좌표계 기준**: overlay의 top/left/width/height는 wireframe-area 컨테이너(슬라이드 좌측 60%, 990px 높이) 내부의 **% 단위**. 이미지가 컨테이너 내에 object-fit:contain으로 축소/배치되므로, 이미지 원본 pixel과 컨테이너 %는 다르다.

**올바른 절차**:
1. 캡쳐 이미지를 Read(Vision)로 열어 **대상 영역의 pixel 좌표**(x, y, width, height) 측정
2. 이미지 전체 크기(예: 1920×3000) 대비 **비율 환산**: `top% = y / 이미지높이 × 100`
3. 이미지가 컨테이너에 축소 배치되는 비율 감안: 컨테이너 가용 높이 990px, 이미지 세로가 컨테이너보다 길면 스크롤/축소됨
4. **넉넉하게 잡고 줄이는 방식** 적용 — 부족→확대 반복은 비효율적
5. 패딩, border-radius, 상하 여백 포함한 **전체 영역**을 감싸야 함 (텍스트만 X)

**금지 패턴**:
- "대충 55% 쯤" 감으로 좌표 지정
- 3~5%씩 조금씩 조정하며 반복 시행착오
- 텍스트 줄 높이만 감싸기 (패딩/여백 누락)
- "오버레이가 보인다" = "맞다"로 판단 (정확히 감쌌는지 실측 필수)

```json
{
  "marker": 1,
  "overlay": { "top": "12%", "left": "5%", "width": "90%", "height": "18%" }
}
```

### Description 오버플로우 → 슬라이드 분할

Description 항목이 많아 한 슬라이드에 담기지 않을 때, **자동으로 다음 슬라이드에 이어서 작성**한다.

**분할 판단 기준**:
- Description 테이블의 렌더링 높이가 슬라이드 body 영역(≈950px)을 초과할 때
- marker 개수가 아닌 **항목별 설명 텍스트 양**이 기준. 3개라도 설명이 길면 넘치고, 10개라도 한 줄이면 안 넘침
- 각 description 항목의 예상 높이: label 1줄(30px) + items 줄당 20px + 여백 15px. 합산 > 900px이면 분할

**분할 방법**:
1. 동일 화면을 2개 screen으로 분할 (interfaceName 동일 + "(1/2)", "(2/2)" 표기)
2. 첫 번째 screen의 마지막 description에 `"continuation": "next"` 추가
3. 두 번째 screen의 첫 번째 description에 `"continuation": "prev"` 추가
4. **넘버링 연속**: 첫 슬라이드 marker 1~5이면 → 두 번째 슬라이드 marker 6~부터 이어감

**JSON 예시**:
```json
// 슬라이드 1/2 — 마지막 description
{ "marker": 5, "label": "요금제 카드", "items": [...], "continuation": "next" }

// 슬라이드 2/2 — 첫 번째 description  
{ "continuation": "prev" }
{ "marker": 6, "label": "필터 영역", "items": [...] }
```

**렌더링 결과**:
- `"next"` → 슬라이드 하단에 "▶ 다음 슬라이드에 계속됨" 표시
- `"prev"` → 슬라이드 상단에 "◀ 이전 슬라이드에서 이어짐" 표시

**wireframe 분할 규칙**:
- 첫 슬라이드: 상단 영역 wireframe (header + 분할 지점까지)
- 두 번째 슬라이드: 나머지 영역 wireframe (분할 지점부터 footer)
- 양쪽 모두 marker 수와 descriptions marker 수 일치 필수

**MUST NOT**: Description이 넘치는데 분할 안 하고 잘리게 두는 것. overflow:hidden으로 잘리면 개발자가 명세를 못 봄.

### 비정상 상태(MSG Case) 정의 기준

design 스크린에 대해 아래 조건 해당 시 msgCase 슬라이드를 별도 생성한다.

| 상태 | 정의 조건 | 예시 |
|------|----------|------|
| Empty | 데이터 0건 가능 영역 | 검색 결과 없음, 장바구니 비어있음, 게시글 없음 |
| Error | 서버/네트워크 오류 가능 | API 타임아웃, 결제 실패, 인증 만료 |
| Loading | 비동기 로딩 영역 | 리스트 로딩 중, 이미지 로딩, 무한스크롤 |
| Permission | 권한 부족 시 | 비로그인 접근, 권한 없는 페이지 |

**적용 규칙**:
- 검색·필터·목록이 있는 화면 → Empty 필수
- 폼 제출이 있는 화면 → Error 필수
- 외부 데이터 의존 영역 → Loading 권장
- 해당 없으면 msgCases: [] (빈 배열)으로 명시적 스킵

**msgCases 필드 스키마** (template.js 렌더러와 일치해야 함):

| 필드 | 필수 | 설명 | 예시 |
|------|------|------|------|
| type | O | 상태 유형 | `Empty` / `Error` / `Loading` / `Process` |
| subType | | 세부 유형 | `긍정` / `부정` |
| no | O | 순번 | `1`, `2`, `3` |
| situation | O | 발생 조건 | `검색 결과가 0건일 때` |
| message | O | 표시 메시지/UI | `조건에 맞는 결과가 없습니다` |
| title | | 팝업 제목 (확장형) | `알림` |
| confirmAction | | 확인 버튼 동작 (확장형) | `목록으로 이동` |
| cancelAction | | 취소 버튼 동작 (확장형) | `닫기` |

> **금지**: `state`, `label`, `description` 필드명 사용 금지. template.js가 인식하지 못해 빈 테이블 렌더링됨.

---

## 정보 소유 경계

| 구분 | 항목 |
|------|------|
| **소유** | 화면 와이어프레임, Description 영역, MSG/Dialog Case, 컴포넌트 가이드, 프레임 구성/배치 |
| **참조** | FN-### ID + 기능명 (기능명만), IA 페이지 경로(location) |
| **금지** | FN 처리 로직·알고리즘 복사, REQ AC 수치 기준 직접 기재 |

JSON 작성 전 반드시 읽을 것: `scripts/template.js` (renderWfElement 등 실제 지원 필드), `scripts/lib/schema.js` (normalizeScreen passthrough 필드)

## JSON 데이터 구조 (v2 스키마)

**project 필수 필드**: `id`, `title`, `serviceName`, `version`, `date`, `writer`, `company.name`, `requestor`

**screens[] 주요 필드**:

| 필드 | 필수 | 설명 |
|------|------|------|
| screenType | O | `design` / `description` / `msgCase` / `component` |
| viewportType | O | Mobile / PC / Tablet |
| interfaceName | O | 인터페이스명 |
| location | O | 메뉴 경로 |
| descriptions[] | O* | design/description 타입 필수 (marker + label + items[]) |
| msgCases[] | O* | msgCase 타입 필수 |
| components[] | O* | component 타입 필수 |
| uiImagePath | - | UI 캡처 이미지 경로. 설정 시 wireframe 렌더링 비활성화 |
| hasDivider | - | `true` + `divider` 객체 **둘 다** 설정 시 Divider 프레임 자동 삽입 |
| wireframe[] | - | 와이어프레임 요소 배열 (Option A 권장) |
| wfHtml | - | 직접 작성 HTML (Option B, 복잡 레이아웃 한정). 존재 시 wireframe[] 보다 우선 |
| pmComments[] | - | PM 코멘트 배열 (marker + type + author + comment). 제안 필요 시에만 생성 |
| containerType | - | `page`(기본) / `chatbot-panel` / `modal` / `floating-panel`. 와이어프레임 렌더링 컨텍스트 변경 |
| containerSize | - | `{ "width": 380, "height": 600 }`. containerType이 page가 아닐 때 패널 크기 지정 |

## containerType (v2.1)

비표준 UI 패러다임을 위한 렌더링 컨텍스트 전환. 기존 element type을 유지하면서 시각 표현만 변경.

| containerType | 렌더링 | 기본 크기 |
|---------------|--------|----------|
| `page` (기본) | 기존 60/40 분할 | 전체 폭 |
| `chatbot-panel` | 좁은 채팅 패널 (둥근 모서리, 그림자) | 380×600px |
| `modal` | 중앙 오버레이 (어두운 배경) | 520×auto |
| `floating-panel` | 우하단 플로팅 패널 | 360×auto |

```json
{
  "screenType": "design",
  "containerType": "chatbot-panel",
  "containerSize": { "width": 380, "height": 600 },
  "wireframe": [...]
}
```

## appearance 속성 (v2.1)

모든 wireframe element에 `appearance` 객체를 추가하여 CSS 속성 직접 지정 가능. **새 element type 추가 없이** 비표준 컴포넌트 표현.

```json
{
  "type": "group",
  "label": "봇 말풍선",
  "appearance": {
    "align": "flex-start",
    "maxWidth": "70%",
    "background": "#F2F3F5",
    "borderRadius": "16px",
    "padding": "12px"
  },
  "children": [
    { "type": "text", "label": "안녕하세요!" }
  ]
}
```

**허용 속성**: align, maxWidth, minWidth, background, borderRadius, padding, margin, border, gap, color, fontSize, fontWeight, textAlign, display, flexDirection, justifyContent, alignItems, flexWrap, opacity, boxShadow, width, height, position, top, right, bottom, left, overflow, zIndex

**v1 → v2 자동 정규화**: `assignment`, `interfaces`, `jiraNo`/`srNo` 필드 → `lib/schema.js normalizeV1()` 자동 처리

## 프레임 타입별 생성 로직

| 프레임 | 생성 조건 |
|--------|----------|
| Cover | 항상 생성 |
| History | `history[]` 1건 이상 |
| Overview | `overview` 데이터 존재 |
| Divider | `hasDivider: true` **+** `divider` 객체 모두 설정된 screen 앞 자동 삽입 |
| Screen | `screens[]` 전수 (screenType별 분기) |
| End of Document | 항상 생성 (마지막) |

## 출력 명세

- HTML: `{outputPrefix}.html` (미설정 시: `{프로젝트명}_SB_{YYYYMMDD}_{버전}.html`)
- 저장: `output/{프로젝트명}/{YYYYMMDD}/`
- 커맨드: `node .claude/skills/plan-sb/scripts/generate.js <data-file.json>`

## 16:9 슬라이드 명세 (v2)

- 화면 규격: 1920×1080px 고정 (overflow:hidden)
- 슬라이드 구조: slide-header(54px) + slide-body(flex:1) + slide-footer(36px)
- Design 레이아웃: 좌 60% wireframe-area + 우 40% description-panel
- MSG Case 자동 분리: `screenType:'design'` + `msgCases` 동시 존재 시 별도 슬라이드 자동 생성 (인라인 혼재 금지)

## pmComments 필드 명세

`screens[].pmComments: object[]` — Description 패널 하단에 PM 코멘트 블록 렌더링

| 필드 | 필수 | 설명 |
|------|------|------|
| marker | O | 연결할 Description marker 번호 |
| type | O | `question` / `suggestion` / `risk` / `reject` |
| author | - | 작성자 (기본값: "PM") |
| comment | O | 코멘트 내용 |

**생성 기준** — 모든 design 슬라이드에 최소 1건 이상 생성한다 (디폴트):

| 조건 | type | 예시 |
|------|------|------|
| 레이아웃 대안이 있을 때 | `suggestion` | "카드 4열 → 3열 변경 시 모바일 대응 유리" |
| 콘텐츠 확인이 필요할 때 | `question` | "배너 슬라이드 자동 롤링 속도 확인 필요" |
| UX 리스크 감지 시 | `risk` | "GNB 메뉴 8개 초과 — 인지 부하 우려" |
| 변경 의도가 불명확할 때 | `question` | "현행 대비 변경 범위 확인 필요" |
| 구현 난이도가 높을 때 | `risk` | "캐러셀 무한 루프 구현 시 접근성 이슈 예상" |

> **필수**: design 슬라이드에 pmComments가 빈 배열이면 Self-Check WARN. 기획자로서 수정 방향에 대한 의견·질문·리스크를 반드시 1건 이상 기재한다.

## fnRef 필드 명세

`descriptions[].fnRef: string[]` — FN 코드 배열

```json
{ "marker": 2, "label": "쿠폰 입력 영역", "fnRef": ["FN-042", "FN-043"], "items": [{ "text": "쿠폰 코드 입력 필드 + [적용] 버튼" }] }
```

- 렌더링: Description 패널 하단 `[FN 참조]` 섹션 — 기능명만 표시. 처리 로직·AC 복사 금지

## Description 역할 재정의

| 항목 | 연계 모드 (context/fn.md 존재) | 독립 모드 (fn.md 없음) |
|------|-------------------------------|----------------------|
| UI 배치/레이아웃 설명 | 허용 | 허용 |
| 기능 동작 의도 | **금지** (fnRef로 위임) | **허용** |
| 처리 로직·AC 수치 기준 | 금지 | 금지 |

연계 모드: fnRef 빈 배열이면 verify.js WARN 발생 / 독립 모드: fnRef:[] → fnRef 섹션 생략

## 품질 기준

| 항목 | 기준 |
|------|------|
| 슬라이드 수 | screens[] 수와 일치 |
| 마커 일치 | wireframe[].marker ↔ descriptions[].marker 매핑 |
| 정보 소유 경계 | FN 로직·REQ AC 직접 복사 0건 |
| overflow | verify.js WARN 0건 |
| MSG 인라인 | verify.js ERROR 0건 |

## 금지 패턴

- `*_FN_*.md` 패턴으로 FN 스캔 금지 → `output/{프로젝트명}/*/FN_*.md` 사용
- FN 처리 로직·알고리즘·AC 수치 기준을 Description에 복사 금지
- `[미확인]`, `[미정]` 항목 잔존 금지
- design 슬라이드 내 msgCases 인라인 혼재 금지
- 레퍼런스 캡쳐의 텍스트·상품명·가격을 타겟 산출물에 복사 금지
- 레퍼런스에서 추출 허용: 섹션 구조, 카드 배치, GNB 패턴, 컬러 톤, CTA 배치
- 레퍼런스에서 추출 금지: 브랜드명, 제품명, 가격, 마케팅 카피, 이벤트명
- 타겟 콘텐츠 미확보 시: `[타겟 콘텐츠 필요: {영역}]` 플레이스홀더 사용 (임의 생성 금지)

## Self-Check

산출물 생성 완료 후 자동 수행합니다.

| ID | 항목 | 판정 기준 |
|----|------|----------|
| V1 | JSON 파일 존재 + 파싱 가능 | Fail 시 생성 중단 |
| V2 | 스키마 필수 필드 완전성 | `project` + `screens[]` 존재 |
| 1 | Cover 슬라이드 | 로고·과제명·버전 표시 |
| 2 | History 슬라이드 | history[] 1건 이상 시 |
| 3 | Overview 슬라이드 | overview 데이터 존재 시 |
| 4 | Screen 슬라이드 수 = screens[] 수 | 불일치 시 Fail |
| 5 | Divider 슬라이드 수 | hasDivider+divider 수와 일치 |
| 6 | End of Document | 마지막 슬라이드 확인 |
| 7 | 메타 테이블 완전성 | Viewport·Interface·Location 표시 |
| 8 | Description 완전성 | marker + label 존재 |
| 9 | 와이어프레임 마커 일치 | wireframe[].marker ↔ descriptions[].marker |
| 10 | 이미지 참조 유효성 | uiImagePath 지정 시 파일 존재·5KB 이상·확장자 확인 |
| 11 | PDF 출력 정상 | 1920×1080, 페이지 구분 |
| 12 | 정보 소유 경계 준수 | FN 처리 로직·REQ AC 복사 0건 |
| 13 | MSG Case 분리 | verify.js ERROR 0건 |
| 14 | Description 오버플로우 | 단일 슬라이드 descriptions 7개 이상이면 continuation 분할 필수. splitDescriptions() 자동 적용 확인 |
| 15 | 포맷 참고 반영 | PDF/PPT 포맷 제공 시 테마 JSON 생성 여부. 미생성 시 Fail |
| 16 | 기획 확정 게이트 | Step 0.5 출력 마커(`[기획 확정]`) 존재 여부. 미존재 시 WARN |
| 17 | 화면 표현 모드 일관성 | PC/MO가 동일 모드(A/B/C)인지 확인. 혼재 시 Fail |
| 18 | 현행 이미지 활용 | Mode A/C에서 현행 캡쳐가 uiImagePath에 직접 사용되면 Fail. Mode B만 허용 |
| 19 | pmComments 필수 | design 슬라이드에 pmComments 1건 이상. 빈 배열이면 WARN |
| X1 | 프로젝트명 일관성 | context/project.md 존재 시 Cover 과제명 일치 |
| X2 | FN↔Screen 수량 정합성 | context/fn.md 존재 시 |
| X3 | IA 경로 일관성 | context/ia.md 존재 시 |
| DA1 | 범위 — 누락된 화면/프레임 | PM-OK/WARN/BLOCK |
| DA2 | 우선순위 — 핵심 화면 누락 | PM-OK/WARN/BLOCK |
| DA3 | 가정 — 미확인 UI 패턴 | PM-OK/WARN/BLOCK |

```
═══════════════════════════════════
[Self-Check] plan-sb
═══════════════════════════════════
▶ 입력 검증    V1:{Pass/Fail} V2:{Pass/Fail}
▶ 내부 구조    1~13:{각 Pass/Fail/N/A}
▶ 교차 검증    X1~X3:{각 Pass/Fail/N/A}
▶ PM DA       DA1~DA3:{각 PM-OK/WARN/BLOCK}
───────────────────────────────────
판정: {PASS — n/n} 또는 {FAIL — n/n, 미충족: {항목}}
═══════════════════════════════════
```

## 합리화 방지 (Rationalizations + Red Flags)

> 전역 anti-rationalization.md의 스킬별 구체화. 생성 중 아래 패턴 감지 시 즉시 재검토.

### Rationalizations (변명 vs 반박)

| # | 변명 | 반박 | 대응 |
|---|------|------|------|
| R1 | "wireframe은 대충 그리면 된다" | 와이어프레임 부정확 → 디자인/퍼블 전체 재작업. 화면설계서는 구현의 기준선 | wireframe[] 구성 원칙 5가지 준수 + verify.js 검증 |
| R2 | "Description은 간단히 적으면 된다" | 기능 명세 부족 → 개발자가 임의 구현. 특히 상태 변화/조건 분기 누락 | marker별 items[] 상세 기재. 조건/상태/예외 포함 |
| R3 | "MSG Case는 나중에 정의한다" | 비정상 상태(Empty/Error/Loading) 미정의 = 사용자 경험 구멍 | 검색/폼/외부 데이터 화면 → MSG Case 필수 |
| R4 | "기존 JSON을 전체 재생성하는 게 빠르다" | 전체 재생성 = 이전 수정 내용 유실. 기존 JSON 수정 모드 적용 필수 | 해당 screen만 수정, 나머지 보존 |

### Red Flags (즉시 중단 신호)

| # | 징후 | 의미 | 조치 |
|---|------|------|------|
| RF1 | wireframe[] 빈 요소 또는 빈 label 존재 | 렌더링 시 빈 블록. 구현 불가 | 모든 요소에 label 필수 |
| RF2 | descriptions marker 수 ≠ wireframe marker 수 | Self-Check #9 Fail. 마커 불일치 | marker 수 1:1 대조 |
| RF3 | 모든 화면에 msgCases: [] | 비정상 상태 전수 스킵 | 검색/폼/목록 화면 최소 1개 MSG Case |
| RF4 | Option B(wfHtml) 남용 | deprecated 방향. flex-direction 상속 버그 위험 | Option A(wireframe[]) 우선 |
| RF5 | Description 테이블 높이 > 900px 예상인데 continuation 없음 | Description 잘림. PDF에서 명세 누락 | 슬라이드 분할 + continuation 필수 |
| RF6 | PDF/PPT 포맷 제공했는데 테마 미생성 | 입력 감지에서 포맷 파일 스킵. 스타일 미반영 | 입력 감지 → 포맷 분석 → 테마 생성 |

## Gotchas (실전 반복 실패 메모)

- **레퍼런스 없이 코드 패치 금지**: 비짓강남에서 template.js 1700줄을 인라인 패치 5차례 → 폐기 수준. **코드 수정 전 레퍼런스/벤치마킹 먼저**.
- **page 전용 엔진에 비표준 UI 강제 금지**: containerType(chatbot-panel) 같은 비표준 타입을 page 엔진에 억지로 끼우면 렌더링 깨짐. 엔진 한계 확인 후 대안 경로(직접 HTML 생성) 검토.
- **렌더링 결과 브라우저 실측 필수**: verify 축소판과 실제 브라우저 출력 괴리. 반드시 브라우저에서 확인.

## 참조

- wireframe 패턴 1~10 + CSS 클래스 + Option B HTML 예시: `references/wireframe-patterns.md`
- 예시 데이터: `example/v2-1-e2e-test.json`
- element 타입 단일 소스: `scripts/lib/element-types.js`
