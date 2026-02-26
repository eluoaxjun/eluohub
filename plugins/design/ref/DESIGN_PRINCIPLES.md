# DESIGN_PRINCIPLES — 범용 웹디자인 원칙

> v2.0 | 2026.02.23 | AI 파이프라인 참조용 | 업종 무관 적용
> 근거: Refactoring UI, NNGroup, IxDF, Elementor, SiteGround, Brad Frost, Nathan Curtis

---

## 이 문서의 역할

모든 프로젝트에 적용되는 **범용 디자인 참고 가이드**이다.
HTML 시안 생성 시 이 원칙을 참조하되, 프로젝트 특성과 브랜드 시트에 맞게 적용한다.

---

## §1. 시각적 위계 (Visual Hierarchy)

> "위계가 없으면 모든 것이 똑같이 보이고, 사용자는 어디를 봐야 할지 모른다."
> — NNGroup

### 1.1 위계의 3단계

| 단계 | 용도 | 텍스트 처리 | 컬러 처리 |
|------|------|-----------|----------|
| Primary | 핵심 정보 (제목, CTA) | 크고 굵게 (Bold, 큰 사이즈) | 진한 색 (#111827 수준) |
| Secondary | 보조 정보 (날짜, 카테고리) | 중간 크기, Regular | 회색 (#6B7280 수준) |
| Tertiary | 부가 정보 (캡션, 메타) | 작은 크기, Regular | 연회색 (#9CA3AF 수준) |

### 1.2 위계 구현 도구 (우선순위 순)

1. **크기(Scale)** — 가장 강력. 중요한 것을 크게.
2. **굵기(Weight)** — Bold는 같은 크기에서 면적을 늘려 강조.
3. **색상(Color)** — 대비로 시선 유도. 채도가 높을수록 강조.
4. **간격(Space)** — 여백이 많을수록 고급스럽고 강조됨.
5. **위치(Position)** — 상단/좌측이 먼저 읽힘 (F-패턴, Z-패턴).

### 1.3 강조/약화 규칙

- **강조하려면**: 크기 키우기, 굵기 올리기, 진한 색 사용
- **약화하려면**: 크기 줄이기, 색상 연하게, 간격 줄이기
- **핵심 원칙**: "강조할 것을 키우지 말고, 나머지를 줄여라" (de-emphasize to highlight)
- 한 화면에 강조 요소는 **최대 1~2개**. 전부 강조하면 아무것도 강조되지 않음.

### 1.4 버튼 위계

| 단계 | 스타일 | 용도 |
|------|--------|------|
| Primary | 채움(filled), 브랜드 컬러 | 핵심 액션 (제출, 구매, CTA) |
| Secondary | 아웃라인(outlined) 또는 연한 배경 | 보조 액션 (취소, 더보기) |
| Tertiary | 텍스트 링크 스타일 | 부가 액션 (건너뛰기, 상세보기) |

- 파괴적 액션(삭제)이라고 무조건 빨간색/굵게 하지 않는다. 위계로 판단.

---

## §2. 간격 체계 (Spacing System)

> "여백은 생각보다 훨씬 많이 필요하다. 너무 많은 여백에서 시작해서 줄여라."
> — Refactoring UI

### 2.1 8px 기반 간격 스케일

```
4px   — 아이콘 내부, 인라인 간격
8px   — 최소 간격 (라벨↔입력, 아이콘↔텍스트)
12px  — 밀접한 요소 간 (리스트 아이템 내부)
16px  — 기본 단위 (단락 간, 카드 내부 패딩)
24px  — 요소 그룹 간 (폼 필드 사이)
32px  — 블록 간 (카드↔카드, 콘텐츠 블록 간)
48px  — 섹션 내부 큰 구분
64px  — 섹션 간 간격 (데스크톱 최소)
96px  — 섹션 간 간격 (데스크톱 표준)
128px — 섹션 간 간격 (여유로운 프리미엄 느낌)
```

### 2.2 간격 3대 규칙

1. **내부 < 외부**: 요소의 내부 간격(padding)은 외부 간격(margin)보다 작거나 같다.
2. **그룹 내 < 그룹 간**: 같은 그룹의 요소 간격 < 다른 그룹과의 간격.
3. **25% 최소 차이**: 스케일의 인접한 두 값은 최소 25% 이상 차이. 비슷한 값 2개가 공존하면 혼란.

### 2.3 섹션 간격 가이드

| 느낌 | 데스크톱 | 태블릿 | 모바일 |
|------|---------|--------|--------|
| 밀집 (콘텐츠 많은 포털) | 64px | 48px | 32px |
| 표준 | 96px | 64px | 48px |
| 여유 (프리미엄/럭셔리) | 128px+ | 96px | 64px |

### 2.4 카드 간격 가이드

| 요소 | 값 |
|------|-----|
| 카드 내부 패딩 | 16~24px |
| 카드 간 간격 (gap) | 16~24px (모바일) / 24~32px (데스크톱) |
| 카드 이미지↔텍스트 | 12~16px |
| 카드 제목↔설명 | 8px |
| 카드 설명↔메타 | 12~16px |

---

## §3. 컬러 체계 (Color System)

> "그레이스케일에서 먼저 디자인하라. 컬러를 마지막에 입혀라."
> — Refactoring UI

### 3.1 팔레트 구성

| 카테고리 | 용도 | 단계 수 |
|---------|------|--------|
| Gray | 텍스트, 배경, 보더 | 8~10단계 (50~950) |
| Primary | 브랜드 대표색 | 5~9단계 |
| Secondary | 보조 브랜드색 | 5~9단계 |
| Accent | 강조/알림 | 5~9단계 |
| Success | 성공 상태 | 3~5단계 |
| Warning | 경고 상태 | 3~5단계 |
| Error | 오류 상태 | 3~5단계 |

### 3.2 컬러 규칙

- **순수 검정(#000000) 사용 금지**. 가장 진한 텍스트도 #111827 수준.
- **순수 흰색(#FFFFFF) 배경 주의**. 약간의 따뜻함/차가움 (#FAFAFA, #F9FAFB) 권장.
- **HSL 기반 팔레트 구성**. 밝기(L)만 조절하지 말고 채도(S)와 색상(H)도 함께 변화.
  - 밝은 단계: 색상(H)을 약간 이동 + 채도(S) 높이기
  - 어두운 단계: 색상(H)을 약간 이동 + 채도(S) 줄이기
- **그라디언트**: 30도 이내의 인접 색상끼리만. 보색 그라디언트는 탁해진다.
- **배경색 교차**: 섹션 간 white → light gray → white 또는 white → brand-light → white 교차.

### 3.3 접근성 대비

| 용도 | 최소 대비율 | WCAG |
|------|-----------|------|
| 본문 텍스트 (≤18px) | 4.5:1 | AA |
| 큰 텍스트 (>18px bold 또는 >24px) | 3:1 | AA |
| UI 컴포넌트/그래픽 | 3:1 | AA |
| 장식 요소 | 제한 없음 | - |

---

## §4. 타이포그래피 (Typography)

### 4.1 폰트 선택

- **UI용**: 산세리프 (Pretendard, Noto Sans KR, Inter 등). 가독성 우선.
- **에디토리얼**: 세리프 가능 (Noto Serif KR 등). 매거진/스토리텔링용.
- **폰트 수**: 최대 2개. 1개로도 충분 (굵기 변화로 위계 표현).
- **400 미만 굵기 금지**: UI에서 Light(300)/Thin(100)은 가독성 저하.

### 4.2 크기 스케일

```
xs:   12px / 0.75rem  — 캡션, 법적 고지
sm:   14px / 0.875rem — 메타 정보, 보조 텍스트
base: 16px / 1rem     — 본문 기본 (브라우저 기본값)
lg:   18px / 1.125rem — 강조 본문, 리드 텍스트
xl:   20px / 1.25rem  — 소제목 (h4)
2xl:  24px / 1.5rem   — 중제목 (h3)
3xl:  30px / 1.875rem — 대제목 (h2)
4xl:  36px / 2.25rem  — 페이지 제목 (h1)
5xl:  48px / 3rem     — 히어로 제목
6xl:  64px / 4rem     — 히어로 강조 (데스크톱만)
```

### 4.3 행간(Line Height)

- **큰 텍스트 (제목)**: 1.1~1.3 (타이트)
- **본문**: 1.5~1.75 (여유)
- **작은 텍스트 (캡션)**: 1.4~1.6
- **규칙**: 텍스트가 클수록 행간 비율은 작아진다.

### 4.4 텍스트 폭

- **최적 가독성**: 한 줄 45~75자 (영문), 20~35em
- **한글**: 한 줄 25~40자 수준
- **max-width**: 본문 컨테이너에 반드시 적용. 65ch 또는 680px 권장.
- **중앙 정렬**: 2~3줄 이내만. 그 이상은 반드시 좌측 정렬.

---

## §5. 레이아웃 패턴 카탈로그 (Layout Pattern Catalog)

> "같은 그리드 패턴이 연속 2개 이상 나오면 단조롭다."
> 섹션마다 다른 패턴을 적용해 시각적 리듬을 만든다.

### 5.1 패턴 목록

| 코드 | 패턴 | 구조 | 용도 |
|------|------|------|------|
| A | **Hero** | 풀와이드 배경 + 오버레이 텍스트 + CTA | 첫인상, 브랜드 메시지 |
| B | **Split** | 2등분/비대칭 분할 (40:60, 50:50) | 이미지+텍스트 병렬 |
| C | **Card Grid** | 균등 크기 카드 N열 | 목록 (상품, 게시물) |
| D | **Bento Grid** | 크기 다른 카드 모듈형 배치 | 피처드+일반 혼합 |
| E | **Zigzag** | 이미지↔텍스트 좌우 교차 | 기능 소개, 스토리텔링 |
| F | **Full-width** | 화면 전체 폭, 배경 엣지까지 | CTA, 강조 섹션 |
| G | **Masonry** | 높이 다른 카드 빈 공간 없이 채움 | 이미지 갤러리 |
| H | **Magazine** | 큰 피처드 + 작은 서브 비대칭 | 뉴스, 에디토리얼 |
| I | **Timeline** | 세로선 중심 좌우 교차/나열 | 연혁, 프로세스 |
| J | **Feature List** | 아이콘 + 제목 + 설명 반복 | 특장점, 혜택 |
| K | **CTA Banner** | 고대비 배경 + 헤드라인 + 버튼 | 전환 유도 |
| L | **Horizontal Strips** | 풀와이드 섹션 수직 스택 | 랜딩페이지 |
| M | **Alternating** | 이미지+텍스트 교대 (Zigzag 일반화) | 서비스 설명 |
| N | **Comparison Table** | 2~4열 비교 표 | 요금제, 스펙 비교 |
| O | **Interactive Map** | 지도 + 사이드 리스트 | 매장 찾기, 관광 |
| P | **Storytelling Scroll** | 스크롤 따라 순차 등장 | 브랜드 스토리 |
| Q | **Dashboard/Widget** | 다양한 위젯 격자 배치 | 대시보드, 현황판 |
| R | **Sidebar + Content** | 좌측 네비 + 우측 콘텐츠 | 문서, 카테고리 |

### 5.2 패턴 선택 가이드

| 콘텐츠 유형 | 1순위 패턴 | 2순위 패턴 |
|------------|----------|----------|
| 첫인상/브랜드 | Hero | Full-width |
| 목록 (3~8개) | Card Grid | Bento Grid |
| 목록 (9개+) | Card Grid + 페이지네이션 | Masonry |
| 기능/특장점 소개 | Zigzag | Feature List |
| 스토리/순서 | Timeline | Storytelling Scroll |
| 강조/전환유도 | CTA Banner | Full-width |
| 혼합 콘텐츠 | Bento Grid | Magazine |
| 이미지 중심 | Masonry | Gallery Grid |
| 비교/듀얼 | Split | Comparison Table |
| 위치/지역 기반 | Interactive Map | Card Grid + 지도 |
| 데이터/현황 | Dashboard/Widget | Bento Grid |
| 문서/가이드 | Sidebar + Content | Timeline |
| 브랜드 스토리 | Storytelling Scroll | Hero + Zigzag |

---

## §6. 섹션 시퀀스 규칙 (Section Sequence)

> "리듬이 없으면 페이지가 '평평'해 보인다."
> — v0 피드백, IxDF

### 6.1 시퀀스 핵심 규칙

1. **연속 동일 패턴 금지**: 같은 레이아웃 패턴이 2개 연속 나오면 안 된다.
   - Bad: Card Grid → Card Grid → Card Grid
   - Good: Card Grid → Zigzag → Bento Grid

2. **배경색 교차**: 인접 섹션은 배경색이 달라야 한다.
   - 패턴: white → light → white → accent → white
   - 최소: 3개 섹션마다 1개는 배경색 변화

3. **시각적 무게 리듬**: Heavy(이미지/영상 큰 것) → Light(텍스트 중심) → Medium(카드) 교차.
   - Heavy: Hero, Full-width 이미지, Bento (큰 카드)
   - Medium: Card Grid, Zigzag, Magazine
   - Light: Feature List, CTA Banner, FAQ

4. **콘텐츠 밀도 변화**: 밀집(많은 카드) → 여유(큰 여백, 적은 요소) → 밀집 교차.

### 6.2 시퀀스 템플릿 (예시)

```
Hero (Heavy) → Feature List (Light) → Zigzag (Medium)
→ CTA Banner (Light) → Card Grid (Medium) → Testimonial (Light)
→ FAQ (Light) → CTA Footer (Light)
```

> 핵심: Heavy→Light→Medium 교차. 같은 무게가 연속되지 않도록.

### 6.3 리듬 유형 (IxDF 기반)

| 유형 | 설명 | 적용 |
|------|------|------|
| Regular | 동일 간격/크기 반복 | 카드 그리드, 아이콘 리스트 (섹션 내부) |
| Flowing | 자연스러운 변화 | 섹션 간 점진적 무게 변화 |
| Progressive | 점점 강해지거나 약해짐 | 스크롤 내려갈수록 CTA 강도 증가 |
| Alternating | 두 요소의 교차 반복 | Zigzag, 배경색 교차, 무게 교차 |

---

## §7. 그리드 & 깊이 (Grid & Depth)

### 7.1 반응형 그리드

| 브레이크포인트 | 이름 | 컬럼 수 | 거터 | 마진 |
|--------------|------|--------|------|------|
| ~767px | Mobile | 4 | 16px | 16px |
| 768~1023px | Tablet | 8 | 24px | 24px |
| 1024~1439px | Desktop | 12 | 24px | 32px |
| 1440px+ | Wide | 12 | 32px | auto (max-width 제한) |

### 7.2 콘텐츠 최대 폭

| 용도 | max-width |
|------|-----------|
| 본문 텍스트 | 680px (65ch) |
| 카드 그리드 | 1200px |
| 와이드 콘텐츠 | 1400px |
| 풀와이드 | 제한 없음 (100vw) |

### 7.3 그림자 & 보더 라디우스

```css
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);           /* 미세한 분리 */
--shadow-sm:  0 1px 3px rgba(0,0,0,0.1);             /* 카드 기본 */
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.1);        /* 호버, 드롭다운 */
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.1);      /* 모달, 팝오버 */
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.1);      /* 대형 오버레이 */
```

- **그림자 > 보더**: 요소 분리에 보더 대신 그림자 사용 권장.
- **보더 라디우스**: 버튼 6~8px / 카드 8~12px / 태그 pill / 모달 12~16px. 프로젝트 내 통일.

---

## §8. 이미지 & 미디어 (Images & Media)

### 8.1 이미지 비율

| 용도 | 비율 | 특징 |
|------|------|------|
| 히어로 배너 | 16:9 또는 21:9 | 와이드, 시네마틱 |
| 카드 썸네일 (가로) | 4:3 또는 3:2 | 가장 범용적 |
| 카드 썸네일 (세로) | 3:4 | 인물, 포스터, 피처드 강조 |
| 정사각 | 1:1 | 프로필, 아이콘형 |
| OG 이미지 | 1200×630px | SNS 공유용 |

### 8.2 이미지 규칙

- **비율 혼용 제한**: 같은 그리드 내 카드들은 동일 비율. 다른 비율은 `object-fit: cover`로 통일.
- **대비가 다른 비율로 강조**: 피처드 카드만 3:4, 일반 카드는 4:3 → 시각적 구분.
- **alt 텍스트 필수**: 장식 이미지는 `alt=""`, 정보 이미지는 설명.
- **lazy loading**: 첫 화면(Above the fold) 외 이미지는 `loading="lazy"`.
- **placeholder**: 회색 박스 금지. 최소한 블러 placeholder 또는 dominant color 배경.

### 8.3 이미지 소싱 (Unsplash 기반)

- URL 패턴: `https://images.unsplash.com/photo-{ID}?w={width}&h={height}&fit=crop`
- 크기 파라미터: `w=800&h=600&fit=crop&q=80` (4:3, 품질 80%)
- **키워드 매핑**: 브랜드 시트의 소싱 키워드로 검색 → 실제 URL로 변환

---

## §9. 인터랙션 & 모션 (Interaction & Motion)

### 9.1 호버 효과

| 요소 | 효과 | 값 |
|------|------|-----|
| 카드 | 살짝 떠오름 | `translateY(-4px)` + `shadow-md` |
| 카드 이미지 | 확대 | `scale(1.05)` + `overflow: hidden` |
| 버튼 | 밝기 변화 | `brightness(1.1)` 또는 `background-color` 변경 |
| 링크 | 밑줄 또는 색상 | `text-decoration: underline` 또는 `color` 변경 |
| 아이콘 | 회전 또는 이동 | `rotate(5deg)` 또는 `translateX(4px)` |

### 9.2 트랜지션

- **기본 속도**: 150~300ms. 이보다 빠르면 인지 못함, 느리면 답답함.
- **이징**: `ease-out` (나갈 때 감속) 기본. `ease-in-out` (부드러운 양방향).
- **한 번에 하나만**: 여러 속성 동시 변화 시 가장 중요한 것만 transition.
- **의미 있는 모션만**: 장식적 모션 최소화. 상태 변화를 전달하는 모션만.

### 9.3 스크롤 애니메이션

- **fade-in-up**: 가장 기본. `opacity: 0 → 1` + `translateY(20px → 0)`.
- **순차 진입**: 카드 그리드는 카드별 100~150ms 딜레이.
- **과하지 않게**: 모든 요소에 적용 금지. 핵심 섹션만.
- **`prefers-reduced-motion` 존중**: 접근성. 모션 비활성화 미디어쿼리 반드시 적용.

---

## §10. 컴포넌트 조합 규칙 (Component Composition)

> "카드는 폐쇄된 컴포넌트가 아니라 조합 가능한 컨테이너다."
> — Nathan Curtis

### 10.1 카드 변형

| 변형 | 구조 | 용도 |
|------|------|------|
| Default | image(4:3) + title + desc + meta | 일반 목록 아이템 |
| Featured | image(3:4 또는 큰 사이즈) + 큰 title + desc | 강조, 벤토 큰 카드 |
| Compact | image(작은) + title + meta (한 줄) | 사이드바, 관련 콘텐츠 |
| Horizontal | image(좌) + content(우) | 검색 결과, 리스트뷰 |
| Overlay | image(배경) + text(오버레이) | 시각적 임팩트, 히어로형 |

### 10.2 섹션 구조

모든 섹션은 아래 구조를 기본으로 한다:

```html
<section class="section section--{variant}">
  <div class="container">
    <header class="section__header">
      <h2 class="section__title">{제목}</h2>
      <p class="section__subtitle">{부제 또는 설명}</p>
    </header>
    <div class="section__body">
      {콘텐츠 — 카드 그리드, 리스트, 등}
    </div>
    <footer class="section__footer">
      {더보기 링크 또는 CTA}
    </footer>
  </div>
</section>
```

### 10.3 Atomic Design 계층

| 계층 | 예시 | 역할 |
|------|------|------|
| Atom | 버튼, 태그, 아이콘, 입력 필드 | 최소 단위 |
| Molecule | 카드, 검색바, 네비 아이템 | Atom 조합 |
| Organism | 카드 그리드, 헤더, 푸터, FAQ 섹션 | Molecule 배치 |
| Template | 메인 페이지, 목록 페이지, 상세 페이지 | 페이지 레이아웃 |

---

## §11. 반응형 규칙 (Responsive Design)

### 11.1 모바일 퍼스트

- CSS는 모바일 기본 → `min-width` 미디어쿼리로 확장.
- 모바일에서 불필요한 요소는 `display: none`이 아니라 **처음부터 설계에서 제외**.

### 11.2 브레이크포인트별 변화

| 요소 | Mobile (≤767) | Tablet (768~1023) | Desktop (1024+) |
|------|-------------|-----------------|----------------|
| 카드 그리드 | 1열 | 2열 | 3~4열 |
| 히어로 | 텍스트 중심, 정적 이미지 | 영상/이미지 + 텍스트 | 풀스크린 영상 |
| GNB | 햄버거 메뉴 | 축약 또는 햄버거 | 전체 노출 |
| Split | 세로 스택 | 50:50 | 비대칭 가능 |
| Zigzag | 세로 스택 (이미지 → 텍스트) | 교차 유지 | 교차 유지 |
| 사이드바 | 숨김 또는 아래로 | 접을 수 있는 | 고정 노출 |
| 폰트 크기 | h1: 28~32px | h1: 32~36px | h1: 36~48px |
| 섹션 간격 | 32~48px | 48~64px | 64~96px |

### 11.3 터치 타겟

- **최소 44×44px**: 모든 클릭/탭 가능 요소.
- **간격 8px 이상**: 인접 터치 타겟 사이.
- **호버 의존 금지**: 모바일에는 호버가 없다. 호버 정보는 기본 노출.

---

## 부록: 참조 출처

| 출처 | 항목 | URL |
|------|------|-----|
| Refactoring UI | §1~4, §7 | refactoringui.com |
| NNGroup | §1 시각적 위계 | nngroup.com/articles/principles-visual-design/ |
| IxDF | §6 리듬 유형 | interaction-design.org |
| Elementor | §7 그리드 | elementor.com/blog/grid-design/ |
| SiteGround | §5 레이아웃 카탈로그 | siteground.com/academy/website-layout/ |
| Brad Frost | §10 Atomic Design | atomicdesign.bradfrost.com |
| Nathan Curtis | §10 카드 조합 | medium.com/eightshapes-llc |
| 8pt Grid | §2 간격 체계 | medium.com/built-to-adapt |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026.02.18 | 초안 작성. 13개 섹션 + 부록. |
| v2.0 | 2026.02.23 | DK 참조 제거. §7+§8 통합. §13 삭제 (§1~§11과 중복). 11개 섹션으로 경량화. |
