/* ===========================================================
   F Klavye Stüdyo — Uygulama mantığı
   =========================================================== */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtTime = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ---------------- Kalıcı veri ---------------- */
const STORE_KEY = 'fklavye-studyo-v1';
const DEFAULT_SETTINGS = {
  theme: 'dark', input: 'emulate', keyboard: true, hands: true, highlight: true,
  errSound: true, keySound: false, font: 'm', targetMul: 1, goal: 10
};
let DB = load();
function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (_) { d = null; }
  d = d || {};
  d.settings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
  d.progress = d.progress || {};
  d.sessions = d.sessions || [];
  d.keyStats = d.keyStats || {};
  d.speed = d.speed || [];
  d.days = d.days || {};
  return d;
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (_) { /* depolama yoksa sessizce geç */ } }
const S = () => DB.settings;

/* ---------------- Yardımcılar ---------------- */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function confirmBox(title, msg) {
  return new Promise((res) => {
    $('#cTitle').textContent = title; $('#cMsg').textContent = msg;
    const m = $('#confirmModal'); m.classList.add('open');
    const done = (v) => { m.classList.remove('open'); $('#cYes').onclick = $('#cNo').onclick = null; res(v); };
    $('#cYes').onclick = () => done(true); $('#cNo').onclick = () => done(false);
  });
}
function starsStr(n, max = 3) { return '★'.repeat(n) + '☆'.repeat(max - n); }

// Ortak SVG degrade tanımları
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute"><defs>
  <linearGradient id="gradRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c6cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
  <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c6cff" stop-opacity=".35"/><stop offset="1" stop-color="#7c6cff" stop-opacity="0"/></linearGradient>
  <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c6cff"/></linearGradient>
