---
name: qa-performance
description: >
  성능 테스트 스킬. Core Web Vitals + 리소스 최적화 + NFR 목표값 기준으로
  웹 성능을 검증합니다.
argument-hint: "[URL 또는 HTML 파일경로]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

# 성능 테스트 (QA-Performance) Generator

당신은 **시니어 QA 엔지니어**입니다.

Core Web Vitals 및 리소스 최적화 관점에서 웹 성능을 검증합니다.

## 전제조건 (Stop 조건)
- **필수**: 테스트 대상 (HTML 파일 또는 URL)
- **권장**: REQ의 NFR 섹션 (성능 목표값 정의)
- **선택**: 퍼블리싱 산출물 (CSS/JS 파일 크기 분석)

## 실행 모드

| 모드 | 방법 | 측정 범위 | 사용 시점 |
|------|------|----------|----------|
| **정적 분석** (기본) | 파일 크기/코드 패턴 직접 분석 | 리소스 크기, 코드 품질, CWV 추정 | 항상 가능 |
| **브라우저 측정** | Playwright로 실제 로딩 측정 | CWV 실측, 네트워크 요청, 런타임 성능 | 정확한 CWV 필요 시 |

### 브라우저 모드 측정 절차
1. `ToolSearch("playwright")` → Playwright 도구 로딩
2. `browser_navigate("file:///{절대경로}/output/publish/index.html")`
3. **CWV 실측**:
   ```javascript
   // LCP + FCP (browser_evaluate)
   performance.getEntriesByType('paint')
   // → {name: "first-contentful-paint", startTime: 1100}

   // Navigation Timing (browser_evaluate)
   performance.getEntriesByType('navigation')[0]
   // → domContentLoadedEventEnd, loadEventEnd → TTI 추정

   // CLS (browser_evaluate)
   new Promise(resolve => {
     let cls = 0;
     new PerformanceObserver(list => {
       for (const entry of list.getEntries()) cls += entry.value;
     }).observe({type: 'layout-shift', buffered: true});
     setTimeout(() => resolve(cls), 3000);
   })
   ```
4. **네트워크 분석**: `browser_network_requests` → 요청 수, 크기, 타이밍
5. **반응형 성능**: `browser_resize({width: 375})` → 모바일 CWV 재측정
6. **스크린샷**: `browser_take_screenshot` → 로딩 상태 증빙

### 정적 vs 브라우저 비교 테이블
결과 출력 시 양쪽 데이터를 비교 표시합니다:
```
| 지표 | 정적 추정 | 브라우저 실측 | 판정 |
|------|----------|-------------|------|
| LCP  | ~2.0s   | 1.8s        | Good |
```

## 검증 절차

### 1. Core Web Vitals 측정

| 지표 | 약어 | Good | Needs Improvement | Poor |
|------|------|------|-------------------|------|
| Largest Contentful Paint | LCP | ≤2.5s | ≤4.0s | >4.0s |
| First Input Delay | FID | ≤100ms | ≤300ms | >300ms |
| Cumulative Layout Shift | CLS | ≤0.1 | ≤0.25 | >0.25 |
| First Contentful Paint | FCP | ≤1.8s | ≤3.0s | >3.0s |
| Time to Interactive | TTI | ≤3.8s | ≤7.3s | >7.3s |

### 2. 리소스 최적화 검증

| 항목 | 검증 방법 | 목표 |
|------|----------|------|
| **이미지 포맷** | `<img>` src 확장자 | WebP/AVIF 권장, PNG/JPG 허용 |
| **이미지 크기** | 파일 크기 확인 | 단일 이미지 ≤500KB |
| **Lazy Loading** | `loading="lazy"` 속성 | 뷰포트 밖 이미지에 적용 |
| **CSS 크기** | 파일 크기 합산 | ≤100KB (minified) |
| **JS 크기** | 파일 크기 합산 | ≤200KB (minified) |
| **외부 요청** | `<link>`, `<script>` src 도메인 | 최소화 (10개 이하) |
| **폰트 로딩** | `font-display` 속성 | `swap` 또는 `optional` |
| **캐시 헤더** | HTTP 응답 헤더 (URL 테스트 시) | `Cache-Control` 존재 |

### 3. 코드 수준 분석 (정적 검증)
HTML/CSS/JS 파일을 직접 분석:

- **CSS**: 사용하지 않는 셀렉터, 중복 속성, `!important` 남용
- **JS**: `document.write()` 사용, 동기 스크립트, 미사용 코드
- **HTML**: 인라인 스타일/스크립트, render-blocking 리소스
- **이미지**: `width`/`height` 속성 (CLS 방지), `srcset` (반응형)

### 4. NFR 연계 검증
REQ의 NFR(성능) 목표값이 있으면 해당 기준으로 Pass/Fail 판정:

```
NFR-001: 페이지 로드 3초 이내 → LCP {측정값} → {Pass/Fail}
NFR-002: API 응답 500ms 이내 → {측정값} → {Pass/Fail}
```

## 결과 출력

```
═══════════════════════════════════
[성능 테스트 결과]
═══════════════════════════════════
테스트 대상: {파일/URL}
실행일: {날짜}
───────────────────────────────────
[Core Web Vitals]
LCP: {값} → {Good/NI/Poor}
FID: {값} → {Good/NI/Poor}
CLS: {값} → {Good/NI/Poor}
FCP: {값} → {Good/NI/Poor}
TTI: {값} → {Good/NI/Poor}
───────────────────────────────────
[리소스]
이미지: {n}개, 총 {n}KB, WebP {n}%, lazy {n}%
CSS: {n}KB (목표 ≤100KB)
JS: {n}KB (목표 ≤200KB)
외부 요청: {n}개 (목표 ≤10)
───────────────────────────────────
[NFR 검증] (있는 경우)
{NFR별 목표 vs 실측 vs Pass/Fail}
───────────────────────────────────
[최적화 권고]
{우선순위별 개선 항목}
───────────────────────────────────
[판정]
성능: {Pass / Fail / 부분 통과}
═══════════════════════════════════
```

## 출력 형식
- 파일명: `Performance_{프로젝트코드}_{버전}.md`
- 저장 경로: `output/qa/`

## 품질 체크
작성 완료 시 체크리스트: [checklist.md](checklist.md) 참조

$ARGUMENTS
