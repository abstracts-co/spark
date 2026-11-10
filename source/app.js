const MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MS = MN.map((m) => m.slice(0, 3));
const TOTAL = 960;
const KINDS = ['adv', 'bkt', 'con'];
const KIND_NAME = { adv: 'Adventure', bkt: 'Bucket list', con: 'Connection' };
const STARTERS = [['con', 'Call someone you miss'], ['adv', 'Watch a sunrise somewhere new'], ['bkt', 'Book the trip you keep putting off'], ['con', 'Dinner with an old friend'], ['adv', 'A whole day outside, phone off']];
const AI_PROMPT = 'Use the Abstracts MCP server (https://abstracts.co/mcp) with my GitHub token. Read the spark skill in a/spark (get_community), then read my Spark and suggest a few sparks for this month.';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const abs = (y, m) => y * 12 + m;
const ym = (a) => `${Math.floor(a / 12)}-${String((a % 12) + 1).padStart(2, '0')}`;
const fromYm = (s) => { const m = /^(\d{4})-(\d{2})$/.exec(s ?? ''); return m && +m[2] >= 1 && +m[2] <= 12 ? abs(+m[1], +m[2] - 1) : null; };
const rid = () => Math.random().toString(36).slice(2, 10);
const today = new Date();
const NOW = { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() };
const NOWA = abs(NOW.y, NOW.m);
const STILL = document.documentElement.hasAttribute('data-still') || matchMedia('(prefers-reduced-motion:reduce)').matches;

const I = {
  adv: '<svg class="ico" viewBox="0 0 24 24"><path d="M3 19l6.500-11 4 6.500 2.500-3.500 5 8z"/><circle cx="17" cy="6" r="1.500"/></svg>',
  bkt: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 3.500l2.600 5.400 5.900.800-4.300 4.100 1 5.900L12 17l-5.200 2.700 1-5.900L3.500 9.700l5.900-.800z"/></svg>',
  con: '<svg class="ico" viewBox="0 0 24 24"><circle cx="9" cy="8.500" r="3.200"/><path d="M3 19.500c.500-3.400 2.900-5.300 6-5.300s5.500 1.900 6 5.300M16 5.600a3.200 3.200 0 010 5.800M18.200 14.700c1.500.800 2.500 2.400 2.800 4.800"/></svg>',
  check: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>',
  plus: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  x: '<svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  share: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 15V3.500M7.500 7.500L12 3l4.500 4.500M5 12.500V18a2.500 2.500 0 002.500 2.500h9A2.500 2.500 0 0019 18v-5.500"/></svg>',
  bot: '<svg class="ico" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="11" rx="3.500"/><path d="M12 8V4.500M9 13v1.500M15 13v1.500"/><circle cx="12" cy="3.500" r="1"/></svg>',
  trash: '<svg class="ico" viewBox="0 0 24 24"><path d="M4.500 7h15M9.500 7V4.500h5V7M6.500 7l.800 12.500h9.400L17.500 7M10 11v5M14 11v5"/></svg>',
  prev: '<svg class="ico" viewBox="0 0 24 24"><path d="M14.500 5.500L8 12l6.500 6.500"/></svg>',
  next: '<svg class="ico" viewBox="0 0 24 24"><path d="M9.500 5.500L16 12l-6.500 6.500"/></svg>',
  play: '<svg viewBox="0 0 16 16"><path d="M3 1.500v13l11-6.500z"/></svg>',
};

const real = (() => {
  let n = 0;
  const waiting = new Map();
  addEventListener('message', (e) => {
    if (e.source !== parent || e.data?.abstracts !== 'result') return;
    waiting.get(e.data.id)?.(e.data);
    waiting.delete(e.data.id);
  });
  return (method, params = {}) => new Promise((resolve, reject) => {
    if (parent === window) return reject(Object.assign(new Error('standalone'), { code: 'unsupported' }));
    const id = `c${++n}`;
    waiting.set(id, (r) => (r.ok ? resolve(r.value) : reject(Object.assign(new Error(r.error.message), { code: r.error.code }))));
    parent.postMessage({ abstracts: 'call', id, method, params }, '*');
  });
})();

const memory = () => {
  const docs = new Map(), files = new Map();
  let ok = /\blive\b/.test(location.hash);
  const need = () => { if (!ok) throw Object.assign(new Error('Call viewer first.'), { code: 'denied' }); };
  const m = {
    hello: () => ({ version: 1, community: 'spark', artifact: 'spark', post: null, signedIn: true, launch: Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => k.startsWith('a_')).map(([k, v]) => [k.slice(2), v])) }),
    viewer: () => { ok = true; return { username: 'you', name: 'You', avatar: null, member: 'local', profile: '' }; },
    dataGet: (p) => { need(); return { docs: Object.fromEntries((p.keys ?? [p.key]).filter((k) => docs.has(k)).map((k) => [k, structuredClone(docs.get(k))])) }; },
    dataSet: (p) => { need(); docs.set(p.key, { value: structuredClone(p.value), via: 'web', updated: Math.floor(Date.now() / 1000) }); return { updated: Math.floor(Date.now() / 1000) }; },
    dataDelete: (p) => { need(); return { deleted: docs.delete(p.key) }; },
    filePut: (p) => { need(); const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''); files.set(id, p.blob); return { id, type: p.blob.type, bytes: p.blob.size }; },
    fileUrl: (p) => { need(); return { urls: Object.fromEntries((p.ids ?? [p.id]).filter((id) => files.has(id)).map((id) => [id, URL.createObjectURL(files.get(id))])), expires: Math.floor(Date.now() / 1000) + 3600 }; },
    fileDelete: (p) => { need(); return { deleted: files.delete(p.id) }; },
    post: (p) => { window.__posted = p; return { post: { number: 1, url: 'https://abstracts.co/a/spark/p/1', key: null }, artifact: { id: 'x', url: '' } }; },
    open: (p) => { window.__opened = p.path; return null; },
    signIn: () => null,
  };
  window.__store = { docs, files };
  return async (method, params = {}) => {
    if (!m[method]) throw Object.assign(new Error('unsupported'), { code: 'unsupported' });
    return m[method](params);
  };
};

