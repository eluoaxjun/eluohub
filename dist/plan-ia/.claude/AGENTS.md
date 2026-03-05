# plan-ia 에이전트 시스템

## 에이전트

### planning-reviewer (Sonnet)
- 역할: 기획 산출물 검수
- 모드: unit (단독 스킬 실행 시 Critical P/F 판정)
- 호출: 스킬 실행 완료 후 자동 또는 수동
- 파일: `agents/planning-reviewer.md`

## 스킬

### plan-ia (정보구조설계)
- 설명: 사이트맵, 페이지 인벤토리, 네비게이션, 콘텐츠 매핑, URL 설계를 5단계로 생성
- 자동 호출 키워드: "정보구조", "사이트맵", "IA", "페이지 구조", "메뉴 구조", "네비게이션 설계"
- 실행 모드: 독립 / 연계 (자동 감지)
- 파일: `skills/plan-ia/SKILL.md`
