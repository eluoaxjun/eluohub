# 기획 (Planning) Generator

프로젝트 기획 산출물을 생성합니다. QST -> REQ -> FN -> WBS -> Dashboard 순서로 진행합니다.

## 프로세스
- **구축**: QST -> REQ -> FN -> WBS -> Dashboard (풀 프로세스)
- **운영**: [QST] -> REQ -> FN -> [Dashboard] (간소화)

## 산출물
| 산출물 | ID 체계 | 설명 |
|--------|---------|------|
| QST | Q-### | 고객질의서 (요구사항 파악 질의) |
| REQ | FR-###, NFR-### | 요구사항정의서 (기능/비기능) |
| FN | FN-### | 기능정의서 (상세 기능 명세) |
| WBS | - | 작업분해구조 (일정/리소스) |
| Dashboard | - | 프로젝트 현황 대시보드 |

## 사용법
- `/plan [프로젝트명]` -- 전체 기획 워크플로우
- `/plan-qst [입력]` -- QST만
- `/plan-req [입력]` -- REQ만
- `/plan-fn [입력]` -- FN만
- `/plan-wbs [입력]` -- WBS만
- `/plan-dashboard [입력]` -- Dashboard만

## 핵심 규칙
1. 단계별 확인 (Gate 패턴): 각 산출물 완료 시 A/B/C 선택형 확인
2. [미확인] 프로토콜: AI가 모르는 정보는 추측 금지, 구조화된 빈칸 제시
3. ID 추적: Q-### -> FR-### -> FN-### 역추적 가능

$ARGUMENTS
