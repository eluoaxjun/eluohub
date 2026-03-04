# 화면설계서 (Screen Blueprint) Generator

JSON 데이터를 입력받아 KT 운영 표준 양식의 화면설계서를 HTML/PDF로 자동 생성합니다.

## 프레임 구성

```
화면설계서 구조
├── Cover: 프로젝트 표지 (로고, 과제명, 버전)
├── History: 변경 이력 테이블
├── Assignment: 과제 디바이더 + 상세
├── Interface List: 작업 대상 인터페이스 목록
├── Screen Design (N개)
│   ├── 메타 테이블 (Viewport, Interface, Location)
│   ├── UI 캡처 + 마커 오버레이
│   └── Description (수정 전/후)
└── End of Document
```

## 입력 방식

| 입력 | 동작 |
|------|------|
| JSON 데이터 파일 | 바로 생성 실행 |
| 없음 | 대화형 데이터 수집 → JSON 생성 → 실행 |

## 출력 형식

- HTML: `output/{jiraNo}.html`
- PDF: `output/{jiraNo}.pdf` (Playwright 필요)

$ARGUMENTS
