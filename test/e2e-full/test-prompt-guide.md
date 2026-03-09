# E2E 파이프라인 테스트 — 예시 프롬프트 가안

> **테스트 환경**: `D:/eluo-hub/test/e2e-full/`
> **테스트 프로젝트**: 짐핏(GymFit) — 헬스장 회원 관리 + 수업 예약 웹 플랫폼
> **프로젝트 코드**: GYMFIT
> **테스트 날짜**: 2026-03-09

---

## 테스트 전 체크리스트

| # | 항목 | 확인 |
|---|------|------|
| 1 | `D:/eluo-hub/test/e2e-full/` 폴더에서 Claude Code 실행 | □ |
| 2 | `PROJECT.md` 파일 존재 | □ |
| 3 | `.claude/hooks/detector.mjs` 실행 권한 확인 | □ |
| 4 | `output/` 폴더 비어있음 (클린 상태) | □ |

---

## Step 1: QST — 고객질의서

### 목적
- STRONG/WEAK 패턴 감지 확인
- PROJECT.md 기확정 항목 필터링 확인
- output/{프로젝트명}/{날짜}/QST_GYMFIT_v1.0.md 저장 확인
- context/qst.md 생성 확인
- render.js → HTML+PDF 생성 확인

> **프롬프트 원칙**: 첫 대화에 반드시 **프로젝트 소개 + 요청**을 함께 담는다.
> Claude는 PROJECT.md를 Step 0에서 자동으로 읽지만, 첫 문장에 배경이 없으면
> "어떤 프로젝트인지"를 역으로 물어보거나 추상적 질의서를 생성할 위험이 있다.

### 프롬프트 가안 A (권장 — 프로젝트 소개 + STRONG 패턴)
```
짐핏(GymFit)은 소규모 헬스장·PT 스튜디오 운영자를 위한 회원 관리 + 수업 예약 웹 플랫폼이야.
지금 엑셀/카톡으로 수작업 운영하는 헬스장들이 타겟이고, React + Node.js + MySQL 신규 구축이야.

다음 주 첫 클라이언트 미팅 전에 고객질의서 만들어줘.
```

### 프롬프트 가안 B (WEAK 패턴 — 자연어 변형)
```
짐핏은 헬스장 운영자용 SaaS야. 회원 관리, 수업 예약, 결제, 매출 리포트 기능이 필요한 신규 구축 프로젝트.

클라이언트 미팅 전에 고객한테 뭘 물어봐야 할지 정리해줘.
```

### 프롬프트 가안 C (PROJECT.md 명시 참조)
```
PROJECT.md 읽고 짐핏 프로젝트 QST 만들어줘.
기확정 항목은 건너뛰고 미확인 항목만 질의로 구성해줘.
```

### 프롬프트 가안 D (최소 입력 — 패턴 감지 테스트용)
```
QST 만들어줘
```
> 이 경우 Claude가 "어떤 프로젝트인지" 확인 질문을 할 수 있음 — 이것도 정상 동작

### 검증 포인트
- [ ] `[ELUO HUB: plan-qst 감지]` additionalContext 주입됨
- [ ] `[전방위 스캔]` 출력 (REQ:0 FN:0 IA:0 WBS:0)
- [ ] PROJECT.md 기확정 항목 필터링 (프로젝트명/코드/업종/기술스택 등)
- [ ] 선택형(A/B/C/D) 질의 구성
- [ ] Self-Check PASS
- [ ] `output/GYMFIT/{날짜}/QST_GYMFIT_v1.0.md` 생성
- [ ] `output/GYMFIT/context/qst.md` 생성
- [ ] HTML + PDF 생성

---

## Step 2: REQ — 요구사항정의서

### 목적
- context/qst.md 연계 모드 확인 (QST 결과 반영)
- FR/NFR 분리 + AC 포함 확인
- output/{날짜}/REQ_GYMFIT_v1.0.md + context/req.md 생성 확인

