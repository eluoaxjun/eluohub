# Planning → Design 핸드오프 프로토콜

기획 패키지에서 디자인 패키지로 산출물을 전달할 때의 데이터 계약입니다.

## 핸드오프 파일

기획 완료 시 `output/planning/_handoff.md`를 생성합니다.

### 형식

```markdown
# Planning → Design Handoff

## 메타정보
- 프로젝트: {프로젝트명}
- 프로젝트 코드: {코드}
- 기획 완료일: {YYYY-MM-DD}
- 기획자: {담당자}
- 검수 판정: {PASS / CONDITIONAL / BLOCK}

## 산출물 목록
| 파일명 | 유형 | 상태 | 버전 |
|--------|------|------|------|
| QST_{코드}_{버전}.md | QST | 완료 | v1.0 |
| REQ_{코드}_{버전}.md | REQ | 완료 | v1.0 |
| FN_{코드}_{버전}.md | FN | 완료 | v1.0 |
| IA_{코드}_{버전}.md | IA | 완료/생략 | v1.0 |
| WBS_{코드}_{버전}.md | WBS | 완료/생략 | v1.0 |

## 수량 요약
- FR: {n}개 (Must {n} / Should {n} / Could {n})
- NFR: {n}개
- FN: {n}개 (복잡도 높음 {n} / 중간 {n} / 낮음 {n})
- IA 페이지: {n}개 (구축 시)

## [미확인] 잔여
- 잔여 건수: {n}건
- {미확인 항목 목록 (있는 경우)}

## 알려진 이슈
- {이슈 1: 설명 + 사유}

## 기획자 메모
{디자인 단계에 전달할 참고 사항}
```

## Design 수신 절차

design-orchestrator Step 0에서 `_handoff.md`를 처리합니다.

### 존재 시
1. 파일 파싱 → 메타정보, 산출물 목록, 수량 요약 추출
2. 산출물 경로 자동 확인 (REQ, FN, IA 파일 위치)
3. [미확인] 잔여 건수 확인 → 0건이 아니면 경고
4. 알려진 이슈 → 디자인 시 고려사항으로 반영

### 미존재 시 (fallback)
1. `output/planning/` 디렉토리 스캔 → REQ/FN/IA 파일 자동 수집
2. 파일명 패턴(`{산출물}-*.md`)으로 산출물 식별
3. 파일 내 FR/FN 수량 자동 집계

> 핸드오프 파일이 없어도 디자인 파이프라인은 정상 동작합니다.

## Design이 기대하는 입력물

| 산출물 | 경로 | 필수 | 용도 |
|--------|------|------|------|
| REQ | `output/planning/` | **필수** | FR→UI 매핑 기준, NFR 성능 목표 |
| FN | `output/planning/` | **필수** | FN→UI 매핑, 인터랙션 근거, 검증 기준 |
| IA | `output/planning/` | **필수**(구축) | 페이지 구조, GNB, 네비게이션, 콘텐츠 인벤토리 |
| QST | `output/planning/` | 권장 | 비즈니스 맥락, 업종 특성 |
| WBS | `output/planning/` | 권장 | 일정 제약 확인 |
| _handoff.md | `output/planning/` | 권장 | 컨텍스트 자동 수집 |
