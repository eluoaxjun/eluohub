"""
NaverWorks 메일 → 구조화 분석 → inbox + Notion 자동 등록

메일 본문을 분석하여 요청 항목을 파싱하고,
maintenance-intake 티켓 형식에 맞는 구조화된 접수 파일을 생성합니다.

Usage:
  python email_poller.py                     # 미읽은 메일 처리
  python email_poller.py --dry-run           # 처리 없이 미리보기만
  python email_poller.py --status            # 현재 inbox 상태 확인
  python email_poller.py --hub /path/to/hub  # 허브 경로 지정
  python email_poller.py --config /path/to/config.json
"""

import imaplib
import ssl
import email
import json
import sys
import io
import os
import re
import urllib.request
from email.header import decode_header
from datetime import datetime
from pathlib import Path


# ── 허브 경로 감지 ──────────────────────────────────────


def detect_hub_path():
    """유지운영 허브 경로 자동 감지.

    감지 순서:
    1. 환경변수 OPS_HUB_PATH
    2. CWD에서 PROJECT.md 확인 (유형=유지운영 허브)
    3. CWD 상위에서 PROJECT.md 확인
    4. 스크립트 위치 기준 (.claude/scripts/ → 허브는 2단계 상위)
    """
    env_path = os.environ.get("OPS_HUB_PATH")
    if env_path and Path(env_path).exists():
        return Path(env_path)

    cwd = Path.cwd()
    for candidate in [cwd, cwd.parent]:
        pm = candidate / "PROJECT.md"
        if pm.exists():
            try:
                content = pm.read_text(encoding="utf-8")
                if "유지운영 허브" in content:
                    return candidate
            except Exception:
                pass

    script_dir = Path(__file__).resolve().parent
    if script_dir.name == "scripts":
        claude_dir = script_dir.parent
        if claude_dir.name == ".claude":
            hub_candidate = claude_dir.parent
            pm = hub_candidate / "PROJECT.md"
            if pm.exists():
                return hub_candidate

    return None


def find_config(hub_path=None, config_arg=None):
    """설정 파일 경로 감지.

    우선순위:
    1. --config 인자
    2. hub_path/.claude/notion-config.json
    3. 환경변수 OPS_CONFIG_PATH
    """
    if config_arg and Path(config_arg).exists():
        return Path(config_arg)
    if hub_path:
        p = Path(hub_path) / ".claude" / "notion-config.json"
        if p.exists():
            return p
    env_cfg = os.environ.get("OPS_CONFIG_PATH")
    if env_cfg and Path(env_cfg).exists():
        return Path(env_cfg)
    return None


def load_config(config_path):
    """설정 로드 + 환경변수 오버라이드."""
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    token = os.environ.get("NOTION_TOKEN")
    if token:
        cfg["auth"]["token"] = token
    email_pw = os.environ.get("OPS_EMAIL_PASSWORD")
    if email_pw and "email" in cfg:
        cfg["email"]["password"] = email_pw
    return cfg


def resolve_project_path(project, hub_path):
    """프로젝트 로컬 경로를 허브 기준으로 해석.

    절대 경로면 그대로, 상대 경로면 hub_path 기준으로 resolve.
    """
    local = project.get("local_path", "")
    if not local:
        return None
    p = Path(local)
    if p.is_absolute():
        return p
    if hub_path:
        return Path(hub_path) / local
    return p


# ── 처리 로그 ──────────────────────────────────────────


def _get_log_path(hub_path):
    """처리 완료 로그 경로 (허브/.claude/.email_processed.json)."""
    if hub_path:
        return Path(hub_path) / ".claude" / ".email_processed.json"
    return Path(__file__).parent / ".email_processed.json"


def _load_processed(log_path):
    """처리 완료된 Message-ID 목록 로드."""
    if log_path and log_path.exists():
        try:
            return json.loads(log_path.read_text(encoding="utf-8"))
        except Exception:
            return []
    return []