> QST 완료 직후 이어지는 대화이므로 프로젝트 설명은 불필요.
> 단, 새 세션 시작 시에는 배경 한 줄 + 요청을 붙인다.

### 프롬프트 가안 A (QST 직후 — 이어서 요청)
```
QST 나온 거 바탕으로 요구사항정의서 이어서 만들어줘.
회원 관리, 수업 예약, 결제, 매출 리포트가 핵심 기능이야.
```

### 프롬프트 가안 B (새 세션 시작 시)
```
짐핏은 헬스장 운영자용 SaaS 신규 구축이야.
QST까지 완료했고, 이어서 요구사항정의서 만들어줘.
회원 관리, 수업 예약, 결제, 리포트 기능 위주로.
```

### 프롬프트 가안 C (WEAK 패턴)
```
짐핏에서 뭘 만들어야 하는지 정리해줘.
기능이랑 비기능 요구사항 구분해서.
```

### 프롬프트 가안 D (최소)
```
REQ 작성해줘
```

### 검증 포인트
- [ ] `[ELUO HUB: plan-req 감지]` 주입
- [ ] `[전방위 스캔]` context/qst.md 존재 → 연계 모드
- [ ] FR-### + NFR-### ID 채번
- [ ] AC EARS 패턴 적용
- [ ] Must/Should/Could 우선순위 분류
- [ ] Self-Check PASS
- [ ] `output/GYMFIT/{날짜}/REQ_GYMFIT_v1.0.md` 생성
- [ ] `output/GYMFIT/context/req.md` 생성
- [ ] HTML + PDF 생성

---

## Step 3: FN — 기능정의서

### 목적
- context/req.md 연계 모드 (FR 목록 자동 참조)
- FR→FN 1:N 분해 + FN-### ID 채번 확인
- 복잡도별 분기 (4탭/처리+에러/서술) 확인

### 프롬프트 가안 A (REQ 직후 — 이어서 요청)
```
REQ 다 됐으면 기능정의서 이어서 만들어줘.
예약 시스템이랑 결제 플로우는 특히 상세하게 해줘.
```

### 프롬프트 가안 B (새 세션 — 배경 + 요청)
```
짐핏 헬스장 SaaS야. QST→REQ까지 완료된 상태고, 기능정의서 만들어줘.
회원가입, 수업 예약, 결제, 알림, 리포트가 주요 기능이야.
```

### 프롬프트 가안 C (WEAK 패턴)
```
짐핏에서 어떤 기능들이 필요한지 상세하게 정의해줘.
```

### 프롬프트 가안 D (최소)
```
FN 써줘
```

### 검증 포인트
- [ ] `[ELUO HUB: plan-fn 감지]` 주입
- [ ] context/req.md 로드 → 연계 모드
- [ ] FR→FN 1:N 분해 (FR-001 → FN-001, FN-002, ...)
- [ ] FN-### 연속 채번
- [ ] 복잡도 높은 기능(예약/결제): 4탭 구조 적용
- [ ] 단순 기능(조회): 서술형 적용
- [ ] Self-Check PASS
- [ ] `output/GYMFIT/{날짜}/FN_GYMFIT_v1.0.md` 생성
- [ ] `output/GYMFIT/context/fn.md` 생성
- [ ] HTML + PDF 생성

---

## Step 4: IA — 정보구조설계

### 목적
- context/fn.md 연계 모드 (FN 기능 목록 기반 자동 구조)
- 사이트맵 + URL 설계 + 네비게이션 확인

### 프롬프트 가안 A (FN 직후 — 이어서 요청)
```
FN까지 완료됐으니 정보구조설계 이어서 해줘.
관리자 페이지랑 회원 페이지 분리해서.
```

### 프롬프트 가안 B (새 세션 — 배경 + 요청)
```
짐핏은 헬스장 운영자 + 회원 2가지 역할이 있는 SaaS야.
QST→REQ→FN까지 나왔고, 이어서 정보구조설계 해줘.
```

