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
| Step 1 | plan-sb | JSON 구성 (자동/대화형) |
| **Step 1.5** | **sb-wf-design** | **wireframe[] UX 강화 (generate.js 실행 전 필수)** |
| **Step 1.7** | **plan-sb** | **와이어프레임 렌더링 방식 결정 (Option A 권장 / Option B 한정)** |
| Step 2 | plan-sb | generate.js → HTML/PDF 생성 |
| Step 3 | plan-sb | Self-Check + PM DA |

> `sb-wf-design` 에이전트는 planning-orchestrator가 자동 호출합니다. SKILL.md 단독 실행 시에도 Step 1 완료 후 반드시 수행합니다.

## Step 0: 입력 감지

현행 사이트 분석이 필요하면 visit.js를 사용합니다:
```bash
node .claude/skills/plan-sb/scripts/visit.js {URL} [output-dir]
```
- 결과: screenshot.png + structure.json (GNB·헤딩·CTA·섹션 수)
- Chromium 미설치 시 자동 설치

스킬 실행 시 아래 순서로 입력을 감지한다.

| 검색 대상 | 경로 패턴 | 발견 시 | 미발견 시 |
|-----------|----------|---------|----------|
| JSON 데이터 | `data/*.json`, `input/*.json` | 자동 모드 | 대화형 수집 모드 |
| FN 산출물 | `output/{프로젝트명}/*/FN_*.md` | screens 자동 구성 | — |
| 이미지 | `input/*.{png,jpg,jpeg,gif,webp}` | uiImagePath 자동 매핑 + 선택적 Vision 분석 | wireframe 표시 |

**모드 판정 출력**: `[입력 감지] JSON: {n건/없음} | 이미지: {n건/없음} | FN: {n건/없음} → {자동/대화형} 모드`

### 캡쳐 출처 분류 (이미지 입력 시 필수)

이미지 입력 감지 시 아래 기준으로 출처를 분류한다.

| 출처 | 판별 기준 | 콘텐츠 처리 |
|------|----------|------------|
| **타겟 사이트 캡쳐** (운영 수정) | 타겟 URL 도메인과 일치 / 사용자 "현행 사이트" 언급 | 콘텐츠 보존 — 텍스트·상품명·가격 그대로 유지, 수정 지시만 반영 |
| **레퍼런스 사이트 캡쳐** (리뉴얼) | 타겟과 다른 도메인 / 사용자 "참고", "레퍼런스" 언급 | 레이아웃·패턴만 참조 — 텍스트·상품명·가격은 타겟에서 별도 수집 |
| **판별 불가** | 도메인 불명·사용자 언급 없음 | 사용자에게 1회 확인: "이 이미지는 수정 대상 사이트인가요, 참고 사이트인가요?" |

**출력 마커**: `[캡쳐 출처] 타겟/레퍼런스/미분류 → {처리 방식}`

**MUST NOT**: 레퍼런스 캡쳐의 텍스트(상품명, 가격, 카피)를 타겟 산출물에 그대로 사용 금지

**기존 SB JSON 포맷 유지 모드**: `input/*.json`이 기존 SB 산출물인 경우 wireframe[], descriptions[], msgCases[]만 수정·보강.

| 판별 기준 | 처리 방식 |
|-----------|----------|
| `"$schema"` 필드 존재 | v2 → 직접 사용 |
| `"assignment"` 필드 존재 | v1 → `lib/schema.js normalizeV1()` 자동 정규화 |
| 미인식 포맷 | 필수 필드(`project`, `screens[]`)만 추출해 최소 스키마 생성 |

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
5. height는 슬라이드 본문 990px(= 1080 - 54 header - 36 footer) 기준 비율 배분:
   - 전체 요소 height 합계 ≈ 990px (±50px 허용). 합계 초과 시 overflow 발생
   - header/gnb: 50~70px (5~7%)
   - 히어로/배너: 250~350px (25~35%) — 500px 이상 금지
   - 카드 그리드/리스트: 200~350px (20~35%)
   - 필터/탭 바: 40~60px (4~6%)
   - 푸터: 60~100px (6~10%)
   - 캡쳐 이미지 기반 시: Vision 분석으로 각 섹션 비율 추정 → 990px에 비례 배분

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
| pmComments[] | - | PM 코멘트 배열 (marker + type + author + comment). 제안 필요 시에만 생성 |
| hasDivider | - | `true` + `divider` 객체 **둘 다** 설정 시 Divider 프레임 자동 삽입 |
| wireframe[] | - | 와이어프레임 요소 배열 (Option A 권장) |
| wfHtml | - | 직접 작성 HTML (Option B, 복잡 레이아웃 한정). 존재 시 wireframe[] 보다 우선 |

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

**생성 기준** — 제안할 것이 있을 때만 생성, 무조건 채우지 않는다:

| 조건 | type | 예시 |
|------|------|------|
| 레이아웃 대안이 있을 때 | `suggestion` | "카드 4열 → 3열 변경 시 모바일 대응 유리" |
| 콘텐츠 확인이 필요할 때 | `question` | "배너 슬라이드 자동 롤링 속도 확인 필요" |
| UX 리스크 감지 시 | `risk` | "GNB 메뉴 8개 초과 — 인지 부하 우려" |
| 해당 없음 | — | pmComments 생략 (빈 배열 불필요) |

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

## 참조

- wireframe 패턴 1~10 + CSS 클래스 + Option B HTML 예시: `references/wireframe-patterns.md`
- 예시 데이터: `example/v2-1-e2e-test.json`
- element 타입 단일 소스: `scripts/lib/element-types.js`