</defs></svg>`);

/* ---------------- Ses ---------------- */
let actx = null;
function beep(freq, dur, type = 'sine', vol = 0.08) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch (_) { /* ses desteklenmiyor */ }
}
const sndError = () => S().errSound && beep(180, 0.12, 'square', 0.05);
const sndKey = () => S().keySound && beep(900 + Math.random() * 120, 0.03, 'triangle', 0.035);
const sndWin = () => { if (!S().errSound && !S().keySound) return; [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'sine', 0.06), i * 110)); };

/* ---------------- Tema ve ayarların uygulanması ---------------- */
function applySettings() {
  const s = S();
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.dataset.font = s.font;
  document.body.classList.toggle('no-kb', !s.keyboard);
  document.body.classList.toggle('no-hands', !s.hands);
  if (window.desktop) window.desktop.setTheme(s.theme);
  $$('#themeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.v === s.theme));
  $$('#inputSeg button').forEach((b) => b.classList.toggle('on', b.dataset.v === s.input));
  $$('#fontSeg button').forEach((b) => b.classList.toggle('on', b.dataset.v === s.font));
  $$('#targetSeg button').forEach((b) => b.classList.toggle('on', Number(b.dataset.v) === s.targetMul));
  $$('#goalSeg button').forEach((b) => b.classList.toggle('on', Number(b.dataset.v) === s.goal));
  $('#optKeyboard').checked = s.keyboard; $('#optHands').checked = s.hands; $('#optHighlight').checked = s.highlight;
  $('#optErrSound').checked = s.errSound; $('#optKeySound').checked = s.keySound;
}

/* ---------------- Gezinme ---------------- */
let currentView = 'lessons';
function showView(name) {
  if (currentView === 'type' && name !== 'type') stopEngine();
  currentView = name;
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  const navName = name === 'lesson' ? 'lessons' : name;
  if (name !== 'type') $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === navName));
  $('.main').scrollTop = 0;
  if (name === 'lessons') renderLessons();
  if (name === 'practice') renderPractice();
  if (name === 'speed') renderSpeed();
  if (name === 'stats') renderStats();
  renderSidebar();
}
$$('.nav-item').forEach((n) => n.addEventListener('click', () => showView(n.dataset.view)));
$$('[data-back]').forEach((b) => b.addEventListener('click', () => showView(b.dataset.back)));

/* ---------------- İlerleme hesapları ---------------- */
const lvlData = (lid, i) => (DB.progress[lid] || {})[i];
function lessonDone(l) { return l.levels.filter((_, i) => (lvlData(l.id, i) || {}).stars > 0).length; }
function lessonStars(l) { return l.levels.reduce((a, _, i) => a + ((lvlData(l.id, i) || {}).stars || 0), 0); }
function nextTarget() {
  for (const l of LESSONS) for (let i = 0; i < l.levels.length; i++) if (!((lvlData(l.id, i) || {}).stars > 0)) return { lid: l.id, lvl: i };
  return { lid: LESSONS[0].id, lvl: 0 };
}
function streak() {
  let n = 0; const d = new Date();
  if (!DB.days[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (DB.days[todayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function bestWpm() { return DB.sessions.reduce((m, s) => Math.max(m, s.wpm), 0); }

function renderSidebar() {
  const total = LESSONS.reduce((a, l) => a + l.levels.length, 0);
  const done = LESSONS.reduce((a, l) => a + lessonDone(l), 0);
  const stars = LESSONS.reduce((a, l) => a + lessonStars(l), 0);
  const todayMin = (DB.days[todayKey()] || 0) / 60;
  const goal = S().goal;
  $('.side-card').innerHTML = `
    <div class="sc-label">Genel ilerleme</div>
    <div class="sc-bar"><div style="width:${(done / total * 100).toFixed(1)}%"></div></div>
    <div class="sc-row"><span>${done} / ${total} seviye</span><span>★ ${stars}</span></div>
    <div class="sc-label" style="margin-top:14px">Günlük hedef</div>
    <div class="sc-bar"><div style="width:${Math.min(100, todayMin / goal * 100).toFixed(1)}%"></div></div>
    <div class="sc-row"><span>Bugün</span><span>${Math.floor(todayMin)} / ${goal} dk</span></div>
    <div class="sc-row"><span>🔥 Seri</span><span>${streak()} gün</span></div>
    <div class="sc-row"><span>🏆 En iyi hız</span><span>${Math.round(bestWpm())} k/dk</span></div>`;
}

/* ---------------- Dersler ---------------- */
const GROUP_DESC = {
  'Başlangıç': 'Küçük harfler, nokta ve virgül. Bu bölümü bitirdiğinde temel bilgisayar kullanımı için gereken on parmak becerisine sahip olursun.',
  'Orta Seviye': 'Büyük harfler, sayılar ve temel noktalama. Klavyenin tüm tuşlarına hâkim olmak isteyenler için.',
  'İleri Seviye': 'Uzak tuş geçişleri, semboller, zorlu doğruluk çalışmaları ve hız paragrafları.'
};
function ringSVG(pct, icon) {
  const r = 23, c = 2 * Math.PI * r;
  return `<div class="ring"><svg viewBox="0 0 54 54"><circle class="r-bg" cx="27" cy="27" r="${r}"/>
    <circle class="r-fg" cx="27" cy="27" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg><div class="r-icon">${icon}</div></div>`;
}
function renderLessons() {
  const box = $('#lessonGroups'); box.innerHTML = '';
  const nt = nextTarget();
  const groups = [...new Set(LESSONS.map((l) => l.group))];
  groups.forEach((g) => {
    const ls = LESSONS.filter((l) => l.group === g);
    const lvCount = ls.reduce((a, l) => a + l.levels.length, 0);
    const sec = el('div', 'group');
    sec.innerHTML = `<div class="group-head"><h2>${g}</h2><span class="gbadge">${ls.length} ders · ${lvCount} seviye</span></div><p class="group-desc">${GROUP_DESC[g]}</p>`;
    const grid = el('div', 'lesson-grid');
    ls.forEach((l) => {
      const done = lessonDone(l), st = lessonStars(l);
      const card = el('button', 'lesson-card' + (l.id === nt.lid ? ' next' : ''));
      card.innerHTML = `${ringSVG(done / l.levels.length, l.icon)}
        <div class="lc-body"><div class="lc-num">DERS ${l.id}</div><div class="lc-title">${esc(l.title)}</div>
        <div class="lc-meta"><span>${done}/${l.levels.length} seviye</span><span class="stars">★ ${st}/${l.levels.length * 3}</span></div></div>`;
      card.addEventListener('click', () => openLesson(l.id));
      grid.appendChild(card);
    });
    sec.appendChild(grid); box.appendChild(sec);
  });
}
$('#continueBtn').addEventListener('click', () => { const t = nextTarget(); startLesson(t.lid, t.lvl); });

function openLesson(lid) {
  const l = LESSONS.find((x) => x.id === lid);
  $('#lhIcon').textContent = l.icon;
  $('#lhGroup').textContent = `${l.group} · Ders ${l.id}`;
  $('#lhTitle').textContent = l.title;
  $('#lhIntro').innerHTML = l.intro;
  $('#lhLevels').textContent = `📋 ${l.levels.length} seviye`;
  $('#lhTarget').textContent = `🎯 3 yıldız hedefi: ${Math.round(l.target * S().targetMul)} k/dk, %96 doğruluk`;
  $('#lhDone').textContent = `✅ ${lessonDone(l)} tamamlandı`;
  const list = $('#levelList'); list.innerHTML = '';
  const firstOpen = l.levels.findIndex((_, i) => !((lvlData(l.id, i) || {}).stars > 0));
  l.levels.forEach((lv, i) => {
    const d = lvlData(l.id, i);
    const b = el('button', 'level' + (d && d.stars > 0 ? ' done' : '') + (i === firstOpen ? ' cur' : ''));
    b.innerHTML = `<div class="lv-n">${d && d.stars > 0 ? '✓' : i + 1}</div><div><div class="lv-name">${esc(lv.name)}</div>
      <div class="lv-info">${d ? `<span class="stars">${starsStr(d.stars)}</span> · ${Math.round(d.wpm)} k/dk · %${Math.round(d.acc)} · ${d.count}×` : 'Henüz denenmedi'}</div></div>`;
    b.addEventListener('click', () => startLesson(l.id, i));
    list.appendChild(b);
  });
  showView('lesson');
}

/* ---------------- Ekran klavyesi ---------------- */
const KEY_EL = {}; // kod -> eleman (yazma ekranı)
function buildKeyboard(container, store) {
  container.innerHTML = '';
  KB_ROWS.forEach((row) => {
    const r = el('div', 'kb-row');
    row.forEach(([code, n, s, a, f, w]) => {
      const isMod = n.length > 1 || code === 'Space' || code === 'EnterFill';
      const k = el('div', `key f-${f}` + (isMod ? ' mod' : '') + (code === 'KeyF' || code === 'KeyJ' ? ' home' : '') + (code === 'EnterFill' ? ' empty' : ''));
      k.style.flexGrow = w || 1;
      const showS = s && trUpper(n) !== s ? s : '';
      k.innerHTML = (showS ? `<span class="ks">${esc(showS)}</span>` : '') + `<span class="kn">${esc(code === 'Space' ? 'boşluk' : n)}</span>` + (a ? `<span class="ka">${esc(a)}</span>` : '');
      k.dataset.code = code;
      r.appendChild(k);
      if (store) store[code] = k;
    });
    container.appendChild(r);
  });
}

/* ---------------- El şeması ---------------- */
function buildHands() {
  const fingers = [ // [x, y, w, h] sol el için (serçe -> işaret)
    ['p', 14, 78, 30, 86], ['r', 50, 44, 32, 118], ['m', 88, 28, 33, 132], ['i', 127, 46, 32, 112]
  ];
  const draw = (side) => {
    const pre = side === 'left' ? 'l' : 'r';
    let svg = `<g ${side === 'right' ? 'transform="translate(200,0) scale(-1,1)"' : ''}>`;
    svg += `<rect class="palm" x="12" y="128" width="152" height="96" rx="42"/>`;
    fingers.forEach(([f, x, y, w, h]) => { svg += `<rect class="finger" data-f="${pre}${f}" x="${x}" y="${y}" width="${w}" height="${h}" rx="15"/>`; });
    svg += `<rect class="finger" data-f="th" x="150" y="128" width="30" height="80" rx="15" transform="rotate(-38 165 168)"/>`;
    svg += '</g>';
    return svg;
  };
  $('#handL').innerHTML = draw('left');
  $('#handR').innerHTML = draw('right');
}
function highlightFingers(list) {
  $$('.hand .finger').forEach((f) => {
    const on = list.includes(f.dataset.f);
    f.classList.toggle('on', on);
    f.style.fill = on ? `var(--f-${f.dataset.f})` : '';
    f.style.setProperty('--glow', on ? `var(--f-${f.dataset.f})` : 'transparent');
  });
}

/* ===========================================================
   YAZMA MOTORU
   =========================================================== */
const E = { active: false };
let liveTimer = null;

function startLesson(lid, lvl) {
  const l = LESSONS.find((x) => x.id === lid);
  const text = l.levels[lvl].gen();
  DB.last = { lid, lvl }; save();
  startEngine({
    mode: 'lesson', lid, lvl, text,
    title: `Ders ${l.id}: ${l.title}`,
    sub: `Seviye ${lvl + 1} / ${l.levels.length} · ${l.levels[lvl].name}`,
    target: l.target
  });
}

function startEngine(cfg) {
  stopEngine();
  closeModal();
  Object.assign(E, {
    active: true, cfg, text: cfg.text.replace(/\s+/g, ' ').trim(), pos: 0, errors: 0, errAt: new Set(),
    started: false, startT: 0, lastT: 0, activeMs: 0, hits: {}, miss: {}, wrongNow: false, finished: false
  });
  $('#tTitle').textContent = cfg.title;
  $('#tSub').textContent = cfg.sub || '';
  $('#sTimeLbl').textContent = cfg.duration ? 'kalan' : 'süre';
  $('#focusHint').style.display = '';
  renderText();
  updateLive();
  showView('type');
  updateTarget();
}

function stopEngine() {
  E.active = false;
  clearInterval(liveTimer); liveTimer = null;
}

function renderText() {
  const box = $('#textBox'); box.innerHTML = ''; box.style.transform = '';
  const frag = document.createDocumentFragment();
  E.spans = [];
  let word = null;
  [...E.text].forEach((ch) => {
    const s = el('span', 'c' + (ch === ' ' ? ' sp' : ''));
    s.textContent = ch;
    E.spans.push(s);
    if (ch === ' ') { word = null; frag.appendChild(s); }
    else { if (!word) { word = el('span', 'w'); frag.appendChild(word); } word.appendChild(s); }
  });
  box.appendChild(frag);
  if (E.spans[0]) E.spans[0].classList.add('cur');
}

function scrollText() {
  const cur = E.spans[E.pos]; if (!cur) return;
  const lh = parseFloat(getComputedStyle($('#textBox')).lineHeight) || 56;
  const top = cur.offsetTop;
  const line = Math.round(top / lh);
  const shift = Math.max(0, line - 1) * lh;
  $('#textBox').style.transform = `translateY(${-shift}px)`;
}

function elapsedSec() {
  if (!E.started) return 0;
  if (E.cfg.duration) return (performance.now() - E.startT) / 1000;
  // Boşta geçen süre (3 sn üstü duraklamalar) sayılmaz
  return (E.activeMs + Math.min(performance.now() - E.lastT, 3000)) / 1000;
}
function calc() {
  const t = Math.max(elapsedSec(), 0.001);
  const min = t / 60;
  const wpm = E.started ? (E.pos / 5) / min : 0;
  const kpm = E.started ? E.pos / min : 0;
  const acc = E.pos + E.errors ? (E.pos / (E.pos + E.errors)) * 100 : 100;
  return { t, wpm, kpm, acc };
}
function updateLive() {
  const c = calc();
  $('#sWpm').textContent = E.started && c.t > 1.5 ? Math.round(c.wpm) : 0;
  $('#sKpm').textContent = E.started && c.t > 1.5 ? Math.round(c.kpm) : 0;
  $('#sAcc').textContent = Math.round(c.acc) + '%';
  $('#sErr').textContent = E.errors;
  $('#sTime').textContent = E.cfg.duration ? fmtTime(E.cfg.duration - (E.started ? c.t : 0)) : fmtTime(c.t);
  $('#tProgress').style.width = E.cfg.duration ? `${Math.min(100, (E.started ? c.t : 0) / E.cfg.duration * 100)}%` : `${E.pos / E.text.length * 100}%`;
  if (E.cfg.duration && E.started && c.t >= E.cfg.duration) finish();
}

function updateTarget() {
  $$('#keyboard .key.target').forEach((k) => k.classList.remove('target'));
  const ch = E.text[E.pos];
  if (ch == null) { highlightFingers([]); $('#fingerText').textContent = ''; return; }
  const info = CHAR_MAP[ch];
  if (!info) { highlightFingers([]); $('#fingerText').innerHTML = `Sıradaki: <b>${esc(ch)}</b>`; return; }
  const codes = [info.code];
  const fingers = [info.finger];
  let extra = '';
  if (info.shift) {
    const left = info.finger.startsWith('l');
    codes.push(left ? 'ShiftRight' : 'ShiftLeft');
    fingers.push(left ? 'rp' : 'lp');
    extra = ` + <b>${left ? 'Sağ' : 'Sol'} Shift</b>`;
  }
  if (info.altgr) { codes.push('AltRight'); fingers.push('th'); extra = ' + <b>Alt Gr</b>'; }
  if (info.code === 'Space') fingers.push('th');
  if (S().highlight) codes.forEach((c) => KEY_EL[c] && KEY_EL[c].classList.add('target'));
  highlightFingers(S().highlight ? fingers : []);
  const label = ch === ' ' ? 'Boşluk' : ch;
  $('#fingerText').innerHTML = `Sıradaki: <b>${esc(label)}</b> — ${FINGER_NAMES[info.finger]}${extra}`;
  $('.finger-hint .dot').style.background = `var(--f-${info.finger})`;
  $('.finger-hint .dot').style.color = `var(--f-${info.finger})`;
}

function charFromEvent(e) {
  if (S().input === 'system') {
    return e.key && e.key.length === 1 ? e.key : null;
  }
  if (e.code === 'Space') return ' ';
  const k = KEY_BY_CODE[e.code];
  if (!k || !k.n || k.n.length !== 1) return e.key && e.key.length === 1 && !KEY_BY_CODE[e.code] ? e.key : null;
  const altgr = e.getModifierState && (e.getModifierState('AltGraph') || (e.ctrlKey && e.altKey));
  if (altgr) return k.a || null;
  const isLetter = trLower(k.n) !== trUpper(k.n);
  const caps = e.getModifierState && e.getModifierState('CapsLock');
  const up = e.shiftKey !== (isLetter && caps);
  return up ? (k.s || null) : k.n;
}

function flashKey(code, bad) {
  const k = KEY_EL[code]; if (!k) return;
  k.classList.add(bad ? 'flash-bad' : 'press');
  setTimeout(() => k.classList.remove('press', 'flash-bad'), bad ? 220 : 90);
}

function onTypeKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); restart(); return; }
  if (e.metaKey) return;
  if (e.ctrlKey && !e.altKey) return; // kısayollar
  $('#capsWarn').classList.toggle('on', !!(e.getModifierState && e.getModifierState('CapsLock')));
  if (['Tab', 'Backspace', 'Enter'].includes(e.key) || e.code === 'Tab') { e.preventDefault(); return; }
  const ch = charFromEvent(e);
  if (ch == null) return;
  e.preventDefault();
  if (E.finished) return;

  const now = performance.now();
  if (!E.started) {
    E.started = true; E.startT = now; E.lastT = now;
    $('#focusHint').style.display = 'none';
    liveTimer = setInterval(updateLive, 200);
  } else {
    E.activeMs += Math.min(now - E.lastT, 3000);
    E.lastT = now;
  }

  const expected = E.text[E.pos];
  const span = E.spans[E.pos];
  if (ch === expected) {
    E.hits[expected] = (E.hits[expected] || 0) + 1;
    span.classList.remove('cur', 'wrong');
    span.classList.add('done');
    if (E.errAt.has(E.pos)) span.classList.add('err');
    E.pos++; E.wrongNow = false;
    flashKey(e.code, false); sndKey();
    if (E.pos >= E.text.length) { updateLive(); finish(); return; }
    E.spans[E.pos].classList.add('cur');
    if (E.text[E.pos - 1] === ' ' || E.pos % 8 === 0) scrollText();
    updateTarget();
  } else {
    E.errors++; E.errAt.add(E.pos);
    E.miss[expected] = (E.miss[expected] || 0) + 1;
    span.classList.add('wrong');
    flashKey(e.code, true); sndError();
    const card = $('#textCard'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
  }
  updateLive();
}

document.addEventListener('keydown', (e) => {
  if ($('#confirmModal').classList.contains('open')) { if (e.key === 'Escape') $('#cNo').click(); return; }
  if ($('#resultModal').classList.contains('open')) {
    if (e.key === 'Enter') { e.preventDefault(); $('#rNext').click(); }
    else if (e.key === 'Escape') { e.preventDefault(); $('#rRetry').click(); }
    return;
  }
  if (currentView === 'type' && E.active) onTypeKey(e);
});
document.addEventListener('keyup', (e) => {
  if (currentView === 'type') $('#capsWarn').classList.toggle('on', !!(e.getModifierState && e.getModifierState('CapsLock')));
});

function restart() {
  const c = E.cfg;
  if (c.mode === 'lesson') startLesson(c.lid, c.lvl);
  else startEngine(Object.assign({}, c, { text: c.regen ? c.regen() : c.text }));
}
$('#restartBtn').addEventListener('click', restart);
$('#typeBack').addEventListener('click', () => {
  const c = E.cfg || {};
  if (c.mode === 'lesson') openLesson(c.lid);
  else showView(c.back || 'lessons');
});

/* ---------------- Bitiş ve sonuç ---------------- */
function finish() {
  if (E.finished) return;
  E.finished = true;
  if (!E.cfg.duration) { E.activeMs += Math.min(performance.now() - E.lastT, 3000); E.lastT = performance.now(); }
  clearInterval(liveTimer); liveTimer = null;
  const r = calc();
  if (E.cfg.duration) r.t = Math.min(r.t, E.cfg.duration);
  const c = E.cfg;

  // Oturumu kaydet
  if (E.pos > 0) {
    DB.sessions.push({ t: Date.now(), wpm: +r.wpm.toFixed(1), kpm: Math.round(r.kpm), acc: +r.acc.toFixed(1), dur: Math.round(r.t), mode: c.mode });
    if (DB.sessions.length > 1000) DB.sessions.splice(0, DB.sessions.length - 1000);
    const dk = todayKey(); DB.days[dk] = (DB.days[dk] || 0) + r.t;
    Object.keys(E.hits).forEach((k) => { const s = DB.keyStats[k] || (DB.keyStats[k] = { h: 0, m: 0 }); s.h += E.hits[k]; });
    Object.keys(E.miss).forEach((k) => { const s = DB.keyStats[k] || (DB.keyStats[k] = { h: 0, m: 0 }); s.m += E.miss[k]; });
  }
  const prevBest = DB.sessions.slice(0, -1).reduce((m, s) => Math.max(m, s.wpm), 0);

  let stars = 0;
  if (c.mode === 'lesson') {
    const target = c.target * S().targetMul;
    if (r.acc >= 96 && r.wpm >= target) stars = 3;
    else if (r.acc >= 92 && r.wpm >= target * 0.7) stars = 2;
    else if (r.acc >= 85) stars = 1;
    const p = DB.progress[c.lid] || (DB.progress[c.lid] = {});
    const old = p[c.lvl] || { stars: 0, wpm: 0, acc: 0, count: 0 };
    p[c.lvl] = { stars: Math.max(old.stars, stars), wpm: Math.max(old.wpm, r.wpm), acc: Math.max(old.acc, r.acc), count: old.count + 1 };
  }
  if (c.mode === 'speed') {
    DB.speed.unshift({ t: Date.now(), dur: c.duration, wpm: +r.wpm.toFixed(1), kpm: Math.round(r.kpm), acc: +r.acc.toFixed(1) });
    DB.speed = DB.speed.slice(0, 50);
  }
  save();
  renderSidebar();
  showResult(r, stars, r.wpm > prevBest && prevBest > 0 && E.pos > 20);
}

const MSGS = {
  0: ['Biraz daha pratik!', 'Doğruluğun %85\'in altında kaldı. Yavaşla, her tuşa doğru parmakla bas.'],
  1: ['Seviye tamamlandı', 'Güzel başlangıç! Daha az hata ve biraz daha hızla 3 yıldıza ulaşabilirsin.'],
  2: ['Çok iyi!', 'Harika gidiyorsun. Hedef hıza ulaşmak için bir tekrar daha yapabilirsin.'],
  3: ['Mükemmel!', 'Hem hızlı hem doğru. Bir sonraki seviyeye hazırsın!']
};
function showResult(r, stars, record) {
  const c = E.cfg;
  const isLesson = c.mode === 'lesson';
  $('#rStars').innerHTML = isLesson ? [0, 1, 2].map((i) => `<span class="s ${i < stars ? 'on' : ''}">★</span>`).join('') : '<span class="s on">🏁</span>';
  if (isLesson) { $('#rTitle').textContent = MSGS[stars][0]; $('#rMsg').textContent = MSGS[stars][1]; }
  else { $('#rTitle').textContent = c.mode === 'speed' ? 'Test tamamlandı' : 'Çalışma tamamlandı'; $('#rMsg').textContent = c.mode === 'speed' ? `${fmtTime(c.duration)} sürede ${E.pos} karakter yazdın.` : 'Güzel çalışma! Yeni bir metinle devam edebilirsin.'; }
  if (record) $('#rMsg').textContent = '🏆 Yeni hız rekoru! ' + $('#rMsg').textContent;
  $('#rWpm').textContent = Math.round(r.wpm);
  $('#rKpm').textContent = Math.round(r.kpm);
  $('#rAcc').textContent = '%' + Math.round(r.acc);
  $('#rTime').textContent = fmtTime(r.t);
  const weak = Object.entries(E.miss).sort((a, b) => b[1] - a[1]).slice(0, 4);
  $('#rWeak').innerHTML = weak.length ? 'En çok zorlandığın tuşlar: ' + weak.map(([k, n]) => `<b>${esc(k === ' ' ? '␣' : k)}</b>×${n}`).join(' ') : '✨ Hiç hata yapmadın!';

  let nextLabel = 'Yeni metin →';
  if (isLesson) {
    const l = LESSONS.find((x) => x.id === c.lid);
    nextLabel = c.lvl + 1 < l.levels.length ? 'Sonraki seviye →' : (LESSONS.find((x) => x.id === c.lid + 1) ? 'Sonraki ders →' : 'Ders listesi');
    if (stars === 0) nextLabel = 'Yine de geç →';
  }
  $('#rNext').textContent = nextLabel;
  $('#rList').textContent = isLesson ? '☰ Seviyeler' : '☰ Geri dön';
  $('#resultModal').classList.add('open');
  if (stars === 3 || record) { confetti(); sndWin(); }
}
function closeModal() { $('#resultModal').classList.remove('open'); }
$('#rRetry').addEventListener('click', () => { closeModal(); restart(); });
$('#rList').addEventListener('click', () => {
  closeModal();
  const c = E.cfg;
  if (c.mode === 'lesson') openLesson(c.lid); else showView(c.back || 'lessons');
});
$('#rNext').addEventListener('click', () => {
  closeModal();
  const c = E.cfg;
  if (c.mode !== 'lesson') { restart(); return; }
  const l = LESSONS.find((x) => x.id === c.lid);
  if (c.lvl + 1 < l.levels.length) startLesson(c.lid, c.lvl + 1);
  else if (LESSONS.find((x) => x.id === c.lid + 1)) openLesson(c.lid + 1);
  else showView('lessons');
});

/* ---------------- Konfeti ---------------- */
function confetti() {
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  const W = cv.width = cv.offsetWidth, H = cv.height = cv.offsetHeight;
  const cols = ['#7c6cff', '#22d3ee', '#fbbf24', '#34d399', '#f472b6', '#fb923c'];
  const P = Array.from({ length: 140 }, () => ({
    x: W / 2 + (Math.random() - .5) * 80, y: H * .3, vx: (Math.random() - .5) * 9, vy: -Math.random() * 9 - 3,
    s: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: pick(cols)
  }));
  let f = 0;
  (function tick() {
    ctx.clearRect(0, 0, W, H);
    P.forEach((p) => {
      p.vy += .22; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - f / 140);
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    });
    if (++f < 140) requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H);
  })();
}

/* ===========================================================
   PRATİK
   =========================================================== */
const pickSet = new Set();
function weakKeyList() {
  return Object.entries(DB.keyStats)
    .filter(([k, s]) => k !== ' ' && s.h + s.m >= 5 && s.m > 0)
    .map(([k, s]) => [k, s.m / (s.h + s.m)])
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k);
}
function renderPractice() {
  const wk = weakKeyList();
  $('#weakKeys').innerHTML = wk.length ? wk.map((k) => `<span class="wk">${esc(k)}</span>`).join('') : '<span class="muted small">Henüz yeterli veri yok. Birkaç ders çalıştıktan sonra burada zayıf tuşların listelenecek.</span>';
  $('#weakBtn').disabled = !wk.length; $('#weakBtn').style.opacity = wk.length ? 1 : .5;
  const kp = $('#keyPicker');
  if (!kp.children.length) {
    [...TR_ALPHABET, '.', ','].forEach((c) => {
      const b = el('button', '', esc(c));
      b.addEventListener('click', () => { pickSet.has(c) ? pickSet.delete(c) : pickSet.add(c); b.classList.toggle('on'); });
      kp.appendChild(b);
    });
  }
}
$('#weakBtn').addEventListener('click', () => {
  const wk = weakKeyList(); if (!wk.length) return;
  const letters = wk.filter((k) => TR_ALPHABET.includes(k));
  const gen = () => {
    const drill = genDrill(wk.slice(0, 4).join(''), wk.join('') + 'aeik', 70);
    const words = letters.length ? genWords(wordsFrom(TR_ALPHABET, { must: letters.join('') }), 90) : '';
    return (drill + ' ' + words).trim();
  };
  startEngine({ mode: 'practice', back: 'practice', title: 'Zayıf Tuşlarım', sub: 'Odak: ' + wk.join(' '), text: gen(), regen: gen });
});
$('#pickBtn').addEventListener('click', () => {
  if (!pickSet.size) { toast('Önce en az bir tuş seç.'); return; }
  const keys = [...pickSet].join('');
  const mode = $('input[name="pickMode"]:checked').value;
  const gen = () => {
    if (mode === 'words') {
      const list = wordsFrom(keys + (keys.length < 6 ? 'aeikl' : ''), { must: keys });
      return list.length >= 3 ? genWords(list, 130) : genDrill(keys, keys, 110);
    }
    return genDrill(keys, keys, 110);
  };
  startEngine({ mode: 'practice', back: 'practice', title: 'Seçili Tuşlar', sub: keys.split('').join(' '), text: gen(), regen: gen });
});
let randomType = 'words';
$$('#randomSeg button').forEach((b) => b.addEventListener('click', () => { randomType = b.dataset.v; $$('#randomSeg button').forEach((x) => x.classList.toggle('on', x === b)); }));
$('#randomBtn').addEventListener('click', () => {
  const gen = () => randomType === 'words' ? genWords(WORDS, 200) : randomType === 'sentences' ? genSentences(SENTENCES.concat(SENTENCES_LOWER), 4) : pick(PARAGRAPHS);
  const names = { words: 'Rastgele Kelimeler', sentences: 'Rastgele Cümleler', paragraph: 'Rastgele Paragraf' };
  startEngine({ mode: 'practice', back: 'practice', title: names[randomType], sub: 'Serbest pratik', text: gen(), regen: gen });
});
function cleanCustom(t) {
  t = t.replace(/[“”„«»]/g, '"').replace(/[‘’`´]/g, "'").replace(/[–—]/g, '-').replace(/…/g, '...').replace(/\s+/g, ' ').trim();
  if (S().input === 'emulate') t = [...t].filter((c) => CHAR_MAP[c]).join('').replace(/\s+/g, ' ').trim();
  return t;
}
$('#customBtn').addEventListener('click', () => {
  const t = cleanCustom($('#customText').value);
  if (t.length < 5) { toast('Lütfen en az birkaç kelimelik bir metin gir.'); return; }
  startEngine({ mode: 'custom', back: 'practice', title: 'Kendi Metnin', sub: `${t.length} karakter`, text: t });
});

