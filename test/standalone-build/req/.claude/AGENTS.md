# plan-req 에이전트 시스템

## 에이전트

### planning-orchestrator (Sonnet)
- 역할: 기획 산출물 생성 조율 (pm-router → plan-req → reviewer)
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

### plan-req (요구사항정의서)
- 설명: QST 기반으로 기능/비기능 요구사항 정의 (AC, NFR 측정기준, 추적성 매트릭스 포함)
- 자동 호출 키워드: "요구사항", "요구사항정의", "REQ", "스펙 정리", "기능 요구사항", "요구사항 도출"
- 실행 모드: 독립 / 연계 (자동 감지)
- 파일: `skills/plan-req/SKILL.md`
