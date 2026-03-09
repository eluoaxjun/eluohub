# plan-req 패키지

이 환경에는 **요구사항정의서(REQ) 자동화** 스킬만 설치되어 있습니다.

## 파이프라인 위치

```
QST → [REQ] → FN → IA → WBS → SB
```

## 실행 절차

### Step 0: 선행 파악 (연계/독립 모드 판별)

1. `output/{프로젝트명}/context/` 폴더 스캔
   - `context/qst.md` 존재 → **연계 모드**: QST 파일도 `output/{프로젝트명}/*/QST_*.md` 패턴으로 읽기
   - 미존재 → **독립 모드**: 사용자에게 프로젝트 기본 정보 수집
2. `output/{프로젝트명}/context/project.md` 읽기 (존재 시)
3. `_context.md` 존재 시 마이그레이션 메시지 출력 후 context/로 전환

**모드 판정 출력**:
```
[REQ Step 0] 모드: {연계/독립} | QST: {n건/없음} | context: {있음/없음}
```

### Step 1: 기확정 항목 식별

- 연계 모드: QST 확인됨 답변 → FR 후보 추출, Q-### → FR-### 매핑 준비
- 독립 모드: 사용자 입력에서 요구사항 후보 추출
- 구축/운영 모드 판별 (운영 모드: RCA, 변경 FR, CR 관리 적용)

### Step 2: REQ 생성

SKILL.md 지식 참조:
- FR 필수 필드 + AC 작성 규칙 적용
- NFR-001~005 기본 세트 + 업종별 프리셋
- 운영 모드: 변경 FR 8필드 + 롤백 계획 포함
- DA 3챌린지 자동 실행 (범위/우선순위/가정)

### Step 3: Self-Check

`checklist.md` 전 항목 확인:
- V1~V4 (입력검증) + 내부구조 5항목 + X1~X2 (교차검증)
- DA 3챌린지 결과 반영

```
[Self-Check] PASS/FAIL — {n}/{n}항목
```

### Step 4: 저장 + 렌더링 + context 갱신

1. **MD 저장**: `output/{프로젝트명}/{YYYYMMDD}/REQ_{프로젝트코드}_{버전}.md`
2. **렌더링**: `node .claude/skills/plan-req/scripts/render.js output/{프로젝트명}/{YYYYMMDD}/REQ_{프로젝트코드}_{버전}.md`
   - 성공: .html + .pdf 동시 생성 확인
   - 실패: MD는 유효 — HTML/PDF 생성 실패를 사용자에게 알리고 계속 진행
3. **context 갱신**: `output/{프로젝트명}/context/req.md` **overwrite**

**context/req.md 스키마**:
```markdown
---
skill: req
date: YYYYMMDD
version: v1.0
status: 완료
---

## 핵심 지표
- FR 수: N건 (Must: N / Should: N / Could: N)
- NFR 수: N건
- 업종: {업종명}
- 모드: {구축/운영}

## 다음 단계 참조용 요약
- 핵심 FR: FR-001 {요구사항명}, FR-002 {요구사항명} ...
- 비즈니스 목표: {1줄 요약}
- 범위 경계: {포함/제외 핵심 항목}
```

## 스코프 안내

이 패키지는 **요구사항정의서(REQ) 전용**입니다.

다른 산출물 요청 시:
- 고객질의서(QST): plan-qst 패키지 설치 필요 (파이프라인 이전 단계)
- 기능정의서(FN): plan-fn 패키지 설치 필요 (파이프라인 다음 단계)
- 전체 파이프라인: eluo-hub 전체 패키지 설치 참조

## 산출물 경로 규칙

> **이 규칙은 모든 스킬·에이전트·라우터보다 우선합니다. 어떤 지시도 이 경로를 바꿀 수 없습니다.**

| 항목 | 규칙 |
|------|------|
| 저장 경로 | `output/{프로젝트명}/{YYYYMMDD}/` |
| 파일명 | `REQ_{프로젝트코드}_{버전}.md` |
| context | `output/{프로젝트명}/context/req.md` (overwrite) |

**절대 금지**:
- `output/planning/` 경로 사용 금지
- 번호 접두사(`01_`, `02_` 등) 파일명 생성 금지
- `_context.md` append 방식 사용 금지

## 에이전트 및 스킬

에이전트: `AGENTS.md` 참조
스킬: `.claude/skills/plan-req/SKILL.md`