let call = real;
const hello = await (async () => {
  for (let i = 0; i < 3; i++) {
    const answer = await Promise.race([real('hello'), new Promise((r) => setTimeout(r, 500, null))]).catch(() => null);
    if (answer) return answer;
  }
  call = memory();
  return call('hello');
})();

const S = {
  live: false, who: null, born: null, sparks: [], index: {}, ideas: [], aiSeen: false,
  docs: new Map(), loading: new Set(), urls: new Map(), sel: NOWA, open: null, pick: null, up: [], kind: 'adv', pop: false, busy: false,
  pending: hello.launch?.spark ?? null,
};

const b0 = () => S.born ?? NOWA;
const idxOf = (a) => a - b0();
const curIdx = () => (S.born === null ? -1 : Math.max(0, Math.min(TOTAL - 1, idxOf(NOWA))));
const level = (a) => { const n = S.index[ym(a)]?.n ?? 0; return n >= 5 ? 'l3' : n >= 3 ? 'l2' : n ? 'l1' : ''; };
const planned = (a) => S.sparks.some((s) => s.a === a && !s.done);
const doc = (a) => S.docs.get(a);

const toast = (text) => {
  const host = $('says');
  host.replaceChildren(Object.assign(document.createElement('p'), { className: 'toast', textContent: text }));
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => host.replaceChildren(), 4500);
};
const WORDS = { signed_out: 'Sign in on Abstracts first.', rate_limited: 'Too many requests. Wait a minute.', unsupported: 'This page can’t do that yet. Reload it.' };
const say = (e, where) => { if (e?.code !== 'cancelled' && e?.code !== 'denied') toast(WORDS[e?.code] ?? e?.message ?? 'Something went wrong.', where); };

const chains = new Map();
let writing = 0;
const queue = (key, work) => {
  writing++;
  const next = (chains.get(key) ?? Promise.resolve()).catch(() => {}).then(work).finally(() => { writing--; });
  chains.set(key, next);
  return next.catch((e) => { say(e); throw e; });
};
const put = (key, value) => queue(key, () => call('dataSet', { key, value })).catch(() => {});
const saveMe = () => put('me', { v: 1, born: ym(S.born) });
const saveSparks = () => put('sparks', { v: 1, items: S.sparks.map(({ a, ...s }) => ({ ...s, m: ym(a) })) });
const saveIdeas = () => put('agent/ideas', { v: 1, items: S.ideas });
const saveMonth = (a) => {
  const d = doc(a), key = ym(a);
  const media = d.items.find((it) => it.th);
  if (d.items.length) S.index[key] = { n: d.items.length, ...(media ? { c: media.th } : {}) };
  else delete S.index[key];
  put('months', { v: 1, m: S.index });
  return d.items.length || d.shared ? put(`m/${key}`, d) : queue(`m/${key}`, () => call('dataDelete', { key: `m/${key}` })).catch(() => {});
};

const readSparks = (value) => (Array.isArray(value?.items) ? value.items : []).flatMap((s) => {
  const a = fromYm(s?.m);
  return a === null || typeof s.t !== 'string' ? [] : [{ id: String(s.id ?? rid()), k: KINDS.includes(s.k) ? s.k : 'bkt', t: s.t.slice(0, 120), a, ...(s.done ? { done: s.done } : {}), ...(s.from ? { from: String(s.from).slice(0, 40) } : {}) }];
});
const readIdeas = (value) => (Array.isArray(value?.items) ? value.items : []).flatMap((s) =>
  (typeof s?.t === 'string' && s.t.trim() ? [{ k: KINDS.includes(s.k) ? s.k : 'bkt', t: s.t.trim().slice(0, 120), ...(fromYm(s.m) !== null ? { m: s.m } : {}), ...(typeof s.note === 'string' ? { note: s.note.slice(0, 80) } : {}) }] : [])).slice(0, 12);

const load = async () => {
  const { docs } = await call('dataGet', { keys: ['me', 'sparks', 'months', 'agent/ideas'] });
  S.live = true;
  const born = fromYm(docs.me?.value?.born);
  if (born !== null) S.born = born;
  else if (S.born !== null) saveMe();
  S.sparks = readSparks(docs.sparks?.value);
  S.index = docs.months?.value?.m && typeof docs.months.value.m === 'object' ? docs.months.value.m : {};
  S.ideas = readIdeas(docs['agent/ideas']?.value);
  S.aiSeen = docs['agent/ideas']?.via === 'mcp';
  if (S.pending) takeLaunch();
};

