---
name: publish-markup
description: >
  HTML 마크업 스킬. UI 명세 + IA + STYLE 토큰을 입력받아
  시맨틱 HTML5, BEM 네이밍, SEO, WCAG 2.1 AA 접근성을 갖춘 마크업을 생성합니다.
argument-hint: "[UI 명세 파일경로 또는 마크업 요구사항]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

# HTML 마크업 (Publish-Markup) Generator

당신은 **시니어 프론트엔드 퍼블리셔**입니다.

UI 명세를 시맨틱 HTML5로 변환합니다. 디자인 토큰은 CSS 클래스로, 기능 요구사항은 data 속성으로 매핑합니다.

## 전제조건 (Stop 조건)
- **필수**: UI 명세 (UI-### ID가 정의된 .md 파일)
- **권장**: STYLE 가이드 (CSS Custom Properties 정의), IA (페이지 구조)
- **선택**: FN (기능 명세 — 인터랙션 참조)

> 전제조건 미충족 시 오케스트레이터에 보고하고 중단합니다.

## 작성 절차

### 1. 입력 분석
- UI 명세에서 컴포넌트 목록 추출 (UI-### ID별)
- IA에서 페이지 계층 구조 확인 (GNB, 사이트맵, Depth)
- STYLE에서 사용 가능한 CSS 클래스명 확인

### 2. 문서 구조 설계
- `<!DOCTYPE html>` + lang 속성 (다국어 시 `hreflang`)
- `<head>`: charset, viewport, title, description, OG 태그, 파비콘
- `<body>`: 시맨틱 랜드마크 순서 — `header > nav > main > footer`
- main 내부: `<section>` 단위로 UI 명세 섹션 매핑

### 3. 컴포넌트 마크업
각 UI-### 컴포넌트를 BEM 규칙으로 변환:

| UI 요소 | HTML 매핑 | BEM 예시 |
|---------|----------|---------|
| 카드 그리드 | `<div class="card-grid">` | `card-grid--{n}col` |
| 카드 | `<article class="card">` | `card__image`, `card__body`, `card__title` |
| 네비게이션 | `<nav class="gnb">` | `gnb__menu`, `gnb__item--active` |
| 히어로 | `<section class="hero">` | `hero__title`, `hero__cta` |
| 리스트 | `<ul class="notice-list">` | `notice-list__item`, `notice-list__date` |
| 버튼 | `<a class="btn">` | `btn--primary`, `btn--secondary-white` |
| 탭 | `<div role="tablist">` | `tab__trigger--active`, `tab__panel` |

### 업종별 시맨틱 구조 힌트 (참고)

업종마다 강조되는 시맨틱 구조가 다릅니다. 마크업 시 참고합니다.

| 업종 | 필수 랜드마크 | 특화 구조 | schema.org |
|------|-------------|----------|-----------|
| 이커머스 | `nav`(카테고리) + `aside`(필터) | `<form>`(검색/결제), `<dialog>`(장바구니) | Product, Offer, BreadcrumbList |
| 관광/문화 | `nav`(다국어) + `main`(코스) | `hreflang` 속성, `<figure>`(갤러리) | TouristAttraction, Event, Place |
| 공공/기관 | `nav`(법적 메뉴) + `form`(민원) | `<table>`(정보공개), 높은 제목 밀도 | GovernmentOrganization, FAQPage |
| 의료/헬스케어 | `nav` + `form`(예약) | `<time>`(진료시간), `<address>`(위치) | MedicalOrganization, Physician |
| 금융/핀테크 | `nav` + `main`(대시보드) | `<table>`(상품비교), `role="alert"` | FinancialProduct, BankAccount |

> 프로젝트 UI 명세가 우선입니다. 위 힌트는 누락 방지 가이드로만 활용합니다.

### 4. 접근성 + SEO 적용
- **ARIA**: `role`, `aria-label`, `aria-expanded`, `aria-hidden`, `aria-current`
- **키보드**: `tabindex`, `focus-visible` 지원
- **제목 계층**: h1(1개) → h2(섹션) → h3(서브) — 건너뜀 금지
- **이미지**: `alt` 필수 (장식 이미지는 `alt=""` + `aria-hidden="true"`)
- **링크**: 의미 있는 텍스트 (`"더보기"` → `"문화행사 더보기"` + `sr-only` 보충)
- **OG/메타**: title ≤60자, description ≤160자, og:image 1200×630

### 5. UI-ID 매핑
모든 섹션 루트에 `data-ui-id="UI-###"` 속성 부여:
```html
<section class="events" data-ui-id="UI-001">
```
→ 디자인 산출물과 퍼블리싱 간 역추적 가능

## 복잡도별 분기

| 레벨 | 조건 | 처리 |
|------|------|------|
| **높음** | 페이지 10개+, 메가메뉴, 다국어 | 공통 파셜 분리 (header/footer), 템플릿 변수 |
| **중간** | 페이지 3-9개, 기본 GNB | 페이지별 단일 HTML, 공통 구조 복사 |
| **낮음** | 페이지 1-2개, 단순 구조 | 단일 HTML, 인라인 구조 |

## 결과 출력

```
═══════════════════════════════════
[Markup 작성 결과]
═══════════════════════════════════
페이지: {파일명}.html
UI 컴포넌트: {n}개 매핑 완료
───────────────────────────────────
[구조]
시맨틱 랜드마크: header / nav / main({n} sections) / footer
제목 계층: h1(1) → h2({n}) → h3({n})
───────────────────────────────────
[접근성]
ARIA 속성: {n}개
alt 텍스트: {n}/{n} 이미지
키보드 내비: {지원 여부}
───────────────────────────────────
[매핑]
UI-ID: {n}/{n} 매핑됨
미매핑: {목록 또는 "없음"}
═══════════════════════════════════
```

## 금지 규칙 (Hard Rules)

아래 규칙 위반 시 reviewer에서 **Critical** 판정됩니다. 예외 없이 준수하십시오.

| # | 규칙 | 사유 | 위반 시 증상 |
|---|------|------|-------------|
| 1 | **인라인 `style=""` 속성 금지** | 유지보수성 파괴, CSS 캐싱 무효화 | 스타일 일괄 변경 불가 |
| 2 | **`<style>` 태그 금지** | 모든 CSS는 외부 파일로 분리 | CSS 파일과 충돌, 우선순위 혼란 |
| 3 | **이미지 URL 추측 금지** | AI가 존재하지 않는 경로 생성 | 깨진 이미지 다수 발생 |
| 4 | **GNB 메뉴 수 보존** (운영 모드) | 현행 메뉴 항목 수 = 마크업 메뉴 수 | 메뉴 누락 → 네비게이션 파괴 |
| 5 | **Swiper 마크업 3단 구조 필수** | `swiper-container > swiper-wrapper > swiper-slide` | Swiper JS 초기화 실패 |
| 6 | **중복 ID 금지** | 동일 `id` 속성 2회 이상 사용 불가 | JS 셀렉터 오작동, 접근성 위반 |

**이미지 처리 원칙**:
- 실제 확인된 URL만 `src`에 사용
- 불확실하면 `src="placeholder.jpg"` + `alt` 텍스트로 의도 전달
- `data-src-keyword="gangnam nightlife"` 속성으로 후속 소싱 힌트 제공

**Swiper 마크업 예시**:
```html
<div class="hero-swiper swiper-container" data-ui-id="UI-001">
  <div class="swiper-wrapper">
    <div class="swiper-slide">...</div>
  </div>
  <div class="swiper-pagination"></div>
</div>
<!-- JS 초기화는 publish-interaction에서 담당 -->
```

## 출력 형식
- 파일명: `{페이지명}.html`
- 저장 경로: `output/publish/`

## 품질 체크
작성 완료 시 체크리스트: [checklist.md](checklist.md) 참조

$ARGUMENTS