/* ===========================================================
   HIZ TESTİ
   =========================================================== */
let speedDur = 60, speedContent = 'common';
$$('#durSeg button').forEach((b) => b.addEventListener('click', () => { speedDur = +b.dataset.v; $$('#durSeg button').forEach((x) => x.classList.toggle('on', x === b)); }));
$$('#speedContent button').forEach((b) => b.addEventListener('click', () => { speedContent = b.dataset.v; $$('#speedContent button').forEach((x) => x.classList.toggle('on', x === b)); }));
function renderSpeed() {
  const best = DB.speed.reduce((m, s) => Math.max(m, s.wpm), 0);
  $('#gaugeVal').textContent = Math.round(best);
  requestAnimationFrame(() => { $('#gaugeArc').style.strokeDashoffset = 251.3 * (1 - Math.min(best, 100) / 100); });
  const tb = $('#speedTable tbody');
  tb.innerHTML = DB.speed.length ? DB.speed.slice(0, 15).map((s) => `<tr><td>${new Date(s.t).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>${fmtTime(s.dur)}</td><td><b>${Math.round(s.wpm)}</b></td><td>${s.kpm}</td><td>%${Math.round(s.acc)}</td></tr>`).join('')
    : '<tr><td colspan="5" class="empty">Henüz test yapılmadı. İlk testini başlat!</td></tr>';
}
$('#speedBtn').addEventListener('click', () => {
  const chars = Math.max(400, Math.ceil(speedDur / 60) * 750);
  const gen = () => {
    if (speedContent === 'text') { let t = ''; while (t.length < chars) t += ' ' + genSentences(SENTENCES.concat(SENTENCES_LOWER, PARAGRAPHS), 3); return t.trim(); }
    return genWords(speedContent === 'common' ? WORDS.slice(0, 300) : WORDS, chars);
  };
  startEngine({ mode: 'speed', back: 'speed', title: 'Hız Testi', sub: `${fmtTime(speedDur)} · ${{ common: 'Sık kelimeler', all: 'Tüm kelimeler', text: 'Cümleler' }[speedContent]}`, text: gen(), regen: gen, duration: speedDur });
});