const takeLaunch = () => {
  const [k, ...rest] = S.pending.split(':');
  const t = rest.join(':').trim().slice(0, 120);
  S.pending = null;
  if (!t || S.sparks.some((s) => s.t === t)) return;
  S.sparks.push({ id: rid(), k: KINDS.includes(k) ? k : 'bkt', t, a: NOWA, from: 'wall' });
  saveSparks();
};

const ensureLive = async () => {
  if (S.live) return true;
  try {
    if (!hello.signedIn) { await call('signIn'); return false; }
    S.who = await call('viewer');
    await load();
    renderAll();
    return true;
  } catch (e) { say(e); return false; }
};

const loadMonth = async (a) => {
  if (!S.live || doc(a) || S.loading.has(a)) return;
  if (!S.index[ym(a)]) { S.docs.set(a, { v: 1, items: [] }); return; }
  S.loading.add(a);
  try {
    const { docs } = await call('dataGet', { key: `m/${ym(a)}` });
    const value = docs[`m/${ym(a)}`]?.value;
    S.docs.set(a, { v: 1, ...(value?.shared ? { shared: value.shared } : {}), items: Array.isArray(value?.items) ? value.items.filter((it) => it && typeof it.id === 'string') : [] });
  } catch (e) { say(e); } finally { S.loading.delete(a); }
  if (S.sel === a) renderMonth();
};

const linkFor = async (ids) => {
  const now = Date.now() / 1000;
  const need = [...new Set(ids)].filter((id) => id && !(S.urls.get(id)?.exp > now + 300));
  for (let i = 0; i < need.length; i += 200) {
    const { urls, expires } = await call('fileUrl', { ids: need.slice(i, i + 200) });
    for (const [id, url] of Object.entries(urls)) S.urls.set(id, { url, exp: expires });
  }
  return (id) => S.urls.get(id)?.url ?? null;
};
const paint = async () => {
  const waiting = [...document.querySelectorAll('[data-f]:not([data-set])')];
  if (!waiting.length) return;
  try {
    const url = await linkFor(waiting.map((el) => el.dataset.f));
    for (const el of waiting) {
      const src = url(el.dataset.f);
      if (!src || !el.isConnected) continue;
      el.dataset.set = '';
      if (el.tagName === 'VIDEO' && el.dataset.poster) el.poster = url(el.dataset.poster) ?? '';
      if (el.tagName === 'IMG') el.addEventListener('load', () => el.classList.add('in'), { once: true });
      el.src = src;
    }
  } catch (e) { say(e); }
};

const grid = $('grid'), tip = $('tip');
const cols = () => (innerWidth < 480 ? 30 : innerWidth < 760 ? 40 : 48);
let shown = 0;
const renderGrid = (intro) => {
  const n = cols(), rows = TOTAL / n, start = b0(), cur = curIdx();
  shown = n;
  grid.style.setProperty('--cols', n);
  grid.classList.toggle('intro', !!intro && !STILL);
  $('ages').style.setProperty('--rows', rows);
  $('ages').innerHTML = Array.from({ length: rows }, (_, r) => `<span>${(r * n) % 120 ? '' : (r * n) / 12}</span>`).join('');
  let h = '';
  for (let i = 0; i < TOTAL; i++) {
    const a = start + i;
    const c = i < cur ? `p ${level(a)}` : i === cur ? 'p now' : `f${cur >= 0 && planned(a) ? ' pl' : ''}`;
    h += `<i class="c ${c}${cur >= 0 && a === S.sel ? ' sel' : ''}" style="--i:${i}"></i>`;
  }
  grid.innerHTML = h;
};
const refreshCell = (a) => {
  const i = idxOf(a), el = grid.children[i], cur = curIdx();
  if (!el || cur < 0) return;
  el.className = `c ${i < cur ? `p ${level(a)}` : i === cur ? 'p now' : `f${planned(a) ? ' pl' : ''}`}${a === S.sel ? ' sel' : ''}`;
};
const bump = (a) => {
  const el = grid.children[idxOf(a)];
  if (!el || STILL) return;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
};
const cellAt = (e) => {
  const r = grid.getBoundingClientRect(), rows = TOTAL / shown;
  const x = Math.min(shown - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * shown)));
  const y = Math.min(rows - 1, Math.max(0, Math.floor(((e.clientY - r.top) / r.height) * rows)));
  return y * shown + x;
};
const select = (a) => {
  if (S.born === null) return;
  a = Math.max(b0(), Math.min(b0() + TOTAL - 1, a));
  if (a === S.sel) return;
  grid.children[idxOf(S.sel)]?.classList.remove('sel');
  S.sel = a;
  S.open = null;
  S.pick = null;
  grid.children[idxOf(a)]?.classList.add('sel');
  renderMonth();
  renderAdd();
};
const hint = (i) => {
  const el = grid.children[i], g = $('gw').getBoundingClientRect(), r = el.getBoundingClientRect(), a = b0() + i;
  tip.textContent = `${MS[a % 12]} ${Math.floor(a / 12)}`;
  tip.style.left = `${Math.max(40, Math.min(g.width - 40, r.left + r.width / 2 - g.left))}px`;
  tip.style.top = `${r.top - g.top}px`;
  tip.classList.add('on');
};
let down = false;
grid.addEventListener('pointerdown', (e) => {
  if (S.born === null) return;
  down = true;
  if (e.pointerType === 'mouse') grid.setPointerCapture(e.pointerId);
  const i = cellAt(e);
  select(b0() + i);
  if (e.pointerType !== 'mouse') hint(i);
});
const up = (e) => { down = false; if (e.pointerType !== 'mouse') tip.classList.remove('on'); };
grid.addEventListener('pointerup', up);
grid.addEventListener('pointercancel', up);
grid.addEventListener('pointermove', (e) => {
  if (S.born === null || (e.pointerType !== 'mouse' && !down)) return;
  const i = cellAt(e);
  hint(i);
  if (down) select(b0() + i);
});
grid.addEventListener('pointerleave', () => tip.classList.remove('on'));
grid.addEventListener('keydown', (e) => {
  const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -shown, ArrowDown: shown }[e.key];
  if (d) { e.preventDefault(); select(S.sel + d); }
});
addEventListener('resize', () => { if (cols() !== shown) renderGrid(); });

