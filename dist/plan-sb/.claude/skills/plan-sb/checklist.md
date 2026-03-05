# 화면설계서 (SB) 체크리스트

## JSON 데이터 완전성
- [ ] project 필수 필드 9개 존재 (jiraNo, srNo, title, serviceName, version, date, writer, companyName, requestor)
- [ ] history[] 최소 1건 존재
- [ ] assignment 4개 필드 존재 (detail, dividerSub, dividerMain, dividerBullets)
- [ ] interfaces[] 최소 1건 존재
- [ ] screens[] 최소 1건 존재
- [ ] 각 screen의 descriptions[] 최소 1건 존재

## 프레임 구성
- [ ] Cover 프레임 존재 (로고, 과제명, 버전)
- [ ] History 프레임 존재 (변경 이력 테이블)
- [ ] Assignment 프레임 존재 (디바이더 + 상세)
- [ ] Interface List 프레임 존재 (작업 대상 목록)
- [ ] Screen 프레임 수 = screens[] 수와 일치
- [ ] End of Document 프레임 존재

## Screen 프레임 품질
- [ ] 메타 테이블: Viewport, Interface, Location 정보 표시
- [ ] UI 캡처 영역: 이미지 또는 빈 영역 표시
- [ ] Description 영역: 마커 번호, 영역명, 수정 전/후 표시
- [ ] hasDivider=true인 화면에 디바이더 표시

## 이미지 참조
- [ ] uiImagePath 지정 시 파일 존재 확인
- [ ] input/ 폴더 이미지 우선 매핑
- [ ] 이미지 미존재 시 빈 영역(placeholder) 정상 표시

## PDF 출력
- [ ] HTML 파일 정상 생성
- [ ] PDF 파일 정상 생성 (Playwright 설치 시)
- [ ] 페이지 사이즈 1200x800px 준수
- [ ] 배경 인쇄 포함 (printBackground: true)
- [ ] 프레임 간 페이지 구분 정상

## 검증
- [ ] verify.js 실행 시 프레임별 스크린샷 생성
- [ ] 스크린샷 수 = 프레임 수 일치