/* ===========================================================
   İSTATİSTİKLER
   =========================================================== */
function renderStats() {
  const ss = DB.sessions;
  const totalSec = Object.values(DB.days).reduce((a, b) => a + b, 0);
  const last = ss.slice(-20);
  const avg = last.length ? last.reduce((a, s) => a + s.wpm, 0) / last.length : 0;
  const avgAcc = last.length ? last.reduce((a, s) => a + s.acc, 0) / last.length : 0;
  const stars = LESSONS.reduce((a, l) => a + lessonStars(l), 0);
  const k = [
    ['⏱️', totalSec >= 3600 ? `${Math.floor(totalSec / 3600)}s ${Math.floor(totalSec % 3600 / 60)}dk` : `${Math.floor(totalSec / 60)} dk`, 'Toplam süre'],
    ['📝', ss.length, 'Çalışma sayısı'],
    ['⚡', Math.round(avg), 'Ort. hız (son 20)'],
    ['🏆', Math.round(bestWpm()), 'En iyi hız'],
    ['🎯', '%' + Math.round(avgAcc), 'Ort. doğruluk'],
    ['⭐', stars, 'Toplam yıldız']
  ];
  $('#kpis').innerHTML = k.map(([i, v, l]) => `<div class="kpi"><div class="ki">${i}</div><div class="kv">${v}</div><div class="kl">${l}</div></div>`).join('');
  drawLine($('#wpmChart'), ss.slice(-40).map((s) => s.wpm));
  const days = []; const d = new Date(); d.setDate(d.getDate() - 13);
  for (let i = 0; i < 14; i++) { days.push([d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }), (DB.days[todayKey(d)] || 0) / 60]); d.setDate(d.getDate() + 1); }
  drawBars($('#dayChart'), days, S().goal);
  const hk = $('#heatKeyboard'); const store = {};
  buildKeyboard(hk, store);
  Object.values(store).forEach((kel) => {
    const kinfo = KEY_BY_CODE[kel.dataset.code]; if (!kinfo) return;
    const chars = [kinfo.n, kinfo.s, kinfo.a].filter((c) => c && c.length === 1);
    if (kel.dataset.code === 'Space') chars.push(' ');
    let h = 0, m = 0; chars.forEach((c) => { const s = DB.keyStats[c]; if (s) { h += s.h; m += s.m; } });
    if (h + m === 0) { kel.title = 'Veri yok'; return; }
    const rate = m / (h + m);
    const intensity = Math.min(1, rate * 8);
    kel.style.background = `color-mix(in srgb, var(--bad) ${Math.round(intensity * 85)}%, color-mix(in srgb, var(--ok) 22%, var(--key)))`;
    kel.title = `${h + m} vuruş · ${m} hata · %${(100 - rate * 100).toFixed(1)} doğruluk`;
  });
}
function drawLine(box, vals) {
  const W = 600, H = 220, P = 34;
  if (vals.length < 2) { box.innerHTML = `<svg viewBox="0 0 ${W} ${H}"><text class="empty" x="${W / 2}" y="${H / 2}" text-anchor="middle">Grafik için en az 2 çalışma gerekli</text></svg>`; return; }
  const max = Math.max(10, Math.ceil(Math.max(...vals) / 10) * 10);
  const x = (i) => P + (i / (vals.length - 1)) * (W - P - 10);
  const y = (v) => H - 24 - (v / max) * (H - 40);
  let grid = '';
  for (let g = 0; g <= 4; g++) { const v = max * g / 4; grid += `<line class="axis" x1="${P}" x2="${W - 10}" y1="${y(v)}" y2="${y(v)}"/><text class="lbl" x="${P - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`; }
  const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}
    <polygon class="area" points="${x(0)},${y(0)} ${pts} ${x(vals.length - 1)},${y(0)}"/>
    <polyline class="line" points="${pts}"/>
    ${vals.map((v, i) => `<circle class="dotp" cx="${x(i)}" cy="${y(v)}" r="3.5"><title>${Math.round(v)} k/dk</title></circle>`).join('')}</svg>`;
}
function drawBars(box, data, goal) {
  const W = 420, H = 220, P = 28;
  const max = Math.max(goal * 1.2, ...data.map((d) => d[1]), 1);
  const bw = (W - P - 10) / data.length;
  const y = (v) => H - 24 - (v / max) * (H - 40);
  let s = `<line class="axis" x1="${P}" x2="${W - 10}" y1="${y(goal)}" y2="${y(goal)}" stroke-dasharray="4 4"/><text class="lbl" x="${P - 6}" y="${y(goal) + 4}" text-anchor="end">${goal}</text>`;
  data.forEach(([lbl, v], i) => {
    const bx = P + i * bw + bw * 0.18, h = Math.max(2, (v / max) * (H - 40));
    s += `<rect class="bar ${v >= goal ? 'goal' : ''}" x="${bx}" y="${H - 24 - h}" width="${bw * 0.64}" height="${h}" rx="4"><title>${lbl}: ${v.toFixed(1)} dk</title></rect>`;
    if (i % 2 === 1 || data.length < 8) s += `<text class="lbl" x="${bx + bw * 0.32}" y="${H - 6}" text-anchor="middle">${lbl.split(' ')[0]}</text>`;
  });
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

/* ===========================================================
   AYARLAR
   =========================================================== */
function bindSeg(id, key, num) {
  $$(`#${id} button`).forEach((b) => b.addEventListener('click', () => { DB.settings[key] = num ? Number(b.dataset.v) : b.dataset.v; save(); applySettings(); renderSidebar(); }));
}
bindSeg('themeSeg', 'theme'); bindSeg('inputSeg', 'input'); bindSeg('fontSeg', 'font');
bindSeg('targetSeg', 'targetMul', true); bindSeg('goalSeg', 'goal', true);
[['optKeyboard', 'keyboard'], ['optHands', 'hands'], ['optHighlight', 'highlight'], ['optErrSound', 'errSound'], ['optKeySound', 'keySound']]
  .forEach(([id, key]) => $('#' + id).addEventListener('change', (e) => { DB.settings[key] = e.target.checked; save(); applySettings(); }));
$('#resetBtn').addEventListener('click', async () => {
  if (!(await confirmBox('İlerleme sıfırlansın mı?', 'Tüm ders ilerlemen, istatistiklerin ve hız testi sonuçların kalıcı olarak silinecek. Ayarların korunur.'))) return;
  DB = Object.assign(load(), { progress: {}, sessions: [], keyStats: {}, speed: [], days: {}, last: null });
  save(); renderSidebar(); toast('İlerleme sıfırlandı.');
});

/* ---------------- Başlangıç ---------------- */
buildKeyboard($('#keyboard'), KEY_EL);
buildHands();
applySettings();
renderLessons();
renderSidebar();
