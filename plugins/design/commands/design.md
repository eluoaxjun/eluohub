# 디자인 (Design) Generator

웹사이트 디자인 산출물을 생성합니다. 단일 파이프라인으로 벤치마킹 → HTML A/B/C 직접 생성 → 검수 순서입니다.

## 프로세스

```
Step 0: PM Direction — 컨텍스트 파악, 범위 결정
Step 1: [선택] 기획 (REQ/FN) — 대규모 프로젝트 시
Step 2: [분기] 디자인 생성
  A. Figma 있음 → Figma MCP → HTML/CSS/JS 변환
  B. Figma 없음 → 벤치마킹 → HTML A/B/C 직접 생성
Step 3: 검수 — 100점 채점 + check_images.js
Step 4: [선택] 퍼블리싱 최적화
Step 5: [선택] Style Guide 역추출
Step 6: [선택] QA
```

## 산출물
| 산출물 | 설명 |
|--------|------|
| Benchmark | 경쟁사/참조 사이트 분석 |
| HTML A/B/C | 레이아웃이 다른 3개 시안 (HTML/CSS) |
| Style Guide | 선택된 시안에서 CSS 변수 역추출 (멀티페이지 시) |

## 사용법
- `/design [프로젝트명]` -- 전체 파이프라인
- `/design-benchmark [URL]` -- 벤치마킹만

$ARGUMENTS