const count = (animate) => {
  const to = S.born === null ? TOTAL : TOTAL - (curIdx() + 1), el = $('num');
  $('of').textContent = S.born === null ? '' : `${curIdx() + 1} of ${TOTAL}`;
  if (!animate || STILL) { el.textContent = to; return; }
  const t0 = performance.now();
  (function step(t) {
    const p = Math.min(1, (t - t0) / 1300), e = 1 - (1 - p) ** 3;
    el.textContent = Math.round(TOTAL - (TOTAL - to) * e);
    if (p < 1) requestAnimationFrame(step);
  })(t0);
};

const SHAPES = { 1: ['full'], 2: ['big', 'tall'], 3: ['big', '', ''], 4: ['big', 'tall', 'wide', ''], 5: ['big', '', '', 'wide', ''] };
const shapesFor = (n) => SHAPES[n] ?? Array.from({ length: n }, (_, i) => (i === 0 ? 'big' : i === n - 1 ? ['', 'full', 'wide'][(n - 3) % 3] : ''));
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const tile = (it, shape) => {
  const picked = S.pick?.has(it.id);
  return `<button class="t ${shape}${S.pick ? ` pk${picked ? ' on' : ''}` : ''}" data-${S.pick ? 'toggle' : 'open'}="${esc(it.id)}" aria-label="${it.k === 'video' ? 'Video' : 'Photo'}"${S.pick ? ` aria-pressed="${!!picked}"` : ''}>${S.pick ? `<span class="pkb">${I.check}</span>` : ''}${it.th ? `<img data-f="${esc(it.th)}" alt="">` : ''}${it.k === 'video' ? `<span class="play">${I.play}</span>${it.d ? `<span class="dur">${clock(it.d)}</span>` : ''}` : ''}</button>`;
};
const mosaic = (items, pending) => {
  const media = items.filter((it) => it.k !== 'note');
  if (!media.length && !pending.length) return `<button class="drop" id="mo" data-pick aria-label="Add photos and video">${I.plus}</button>`;
  const shapes = shapesFor(media.length + pending.length);
  let n = 0;
  const tiles = media.map((it) => tile(it, shapes[n++] ?? '')).join('');
  const waiting = pending.map((u) => `<div class="t up ${shapes[n++] ?? ''}">${u.url ? `<img class="in" src="${u.url}" alt="">` : ''}<span class="spin"></span></div>`).join('');
  return `<div class="mw"><div class="mo" id="mo">${tiles}${waiting}</div></div>`;
};
const stage = (items, it) => {
  const media = items.filter((x) => x.k !== 'note');
  const many = media.length > 1;
  const body = it.k === 'video'
    ? `<video data-f="${esc(it.f)}" ${it.th ? `data-poster="${esc(it.th)}"` : ''} controls playsinline preload="metadata"></video>`
    : `<img class="in" data-f="${esc(it.f)}" alt="">`;
  return `<div class="mw"><div class="stage" style="--ar:${it.w && it.h ? `${it.w}/${it.h}` : '1'}">${body}
    <button class="sb close" data-close aria-label="Close">${I.x}</button><button class="sb del" data-del="${esc(it.id)}" aria-label="Delete">${I.trash}</button>
    ${many ? `<button class="sb prev" data-step="-1" aria-label="Previous">${I.prev}</button><button class="sb next" data-step="1" aria-label="Next">${I.next}</button>` : ''}</div></div>`;
};

const row = (s, { bare, i } = {}) => {
  const year = Math.floor(s.a / 12);
  const when = bare || s.a === NOWA ? '' : `${MS[s.a % 12]}${year !== NOW.y ? ` ${year}` : ''}`;
  if (s.idea) {
    return `<div class="row idea ${s.k}"><span class="k">${I[s.k]}</span><div class="rt"><b>${esc(s.t)}</b>${s.note ? `<span>${esc(s.note)}</span>` : ''}</div>
      ${s.ai ? `<button class="rm" data-drop="${i}" aria-label="Dismiss">${I.x}</button>` : ''}<button class="add" data-take="${s.ai ? `ai:${i}` : `st:${i}`}" aria-label="Add">${I.plus}</button></div>`;
  }
  return `<div class="row ${s.k}${s.done ? ' done' : ''}"><span class="k">${I[s.k]}</span><div class="rt" data-go="${s.a}"><b>${esc(s.t)}</b>${when ? `<span>${when}</span>` : ''}</div>
    <button class="rm" data-rm="${esc(s.id)}" aria-label="Delete">${I.x}</button><button class="ck" data-done="${esc(s.id)}" aria-label="Done">${I.check}</button></div>`;
};

