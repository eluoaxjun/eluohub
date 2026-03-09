# plan-wbs 에이전트 시스템

## 에이전트

### planning-orchestrator (Opus)
- 역할: 기획 산출물 생성 조율 (pm-router → plan-wbs → reviewer)
- 호출: detector.mjs 키워드 감지 시 자동 호출
- 파일: `agents/planning-orchestrator.md`

### planning-reviewer (Sonnet)
- 역할: 기획 산출물 검수
- 모드: unit (단독 스킬 실행 시 Critical P/F 판정)
- 호출: 스킬 실행 완료 후 자동 또는 수동
- 파일: `agents/planning-reviewer.md`

## 스킬

### pm-router (PM 라우터)
- 설명: 운영/구축 모드 판별 + 프로젝트 초기화 (PROJECT.md, 폴더 구조)
- 호출: planning-orchestrator Step 1에서 자동 실행
- 파일: `skills/pm-router/SKILL.md`

### plan-wbs (작업분해구조)
- 설명: FN/IA 기반으로 프로젝트 일정과 작업 분해 (크리티컬 패스, 마일스톤 포함)
- 자동 호출 키워드: "WBS", "작업분해", "일정 산정", "스케줄", "마일스톤", "일정 계획"
- 실행 모드: 독립 / 연계 (자동 감지)
- 파일: `skills/plan-wbs/SKILL.md`
