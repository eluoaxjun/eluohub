/**
 * 화면설계서 HTML 템플릿 생성기
 * JSON 데이터 → HTML 프레임 렌더링
 */

function css() {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; background: #fff; }

  /* 화면용: 가로 나열 */
  @media screen {
    body { background: #4a4a4a; display: flex; gap: 40px; padding: 40px; overflow-x: auto; }
  }

  /* 인쇄/PDF용: 프레임별 페이지 */
  @media print {
    body { display: block; padding: 0; background: #fff; }
    .frame { width: 100% !important; min-height: 100vh !important; page-break-after: always; page-break-inside: avoid; border: none !important; }
    .frame:last-child { page-break-after: auto; }
  }

  .frame { width: 1200px; min-height: 800px; background: #fff; border: 2px solid #5bb5a2; flex-shrink: 0; display: flex; flex-direction: column; position: relative; }
  .frame-header { background: #5bb5a2; height: 8px; }
  .frame-footer { margin-top: auto; padding: 12px 24px; display: flex; justify-content: space-between; font-size: 11px; color: #999; border-top: 1px solid #eee; }
  .frame-body { padding: 40px; flex: 1; }

  /* Cover */
  .cover-body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; }
  .cover-ref { font-size: 13px; color: #666; margin-bottom: 8px; }
  .cover-title { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
  .cover-version { font-size: 12px; color: #888; }
  .kt-logo { font-size: 64px; font-weight: 900; color: #333; margin-bottom: 24px; }
  .kt-logo span { color: #e4002b; }

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

  /* Marker overlay */
  .marker-overlay { position: absolute; border: 2px dashed #e4002b; pointer-events: none; z-index: 1; }
  .marker-number { position: absolute; top: -12px; left: -12px; width: 24px; height: 24px; background: #e4002b; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; z-index: 2; }

  /* Description area */
  .description-area { width: 340px; border: 1px solid #ddd; padding: 16px; font-size: 12px; line-height: 1.6; }
  .description-area h4 { font-size: 13px; font-weight: 700; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #333; }
  .desc-marker { display: inline-block; width: 20px; height: 20px; background: #e4002b; color: #fff; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; margin-right: 6px; vertical-align: middle; }
  .desc-item { margin-bottom: 14px; }
  .desc-item-header { font-weight: 700; font-size: 12px; margin-bottom: 6px; }
  .desc-detail { margin: 0; padding-left: 28px; }
  .desc-detail li { margin-bottom: 3px; font-size: 11px; color: #333; list-style: disc; }
  .desc-detail .highlight { color: #e4002b; font-weight: 600; }
  .desc-before { background: #fff3f3; padding: 8px; margin: 4px 0 4px 28px; border-left: 3px solid #e4002b; font-size: 11px; }
  .desc-after { background: #f0fff0; padding: 8px; margin: 4px 0 8px 28px; border-left: 3px solid #2e8b57; font-size: 11px; }
  .desc-label { font-size: 10px; font-weight: 700; color: #888; margin: 2px 0 2px 28px; }
  `;
}

function renderCover(data) {
  const p = data.project;
  const dateCompact = p.date.replace(/-/g, '');
  const srCompact = p.srNo.replace(/-/g, '_');
  return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body cover-body">
    <div class="kt-logo">k<span>t</span></div>
    <div class="cover-ref">[KT][${p.jiraNo}]_[${p.srNo}] ${p.title}</div>
    <div class="cover-title">${p.serviceName}</div>
    <div class="cover-version">[${p.jiraNo}]_[${srCompact}]_Ver ${p.version}_${dateCompact}</div>
  </div>
  <div class="frame-footer"><span>${p.companyName}</span><span>${p.writer}</span></div>
</div>`;
}

function renderHistory(data) {
  const p = data.project;
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
  <div class="frame-footer"><span>${p.companyName}</span><span>${p.writer}</span></div>
</div>`;
}

function renderAssignment(data) {
  const p = data.project;
  const a = data.assignment;
  const bullets = a.dividerBullets.map(b => `<li style="list-style:disc; margin-left:20px; margin-bottom:12px;">${b}</li>`).join('');

  // 01 Divider frame
  const dividerFrame = `
<div class="frame" style="display:flex; flex-direction:column; justify-content:center; align-items:center; background:#1a1a1a; color:#fff;">
  <div class="frame-header" style="position:absolute; top:0; left:0; right:0;"></div>
  <div style="text-align:center; padding:40px;">
    <div style="font-size:14px; color:#aaa; margin-bottom:12px;">${a.dividerSub}</div>
    <div style="font-size:28px; font-weight:700; margin-bottom:40px;">${a.dividerMain}</div>
    <ul style="font-size:15px; color:#ccc; text-align:left; display:inline-block;">${bullets}</ul>
  </div>
</div>`;

  // Assignment Detail frame
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
          <td style="text-align:center">${p.jiraNo}</td>
          <td style="text-align:center">${p.srNo}</td>
          <td>${p.title}</td>
          <td>${a.detail}</td>
          <td>${p.requestor}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="frame-footer"><span>${p.companyName}</span><span>${p.writer}</span></div>
</div>`;

  return dividerFrame + '\n' + detailFrame;
}

function renderInterfaceList(data) {
  const p = data.project;
  const rows = data.interfaces.map(i => `
        <tr>
          <td style="text-align:center">${i.office}</td>
          <td style="text-align:center">${i.channel}</td>
          <td style="text-align:center">${i.depth1}</td>
          <td style="text-align:center">${i.depth2}</td>
          <td style="text-align:center">${i.depth3}</td>
          <td style="text-align:center">${i.depth4 || '-'}</td>
          <td style="text-align:center">${i.interfaceType}</td>
          <td style="text-align:center">${i.workType}</td>
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
  <div class="frame-footer"><span>${p.companyName}</span><span>${p.writer}</span></div>
</div>`;
}

function renderMetaTable(screen, data) {
  const p = data.project;
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
        <td class="key"></td>
        <td class="val" colspan="2"></td>
        <td class="key">Writer</td>
        <td class="val">${p.writer}</td>
      </tr>
      <tr>
        <td class="key"></td>
        <td class="val" colspan="2"></td>
        <td class="key">Date</td>
        <td class="val">${p.date}</td>
      </tr>
    </table>`;
}

function renderDesignArea(screen) {
  // UI capture image + marker overlay
  const markers = (screen.descriptions || []).map(d => {
    if (!d.overlay) return '';
    return `<div class="marker-overlay" style="top:${d.overlay.top}; left:${d.overlay.left}; width:${d.overlay.width}; height:${d.overlay.height};">
              <span class="marker-number">${d.marker}</span>
            </div>`;
  }).join('');

  const uiContent = screen.uiImagePath
    ? `<div class="ui-capture-inner"><img src="${screen.uiImagePath}" alt="${screen.viewportType} UI">${markers}</div>`
    : `[${screen.viewportType} UI capture image area]`;

  // Description: marker + label + bullets + before/after
  const descs = (screen.descriptions || []).map(d => {
    const details = (d.details || []).map(item =>
      `<li>${item}</li>`).join('');
    const detailBlock = details
      ? `<ul class="desc-detail">${details}</ul>` : '';

    return `
        <div class="desc-item">
          <div class="desc-item-header"><span class="desc-marker">${d.marker}</span>${d.label}</div>
          ${detailBlock}
          <div class="desc-label">수정 전</div>
          <div class="desc-before">${d.before}</div>
          <div class="desc-label">수정 후</div>
          <div class="desc-after">${d.after}</div>
        </div>`;
  }).join('\n');

  return `
    <div class="design-area">
      <div class="ui-capture">${uiContent}</div>
      <div class="description-area">
        <h4>Description</h4>
        ${descs}
      </div>
    </div>`;
}

function renderDivider(divider) {
  const d = divider;
  const bullets = (d.bullets || []).map(b =>
    `<li style="list-style:disc; margin-left:20px; margin-bottom:12px;">${b}</li>`).join('');
  return `
<div class="frame" style="display:flex; flex-direction:column; justify-content:center; align-items:center; background:#1a1a1a; color:#fff;">
  <div class="frame-header" style="position:absolute; top:0; left:0; right:0;"></div>
  <div style="text-align:center; padding:40px;">
    <div style="font-size:14px; color:#aaa; margin-bottom:12px;">${d.sub}</div>
    <div style="font-size:28px; font-weight:700; margin-bottom:40px;">${d.main}</div>
    <ul style="font-size:15px; color:#ccc; text-align:left; display:inline-block;">${bullets}</ul>
  </div>
</div>`;
}

function renderScreen(screen, data) {
  const meta = renderMetaTable(screen, data);
  const design = renderDesignArea(screen);
  const p = data.project;
  const frames = [];

  // Divider as separate frame if present
  if (screen.hasDivider && screen.divider) {
    frames.push(renderDivider(screen.divider));
  }

  // Screen design frame
  frames.push(`
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body">
    ${meta}
    ${design}
  </div>
  <div class="frame-footer"><span>${p.companyName}</span><span>${p.writer}</span></div>
</div>`);

  return frames.join('\n');
}

function renderEndOfDocument(data) {
  const p = data.project;
  return `
<div class="frame">
  <div class="frame-header"></div>
  <div class="frame-body" style="display:flex; justify-content:center; align-items:center;">
    <div style="font-size:24px; color:#666;">End of Document</div>
  </div>
  <div class="frame-footer"><span>${p.companyName}</span><span>${p.writer}</span></div>
</div>`;
}

function generateHTML(data) {
  const screens = data.screens.map(s => renderScreen(s, data)).join('\n');
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>화면설계서 - ${data.project.jiraNo}</title>
<style>${css()}</style>
</head>
<body>
${renderCover(data)}
${renderHistory(data)}
${renderAssignment(data)}
${renderInterfaceList(data)}
${screens}
${renderEndOfDocument(data)}
</body>
</html>`;
}

module.exports = { generateHTML };