### 프롬프트 가안 C (WEAK 패턴)
```
짐핏 사이트 구조 잡아줘.
메뉴 어떻게 나눌지, URL은 어떻게 구성할지.
```

### 프롬프트 가안 D (최소)
```
IA 작성해줘
```

### 검증 포인트
- [ ] `[ELUO HUB: plan-ia 감지]` 주입
- [ ] context/fn.md 로드 → 연계 모드
- [ ] 관리자/회원 두 역할 분리
- [ ] IA-P### 페이지 ID 채번
- [ ] URL 설계 (RESTful 패턴)
- [ ] depth-rules.md 기준 준수
- [ ] Self-Check PASS
- [ ] `output/GYMFIT/{날짜}/IA_GYMFIT_v1.0.md` 생성
- [ ] `output/GYMFIT/context/ia.md` 생성
- [ ] HTML + PDF 생성

---

## Step 5: WBS — 작업분해구조

### 목적
- context/fn.md + context/ia.md 연계 모드
- 단계별 작업 + 공수 산정 + 마일스톤 확인

### 프롬프트 가안 A (IA 직후 — 이어서 요청)
```
FN이랑 IA 다 나왔으니 WBS 이어서 만들어줘.
백엔드 2명, 프론트 1명 기준으로 공수 산정해줘.
```

### 프롬프트 가안 B (새 세션 — 배경 + 요청)
```
짐핏 헬스장 SaaS, QST→REQ→FN→IA까지 완료된 상태야.
백엔드 2명 + 프론트 1명 투입 기준으로 WBS 만들어줘.
```

### 프롬프트 가안 C (WEAK 패턴)
```
짐핏 개발 얼마나 걸려? 작업 나눠서 일정 잡아줘.
```

### 프롬프트 가안 D (최소)
```
WBS 짜줘
```

### 검증 포인트
- [ ] `[ELUO HUB: plan-wbs 감지]` 주입
- [ ] context/fn.md + context/ia.md 로드 → 연계 모드
- [ ] 단계 구분 (분석/설계/개발/테스트/배포)
- [ ] WBS-T### 작업 ID 채번
- [ ] 공수 합계 + 크리티컬 패스
- [ ] Self-Check PASS
- [ ] `output/GYMFIT/{날짜}/WBS_GYMFIT_v1.0.md` 생성
- [ ] `output/GYMFIT/context/wbs.md` 생성
- [ ] HTML + PDF 생성

---

## Step 6: SB — 화면설계서

### 목적
- context/fn.md + context/ia.md 연계 모드 (FN/IA 자동 참조)
- JSON 대화형 수집 → generate.js → 1280×720 landscape HTML+PDF
- verify.js ERROR 0건 확인

### 프롬프트 가안 A (WBS 직후 — 이어서 요청, 화면 지정)
```
WBS까지 완료됐으니 화면설계서 이어서 만들어줘.
로그인, 회원가입, 회원 목록, 수업 예약 4개 화면 먼저 해줘.
```

### 프롬프트 가안 B (새 세션 — 배경 + STRONG)
```
짐핏 헬스장 SaaS야. 전체 파이프라인 완료 상태고, 화면설계서 만들어줘.
FN이랑 IA 산출물 있으니 연계해서 로그인/대시보드/예약 화면부터 시작해.
```

### 프롬프트 가안 C (WEAK 패턴)
```
짐핏 주요 화면 그려줘.
관리자 대시보드, 회원 목록, 수업 예약 화면.
```

### 프롬프트 가안 D (최소)
```
SB 만들어줘
```