def _save_processed(log_path, ids):
    """처리 완료 Message-ID 목록 저장 (최근 200건 유지)."""
    ids = ids[-200:]
    if log_path:
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_path.write_text(json.dumps(ids, ensure_ascii=False), encoding="utf-8")


def _ensure_utf8():
    """Windows 콘솔 UTF-8 출력 보장 (진입점에서만 호출)."""
    if not isinstance(sys.stdout, io.TextIOWrapper) or sys.stdout.encoding != "utf-8":
        try:
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
        except (AttributeError, ValueError):
            pass
    if not isinstance(sys.stderr, io.TextIOWrapper) or sys.stderr.encoding != "utf-8":
        try:
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
        except (AttributeError, ValueError):
            pass


# ── IMAP helpers ────────────────────────────────────────


def decode_str(s):
    """MIME 인코딩된 문자열 디코딩."""
    if s is None:
        return ""
    parts = decode_header(s)
    result = []
    for part, charset in parts:
        if isinstance(part, bytes):
            result.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            result.append(str(part))
    return " ".join(result)


def get_body(msg):
    """Extract plain text body from email message."""
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            cd = str(part.get("Content-Disposition", ""))
            if ct == "text/plain" and "attachment" not in cd:
                payload = part.get_payload(decode=True)
                charset = part.get_content_charset() or "utf-8"
                return payload.decode(charset, errors="replace")
        # fallback: try text/html
        for part in msg.walk():
            ct = part.get_content_type()
            cd = str(part.get("Content-Disposition", ""))
            if ct == "text/html" and "attachment" not in cd:
                payload = part.get_payload(decode=True)
                charset = part.get_content_charset() or "utf-8"
                raw = payload.decode(charset, errors="replace")
                return re.sub(r"<[^>]+>", "", raw).strip()
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            return payload.decode(charset, errors="replace")
    return ""


def should_skip(from_addr, subject, email_cfg):
    """Filter out noise emails (Figma, internal FYI, etc.)."""
    from_lower = from_addr.lower()
    filter_cfg = email_cfg.get("filter", {})
    for skip in filter_cfg.get("skip_domains", []):
        if skip.lower() in from_lower:
            return True
    for skip in filter_cfg.get("skip_subjects", []):
        if skip in subject:
            return True
    return False


def match_project(from_addr, subject, email_cfg, ops_cfg):
    """Map sender domain or subject keyword to project code."""
    from_lower = from_addr.lower()
    filter_cfg = email_cfg.get("filter", {})
    for domain, code in filter_cfg.get("sender_project_map", {}).items():
        if domain.lower() in from_lower:
            return code
    for code, proj in ops_cfg.get("projects", {}).items():
        name = proj.get("name", "")
        if name in subject or code in subject.upper():
            return code
    return None


def extract_sender_name(from_str):
    """Extract human name from 'Name <email>' format."""
    match = re.match(r"^(.+?)\s*<", from_str)
    if match:
        return match.group(1).strip().strip('"')
    return from_str


# ── 메일 분석 엔진 ─────────────────────────────────────


def extract_latest_message(body):
    """답장 체인과 서명을 제거하고 최신 메시지만 추출."""
    separators = [
        r"-{5,}원본\s*메[세시]지-{5,}",
        r"-{5,}Original Message-{5,}",
        r"보낸사람:\s*\"",
        r"From:\s*\"",
        r">{3,}",
    ]
    combined = "|".join(separators)
    parts = re.split(combined, body, maxsplit=1)
    latest = parts[0].strip()

    sig_patterns = [
        r"\n\s*\S{2,4}\s+드림\s*\.?\s*$",
        r"\n\s*\d{2,3}[-\s]\d{3,4}[-\s]\d{4}\s*\|",
        r"\n\s*T\.\s*\d{2}",
    ]
    for pattern in sig_patterns:
        match = re.search(pattern, latest, re.MULTILINE)
        if match:
            latest = latest[: match.start()].strip()
            break

    latest = re.sub(r"\n[\t ]*\n[\t ]*\n+", "\n\n", latest)
    latest = re.sub(r"\t+", " ", latest)
    return latest.strip()


