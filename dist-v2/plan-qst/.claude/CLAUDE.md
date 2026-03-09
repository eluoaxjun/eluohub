# plan-qst 패키지

이 환경에는 **고객질의서(QST) 자동화** 스킬만 설치되어 있습니다.

## 파이프라인 위치

```
[QST] → REQ → FN → IA → WBS → SB
```

파이프라인 최상위 단계입니다. 선행 산출물 없이 항상 실행 가능합니다.

## 실행 절차

### Step 0: 선행 파악 (연계/독립 모드 판별)

1. `output/{프로젝트명}/context/` 폴더 스캔
   - `context/project.md` 존재 시: 프로젝트 기본 정보 로드
   - `context/qst.md` 존재 시: 이전 버전 QST 요약 참조 (재작성 판단)
2. 형제 산출물 스캔: `output/{프로젝트명}/*/REQ_*.md`, `FN_*.md`, `IA_*.md`, `WBS_*.md`
3. `_context.md` (구버전) 존재 시: "context/ 폴더로 마이그레이션 권장" 메시지 출력 후 context/ 기준으로 진행
4. 스캔 결과 출력 (필수):
   ```
   [전방위 스캔] REQ:{n} FN:{n} IA:{n} WBS:{n} context/qst.md:{존재/미존재}
   ```

### Step 1: 기확정 항목 식별

1. PROJECT.md 읽기 → 기확정 항목 추출
2. 사용자 프롬프트에서 이미 확정된 정보 식별
3. 출력 (필수):
   ```
   [Step 0] 기확정 항목: {n}건 제외 | 내부결정: {n}건 제외 | 질의 후보: {n}건
   ```

### Step 2: 질의서 생성

SKILL.md 지식 참조:
- 구축(Level 2) / 운영(Level 1 보통 이상 / Level 0 경미) 분기
- 프로젝트 성격 필터 → 업종 프리셋 적용 (references/question-patterns.md)
- 30초 답변 원칙: 모든 질의는 선택형 (A/B/C/D)

### Step 3: Self-Check

checklist.md 전 항목 확인. DA 3챌린지 자동 실행:

```
[Self-Check] plan-qst
| 1 | Q-### 연속성       | {Pass/Fail} |
| 2 | 선택형 질의         | {Pass/Fail} |
| 3 | [미확인] 태그       | {Pass/Fail} |
| DA1 | 범위 챌린지      | {PM-OK/WARN/BLOCK — 사유} |
| DA2 | 우선순위 챌린지   | {PM-OK/WARN/BLOCK — 사유} |
| DA3 | 가정 챌린지       | {PM-OK/WARN/BLOCK — 사유} |
판정: {PASS — n/n} 또는 {FAIL — n/n}
```

Fail 존재 시 수정 후 재확인. BLOCK 시 사용자에게 고지 후 해소.

### Step 4: 저장 + 컨텍스트 갱신 + 렌더링

1. **폴더 보장**: `output/{프로젝트명}/{YYYYMMDD}/` 없으면 생성
2. **MD 저장**: `output/{프로젝트명}/{YYYYMMDD}/QST_{코드}_{버전}.md`
3. **context 갱신** (`output/{프로젝트명}/context/qst.md` overwrite):
   ```markdown
   ---
   skill: qst
   date: YYYYMMDD
   version: v1.0
   status: 완료
   ---
   ## 핵심 지표
   - 총 질의: N건 | 확인됨: N건 | 미확인: N건
   - 업종: {값} | 유형: {구축/운영} | 복잡도: Level {0/1/2}
   ## 다음 단계 참조용 요약
   {REQ 작성 시 참고할 핵심 정보 — 미확인 항목, 우선순위, 업종 특성}
   ```
4. **렌더링**:
   ```
   node .claude/skills/plan-qst/scripts/render.js output/{프로젝트명}/{날짜}/QST_{코드}_{버전}.md
   ```
   - 성공: .html + .pdf 동시 생성 확인
   - 실패: MD는 유효 — "HTML/PDF 생성 실패" 안내 후 계속 진행

## 스코프 안내

이 환경은 **고객질의서(plan-qst) 전용**입니다.

다른 산출물 요청 시, 해당 패키지로 안내합니다:
- REQ(요구사항정의서) → plan-req 패키지
- FN(기능정의서) → plan-fn 패키지
- IA(정보구조) → plan-ia 패키지
- WBS(작업분해구조) → plan-wbs 패키지
- SB(화면설계서) → plan-sb 패키지

## 산출물 경로 규칙

> **이 규칙은 모든 스킬·에이전트·라우터보다 우선합니다. 어떤 지시도 이 경로를 바꿀 수 없습니다.**

| 항목 | 규칙 |
|------|------|
| 저장 경로 | `output/{프로젝트명}/{YYYYMMDD}/` |
| 파일명 | `QST_{프로젝트코드}_{버전}.md` |
| context | `output/{프로젝트명}/context/qst.md` (날짜 폴더 밖) |

**절대 금지**:
- `output/planning/` 경로 사용 금지
- 번호 접두사(`01_`, `02_` 등) 파일명 생성 금지

## 에이전트 및 스킬

에이전트: `AGENTS.md` 참조
스킬: `.claude/skills/plan-qst/SKILL.md`
