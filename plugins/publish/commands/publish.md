# 퍼블리싱 (Publish) Generator

디자인 산출물(UI 명세, STYLE 가이드)을 HTML/CSS/JS로 구현합니다.

## 프로세스
- **구축**: Markup -> Style -> Interaction (풀 프로세스)
- **운영**: 변경 대상만 선택 실행 (간소화)

## 산출물
| 산출물 | 설명 |
|--------|------|
| HTML | 시맨틱 마크업, UI-ID 매핑 (data-ui-id) |
| CSS | STYLE 토큰 기반 Custom Properties |
| JS | FN 명세 기반 인터랙션 구현 |

## 사용법
- `/publish [프로젝트명]` -- 전체 퍼블리싱 워크플로우
- `/publish-markup [입력]` -- HTML만
- `/publish-style [입력]` -- CSS만
- `/publish-interaction [입력]` -- JS만

## 입력 요구사항
| 산출물 | 필수 | 용도 |
|--------|------|------|
| UI 명세 (`output/design/`) | **필수** | HTML 구조 근거 |
| STYLE 가이드 (`output/design/`) | **필수** | CSS 토큰 소스 |
| FN 명세 (`output/planning/`) | 권장 | 인터랙션 요구사항 |
| Layout (`output/design/`) | 권장 | 그리드/여백 |
| IA (`output/planning/`) | 권장 | GNB/페이지 계층 |

## 핵심 규칙
1. STYLE 토큰 = CSS Custom Properties 1:1 매핑
2. UI-### → data-ui-id 속성으로 추적성 확보
3. FN-### → 인터랙션 구현 근거 명시

## 이터레이션
코드 품질 80점 미만 또는 Critical 시 **최대 3회** 수정→재검수 루프를 실행합니다.

$ARGUMENTS
