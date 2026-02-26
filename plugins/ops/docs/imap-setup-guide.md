# NaverWorks IMAP 설정 가이드

NaverWorks 메일을 IMAP으로 수신하기 위한 설정 절차입니다.
소요 시간: 약 2분

---

## Step 1: 외부 앱 비밀번호 발급

NaverWorks 메일은 일반 비밀번호로 IMAP 접속이 불가합니다. **외부 앱 비밀번호**를 별도로 발급해야 합니다.

1. [NaverWorks](https://mail.worksmobile.com) 로그인
2. 우측 상단 프로필 → **보안 설정** (또는 **내 정보**)
3. **외부 앱 비밀번호** 섹션 찾기
4. **비밀번호 생성** 클릭
5. 앱 이름: `엘루오 유지운영` (또는 원하는 이름)
6. 생성된 비밀번호 복사 (16자리, 공백 포함)

> 이 비밀번호는 한 번만 표시됩니다. 반드시 복사해 두십시오.

## Step 2: IMAP 연결 정보

| 항목 | 값 |
|------|------|
| IMAP 서버 | `imap.worksmobile.com` |
| 포트 | `993` |
| 보안 | SSL/TLS |
| 사용자명 | NaverWorks 이메일 주소 (전체) |
| 비밀번호 | Step 1에서 발급한 외부 앱 비밀번호 |

## Step 3: 설정 입력

`/ops-setup` 실행 시 IMAP 설정 단계에서 위 정보를 입력합니다.
또는 `notion-config.json`의 `email` 섹션에 직접 기입:

```json
{
  "email": {
    "enabled": true,
    "imap_host": "imap.worksmobile.com",
    "imap_port": 993,
    "address": "user@company.com",
    "password": "xxxx xxxx xxxx xxxx"
  }
}
```

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| Login failed | 일반 비밀번호 사용 | Step 1 외부 앱 비밀번호 발급 |
| Connection refused | 방화벽/포트 차단 | 993 포트 아웃바운드 허용 확인 |
| SSL handshake error | Python SSL 버전 | Python 3.10+ 권장 |
| INBOX 비어 있음 | 필터 설정 | `skip_domains` 확인, 테스트 메일 발송 |

## IMAP이 아닌 다른 메일 서비스

| 서비스 | IMAP 서버 | 포트 | 비고 |
|--------|-----------|------|------|
| NaverWorks | imap.worksmobile.com | 993 | 외부 앱 비밀번호 필수 |
| Gmail | imap.gmail.com | 993 | 앱 비밀번호 필수 (2FA 활성화) |
| Naver Mail | imap.naver.com | 993 | POP3/IMAP 사용 설정 필요 |
| Outlook | outlook.office365.com | 993 | OAuth2 또는 앱 비밀번호 |

`notion-config.json`의 `email.imap_host`와 `email.imap_port`를 변경하면 다른 메일 서비스도 사용 가능합니다.

---

## 보안 참고

- 메일 비밀번호는 `notion-config.json`에 평문 저장됩니다
- 환경변수 `IMAP_PASSWORD`를 설정하면 config 파일 대신 환경변수를 우선 사용합니다
- `.gitignore`에 `notion-config.json`을 반드시 추가하십시오
- 외부 앱 비밀번호는 NaverWorks 보안 설정에서 언제든 폐기 가능합니다