def extract_urls(text):
    """텍스트에서 URL 추출."""
    return re.findall(r"https?://[^\s<>\"')\]]+", text)


def parse_action_items(latest_body):
    """본문에서 번호 매겨진 요청 항목을 파싱.

    Returns:
        list of dict: [{"num": 1, "text": "범례 삭제", "raw": "2. 범례 삭제"}, ...]
        빈 리스트면 단일 요청으로 처리.
    """
    items = []
    pattern = re.compile(
        r"^\s*(\d+)\s*[.)]\s*(.+?)$",
        re.MULTILINE,
    )
    matches = list(pattern.finditer(latest_body))

    if len(matches) >= 2:
        for i, m in enumerate(matches):
            num = int(m.group(1))
            start = m.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(latest_body)
            full_text = m.group(2).strip()
            continuation = latest_body[start:end].strip()
            if continuation:
                continuation = re.sub(r"\n\s*", " ", continuation)
                full_text = f"{full_text} {continuation}".strip()
            items.append({
                "num": num,
                "text": full_text[:200],
                "raw": m.group(0).strip(),
            })

    return items


def classify_item(text):
    """개별 요청 항목의 유형을 분류 (키워드 매칭 점수제)."""
    t = text.lower()
    rules = [
        ("FNC", ["기능", "버그", "오류", "작동", "안됨", "깨짐", "에러",
                  "뒤로가기", "클릭", "동작", "새창", "별도 창"]),
        ("IMG", ["사진 교체", "이미지 교체", "사진교체", "이미지교체",
                  "사진", "이미지", "배너", "로고", "트리밍"]),
        ("STR", ["메뉴", "네비게이션", "구조", "레이아웃", "사이트맵",
                  "크게", "확대", "사이즈", "크기"]),
        ("NEW", ["신규 페이지", "새 페이지", "페이지 추가", "페이지생성",
                  "신규", "삽입"]),
        ("TXT", ["텍스트", "문구", "오타", "수정", "삭제", "변경",
                  "맞춤", "정렬", "통일", "남기고", "문자", "글씨"]),
    ]
    scores = {}
    for type_code, keywords in rules:
        count = sum(1 for kw in keywords if kw in t)
        if count > 0:
            scores[type_code] = count

    if not scores:
        return "ETC"

    max_score = max(scores.values())
    for type_code, _ in rules:
        if scores.get(type_code, 0) == max_score:
            return type_code
    return "ETC"


def classify_overall(items, subject, body):
    """전체 메일의 대표 유형과 복잡도를 결정."""
    if not items:
        return classify_item(subject + " " + body), "경미"

    type_counts = {}
    for item in items:
        tc = item.get("type", "ETC")
        type_counts[tc] = type_counts.get(tc, 0) + 1

    primary_type = max(type_counts, key=type_counts.get)

    n = len(items)
    has_fnc = "FNC" in type_counts
    has_new = "NEW" in type_counts
    if n >= 6 or has_new:
        complexity = "복합"
    elif n >= 3 or has_fnc:
        complexity = "보통"
    else:
        complexity = "경미"

    if len(type_counts) > 1:
        type_str = f"{primary_type} (혼합: {'+'.join(sorted(type_counts.keys()))})"
    else:
        type_str = primary_type

    return type_str, complexity


def determine_pipeline(type_str, complexity):
    """유형+복잡도에 따라 파이프라인 결정."""
    if complexity == "경미":
        return "직접 처리"
    if "NEW" in type_str:
        return "planning → design → publish → qa"
    return "planning → publish → qa"