const renderMonth = () => {
  const el = $('month');
  if (S.born === null) { el.hidden = true; return; }
  el.hidden = false;
  const a = S.sel, i = idxOf(a), past = i <= curIdx(), d = doc(a);
  const mine = S.sparks.filter((s) => s.a === a);
  const pending = S.up.filter((u) => u.a === a);
  const items = d?.items ?? [];
  const has = items.length > 0 || pending.length > 0;
  let h = `<div class="mh"><div><h2>${MN[a % 12]} <span>${Math.floor(a / 12)}</span></h2><p>Month ${i + 1}</p></div><span class="grow"></span>`;
  if (S.pick) h += `<button class="ib" data-unpick aria-label="Cancel">${I.x}</button><button class="pill" data-send ${S.busy || !S.pick.size ? 'disabled' : ''}>${I.share}Share ${S.pick.size}</button>`;
  else {
    if (past && (pending.length || items.some((it) => it.k !== 'note'))) h += `<button class="ib" data-pick aria-label="Add photos and video">${I.plus}</button>`;
    if (past && items.length) h += d.shared ? `<button class="pill done" data-shared>${I.check}Shared</button>` : `<button class="pill" data-share ${S.busy ? 'disabled' : ''}>${I.share}Share</button>`;
  }
  h += '</div>';
  if (past) {
    const open = !S.pick && S.open && items.find((it) => it.id === S.open);
    if (S.live && !d) h += `<div class="mw"><div class="mo">${Array.from({ length: Math.min(S.index[ym(a)]?.n ?? 0, 6) }, (_, n) => `<div class="t ${n ? '' : 'big'}"></div>`).join('')}</div></div>`;
    else if (open) h += stage(items, open);
    else h += mosaic(items, pending);
    h += items.filter((it) => it.k === 'note').map((it) => `<p class="note">${esc(it.text)}<button class="x" data-del="${esc(it.id)}" aria-label="Delete note">${I.x}</button></p>`).join('');
    h += `<form class="new text" data-note><input placeholder="Add a note" aria-label="Add a note" maxlength="400" autocomplete="off"><button class="add" aria-label="Add">${I.plus}</button></form>`;
    const done = mine.filter((s) => s.done);
    if (done.length) h += `<div class="chips">${done.map((s) => `<span class="chip ${s.k}">${I.check}${esc(s.t)}</span>`).join('')}</div>`;
  } else {
    h += mine.map((s) => row(s, { bare: true })).join('');
  }
  el.innerHTML = h;
  if (past) loadMonth(a);
  paint();
};

const renderAdd = () => {
  const form = $('add');
  if (!form) return;
  const future = S.sel > NOWA;
  form.querySelector('.k').className = `k ${S.kind}`;
  form.querySelector('.k').innerHTML = I[S.kind];
  form.querySelector('.k').setAttribute('aria-label', KIND_NAME[S.kind]);
  form.querySelector('input').placeholder = future ? `Add a spark for ${MN[S.sel % 12]}` : 'Add a spark';
};
const renderSparks = () => {
  const el = $('sparks');
  if (S.born === null) { el.hidden = true; return; }
  el.hidden = false;
  const now = S.sparks.filter((s) => s.a <= NOWA && (!s.done || s.a === NOWA)).sort((x, y) => !!x.done - !!y.done || x.a - y.a);
  const later = S.sparks.filter((s) => s.a > NOWA).sort((x, y) => x.a - y.a);
  const dim = new Date(NOW.y, NOW.m + 1, 0).getDate(), left = dim - NOW.d, C = 2 * Math.PI * 7;
  let h = `<div class="sh"><h3>${MN[NOW.m]}</h3><span class="grow"></span>
    <svg class="ring" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,.14)"/><circle cx="9" cy="9" r="7" stroke="#ff7a3c" stroke-linecap="round" stroke-dasharray="${(C * NOW.d) / dim} ${C}"/></svg>${left} day${left === 1 ? '' : 's'} left</div>`;
  h += now.map((s) => row(s)).join('');
  h += `<form class="new" id="add"><button type="button" class="k" data-kind></button><input aria-label="Add a spark" maxlength="120" autocomplete="off"><button class="add" aria-label="Add">${I.plus}</button></form>`;
  if (later.length) h += `<div class="sh"><h3>Later</h3></div>${later.map((s) => row(s)).join('')}`;
  if (S.ideas.length) h += `<div class="sh">${I.bot}<h3>From your AI</h3></div>${S.ideas.map((s, i) => row({ ...s, idea: true, ai: true }, { i })).join('')}`;
  const starters = S.sparks.length < 3 ? STARTERS.map(([k, t], i) => ({ k, t, i })).filter((s) => !S.sparks.some((x) => x.t === s.t)) : [];
  if (starters.length) h += `<div class="sh"><h3>Ideas</h3></div>${starters.map((s) => row({ ...s, idea: true }, { i: s.i })).join('')}`;
  el.innerHTML = h;
  renderAdd();
};

