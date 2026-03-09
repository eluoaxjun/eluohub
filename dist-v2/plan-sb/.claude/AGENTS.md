# plan-sb 에이전트 시스템

## 에이전트

### planning-orchestrator (Sonnet)
- 역할: 화면설계서 생성 조율 (pm-router 초기화 → plan-sb 실행 → 검수 제안)
- 호출: SB 관련 키워드 감지 시 자동
- 파일: `agents/planning-orchestrator.md`

### planning-reviewer (Sonnet)
- 역할: 기획 산출물 검수
- 모드: unit (단독 스킬 실행 시 Critical P/F 판정)
- 호출: 스킬 실행 완료 후 자동 또는 수동
- 파일: `agents/planning-reviewer.md`

## 스킬

### plan-sb (화면설계서)
- 설명: JSON 데이터를 입력받아 HTML/PDF 화면설계서를 자동 생성 (테마 프리셋, v1/v2 스키마 정규화, 다중 프레임 타입 지원)
- 자동 호출 키워드: "화면설계", "화면설계서", "SB", "와이어프레임", "화면 명세", "스토리보드"
- 실행 모드: 자동(JSON 발견) / 대화형(JSON 미발견)
- 파일: `skills/plan-sb/SKILL.md`