def detect_target_page(subject, body):
    """제목+본문에서 대상 페이지를 추론."""
    urls = extract_urls(body) + extract_urls(subject)
    pages = []
    for url in urls:
        path_match = re.search(r"[^/]+/([^?\s]+)", url)
        if path_match:
            path = path_match.group(1).strip("/")
            if path:
                pages.append(url)

    page_keywords = re.findall(r"(\d+코스|메인|상세|둘레길)", subject + " " + body[:500])
    if page_keywords and not pages:
        pages = list(set(page_keywords))

    return pages


def make_item_summary(text):
    """항목 텍스트를 짧은 요약으로 변환."""
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    if len(text) > 80:
        text = text[:77] + "..."
    return text


# ── Notion API ──────────────────────────────────────────


def notion_api(method, url, payload, auth_cfg):
    """Notion API 호출 (Python urllib)."""
    headers = {
        "Authorization": f"Bearer {auth_cfg['token']}",
        "Notion-Version": auth_cfg["notion_version"],
        "Content-Type": "application/json",
    }
    data = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  [Notion Error] {e.code}: {body[:200]}", file=sys.stderr)
        return None


def create_notion_task(db_id, name, ticket_id, task_num, type_code, detail, target_page, auth_cfg):
    """Create a task row in Notion Tasks DB (5열 포함)."""
    pure_type = type_code.split(" ")[0] if " " in type_code else type_code
    if pure_type not in ("TXT", "IMG", "FNC", "NEW", "STR", "ETC"):
        pure_type = "ETC"

    payload = {
        "parent": {"database_id": db_id},
        "properties": {
            "Name": {"title": [{"text": {"content": name[:100]}}]},
            "Ticket": {"rich_text": [{"text": {"content": ticket_id}}]},
            "Task #": {"number": task_num},
            "Type": {"select": {"name": pure_type}},
            "Status": {"select": {"name": "대기"}},
            "Priority": {"select": {"name": "보통"}},
            "Target Pages": {"rich_text": [{"text": {"content": target_page[:200]}}]},
            "Detail": {"rich_text": [{"text": {"content": detail[:2000]}}]},
            "Plan": {"rich_text": [{"text": {"content": ""}}]},
            "Result": {"rich_text": [{"text": {"content": ""}}]},
            "AS_IS": {"rich_text": [{"text": {"content": ""}}]},
            "TO_BE": {"rich_text": [{"text": {"content": ""}}]},
            "Verified": {"checkbox": False},
        },
    }
    return notion_api("POST", "https://api.notion.com/v1/pages", payload, auth_cfg)


# ── Inbox 구조화 저장 ──────────────────────────────────


