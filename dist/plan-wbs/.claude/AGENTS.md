# plan-wbs 에이전트 시스템



> **변경 이력 v1.9 (2026-04-24 ~ 2026-04-27)**
> - SKILL.md 갱신, dist orchestrator skills 단독화, 메타 파일 동기화

## 에이전트

### planning-orchestrator (Sonnet)
- 역할: 작업분해구조서 생성 조율 (pm-router 초기화 → plan-wbs 실행 → 검수 제안)
- 호출: WBS 관련 키워드 감지 시 자동
- 파일: `agents/planning-orchestrator.md`

### planning-reviewer (Sonnet)
- 역할: 기획 산출물 검수
- 모드: unit (단독 스킬 실행 시 Critical P/F 판정)
- 호출: 스킬 실행 완료 후 자동 또는 수동
- 파일: `agents/planning-reviewer.md`

## 스킬

### plan-wbs (작업분해구조)
- 설명: FN/IA 기반으로 프로젝트 일정과 작업 분해 (크리티컬 패스, 마일스톤 포함)
- 자동 호출 키워드: "WBS", "작업분해", "일정 산정", "스케줄", "마일스톤", "일정 계획"
- 실행 모드: 독립 / 연계 (자동 감지)
- 파일: `skills/plan-wbs/SKILL.md`
