# plan-wbs 패키지

이 환경에는 **작업분해구조(WBS) 자동화** 스킬만 설치되어 있습니다.

## 파이프라인 위치

```
QST → REQ → FN → IA → [WBS] → SB
```

## 실행 절차

### Step 0: 선행 파악 (연계/독립 모드 판별)

연계 모드 조건 (하나라도 해당 시):
1. **자동 연계**: `output/{프로젝트명}/context/fn.md` 존재 → FN 기능 목록 + 복잡도 기반 공수 산정
   - `context/ia.md` 추가 존재 시 IA 페이지 정보 추가 참조
   - `context/req.md` 추가 존재 시 REQ 기능 범위 참조
2. **수동 연계**: `input/FN_*.md` 존재 → 이전 패키지 산출물 수동 복사 방식
   - `input/IA_*.md` 추가 존재 시 IA 산출물도 참조
3. 모두 미존재 → **독립 모드**: 사용자에게 프로젝트 범위·업종·기간 조건 직접 수집

추가 스캔:
- `_context.md` 존재 시 "v1 컨텍스트 파일이 감지되었습니다. `context/` 폴더로 전환합니다." 출력 후 context/wbs.md로 갱신
- context 파일 없을 시: `mkdir -p output/{프로젝트명}/context/` 생성
- **참조 URL**: 프롬프트에 URL 포함 시 → Playwright MCP로 방문·스크린샷·구조 분석 (GNB·주요기능·레이아웃 파악). 미포함 시 → 프로젝트명으로 공식 사이트 웹 검색 시도. 접속/검색 모두 실패 시 → "현행 사이트 미확인" 표기 후 진행.

**모드 판정 출력**:
```
[WBS Step 0] 모드: {연계(자동)/연계(수동)/독립} | FN: {n건/없음} | IA: {있음/없음} | context: {있음/없음} | 참조사이트: {URL/검색결과/미확인}
```

### Step 1: 산출물 생성

`.claude/skills/plan-wbs/SKILL.md` 지식을 참조하여 WBS를 생성합니다.

- **연계 모드**: `context/fn.md` FN 전수 매핑 → FN 복잡도별 공수 기준 적용 → 업종 보정 계수 적용
- **독립 모드**: 수집된 정보로 역할×규모 참조 테이블 + 3점 추정법 적용
- MD 필수 섹션 7개 출력 (SKILL.md 출력 명세 참조):
  1. 문서 개요
  2. 마일스톤
  3. 작업 분해 테이블 (Wave + 우선순위 포함)
  4. 간트 차트 (텍스트 기반)
  5. 크리티컬 패스
  6. 리스크 레지스터 (5건+)
  7. 리소스 배정

### Step 2: Self-Check

`.claude/skills/plan-wbs/checklist.md` 전 항목을 확인합니다.

- 연계 모드 전용 항목: orphan FN(WBS 미매핑) 0건 확인
- 공통 항목: 크리티컬 패스 1개 이상, 리스크 레지스터 5건+, 버퍼율 ≥10%

```
[Self-Check] PASS {n}/{n} | FAIL {n}/{n}
→ FAIL 1건 이상 시 수정 후 재확인
```

### Step 3: 저장 + context 갱신

**MD 저장**:
```
output/{프로젝트명}/{YYYYMMDD}/WBS_{프로젝트코드}_{버전}.md
```

**context/wbs.md 갱신 (overwrite)**:
```markdown
---
skill: wbs
date: YYYYMMDD
version: v1.0
status: 완료
---
## 핵심 지표
- 총 작업: N건
- 총 기간: N주
- Phase별: 기획N / 디자인N / 퍼블N / QAN / 런칭N
- 크리티컬 패스: WBS-_._ → ... → WBS-_._ (N일)
- 버퍼: N%
## 다음 단계 참조용 요약
- 마일스톤: M1 {날짜} / M2 {날짜} / ...
- 고위험 리스크: {요약}
- 리소스 피크: {역할, Wave}
```

**절대 금지**: `_context.md` append 방식 사용 금지

### Step 4: 산출물 렌더링

MD 저장 완료 후 render.js를 호출합니다:

```
node .claude/skills/plan-wbs/scripts/render.js output/{프로젝트명}/{YYYYMMDD}/WBS_{프로젝트코드}_{버전}.md
```

- 성공 시: `.html` + `.pdf` 동시 생성 확인
- 실패 시: MD는 유효 — HTML/PDF 생성 실패를 사용자에게 알리고 계속 진행

## 스코프 안내

이 환경에서 실행 가능한 스킬: **plan-wbs 단 1개**

**스코프 외 요청 시**:
"이 환경은 작업분해구조(plan-wbs) 전용입니다. 해당 기능은 다음 패키지에서 실행하십시오:"

| 요청 | 패키지 |
|------|--------|
| 고객질의서 | plan-qst |
| 요구사항정의서 | plan-req |
| 기능정의서 | plan-fn |
| 정보구조설계 | plan-ia |
| 화면설계서 | plan-sb |

## 산출물 경로 규칙

> **이 규칙은 모든 스킬·에이전트·라우터보다 우선합니다.**

| 항목 | 규칙 |
|------|------|
| 저장 경로 | `output/{프로젝트명}/{YYYYMMDD}/` |
| 파일명 | `WBS_{프로젝트코드}_{버전}.md` |
| context | `output/{프로젝트명}/context/wbs.md` (overwrite) |

**절대 금지**:
- `output/planning/` 경로 사용 금지
- 번호 접두사(`01_`, `02_` 등) 파일명 생성 금지
- `_context.md` append 방식 사용 금지

## 에이전트 및 스킬

에이전트: `AGENTS.md` 참조
스킬: `.claude/skills/plan-wbs/SKILL.md`
