// ==UserScript==
// @name         FORGE 2.0 Sidecar
// @namespace    scai.forge2
// @version      2.0.0
// @description  FORGE 2.0 sidecar for the proven old Command Center runner page.
// @match        https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6594&deploy=1*
// @match        https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6392&deploy=1*
// @match        https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl*
// @match        https://td3021666.app.netsuite.com/app/site/hosting/*
// @include      https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function forge2Sidecar() {
  'use strict';

  const STATE_KEY = 'forge2.sidecar.request.v1';
  const URL_6594 = 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6594&deploy=1';

  const state = loadState();
  let status = 'ready';

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(next) {
    Object.assign(state, next || {});
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function allElements() {
    return Array.from(document.querySelectorAll('input, textarea, select, button, a, span, div, td, label'));
  }

  function visible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width >= 0 && rect.height >= 0;
  }

  function dispatch(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setValue(el, value) {
    if (!el) return false;
    el.focus();
    el.value = value || '';
    dispatch(el);
    return true;
  }

  function setChecked(el, checked) {
    if (!el) return false;
    if (Boolean(el.checked) !== Boolean(checked)) {
      el.click();
    }
    dispatch(el);
    return true;
  }

  function findFieldByLabel(labelRegex, fieldSelector) {
    const labels = allElements().filter((el) => labelRegex.test(normalizeText(el.textContent)));
    for (const label of labels) {
      const scopes = [
        label.closest('tr'),
        label.closest('table'),
        label.parentElement,
        label.parentElement && label.parentElement.parentElement,
        document
      ].filter(Boolean);
      for (const scope of scopes) {
        const candidates = Array.from(scope.querySelectorAll(fieldSelector)).filter(visible);
        if (candidates.length) return candidates[0];
      }
    }
    return null;
  }

  function findTextFields() {
    return Array.from(document.querySelectorAll('input[type="text"], input:not([type]), textarea'))
      .filter((el) => visible(el) && !el.closest('#forge2-sidecar'));
  }

  function findCompanyField() {
    return document.querySelector('#custpage_prospect, input[name="custpage_prospect"]') ||
      findFieldByLabel(/company name|prospect/i, 'input[type="text"], input:not([type])') ||
      findTextFields()[0] ||
      null;
  }

  function findWebsiteField() {
    return document.querySelector('#custpage_website, input[name="custpage_website"]') ||
      findFieldByLabel(/website/i, 'input[type="text"], input:not([type])') ||
      findTextFields()[1] ||
      null;
  }

  function findNotesField() {
    return document.querySelector('#custpage_notes, textarea[name="custpage_notes"]') ||
      findFieldByLabel(/conversation notes|notes/i, 'textarea') ||
      findTextFields().find((el) => el.tagName === 'TEXTAREA') ||
      null;
  }

  function findCheckboxByLabel(labelRegex) {
    if (/create new hero item|create new item/i.test(String(labelRegex))) {
      const createBox = document.querySelector('#custpage_newhero_fs_inp, input[name="custpage_newhero"]');
      if (createBox) return createBox;
    }
    if (/enable manufacturing flow|manufacturing/i.test(String(labelRegex))) {
      const mfgBox = document.querySelector('#custpage_enablemfg_fs_inp, input[name="custpage_enablemfg"]');
      if (mfgBox) return mfgBox;
    }
    if (/enable wip|wip/i.test(String(labelRegex))) {
      const wipBox = document.querySelector('#custpage_enablewip_fs_inp, input[name="custpage_enablewip"]');
      if (wipBox) return wipBox;
    }
    const labels = allElements().filter((el) => labelRegex.test(normalizeText(el.textContent)));
    for (const label of labels) {
      const scopes = [label.closest('tr'), label.parentElement, label.parentElement && label.parentElement.parentElement].filter(Boolean);
      for (const scope of scopes) {
        const checkbox = Array.from(scope.querySelectorAll('input[type="checkbox"]')).filter(visible)[0];
        if (checkbox) return checkbox;
      }
    }
    return null;
  }

  function findButton(labelRegex) {
    return Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a'))
      .filter((el) => visible(el) && !el.closest('#forge2-sidecar'))
      .find((el) => labelRegex.test(normalizeText(el.textContent || el.value || el.getAttribute('aria-label')))) || null;
  }

  function nativeControls() {
    return {
      company: findCompanyField(),
      website: findWebsiteField(),
      notes: findNotesField(),
      create: findCheckboxByLabel(/create new hero item|create new item/i),
      mfg: findCheckboxByLabel(/enable manufacturing flow|manufacturing/i),
      wip: findCheckboxByLabel(/enable wip|wip/i),
      run: findButton(/run demo reset|build records|build proof package|submit/i),
      refresh: findButton(/refresh all links|refresh records|refresh/i)
    };
  }

  function syncNativeFromSidecar() {
    const c = nativeControls();
    setValue(c.company, $('#forge2-company').value);
    setValue(c.website, $('#forge2-website').value);
    setValue(c.notes, $('#forge2-notes').value);
    setChecked(c.create, $('#forge2-create').checked);
    setChecked(c.mfg, $('#forge2-mfg').checked);
    setChecked(c.wip, $('#forge2-wip').checked);
    saveState({
      company: $('#forge2-company').value,
      website: $('#forge2-website').value,
      notes: $('#forge2-notes').value,
      create: $('#forge2-create').checked,
      mfg: $('#forge2-mfg').checked,
      wip: $('#forge2-wip').checked
    });
    return c;
  }

  function extractResult() {
    const text = document.body ? document.body.innerText : '';
    const links = Array.from(document.querySelectorAll('a[href]'))
      .filter((a) => !a.closest('#forge2-sidecar'))
      .map((a) => ({ label: normalizeText(a.textContent), href: a.href }))
      .filter((a) => a.label && /customer|sales order|item|bom|revision|work order|routing|view|open/i.test(a.label))
      .slice(0, 12);

    const chips = [];
    const chipMatch = text.match(/Customer:\s*([^\n]+)|Industry:\s*([^\n]+)|Scenario:\s*([^\n]+)|Flow:\s*([^\n]+)|Hero Item:\s*([^\n]+)/gi) || [];
    chipMatch.forEach((item) => chips.push(normalizeText(item)));

    const readyMatch = text.match(/Demo Ready:\s*([A-Z _-]+)/i);
    const externalMatch = text.match(/External ID:\s*([^\n]+)/i);
    const summaryMatch = text.match(/Commercial Summary:\s*([^\n]+)/i);
    const completedMatch = text.match(/Reset Completed\s*—\s*([^\n]+)/i);
    const resetKeyMatch = text.match(/Reset Key:\s*([^\n]+)/i);
    const clientMatch = text.match(/CLIENT\s*\n([^\n]+)/i);
    const laneMatch = text.match(/OPERATING LANE\s*\n([^\n]+)/i);
    const readinessMatch = text.match(/READINESS\s*\n([^\n]+)/i);
    const proofMatch = text.match(/PRIMARY PROOF\s*\n([^\n]+)/i);
    const validationMatch = text.match(/NEXT VALIDATION\s*\n([^\n]+)/i);
    const briefMatch = text.match(/CONSULTANT BRIEF\s*\n(?:[^\n]*\n)?([^\n]+(?:\n[^\n]+)?)/i);

    return {
      ready: readyMatch ? normalizeText(readyMatch[1]) : '',
      externalId: externalMatch ? normalizeText(externalMatch[1]) : '',
      summary: summaryMatch ? normalizeText(summaryMatch[1]) : '',
      completed: completedMatch ? normalizeText(completedMatch[1]) : '',
      resetKey: resetKeyMatch ? normalizeText(resetKeyMatch[1]) : '',
      client: clientMatch ? normalizeText(clientMatch[1]) : '',
      lane: laneMatch ? normalizeText(laneMatch[1]) : '',
      readiness: readinessMatch ? normalizeText(readinessMatch[1]) : '',
      proof: proofMatch ? normalizeText(proofMatch[1]) : '',
      validation: validationMatch ? normalizeText(validationMatch[1]) : '',
      brief: briefMatch ? normalizeText(briefMatch[1]) : '',
      chips,
      links
    };
  }

  function storyCard(label, value) {
    if (!value) return '';
    return `<div class="forge2-story-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  function renderResult() {
    const result = extractResult();
    const title = status === 'building' ? 'FORGE 2.0 is building records' : 'FORGE 2.0 request ready';
    $('#forge2-status-title').textContent = result.ready && result.ready !== 'PENDING'
      ? `Demo Ready: ${result.ready}`
      : title;
    $('#forge2-status-subtitle').textContent = result.completed || result.externalId || result.summary || 'The sidecar is driving the proven old Command Center runner page.';
    $('#forge2-result').innerHTML = [
      result.resetKey || result.client || result.lane
        ? `<div class="forge2-storyboard">
            <div class="forge2-board-head">
              <span>Storyboard</span>
              ${result.resetKey ? `<em>${escapeHtml(result.resetKey)}</em>` : ''}
            </div>
            <div class="forge2-story-grid">
              ${storyCard('Client', result.client)}
              ${storyCard('Lane', result.lane)}
              ${storyCard('Readiness', result.readiness)}
              ${storyCard('Primary proof', result.proof)}
            </div>
            ${result.validation ? `<div class="forge2-proof-line"><span>Validate</span>${escapeHtml(result.validation)}</div>` : ''}
            ${result.brief ? `<div class="forge2-brief">${escapeHtml(result.brief)}</div>` : ''}
          </div>`
        : '',
      result.chips.length ? `<div class="forge2-chips">${result.chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('')}</div>` : '',
      result.links.length ? `<div class="forge2-links">${result.links.map((link) => `<a href="${escapeAttr(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join('')}</div>` : '<div class="forge2-empty">Links appear after the working runner page returns them.</div>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function $(selector) {
    return document.querySelector(selector);
  }

  function buildRecords() {
    const c = syncNativeFromSidecar();
    if (!$('#forge2-company').value.trim()) {
      setSidecarMessage('Add a prospect name first.');
      return;
    }
    if (!$('#forge2-website').value.trim()) {
      setSidecarMessage('Add a website first.');
      return;
    }
    if (!c.run) {
      setSidecarMessage('Could not find the native Run Demo Reset button on this page.');
      return;
    }
    status = 'building';
    setSidecarMessage('Submitted through the working Command Center runner page.');
    c.run.click();
    window.setTimeout(renderResult, 1200);
  }

  function refreshRecords() {
    const c = nativeControls();
    if (c.refresh) {
      c.refresh.click();
      setSidecarMessage('Refreshing returned links from the working page.');
    } else {
      setSidecarMessage('Refresh button not found; reading the current page state.');
    }
    window.setTimeout(renderResult, 1200);
  }

  function clearRun() {
    ['#forge2-company', '#forge2-website', '#forge2-notes'].forEach((selector) => { $(selector).value = ''; });
    ['#forge2-create', '#forge2-mfg', '#forge2-wip'].forEach((selector) => { $(selector).checked = false; });
    saveState({ company: '', website: '', notes: '', create: false, mfg: false, wip: false });
    syncNativeFromSidecar();
    setSidecarMessage('Ready for a new FORGE 2.0 run.');
    renderResult();
  }

  function setSidecarMessage(message) {
    $('#forge2-status-subtitle').textContent = message;
  }

  function inject() {
    if (document.querySelector('#forge2-sidecar')) return;
    const root = document.createElement('aside');
    root.id = 'forge2-sidecar';
    root.innerHTML = `
      <div class="forge2-head">
        <div class="forge2-logo-wrap">
          <div class="forge2-logo">FORGE</div>
          <div class="forge2-logo-sub">SC Demo Creation Tool</div>
        </div>
        <div class="forge2-version">2.0</div>
        <a class="forge2-open" href="${URL_6594}">Script 6594</a>
      </div>
      <section class="forge2-card forge2-hero-card">
        <div class="forge2-kicker">Consultant Day In Life</div>
        <h1 id="forge2-status-title">Enter the FORGE 2.0 request</h1>
        <p id="forge2-status-subtitle">This sidecar drives the existing working runner page and reads its returned links.</p>
      </section>
      <section class="forge2-card">
        <div class="forge2-kicker">FORGE 2 Request</div>
        <div class="forge2-steps">
          <span>1 Prospect</span><span>2 Website</span><span>3 Notes</span>
        </div>
        <label>Customer / Prospect Name<input id="forge2-company" type="text" placeholder="Company or account name"></label>
        <label>Website<input id="forge2-website" type="url" placeholder="https://example.com"></label>
        <label>Conversation Notes<textarea id="forge2-notes" placeholder="Buyer pressure, proof goal, timing, and context."></textarea></label>
        <div class="forge2-run-kicker">Run Options</div>
        <div class="forge2-options">
          <label><input id="forge2-create" type="checkbox"> Create new item</label>
          <label><input id="forge2-mfg" type="checkbox"> Manufacturing</label>
          <label><input id="forge2-wip" type="checkbox"> WIP</label>
        </div>
        <div class="forge2-actions">
          <button id="forge2-build" type="button">Build Records</button>
          <button id="forge2-refresh" type="button">Refresh Records</button>
          <button id="forge2-clear" type="button">Clear/New Run</button>
        </div>
        <div id="forge2-result"></div>
      </section>`;
    document.body.appendChild(root);
    injectStyles();

    $('#forge2-company').value = state.company || '';
    $('#forge2-website').value = state.website || '';
    $('#forge2-notes').value = state.notes || '';
    $('#forge2-create').checked = Boolean(state.create);
    $('#forge2-mfg').checked = Boolean(state.mfg);
    $('#forge2-wip').checked = Boolean(state.wip);

    $('#forge2-build').addEventListener('click', buildRecords);
    $('#forge2-refresh').addEventListener('click', refreshRecords);
    $('#forge2-clear').addEventListener('click', clearRun);
    ['#forge2-company', '#forge2-website', '#forge2-notes', '#forge2-create', '#forge2-mfg', '#forge2-wip'].forEach((selector) => {
      $(selector).addEventListener('change', syncNativeFromSidecar);
      $(selector).addEventListener('input', syncNativeFromSidecar);
    });

    syncNativeFromSidecar();
    renderResult();
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #forge2-sidecar{position:fixed;top:0;right:0;width:430px;max-width:42vw;height:100vh;z-index:2147483647;background:#f4f8f8;color:#172436;font-family:Arial,Helvetica,sans-serif;box-shadow:-10px 0 28px rgba(12,36,56,.2);overflow:auto;border-left:4px solid #08748a}
      #forge2-sidecar *{box-sizing:border-box}
      .forge2-head{height:92px;background:#5d9fac;color:#fff;display:flex;align-items:center;gap:16px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.22)}
      .forge2-logo-wrap{background:#10253f;border:2px solid rgba(255,255,255,.18);border-radius:8px;padding:8px 13px 7px;box-shadow:inset 0 0 0 1px rgba(255,215,77,.2)}
      .forge2-logo{font-size:30px;line-height:1;font-weight:900;letter-spacing:0;color:#ffd74d}
      .forge2-logo-sub{font-size:7px;line-height:1.1;text-transform:uppercase;letter-spacing:.12em;color:#fff;margin-top:4px;font-weight:900}
      .forge2-version{font-size:22px;font-weight:900;margin-right:auto;color:#fff}
      .forge2-open{color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.6);border-radius:7px;padding:8px 10px;font-size:12px;font-weight:900;background:rgba(255,255,255,.08)}
      .forge2-card{margin:13px;border:1px solid #d6e1e8;border-radius:8px;background:#fff;padding:15px 16px;box-shadow:0 3px 11px rgba(12,36,56,.1);border-left:5px solid #08748a}
      .forge2-hero-card{padding:17px 18px}
      .forge2-kicker,.forge2-run-kicker{font-size:12px;text-transform:uppercase;font-weight:900;color:#5a6c81;letter-spacing:.07em;margin-bottom:9px}
      .forge2-run-kicker{margin-top:12px}
      #forge2-sidecar h1{font-size:24px;line-height:1.12;margin:0 0 9px;color:#172436;letter-spacing:0}
      #forge2-sidecar p{font-size:15px;line-height:1.38;margin:0;color:#2b415a}
      .forge2-steps{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:2px 0 12px}
      .forge2-steps span{border:1px solid #d5e1e8;background:#f7fafc;color:#53657a;border-radius:7px;padding:9px 10px;font-size:12px;font-weight:900}
      #forge2-sidecar label{display:block;font-size:12px;text-transform:uppercase;font-weight:900;color:#53657a;margin:10px 0 6px;letter-spacing:.02em}
      #forge2-sidecar input[type=text],#forge2-sidecar input[type=url],#forge2-sidecar textarea{width:100%;border:1px solid #cddbe4;border-radius:7px;padding:11px 12px;font-size:15px;text-transform:none;font-weight:400;color:#172436;background:#fff}
      #forge2-sidecar input[type=text]:focus,#forge2-sidecar input[type=url]:focus,#forge2-sidecar textarea:focus{outline:2px solid rgba(8,116,138,.25);border-color:#08748a}
      #forge2-sidecar textarea{min-height:86px;resize:vertical}
      .forge2-options{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:10px 0 12px}
      .forge2-options label{display:flex;align-items:center;gap:8px;margin:0;padding:10px 9px;border:1px solid #d9e4ea;border-radius:7px;text-transform:none;color:#26374b;background:#f8fbfc;min-height:48px}
      .forge2-options input{width:17px;height:17px;accent-color:#08748a;flex:0 0 auto}
      .forge2-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}
      .forge2-actions button{border:1px solid #cfdce5;border-radius:7px;background:#fff;color:#172436;font-weight:900;padding:11px 13px;cursor:pointer;box-shadow:0 1px 0 rgba(12,36,56,.04)}
      .forge2-actions button:hover{border-color:#8fb5c2}
      #forge2-build{background:#08748a;color:#fff;border-color:#08748a}
      #forge2-result{margin-top:13px}
      .forge2-storyboard{border:1px solid #d7e7ed;background:#f6fbfd;border-radius:8px;padding:10px;margin:4px 0 10px}
      .forge2-board-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px;color:#53657a;font-size:12px;text-transform:uppercase;font-weight:900;letter-spacing:.06em}
      .forge2-board-head em{font-style:normal;text-transform:none;letter-spacing:0;color:#08748a;background:#e8f4f7;border-radius:999px;padding:4px 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
      .forge2-story-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .forge2-story-card{background:#fff;border:1px solid #dbe8ee;border-radius:7px;padding:9px;min-height:58px}
      .forge2-story-card span{display:block;color:#607184;font-size:10px;text-transform:uppercase;font-weight:900;letter-spacing:.05em;margin-bottom:4px}
      .forge2-story-card strong{display:block;color:#172436;font-size:13px;line-height:1.25}
      .forge2-proof-line{margin-top:8px;border-left:3px solid #08748a;background:#fff;border-radius:6px;padding:8px 9px;color:#253a50;font-size:13px;line-height:1.3}
      .forge2-proof-line span{display:block;color:#607184;font-size:10px;text-transform:uppercase;font-weight:900;letter-spacing:.05em;margin-bottom:3px}
      .forge2-brief{margin-top:8px;color:#2b415a;font-size:13px;line-height:1.32;background:#fff;border:1px solid #dbe8ee;border-radius:7px;padding:9px}
      .forge2-chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
      .forge2-chips span{font-size:11px;font-weight:800;color:#52667c;background:#eef5f8;border:1px solid #d8e6ec;border-radius:999px;padding:5px 7px}
      .forge2-links{display:grid;grid-template-columns:1fr;gap:7px;margin-top:8px}
      .forge2-links a{display:block;text-decoration:none;color:#0a5970;background:#f3fafc;border:1px solid #d5e7ee;border-radius:7px;padding:9px 10px;font-weight:900;font-size:13px}
      .forge2-empty{font-size:13px;color:#657789;background:#f5f8fa;border:1px dashed #cbd9e2;border-radius:7px;padding:10px}
      @media(max-width:900px){#forge2-sidecar{width:100vw;max-width:none}.forge2-options,.forge2-story-grid{grid-template-columns:1fr}.forge2-board-head{align-items:flex-start;flex-direction:column}.forge2-board-head em{max-width:100%}}
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
