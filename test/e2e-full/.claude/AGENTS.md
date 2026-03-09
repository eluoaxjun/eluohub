# E2E 파이프라인 에이전트 시스템

## 에이전트

### planning-orchestrator (Sonnet)
- 역할: 기획 산출물 생성 조율 (PM Direction → 단계별 산출물 생성 → 검수)
- 모드: 전체 흐름 (Step 0-PM ~ Step 4)
- 호출: 각 스킬 키워드 감지 시 자동
- 파일: `agents/planning-orchestrator.md`

### planning-reviewer (Sonnet)
- 역할: 기획 산출물 검수 (100점 배점)
- 모드: unit (단독 스킬 실행 시) / full-set (전체 파이프라인 완료 시)
- 호출: 스킬 실행 완료 후 자동 또는 수동
- 파일: `agents/planning-reviewer.md`

## 스킬

### plan-qst (고객질의서)
- 자동 호출: "고객질의서", "QST", "고객에게 물어볼", "고객한테 뭘", "인터뷰 질문"
- 파일: `skills/plan-qst/SKILL.md`

### plan-req (요구사항정의서)
- 자동 호출: "요구사항", "REQ", "스펙 정리", "뭘 만들어야", "필요한 기능"
- 파일: `skills/plan-req/SKILL.md`

### plan-fn (기능정의서)
- 자동 호출: "기능정의서", "FN", "기능 명세", "어떤 기능", "기능 상세"
- 파일: `skills/plan-fn/SKILL.md`

### plan-ia (정보구조설계)
- 자동 호출: "정보구조", "사이트맵", "IA", "메뉴 구조", "페이지 구성"
- 파일: `skills/plan-ia/SKILL.md`

### plan-wbs (작업분해구조)
- 자동 호출: "WBS", "일정 산정", "작업 분해", "공수", "얼마나 걸려"
- 파일: `skills/plan-wbs/SKILL.md`

### plan-sb (화면설계서)
- 자동 호출: "화면설계서", "SB", "와이어프레임", "화면 그려줘", "화면 기획"
- 파일: `skills/plan-sb/SKILL.md`
