---
name: plan-SB
description: >
  화면설계서(Screen Blueprint) 자동 생성 스킬. JSON 데이터를 입력받아
  KT 운영 표준 양식의 HTML/PDF 화면설계서를 자동 생성합니다.
  Cover, History, Assignment, Interface List, Screen Design 프레임을 포함합니다.
argument-hint: "[JSON 데이터 파일경로 또는 프로젝트 요구사항]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

# 화면설계서 (Screen Blueprint) Generator

당신은 **시니어 웹 기획자**이며, 운영 프로젝트의 화면설계서를 자동으로 생성합니다.

## 개요

JSON 데이터 파일을 입력받아 KT 운영 표준 양식의 화면설계서를 HTML/PDF로 출력합니다.

**파이프라인**: JSON 데이터 → HTML 렌더링 → PDF 내보내기 → 검증

## Step 0: 입력 감지 (런타임)

이 스킬은 JSON 데이터 파일 유무에 따라 동작 모드를 결정합니다.

| 검색 대상 | 경로 패턴 | 발견 시 | 미발견 시 |
|-----------|----------|---------|----------|
| JSON 데이터 | `data/*.json`, `input/*.json` | 바로 생성 실행 | 대화형 데이터 수집 |
| FN 산출물 | `output/planning/FN_*.md` | FN 기반 screens 자동 구성 | - |
| 이미지 | `input/*.png`, `input/pages/*.png` | uiImagePath 자동 매핑 | 빈 영역 표시 |

**모드 판정 출력 (필수)**:
```
[입력 감지] JSON: {발견 n건 / 미발견}, FN: {발견 n건 / 미발견}, 이미지: {n건} → {자동 / 대화형} 모드
```

## 전제조건

**자동 모드** (JSON 데이터 발견 시):
- JSON 파일이 [schema.json](schema.json) 스키마를 만족
- 필수 필드: project, history, assignment, interfaces, screens

**대화형 모드** (JSON 미발견 시):
- 사용자에게 프로젝트 정보를 순서대로 질의
- 질의 완료 후 JSON 파일 생성 → 자동 모드로 전환

## JSON 데이터 구조

### project (필수)
| 필드 | 필수 | 설명 | 예시 |
|------|------|------|------|
| jiraNo | O | Jira 티켓 번호 | KMVNO-5628 |
| srNo | O | SR 번호 | DR-2025-43146 |
| title | O | 과제명 | [마이알뜰폰] 바로배송유심 안내 문구 수정 |
| serviceName | O | 서비스명 | MVNO - 마이알뜰폰 온라인 서비스 채널 |
| version | O | 버전 | 0.1 |
| date | O | 작성일 | 2025-07-31 |
| writer | O | 작성자 | ELUO |
| companyName | O | 회사명 | kt 마이알뜰폰 |
| requestor | O | 요청자 | VNO 채널개발팀 이정학 과장님 |

### history[] (필수)
| 필드 | 필수 | 설명 |
|------|------|------|
| version | O | 버전 |
| date | O | 날짜 |
| detail | O | 변경 내용 |
| page | - | 페이지 |
| writer | O | 작성자 |
| remarkers | - | 비고 |

### assignment (필수)
| 필드 | 필수 | 설명 |
|------|------|------|
| detail | O | 요청사항 상세 |
| dividerSub | O | 디바이더 부제 |
| dividerMain | O | 디바이더 메인 제목 |
| dividerBullets | O | 디바이더 불릿 목록 |

### interfaces[] (필수)
| 필드 | 필수 | 설명 |
|------|------|------|
| office | O | Front/Back Office |
| channel | O | PC/MO |
| depth1~4 | O | 메뉴 Depth |
| interfaceType | O | Page/Popup/Layer |
| workType | O | 신규/수정/삭제 |
| pageId | - | 페이지 ID |

### screens[] (필수)
| 필드 | 필수 | 설명 |
|------|------|------|
| viewportType | O | Mobile/PC/Tablet |
| interfaceName | O | 인터페이스명 |
| interfaceId | - | 인터페이스 ID |
| location | O | 메뉴 경로 |
| pageName | - | 페이지명 |
| uiImagePath | - | UI 캡처 이미지 경로 |
| hasDivider | O | 디바이더 포함 여부 |
| divider | - | 디바이더 정보 (hasDivider=true 시) |
| descriptions[] | O | 수정 영역 설명 |

#### descriptions[] 항목
| 필드 | 필수 | 설명 |
|------|------|------|
| marker | O | 마커 번호 (1, 2, 3...) |
| label | O | 영역명 |
| before | O | 수정 전 내용 |
| after | O | 수정 후 내용 |
| details[] | - | 상세 불릿 목록 |
| overlay | - | 마커 오버레이 위치 (top, left, width, height) |

## 작성 절차

### 1. 데이터 준비
- JSON 데이터 파일 탐색 또는 대화형 수집
- 스키마 검증: 필수 필드 누락 확인
- input/ 폴더 이미지 존재 시 uiImagePath 자동 매핑

### 2. HTML 생성
```bash
node {skill-path}/scripts/generate.js <data-file.json>
```
- Cover 프레임: 프로젝트 표지 (로고, 과제명, 버전)
- History 프레임: 변경 이력 테이블
- Assignment 프레임: 과제 디바이더 + 상세
- Interface List 프레임: 작업 대상 인터페이스 목록
- Screen 프레임 (N개): 메타정보 + UI 캡처 + Description
- End of Document 프레임

### 3. PDF 변환
- Playwright chromium으로 HTML → PDF 변환
- 페이지 사이즈: 1200x800px, 배경 인쇄 포함
- Playwright 미설치 시 HTML만 생성 (graceful fallback)

### 4. 검증
```bash
node {skill-path}/scripts/verify.js <output.html>
```
- 각 .frame 요소를 개별 스크린샷으로 캡처
- 프레임 수 = 예상값 일치 확인

### 5. 결과 출력

```
================================================
[화면설계서 생성 결과]
================================================
과제번호: {jiraNo}
SR번호: {srNo}
과제명: {title}
------------------------------------------------
[생성 프레임]
총 프레임: {n}개
- Cover: 1
- History: 1
- Assignment: 2 (디바이더 + 상세)
- Interface List: 1
- Screen Design: {n}
- End of Document: 1
------------------------------------------------
[출력 파일]
HTML: output/{jiraNo}.html
PDF: output/{jiraNo}.pdf
================================================
```

## 출력 형식
- HTML 파일명: `{jiraNo}.html`
- PDF 파일명: `{jiraNo}.pdf`
- 저장 경로: `output/`

## 품질 체크
작성 완료 시 체크리스트: [checklist.md](checklist.md) 참조

## 예시 데이터
참조: [example/KMVNO-5628.json](example/KMVNO-5628.json)

$ARGUMENTS