def save_intake_md(project_code, mail_data, items, overall_type, complexity, pipeline,
                   ops_cfg, hub_path):
    """분석된 메일을 intake-ready 구조 파일로 저장 (3열 확장 포함)."""
    project = ops_cfg.get("projects", {}).get(project_code)
    if not project:
        return None

    project_path = resolve_project_path(project, hub_path)
    if not project_path:
        return None

    inbox_dir = project_path / "inbox"
    inbox_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    pure_type = overall_type.split(" ")[0]
    filename = f"{ts}_{pure_type}.md"
    filepath = inbox_dir / filename

    target_pages = detect_target_page(mail_data["subject"], mail_data["latest_body"])
    target_str = ", ".join(target_pages) if target_pages else "-"
    clean_subject = re.sub(
        r"^(RE:\s*|FW:\s*)+", "", mail_data["subject"], flags=re.IGNORECASE
    ).strip()

    lines = []
    lines.append(f"# 접수: {clean_subject}")
    lines.append("")
    lines.append("| 항목 | 내용 |")
    lines.append("|------|------|")
    lines.append(f"| 발신자 | {mail_data['from_name']} <{mail_data['from_email']}> |")
    lines.append(f"| 수신일 | {mail_data['date']} |")
    lines.append(f"| 프로젝트 | {project['name']} ({project_code}) |")
    lines.append(f"| 대상 URL | {target_str} |")
    lines.append(f"| 자동분류 | {overall_type} |")
    lines.append(f"| 복잡도 | {complexity} |")
    lines.append(f"| 파이프라인 | {pipeline} |")
    lines.append(f"| 처리상태 | 미처리 |")
    lines.append("")

    # 요청 요약
    lines.append("## 요청 요약")
    lines.append("")
    if items:
        lines.append(f"{mail_data['from_name']}님이 {len(items)}건의 수정 요청을 접수하였습니다.")
    else:
        lines.append(f"{mail_data['from_name']}님의 요청입니다.")
        lines.append(f"> {make_item_summary(mail_data['latest_body'])}")
    lines.append("")

    # 변경 대상 테이블 — 3열 확장 (적용 plan / 적용 결과 / AI 검토)
    lines.append("## 변경 대상")
    lines.append("")
    lines.append("| # | 항목 | 유형 | 상세 | 적용 plan | 적용 결과 | AI 검토 |")
    lines.append("|---|------|------|------|-----------|----------|---------|")

    if items:
        for item in items:
            summary = make_item_summary(item["text"])
            lines.append(
                f"| {item['num']} | {summary[:40]} | {item['type']} | {summary} | - | - | - |"
            )
    else:
        single_type = classify_item(mail_data["subject"] + " " + mail_data["latest_body"])
        summary = make_item_summary(mail_data["latest_body"])
        lines.append(f"| 1 | {clean_subject[:40]} | {single_type} | {summary} | - | - | - |")
    lines.append("")

    # 원문 참조 (짧게)
    lines.append("## 원문 (참조)")
    lines.append("")
    ref_text = mail_data["latest_body"][:500]
    for ref_line in ref_text.split("\n"):
        lines.append(f"> {ref_line}")
    if len(mail_data["latest_body"]) > 500:
        lines.append("> (...)")
    lines.append("")

    content = "\n".join(lines)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return str(filepath)


# ── Main ────────────────────────────────────────────────


def fetch_unseen_emails(email_cfg, ops_cfg, peek=False):
    """Connect to IMAP, fetch unseen emails, return parsed list."""
    context = ssl.create_default_context()
    mail = imaplib.IMAP4_SSL(
        email_cfg["imap_host"], email_cfg["imap_port"], ssl_context=context
    )
    mail.login(email_cfg["address"], email_cfg["password"])
    mail.select("INBOX")

    status, messages = mail.search(None, "UNSEEN")
    unseen_ids = messages[0].split() if messages[0] else []

    results = []
    for mid in unseen_ids:
        fetch_cmd = "(BODY.PEEK[])" if peek else "(RFC822)"
        status, data = mail.fetch(mid, fetch_cmd)
        if not data[0] or not isinstance(data[0], tuple):
            continue

        msg = email.message_from_bytes(data[0][1])
        message_id = msg.get("Message-ID", "").strip()
        subject = decode_str(msg.get("Subject", ""))
        from_str = decode_str(msg.get("From", ""))
        date_str = msg.get("Date", "")
        body = get_body(msg)

        email_match = re.search(r"<(.+?)>", from_str)
        from_email = email_match.group(1) if email_match else from_str
        from_domain = from_email.split("@")[-1] if "@" in from_email else ""

        latest_body = extract_latest_message(body)

        results.append({
            "id": mid,
            "message_id": message_id,
            "subject": subject,
            "from": from_str,
            "from_email": from_email,
            "from_domain": from_domain,
            "from_name": extract_sender_name(from_str),
            "date": date_str,
            "body": body,
            "latest_body": latest_body,
            "project": match_project(from_str, subject, email_cfg, ops_cfg),
        })

        if not peek:
            mail.store(mid, "+FLAGS", "\\Seen")

    mail.logout()
    return results


def analyze_email(em):
    """메일을 분석하여 항목 파싱 + 유형 분류 + 복잡도 판별."""
    items = parse_action_items(em["latest_body"])
    for item in items:
        item["type"] = classify_item(item["text"])
    overall_type, complexity = classify_overall(items, em["subject"], em["latest_body"])
    pipeline = determine_pipeline(overall_type, complexity)
    return {
        "items": items,
        "overall_type": overall_type,
        "complexity": complexity,
        "pipeline": pipeline,
    }


