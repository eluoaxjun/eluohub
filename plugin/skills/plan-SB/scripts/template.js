/**
 * 화면설계서 HTML 템플릿 생성기 v2
 * JSON 데이터 + 테마 → HTML 프레임 렌더링
 *
 * v2 변경사항:
 * - css(theme): CSS Custom Properties로 테마 반영
 * - renderCover: 로고 분기 (text/image/none)
 * - renderOverview: assignment/sitemap/summary 분기
 * - generateHTML(data, theme): 테마 파라미터 추가
 */

function css(theme) {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${theme.fonts.primary}; background: #fff; }

  /* 화면용: 가로 나열 */
  @media screen {
    body { background: #4a4a4a; display: flex; gap: 40px; padding: 40px; overflow-x: auto; }
  }

  /* 인쇄/PDF용: 프레임별 페이지 */
  @media print {
    body { display: block; padding: 0; background: #fff; }
    .frame { width: 100% !important; min-height: 100vh !important; page-break-after: always; page-break-inside: avoid; border: none !important; overflow: visible !important; }
    .frame:last-child { page-break-after: auto; }
    .frame-body { overflow: visible !important; }
  }

  .frame { width: ${theme.frame.width}px; min-height: ${theme.frame.minHeight}px; background: #fff; border: ${theme.frame.borderWidth}px solid ${theme.primaryColor}; flex-shrink: 0; display: flex; flex-direction: column; position: relative; }
  .frame-header { background: ${theme.primaryColor}; height: 8px; }
  .frame-footer { margin-top: auto; padding: 12px 24px; display: flex; justify-content: space-between; font-size: 11px; color: #999; border-top: 1px solid #eee; }
  .frame-body { padding: 40px; flex: 1; }

  /* Cover */
  .cover-body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; }
  .cover-ref { font-size: 13px; color: #666; margin-bottom: 8px; }
  .cover-title { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
  .cover-version { font-size: 12px; color: #888; }
  .cover-logo { font-size: 64px; font-weight: 900; color: #333; margin-bottom: 24px; }
  .cover-logo-img { max-height: 80px; margin-bottom: 24px; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f5f5f5; font-weight: 600; padding: 10px 12px; border: 1px solid #ddd; text-align: center; }
  td { padding: 10px 12px; border: 1px solid #ddd; vertical-align: top; }
  .section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #333; }

  /* Meta table */
  .meta-table { width: 100%; margin-bottom: 20px; }
  .meta-table td { padding: 6px 10px; font-size: 12px; }
  .meta-table .key { background: #f0f0f0; font-weight: 600; width: 120px; color: #333; }
  .meta-table .val { background: #fff; }

  /* Design area */
  .design-area { display: flex; gap: 20px; margin-top: 12px; }
  .ui-capture { flex: 1; min-height: 500px; background: #f9f9f9; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; color: #999; font-size: 14px; overflow: hidden; }
  .ui-capture-inner { position: relative; display: inline-block; max-width: 100%; max-height: 100%; }
  .ui-capture-inner img { display: block; max-width: 100%; max-height: 580px; }

  /* 수정 영역 오버레이 */
  .marker-overlay { position: absolute; border: 2px dashed ${theme.accentColor}; pointer-events: none; z-index: 1; }
  .marker-number { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: ${theme.accentColor}; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; z-index: 2; }

  /* Description area */
  .description-area { width: 340px; border: 1px solid #ddd; padding: 16px; font-size: 12px; line-height: 1.6; }
  .description-area h4 { font-size: 13px; font-weight: 700; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #333; }
  .desc-marker { display: inline-block; width: 20px; height: 20px; background: ${theme.accentColor}; color: #fff; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; margin-right: 6px; vertical-align: middle; }
  .desc-item { margin-bottom: 14px; }
  .desc-item-header { font-weight: 700; font-size: 12px; margin-bottom: 6px; }
  .desc-detail { margin: 0; padding-left: 28px; }
  .desc-detail li { margin-bottom: 3px; font-size: 11px; color: #333; list-style: disc; }
  .desc-detail .highlight { color: ${theme.accentColor}; font-weight: 600; }
  .desc-before { background: #fff3f3; padding: 8px; margin: 4px 0 4px 28px; border-left: 3px solid ${theme.accentColor}; font-size: 11px; }
  .desc-after { background: #f0fff0; padding: 8px; margin: 4px 0 8px 28px; border-left: 3px solid #2e8b57; font-size: 11px; }
  .desc-label { font-size: 10px; font-weight: 700; color: #888; margin: 2px 0 2px 28px; }

  /* Wireframe */
  .wf-container { flex: 1; min-height: 500px; background: #fff; border: 1px solid #ddd; padding: 0; overflow: visible; position: relative; }
  .wf-viewport { padding: 0 0 0 30px; }
  .wf-el { border: 1px dashed #ccc; background: #fafafa; padding: 10px 12px; margin: 0 0 6px 0; font-size: 11px; color: #666; position: relative; display: flex; flex-direction: column; }
  .wf-el:last-child { margin-bottom: 0; }
  .wf-el--header { background: #e8e8e8; border: 1px solid #bbb; min-height: 44px; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #555; }
  .wf-el--nav { background: #f0f0f0; border: 1px solid #ccc; min-height: 36px; display: flex; align-items: center; gap: 16px; padding: 0 16px; }
  .wf-el--nav span { font-size: 11px; color: #888; }
  .wf-el--text { background: #fff; border: 1px dashed #ddd; padding: 10px 12px; }
  .wf-el--text .wf-content { color: #333; font-size: 12px; margin-top: 4px; }
  .wf-el--input { background: #fff; border: 1px solid #ccc; border-radius: 4px; min-height: 36px; display: flex; align-items: center; padding: 0 10px; color: #aaa; font-size: 12px; }
  .wf-el--button { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 0 20px; border-radius: 4px; font-size: 12px; font-weight: 600; border: 1px solid #999; background: #f5f5f5; color: #333; cursor: default; }
  .wf-el--button-primary { background: #333; color: #fff; border-color: #333; }
  .wf-el--button-outline { background: transparent; border: 1px solid #999; color: #666; }
  .wf-el--card { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
  .wf-el--image { background: #f0f0f0; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #aaa; min-height: 80px; }
  .wf-el--image::before { content: '\\1F5BC'; font-size: 20px; margin-right: 6px; }
  .wf-el--list { background: #fff; border: 1px dashed #ddd; padding: 8px 12px 8px 28px; }
  .wf-el--list li { font-size: 11px; color: #555; margin-bottom: 4px; list-style: disc; }
  .wf-el--banner { background: linear-gradient(135deg, #e8e8e8, #f5f5f5); border: 1px solid #ccc; min-height: 80px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #888; font-weight: 600; }
  .wf-el--divider { border: none; border-top: 1px solid #ddd; margin: 8px 0; padding: 0; min-height: 0; background: transparent; }
  .wf-el--group { border: 1px dashed #bbb; background: #fcfcfc; padding: 8px; gap: 6px; }
  .wf-el--table { background: #fff; }
  .wf-el--table table { width: 100%; border-collapse: collapse; font-size: 10px; }
  .wf-el--table th { background: #f0f0f0; padding: 4px 6px; border: 1px solid #ddd; font-size: 10px; }
  .wf-el--table td { padding: 4px 6px; border: 1px solid #ddd; font-size: 10px; }
  .wf-label { font-size: 9px; color: #999; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
  .wf-marker { position: absolute; top: 50%; left: -26px; transform: translateY(-50%); width: 22px; height: 22px; background: ${theme.accentColor}; color: #fff; border-radius: 50%; text-align: center; line-height: 22px; font-size: 10px; font-weight: 700; z-index: 2; }
  .wf-el--marked { border: 2px dashed ${theme.accentColor} !important; background: rgba(204, 51, 51, 0.03); }

  /* Description Table v2 — 2열 구조화 테이블 */
  .desc-table { width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.6; }
  .desc-table th { background: #f5f5f5; font-weight: 600; padding: 6px 8px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
  .desc-table td { padding: 6px 8px; border: 1px solid #ddd; vertical-align: top; font-size: 11px; }
  .desc-table .desc-num-cell { width: 50px; text-align: center; font-weight: 700; color: #333; }
  .desc-table .desc-content-cell { color: #333; }
  .desc-table .desc-common-row td { background: #fafafa; }
  .desc-indent-1 { }
  .desc-indent-2 { padding-left: 16px; }
  .desc-indent-3 { padding-left: 32px; }
  .desc-indent-4 { padding-left: 48px; }
  .desc-var { color: #e67700; font-weight: 600; }
  .desc-important { color: #c00000; font-weight: 600; }
  .desc-continuation { font-size: 10px; color: #999; font-style: italic; text-align: center; padding: 6px 0; border-top: 1px dashed #ddd; }
  .desc-change-tag { display: inline-block; font-size: 8px; font-weight: 700; padding: 1px 5px; border-radius: 2px; margin-left: 4px; vertical-align: middle; letter-spacing: 0.5px; }
  .desc-change-tag--modify { background: #fff3f3; color: #c00; border: 1px solid #c00; }
  .desc-change-tag--add { background: #f0f7ff; color: #0070c0; border: 1px solid #0070c0; }
  .desc-change-tag--delete { background: #f5f5f5; color: #666; border: 1px solid #999; text-decoration: line-through; }

  /* Divider v2 — 섹션 번호 + TOC */
  .divider-section-no { font-size: 64px; font-weight: 900; color: rgba(255,255,255,0.15); margin-bottom: 8px; }
  .divider-toc { list-style: none; padding: 0; margin-top: 24px; text-align: left; display: inline-block; }
  .divider-toc li { font-size: 13px; color: #bbb; margin-bottom: 8px; display: flex; gap: 12px; align-items: baseline; }
  .divider-toc .toc-id { color: #777; font-size: 11px; min-width: 90px; font-family: monospace; }
  .divider-toc .toc-name { color: #ddd; }

  /* Persistent — Header/Footer/LNB/Breadcrumb */
  .wf-persistent-header { background: #e0e0e0; border-bottom: 2px solid #bbb; padding: 8px 16px; min-height: 44px; display: flex; align-items: center; justify-content: space-between; }
  .wf-persistent-header .site-logo { font-weight: 700; font-size: 13px; color: #333; }
  .wf-persistent-gnb { display: flex; gap: 20px; }
  .wf-persistent-gnb span { font-size: 11px; color: #666; }
  .wf-persistent-breadcrumb { font-size: 10px; color: #999; padding: 6px 16px; background: #fafafa; border-bottom: 1px solid #eee; }
  .wf-persistent-lnb { width: 160px; min-height: 300px; background: #f7f7f7; border-right: 1px solid #ddd; padding: 12px 0; font-size: 11px; flex-shrink: 0; }
  .wf-persistent-lnb ul { list-style: none; padding: 0; margin: 0; }
  .wf-persistent-lnb li { padding: 8px 16px; color: #666; }
  .wf-persistent-lnb li.active { color: #333; font-weight: 700; background: #e8e8e8; }
  .wf-persistent-footer { background: #e0e0e0; border-top: 2px solid #bbb; padding: 12px 16px; min-height: 48px; font-size: 10px; color: #888; display: flex; align-items: center; justify-content: center; }
  .wf-with-lnb { display: flex; flex: 1; }
  .wf-main-content { flex: 1; }

  /* Cover meta table (P1-1: 작성/검토/승인 3×4) */
  .cover-meta { width: 80%; max-width: 600px; border-collapse: collapse; margin-top: 32px; font-size: 11px; }
  .cover-meta th { background: #f0f0f0; font-weight: 600; padding: 6px 10px; border: 1px solid #ddd; text-align: center; width: 100px; }
  .cover-meta td { padding: 6px 10px; border: 1px solid #ddd; text-align: center; }

  /* MSG/Dialog Case table (P1-2) */
  .msg-case-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
  .msg-case-table th { background: #f5f5f5; font-weight: 600; padding: 6px 8px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
  .msg-case-table td { padding: 6px 8px; border: 1px solid #ddd; vertical-align: top; font-size: 11px; }
  .msg-type-error { color: #c00000; font-weight: 600; }
  .msg-type-process { color: #0070c0; font-weight: 600; }
  .msg-type-positive { color: #2e8b57; font-weight: 600; }
  .msg-type-negative { color: #e67700; font-weight: 600; }

  /* Component guide table (P2-1) */
  .comp-guide-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
  .comp-guide-table th { background: #f5f5f5; font-weight: 600; padding: 6px 8px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
  .comp-guide-table td { padding: 6px 8px; border: 1px solid #ddd; vertical-align: top; font-size: 11px; }
  .comp-state-label { display: inline-block; font-size: 9px; padding: 1px 6px; border-radius: 3px; font-weight: 600; margin-right: 4px; }
  .comp-state-default { background: #e8f5e9; color: #2e7d32; }
  .comp-state-focus { background: #e3f2fd; color: #1565c0; }
  .comp-state-error { background: #ffebee; color: #c62828; }
  .comp-state-disabled { background: #f5f5f5; color: #9e9e9e; }

  /* Modified marker + Version stamp */
  .modified-marker { position: absolute; top: 12px; right: 12px; background: #fff3f3; color: #c00; font-size: 9px; font-weight: 700; padding: 2px 8px; border: 1px solid #c00; border-radius: 2px; z-index: 3; }
  .version-stamp { font-size: 9px; color: #999; }

  /* PM Comments */
  .pm-comment-section { margin-top: 14px; padding-top: 10px; border-top: 1px dashed #e0a030; }
  .pm-comment-section h5 { font-size: 11px; font-weight: 700; color: #b07800; margin-bottom: 8px; }
  .pm-comment { background: #fffbf0; border-left: 3px solid #e0a030; padding: 8px 10px; margin-bottom: 8px; font-size: 11px; line-height: 1.5; }
  .pm-badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px; margin-right: 6px; vertical-align: middle; }
  .pm-badge--risk { background: #ffdddd; color: #c00; }
  .pm-badge--question { background: #fff3cd; color: #856404; }
  .pm-badge--suggestion { background: #d4edda; color: #155724; }
  .pm-badge--reject { background: #e0e0e0; color: #333; }
  .pm-author { font-size: 10px; color: #999; margin-left: 4px; }
  `;
}

/**
 * 커버 페이지 — 로고 분기 (text/image/none)
 */
function renderCover(data, theme) {
  const p = data.project;
  const logo = theme.logo || { type: 'none' };

  let logoHtml = '';
  if (logo.type === 'text' && logo.html) {
    logoHtml = `<div class="cover-logo">${logo.html}</div>`;
  } else if (logo.type === 'image' && logo.imagePath) {
    logoHtml = `<img class="cover-logo-img" src="${logo.imagePath}" alt="Logo">`;
  } else if (p.company?.name) {
    logoHtml = `<div class="cover-logo" style="font-size:18px; font-weight:700; color:#666; letter-spacing:2px;">${p.company.name}</div>`;
  }

  // P1-1: 커버 메타 테이블 (작성/검토/승인)
  const metaHtml = renderCoverMetaTable(p);

  // 커버 레퍼런스 라인: v1 호환 (jiraNo/srNo) 또는 v2 범용
  if (p.jiraNo && p.srNo) {
    const dateCompact = (p.date || '').replace(/-/g, '');
    const srCompact = (p.srNo || '').replace(/-/g, '_');
    const refLine = `[${p.jiraNo}]_[${p.srNo}] ${p.title}`;
    const versionLine = `[${p.jiraNo}]_[${srCompact}]_Ver ${p.version}_${dateCompact}`;
    return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body cover-body">
    ${logoHtml}
    <div class="cover-ref">${refLine}</div>
    <div class="cover-title">${p.serviceName || p.title}</div>
    <div class="cover-version">${versionLine}</div>
    ${metaHtml}
  </div>
  <div class="frame-footer"><span>${p.company?.name || ''}</span><span>${p.writer}</span></div>
</div>`;
  }

  // v2 범용 커버
  return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body cover-body">
    ${logoHtml}
    <div class="cover-title">${p.serviceName || p.title}</div>
    <div class="cover-version">Ver ${p.version} | ${p.date}</div>
    ${metaHtml}
  </div>
  <div class="frame-footer"><span>${p.company?.name || ''}</span><span>${p.writer}</span></div>
</div>`;
}

/**
 * P1-1: 커버 메타 테이블 (작성/검토/승인 3×4)
 * reviewers/approvers 필드가 있을 때만 렌더
 */
function renderCoverMetaTable(p) {
  const hasReviewers = p.reviewers && p.reviewers.length > 0;
  const hasApprovers = p.approvers && p.approvers.length > 0;
  if (!hasReviewers && !hasApprovers) return '';

  return `
    <table class="cover-meta">
      <thead>
        <tr><th></th><th>작성</th><th>검토</th><th>승인</th></tr>
      </thead>
      <tbody>
        <tr>
          <th>일자</th>
          <td>${p.date || ''}</td>
          <td>${p.reviewDate || ''}</td>
          <td>${p.approveDate || ''}</td>
        </tr>
        <tr>
          <th>담당</th>
          <td>${p.writer || ''}</td>
          <td>${(p.reviewers || []).join(', ')}</td>
          <td>${(p.approvers || []).join(', ')}</td>
        </tr>
        <tr>
          <th>서명</th>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>`;
}

function renderHistory(data) {
  const p = data.project;
  const companyName = p.company?.name || '';
  const rows = data.history.map(h => `
        <tr>
          <td style="text-align:center">${h.version}</td>
          <td style="text-align:center">${h.date}</td>
          <td>${h.detail}</td>
          <td style="text-align:center">${h.page || '-'}</td>
          <td style="text-align:center">${h.writer}</td>
          <td>${h.remarkers || ''}</td>
        </tr>`).join('');

  return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body">
    <div class="section-title">History</div>
    <table>
      <thead>
        <tr>
          <th style="width:80px">Version</th>
          <th style="width:110px">Update Date</th>
          <th>Update Detail</th>
          <th style="width:60px">page</th>
          <th style="width:70px">Writer</th>
          <th>Remarkers</th>
        </tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
  </div>
  <div class="frame-footer"><span>${companyName}</span><span>${p.writer}</span></div>
</div>`;
}

/**
 * Overview 렌더링 — type별 분기
 * - assignment: 디바이더 + 상세 테이블 + 인터페이스 목록 (v1 호환)
 * - sitemap: 사이트맵 구조
 * - summary: 요약 텍스트
 */
function renderOverview(data) {
  const ov = data.overview;
  if (!ov) return '';

  switch (ov.type) {
    case 'assignment':
      return renderAssignmentOverview(data);
    case 'sitemap':
      return renderSitemapOverview(data);
    case 'summary':
    default:
      return renderSummaryOverview(data);
  }
}

function renderAssignmentOverview(data) {
  const p = data.project;
  const ov = data.overview;
  const companyName = p.company?.name || '';
  const bullets = (ov.divider?.bullets || []).map(b =>
    `<li style="list-style:disc; margin-left:20px; margin-bottom:12px;">${b}</li>`).join('');

  // 디바이더 프레임
  const dividerFrame = `
<div class="frame" style="display:flex; flex-direction:column; justify-content:center; align-items:center; background:#1a1a1a; color:#fff;">
  <div class="frame-header" style="position:absolute; top:0; left:0; right:0;"></div>
  <div style="text-align:center; padding:40px;">
    <div style="font-size:14px; color:#aaa; margin-bottom:12px;">${ov.divider?.sub || ''}</div>
    <div style="font-size:28px; font-weight:700; margin-bottom:40px;">${ov.divider?.main || ''}</div>
    <ul style="font-size:15px; color:#ccc; text-align:left; display:inline-block;">${bullets}</ul>
  </div>
</div>`;

  // Assignment Detail 프레임
  const detailFrame = `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body">
    <div class="section-title">Operational Assignment Detail</div>
    <table>
      <thead>
        <tr>
          <th style="width:130px">Jira No.</th>
          <th style="width:140px">SR No.</th>
          <th>Assignment title</th>
          <th>Assignment Detail</th>
          <th style="width:130px">Requestor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center">${p.jiraNo || p.id || ''}</td>
          <td style="text-align:center">${p.srNo || '-'}</td>
          <td>${p.title}</td>
          <td>${ov.content?.detail || ''}</td>
          <td>${p.requestor}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="frame-footer"><span>${companyName}</span><span>${p.writer}</span></div>
</div>`;

  // 인터페이스 목록
  const interfaceFrame = renderInterfaceList(data);

  return dividerFrame + '\n' + detailFrame + '\n' + interfaceFrame;
}

function renderSitemapOverview(data) {
  const p = data.project;
  const ov = data.overview;
  const companyName = p.company?.name || '';
  const interfaces = ov.interfaces || [];

  const rows = interfaces.map(i => `
        <tr>
          <td style="text-align:center">${i.depth1 || ''}</td>
          <td style="text-align:center">${i.depth2 || ''}</td>
          <td style="text-align:center">${i.depth3 || ''}</td>
          <td style="text-align:center">${i.depth4 || '-'}</td>
          <td style="text-align:center">${i.workType || ''}</td>
        </tr>`).join('');

  return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body">
    <div class="section-title">${ov.title || 'Site Map'}</div>
    <table>
      <thead>
        <tr>
          <th>1 Depth</th>
          <th>2 Depth</th>
          <th>3 Depth</th>
          <th>4 Depth</th>
          <th style="width:80px">Work Type</th>
        </tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
  </div>
  <div class="frame-footer"><span>${companyName}</span><span>${p.writer}</span></div>
</div>`;
}

function renderSummaryOverview(data) {
  const p = data.project;
  const ov = data.overview;
  const companyName = p.company?.name || '';

  // 구조화: 프로젝트 정보 테이블 + Overview 내용
  const infoRows = [
    ['프로젝트명', p.serviceName || p.title || ''],
    ['버전', `Ver ${p.version || '1.0'}`],
    ['작성일', p.date || ''],
    ['작성자', p.writer || ''],
  ].filter(r => r[1]).map(r =>
    `<tr><td style="width:120px; padding:8px 12px; font-weight:600; color:#555; background:#f8f9fa; border:1px solid #e0e0e0; font-size:12px;">${r[0]}</td><td style="padding:8px 12px; border:1px solid #e0e0e0; font-size:12px; color:#333;">${r[1]}</td></tr>`
  ).join('');

  const overviewText = ov.content?.detail || ov.content?.summary || '';

  return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body">
    <div class="section-title">${ov.title || 'Overview'}</div>
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
      ${infoRows}
    </table>
    <div style="font-size:13px; line-height:1.8; color:#333; padding:12px 16px; background:#f8f9fa; border-left:3px solid #1a1a1a;">
      ${overviewText}
    </div>
  </div>
  <div class="frame-footer"><span>${companyName}</span><span>${p.writer}</span></div>
</div>`;
}

function renderInterfaceList(data) {
  const p = data.project;
  const companyName = p.company?.name || '';
  const interfaces = data.overview?.interfaces || [];

  if (interfaces.length === 0) return '';

  const rows = interfaces.map(i => `
        <tr>
          <td style="text-align:center">${i.office || ''}</td>
          <td style="text-align:center">${i.channel || ''}</td>
          <td style="text-align:center">${i.depth1 || ''}</td>
          <td style="text-align:center">${i.depth2 || ''}</td>
          <td style="text-align:center">${i.depth3 || ''}</td>
          <td style="text-align:center">${i.depth4 || '-'}</td>
          <td style="text-align:center">${i.interfaceType || ''}</td>
          <td style="text-align:center">${i.workType || ''}</td>
          <td style="text-align:center">${i.pageId || '(None)'}</td>
        </tr>`).join('');

  return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body">
    <div class="section-title">Task Target InterFace List</div>
    <table>
      <thead>
        <tr>
          <th rowspan="2" style="width:100px">Office</th>
          <th rowspan="2" style="width:80px">Channel</th>
          <th colspan="4">Target Interface</th>
          <th rowspan="2" style="width:100px">Interface Type</th>
          <th rowspan="2" style="width:80px">Work Type</th>
          <th rowspan="2" style="width:80px">Page ID</th>
        </tr>
        <tr>
          <th>1 Depth</th>
          <th>2 Depth</th>
          <th>3 Depth</th>
          <th>4 Depth</th>
        </tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
  </div>
  <div class="frame-footer"><span>${companyName}</span><span>${p.writer}</span></div>
</div>`;
}

function renderMetaTable(screen, data) {
  const p = data.project;
  const companyName = p.company?.name || '';
  return `
    <table class="meta-table">
      <tr>
        <td class="key">Assignment</td>
        <td class="val" colspan="2">${p.title}</td>
        <td class="key">Interface Type</td>
        <td class="val">(${screen.viewportType})</td>
      </tr>
      <tr>
        <td class="key">Page</td>
        <td class="val" colspan="2">${screen.pageName || ''}</td>
        <td class="key">Interface ID</td>
        <td class="val">${screen.interfaceId || '(None)'}</td>
      </tr>
      <tr>
        <td class="key">Location</td>
        <td class="val" colspan="2">${screen.location}</td>
        <td class="key">Interface Name</td>
        <td class="val">${screen.interfaceName}</td>
      </tr>
      <tr>
        <td class="key">Writer</td>
        <td class="val" colspan="2">${p.writer}</td>
        <td class="key">Date</td>
        <td class="val">${p.date}</td>
      </tr>
    </table>`;
}

/**
 * 와이어프레임 엘리먼트 1개 렌더링
 */
function renderWfElement(el) {
  const markerHtml = el.marker
    ? `<span class="wf-marker">${el.marker}</span>` : '';
  const markedCls = el.marker ? ' wf-el--marked' : '';
  const labelHtml = el.label
    ? `<span class="wf-label">${el.label}</span>` : '';
  const h = el.height ? `min-height:${el.height};` : '';

  switch (el.type) {
    case 'header':
      return `<div class="wf-el wf-el--header${markedCls}" style="${h}">${markerHtml}${el.label || 'Header'}</div>`;
    case 'nav':
    case 'gnb':
      const navItems = (el.items || ['메뉴1', '메뉴2', '메뉴3']).map(i => `<span>${i}</span>`).join('');
      return `<div class="wf-el wf-el--nav${markedCls}" style="${h}">${markerHtml}${navItems}</div>`;
    case 'text':
      const content = el.content ? `<div class="wf-content">${el.content}</div>` : '';
      return `<div class="wf-el wf-el--text${markedCls}" style="${h}">${markerHtml}${labelHtml}${content}</div>`;
    case 'input':
      return `<div class="wf-el wf-el--input${markedCls}" style="${h}">${markerHtml}${el.label || el.placeholder || 'Input'}</div>`;
    case 'button': {
      const variant = el.variant === 'primary' ? ' wf-el--button-primary'
        : el.variant === 'outline' ? ' wf-el--button-outline' : '';
      return `<div class="wf-el wf-el--button${variant}${markedCls}" style="${h}">${markerHtml}${el.label || 'Button'}</div>`;
    }
    case 'card': {
      const children = (el.children || []).map(c => renderWfElement(c)).join('');
      return `<div class="wf-el wf-el--card${markedCls}" style="${h}">${markerHtml}${labelHtml}${children}</div>`;
    }
    case 'image':
      return `<div class="wf-el wf-el--image${markedCls}" style="${h}">${markerHtml}${el.label || 'Image'}</div>`;
    case 'list': {
      const items = (el.items || []).map(i => `<li>${i}</li>`).join('');
      return `<div class="wf-el wf-el--list${markedCls}" style="${h}">${markerHtml}${labelHtml}<ul>${items}</ul></div>`;
    }
    case 'banner':
      return `<div class="wf-el wf-el--banner${markedCls}" style="${h}">${markerHtml}${el.label || 'Banner'}</div>`;
    case 'divider':
      return `<div class="wf-el wf-el--divider"></div>`;
    case 'table': {
      const headers = (el.headers || []).map(h => `<th>${h}</th>`).join('');
      const rows = (el.rows || []).map(r =>
        `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
      return `<div class="wf-el wf-el--table${markedCls}" style="${h}">${markerHtml}${labelHtml}<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    case 'group': {
      const children = (el.children || []).map(c => renderWfElement(c)).join('');
      return `<div class="wf-el wf-el--group${markedCls}" style="${h}">${markerHtml}${labelHtml}${children}</div>`;
    }
    default:
      return `<div class="wf-el${markedCls}" style="${h}">${markerHtml}${labelHtml}${el.content || el.type}</div>`;
  }
}

/**
 * PM 코멘트 블록 렌더 (Description 영역 하단)
 */
function renderPmComments(pmComments) {
  if (!pmComments || pmComments.length === 0) return '';

  const typeLabels = {
    risk: '위험', question: '질문', suggestion: '제안', reject: '반대'
  };

  const items = pmComments.map(c => {
    const badgeClass = `pm-badge pm-badge--${c.type || 'question'}`;
    const label = typeLabels[c.type] || c.type;
    const markerRef = c.marker ? `<span class="desc-marker" style="width:16px;height:16px;line-height:16px;font-size:9px;">${c.marker}</span>` : '';
    return `<div class="pm-comment">
      ${markerRef}<span class="${badgeClass}">${label}</span><span class="pm-author">${c.author || 'PM'}</span>
      <div style="margin-top:4px;">${c.comment}</div>
    </div>`;
  }).join('');

  return `
    <div class="pm-comment-section">
      <h5>PM Comments</h5>
      ${items}
    </div>`;
}

/**
 * 변경 유형 태그 렌더 — [변경] [추가] [삭제]
 */
function renderChangeTag(changeType) {
  if (!changeType) return '';
  const map = {
    '변경': 'modify', 'modify': 'modify', 'changed': 'modify',
    '추가': 'add', 'add': 'add', 'added': 'add', 'new': 'add',
    '삭제': 'delete', 'delete': 'delete', 'removed': 'delete', 'remove': 'delete'
  };
  const cls = map[changeType.toLowerCase()] || 'modify';
  const label = changeType.length <= 3 ? changeType : changeType.charAt(0).toUpperCase() + changeType.slice(1);
  return `<span class="desc-change-tag desc-change-tag--${cls}">${label}</span>`;
}

/**
 * Description 테이블 v2 — 2열 구조화 (번호 | 상세설명)
 * items[] 있으면 v2, 없으면 v1(details[]) 호환
 */
function renderDescriptionTableV2(descriptions, pmComments) {
  if (!descriptions || descriptions.length === 0) return '';

  let rows = '';

  // 공통 행 (commonNote가 있는 첫 번째 description에서)
  const commonNote = descriptions.find(d => d.commonNote)?.commonNote;
  if (commonNote) {
    rows += `<tr class="desc-common-row">
      <td class="desc-num-cell" style="font-weight:600;">공통</td>
      <td class="desc-content-cell">- ${commonNote}</td>
    </tr>`;
  }

  for (const d of descriptions) {
    let content = '';

    // 라벨 (볼드 타이틀)
    if (d.label) {
      content += `<div style="font-weight:700; margin-bottom:4px;">${d.label}</div>`;
    }

    // items (v2 구조화 포맷)
    if (d.items && d.items.length > 0) {
      for (const item of d.items) {
        const level = item.level || 1;
        const indentClass = `desc-indent-${Math.min(level, 4)}`;
        const numPrefix = item.num ? `${item.num}) ` : '';
        let textEl;
        if (item.highlight === 'important') {
          textEl = `<span class="desc-important">■ ${item.text}</span>`;
        } else if (item.highlight === 'variable') {
          textEl = `<span class="desc-var">■ ${item.text}</span>`;
        } else {
          const prefix = level === 1 ? '- ' : level === 3 ? '> ' : level === 4 ? '└ ' : '';
          textEl = `${prefix}${numPrefix}${item.text}`;
        }
        content += `<div class="${indentClass}">${textEl}</div>`;
      }
    }
    // details (v1 호환)
    else if (d.details && d.details.length > 0) {
      for (const detail of d.details) {
        content += `<div class="desc-indent-1">- ${detail}</div>`;
      }
    }

    // Before/After — 내용이 있는 쪽만 렌더
    if (d.before || d.after) {
      let baHtml = '<div style="margin-top:6px;">';
      if (d.before) {
        baHtml += `<div class="desc-label" style="margin-left:0;">수정 전</div>
        <div class="desc-before" style="margin-left:0;">${d.before}</div>`;
      }
      if (d.after) {
        baHtml += `<div class="desc-label" style="margin-left:0;">수정 후</div>
        <div class="desc-after" style="margin-left:0;">${d.after}</div>`;
      }
      baHtml += '</div>';
      content += baHtml;
    }

    // Continuation
    if (d.continuation) {
      const contText = d.continuation === 'next'
        ? '▶ 다음 슬라이드에 계속됨'
        : '◀ 이전 슬라이드에서 이어짐';
      content += `<div class="desc-continuation">${contText}</div>`;
    }

    rows += `<tr>
      <td class="desc-num-cell">${d.marker}${renderChangeTag(d.changeType)}</td>
      <td class="desc-content-cell">${content}</td>
    </tr>`;
  }

  const pmHtml = renderPmComments(pmComments);

  return `
    <table class="desc-table">
      <thead><tr><th colspan="2">Description</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${pmHtml}`;
}

/**
 * Persistent 영역 렌더 — Header/GNB/Breadcrumb/LNB/Footer
 */
function renderPersistentHeader(persistent) {
  if (!persistent || !persistent.header) return '';
  const h = persistent.header;
  const logo = h.label || h.logo || 'Site Logo';
  const gnbItems = (h.items || []).map(i => `<span>${i}</span>`).join('');
  return `<div class="wf-persistent-header">
    <div class="site-logo">${logo}</div>
    <div class="wf-persistent-gnb">${gnbItems}</div>
  </div>`;
}

function renderPersistentBreadcrumb(persistent) {
  if (!persistent || !persistent.breadcrumb) return '';
  return `<div class="wf-persistent-breadcrumb">${persistent.breadcrumb}</div>`;
}

function renderPersistentLnb(persistent) {
  if (!persistent || !persistent.lnb) return '';
  const items = (persistent.lnb.items || []).map((item, i) => {
    const isActive = i === (persistent.lnb.activeIndex || 0);
    return `<li${isActive ? ' class="active"' : ''}>${item}</li>`;
  }).join('');
  return `<div class="wf-persistent-lnb"><ul>${items}</ul></div>`;
}

function renderPersistentFooter(persistent) {
  if (!persistent || !persistent.footer) return '';
  const text = typeof persistent.footer === 'string' ? persistent.footer : 'Footer';
  return `<div class="wf-persistent-footer">${text}</div>`;
}

function renderDesignArea(screen) {
  // 와이어프레임 모드 → 전용 렌더
  if (!screen.uiImagePath && screen.wireframe) {
    return renderWireframeDesignArea(screen);
  }

  // 이미지/플레이스홀더 모드
  const markers = (screen.descriptions || []).map(d => {
    if (!d.overlay) return '';
    return `<div class="marker-overlay" style="top:${d.overlay.top}; left:${d.overlay.left}; width:${d.overlay.width}; height:${d.overlay.height};">
              <span class="marker-number">${d.marker}</span>
            </div>`;
  }).join('');

  let uiContent;
  if (screen.uiImagePath) {
    uiContent = `<div class="ui-capture-inner"><img src="${screen.uiImagePath}" alt="${screen.viewportType} UI">${markers}</div>`;
  } else {
    uiContent = `[${screen.viewportType} UI 캡처 이미지 영역]`;
  }

  // Description — v2 테이블 또는 v1 호환
  const hasV2 = (screen.descriptions || []).some(d => d.items || d.commonNote);

  let descHtml;
  if (hasV2) {
    descHtml = `<div class="description-area">
      ${renderDescriptionTableV2(screen.descriptions, screen.pmComments)}
    </div>`;
  } else {
    // v1 호환 렌더 (renderWireframeDesignArea 경로)
    const descs = (screen.descriptions || []).map(d => {
      const details = (d.details || []).map(item =>
        `<li>${item}</li>`).join('');
      const detailBlock = details
        ? `<ul class="desc-detail">${details}</ul>` : '';
      let beforeAfter = '';
      if (d.before || d.after) {
        if (d.before) {
          beforeAfter += `<div class="desc-label">수정 전</div>
          <div class="desc-before">${d.before}</div>`;
        }
        if (d.after) {
          beforeAfter += `<div class="desc-label">수정 후</div>
          <div class="desc-after">${d.after}</div>`;
        }
      }
      return `<div class="desc-item">
          <div class="desc-item-header"><span class="desc-marker">${d.marker}</span>${d.label}</div>
          ${detailBlock}${beforeAfter}
        </div>`;
    }).join('\n');
    const pmHtml = renderPmComments(screen.pmComments);
    descHtml = `<div class="description-area">
      <h4>Description</h4>
      ${descs}${pmHtml}
    </div>`;
  }

  return `
    <div class="design-area">
      <div class="ui-capture">${uiContent}</div>
      ${descHtml}
    </div>`;
}

/**
 * 와이어프레임 모드용 디자인 영역
 * P0-1: v2 Description 테이블 사용
 * P0-3: persistent 영역 (Header/LNB/Footer/Breadcrumb) 포함
 */
function renderWireframeDesignArea(screen) {
  // 와이어프레임 본문
  const wfElements = screen.wireframe.map(el => renderWfElement(el)).join('');
  const maxWidth = screen.viewportType === 'Mobile' ? '375px' : '100%';
  const persistent = screen.persistent;

  // persistent 영역 조립
  const headerHtml = renderPersistentHeader(persistent);
  const breadcrumbHtml = renderPersistentBreadcrumb(persistent);
  const lnbHtml = renderPersistentLnb(persistent);
  const footerHtml = renderPersistentFooter(persistent);

  let bodyHtml;
  if (lnbHtml) {
    bodyHtml = `<div class="wf-with-lnb">
      ${lnbHtml}
      <div class="wf-main-content">
        <div class="wf-viewport" style="max-width:${maxWidth}; margin:0 auto;">${wfElements}</div>
      </div>
    </div>`;
  } else {
    bodyHtml = `<div class="wf-viewport" style="max-width:${maxWidth}; margin:0 auto;">${wfElements}</div>`;
  }

  const wfHtml = `<div class="wf-container">
    ${headerHtml}${breadcrumbHtml}${bodyHtml}${footerHtml}
  </div>`;

  // Description — v2 테이블 또는 v1 호환
  const hasV2 = (screen.descriptions || []).some(d => d.items || d.commonNote);

  let descHtml;
  if (hasV2) {
    descHtml = `<div class="description-area">
      ${renderDescriptionTableV2(screen.descriptions, screen.pmComments)}
    </div>`;
  } else {
    // v1 호환 렌더 (renderDesignArea 경로)
    const descs = (screen.descriptions || []).map(d => {
      const details = (d.details || []).map(item =>
        `<li>${item}</li>`).join('');
      const detailBlock = details
        ? `<ul class="desc-detail">${details}</ul>` : '';
      let beforeAfter = '';
      if (d.before || d.after) {
        if (d.before) {
          beforeAfter += `<div class="desc-label">수정 전</div>
          <div class="desc-before">${d.before}</div>`;
        }
        if (d.after) {
          beforeAfter += `<div class="desc-label">수정 후</div>
          <div class="desc-after">${d.after}</div>`;
        }
      }
      return `<div class="desc-item">
          <div class="desc-item-header"><span class="desc-marker">${d.marker}</span>${d.label}</div>
          ${detailBlock}${beforeAfter}
        </div>`;
    }).join('\n');
    const pmHtml = renderPmComments(screen.pmComments);
    descHtml = `<div class="description-area">
      <h4>Description</h4>
      ${descs}${pmHtml}
    </div>`;
  }

  return `
    <div class="design-area">
      ${wfHtml}
      ${descHtml}
    </div>`;
}

/**
 * 간지(Divider) 프레임 v2
 * - sectionNo: 섹션 번호 (대형 워터마크)
 * - toc[]: 화면 목록 TOC (pageId + pageName)
 * - v1 호환: sub/main/bullets
 */
function renderDivider(divider, data) {
  const d = divider;
  const p = data?.project || {};
  const companyName = p.company?.name || '';

  // 섹션 번호 워터마크
  const sectionNoHtml = d.sectionNo
    ? `<div class="divider-section-no">${String(d.sectionNo).padStart(2, '0')}</div>` : '';

  // 서브/메인 타이틀
  const subHtml = d.sub ? `<div style="font-size:14px; color:#aaa; margin-bottom:12px;">${d.sub}</div>` : '';
  const mainHtml = d.main ? `<div style="font-size:28px; font-weight:700; margin-bottom:24px;">${d.main}</div>` : '';

  // TOC 화면 목록 (v2)
  let tocHtml = '';
  if (d.toc && d.toc.length > 0) {
    const tocItems = d.toc.map(t =>
      `<li><span class="toc-id">${t.pageId || ''}</span><span class="toc-name">${t.pageName || ''}</span></li>`
    ).join('');
    tocHtml = `<ul class="divider-toc">${tocItems}</ul>`;
  }

  // v1 호환: bullets
  let bulletsHtml = '';
  if (d.bullets && d.bullets.length > 0) {
    bulletsHtml = `<ul style="font-size:15px; color:#ccc; text-align:left; display:inline-block;">${
      d.bullets.map(b => `<li style="list-style:disc; margin-left:20px; margin-bottom:12px;">${b}</li>`).join('')
    }</ul>`;
  }

  return `
<div class="frame" style="display:flex; flex-direction:column; justify-content:center; align-items:center; background:#1a1a1a; color:#fff;">
  <div class="frame-header" style="position:absolute; top:0; left:0; right:0;"></div>
  <div style="text-align:center; padding:40px;">
    ${sectionNoHtml}
    ${subHtml}
    ${mainHtml}
    ${bulletsHtml}
    ${tocHtml}
  </div>
  <div class="frame-footer" style="position:absolute; bottom:0; left:0; right:0; color:#666;"><span>${companyName}</span><span>${p.writer || ''}</span></div>
</div>`;
}

/**
 * P1-2: MSG/Dialog Case 테이블 렌더
 * 4열(Type/No/Situation/Message) 또는 8열(+Title/확인Act/취소Act)
 */
function renderMsgCaseTable(msgCases) {
  if (!msgCases || msgCases.length === 0) return '';

  // 8열 여부: confirmAction 또는 cancelAction이 하나라도 있으면
  const isExtended = msgCases.some(c => c.confirmAction || c.cancelAction || c.title !== undefined);

  if (isExtended) {
    const rows = msgCases.map(c => {
      const typeClass = (c.type || '').toLowerCase().includes('error') ? 'msg-type-error'
        : (c.type || '').toLowerCase().includes('process') ? 'msg-type-process'
        : (c.type || '').includes('긍정') ? 'msg-type-positive'
        : (c.type || '').includes('부정') ? 'msg-type-negative' : '';
      return `<tr>
        <td class="${typeClass}">${c.type || ''}</td>
        <td style="text-align:center">${c.subType || ''}</td>
        <td style="text-align:center">${c.no || ''}</td>
        <td>${c.situation || ''}</td>
        <td>${c.title || '(None)'}</td>
        <td>${c.message || ''}</td>
        <td>${c.confirmAction || ''}</td>
        <td>${c.cancelAction || ''}</td>
      </tr>`;
    }).join('');
    return `
      <table class="msg-case-table">
        <thead><tr>
          <th style="width:60px">Type</th><th style="width:50px"></th><th style="width:40px">No</th>
          <th>Situation Case</th><th style="width:60px">Title</th><th>Message</th>
          <th style="width:80px">확인 Action</th><th style="width:80px">취소 Action</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // 4열 기본형
  const rows = msgCases.map(c => {
    const typeClass = (c.type || '').toLowerCase().includes('error') ? 'msg-type-error'
      : (c.type || '').toLowerCase().includes('process') ? 'msg-type-process'
      : (c.type || '').includes('긍정') ? 'msg-type-positive'
      : (c.type || '').includes('부정') ? 'msg-type-negative' : '';
    return `<tr>
      <td class="${typeClass}">${c.type || ''}</td>
      <td style="text-align:center">${c.no || ''}</td>
      <td>${c.situation || ''}</td>
      <td>${c.message || ''}</td>
    </tr>`;
  }).join('');
  return `
    <table class="msg-case-table">
      <thead><tr><th style="width:60px">Type</th><th style="width:40px">No</th><th>Situation Case</th><th>Message</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/**
 * P2-1: 컴포넌트 가이드 테이블 렌더
 * 3~4열: Phase / Sub / Guide UI / Guide Description
 */
function renderComponentGuide(components) {
  if (!components || components.length === 0) return '';

  const rows = components.map(c => {
    const stateLabels = (c.states || []).map(s => {
      const cls = s.toLowerCase() === 'default' ? 'comp-state-default'
        : s.toLowerCase().includes('focus') ? 'comp-state-focus'
        : s.toLowerCase() === 'error' ? 'comp-state-error'
        : s.toLowerCase() === 'disabled' ? 'comp-state-disabled' : 'comp-state-default';
      return `<span class="comp-state-label ${cls}">${s}</span>`;
    }).join('');
    const guideImg = c.guideImagePath
      ? `<img src="${c.guideImagePath}" alt="${c.phase} ${c.sub}" style="max-width:120px; max-height:60px;">`
      : '<span style="color:#bbb; font-size:11px;">[이미지]</span>';
    return `<tr>
      <td style="font-weight:600">${c.phase || ''}</td>
      <td>${c.sub || ''}</td>
      <td style="text-align:center">${guideImg}</td>
      <td>${c.description || ''}${stateLabels ? '<br>' + stateLabels : ''}</td>
    </tr>`;
  }).join('');

  return `
    <table class="comp-guide-table">
      <thead><tr><th style="width:100px">Phase</th><th style="width:80px">Sub</th><th style="width:130px">Guide UI</th><th>Guide Description</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/**
 * 화면 렌더 — screenType별 분기 + P1-3 수정일 마커
 */
function renderScreen(screen, data) {
  const p = data.project;
  const companyName = p.company?.name || '';
  const frames = [];

  // 간지
  if (screen.hasDivider && screen.divider) {
    frames.push(renderDivider(screen.divider, data));
  }

  // P1-3: 수정일 마커
  const modifiedHtml = screen.modifiedDate
    ? `<div class="modified-marker">수정일: ${screen.modifiedDate}</div>` : '';

  // P1-3: 버전 스탬프 (프레임 푸터)
  const versionHtml = screen.version
    ? `<span class="version-stamp">v${screen.version}</span>` : '';

  const screenType = screen.screenType || 'design';

  // 메타 테이블 (design, description 타입에서 사용)
  const meta = renderMetaTable(screen, data);

  let bodyContent;
  switch (screenType) {
    case 'description':
      // P2-2: 설명 전용 프레임 (와이어프레임 없음, Description 테이블만)
      bodyContent = `${meta}<div style="max-width:960px; margin:0 auto;">${renderDescriptionTableV2(screen.descriptions, screen.pmComments)}</div>`;
      break;
    case 'component':
      // P2-1: 컴포넌트 가이드 프레임
      bodyContent = `${meta}${renderComponentGuide(screen.components)}`;
      break;
    case 'msgCase':
      // P1-2: MSG/Dialog Case 전용 프레임
      bodyContent = `${meta}${renderMsgCaseTable(screen.msgCases)}`;
      break;
    case 'design':
    default: {
      const design = renderDesignArea(screen);
      // 인라인 msgCases (design 화면에 부속)
      const inlineMsgHtml = screen.msgCases && screen.msgCases.length > 0
        ? `<div style="margin-top:16px;"><div class="section-title" style="font-size:13px;">MSG Case</div>${renderMsgCaseTable(screen.msgCases)}</div>` : '';
      bodyContent = `${meta}${design}${inlineMsgHtml}`;
      break;
    }
  }

  frames.push(`
<div class="frame" style="position:relative;">
  <div class="frame-header"></div>
  ${modifiedHtml}
  <div class="frame-body">
    ${bodyContent}
  </div>
  <div class="frame-footer"><span>${companyName}</span><span>${[p.writer, versionHtml].filter(Boolean).join(' ')}</span></div>
</div>`);

  return frames.join('\n');
}

/**
 * P2-3: End 프레임 — 테마 색상 적용
 */
function renderEndOfDocument(data) {
  const p = data.project;
  const companyName = p.company?.name || '';
  return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
    <div style="font-size:32px; font-weight:700; color:#999; margin-bottom:12px;">END</div>
    <div style="font-size:13px; color:#bbb;">감사합니다</div>
  </div>
  <div class="frame-footer"><span>${companyName}</span><span>${p.writer}</span></div>
</div>`;
}

/**
 * HTML 생성 — v2: theme 파라미터 필수
 */
function generateHTML(data, theme) {
  // 공통 정의(MSG/COMP/DESC prefix) → 화면 정의(UI-xxx 등) 순서로 정렬
  const commonPrefixes = ['MSG', 'COMP', 'DESC'];
  const isCommon = (s) => {
    const id = (s.interfaceId || '').toUpperCase();
    return commonPrefixes.some(prefix => id.startsWith(prefix + '-'));
  };
  const sortedScreens = [
    ...data.screens.filter(s => isCommon(s)),
    ...data.screens.filter(s => !isCommon(s)),
  ];
  const screens = sortedScreens.map(s => renderScreen(s, data)).join('\n');
  const title = data.project.serviceName || data.project.title || '화면설계서';
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>화면설계서 - ${title}</title>
<style>${css(theme)}</style>
</head>
<body>
${renderCover(data, theme)}
${renderHistory(data)}
${renderOverview(data)}
${screens}
${renderEndOfDocument(data)}
</body>
</html>`;
}

module.exports = { generateHTML };
