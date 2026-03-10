# 전체 스킬 동작 시나리오 정리

> 기준: dist-v2/ 배포 패키지 (plan-qst, plan-req, plan-fn, plan-ia, plan-wbs, plan-sb) — v2 아키텍처 기준
> 최종 업데이트: 2026-03-06 (v2 재설계 반영)

---

## 0. 공통 아키텍처

### 모드 자동 감지 원칙

모든 스킬은 Step 0에서 `output/{프로젝트명}/` 디렉토리를 스캔하여 **연계 모드 / 독립 모드**를 자동 판정합니다.

```
[입력 감지] {선행 산출물 목록} → {연계 / 독립} 모드
[전방위 스캔] {각 산출물 건수}
```

### context/ SSOT 데이터 흐름 (v2)

각 스킬은 완료 시 `output/{프로젝트명}/context/{skill}.md`를 **overwrite** 방식으로 갱신합니다.
`_context.md` append 방식(v1)은 폐기됩니다.

```
output/{프로젝트명}/
├── context/              ← SSOT (v2)
│   ├── qst.md            ← QST 완료 후 overwrite
│   ├── req.md            ← REQ 완료 후 overwrite
│   ├── fn.md             ← FN 완료 후 overwrite
│   ├── ia.md             ← IA 완료 후 overwrite
│   └── wbs.md            ← WBS 완료 후 overwrite
└── {YYYYMMDD}/
    ├── {SKILL}_{code}_{v}.md
    ├── {SKILL}_{code}_{v}.html   ← 신규 (render.js 생성)
    └── {SKILL}_{code}_{v}.pdf    ← 신규 (render.js 생성)
```

**v1 → v2 마이그레이션**: `_context.md` 존재 시 마이그레이션 메시지 출력 후 `context/` 기준으로 전환.

```
QST → context/qst.md [업종, 목표, 핵심 질의 요약]
REQ → context/req.md [FR 수, NFR 수, 우선순위 분포, 핵심 FR]
FN  → context/fn.md  [기능 수, 복잡도 분포, 핵심 기능]
IA  → context/ia.md  [페이지 수, Depth, 네비게이션 타입]
WBS → context/wbs.md [총 작업 수, 총 기간, 크리티컬 패스]
SB  → (context 미생성 — JSON 입력 기반)
```

### Self-Check 공통 구조