def process_emails(cfg, hub_path, dry_run=False):
    """Main processing: fetch → filter → analyze → save → Notion."""
    email_cfg = cfg["email"]
    ops_cfg = cfg["ops"]
    auth_cfg = cfg["auth"]
    log_path = _get_log_path(hub_path)

    print(f"[{datetime.now().strftime('%H:%M:%S')}] 메일 확인 시작...")
    emails = fetch_unseen_emails(email_cfg, ops_cfg, peek=dry_run)
    print(f"  미읽은 메일: {len(emails)}건")

    # 중복 방지
    processed_ids = _load_processed(log_path)
    fresh = [
        em for em in emails
        if not (em["message_id"] and em["message_id"] in processed_ids)
    ]
    if len(fresh) < len(emails):
        print(f"  중복 스킵: {len(emails) - len(fresh)}건 (이미 처리됨)")
    emails = fresh

    # Filter noise
    valid = []
    skipped = []
    for em in emails:
        if should_skip(em["from"], em["subject"], email_cfg):
            skipped.append(em)
        elif em["project"] is None:
            skipped.append(em)
        else:
            valid.append(em)

    print(f"  처리 대상: {len(valid)}건 | 스킵: {len(skipped)}건")
    for s in skipped:
        print(f"    스킵: [{s['from_domain']}] {s['subject'][:40]}")

    if dry_run:
        print("\n  [DRY RUN] 분석 결과 미리보기:\n")
        for em in valid:
            analysis = analyze_email(em)
            print(f"  ─── {em['subject'][:60]} ───")
            print(f"  프로젝트: {em['project']} | 발신: {em['from_name']}")
            print(f"  유형: {analysis['overall_type']} | 복잡도: {analysis['complexity']}")
            print(f"  파이프라인: {analysis['pipeline']}")
            if analysis["items"]:
                print(f"  요청 항목 ({len(analysis['items'])}건):")
                for item in analysis["items"]:
                    print(f"    {item['num']}. [{item['type']}] {item['text'][:60]}")
            else:
                print(f"  단일 요청: {em['latest_body'][:80]}")
            print()
        return {"processed": 0, "skipped": len(skipped), "total": len(emails)}

    processed = 0
    for em in valid:
        project_code = em["project"]
        project = ops_cfg.get("projects", {}).get(project_code)
        if not project:
            continue

        analysis = analyze_email(em)
        items = analysis["items"]
        overall_type = analysis["overall_type"]
        complexity = analysis["complexity"]
        pipeline = analysis["pipeline"]

        print(f"  ─── {em['subject'][:50]} ───")
        print(f"  분석: {overall_type} | {complexity} | {len(items)}건 항목")

        # inbox 저장
        inbox_path = save_intake_md(
            project_code, em, items, overall_type, complexity, pipeline,
            ops_cfg, hub_path,
        )
        print(f"  → 저장: {inbox_path}")

        # Notion 등록
        notion_cfg = project.get("notion")
        if notion_cfg and notion_cfg.get("tasks_db_id"):
            ticket_id = f"MAIL-{project_code}-{datetime.now().strftime('%m%d%H%M')}"

            if items:
                ok_count = 0
                for item in items:
                    result = create_notion_task(
                        db_id=notion_cfg["tasks_db_id"],
                        name=make_item_summary(item["text"])[:100],
                        ticket_id=ticket_id,
                        task_num=item["num"],
                        type_code=item["type"],
                        detail=item["text"][:2000],
                        target_page=", ".join(
                            detect_target_page(em["subject"], em["latest_body"])
                        )[:200] or "-",
                        auth_cfg=auth_cfg,
                    )
                    if result:
                        ok_count += 1
                print(f"  → Notion 등록: {ok_count}/{len(items)}건")
            else:
                clean_subj = re.sub(
                    r"^(RE:\s*|FW:\s*)+", "", em["subject"], flags=re.IGNORECASE
                ).strip()
                single_type = classify_item(em["subject"] + " " + em["latest_body"])
                result = create_notion_task(
                    db_id=notion_cfg["tasks_db_id"],
                    name=clean_subj[:100],
                    ticket_id=ticket_id,
                    task_num=1,
                    type_code=single_type,
                    detail=em["latest_body"][:2000],
                    target_page=", ".join(
                        detect_target_page(em["subject"], em["latest_body"])
                    )[:200] or "-",
                    auth_cfg=auth_cfg,
                )
                print(f"  → Notion 등록: {'완료' if result else '실패'}")

        processed += 1

        # 처리 완료 기록 (중복 방지)
        if em["message_id"]:
            processed_ids.append(em["message_id"])
            _save_processed(log_path, processed_ids)

    summary = {"processed": processed, "skipped": len(skipped), "total": len(emails)}
    print(f"\n  완료: 처리 {processed}건 / 스킵 {len(skipped)}건 / 전체 {len(emails)}건")
    return summary


