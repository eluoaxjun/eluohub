# plan-fn 에이전트 시스템

## 에이전트

### planning-reviewer (Sonnet)
- 역할: 기획 산출물 검수
- 모드: unit (단독 스킬 실행 시 Critical P/F 판정)
- 호출: 스킬 실행 완료 후 자동 또는 수동
- 파일: `agents/planning-reviewer.md`

## 스킬

### plan-fn (기능정의서)
- 설명: REQ 기반으로 상세 기능 정의 (복잡도별 분기, 검증 3단계, 의존관계 맵 포함)
- 자동 호출 키워드: "기능정의", "기능 명세", "FN", "기능 설계", "기능 상세", "기능정의서"
- 실행 모드: 독립 / 연계 (자동 감지)
- 파일: `skills/plan-fn/SKILL.md`
