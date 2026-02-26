# Notion API 토큰 발급 가이드

Notion 연동을 위한 Internal Integration 토큰 발급 절차입니다.
소요 시간: 약 3분

---

## Step 1: Integration 생성

1. [Notion Integrations](https://www.notion.so/my-integrations) 페이지 접속
2. **+ New integration** 클릭
3. 아래 항목 입력:
   - **Name**: `엘루오 유지운영` (또는 원하는 이름)
   - **Associated workspace**: 사용할 워크스페이스 선택
   - **Type**: Internal
4. **Submit** 클릭

## Step 2: 토큰 복사

1. 생성된 Integration 페이지에서 **Internal Integration Secret** 확인
2. `ntn_` 으로 시작하는 토큰을 복사
3. 이 토큰을 `/ops-setup` 실행 시 입력하거나, `notion-config.json`의 `auth.token`에 직접 기입

## Step 3: 권한 설정 (Capabilities)

Integration 설정 페이지에서:

| 항목 | 설정 |
|------|------|
| Read content | ON |
| Update content | ON |
| Insert content | ON |
| Read comments | OFF (불필요) |
| Insert comments | OFF (불필요) |

## Step 4: 페이지 연결

Notion에서 유지운영 허브로 사용할 **최상위 페이지**를 하나 생성한 뒤:

1. 해당 페이지 우측 상단 `···` 클릭
2. **Connections** → **Connect to** → 위에서 만든 Integration 선택
3. **Confirm** 클릭

이 페이지 하위에 프로젝트 페이지와 Tasks DB가 자동 생성됩니다.

## Step 5: 페이지 ID 확인

페이지 URL에서 ID를 추출합니다:

```
https://www.notion.so/My-Page-abc123def456...
                      ^^^^^^^^^^^^^^^^^^^^^^^^
                      이 부분이 페이지 ID (32자리 hex, 하이픈 없이)
```

또는 **Share** → **Copy link** 후 URL 마지막 32자리를 사용합니다.

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| 401 Unauthorized | 토큰 오류 | 토큰 재복사. `ntn_` 접두사 포함 확인 |
| 404 Not Found | 페이지 연결 미완 | Step 4 재수행 (Connection 확인) |
| 403 Forbidden | 권한 부족 | Step 3 재확인 (Insert content ON) |
| Integration 미표시 | 워크스페이스 불일치 | Step 1에서 올바른 워크스페이스 선택 |

---

## 보안 참고

- 토큰은 `notion-config.json`에 평문 저장됩니다
- 환경변수 `NOTION_TOKEN`을 설정하면 config 파일 대신 환경변수를 우선 사용합니다
- `.gitignore`에 `notion-config.json`을 반드시 추가하십시오