def show_status(ops_cfg, hub_path):
    """Show current inbox status across all projects."""
    print("=== 프로젝트별 inbox 현황 ===\n")
    for code, proj in ops_cfg.get("projects", {}).items():
        project_path = resolve_project_path(proj, hub_path)
        if not project_path:
            print(f"  {proj.get('name', code)} ({code}): 경로 미설정")
            continue

        inbox_dir = project_path / "inbox"
        if not inbox_dir.exists():
            print(f"  {proj['name']} ({code}): inbox 없음")
            continue

        files = sorted(inbox_dir.glob("*.md"))
        unprocessed = 0
        for f in files:
            content = f.read_text(encoding="utf-8")
            if "| 처리상태 | 미처리 |" in content:
                unprocessed += 1

        print(f"  {proj['name']} ({code}): 전체 {len(files)}건 / 미처리 {unprocessed}건")
        for f in files[-5:]:
            content = f.read_text(encoding="utf-8")
            status = "미처리" if "| 처리상태 | 미처리 |" in content else "처리됨"
            print(f"    {f.name} [{status}]")
    print()


# ── Entry point ─────────────────────────────────────────

if __name__ == "__main__":
    _ensure_utf8()

    import argparse
    parser = argparse.ArgumentParser(description="NaverWorks 메일 → inbox + Notion 자동 등록")
    parser.add_argument("--dry-run", action="store_true", help="처리 없이 미리보기만")
    parser.add_argument("--status", action="store_true", help="현재 inbox 상태 확인")
    parser.add_argument("--hub", type=str, default=None, help="허브 경로 지정")
    parser.add_argument("--config", type=str, default=None, help="설정 파일 경로 지정")
    args = parser.parse_args()

    # 허브 경로 감지
    hub_path = Path(args.hub) if args.hub else detect_hub_path()

    # 설정 파일 감지
    config_path = find_config(hub_path, args.config)
    if not config_path:
        print("[오류] notion-config.json을 찾을 수 없습니다.", file=sys.stderr)
        print("  --config 또는 --hub 옵션으로 경로를 지정하세요.", file=sys.stderr)
        print("  /ops-setup 으로 초기 설정을 진행할 수도 있습니다.", file=sys.stderr)
        sys.exit(1)

    cfg = load_config(config_path)

    # 이메일 기능 비활성화 체크
    if not cfg.get("email", {}).get("enabled", False):
        if args.status:
            show_status(cfg.get("ops", {}), hub_path)
        else:
            print("[스킵] 이메일 기능이 비활성화되어 있습니다. (email.enabled = false)")
        sys.exit(0)

    if args.status:
        show_status(cfg.get("ops", {}), hub_path)
    elif args.dry_run:
        process_emails(cfg, hub_path, dry_run=True)
    else:
        process_emails(cfg, hub_path, dry_run=False)