### 프롬프트 가안 D (JSON 직접 지정)
```
이 JSON으로 화면설계서 만들어줘:
{
  "project": {
    "id": "GYMFIT",
    "title": "짐핏 화면설계서",
    "serviceName": "GymFit",
    "version": "v1.0",
    "date": "2026-03-09",
    "writer": "PM",
    "outputPrefix": "SB_GYMFIT_v1",
    "company": { "name": "짐핏" }
  },
  "screens": [
    {
      "id": "S-001",
      "title": "로그인",
      "screenType": "design",
      "location": "/login",
      "descriptions": [
        {
          "marker": 1,
          "label": "이메일 입력",
          "items": [{ "text": "이메일 형식 유효성 검사" }]
        },
        {
          "marker": 2,
          "label": "비밀번호 입력",
          "items": [{ "text": "8자 이상, 마스킹 처리" }]
        }
      ]
    }
  ]
}
```

### 검증 포인트
- [ ] `[ELUO HUB: plan-sb 감지]` 주입
- [ ] `[SB Step 0]` context/fn.md 존재 → 연계 모드
- [ ] context/ia.md 존재 → location 자동 반영
- [ ] 대화형 모드: 화면 목록 순차 수집 → JSON 생성
- [ ] `node generate.js <data.json>` 실행
- [ ] 1280×720 landscape HTML+PDF 생성
- [ ] verify.js ERROR 0건
- [ ] context/sb.md 생성

---

## 연계 모드 검증 (핵심)

> **파이프라인 연계가 제대로 동작하는지** 확인하는 핵심 체크입니다.

### context/ 폴더 최종 상태 (WBS까지 완료 후)

```
output/GYMFIT/
├── context/
│   ├── qst.md   ← QST 완료 후 생성
│   ├── req.md   ← REQ 완료 후 생성
│   ├── fn.md    ← FN 완료 후 생성
│   ├── ia.md    ← IA 완료 후 생성
│   └── wbs.md   ← WBS 완료 후 생성
└── {YYYYMMDD}/
    ├── QST_GYMFIT_v1.0.md + .html + .pdf
    ├── REQ_GYMFIT_v1.0.md + .html + .pdf
    ├── FN_GYMFIT_v1.0.md  + .html + .pdf
    ├── IA_GYMFIT_v1.0.md  + .html + .pdf
    └── WBS_GYMFIT_v1.0.md + .html + .pdf
```

### ID 추적성 체인 확인

| 체인 | 확인 항목 |
|------|---------|
| Q-### → FR-### | QST 미확인 항목이 REQ에 반영됨 |
| FR-### → FN-### | 모든 FR이 최소 1개 FN으로 분해됨 |
| FN-### → IA-P### | FN 기능이 IA 페이지에 매핑됨 |
| FN-### → WBS-T### | FN 기반 작업 항목 생성됨 |

---

## 오탐 방어 테스트

> detector.mjs가 관련 없는 입력을 무시하는지 확인합니다.

| 입력 | 기대 동작 |
|------|---------|
| `안녕하세요` | 아무 스킬 미감지 → 일반 응답 |
| `코드 리뷰해줘` | 아무 스킬 미감지 → 일반 응답 |
| `디자인 해줘` | 아무 스킬 미감지 (plan-sb 패턴 아님) |
| `홈페이지 만들어줘` | 아무 스킬 미감지 |

---

## 예상 오류 + 대응

| 오류 | 원인 | 대응 |
|------|------|------|
| detector.mjs 미실행 | hooks settings.json matcher 확인 | `cat .claude/settings.json` |
| render.js 실패 | marked/Playwright 미설치 | auto-install 동작 확인 |
| generate.js 실패 | playwright chromium 미설치 | `npx playwright install chromium` |
| context/ 폴더 없음 | 첫 실행 | CLAUDE.md Step 0에서 mkdir 지시 확인 |
| WARN 다수 (verify.js) | 콘텐츠 밀도 30% 미만 | 테스트 데이터 최소화 → 정상 현상 |

---

*작성일: 2026-03-09 | 테스트 환경: D:/eluo-hub/test/e2e-full/*
