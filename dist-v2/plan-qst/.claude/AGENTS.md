# plan-qst 에이전트 시스템

## 에이전트

### planning-orchestrator (Sonnet)
- 역할: 기획 산출물 생성 조율 (PM Direction → 프로젝트 초기화 → QST 생성 → 검수)
- 모드: 전체 흐름 (Step 0-PM ~ Step 4)
- 호출: "고객질의서", "질의서", "QST", "고객에게 물어볼", "인터뷰 질문" 등 키워드 감지 시 자동
- 파일: `agents/planning-orchestrator.md`

### planning-reviewer (Sonnet)
- 역할: 기획 산출물 검수
- 모드: unit (단독 스킬 실행 시 Critical P/F 판정)
- 호출: 스킬 실행 완료 후 자동 또는 수동
- 파일: `agents/planning-reviewer.md`

## 스킬

### plan-qst (고객질의서)
- 설명: 고객 요구사항 파악을 위한 구조화된 질의서 생성
- 자동 호출 키워드: "고객질의서", "질의서", "QST", "고객에게 물어볼", "클라이언트 질문", "확인할 것 정리", "고객한테 뭘", "확인사항 정리"
- 실행 모드: 독립 / 연계 (자동 감지)
- 파일: `skills/plan-qst/SKILL.md`
