# 유지운영 허브

> 허브 정보는 PROJECT.md 참조

## 워크플로우

이 허브는 엘루오 유지운영 자동화 시스템을 사용합니다.
운영 요청을 자연어로 말하면 자동으로 접수→분류→처리됩니다.

### 자동 라우팅

| 키워드 | 라우팅 대상 |
|--------|------------|
| 수정, 변경, 추가, 삭제, 교체, 업데이트 | maintenance-orchestrator |
| /maintenance | maintenance-orchestrator |
| /ops-setup | ops-setup (온보딩 위자드) |

### 사용 예시

```
"강남둘레길 6코스 사진 변경해줘"
"비짓강남 메인 배너 텍스트 수정"
"/maintenance list"
"/maintenance sync VGN"
```

## 운영 파이프라인

```
요청 접수 (maintenance-intake)
  ↓
Notion 동기화 (notion-ticket)
  ↓
파이프라인 라우팅:
  경미 (TXT/IMG) → publish-orchestrator만
  보통 (FNC 2~5건) → planning → publish → qa
  복합 (6+ 페이지) → 구축 전환 권고
```

## 산출물 경로

- inbox: {허브}/inbox/ (메일/요청 접수)
- 티켓: {허브}/{프로젝트코드}/tickets/
- 기획: {허브}/{프로젝트코드}/output/planning/
- 디자인: {허브}/{프로젝트코드}/output/design/
- 퍼블리싱: {허브}/{프로젝트코드}/output/publish/
- QA: {허브}/{프로젝트코드}/output/qa/

## 설정

- Notion 설정: .claude/notion-config.json
- 훅 설정: .claude/hooks/ (SessionStart: 메일 체크 + 대시보드)