const renderTop = () => {
  $('acts').innerHTML = S.live
    ? `<button class="ib" data-share-all aria-label="Share your months">${I.share}</button><button class="ib${S.aiSeen ? ' on' : ''}" data-ai aria-label="Connect your AI" aria-expanded="${S.pop}">${I.bot}</button>`
    : `<button class="pill plain" data-start>${hello.signedIn ? 'Start' : 'Sign in'}</button>`;
  $('pop').hidden = !S.pop;
};
const renderBorn = () => {
  $('born').classList.toggle('ask', S.born === null);
  $('bm').value = S.born === null ? '' : S.born % 12;
  $('by').value = S.born === null ? '' : Math.floor(S.born / 12);
};
const renderAll = (intro) => { renderTop(); renderBorn(); renderGrid(intro); count(intro); renderMonth(); renderSparks(); };

const toBlob = (canvas, type, q) => new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Couldn’t read that picture.'))), type, q));
const draw = (source, w, h, max) => {
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = Object.assign(document.createElement('canvas'), { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) });
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
};
const prepImage = async (file) => {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => { throw new Error(`Couldn’t read ${file.name || 'that picture'}. Use JPEG, PNG, WebP or GIF.`); });
  const { width: w, height: h } = bitmap;
  const full = file.type === 'image/gif' ? file : await toBlob(draw(bitmap, w, h, 2048), 'image/jpeg', 0.86);
  const thumb = await toBlob(draw(bitmap, w, h, 512), 'image/jpeg', 0.8);
  bitmap.close?.();
  return { k: 'photo', full, thumb, w, h };
};
const prepVideo = async (file) => {
  if (file.size > 50 * 1024 * 1024) throw new Error('Videos can be up to 50 MB.');
  const url = URL.createObjectURL(file);
  const video = Object.assign(document.createElement('video'), { muted: true, playsInline: true, preload: 'auto', src: url });
  try {
    const got = (name) => new Promise((resolve, reject) => { video.addEventListener(name, resolve, { once: true }); video.addEventListener('error', reject, { once: true }); setTimeout(reject, 8000); });
    await got('loadeddata');
    const d = Number.isFinite(video.duration) ? video.duration : 0;
    video.currentTime = Math.min(0.5, d / 2);
    await got('seeked');
    const thumb = await toBlob(draw(video, video.videoWidth, video.videoHeight, 512), 'image/jpeg', 0.8);
    return { k: 'video', full: file, thumb, w: video.videoWidth, h: video.videoHeight, d: Math.round(d) };
  } catch {
    return { k: 'video', full: file, thumb: null };
  } finally { video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url); }
};
const addFiles = async (list) => {
  const a = S.sel;
  const files = [...list].filter((f) => /^(image|video)\//.test(f.type) || /\.(jpe?g|png|gif|webp|mp4|mov|webm)$/i.test(f.name));
  if (!files.length || !(await ensureLive())) return;
  await loadMonth(a);
  const d = doc(a) ?? S.docs.set(a, { v: 1, items: [] }).get(a);
  const jobs = files.map((file) => ({ a, file, id: rid(), url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null }));
  S.up.push(...jobs);
  renderMonth();
  for (const job of jobs) {
    try {
      const made = await (job.file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(job.file.name) ? prepVideo(job.file) : prepImage(job.file));
      const full = await call('filePut', { blob: made.full });
      const th = made.thumb ? await call('filePut', { blob: made.thumb }) : null;
      if (th) S.urls.set(th.id, { url: URL.createObjectURL(made.thumb), exp: Infinity });
      d.items.push({ id: rid(), k: made.k, f: full.id, ...(th ? { th: th.id } : {}), ...(made.w ? { w: made.w, h: made.h } : {}), ...(made.d ? { d: made.d } : {}), at: Date.now() });
      S.up.splice(S.up.indexOf(job), 1);
      saveMonth(a);
    } catch (e) {
      S.up.splice(S.up.indexOf(job), 1);
      say(e);
    }
    if (job.url) URL.revokeObjectURL(job.url);
    if (S.sel === a) renderMonth();
    refreshCell(a);
  }
  bump(a);
  renderTop();
};
const picker = Object.assign(document.createElement('input'), { type: 'file', multiple: true, accept: 'image/*,video/*', hidden: true });
document.body.append(picker);
picker.addEventListener('change', () => { addFiles(picker.files); picker.value = ''; });

const removeItem = (a, id) => {
  const d = doc(a), at = d.items.findIndex((it) => it.id === id);
  if (at < 0) return;
  const [it] = d.items.splice(at, 1);
  for (const file of [it.f, it.th]) if (file) call('fileDelete', { id: file }).catch(() => {});
  S.open = null;
  saveMonth(a);
  refreshCell(a);
  renderMonth();
  renderTop();
};

const fetchBlob = async (id) => {
  const url = (await linkFor([id]))(id);
  const res = url ? await fetch(url) : null;
  if (!res?.ok) throw new Error('Couldn’t read a file. Try again.');
  return res.blob();
};
const working = async (work) => {
  if (S.busy) return;
  S.busy = true;
  renderMonth();
  try { return await work(); } catch (e) { say(e); } finally { S.busy = false; renderMonth(); }
};
const startShare = () => {
  const d = doc(S.sel);
  const media = d.items.filter((it) => it.k !== 'note');
  if (!media.length) return sendMonth();
  const photos = media.filter((it) => it.k === 'photo').slice(0, 4);
  S.pick = new Set((photos.length ? photos : media.slice(0, 1)).map((it) => it.id));
  S.open = null;
  renderMonth();
};
const togglePick = (id) => {
  const items = doc(S.sel).items, it = items.find((x) => x.id === id);
  if (!it) return;
  if (S.pick.has(id)) S.pick.delete(id);
  else if (it.k === 'video') S.pick = new Set([id]);
  else {
    for (const other of [...S.pick]) if (items.find((x) => x.id === other)?.k === 'video') S.pick.delete(other);
    if (S.pick.size >= 4) return toast('A post holds 4 photos, or one video.');
    S.pick.add(id);
  }
  renderMonth();
};
const sendMonth = () => working(async () => {
  const a = S.sel, d = doc(a);
  const chosen = d.items.filter((it) => S.pick?.has(it.id));
  const media = [];
  for (const it of chosen) media.push(await fetchBlob(it.f));
  const done = S.sparks.filter((s) => s.a === a && s.done).map((s) => `✓ ${s.t}`);
  const made = await call('post', { text: [`${MN[a % 12]} ${Math.floor(a / 12)} · month ${idxOf(a) + 1} of ${TOTAL}`, ...done].join('\n'), media });
  S.pick = null;
  d.shared = { url: made.post.url, at: Date.now() };
  saveMonth(a);
});
const lifePicture = async () => {
  await document.fonts.ready;
  const W = 1200, H = 1200, P = 70, N = 40, R = TOTAL / N, G = 5;
  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = canvas.getContext('2d');
  g.fillStyle = '#0c0a09';
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(140, 0, 0, 140, 0, 760);
  glow.addColorStop(0, 'rgba(255,122,60,.3)'); glow.addColorStop(1, 'rgba(255,122,60,0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);
  const cur = curIdx(), left = TOTAL - (cur + 1);
  const ember = g.createLinearGradient(0, 70, 0, 300);
  ember.addColorStop(0, '#ffc56b'); ember.addColorStop(0.6, '#ff7a3c'); ember.addColorStop(1, '#e8431f');
  g.textBaseline = 'alphabetic';
  g.font = '800 250px Figtree, system-ui, sans-serif';
  g.fillStyle = ember;
  g.fillText(String(left), P - 12, 290);
  const nw = g.measureText(String(left)).width;
  g.font = '700 44px Figtree, system-ui, sans-serif';
  g.fillStyle = '#f5f2ee';
  g.fillText('months left', P + nw + 16, 250);
  g.font = '500 28px Figtree, system-ui, sans-serif';
  g.fillStyle = '#9a938b';
  g.fillText(`${cur + 1} of ${TOTAL}`, P + nw + 18, 290);
  const cell = (W - 2 * P - (N - 1) * G) / N, top = 370;
  const fill = { l1: '#8f3f1d', l2: '#de6630', l3: '#ffa552' };
  for (let i = 0; i < TOTAL; i++) {
    const x = P + (i % N) * (cell + G), y = top + Math.floor(i / N) * (cell + G);
    g.beginPath();
    g.roundRect(x, y, cell, cell, 5);
    if (i > cur) { g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.5; g.stroke(); continue; }
    g.shadowColor = i === cur ? 'rgba(255,140,60,.95)' : 'transparent';
    g.shadowBlur = i === cur ? 22 : 0;
    g.fillStyle = i === cur ? '#fff' : fill[level(b0() + i)] ?? 'rgba(255,236,220,.17)';
    g.fill();
    g.shadowBlur = 0;
  }
  g.font = '800 34px Figtree, system-ui, sans-serif';
  g.fillStyle = '#f5f2ee';
  g.fillText('spark', P, top + R * (cell + G) + 58);
  return { blob: await toBlob(canvas, 'image/png'), left, lit: Object.keys(S.index).length };
};
const shareAll = () => working(async () => {
  const { blob, left, lit } = await lifePicture();
  await call('post', { text: `${left} months left.${lit ? ` ${lit} lit so far.` : ''}`, media: [blob] });
});

const addSpark = (k, t, a, from) => {
  const s = { id: rid(), k, t: t.trim().slice(0, 120), a, ...(from ? { from } : {}) };
  if (!s.t) return;
  S.sparks.push(s);
  saveSparks();
  renderSparks();
  refreshCell(a);
  bump(a);
  if (S.sel === a) renderMonth();
};

$('sp').addEventListener('click', async (e) => {
  const t = e.target.closest('button,[data-go]');
  if (!t) return;
  const d = t.dataset;
  if ('start' in d) { await ensureLive(); return; }
  if ('ai' in d) { S.pop = !S.pop; renderTop(); return; }
  if ('copy' in d) {
    const area = $('prompt');
    area.select();
    const done = await navigator.clipboard?.writeText(area.value).then(() => true, () => false) || document.execCommand('copy');
    if (done) { t.textContent = 'Copied'; setTimeout(() => { t.textContent = 'Copy'; }, 1200); }
    return;
  }
  if ('kind' in d) { S.kind = KINDS[(KINDS.indexOf(S.kind) + 1) % 3]; renderAdd(); return; }
  if ('go' in d) { select(+d.go); return; }
  if ('pick' in d) { if (S.live) picker.click(); else await ensureLive(); return; }
  if ('open' in d) { S.open = d.open; renderMonth(); return; }
  if ('close' in d) { S.open = null; renderMonth(); return; }
  if ('step' in d) {
    const media = doc(S.sel).items.filter((it) => it.k !== 'note');
    S.open = media[(media.findIndex((it) => it.id === S.open) + +d.step + media.length) % media.length].id;
    renderMonth();
    return;
  }
  if ('del' in d) { removeItem(S.sel, d.del); return; }
  if ('share' in d) { startShare(); return; }
  if ('unpick' in d) { S.pick = null; renderMonth(); return; }
  if ('toggle' in d) { togglePick(d.toggle); return; }
  if ('send' in d) { sendMonth(); return; }
  if ('shared' in d) { const url = doc(S.sel)?.shared?.url; if (url) call('open', { path: new URL(url).pathname }).catch(say); return; }
  if ('shareAll' in d) { shareAll(); return; }
  if ('take' in d || 'drop' in d || 'done' in d || 'rm' in d) {
    if (!(await ensureLive())) return;
    if ('take' in d) {
      const [from, i] = d.take.split(':');
      if (from === 'ai') {
        const [idea] = S.ideas.splice(+i, 1);
        if (!idea) return;
        saveIdeas();
        addSpark(idea.k, idea.t, Math.max(NOWA, fromYm(idea.m) ?? NOWA), 'ai');
      } else addSpark(STARTERS[+i][0], STARTERS[+i][1], NOWA);
    } else if ('drop' in d) {
      S.ideas.splice(+d.drop, 1);
      saveIdeas();
      renderSparks();
    } else {
      const s = S.sparks.find((x) => x.id === (d.done ?? d.rm));
      if (!s) return;
      if ('rm' in d) S.sparks.splice(S.sparks.indexOf(s), 1);
      else if (s.done) delete s.done;
      else { s.done = Date.now(); if (s.a !== NOWA) { const was = s.a; s.a = NOWA; refreshCell(was); } }
      saveSparks();
      if (s.done && !STILL) { t.closest('.row').classList.add('done'); t.classList.add('burst'); bump(s.a); await new Promise((r) => setTimeout(r, 420)); }
      renderSparks();
      refreshCell(s.a);
      if (S.sel === s.a) renderMonth();
    }
  }
});
$('sp').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = e.target.querySelector('input'), text = input.value.trim();
  if (!text) { input.focus(); return; }
  if (!(await ensureLive())) return;
  input.value = '';
  if ('note' in e.target.dataset) {
    const a = S.sel;
    await loadMonth(a);
    const d = doc(a) ?? S.docs.set(a, { v: 1, items: [] }).get(a);
    d.items.push({ id: rid(), k: 'note', text: text.slice(0, 400), at: Date.now() });
    saveMonth(a);
    refreshCell(a);
    renderMonth();
    $('month').querySelector('[data-note] input')?.focus();
  } else {
    addSpark(S.kind, text, Math.max(NOWA, S.sel));
    $('add').querySelector('input').focus();
  }
});
for (const type of ['dragover', 'dragleave', 'drop']) {
  $('month').addEventListener(type, (e) => {
    if (idxOf(S.sel) > curIdx() || !e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    $('mo')?.classList.toggle('over', type === 'dragover');
    if (type === 'drop') addFiles(e.dataTransfer.files);
  });
}

$('bm').innerHTML = `<option value="" disabled hidden>Month</option>${MS.map((m, i) => `<option value="${i}">${m}</option>`).join('')}`;
$('by').innerHTML = `<option value="" disabled hidden>Year</option>${Array.from({ length: 80 }, (_, i) => `<option>${NOW.y - i}</option>`).join('')}`;
const reborn = () => {
  if ($('bm').value === '' || $('by').value === '') return;
  S.born = Math.min(NOWA, abs(+$('by').value, +$('bm').value));
  S.sel = Math.max(S.born, Math.min(S.born + TOTAL - 1, S.sel));
  if (S.live) saveMe();
  renderAll(true);
};
$('bm').addEventListener('change', reborn);
$('by').addEventListener('change', reborn);
$('prompt').value = AI_PROMPT;

const postHeight = () => parent.postMessage({ abstractsHeight: Math.ceil(document.body.getBoundingClientRect().height) }, '*');
new ResizeObserver(postHeight).observe(document.body);

if (hello.signedIn) {
  try { await load(); } catch (e) { if (e?.code !== 'denied' && e?.code !== 'signed_out') say(e); }
}
let fresh = Date.now();
const refresh = async () => {
  if (document.hidden || !S.live || writing || S.up.length || S.busy || Date.now() - fresh < 5000 || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  fresh = Date.now();
  try {
    await load();
    for (const a of [...S.docs.keys()]) if (a !== S.sel || !S.pick) S.docs.delete(a);
    renderTop(); renderGrid(); count(); renderMonth(); renderSparks();
  } catch {}
};
document.addEventListener('visibilitychange', refresh);
addEventListener('focus', () => setTimeout(refresh, 300));
renderAll(true);
postHeight();
