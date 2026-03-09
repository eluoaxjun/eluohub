/**
 * 화면설계서 HTML 템플릿 생성기 v2 (16:9 슬라이드 덱)
 *
 * v2 변경사항:
 * - .frame → .slide (1280×720px, overflow:hidden)
 * - @page { size: 1280px 720px landscape; margin: 0; }
 * - Design 레이아웃: 좌 60% 와이어프레임 / 우 40% Description
 * - fnRef 렌더링: Description 패널 하단 [FN 참조] 섹션
 * - msgCases 자동 별도 슬라이드 분리 (인라인 혼재 금지)
 * - 메타 테이블 → 슬라이드 헤더 바로 통합
 */

function css(theme) {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${theme.fonts.primary}; background: #fff; }

  /* 화면용: 가로 나열 */
  @media screen {
    body { background: #4a4a4a; display: flex; flex-wrap: wrap; gap: 40px; padding: 40px; overflow-x: auto; }
  }

  /* 인쇄/PDF용: 16:9 landscape */
  @page {
    size: 1280px 720px landscape;
    margin: 0;
  }
  @media print {
    body { display: block; padding: 0; background: #fff; margin: 0; }
    .slide { page-break-after: always; border: none !important; }
    .slide:last-child { page-break-after: auto; }
  }

  /* 슬라이드 컨테이너: 1280×720 고정 */
  .slide {
    width: 1280px;
    height: 720px;
    overflow: hidden;
    position: relative;
    background: #fff;
    border: ${theme.frame.borderWidth}px solid ${theme.primaryColor};
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  /* 슬라이드 헤더: 36px */
  .slide-header {
    background: ${theme.primaryColor};
    color: #fff;
    padding: 0 16px;
    height: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    font-size: 11px;
  }
  .slide-header .hd-left { display: flex; align-items: center; gap: 10px; }
  .slide-header .hd-id { font-weight: 700; font-size: 12px; letter-spacing: 0.5px; }
  .slide-header .hd-sep { opacity: 0.5; }
  .slide-header .hd-name { opacity: 0.9; }
  .slide-header .hd-right { opacity: 0.8; font-size: 10px; }

  /* 슬라이드 본문: 남은 영역 전부 */
  .slide-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* 슬라이드 푸터: 24px */
  .slide-footer {
    background: #f8f9fa;
    border-top: 1px solid #e0e0e0;
    padding: 0 16px;
    height: 24px;
    min-height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: #999;
    flex-shrink: 0;
  }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f5f5f5; font-weight: 600; padding: 8px 10px; border: 1px solid #ddd; text-align: center; }
  td { padding: 8px 10px; border: 1px solid #ddd; vertical-align: top; }
  .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #333; }

  /* Cover */
  .cover-body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; gap: 8px; }
  .cover-logo { font-size: 18px; font-weight: 700; color: #666; letter-spacing: 2px; margin-bottom: 16px; }
  .cover-logo-img { max-height: 64px; margin-bottom: 16px; }
  .cover-title { font-size: 28px; font-weight: 700; color: #1a1a2e; text-align: center; }
  .cover-version { font-size: 13px; color: #888; }
  .cover-meta { width: 60%; max-width: 520px; border-collapse: collapse; margin-top: 24px; font-size: 11px; }
  .cover-meta th { background: #f0f0f0; font-weight: 600; padding: 5px 8px; border: 1px solid #ddd; text-align: center; width: 80px; }
  .cover-meta td { padding: 5px 8px; border: 1px solid #ddd; text-align: center; }

  /* Design 레이아웃: 좌 60% / 우 40% */
  .design-layout { display: flex; flex: 1; overflow: hidden; min-height: 0; }
  .wireframe-area { flex: 0 0 60%; overflow: hidden; border-right: 1px solid #ddd; position: relative; }
  .description-panel { flex: 0 0 40%; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; }

  /* Description */
  .desc-table { width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.6; }
  .desc-table th { background: #f5f5f5; font-weight: 600; padding: 5px 7px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
  .desc-table td { padding: 5px 7px; border: 1px solid #ddd; vertical-align: top; font-size: 11px; }
  .desc-table .desc-num-cell { width: 44px; text-align: center; font-weight: 700; color: #333; }
  .desc-table .desc-content-cell { color: #333; }
  .desc-table .desc-common-row td { background: #fafafa; }
  .desc-indent-1 { }
  .desc-indent-2 { padding-left: 14px; }
  .desc-indent-3 { padding-left: 28px; }
  .desc-indent-4 { padding-left: 42px; }
  .desc-var { color: #e67700; font-weight: 600; }
  .desc-important { color: #c00000; font-weight: 600; }
  .desc-continuation { font-size: 10px; color: #999; font-style: italic; text-align: center; padding: 5px 0; border-top: 1px dashed #ddd; }
  .desc-change-tag { display: inline-block; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 2px; margin-left: 3px; vertical-align: middle; }
  .desc-change-tag--modify { background: #fff3f3; color: #c00; border: 1px solid #c00; }
  .desc-change-tag--add { background: #f0f7ff; color: #0070c0; border: 1px solid #0070c0; }
  .desc-change-tag--delete { background: #f5f5f5; color: #666; border: 1px solid #999; text-decoration: line-through; }
  .desc-label { font-size: 9px; font-weight: 700; color: #888; margin: 2px 0; }
  .desc-before { background: #fff3f3; padding: 5px 7px; margin: 3px 0; border-left: 2px solid ${theme.accentColor}; font-size: 10px; }
  .desc-after { background: #f0fff0; padding: 5px 7px; margin: 3px 0; border-left: 2px solid #2e8b57; font-size: 10px; }

  /* fnRef 섹션 */
  .fn-ref-section { margin-top: auto; padding-top: 8px; border-top: 1px dashed #ddd; }
  .fn-ref-title { font-size: 10px; font-weight: 700; color: #888; margin-bottom: 4px; }
  .fn-ref-list { font-size: 10px; color: ${theme.primaryColor}; font-family: monospace; line-height: 1.6; }

  /* Wireframe 영역 */
  .wf-container { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
  .wf-scroll { flex: 1; overflow-y: auto; padding: 8px 10px; }
  .wf-el { border: 1px dashed #ccc; background: #fafafa; padding: 8px 10px; margin: 0 0 5px 0; font-size: 10px; color: #666; position: relative; display: flex; flex-direction: column; }
  .wf-el:last-child { margin-bottom: 0; }
  .wf-el--header { background: #e8e8e8; border: 1px solid #bbb; min-height: 36px; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #555; }
  .wf-el--nav { background: #f0f0f0; border: 1px solid #ccc; min-height: 30px; display: flex; align-items: center; gap: 12px; padding: 0 12px; }
  .wf-el--nav span { font-size: 10px; color: #888; }
  .wf-el--text { background: #fff; border: 1px dashed #ddd; padding: 8px 10px; }
  .wf-el--text .wf-content { color: #333; font-size: 11px; margin-top: 3px; }
  .wf-el--input { background: #fff; border: 1px solid #ccc; border-radius: 3px; min-height: 30px; display: flex; align-items: center; padding: 0 8px; color: #aaa; font-size: 11px; }
  .wf-el--button { display: inline-flex; align-items: center; justify-content: center; min-height: 30px; padding: 0 16px; border-radius: 3px; font-size: 11px; font-weight: 600; border: 1px solid #999; background: #f5f5f5; color: #333; cursor: default; }
  .wf-el--button-primary { background: #333; color: #fff; border-color: #333; }
  .wf-el--button-outline { background: transparent; border: 1px solid #999; color: #666; }
  .wf-el--card { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 10px; }
  .wf-el--image { background: #f0f0f0; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #aaa; min-height: 60px; }
  .wf-el--image::before { content: '\\1F5BC'; font-size: 16px; margin-right: 5px; }
  .wf-el--list { background: #fff; border: 1px dashed #ddd; padding: 6px 10px 6px 24px; }
  .wf-el--list li { font-size: 10px; color: #555; margin-bottom: 3px; list-style: disc; }
  .wf-el--banner { background: linear-gradient(135deg, #e8e8e8, #f5f5f5); border: 1px solid #ccc; min-height: 60px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #888; font-weight: 600; }
  .wf-el--divider { border: none; border-top: 1px solid #ddd; margin: 6px 0; padding: 0; min-height: 0; background: transparent; }
  .wf-el--group { border: 1px dashed #bbb; background: #fcfcfc; padding: 6px; gap: 5px; }
  .wf-el--table { background: #fff; }
  .wf-el--table table { width: 100%; border-collapse: collapse; font-size: 9px; }
  .wf-el--table th { background: #f0f0f0; padding: 3px 5px; border: 1px solid #ddd; font-size: 9px; }
  .wf-el--table td { padding: 3px 5px; border: 1px solid #ddd; font-size: 9px; }
  .wf-label { font-size: 9px; color: #999; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
  .wf-marker { position: absolute; top: 50%; left: -22px; transform: translateY(-50%); width: 18px; height: 18px; background: ${theme.accentColor}; color: #fff; border-radius: 50%; text-align: center; line-height: 18px; font-size: 9px; font-weight: 700; z-index: 2; }
  .wf-el--marked { border: 2px dashed ${theme.accentColor} !important; background: rgba(204, 51, 51, 0.03); }
  .wf-viewport { padding: 0 0 0 26px; }

  /* 이미지 UI 캡처 */
  .ui-capture { flex: 1; background: #f9f9f9; border-right: 1px solid #ddd; display: flex; align-items: center; justify-content: center; color: #999; font-size: 13px; overflow: hidden; }
  .ui-capture-inner { position: relative; display: inline-block; max-width: 100%; max-height: 100%; }
  .ui-capture-inner img { display: block; max-width: 100%; max-height: 640px; }
  .marker-overlay { position: absolute; border: 2px dashed ${theme.accentColor}; pointer-events: none; z-index: 1; }
  .marker-number { position: absolute; top: -10px; left: -10px; width: 20px; height: 20px; background: ${theme.accentColor}; color: #fff; border-radius: 50%; text-align: center; line-height: 20px; font-size: 10px; font-weight: 700; z-index: 2; }

  /* Persistent */
  .wf-persistent-header { background: #e0e0e0; border-bottom: 2px solid #bbb; padding: 5px 12px; min-height: 36px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .wf-persistent-header .site-logo { font-weight: 700; font-size: 11px; color: #333; }
  .wf-persistent-gnb { display: flex; gap: 14px; }
  .wf-persistent-gnb span { font-size: 10px; color: #666; }
  .wf-persistent-breadcrumb { font-size: 9px; color: #999; padding: 4px 12px; background: #fafafa; border-bottom: 1px solid #eee; flex-shrink: 0; }
  .wf-persistent-lnb { width: 130px; background: #f7f7f7; border-right: 1px solid #ddd; padding: 8px 0; font-size: 10px; flex-shrink: 0; }
  .wf-persistent-lnb ul { list-style: none; padding: 0; margin: 0; }
  .wf-persistent-lnb li { padding: 6px 12px; color: #666; }
  .wf-persistent-lnb li.active { color: #333; font-weight: 700; background: #e8e8e8; }
  .wf-persistent-footer { background: #e0e0e0; border-top: 2px solid #bbb; padding: 8px 12px; min-height: 36px; font-size: 9px; color: #888; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .wf-with-lnb { display: flex; flex: 1; overflow: hidden; min-height: 0; }
  .wf-main-content { flex: 1; overflow-y: auto; }

  /* Divider 슬라이드 */
  .divider-section-no { font-size: 56px; font-weight: 900; color: rgba(255,255,255,0.15); margin-bottom: 8px; }
  .divider-toc { list-style: none; padding: 0; margin-top: 20px; text-align: left; display: inline-block; }
  .divider-toc li { font-size: 12px; color: #bbb; margin-bottom: 6px; display: flex; gap: 10px; align-items: baseline; }
  .divider-toc .toc-id { color: #777; font-size: 10px; min-width: 80px; font-family: monospace; }
  .divider-toc .toc-name { color: #ddd; }

  /* MSG Case table */
  .msg-case-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
  .msg-case-table th { background: #f5f5f5; font-weight: 600; padding: 5px 7px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
  .msg-case-table td { padding: 5px 7px; border: 1px solid #ddd; vertical-align: top; font-size: 11px; }
  .msg-type-error { color: #c00000; font-weight: 600; }
  .msg-type-process { color: #0070c0; font-weight: 600; }
  .msg-type-positive { color: #2e8b57; font-weight: 600; }
  .msg-type-negative { color: #e67700; font-weight: 600; }

  /* Component guide */
  .comp-guide-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
  .comp-guide-table th { background: #f5f5f5; font-weight: 600; padding: 5px 7px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
  .comp-guide-table td { padding: 5px 7px; border: 1px solid #ddd; vertical-align: top; font-size: 11px; }
  .comp-state-label { display: inline-block; font-size: 9px; padding: 1px 5px; border-radius: 3px; font-weight: 600; margin-right: 3px; }
  .comp-state-default { background: #e8f5e9; color: #2e7d32; }
  .comp-state-focus { background: #e3f2fd; color: #1565c0; }
  .comp-state-error { background: #ffebee; color: #c62828; }
  .comp-state-disabled { background: #f5f5f5; color: #9e9e9e; }

  /* Modified marker + Version stamp */
  .modified-marker { position: absolute; top: 8px; right: 10px; background: #fff3f3; color: #c00; font-size: 8px; font-weight: 700; padding: 2px 6px; border: 1px solid #c00; border-radius: 2px; z-index: 3; }
  .version-stamp { font-size: 9px; color: #999; }

  /* PM Comments */
  .pm-comment-section { margin-top: 10px; padding-top: 8px; border-top: 1px dashed #e0a030; }
  .pm-comment-section h5 { font-size: 10px; font-weight: 700; color: #b07800; margin-bottom: 6px; }
  .pm-comment { background: #fffbf0; border-left: 3px solid #e0a030; padding: 6px 8px; margin-bottom: 6px; font-size: 10px; line-height: 1.5; }
  .pm-badge { display: inline-block; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 3px; margin-right: 4px; vertical-align: middle; }
  .pm-badge--risk { background: #ffdddd; color: #c00; }
  .pm-badge--question { background: #fff3cd; color: #856404; }
  .pm-badge--suggestion { background: #d4edda; color: #155724; }
  .pm-badge--reject { background: #e0e0e0; color: #333; }
  .pm-author { font-size: 9px; color: #999; margin-left: 3px; }

  /* 일반 콘텐츠 패딩 */
  .slide-content { padding: 16px 20px; overflow-y: auto; flex: 1; }
  `;
}

/**
 * 슬라이드 헤더 바 (좌: ID/Name, 우: Company/Writer/Date)
 */
function renderSlideHeader(screen, data, title) {
  const p = data.project;
  const companyName = p.company?.name || '';

  if (title) {
    // 커버/History/Overview 등 특수 슬라이드용
    return `<div class="slide-header">
  <div class="hd-left"><span class="hd-id">${title}</span></div>
  <div class="hd-right">${companyName}${p.writer ? ' | ' + p.writer : ''}${p.date ? ' | ' + p.date : ''}</div>
</div>`;
  }

  const id = screen.interfaceId || '';
  const name = screen.interfaceName || '';
  const page = screen.pageName || '';
  const parts = [id, name, page].filter(Boolean);

  return `<div class="slide-header">
  <div class="hd-left">
    ${id ? `<span class="hd-id">${id}</span>` : ''}
    ${name ? `<span class="hd-sep">|</span><span class="hd-name">${name}</span>` : ''}
    ${page ? `<span class="hd-sep">|</span><span>${page}</span>` : ''}
  </div>
  <div class="hd-right">${companyName}${p.writer ? ' | ' + p.writer : ''}${p.date ? ' | ' + p.date : ''}</div>
</div>`;
}

/**
 * 슬라이드 푸터 바
 */
function renderSlideFooter(screen, data) {
  const p = data.project;
  const versionHtml = screen && screen.version ? `<span class="version-stamp">v${screen.version}</span>` : '';
  const companyName = p.company?.name || '';
  return `<div class="slide-footer">
  <span>${companyName}</span>
  <span>${[p.writer, versionHtml].filter(Boolean).join(' ')}</span>
</div>`;
}

/**
 * 커버 슬라이드
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
    logoHtml = `<div class="cover-logo">${p.company.name}</div>`;
  }

  const metaHtml = renderCoverMetaTable(p);

  // 커버 부제목 라인
  let subLine = '';
  if (p.jiraNo && p.srNo) {
    subLine = `<div class="cover-version">[${p.jiraNo}] [${p.srNo}]</div>`;
  }

  return `
<div class="slide" data-slide-type="cover">
  <div class="slide-header" style="background: ${theme.primaryColor};">
    <div class="hd-left"><span class="hd-id">화면설계서</span></div>
    <div class="hd-right">${p.company?.name || ''} | ${p.writer || ''}</div>
  </div>
  <div class="slide-body cover-body">
    ${logoHtml}
    <div class="cover-title">${p.serviceName || p.title || ''}</div>
    <div class="cover-version">Ver ${p.version || '1.0'} &nbsp;|&nbsp; ${p.date || ''}</div>
    ${subLine}
    ${metaHtml}
  </div>
  <div class="slide-footer"><span>${p.company?.name || ''}</span><span>${p.date || ''}</span></div>
</div>`;
}

/**
 * 커버 메타 테이블 (작성/검토/승인)
 */
function renderCoverMetaTable(p) {
  const hasReviewers = p.reviewers && p.reviewers.length > 0;
  const hasApprovers = p.approvers && p.approvers.length > 0;
  if (!hasReviewers && !hasApprovers) return '';

  return `
  <table class="cover-meta">
    <thead><tr><th></th><th>작성</th><th>검토</th><th>승인</th></tr></thead>
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
      <tr><th>서명</th><td></td><td></td><td></td></tr>
    </tbody>
  </table>`;
}

/**
 * History 슬라이드
 */
function renderHistory(data) {
  const p = data.project;
  if (!data.history || data.history.length === 0) return '';

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
<div class="slide" data-slide-type="history">
  ${renderSlideHeader(null, data, 'History')}
  <div class="slide-body slide-content">
    <table>
      <thead>
        <tr>
          <th style="width:70px">Version</th>
          <th style="width:100px">Update Date</th>
          <th>Update Detail</th>
          <th style="width:50px">page</th>
          <th style="width:60px">Writer</th>
          <th>Remarkers</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  ${renderSlideFooter(null, data)}
</div>`;
}

/**
 * Overview 슬라이드 — type별 분기
 */
function renderOverview(data) {
  const ov = data.overview;
  if (!ov) return '';

  switch (ov.type) {
    case 'assignment': return renderAssignmentOverview(data);
    case 'sitemap': return renderSitemapOverview(data);
    case 'summary': default: return renderSummaryOverview(data);
  }
}

function renderAssignmentOverview(data) {
  const p = data.project;
  const ov = data.overview;
  const bullets = (ov.divider?.bullets || []).map(b =>
    `<li style="list-style:disc; margin-left:18px; margin-bottom:10px; font-size:14px; color:#ccc;">${b}</li>`).join('');

  const dividerSlide = `
<div class="slide" data-slide-type="overview" style="background:#1a1a1a; color:#fff;">
  <div class="slide-header" style="background:#111; color:#fff; border-bottom:1px solid #333;">
    <div class="hd-left"><span class="hd-id" style="color:#fff;">${ov.divider?.sub || 'Overview'}</span></div>
    <div class="hd-right" style="color:#888;">${p.company?.name || ''}</div>
  </div>
  <div class="slide-body cover-body">
    <div style="font-size:24px; font-weight:700; margin-bottom:20px;">${ov.divider?.main || ''}</div>
    <ul style="text-align:left; display:inline-block;">${bullets}</ul>
  </div>
  <div class="slide-footer" style="background:#111; border-top:1px solid #333; color:#666;"><span>${p.company?.name || ''}</span><span>${p.writer || ''}</span></div>
</div>`;

  const detailSlide = `
<div class="slide" data-slide-type="overview">
  ${renderSlideHeader(null, data, 'Operational Assignment Detail')}
  <div class="slide-body slide-content">
    <table>
      <thead><tr>
        <th style="width:110px">Jira No.</th>
        <th style="width:120px">SR No.</th>
        <th>Assignment title</th>
        <th>Assignment Detail</th>
        <th style="width:110px">Requestor</th>
      </tr></thead>
      <tbody>
        <tr>
          <td style="text-align:center">${p.jiraNo || p.id || ''}</td>
          <td style="text-align:center">${p.srNo || '-'}</td>
          <td>${p.title || ''}</td>
          <td>${ov.content?.detail || ''}</td>
          <td>${p.requestor || ''}</td>
        </tr>
      </tbody>
    </table>
  </div>
  ${renderSlideFooter(null, data)}
</div>`;

  const interfaceSlide = renderInterfaceList(data);
  return dividerSlide + '\n' + detailSlide + '\n' + interfaceSlide;
}

function renderSitemapOverview(data) {
  const p = data.project;
  const ov = data.overview;
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
<div class="slide" data-slide-type="overview">
  ${renderSlideHeader(null, data, ov.title || 'Site Map')}
  <div class="slide-body slide-content">
    <table>
      <thead><tr>
        <th>1 Depth</th><th>2 Depth</th><th>3 Depth</th><th>4 Depth</th><th style="width:70px">Work Type</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  ${renderSlideFooter(null, data)}
</div>`;
}

function renderSummaryOverview(data) {
  const p = data.project;
  const ov = data.overview;
  const overviewText = ov.content?.detail || ov.content?.summary || '';

  const infoRows = [
    ['프로젝트명', p.serviceName || p.title || ''],
    ['버전', `Ver ${p.version || '1.0'}`],
    ['작성일', p.date || ''],
    ['작성자', p.writer || ''],
  ].filter(r => r[1]).map(r =>
    `<tr><td style="width:100px; padding:6px 10px; font-weight:600; color:#555; background:#f8f9fa; border:1px solid #e0e0e0; font-size:11px;">${r[0]}</td><td style="padding:6px 10px; border:1px solid #e0e0e0; font-size:11px; color:#333;">${r[1]}</td></tr>`
  ).join('');

  return `
<div class="slide" data-slide-type="overview">
  ${renderSlideHeader(null, data, ov.title || 'Overview')}
  <div class="slide-body slide-content">
    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">${infoRows}</table>
    <div style="font-size:12px; line-height:1.8; color:#333; padding:10px 14px; background:#f8f9fa; border-left:3px solid #1a1a1a;">
      ${overviewText}
    </div>
  </div>
  ${renderSlideFooter(null, data)}
</div>`;
}

function renderInterfaceList(data) {
  const p = data.project;
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
<div class="slide" data-slide-type="overview">
  ${renderSlideHeader(null, data, 'Task Target InterFace List')}
  <div class="slide-body slide-content">
    <table>
      <thead>
        <tr>
          <th rowspan="2" style="width:80px">Office</th>
          <th rowspan="2" style="width:65px">Channel</th>
          <th colspan="4">Target Interface</th>
          <th rowspan="2" style="width:90px">Interface Type</th>
          <th rowspan="2" style="width:65px">Work Type</th>
          <th rowspan="2" style="width:65px">Page ID</th>
        </tr>
        <tr><th>1 Depth</th><th>2 Depth</th><th>3 Depth</th><th>4 Depth</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  ${renderSlideFooter(null, data)}
</div>`;
}

/**
 * 와이어프레임 엘리먼트 렌더
 */
function renderWfElement(el) {
  const markerHtml = el.marker ? `<span class="wf-marker">${el.marker}</span>` : '';
  const markedCls = el.marker ? ' wf-el--marked' : '';
  const labelHtml = el.label ? `<span class="wf-label">${el.label}</span>` : '';
  const h = el.height ? `min-height:${el.height};` : '';

  switch (el.type) {
    case 'header':
      return `<div class="wf-el wf-el--header${markedCls}" style="${h}">${markerHtml}${el.label || 'Header'}</div>`;
    case 'nav':
    case 'gnb': {
      const navItems = (el.items || ['메뉴1', '메뉴2', '메뉴3']).map(i => `<span>${i}</span>`).join('');
      return `<div class="wf-el wf-el--nav${markedCls}" style="${h}">${markerHtml}${navItems}</div>`;
    }
    case 'text': {
      const content = el.content ? `<div class="wf-content">${el.content}</div>` : '';
      return `<div class="wf-el wf-el--text${markedCls}" style="${h}">${markerHtml}${labelHtml}${content}</div>`;
    }
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
 * PM 코멘트 블록
 */
function renderPmComments(pmComments) {
  if (!pmComments || pmComments.length === 0) return '';
  const typeLabels = { risk: '위험', question: '질문', suggestion: '제안', reject: '반대' };
  const items = pmComments.map(c => {
    const badgeClass = `pm-badge pm-badge--${c.type || 'question'}`;
    const label = typeLabels[c.type] || c.type;
    return `<div class="pm-comment">
      <span class="${badgeClass}">${label}</span><span class="pm-author">${c.author || 'PM'}</span>
      <div style="margin-top:3px;">${c.comment}</div>
    </div>`;
  }).join('');
  return `<div class="pm-comment-section"><h5>PM Comments</h5>${items}</div>`;
}

/**
 * 변경 유형 태그
 */
function renderChangeTag(changeType) {
  if (!changeType) return '';
  const map = {
    '변경': 'modify', 'modify': 'modify', 'changed': 'modify',
    '추가': 'add', 'add': 'add', 'added': 'add', 'new': 'add',
    '삭제': 'delete', 'delete': 'delete', 'removed': 'delete', 'remove': 'delete'
  };
  const cls = map[changeType.toLowerCase()] || 'modify';
  return `<span class="desc-change-tag desc-change-tag--${cls}">${changeType}</span>`;
}

/**
 * fnRef 섹션 렌더 (Description 패널 하단)
 * - fnRef 배열이 비어있으면 렌더하지 않음
 */
function renderFnRef(descriptions) {
  if (!descriptions || descriptions.length === 0) return '';
  const allFnRefs = [];
  for (const d of descriptions) {
    if (d.fnRef && d.fnRef.length > 0) {
      allFnRefs.push(...d.fnRef);
    }
  }
  if (allFnRefs.length === 0) return '';
  return `<div class="fn-ref-section">
  <div class="fn-ref-title">FN 참조</div>
  <div class="fn-ref-list">${allFnRefs.join(', ')}</div>
</div>`;
}

/**
 * Description 테이블 v2 — 번호 | 상세설명
 */
function renderDescriptionTableV2(descriptions, pmComments) {
  if (!descriptions || descriptions.length === 0) return '';

  let rows = '';
  const commonNote = descriptions.find(d => d.commonNote)?.commonNote;
  if (commonNote) {
    rows += `<tr class="desc-common-row">
      <td class="desc-num-cell" style="font-weight:600;">공통</td>
      <td class="desc-content-cell">- ${commonNote}</td>
    </tr>`;
  }

  for (const d of descriptions) {
    let content = '';
    if (d.label) {
      content += `<div style="font-weight:700; margin-bottom:3px;">${d.label}</div>`;
    }
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
    } else if (d.details && d.details.length > 0) {
      for (const detail of d.details) {
        content += `<div class="desc-indent-1">- ${detail}</div>`;
      }
    }
    if (d.before || d.after) {
      let baHtml = '<div style="margin-top:5px;">';
      if (d.before) {
        baHtml += `<div class="desc-label">수정 전</div><div class="desc-before">${d.before}</div>`;
      }
      if (d.after) {
        baHtml += `<div class="desc-label">수정 후</div><div class="desc-after">${d.after}</div>`;
      }
      baHtml += '</div>';
      content += baHtml;
    }
    if (d.continuation) {
      const contText = d.continuation === 'next' ? '▶ 다음 슬라이드에 계속됨' : '◀ 이전 슬라이드에서 이어짐';
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
 * Persistent 영역 — Header/GNB/Breadcrumb/LNB/Footer
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

/**
 * Design 레이아웃: 좌 60% 와이어프레임 / 우 40% Description
 * v2: msgCases 인라인 금지 (별도 슬라이드로 자동 분리)
 */
function renderDesignLayout(screen) {
  let wireframeHtml;

  if (!screen.uiImagePath && screen.wireframe) {
    // 와이어프레임 모드
    const wfElements = screen.wireframe.map(el => renderWfElement(el)).join('');
    const maxWidth = screen.viewportType === 'Mobile' ? '375px' : '100%';
    const persistent = screen.persistent;

    const headerHtml = renderPersistentHeader(persistent);
    const breadcrumbHtml = renderPersistentBreadcrumb(persistent);
    const lnbHtml = renderPersistentLnb(persistent);
    const footerHtml = renderPersistentFooter(persistent);

    let bodyHtml;
    if (lnbHtml) {
      bodyHtml = `<div class="wf-with-lnb">
        ${lnbHtml}
        <div class="wf-main-content">
          <div class="wf-viewport" style="max-width:${maxWidth};">${wfElements}</div>
        </div>
      </div>`;
    } else {
      bodyHtml = `<div class="wf-scroll"><div class="wf-viewport" style="max-width:${maxWidth};">${wfElements}</div></div>`;
    }

    wireframeHtml = `<div class="wf-container">
      ${headerHtml}${breadcrumbHtml}${bodyHtml}${footerHtml}
    </div>`;
  } else {
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
    wireframeHtml = `<div class="ui-capture">${uiContent}</div>`;
  }

  // Description 패널 (fnRef 포함)
  const descContent = renderDescriptionTableV2(screen.descriptions, screen.pmComments);
  const fnRefHtml = renderFnRef(screen.descriptions);

  return `<div class="design-layout">
  <div class="wireframe-area">${wireframeHtml}</div>
  <div class="description-panel">
    ${descContent}
    ${fnRefHtml}
  </div>
</div>`;
}

/**
 * 간지(Divider) 슬라이드
 */
function renderDivider(divider, data) {
  const d = divider;
  const p = data?.project || {};
  const companyName = p.company?.name || '';

  const sectionNoHtml = d.sectionNo
    ? `<div class="divider-section-no">${String(d.sectionNo).padStart(2, '0')}</div>` : '';
  const subHtml = d.sub ? `<div style="font-size:13px; color:#aaa; margin-bottom:10px;">${d.sub}</div>` : '';
  const mainHtml = d.main ? `<div style="font-size:26px; font-weight:700; margin-bottom:20px;">${d.main}</div>` : '';

  let tocHtml = '';
  if (d.toc && d.toc.length > 0) {
    const tocItems = d.toc.map(t =>
      `<li><span class="toc-id">${t.pageId || ''}</span><span class="toc-name">${t.pageName || ''}</span></li>`
    ).join('');
    tocHtml = `<ul class="divider-toc">${tocItems}</ul>`;
  }

  let bulletsHtml = '';
  if (d.bullets && d.bullets.length > 0) {
    bulletsHtml = `<ul style="font-size:14px; color:#ccc; text-align:left; display:inline-block;">
      ${d.bullets.map(b => `<li style="list-style:disc; margin-left:18px; margin-bottom:10px;">${b}</li>`).join('')}
    </ul>`;
  }

  return `
<div class="slide" data-slide-type="divider" style="background:#1a1a1a; color:#fff;">
  <div class="slide-header" style="background:#111; color:#fff; border-bottom:1px solid #333;">
    <div class="hd-left"><span class="hd-id" style="color:#fff;">Section</span></div>
    <div class="hd-right" style="color:#888;">${companyName}</div>
  </div>
  <div class="slide-body cover-body">
    ${sectionNoHtml}${subHtml}${mainHtml}${bulletsHtml}${tocHtml}
  </div>
  <div class="slide-footer" style="background:#111; border-top:1px solid #333; color:#666;">
    <span>${companyName}</span><span>${p.writer || ''}</span>
  </div>
</div>`;
}

/**
 * MSG/Dialog Case 테이블
 */
function renderMsgCaseTable(msgCases) {
  if (!msgCases || msgCases.length === 0) return '';

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
    return `<table class="msg-case-table">
      <thead><tr>
        <th style="width:55px">Type</th><th style="width:45px"></th><th style="width:36px">No</th>
        <th>Situation Case</th><th style="width:55px">Title</th><th>Message</th>
        <th style="width:70px">확인 Action</th><th style="width:70px">취소 Action</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

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
  return `<table class="msg-case-table">
    <thead><tr><th style="width:55px">Type</th><th style="width:36px">No</th><th>Situation Case</th><th>Message</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/**
 * 컴포넌트 가이드 테이블
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
      ? `<img src="${c.guideImagePath}" alt="${c.phase} ${c.sub}" style="max-width:110px; max-height:55px;">`
      : '<span style="color:#bbb; font-size:10px;">[이미지]</span>';
    return `<tr>
      <td style="font-weight:600">${c.phase || ''}</td>
      <td>${c.sub || ''}</td>
      <td style="text-align:center">${guideImg}</td>
      <td>${c.description || ''}${stateLabels ? '<br>' + stateLabels : ''}</td>
    </tr>`;
  }).join('');

  return `<table class="comp-guide-table">
    <thead><tr><th style="width:90px">Phase</th><th style="width:70px">Sub</th><th style="width:120px">Guide UI</th><th>Guide Description</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/**
 * 화면 렌더 — screenType별 분기
 * design 타입: msgCases 자동 별도 슬라이드 분리
 */
function renderScreen(screen, data) {
  const slides = [];

  // 간지 슬라이드
  if (screen.hasDivider && screen.divider) {
    slides.push(renderDivider(screen.divider, data));
  }

  const modifiedHtml = screen.modifiedDate
    ? `<div class="modified-marker">수정일: ${screen.modifiedDate}</div>` : '';

  const screenType = screen.screenType || 'design';
  const header = renderSlideHeader(screen, data, null);
  const footer = renderSlideFooter(screen, data);

  let bodyHtml;
  switch (screenType) {
    case 'description':
      // Description 전용 슬라이드 (와이어프레임 없음)
      bodyHtml = `<div class="slide-body slide-content">
        ${renderDescriptionTableV2(screen.descriptions, screen.pmComments)}
        ${renderFnRef(screen.descriptions)}
      </div>`;
      break;

    case 'component':
      // 컴포넌트 가이드 슬라이드
      bodyHtml = `<div class="slide-body slide-content">
        ${renderComponentGuide(screen.components)}
      </div>`;
      break;

    case 'msgCase':
      // MSG Case 전용 슬라이드
      bodyHtml = `<div class="slide-body slide-content">
        ${renderMsgCaseTable(screen.msgCases)}
      </div>`;
      break;

    case 'design':
    default: {
      // Design 슬라이드: 좌 60% 와이어프레임 / 우 40% Description
      bodyHtml = `<div class="slide-body">
        ${renderDesignLayout(screen)}
      </div>`;
      break;
    }
  }

  slides.push(`
<div class="slide" data-slide-type="${screenType}" style="position:relative;">
  ${header}
  ${modifiedHtml}
  ${bodyHtml}
  ${footer}
</div>`);

  // design 타입 + msgCases 존재 → 별도 MSG Case 슬라이드 자동 생성
  if (screenType === 'design' && screen.msgCases && screen.msgCases.length > 0) {
    const msgHeader = renderSlideHeader(
      { ...screen, interfaceName: (screen.interfaceName || '') + ' - MSG Case' },
      data, null
    );
    slides.push(`
<div class="slide" data-slide-type="msgCase">
  ${msgHeader}
  <div class="slide-body slide-content">
    ${renderMsgCaseTable(screen.msgCases)}
  </div>
  ${footer}
</div>`);
  }

  return slides.join('\n');
}

/**
 * End 슬라이드
 */
function renderEndOfDocument(data) {
  const p = data.project;
  const companyName = p.company?.name || '';
  return `
<div class="slide" data-slide-type="end">
  ${renderSlideHeader(null, data, 'END')}
  <div class="slide-body cover-body">
    <div style="font-size:32px; font-weight:700; color:#999; margin-bottom:10px;">END</div>
    <div style="font-size:13px; color:#bbb;">감사합니다</div>
  </div>
  ${renderSlideFooter(null, data)}
</div>`;
}

/**
 * HTML 최종 생성
 */
function generateHTML(data, theme) {
  // 공통 정의(MSG/COMP/DESC prefix) → 화면 정의 순서로 정렬
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
<meta name="viewport" content="width=1280">
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
