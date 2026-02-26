# Design → Publish 핸드오프 프로토콜

디자인 패키지에서 퍼블리싱 패키지로 산출물을 전달할 때의 데이터 계약입니다.

## 핸드오프 파일

디자인 완료 시 `output/design/_handoff.md`를 생성합니다.

### 형식

```markdown
# Design → Publish Handoff

## 메타정보
- 프로젝트: {프로젝트명}
- 디자인 완료일: {YYYY-MM-DD}
- 디자이너: design-orchestrator
- 검수 점수: {점수}/100

## 산출물 목록
| 파일명 | 유형 | 상태 | 비고 |
|--------|------|------|------|
| 디자인_{프로젝트명}_{페이지}_v{n}_{버전}.html | HTML 시안 | 완료 | 선택된 버전 |
| 벤치마킹_{사이트명}.jpg | 레퍼런스 | 완료 | |

## 퍼블리싱 참고
- 브레이크포인트: M≤767 / T 768-1023 / D≥1024
- 이미지: check_images.js 검증 완료
- CSS 변수: HTML 내 :root에 정의됨

## 알려진 이슈
- {이슈 목록}

## 디자이너 메모
{퍼블리싱 단계에 전달할 참고 사항}
```

## Publish 수신 절차

publish-orchestrator Step 0에서 `_handoff.md`를 처리합니다.

### 존재 시
1. 파일 파싱 → 메타정보, 산출물 목록 추출
2. HTML 시안 파일 확인 → CSS 변수, 구조 분석
3. 알려진 이슈 → 퍼블리싱 시 고려사항으로 반영

### 미존재 시 (fallback)
1. `output/디자인/` 또는 `output/design/` 디렉토리 스캔
2. HTML 파일 자동 수집 → CSS 변수 추출

> 핸드오프 파일이 없어도 퍼블리싱 파이프라인은 정상 동작합니다.

## Publish가 기대하는 입력물

| 산출물 | 경로 | 필수 | 용도 |
|--------|------|------|------|
| HTML 시안 | `output/디자인/` | **필수** | 디자인 기준, CSS 변수 소스 |
| IA | `output/planning/` | 권장 | GNB/LNB 메뉴 구조 |
| FN | `output/planning/` | 권장 | 인터랙션 요구사항, JS 기능 근거 |
| _handoff.md | `output/design/` | 권장 | 컨텍스트 자동 수집 |

## 핸드오프 체인

```
Planning → Design → Publish → QA
_handoff.md    _handoff.md    _handoff.md
(planning/)    (design/)      (publish/)
```