| 레이어 | 항목 | 설명 |
|--------|------|------|
| 입력 검증 (V#) | 필수 파일/필드 존재 | Fail 시 생성 중단 |
| 내부 구조 검증 | 산출물 품질 기준 | Pass/Fail |
| 교차 검증 (X#) | context/{skill}.md 일관성 | context/ 미존재 시 N/A |
| PM Devil's Advocate | DA1(범위)/DA2(우선순위)/DA3(가정) | PM-OK/WARN/BLOCK |

### 폴더 보장 (Step 0-F, 공통)

```
PROJECT.md 위치 → 프로젝트명 결정
output/{프로젝트명}/{YYYYMMDD}/ 자동 생성
output/{프로젝트명}/context/ 자동 생성 (v2 신규)
[폴더 보장] output/{프로젝트명}/{YYYYMMDD}/: {존재/생성}
```

### MD → HTML → PDF 렌더링 (v2 신규)

`plan-qst/req/fn/ia/wbs` 5개 스킬에 `scripts/render.js` 추가.

```
MD 저장 완료 후:
  node .claude/skills/{skill}/scripts/render.js output/{project}/{date}/{file}.md
출력: .html + .pdf (MD와 동일 디렉토리)
실패 시: MD는 유효 — HTML/PDF 생성 실패를 사용자에게 알리고 계속 진행
```

- marked 라이브러리로 MD → HTML (A4 portrait, TOC 자동생성, H2마다 page-break)
- Playwright PDF 출력 (format: A4, printBackground: true)
- 의존성 auto-install 패턴 (첫 실행 시 자동 설치)

### detector.mjs STRONG+WEAK 이중 패턴 (v2)

모든 스킬: 공식 키워드(STRONG) + 자연어 변형(WEAK) 동시 감지.

| 스킬 | WEAK 예시 |
|------|-----------|
| qst | "고객한테 뭘 물어봐야", "확인할 것" |
| req | "뭘 만들어야 해", "필요한 기능이 뭐야" |
| fn | "어떤 기능이 필요해", "기능 뭐가 필요" |
| ia | "메뉴 구성 잡아줘", "사이트 구조 어떻게" |
| wbs | "일정 어떻게", "얼마나 걸려" |
| sb | "화면 그려줘", "UI 설계해줘" |

---

## 1. plan-qst — 고객질의서

### 트리거

"고객질의서", "질의서", "QST", "고객에게 물어볼", "인터뷰 질문" 등

### Step 0: 입력 감지

| 스캔 대상 | 경로 | 역할 |
|-----------|------|------|
| 기확정 QST | `output/{프로젝트명}/*/QST_*.md` | 이미 완료 → 갱신 여부 확인 |
| REQ | `output/{프로젝트명}/*/REQ_*.md` | 보조 참조 |
| _context | `output/{프로젝트명}/_context.md` | 업종, 목표 로드 |

**기확정 QST 발견 시**: 기존 파일 갱신 vs 신규 작성 사용자 확인
**미발견 시**: 신규 QST 작성

### 주요 흐름

```
Step 0: 기확정 스캔 → 전방위 스캔
  ↓
Step 1: 프로젝트 컨텍스트 파악
  - PROJECT.md 읽기
  - input/ 참조 자료 탐색
  - _context.md 업종/목표 로드
  ↓
Step 2: 질의 설계 (5개 영역)
  - 비즈니스 목표 / KPI
  - 서비스 범위 / 주요 기능
  - 대상 사용자 / 기기
  - 일정 / 예산 / 팀 구성
  - 레퍼런스 / 제약사항
  ↓
Step 3: Self-Check (V1: 질의 수 ≥15 / V2: 5개 영역 모두 커버)
  ↓
Step 4: 산출물 저장 + _context.md append
  파일명: QST_{프로젝트코드}_{버전}.md
```

### Self-Check 항목 (총 V2 + 내부 n + X2 + DA3)

| # | 항목 | 판정 기준 |
|---|------|----------|
| V1 | 질의 수 ≥ 15건 | 미달 시 보강 |
| V2 | 5개 영역 모두 커버 | 누락 영역 없음 |
| 내부 | 선택형(객관식) 위주 | 개방형 단독 질의 최소화 |
| X1 | 업종 일관성 | _context.md 업종과 일치 |
| DA1~3 | PM 3챌린지 | 범위/우선순위/가정 |

### _context.md 기록

```markdown
## QST
- 생성일: {YYYY-MM-DD}
- 업종: {업종}
- 핵심 목표: {목표 요약}
- 질의 수: {n}건
```

---

## 2. plan-req — 요구사항정의서

### 트리거

"요구사항", "REQ", "스펙 정리", "기능 요구사항" 등

### Step 0: 모드 감지

| 선행 산출물 | 경로 | 연계 모드 |
|------------|------|----------|
| QST | `output/{프로젝트명}/*/QST_*.md` | QST 답변 기반 FR 도출 |
| _context | `output/{프로젝트명}/_context.md` | 업종, 목표 로드 |

**연계 모드**: QST 답변 파싱 → FR/NFR 자동 도출
**독립 모드**: 프롬프트 텍스트에서 요구사항 직접 추출 (FR 역참조 생략 불가, 자체 ID 부여)

### 주요 흐름

```
Step 0: QST 스캔 → 연계/독립 모드 판정
  ↓
Step 1: SOW 범위 경계 설정
  - IN SCOPE / OUT OF SCOPE 명시
  - 운영 모드: 변경 전/후 비교
  ↓
Step 2: FR (기능 요구사항) 작성
  FR-### | 우선순위(High/Mid/Low) | 인수조건(AC) | EARS 형식
  - "The system shall..."
  - "When {조건}, the system shall {동작}"
  - 금지 표현: "쉽게", "빠르게", "효율적으로"
  ↓
Step 3: NFR (비기능 요구사항) 작성
  NFR-### | 분류(성능/보안/접근성...) | 측정 기준 (정량)
  ↓
Step 4: 비즈니스 규칙 / 추적성 매트릭스
  FR-### → FN-### 매핑 예약 (독립 모드: N/A)
  ↓
Step 5: Self-Check + _context.md append
  파일명: REQ_{프로젝트코드}_{버전}.md
```

### 운영 모드 특이사항

- **CR(Change Request) 관리**: 기존 FR 유지 + 변경/추가된 FR만 신규 채번 (FR-101 ~ )
- SOW에 "변경 전 기능" 명시 → 회귀 리스크 범위 표시

### Self-Check 항목 (총 V2 + 내부 n + X2 + DA3)

| # | 항목 | 판정 기준 |
|---|------|----------|
| V1 | QST 존재(연계) | 연계 Fail → 독립 모드 전환 |
| V2 | FR 1건 이상 + AC 있음 | orphan FR 없음 |
| 내부 1 | AC EARS 형식 준수 | "shall" 포함 |
| 내부 2 | NFR 측정 기준 정량화 | "LCP < 2.5s" 형식 |
| 내부 3 | OUT OF SCOPE 명시 | 범위 모호성 없음 |
| X1 | 업종 보정 | _context.md 업종 = REQ 업종 |
| DA1~3 | PM 3챌린지 | 빠진 요구사항/우선순위/가정 |

### _context.md 기록

```markdown
## REQ
- 생성일: {YYYY-MM-DD}
- FR 수: {n}건 (High:{n} / Mid:{n} / Low:{n})
- NFR 수: {n}건
- 핵심 FR: {FR-001 요약}, {FR-002 요약} ...
```

---

## 3. plan-fn — 기능정의서

### 트리거

"기능정의", "기능 명세", "FN", "기능 상세", "기능 분해" 등

### Step 0: 모드 감지

| 선행 산출물 | 경로 | 연계 모드 |
|------------|------|----------|
| REQ | `output/{프로젝트명}/*/REQ_*.md` | FR-### 기반 FN 분해 |
| QST | `output/{프로젝트명}/*/QST_*.md` | 보조 — 업종/목표 참고 |
| _context | `output/{프로젝트명}/_context.md` | FR 수, 우선순위 분포 |

**연계 모드**: REQ의 FR-### 전수 파싱 → 1:1 또는 1:N FN 생성
**독립 모드**: 프롬프트에서 기능 목록 직접 도출, ID 역참조 N/A

### 주요 흐름

```
Step 0: REQ 스캔 → 모드 판정
  ↓
Step 1: FR → FN 매핑 계획
  - FR 1개 → FN 1개 (단순 기능)
  - FR 1개 → FN n개 (복합 기능 분해)
  ↓
Step 2: 기능 분해 (복잡도별 분기)
  [높음] 4-탭 구조: 입력/처리/출력/에러
  [중간] 처리흐름 + 에러케이스
  [낮음] 서술형
  ↓
Step 3: 검증 기준 3단계
  - 정상 케이스: 기대 동작
  - 예외 케이스: 경계값, 누락값
  - 에러 케이스: 시스템 오류, 타임아웃
  ↓
Step 4: 의존관계 맵 + Self-Check
  FN-A → FN-B (선행 필요)
  파일명: FN_{프로젝트코드}_{버전}.md
  ↓
Step 5: _context.md append
```

### 기능 분해 복잡도 판정 기준

| 복잡도 | 조건 | 분해 방식 |
|--------|------|----------|
| 높음 | API 연동, 결제, 권한 분기 포함 | 4-탭 구조 |
| 중간 | CRUD + 유효성 검증 | 처리흐름 + 에러 |
| 낮음 | 단순 표시, 이동, 토글 | 서술형 1~3문장 |

### Self-Check 항목

| # | 항목 | 판정 기준 |
|---|------|----------|
| V1 | REQ 존재(연계) + FR-### 전수 파싱 가능 | 연계 Fail → 독립 전환 |
| 내부 1 | orphan FN 0건 (모든 FN이 FR 참조) | 연계 모드 필수 |
| 내부 2 | 검증 기준 3단계 존재 | 정상/예외/에러 |
| 내부 3 | 의존관계 순환 없음 | 순환 의존 0건 |
| X1 | FR 수 = FN 수 합리성 | 1:1~1:3 범위 |
| DA1~3 | PM 3챌린지 | 빠진 기능/우선순위/가정 |

### _context.md 기록

```markdown
## FN
- 생성일: {YYYY-MM-DD}
- 기능 수: {n}건
- 복잡도 분포: 높음:{n} / 중간:{n} / 낮음:{n}
- 핵심 기능 (높음): {FN-001}, {FN-002} ...
```

---

## 4. plan-ia — 정보구조설계

### 트리거

"정보구조", "사이트맵", "IA", "페이지 구조", "메뉴 구조", "URL 설계" 등

### Step 0: 모드 감지

| 선행 산출물 | 경로 | 연계 모드 |
|------------|------|----------|
| FN | `output/{프로젝트명}/*/FN_*.md` | FN 기반 페이지 구성 |
| REQ | `output/{프로젝트명}/*/REQ_*.md` | 보조 — 비기능 제약 참고 |
| _context | `output/{프로젝트명}/_context.md` | 기능 수, 업종 로드 |

**연계 모드**: FN 기능 목록 → 페이지/메뉴 구조 자동 매핑
**독립 모드**: 프롬프트 또는 사용자 입력에서 페이지 범위 도출

### 주요 흐름 (5단계)

```
Step 1: 입력 분석 (컨텍스트 파악)
  - 업종, 디바이스(PC/Mobile/둘다), 다국어 여부
  - 현행 사이트 URL 접속 (운영 모드) → browser_snapshot
  ↓
Step 2: 사이트맵 생성
  - 1~2Depth: GNB 메뉴 구조
  - 3~4Depth: 하위 페이지 + LNB
  - IA-P### ID 부여
  ↓
Step 3: 네비게이션 설계
  - GNB / LNB / SNB / Breadcrumb / Footer
  - 모바일 햄버거 메뉴 등 분기 명시
  ↓
Step 4: 콘텐츠 인벤토리 (페이지별)
  - 콘텐츠 목록, 우선순위, 담당 부서
  - FN-### ID 참조 (연계 모드)
  ↓
Step 5: URL 설계
  - 소문자, 하이픈(-) 구분자, 영문 경로
  - 예: /about/company, /products/list
  ↓
Step 6: Self-Check + _context.md append
  파일명: IA_{프로젝트코드}_{버전}.md
```

### Self-Check 항목

| # | 항목 | 판정 기준 |
|---|------|----------|
| V1 | FN 존재(연계) | 연계 모드에서 FN 미발견 → 독립 전환 |
| 내부 1 | IA-P### 중복 없음 | ID 유일성 |
| 내부 2 | 모든 페이지 URL 존재 | orphan 페이지 0건 |
| 내부 3 | Depth ≤ 4 | 5Depth+ → 구조 재검토 WARN |
| X1 | FN↔페이지 매핑 | FN 기능이 최소 1개 페이지에 배치 |
| X2 | 업종 네비 패턴 | _context.md 업종 기반 GNB 스타일 |
| DA1~3 | PM 3챌린지 | 빠진 페이지/우선순위/가정 |

### _context.md 기록

```markdown
## IA
- 생성일: {YYYY-MM-DD}
- 페이지 수: {n}건
- 최대 Depth: {n}
- 네비게이션 타입: GNB+LNB / GNB only / 기타
```

---

## 5. plan-wbs — 작업분해구조

### 트리거

"WBS", "작업분해", "일정 산정", "스케줄", "마일스톤", "공수 산정" 등

### Step 0: 모드 감지

| 선행 산출물 | 경로 | 역할 |
|------------|------|------|
| FN | `output/{프로젝트명}/*/FN_*.md` | **직접 선행** — FN→작업 분해, 의존관계 |
| IA | `output/{프로젝트명}/*/IA_*.md` | **직접 선행** — 페이지 수, Depth |
| QST/REQ | 각 경로 | 보조 — 업종, 우선순위 |
| _context | 누적 컨텍스트 | 기능 수, 페이지 수, 업종 |

**연계 모드** (FN 또는 IA 발견): FN ID 기반 작업 분해, 추적성 유지
**독립 모드** (모두 미발견): 프롬프트 텍스트에서 작업 범위 직접 도출

### 주요 흐름

```
Step 0: FN/IA 스캔 → 모드 판정
  ↓
Step 1: FN/IA 분석 (연계) / 프롬프트 분석 (독립)
  - 기능별 복잡도 (높음/중간/낮음)
  - 페이지 수 확인 → 퍼블 작업량 산정
  ↓
Step 2: Phase 분해 (5단계)
  Phase 1 기획 / Phase 2 디자인 / Phase 3 퍼블리싱
  Phase 4 QA / Phase 5 런칭
  ↓
Step 3: 작업 분해 (WBS-{Phase}.{순번})
  - 작업 크기: 1~5일 (5일 초과 → 분할)
  - Wave 분류: W1(선행없음) → W2(W1완료 후) → W3+(W2완료 후)
  - P0(크리티컬 패스) / P1(일반)
  ↓
Step 4: 일정 산정
  - 공수 기준표 (복잡도×역할)
  - 업종별 보정 계수 적용 (금융×1.15, 공공×1.20 등)
  - 대규모(16p+): 3점 추정법 = (낙관+4×최빈+비관)/6
  ↓
Step 4.5: 리스크 평가
  - 7대 유형: 일정/범위/고객/리소스/기술/품질/커뮤니케이션
  - 3×3 영향 매트릭스 → 점수 6+ 대응전략 필수
  - 최소 5건, 3개 유형 이상 커버
  ↓
Step 5: 크리티컬 패스 + Self-Check + _context.md append
  파일명: WBS_{프로젝트코드}_{버전}.md
```

### 공수 기준 (가이드)

| FN 복잡도 | 디자인 | 퍼블리싱 | QA |
|----------|--------|---------|-----|
| 높음 | 3~5일 | 3~5일 | 2~3일 |
| 중간 | 2~3일 | 2~3일 | 1~2일 |
| 낮음 | 1일 | 1일 | 0.5일 |

### Self-Check 항목 (11항목)

| # | 항목 | 판정 기준 |
|---|------|----------|
| V1 | FN 존재 + FN-### 유효성 | 연계 Fail → 독립 전환 |
| 내부 1 | 작업 크기 ≤ 5일 | 5일 초과 0건 |
| 내부 2 | 순환 의존 0건 | 작업 간 순환 없음 |
| 내부 3 | 크리티컬 패스 존재 | 1개 이상 |
| 내부 4 | 버퍼 ≥ 10% | 미충족 시 WARN |
| 내부 5 | 리스크 레지스터 | 5건+, 3유형+ 커버 |
| 내부 6 | 공수 보정 적용 | 업종 계수 + 버퍼율 명시 |
| X1 | 프로젝트명 일관성 | _context.md 일치 |
| X2 | FN↔작업 수량 | FN 1개당 평균 2~4작업 |
| X3 | IA↔퍼블 작업 | IA 페이지 수 대비 Phase 3 합리성 |
| DA1~3 | PM 3챌린지 | 범위/우선순위/가정 |

### _context.md 기록

```markdown
## WBS
- 생성일: {YYYY-MM-DD}
- 총 작업 수: {n}건
- 총 기간: {n}주
- Phase별 분포: 기획{n} / 디자인{n} / 퍼블{n} / QA{n} / 런칭{n}
- 크리티컬 패스: {WBS-_._ → ... → WBS-_._} ({n}일)
- 버퍼 비율: {n}%
```

---

## 6. plan-sb — 화면설계서

### 트리거

plan-sb 스킬 직접 호출, 또는 "화면설계서", "SB", "스크린 블루프린트" 명시

### Step 0: 모드 감지

| 검색 대상 | 경로 | 발견 시 |
|----------|------|---------|
| JSON 데이터 | `data/*.json`, `input/*.json` | **자동 모드** — 바로 생성 실행 |
| FN 산출물 | `output/{프로젝트명}/*/FN_*.md` | 연계 모드 — fnRef 자동 매핑 (날짜 하위폴더 포함) |
| 이미지 | `input/*.png`, `input/pages/*.png` | uiImagePath 자동 매핑 |
| context | `output/{프로젝트명}/context/fn.md` | 연계 모드 판정 기준 (v2) |

**자동 모드** (JSON 발견): JSON → 스키마 정규화 → 생성 실행
**대화형 모드** (JSON 미발견): 사용자 순차 질의 → JSON 생성 → 자동 모드 전환

### 정보 소유 경계

| 구분 | 항목 |
|------|------|
| **소유** | 와이어프레임, Description, MSG Case, 컴포넌트 가이드, 프레임 배치 |
| **참조** | FN-### ID + 기능명, IA 메뉴 경로(location) |
| **금지** | FN 처리 로직 복사, REQ AC 직접 기재 |

### JSON 스키마 자동 정규화

- **v2 스키마** (범용): `project` + `screens[]` 필수
- **v1 스키마** (KMVNO 호환): `assignment`, `interfaces`, `jiraNo/srNo` → 자동으로 v2 변환
- `normalizeSchema()` 함수가 런타임에 처리

### 주요 흐름

```
Step 0: JSON/FN/이미지 스캔 → 모드 판정
  ↓
Step 1: 데이터 준비
  - JSON 파싱 → v1/v2 정규화
  - config.json 디폴트 병합
  - themes/{preset}.json 로드
  - input/ 이미지 → uiImagePath 자동 매핑
  ↓
Step 2: HTML 생성 (node scripts/generate.js) — 1280×720 슬라이드 덱 (v2)
  생성 슬라이드 순서:
  1. Cover 슬라이드 (표지)
  2. History 슬라이드 (변경 이력)
  3. Overview 슬라이드 (Assignment 또는 Summary)
  4. Screen 슬라이드 × N (screenType별 분기)
     - design: slide-header + [좌 60% 와이어프레임 | 우 40% Description+fnRef]
     - design + msgCases: design 슬라이드 + MSG Case 별도 슬라이드 자동 생성
     - description: Description 전체 영역
     - component: UI 컴포넌트 가이드 Grid
  5. Divider 슬라이드 (hasDivider=true 앞에 자동 삽입)
  6. End of Document 슬라이드
  ↓
Step 3: PDF 변환 (Playwright) — landscape 고정 (v2)
  - 미설치 시 자동 설치 (npm install playwright + npx playwright install chromium)
  - width: 1280px, height: 720px, landscape: true (동적 높이 측정 제거)
  - printBackground: true, margin: 0
  ↓
Step 4: 검증 (2트랙)

  [트랙 A: Claude MCP Playwright]
  1. browser_navigate → file:///{파일명}.html
  2. browser_evaluate → .slide 수 집계 → 예상 슬라이드 수 대조
  3. browser_take_screenshot → 시각 확인

  [트랙 B: 사용자 독립 실행]
  node {skill-path}/scripts/verify.js output/{프로젝트}/{날짜}/{파일명}.html
  → output/verify/{파일명}-slide001.png ... 생성
  검증: overflow/콘텐츠밀도/MSG인라인/fnRef누락 (WARN/ERROR)
  Playwright 미설치 시 자동 설치
  ↓
Step 5: Self-Check + context/ 갱신 없음 (SB는 JSON 입력 기반)
  파일명: {outputPrefix}.html/.pdf (outputPrefix 미설정 시: {프로젝트명}_SB_{YYYYMMDD}_{버전})
```

### Self-Check 항목 (18항목)

| # | 항목 | 판정 기준 |
|---|------|----------|
| V1 | JSON 파싱 성공 | Fail → 중단 |
| V2 | 스키마 필수 필드 완전성 | project + screens 존재 |
| 내부 1 | Cover 프레임 존재 | - |
| 내부 2 | History 프레임 | history[] 1건 이상 시 |
| 내부 3 | Overview 프레임 | overview 데이터 시 |
| 내부 4 | Screen 프레임 수 = screens[] 수 | 불일치 Fail |
| 내부 5 | Divider 프레임 수 = hasDivider:true 수 | 불일치 Fail |
| 내부 6 | End of Document 존재 | - |
| 내부 7 | 메타 테이블 완전성 | Viewport+Interface+Location |
| 내부 8 | Description 완전성 | marker + label 존재 |
| 내부 9 | 와이어프레임 마커 일치 | wireframe[].marker ↔ descriptions[].marker |
| 내부 10 | 이미지 참조 유효성 | 파일 존재 또는 placeholder |
| 내부 11 | PDF 출력 정상 | 변환 성공, 페이지 구분 |
| 내부 12 | 정보 소유 경계 준수 | FN 로직/REQ AC 복사 금지 |
| X1 | 프로젝트명 일관성 | _context.md 일치 |
| X2 | FN↔Screen 수량 | FN 수 대비 Screen 수 합리성 |
| X3 | IA 경로 일관성 | IA location과 Screen location 비교 |
| DA1~3 | PM 3챌린지 | 누락 화면/핵심 화면/미확인 패턴 |

### _context.md 기록

```markdown
## SB 요약
- 생성일: {YYYY-MM-DD}
- 총 프레임: {n}개
- Screen 수: {n}개 (design:{n} / description:{n} / msgCase:{n} / component:{n})
- 테마: {preset}
- 출력: {outputPrefix}.html, {outputPrefix}.pdf
```

---

## 7. 파이프라인 전체 흐름 요약

```
QST → REQ → FN → IA → WBS
                       ↓
                      SB (선택, 화면설계서)

각 단계에서 _context.md를 읽고 → 기록 (누적)
```

### 스킬별 Self-Check 항목 수

| 스킬 | 입력 V | 내부 | 교차 X | DA | 합계 |
|------|:---:|:---:|:---:|:---:|:---:|
| plan-qst | 2 | n | 1 | 3 | ~8 |
| plan-req | 2 | 3 | 1 | 3 | ~9 |
| plan-fn | 1 | 3 | 1 | 3 | ~8 |
| plan-ia | 1 | 3 | 2 | 3 | ~9 |
| plan-wbs | 1 | 6 | 3 | 3 | **11** |
| plan-sb | 2 | 12 | 3 | 3 | **18** |

### _context.md 누적 구조 (파이프라인 완주 후)

```markdown
## QST
- 업종, 핵심 목표, 질의 수

## REQ
- FR 수 (High/Mid/Low), NFR 수, 핵심 FR

## FN
- 기능 수, 복잡도 분포, 핵심 기능

## IA
- 페이지 수, 최대 Depth, 네비게이션 타입

## WBS
- 총 작업 수, 총 기간, 크리티컬 패스, 버퍼율

## SB 요약
- 총 프레임, Screen 수, 테마, 출력 파일
```

---

## 9. 독립 동작 시나리오

파이프라인 없이 단독으로 스킬을 호출했을 때의 동작을 스킬별로 정리합니다.

### 공통 원칙

| 원칙 | 내용 |
|------|------|
| 선행 파일 미존재 → 역참조 생략 | 없는 ID를 추측하지 않음. FR-###, FN-### 역참조는 N/A 처리 |
| 자체 ID 체계는 정상 부여 | FN-###, IA-P###, WBS-#.# 등 자기 산출물 내부 ID는 정상 채번 |
| 교차 검증(X#) 전항목 N/A | _context.md 미존재 시 모든 교차 검증 항목이 N/A |
| V1 연계 필수 항목 → N/A 처리 | 연계 모드 전용 검증(V1)이 N/A로 처리되어 독립 모드 합격 기준 적용 |
| 순방향 추적은 자동 활성화 | 독립으로 생성한 FN을 후속 IA가 읽으면 FN→IA 추적 자동 적용 |

---

### plan-qst 독립 동작

**진입 조건**: 사용자가 "고객질의서 만들어줘" 등을 요청할 때 QST/REQ가 없는 상태

**입력**: 사용자 프롬프트 또는 PROJECT.md (없으면 구두 설명)

**Claude 동작 흐름**:
```
1. PROJECT.md 탐색 → 없으면 사용자에게 프로젝트 개요 1회 확인
2. 업종/서비스 유형 자체 판단 (확인 안 되면 직접 질문)
3. 5개 영역(목표/기능/사용자/일정예산/레퍼런스)으로 질의 설계
4. QST_{코드}_{버전}.md 저장
5. _context.md 신규 생성 (QST 블록만 포함)
```

**N/A 항목**: 없음 (QST는 파이프라인 첫 단계, 역참조 대상 없음)

**사용 예시**:
```
사용자: "강남구청 홈페이지 리뉴얼 프로젝트 고객질의서 만들어줘"
→ PROJECT.md 스캔 → 없으면 "프로젝트 개요를 알려주세요" 1회 확인
→ 공공기관 업종 자동 판정 → 5개 영역 질의 생성
→ QST_GANGNAM_v1.0.md 저장
```

---

### plan-req 독립 동작

**진입 조건**: QST 없이 "요구사항 정의해줘" 요청

**입력**: 사용자 프롬프트 텍스트 (서비스 설명, 기능 목록, 제약사항 등)

**Claude 동작 흐름**:
```
1. QST 스캔 → 미발견 → 독립 모드 선언
2. 프롬프트에서 직접 도출:
   - 서비스 목적 → 비즈니스 목표 + SOW 범위
   - 언급된 기능 → FR-001, FR-002 ... 순서대로 채번
   - 암묵적 제약 → NFR (성능, 보안, 접근성)
3. FR 역참조(QST-Q###)는 기재하지 않음
4. REQ_{코드}_{버전}.md 저장
5. _context.md 신규 생성 (REQ 블록만)
```

**N/A 항목**:
- V1: QST 연계 검증 → N/A (독립 모드 합격 기준 적용)
- 추적성 매트릭스: Q-### → FR-### 컬럼 생략

**주의**: FR AC는 프롬프트에서 합리적으로 추론. "빠르게", "쉽게" 등 모호한 표현은 정량화 또는 삭제.

---

### plan-fn 독립 동작

**진입 조건**: REQ 없이 "기능정의서 만들어줘" 요청

**입력**: 사용자 프롬프트 (기능 목록 설명)

**Claude 동작 흐름**:
```
1. REQ 스캔 → 미발견 → 독립 모드 선언
2. 프롬프트에서 기능 목록 추출:
   - 각 기능에 FN-001, FN-002 ... 자체 채번
   - FR-### 역참조 컬럼 없이 작성
3. 복잡도 추정 (프롬프트 내 설명 수준 기반)
   - API 연동/결제 언급 → 높음 (4-탭)
   - CRUD/목록/상세 → 중간
   - 버튼/이동/토글 → 낮음
4. 검증 기준 3단계 (정상/예외/에러) 자체 생성
5. 의존관계 맵: 언급된 기능 간 선후 관계 추론
6. FN_{코드}_{버전}.md 저장
```

**N/A 항목**:
- V1: FR 연계 검증 → N/A
- 교차 검증 X1~X3 → N/A (_context 미존재)
- 추적성 매트릭스: FR→FN 컬럼 생략

**후속 연동**: 이 FN을 plan-ia, plan-wbs, plan-sb가 읽으면 FN-### ID 기반 추적이 자동 활성화됨.

---

### plan-ia 독립 동작

**진입 조건**: FN/REQ 없이 "사이트맵 만들어줘", "IA 설계해줘" 요청

**입력**: 사용자 프롬프트 (서비스 유형, 주요 메뉴, 페이지 목록 등)

**Claude 동작 흐름**:
```
1. FN 스캔 → 미발견 → 독립 모드 선언
2. 프롬프트 분석:
   - 서비스 유형 → 업종별 기본 메뉴 패턴 적용
   - 언급된 페이지/기능 → IA-P### 채번
3. 사이트맵 생성 (Depth 1~4)
   - FN-### 참조 컬럼 없이 작성
   - 페이지별 기능 설명을 자체 서술
4. 네비게이션 / URL 설계 자체 결정
5. IA_{코드}_{버전}.md 저장
6. _context.md 신규 생성 또는 append
```

**N/A 항목**:
- V1: FN 연계 검증 → N/A
- X1: FN↔페이지 매핑 → N/A
- X2: 업종 보정 → _context 미존재 시 N/A (업종 자체 추론으로 대체)

**운영 모드 추가**: 현행 사이트 URL이 있으면 `browser_navigate` + `browser_snapshot`으로 현행 구조 파악 후 반영.

---

### plan-wbs 독립 동작

**진입 조건**: FN/IA 없이 "일정 산정해줘", "WBS 만들어줘" 요청

**입력**: 사용자 프롬프트 (작업 범위, 팀 구성, 목표 납기 등)

**Claude 동작 흐름**:
```
1. FN/IA 스캔 → 미발견 → 독립 모드 선언
2. 프롬프트에서 작업 범위 추출:
   - 언급된 기능/페이지 수로 규모 판단 (소/중/대)
   - 업종 언급 있으면 보정 계수 적용
   - 미언급 시 기본 계수(×1.0) 사용
3. Phase 5단계 구조로 작업 분해:
   - FN-### 참조 없이 "기능명" 기반으로 WBS 작업 기술
   - Wave(W1/W2/W3+) 분류는 동일하게 적용
4. 3점 추정법 적용 (대규모 또는 고위험 시)
5. 리스크 레지스터 자체 생성 (최소 5건, 3유형+)
6. 크리티컬 패스 식별
7. WBS_{코드}_{버전}.md 저장
```

**N/A 항목**:
- V1: FN 연계 검증 → N/A (프롬프트 기반 진행)
- X1~X3: 교차 검증 전항목 → N/A (_context 미존재)
- Self-Check 판정: N/A 제외 항목 전수 Pass = 합격

**주의**: 프롬프트에서 기능 수/페이지 수가 명시되지 않으면 "어느 정도 규모인지" 1회 확인.

---

### plan-sb 독립 동작

**진입 조건**: JSON 파일 없이 plan-sb 호출

**입력**: 사용자 프롬프트 또는 대화형 질의

**Claude 동작 흐름 (대화형 모드)**:
```
1. JSON 스캔 → 미발견 → 대화형 모드 선언
2. 순서대로 질의하여 프로젝트 정보 수집:
   - 프로젝트 ID, 과제명, 서비스명, 버전, 작성자
   - 화면 목록 (인터페이스명, 뷰포트, 메뉴 경로)
   - 화면별 수정 영역 (마커, 영역명, 수정 전/후)
3. 수집 완료 → JSON 파일 생성 (data/{id}.json)
4. 자동 모드로 전환 → HTML/PDF 생성
```

**JSON 직접 제공 시 (자동 모드)**:
```
사용자: "이 JSON으로 화면설계서 만들어줘" + JSON 붙여넣기
→ data/ 또는 input/ 에 파일 저장
→ 바로 generate.js 실행
```

**N/A 항목**:
- FN 미발견: screens 자동 구성 생략 → 사용자 제공 데이터 그대로 사용
- X2: FN↔Screen 수량 → N/A
- X3: IA 경로 일관성 → N/A

**v1 스키마 독립 사용**: KMVNO 전용 필드(jiraNo, srNo, assignment) 포함 JSON을 그대로 넣어도 자동 정규화됨.

---

### 독립 동작 시 Self-Check 합격 기준 요약

| 스킬 | 연계 필수(N/A 처리) | 독립 합격 기준 |
|------|------------------|--------------|
| plan-qst | 없음 | 전항목 Pass |
| plan-req | V1(QST 연계), X# | N/A 제외 전수 Pass |
| plan-fn | V1(REQ 연계), X# | N/A 제외 전수 Pass |
| plan-ia | V1(FN 연계), X# | N/A 제외 전수 Pass |
| plan-wbs | V1(FN 연계), X# | N/A 제외 전수 Pass |
| plan-sb | X2(FN↔Screen), X3(IA 경로) | N/A 제외 전수 Pass |

---

## 8. 주요 제약 / 알려진 이슈

| 항목 | 내용 |
|------|------|
| MCP Playwright file:// 차단 | `python -m http.server 9988` 로 우회 필수 |
| Playwright 자동 설치 | generate.js / verify.js 모두 미설치 시 자동 설치 (npm + npx) |
| v1 스키마 자동 정규화 | KMVNO 전용 스키마(jiraNo, srNo, assignment 등) → v2로 자동 변환 |
| 운영 모드 CR 관리 | REQ에서 기존 FR 유지 + 변경/추가 FR 별도 채번 |
| 독립 모드 역참조 생략 | 선행 산출물 없으면 FR→FN 역참조 N/A, 자체 ID만 부여 |
| _context.md 미존재 | 교차 검증(X#) 전항목 N/A 처리 |
