/* VU Student Help Website — static version.
   Plain HTML/CSS/JS, no server. All user content is stored in this browser's
   localStorage only (key prefix "vuhelp.v1."). Community sections start empty.
   Accounts are VU Help Desk accounts created on this site (name, email and a
   password stored as a simple hash in this browser only). They are NOT VULMS
   accounts and never connect to VULMS. */
(function () {
'use strict';
var D = window.VU_DATA;
var $ = function (id) { return document.getElementById(id); };
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function fmtDate(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso || '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso || '';
  return d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
/* Date-only string in LOCAL time (yyyy-mm-dd). Never use toISOString() for
   calendar dates: it converts to UTC and shifts the day back in PKT. */
function isoDay(d) {
  var y = d.getFullYear(), m = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
  return y + '-' + m + '-' + dd;
}
function load(key, fallback) {
  try { var v = localStorage.getItem('vuhelp.v1.' + key); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function save(key, val) { try { localStorage.setItem('vuhelp.v1.' + key, JSON.stringify(val)); } catch (e) {} }
function del(key, id) { var arr = load(key, []); save(key, arr.filter(function (x) { return x.id !== id; })); render(); }

function pwHash(s) { var h = 5381; for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; } return 'h' + h.toString(36); }
var store = {
  profile: function () { return load('profile', null); },
  setProfile: function (p) { save('profile', p); render(); },
  signOut: function () { try { localStorage.removeItem('vuhelp.v1.profile'); } catch (e) {} render(); },
  accounts: function () { return load('accounts', []); },
  saveAccounts: function (a) { save('accounts', a); },
  notes: function () { return load('notes', []); },
  degreeCourses: function () { return load('degreeCourses', []); },
  degreeSettings: function () { return load('degreeSettings', { program: 'BS Computer Science', totalCredits: 132, targetCgpa: 3.0 }); },
  reviews: function () { return load('reviews', []); },
  stories: function () { return load('stories', []); },
  questions: function () { return load('questions', []); },
  drafts: function () { return load('drafts', []); },
  datesheet: function () { return load('datesheet', []); },
  centreReviews: function () { return load('centreReviews', []); },
  messages: function () { return load('messages', []); },
  routines: function () { return load('routines', []); },
  guideDone: function () { return load('guideDone', []); },
  quizAttempts: function () { return load('quizAttempts', []); },
  papers: function () { return load('papers', []); },
  deadlines: function () { return load('deadlines', []); },
  teacherRequests: function () { return load('teacherRequests', []); }
};
/* Keep the signed-in profile's role in step with the account record, so an
   Admin approval of a Teacher request takes effect without re-login. */
function syncProfileRole() {
  var p = store.profile(); if (!p || !p.accountId) return;
  var acc = null;
  store.accounts().forEach(function (a) { if (a.id === p.accountId) acc = a; });
  if (acc && acc.role && acc.role !== p.role) { p.role = acc.role; save('profile', p); }
}
function counts() {
  return {
    notes: store.notes().length, degreeCourses: store.degreeCourses().length,
    reviews: store.reviews().length, stories: store.stories().length,
    questions: store.questions().length,
    answers: store.questions().reduce(function (s, q) { return s + (q.answers || []).length; }, 0),
    drafts: store.drafts().length, datesheetItems: store.datesheet().length,
    centreReviews: store.centreReviews().length, messages: store.messages().length,
    routines: store.routines().length, quizAttempts: store.quizAttempts().length
  };
}
function degreeStats() {
  var courses = store.degreeCourses(), s = store.degreeSettings();
  var done = courses.reduce(function (a, c) { return a + (+c.creditHours || 0); }, 0);
  var pts = courses.reduce(function (a, c) { return a + (+c.creditHours || 0) * (D.GRADE_POINTS[c.grade] || 0); }, 0);
  return { courses: courses, settings: s, done: done, cgpa: done > 0 ? pts / done : 0,
    pct: s.totalCredits > 0 ? Math.min(100, Math.round(done / s.totalCredits * 100)) : 0 };
}

/* ---------- routing / shell ---------- */
var VIEWS = {
  home: 'Home', about: 'About Us', login: 'Login', contact: 'Contact Us',
  dashboard: 'My Dashboard', admin: 'Admin Panel', faq: 'FAQ — Top 50',
  notes: 'Notes & Handouts', routine: 'Study Planner', degree: 'Degree Progress',
  centres: 'Exam Centers', guide: 'Freshman Guide', reviews: 'Course Reviews',
  gdb: 'GDB Drafter', datesheet: 'Datesheet Scheduler', quiz: 'Quiz Practice',
  papers: 'Past Papers Guide', subject: 'Subject Hub',
  assignments: 'Assignments & GDB Guide',
  cgpa: 'CGPA Planner', stories: 'Stories', health: 'Health Desk', ask: 'Ask the Community',
  privacy: 'Privacy Policy', disclaimer: 'Disclaimer', terms: 'Terms & Conditions'
};
var TOOLS = [
  { n: '01', view: 'faq', title: 'FAQ — Top 50 Answers', blurb: 'The 50 questions every VU student asks, answered in one searchable place.', solves: 'No more digging through Facebook groups' },
  { n: '02', view: 'notes', title: 'Notes & Handouts Organizer', blurb: 'Save notes by course code, subject and lecture number — always findable.', solves: 'Lost notes before exams' },
  { n: '03', view: 'routine', title: 'Study Planner', blurb: 'Enter courses, free hours and deadlines — get a realistic weekly study plan.', solves: 'Falling behind on lectures' },
  { n: '04', view: 'degree', title: 'Degree Progress Dashboard', blurb: 'Log completed courses and credit hours, watch your degree fill up.', solves: 'Not knowing where you stand' },
  { n: '05', view: 'centres', title: 'Exam Center Navigator', blurb: 'City-wise campus addresses plus real student reviews of exam halls.', solves: 'Choosing a bad exam centre' },
  { n: '06', view: 'guide', title: 'Freshman Guide', blurb: 'A step-by-step roadmap from admission to your first result.', solves: 'New students feeling lost' },
  { n: '07', view: 'reviews', title: 'Course Review Portal', blurb: 'Seniors rate courses, score difficulty and leave honest advice.', solves: 'Picking the wrong electives' },
  { n: '08', view: 'gdb', title: 'GDB Drafter', blurb: 'A calm editor with live word & character counts for GDB answers.', solves: 'Rushed, messy GDB posts' },
  { n: '09', view: 'datesheet', title: 'Datesheet Scheduler', blurb: 'Place subjects on a calendar, spot clashes and heavy days early.', solves: 'Brutal back-to-back papers' },
  { n: '10', view: 'quiz', title: 'Quiz Practice Engine', blurb: 'Timed MCQ practice that feels like a real VULMS quiz.', solves: 'Quiz-day panic and slow clicking' },
  { n: '11', view: 'cgpa', title: 'CGPA Target Planner', blurb: 'See exactly what average — and how many A\u2019s — your target needs.', solves: 'CGPA confusion and guesswork' },
  { n: '12', view: 'stories', title: 'Stories & Confessions', blurb: 'Anonymous distance-learning stories: funny, honest, relatable.', solves: 'Feeling alone in online study' },
  { n: '13', view: 'health', title: 'Health Desk', blurb: 'Posture checks, eye breaks and timers for long study hours.', solves: 'Back pain and screen strain' },
  { n: '14', view: 'ask', title: 'Ask the Community', blurb: 'Post a question; students and teachers answer from experience.', solves: 'Problems nobody answers' },
  { n: '15', view: 'papers', title: 'Past Papers & Handouts Guide', blurb: 'Where the real handouts and past papers live — and a tracker for every paper you solve.', solves: 'Exam prep with no material' },
  { n: '16', view: 'assignments', title: 'Assignments & GDB Guide', blurb: 'How VU assignments and GDBs really work — format, marks, deadlines — plus your own deadline tracker.', solves: 'Missed deadlines and zero marks' }
];
var view = 'home';
var UI = {}; // per-view transient state
function go(v) { location.hash = '#/' + v; }
function currentView() {
  var h = (location.hash || '').replace(/^#\/?/, '');
  return VIEWS[h] ? h : 'home';
}
function head(kicker, title, sub) {
  return '<div class="pagehead"><p class="kicker">' + esc(kicker) + '</p><h1 class="font-display">' + esc(title) + '</h1>' +
    (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>';
}
function empty(title, body, btn) {
  return '<div class="empty"><h3 class="font-display">' + esc(title) + '</h3><p>' + esc(body) + '</p>' +
    (btn ? '<div style="margin-top:20px">' + btn + '</div>' : '') + '</div>';
}
function stat(label, value, hint) {
  return '<div class="card stat"><p class="lbl">' + esc(label) + '</p><p class="val font-display">' + esc(value) + '</p>' +
    (hint ? '<p class="hint">' + esc(hint) + '</p>' : '') + '</div>';
}
function stars(v, size) {
  var s = '';
  for (var i = 1; i <= 5; i++) s += '<span style="color:var(--amber);font-size:' + (size || 18) + 'px">' + (i <= v ? '★' : '☆') + '</span>';
  return '<span aria-label="' + v + ' out of 5 stars">' + s + '</span>';
}
function footerHtml() {
  var quick = [['subject', 'Subject Hub'], ['notes', 'Notes & Handouts'], ['routine', 'Study Planner'],
    ['quiz', 'Quiz Practice'], ['cgpa', 'CGPA Planner'], ['datesheet', 'Datesheet Scheduler'],
    ['faq', 'FAQ — Top 50'], ['centres', 'Exam Centres']].map(function (x) {
      return '<li><a href="#/' + x[0] + '">' + esc(x[1]) + '</a></li>';
    }).join('');
  return '<footer class="site"><div class="cols">' +
    '<div><h3>🎓 VU Help Desk</h3>' +
    '<p style="font-size:.9rem;color:var(--dim)">Every VU problem, one friendly home — FAQ, notes, past papers, study planner, CGPA maths and exam help for Virtual University students, free to use with no sign-in wall.</p>' +
    '<p style="font-size:.85rem;color:var(--dim);margin-top:12px">Not an official VU website. Always confirm fees, dates and rules on VULMS and vu.edu.pk. Your account and saved work live in this browser.</p></div>' +
    '<div><h3>Quick links</h3><ul>' + quick + '</ul></div>' +
    '<div><h3>Official links</h3><ul>' +
    '<li><a href="' + D.VULMS_URL + '" target="_blank" rel="noreferrer">Open VULMS ↗</a></li>' +
    '<li><a href="' + D.VU_OFFICIAL_CAMPUS_URL + '" target="_blank" rel="noreferrer">Official VU website (vu.edu.pk) ↗</a></li>' +
    '<li><a href="#/about">About this project</a></li><li><a href="#/contact">Contact us</a></li></ul>' +
    '<p style="font-size:.85rem;color:var(--dim);margin-top:12px">Ye VU Help Desk ka apna account hai. VULMS ke liye vulms.vu.edu.pk par jayein.</p></div>' +
    '<div><h3><span aria-hidden="true">❓</span> Help &amp; Support</h3><ul>' +
    '<li><a href="#/contact">Contact Us</a></li>' +
    '<li><a href="#/about">About Us</a></li>' +
    '<li><a href="#/privacy">Privacy Policy</a></li>' +
    '<li><a href="#/disclaimer">Disclaimer</a></li>' +
    '<li><a href="#/terms">Terms &amp; Conditions</a></li></ul></div></div>' +
    '<div class="foot-bottom"><span>© 2026 VU Help Desk</span><span>Made for Virtual University students</span></div></footer>';
}
/* Desktop sidebar menu (VULMS-style): one icon + one label per row, no numbers,
   no group headings. The mobile menu keeps the full grouped list (navHtml). */
function sidebarHtml() {
  var p = store.profile();
  var items = [
    ['home', '⌂', 'Home'], ['subject', '▦', 'Subjects'], ['routine', '🗓', 'Study Planner'],
    ['notes', '✎', 'Notes & Handouts'], ['quiz', '⏱', 'Quiz Practice'], ['cgpa', '▤', 'CGPA Planner'],
    ['datesheet', '▦', 'Datesheet Scheduler'], ['assignments', '✎', 'Assignments & GDB Guide'],
    ['papers', '▤', 'Past Papers'], ['faq', '?', 'FAQ'], ['centres', '⌖', 'Exam Centres'],
    [p ? 'dashboard' : 'login', '👤', p ? 'My Account' : 'Login / Sign Up']
  ];
  var h = items.map(function (x) {
    var on = view === x[0] || (x[0] === 'login' && view === 'login') || (x[0] === 'dashboard' && view === 'dashboard');
    return '<button type="button" class="nav-item' + (on ? ' active' : '') + '" data-go="' + x[0] + '"' +
      (on ? ' aria-current="page"' : '') + '><span class="ic" aria-hidden="true">' + x[1] + '</span>' + esc(x[2]) + '</button>';
  }).join('');
  if (p && p.role === 'admin') {
    h += '<button type="button" class="nav-item' + (view === 'admin' ? ' active' : '') + '" data-go="admin"><span class="ic" aria-hidden="true">⚙</span>Admin Panel</button>';
  }
  return h;
}
function navHtml() {
  var p = store.profile();
  function item(v, label) {
    return '<button type="button" class="nav-item' + (view === v ? ' active' : '') + '" data-go="' + v + '"' +
      (view === v ? ' aria-current="page"' : '') + '>' + esc(label) + '</button>';
  }
  var h = '<nav aria-label="Main navigation"><div class="nav-group"><p>Main</p>' +
    item('home', 'Home') + item('dashboard', 'My Dashboard') + item('about', 'About Us') + item('contact', 'Contact Us') + '</div>' +
    '<div class="nav-group"><p>Student tools</p>' +
    TOOLS.map(function (t) { return item(t.view, t.n + ' · ' + t.title.split('—')[0].trim()); }).join('') + '</div>' +
    '<div class="nav-group"><p>Account</p>' + item('login', p ? 'My Account · ' + p.name : 'Login / Sign Up') +
    (p && p.role === 'admin' ? item('admin', 'Admin Panel') : '') + '</div></nav>';
  return h;
}
function renderShell() {
  var isTool = TOOLS.some(function (t) { return t.view === view; });
  document.querySelectorAll('.topnav [data-nav]').forEach(function (b) {
    var n = b.getAttribute('data-nav');
    var on = (n === 'home' && view === 'home') || (n === 'subject' && view === 'subject') ||
      (n === 'tools' && isTool && view !== 'home') || (n === 'faq' && view === 'faq') ||
      (n === 'centres' && view === 'centres');
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('sideNav').innerHTML = sidebarHtml();
  $('mobileMenu').innerHTML = navHtml();
  var p = store.profile();
  $('profileBtn').innerHTML = p
    ? '<button type="button" class="btn-primary btn-sm" data-go="dashboard">' + esc(p.name.split(' ')[0]) + ' · ' + esc(p.role) + '</button>'
    : '<button type="button" class="btn-amber btn-sm" data-go="login">Login</button>';
  $('bottomNav').innerHTML = [['home', 'Home', '⌂'], ['faq', 'FAQ', '?'], ['ask', 'Ask', '✎'], ['quiz', 'Quiz', '⏱'], ['dashboard', 'Mine', '●']]
    .map(function (x) { return '<a href="#/' + x[0] + '" class="' + (view === x[0] ? 'active' : '') + '"' + (view === x[0] ? ' aria-current="page"' : '') + '><span class="ic" aria-hidden="true">' + x[2] + '</span><span>' + x[1] + '</span></a>'; }).join('');
}
function render() {
  stopTimers();
  syncProfileRole();
  view = currentView();
  renderShell();
  var fn = VIEWS_FN[view] || VIEWS_FN.home;
  var crumbs = view === 'home' ? '' : '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/home">⌂ Home</a><span class="sep" aria-hidden="true">›</span>' +
    (TOOLS.some(function (t) { return t.view === view; }) ? '<a href="#/home">Tools</a><span class="sep" aria-hidden="true">›</span>' : '') +
    '<span aria-current="page">' + esc(VIEWS[view]) + '</span></nav>';
  $('app').innerHTML = crumbs + fn() + footerHtml();
  window.scrollTo({ top: 0 });
  if (fn.onMount) fn.onMount();
}
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-go]');
  if (t) { e.preventDefault(); $('mobileMenu').hidden = true; $('menuBtn').setAttribute('aria-expanded', 'false'); $('menuBtn').innerHTML = '<span aria-hidden="true">☰</span><span class="menu-label"> Menu</span>'; go(t.getAttribute('data-go')); }
});
$('menuBtn').addEventListener('click', function () {
  var m = $('mobileMenu'); m.hidden = !m.hidden;
  $('menuBtn').setAttribute('aria-expanded', String(!m.hidden));
  $('menuBtn').innerHTML = m.hidden
    ? '<span aria-hidden="true">☰</span><span class="menu-label"> Menu</span>'
    : '<span aria-hidden="true">✕</span><span class="menu-label"> Close</span>';
});
$('themeBtn').addEventListener('click', function () {
  var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', cur);
  try { localStorage.setItem('vuhelp.theme', cur); } catch (e) {}
});
window.addEventListener('hashchange', render);

/* ---------- timers (quiz / health) ---------- */
var timers = [];
function stopTimers() { timers.forEach(function (t) { clearInterval(t); }); timers = []; }
function every(fn, ms) { var t = setInterval(fn, ms); timers.push(t); return t; }

/* ---------- Home / About / Login / Contact ---------- */
function homeView() {
  var p = store.profile(), c = counts(), ds = degreeStats();
  var cards = TOOLS.map(function (t) {
    return '<button type="button" class="card" style="padding:20px;text-align:left" data-go="' + t.view + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start"><span class="font-display" style="font-size:1.5rem;font-weight:900;color:var(--amber)">' + t.n + '</span><span class="chip">' + esc(t.solves) + '</span></div>' +
      '<h3 class="font-display" style="margin-top:8px;font-size:1.25rem">' + esc(t.title) + '</h3>' +
      '<p class="dim" style="margin-top:4px;font-size:.9rem">' + esc(t.blurb) + '</p>' +
      '<span style="display:inline-block;margin-top:12px;font-weight:700;color:var(--accent)">Open tool →</span></button>';
  }).join('');
  var glance = p
    ? '<div class="card" style="padding:20px"><p class="small" style="font-weight:600;color:var(--dim)">Degree progress</p>' +
      '<div style="display:flex;align-items:center;gap:16px;margin-top:12px"><div style="width:80px;height:80px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:conic-gradient(var(--accent) ' + (ds.pct * 3.6) + 'deg, var(--surface-2) 0deg)"><span style="width:66px;height:66px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center" class="font-display"><b>' + ds.pct + '%</b></span></div>' +
      '<p class="dim" style="font-size:.9rem">' + ds.done + ' of ' + ds.settings.totalCredits + ' credit hours in ' + esc(ds.settings.program) + '</p></div>' +
      '<button type="button" class="btn-ghost" style="width:100%;margin-top:16px" data-go="degree">Update my courses</button></div>'
    : '<div class="card" style="padding:20px"><p class="small" style="font-weight:600;color:var(--dim)">Degree progress</p>' +
      '<p class="dim" style="margin-top:8px">Create your account, add your completed courses, and this card becomes your personal degree tracker — credits, CGPA and what\u2019s left.</p>' +
      '<button type="button" class="btn-ghost" style="width:100%;margin-top:16px" data-go="degree">Set up my degree</button></div>';
  return '<section style="max-width:44rem"><div>' +
    '<span class="chip chip-amber">Free to use · No sign-in wall</span>' +
    '<h1 class="font-display" style="margin-top:16px;font-size:clamp(1.9rem,7vw,2.5rem);line-height:1.15;font-weight:900">Every VU problem,<br><span style="color:var(--accent)">one friendly home.</span></h1>' +
    '<p class="dim" style="margin-top:16px;max-width:32rem;font-size:1.1rem">Deadlines, GDBs, datesheets, CGPA maths, exam centres — the things that stress every Virtual University student, solved with 16 working tools in one place. No Facebook-group archaeology required.</p>' +
    '<form id="homeSubjectForm" style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap" role="search" aria-label="Find a subject"><label class="sr-only" for="homeSubjectInput">Find a subject</label><input id="homeSubjectInput" class="field" style="flex:1;min-width:220px;font-size:1.05rem" placeholder="Apna subject code likhein — jaise CS101" autocomplete="off"><button type="submit" class="btn-primary">Open subject →</button></form>' +
    '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px" aria-label="Popular subjects">' + ['CS101', 'MTH101', 'ENG101', 'MGT101', 'STA301', 'CS201'].map(function (c) { return '<button type="button" class="chip" data-subject="' + c + '" style="font-weight:700">' + c + '</button>'; }).join('') + '</div>' +
    '<div style="margin-top:28px;display:flex;flex-wrap:wrap;gap:12px">' +
    '<button type="button" class="btn-primary" data-go="' + (p ? 'dashboard' : 'login') + '">' + (p ? 'Open my dashboard' : 'Get started — it\u2019s free') + '</button>' +
    '<button type="button" class="btn-ghost" data-go="guide">I\u2019m new — show me the guide</button></div>' +
    (p ? '<p style="margin-top:16px;font-size:.9rem;font-weight:600;color:var(--accent)">Welcome back, ' + esc(p.name) + ' (' + esc(p.role) + ')</p>' : '') +
    '</div></section>' +
    '<section class="mt3"><div class="card" style="padding:24px;background:var(--accent-soft)"><h2 class="font-display" style="font-size:1.25rem">Start here in 2 minutes — no account needed</h2><div class="grid sm2 lg3 mt" style="gap:16px">' +
    '<div><p class="font-display" style="font-weight:900;font-size:1.5rem;color:var(--accent)">1</p><p style="margin-top:4px"><strong>Search your subject</strong> in the box above — type CS101 and press Enter.</p></div>' +
    '<div><p class="font-display" style="font-weight:900;font-size:1.5rem;color:var(--accent)">2</p><p style="margin-top:4px"><strong>Open its Subject Hub</strong> — key points, important topics, quiz and your notes, all on one page.</p></div>' +
    '<div><p class="font-display" style="font-weight:900;font-size:1.5rem;color:var(--accent)">3</p><p style="margin-top:4px"><strong>Try one thing now</strong> — a 30-second quiz, a saved note, or a deadline in the tracker. That is the whole site, in three taps.</p></div></div></div></section>' +
    '<section class="mt3"><h2 class="font-display" style="font-size:1.5rem">' + (p ? 'Your semester at a glance' : 'Inside the hub right now') + '</h2>' +
    '<div class="grid sm2 lg4 mt" style="gap:16px">' + glance +
    stat('Notes saved', String(c.notes), 'Organised by course & lecture') +
    stat('Exams planned', String(c.datesheetItems), 'On your test datesheet') +
    stat('Questions answered', String(c.answers), 'By the community so far') + '</div></section>' +
    '<section class="mt3"><div class="card" style="padding:20px 24px;background:var(--amber-soft);display:flex;gap:16px;flex-wrap:wrap;align-items:center;justify-content:space-between"><div style="flex:1;min-width:220px"><h3 class="font-display" style="font-size:1.25rem">Tip of the day</h3><p style="margin-top:4px">Submit assignments 24 hours early — last-hour uploads are the #1 cause of lost marks.</p></div><button type="button" class="btn-amber" style="flex-shrink:0" data-go="guide">Open the guide →</button></div></section>' +
    '<section class="mt3"><h2 class="font-display" style="font-size:1.5rem">Everything, in one index</h2><p class="dim" style="margin-top:4px">16 tools, each built for one real problem. Tap any card to start.</p>' +
    '<div class="grid sm2 lg3 mt" style="gap:16px">' + cards + '</div></section>' +
    '<section class="mt3 grid lg3" style="gap:16px">' +
    [['1 · Create your account', 'Sign up in seconds — name, email and password — and your notes, routine and degree stay saved in this browser, on your own dashboard.'],
     ['2 · Use the tools daily', 'Save notes, draft GDBs, plan your datesheet and routine. Everything you add is stored in this browser and waiting next visit.'],
     ['3 · Help the next student', 'Leave a course review, answer a question, review your exam centre. The community gets smarter with every post.']]
    .map(function (s) { return '<div style="background:var(--accent-soft);border-radius:var(--radius);padding:24px"><p class="font-display" style="font-size:1.1rem;font-weight:700;color:var(--accent)">' + s[0] + '</p><p style="margin-top:8px">' + s[1] + '</p></div>'; }).join('') + '</section>';
}
homeView.onMount = function () {
  var f = $('homeSubjectForm');
  function openSubject(code) {
    code = (code || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!code) return;
    UI.subjectCode = code;
    go('subject');
  }
  if (f) f.addEventListener('submit', function (e) { e.preventDefault(); openSubject($('homeSubjectInput').value); });
  document.querySelectorAll('[data-subject]').forEach(function (b) {
    b.addEventListener('click', function () { openSubject(b.getAttribute('data-subject')); });
  });
};
function aboutView() {
  return '<div style="max-width:48rem;margin:0 auto">' + head('About us', 'Built for the way VU students actually struggle', 'Virtual University is Pakistan\u2019s pioneering online university — but studying alone from home brings its own problems. This site exists to solve them, one tool at a time.') +
    '<div style="display:grid;gap:20px;line-height:1.7"><p>Most VU help lives in scattered Facebook groups, WhatsApp forwards and seniors\u2019 memories. Answers get buried, deadlines get missed, and new students repeat the same mistakes every semester. We gathered the problems students report most — VULMS confusion, missed assignments, CGPA guesswork, datesheet stress, bad exam-centre experiences, and the loneliness of distance learning — and built a working tool for each one.</p>' +
    '<h2 class="font-display" style="font-size:1.5rem">What makes this different</h2><ul style="list-style:disc;padding-left:24px;display:grid;gap:8px">' +
    '<li><strong>It works, not just informs.</strong> Calculators calculate, planners plan, drafts save, timers run — every page does the job it promises.</li>' +
    '<li><strong>Students add the knowledge.</strong> Notes, course reviews, exam-centre reviews, stories and answers all come from the community and stay saved in this browser.</li>' +
    '<li><strong>Three roles, three dashboards.</strong> Students track their degree, teachers answer questions and guide juniors, admins keep the community clean from a proper admin panel.</li>' +
    '<li><strong>Friendly on any screen.</strong> Big buttons, warm colours and plain language — designed for a new student on a phone with shaky internet.</li></ul>' +
    '<h2 class="font-display" style="font-size:1.5rem">A note on accuracy</h2><p>Rules, fees and dates change. Our FAQ and grade tables follow VU\u2019s published academic regulations, and we link to the official campus directory and VULMS where it matters — always confirm time-sensitive details there. This is a student help project, not an official VU website.</p></div>' +
    '<div style="margin-top:32px;display:flex;flex-wrap:wrap;gap:12px"><button type="button" class="btn-primary" data-go="guide">Start with the Freshman Guide</button><button type="button" class="btn-ghost" data-go="contact">Contact the team</button></div></div>';
}
function loginView() {
  var p = store.profile();
  UI.login = UI.login || { mode: p ? 'account' : 'signup', name: p ? p.name : '', email: p ? p.email : '', password: '', role: p ? p.role : 'student', program: p ? p.program : D.PROGRAMS[0], error: '', ok: '' };
  var u = UI.login;
  if (p) {
    return '<div style="max-width:36rem;margin:0 auto">' + head('My account', 'Welcome back, ' + p.name.split(' ')[0] + '!', 'You are signed in to your VU Help Desk account as ' + p.role + '. Your notes, routine, degree and drafts are saved in this browser.') +
      '<div class="card" style="padding:24px;display:grid;gap:16px"><p><strong>' + esc(p.name) + '</strong><br><span class="dim">' + esc(p.email || 'No email saved') + ' · ' + esc(p.role) + (p.program ? ' · ' + esc(p.program) : '') + '</span></p>' +
      '<p class="dim small">Ye VU Help Desk ka apna account hai. VULMS ke liye vulms.vu.edu.pk par jayein.</p>' +
      '<button type="button" class="btn-primary" style="width:100%" data-go="dashboard">Open my dashboard</button>' +
      '<button type="button" class="btn-ghost" style="width:100%" id="signOutBtn">Log out (' + esc(p.name) + ')</button></div></div>';
  }
  var isSignup = u.mode === 'signup';
  return '<div style="max-width:36rem;margin:0 auto">' + head('Login', isSignup ? 'Create your free account' : 'Welcome back', isSignup ? 'Your account saves your notes, study planner, degree progress and GDB drafts — in this browser, on your own dashboard.' : 'Sign in to your VU Help Desk account to open your dashboard.') +
    '<div class="note-ok mb" role="note">Ye VU Help Desk ka apna account hai. VULMS ke liye vulms.vu.edu.pk par jayein.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:16px" role="tablist" aria-label="Login or sign up">' +
    '<button type="button" role="tab" aria-selected="' + isSignup + '" data-loginmode="signup" class="btn-ghost" style="flex:1;' + (isSignup ? 'background:var(--accent);color:var(--accent-ink);border-color:var(--accent)' : '') + '">Sign Up — new account</button>' +
    '<button type="button" role="tab" aria-selected="' + (!isSignup) + '" data-loginmode="login" class="btn-ghost" style="flex:1;' + (!isSignup ? 'background:var(--accent);color:var(--accent-ink);border-color:var(--accent)' : '') + '">Login — I have an account</button></div>' +
    '<form class="card" style="padding:24px;display:grid;gap:20px" id="loginForm">' +
    (isSignup ? '<div><label class="field-label" for="login-name">Your name</label><input id="login-name" class="field" value="' + esc(u.name) + '" placeholder="e.g. Ayesha Khan" required></div>' : '') +
    '<div><label class="field-label" for="login-email">Email</label><input id="login-email" type="email" class="field" value="' + esc(u.email) + '" placeholder="you@example.com" required></div>' +
    '<div><label class="field-label" for="login-password">Password' + (isSignup ? ' (at least 6 characters)' : '') + '</label><input id="login-password" type="password" class="field" value="' + esc(u.password) + '" placeholder="••••••••" autocomplete="' + (isSignup ? 'new-password' : 'current-password') + '" required></div>' +
    (isSignup ? '<p class="dim small" style="background:var(--surface-2);border-radius:12px;padding:12px 16px">New accounts start as <strong>Student</strong>. Teacher access is approved by the site owner.</p>' : '') +
    (isSignup ? '<div><label class="field-label" for="login-program">Study program</label><select id="login-program" class="field">' + D.PROGRAMS.map(function (pr) { return '<option' + (u.program === pr ? ' selected' : '') + '>' + esc(pr) + '</option>'; }).join('') + '</select></div>' : '') +
    (u.error ? '<div class="note-bad" role="alert">' + esc(u.error) + '</div>' : '') +
    (u.ok ? '<div class="note-ok" role="status">' + esc(u.ok) + '</div>' : '') +
    '<button type="submit" class="btn-primary" style="width:100%">' + (isSignup ? 'Create my account & open dashboard' : 'Log in & open my dashboard') + '</button>' +
    '<p class="dim small">Your password is stored as a simple hash in this browser only — never share your VULMS password here, or anywhere else.</p>' +
    '</form></div>';
}
loginView.onMount = function () {
  var so = $('signOutBtn');
  if (so) { so.addEventListener('click', function () { store.signOut(); go('home'); }); return; }
  var f = $('loginForm'); if (!f) return;
  function sync() {
    UI.login.email = $('login-email') ? $('login-email').value : UI.login.email;
    UI.login.password = $('login-password') ? $('login-password').value : UI.login.password;
    UI.login.name = $('login-name') ? $('login-name').value : UI.login.name;
    if ($('login-program')) UI.login.program = $('login-program').value;
  }
  document.querySelectorAll('[data-loginmode]').forEach(function (b) {
    b.addEventListener('click', function () { sync(); UI.login.mode = b.getAttribute('data-loginmode'); UI.login.error = ''; render(); });
  });
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    sync();
    var u = UI.login, email = u.email.trim().toLowerCase();
    if (!email || email.indexOf('@') === -1) { u.error = 'Please enter a valid email address.'; render(); return; }
    if (!u.password || u.password.length < 6) { u.error = 'Password must be at least 6 characters.'; render(); return; }
    var accounts = store.accounts();
    if (u.mode === 'signup') {
      if (!u.name.trim()) { u.error = 'Please enter your name.'; render(); return; }
      if (accounts.some(function (a) { return a.email === email; })) { u.error = 'An account with this email already exists — switch to Login instead.'; render(); return; }
      /* Roles are never picked on Sign Up: every new account is a Student,
         except the first account while the site has no Admin yet — that
         account becomes the Admin (the site owner). */
      var hasAdmin = accounts.some(function (a) { return a.role === 'admin'; });
      var role = hasAdmin ? 'student' : 'admin';
      var acc = { id: uid(), name: u.name.trim(), email: email, passHash: pwHash(u.password), role: role, program: u.program, createdAt: new Date().toISOString() };
      accounts.push(acc); store.saveAccounts(accounts);
      UI.login.password = ''; UI.login.error = ''; UI.login.ok = '';
      store.setProfile({ accountId: acc.id, name: acc.name, email: acc.email, role: acc.role, program: acc.program });
      go('dashboard');
    } else {
      var found = null;
      accounts.forEach(function (a) { if (a.email === email) found = a; });
      if (!found) { u.error = 'No account with this email — create one with Sign Up.'; render(); return; }
      if (found.passHash !== pwHash(u.password)) { u.error = 'Wrong password — please try again.'; render(); return; }
      UI.login.password = ''; UI.login.error = ''; UI.login.ok = '';
      store.setProfile({ accountId: found.id, name: found.name, email: found.email, role: found.role, program: found.program });
      go('dashboard');
    }
  });
};
function contactView() {
  var p = store.profile();
  return '<div style="max-width:42rem;margin:0 auto">' + head('Contact us', 'Talk to the team', 'Found a wrong answer, a broken tool, or have an idea that would help VU students? Send it here — messages land in the admin inbox.') +
    '<form class="card" style="padding:24px;display:grid;gap:20px" id="contactForm">' +
    '<div class="grid sm2" style="gap:20px"><div><label class="field-label" for="c-name">Your name</label><input id="c-name" class="field" value="' + esc(p ? p.name : '') + '" required></div>' +
    '<div><label class="field-label" for="c-email">Email</label><input id="c-email" type="email" class="field" value="' + esc(p ? p.email : '') + '" placeholder="So we can reply"></div></div>' +
    '<div><label class="field-label" for="c-topic">Topic</label><select id="c-topic" class="field">' + ['General', 'Report a wrong answer', 'Tool not working', 'Suggest a feature', 'Exam centre info', 'Other'].map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select></div>' +
    '<div><label class="field-label" for="c-msg">Message</label><textarea id="c-msg" class="field" required placeholder="Write your message…"></textarea></div>' +
    '<div id="contactMsg"></div><button type="submit" class="btn-primary" style="width:100%">Send message</button></form>' +
    '<div class="card mt" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">For official VU matters</h2><p class="dim" style="margin-top:8px">Fees, admissions, exam and account issues can only be resolved by the university itself — use the support system inside <a href="https://vulms.vu.edu.pk" target="_blank" rel="noreferrer"><b>VULMS</b></a> or visit your nearest campus. This site\u2019s team can only help with this website.</p></div></div>';
}
contactView.onMount = function () {
  var f = $('contactForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('c-name').value.trim(), msg = $('c-msg').value.trim();
    if (!name || !msg) return;
    var arr = store.messages();
    arr.unshift({ id: uid(), name: name, email: $('c-email').value.trim(), topic: $('c-topic').value, message: msg, createdAt: new Date().toISOString(), status: 'new' });
    save('messages', arr);
    $('c-msg').value = '';
    $('contactMsg').innerHTML = '<div class="note-ok" role="status">Message sent! The admin team can read it in the Admin Panel inbox.</div>';
  });
};

/* ---------- Privacy, Disclaimer & Terms (original text written for this site) ---------- */
function legalPage(kicker, title, intro, sections) {
  return '<div style="max-width:48rem;margin:0 auto">' + head(kicker, title, intro) +
    '<div style="display:grid;gap:20px;line-height:1.7">' +
    sections.map(function (s) {
      return '<section><h2 class="font-display" style="font-size:1.25rem">' + esc(s[0]) + '</h2><p style="margin-top:6px">' + esc(s[1]) + '</p></section>';
    }).join('') + '</div>' +
    '<p class="dim small" style="margin-top:24px">Last updated: November 2026.</p>' +
    '<div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px"><button type="button" class="btn-primary" data-go="contact">Contact us</button><button type="button" class="btn-ghost" data-go="home">Back to home</button></div></div>';
}
function privacyView() {
  return legalPage('Privacy Policy', 'Your privacy on VU Help Desk', 'This is an independent, student-made help site. It is not affiliated with Virtual University, and it never connects to VULMS.', [
    ['What we save', 'Only what you add yourself: your account details (name, email, role and program), and the things you create on the site — notes, study routines, degree courses, GDB drafts, datesheet entries, solved papers, deadlines, reviews, stories and questions. On this website your data is saved in your own browser (localStorage), on your own device. It is not sent to any server and not shared with anyone.'],
    ['Your account', 'A VU Help Desk account is an account for this site only. It is created with a name, email and password, and the password is stored as a simple hash in this browser, never as plain text. It is not a VULMS account and it cannot open VULMS.'],
    ['What we never ask for', 'We never ask for your VULMS student ID or password, your VU fee details, or anyone else\u2019s personal information. Never type a VULMS password into this site — or into any site that is not vulms.vu.edu.pk.'],
    ['Deleting your data', 'Because your data lives in your browser, clearing this site\u2019s browser data (or logging out and removing it) removes it. If you use the site on a shared computer, log out when you finish.'],
    ['Questions', 'If you have a privacy question or want something you posted removed, send a message through the Contact Us page and the admin team will help.']
  ]);
}
function disclaimerView() {
  return legalPage('Disclaimer', 'Please read before you rely on this site', 'Everything here is a study aid written to help students. It is not official Virtual University material.', [
    ['Not official VU material', 'VU Help Desk is an independent student project and is not affiliated with, endorsed by, or connected to Virtual University. The quiz questions, study guides, key points and sample answers on this site are written for practice. They are not VU handouts, not past papers from the university, and not a promise of what will appear in your exam.'],
    ['Always verify the important things', 'Dates, deadlines, fees, grading rules, exam centres and results change. Always confirm time-sensitive details on VULMS (vulms.vu.edu.pk) or the official VU website (vu.edu.pk) before you act on them. If this site and VULMS disagree, VULMS is right.'],
    ['CGPA and grade maths', 'The CGPA, pass/fail and final-marks tools use the standard VU grade scale and the published 20% / 20% / 40% passing rules. VU applies relative grading, so treat every result as a guide, not a guarantee of your final grade.'],
    ['Exam centres', 'Exam-centre addresses can change, and some addresses on this site are still marked as needing confirmation. Always verify your centre on the official VU campus list before travelling on exam day.'],
    ['Your responsibility', 'Use the site\u2019s guidance in your own words. Copying answers into assignments or GDBs can cost you marks — the tools here are designed to help you write your own work.']
  ]);
}
function termsView() {
  return legalPage('Terms & Conditions', 'The rules for using VU Help Desk', 'By using this site you agree to these simple terms. They exist so the site stays useful and honest for every VU student.', [
    ['Use it for study', 'This site is a free study-help tool for Virtual University students. Use the tools, save your notes, plan your semester and help other students — that is what it is for.'],
    ['Post only your own words', 'Reviews, stories, questions, answers, notes and GDB drafts must be your own work. Do not post copied assignments or GDB answers, bought "solved" packs, or anyone else\u2019s work. Do not post fake reviews, fake stories, or personal information about other people.'],
    ['Be respectful', 'No abusive language, no spam, and no content that harasses another student or teacher. The admin team may remove content that breaks these rules, and may remove accounts that keep breaking them.'],
    ['No VULMS passwords, ever', 'Do not share your VULMS password — or anyone else\u2019s — on this site. This site never needs it, and anyone asking for it here is not part of the site.'],
    ['Content is provided as-is', 'Guides, quizzes, calculators and community posts are provided as study help, without any guarantee that they are complete or up to date. The site may change, and tools may be added or removed.'],
    ['Changes to these terms', 'If these terms change, the updated version will appear on this page. Continued use of the site after a change means you accept the new terms.']
  ]);
}

/* ---------- Dashboards ---------- */
/* Teacher access is earned, not picked: a Student asks the Admin from their
   dashboard; the Admin approves or rejects it in the Admin Panel. */
function teacherRequestHtml(p) {
  var reqs = store.teacherRequests().filter(function (r) { return r.accountId === p.accountId; });
  var pending = reqs.filter(function (r) { return r.status === 'pending'; })[0];
  var rejected = reqs.filter(function (r) { return r.status === 'rejected'; })[0];
  if (pending) {
    return '<div class="card mt" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Teacher access — request pending</h2>' +
      '<p class="dim" style="margin-top:8px">Your request is with the Admin: “' + esc(pending.reason) + '” — sent ' + fmtDate(pending.createdAt) + '. You will see the teacher dashboard here once it is approved.</p></div>';
  }
  return '<div class="card mt" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Become a Teacher on this site</h2>' +
    '<p class="dim" style="margin-top:8px">Teachers answer community questions and guide juniors. Tell the Admin why you should have teacher access — they approve or reject it in the Admin Panel.</p>' +
    (rejected ? '<p class="note-warn mt" role="note">Your last request was not approved. You can send a new one with more detail.</p>' : '') +
    '<form id="teacherReqForm" style="margin-top:16px;display:grid;gap:12px"><label class="field-label" for="teacherReqReason">Why should you be a Teacher here?</label>' +
    '<textarea id="teacherReqReason" class="field" required placeholder="e.g. I am a senior BS CS student and I answer questions in our study group every week…"></textarea>' +
    '<div id="teacherReqMsg"></div><button type="submit" class="btn-primary" style="justify-self:start">Request Teacher access</button></form></div>';
}
dashboardView.onMount = function () {
  var f = $('teacherReqForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = store.profile(); if (!p) return;
    var reason = $('teacherReqReason').value.trim(); if (!reason) return;
    var reqs = store.teacherRequests();
    if (reqs.some(function (r) { return r.accountId === p.accountId && r.status === 'pending'; })) { render(); return; }
    reqs.unshift({ id: uid(), accountId: p.accountId, name: p.name, email: p.email, reason: reason, status: 'pending', createdAt: new Date().toISOString() });
    save('teacherRequests', reqs);
    render();
  });
};
function dashboardView() {
  var p = store.profile();
  if (!p) return '<div style="max-width:36rem;margin:0 auto">' + empty('Create your account to see your dashboard', 'Your dashboard pulls together your degree progress, saved notes, planned exams and community activity. It takes ten seconds to set up.', '<button type="button" class="btn-primary" data-go="login">Create my account</button>') + '</div>';
  var c = counts(), ds = degreeStats();
  var qs = store.questions();
  var unanswered = qs.filter(function (q) { return !(q.answers && q.answers.length); });
  var today = isoDay(new Date());
  var upcoming = store.datesheet().filter(function (i) { return i.examDate >= today; }).sort(function (a, b) { return a.examDate < b.examDate ? -1 : 1; }).slice(0, 3);
  var headHtml = head(p.role + ' dashboard', 'Assalam-o-Alaikum, ' + p.name.split(' ')[0] + '!',
    p.role === 'student' ? 'Here\u2019s your ' + (p.program || 'degree') + ' journey at a glance.'
    : p.role === 'teacher' ? 'Students are waiting for guidance — here is where you\u2019re needed most.'
    : 'Site health, community content and the moderation queue.') +
    '<div class="note-ok mb" role="note">👤 Signed in as ' + esc(p.name) + ' (' + esc(p.role) + ') — your VU Help Desk account. For VULMS, visit vulms.vu.edu.pk.</div>';
  if (p.role === 'student') {
    return headHtml +
      '<div class="grid sm2 lg4" style="gap:16px">' +
      stat('Degree complete', ds.pct + '%', ds.done + '/' + ds.settings.totalCredits + ' credit hours') +
      stat('Notes saved', String(c.notes), '') + stat('GDB drafts', String(c.drafts), '') +
      stat('Quiz attempts', String(c.quizAttempts), '') + '</div>' +
      '<div class="grid lg2 mt" style="gap:16px"><div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Coming up on your datesheet</h2>' +
      (upcoming.length === 0 ? '<p class="dim" style="margin-top:8px">No upcoming exams planned yet. Build your test datesheet so there are no surprises in finals week.</p>'
        : '<ul class="mt" style="display:grid;gap:8px">' + upcoming.map(function (i) { return '<li style="display:flex;justify-content:space-between;gap:8px;background:var(--surface-2);border-radius:12px;padding:12px 16px"><span><b>' + esc(i.courseCode) + '</b> <span class="dim">' + esc(i.courseName || '') + '</span></span><span class="chip">' + esc(i.examDate) + ' · ' + esc(i.session) + '</span></li>'; }).join('') + '</ul>') +
      '<button type="button" class="btn-primary mt" data-go="datesheet">Open Datesheet Scheduler</button></div>' +
      '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Quick actions</h2><div class="grid g2 mt" style="gap:8px">' +
      [['notes', 'Add a note'], ['gdb', 'Draft a GDB'], ['routine', 'Plan my week'], ['cgpa', 'Check CGPA target'], ['quiz', 'Practice a quiz'], ['ask', 'Ask a question']].map(function (x) { return '<button type="button" class="btn-ghost" data-go="' + x[0] + '">' + x[1] + '</button>'; }).join('') +
      '</div><p class="dim small" style="margin-top:16px">Tip: students who log courses in the Degree Dashboard and plan the week every Sunday rarely miss a deadline.</p></div></div>' +
      teacherRequestHtml(p);
  }
  if (p.role === 'teacher') {
    return headHtml +
      '<div class="grid sm2 lg4" style="gap:16px">' +
      stat('Questions waiting', String(unanswered.length), 'With no answer yet') +
      stat('Answers given', String(c.answers), '') + stat('Course reviews live', String(c.reviews), '') +
      stat('Stories published', String(c.stories), '') + '</div>' +
      '<div class="card mt" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Unanswered questions</h2>' +
      (unanswered.length === 0 ? '<p class="dim" style="margin-top:8px">All caught up — every question has at least one answer. 🎉</p>'
        : '<ul class="mt" style="display:grid;gap:8px">' + unanswered.slice(0, 5).map(function (q) { return '<li style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;background:var(--surface-2);border-radius:12px;padding:12px 16px"><span style="font-weight:600">' + esc(q.title) + '</span><span class="chip chip-amber">' + esc(q.category) + '</span></li>'; }).join('') + '</ul>') +
      '<div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:12px"><button type="button" class="btn-primary" data-go="ask">Answer questions</button><button type="button" class="btn-ghost" data-go="reviews">Write course advice</button></div></div>';
  }
  return headHtml +
    '<div class="grid sm2 lg4" style="gap:16px">' +
    stat('Inbox messages', String(c.messages), '') + stat('Questions', String(c.questions), '') +
    stat('Reviews to watch', String(c.reviews + c.centreReviews), 'Course + centre reviews') +
    stat('Stories live', String(c.stories), '') + '</div>' +
    '<div class="card mt" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Moderation & management</h2><p class="dim" style="margin-top:8px">Read contact messages, and approve, reject or remove any review, story or question that breaks community rules — all from the Admin Panel.</p>' +
    '<button type="button" class="btn-amber mt" data-go="admin">Open Admin Panel</button></div>';
}

/* ---------- Admin panel ---------- */
var ADMIN_TABS = [['messages', 'Inbox'], ['reviews', 'Course reviews'], ['stories', 'Stories'], ['questions', 'Questions'], ['centres', 'Centre reviews'], ['teachers', 'Teacher requests']];
function adminView() {
  var p = store.profile();
  if (!p || p.role !== 'admin') {
    return '<div style="max-width:36rem;margin:0 auto">' + empty('Admin access only', 'The Admin Panel is only for the site owner — the first account created on this site. Sign in with the admin account to manage messages and moderate community content.', '<button type="button" class="btn-primary" data-go="login">Sign in with the admin account</button>') + '</div>';
  }
  UI.adminTab = UI.adminTab || 'messages';
  var c = counts();
  var tab = UI.adminTab;
  var tabsHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px" role="tablist" aria-label="Admin sections">' +
    ADMIN_TABS.map(function (t) {
      var n = { messages: c.messages, reviews: c.reviews, stories: c.stories, questions: c.questions, centres: c.centreReviews, teachers: store.teacherRequests().filter(function (r) { return r.status === 'pending'; }).length }[t[0]];
      return '<button type="button" role="tab" aria-selected="' + (tab === t[0]) + '" class="btn-ghost" data-admintab="' + t[0] + '"' +
        (tab === t[0] ? ' style="background:var(--accent);color:var(--accent-ink);border-color:var(--accent)"' : '') + '>' + t[1] + ' (' + n + ')</button>';
    }).join('') + '</div>';
  function modButtons(kind, id, status) {
    var h = '';
    if (status === 'rejected') h += '<button type="button" class="btn-ghost btn-sm" data-approve="' + kind + ':' + id + '">Approve</button> ';
    else h += '<button type="button" class="btn-ghost btn-sm" data-reject="' + kind + ':' + id + '">Reject</button> ';
    h += '<button type="button" class="btn-danger" data-del="' + kind + ':' + id + '">Delete</button>';
    return h;
  }
  function statusChip(s) { return s === 'rejected' ? '<span class="chip" style="background:var(--coral-soft);color:var(--coral)">Rejected — hidden</span>' : '<span class="chip">Live</span>'; }
  var body = '';
  if (tab === 'messages') {
    var msgs = store.messages();
    body = msgs.length === 0 ? empty('Inbox zero', 'No contact messages yet. Messages sent from the Contact Us page will appear here.')
      : msgs.map(function (m) { return '<article class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p><b>' + esc(m.name) + '</b> <span class="dim">' + esc(m.email) + '</span></p><span class="chip">' + esc(m.topic) + '</span></div><p style="margin-top:8px">' + esc(m.message) + '</p><div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center"><span class="dim small">' + fmtDateTime(m.createdAt) + '</span><button type="button" class="btn-danger" data-del="messages:' + m.id + '">Delete</button></div></article>'; }).join('');
  } else if (tab === 'reviews') {
    var revs = store.reviews();
    body = revs.length === 0 ? empty('No course reviews', 'Reviews students add in the Course Review Portal will appear here for moderation.')
      : revs.map(function (r) { return '<article class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p><b>' + esc(r.courseCode) + ' — ' + esc(r.courseName) + '</b></p><span class="chip">' + r.rating + '/5 · difficulty ' + r.difficulty + '/5</span></div><p style="margin-top:8px">' + esc(r.advice) + '</p><div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span class="dim small">by ' + esc(r.author) + ' (' + esc(r.authorRole) + ') ' + statusChip(r.status) + '</span><span>' + modButtons('reviews', r.id, r.status) + '</span></div></article>'; }).join('');
  } else if (tab === 'stories') {
    var sts = store.stories();
    body = sts.length === 0 ? empty('No stories yet', 'Stories published in Stories & Confessions will appear here.')
      : sts.map(function (s) { return '<article class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p><b>' + esc(s.title) + '</b></p><span class="chip chip-amber">' + esc(s.tag) + '</span></div><p class="dim clamp3" style="margin-top:8px">' + esc(s.body) + '</p><div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span class="dim small">by ' + esc(s.author) + ' ' + statusChip(s.status) + '</span><span>' + modButtons('stories', s.id, s.status) + '</span></div></article>'; }).join('');
  } else if (tab === 'questions') {
    var qs = store.questions();
    body = qs.length === 0 ? empty('No questions yet', 'Community questions will appear here with their answers.')
      : qs.map(function (q) { return '<article class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p><b>' + esc(q.title) + '</b></p><span class="chip">' + (q.answers || []).length + ' answer' + ((q.answers || []).length === 1 ? '' : 's') + '</span></div><p class="dim" style="margin-top:8px">' + esc(q.body) + '</p><div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span class="dim small">by ' + esc(q.author) + ' · ' + esc(q.category) + ' ' + statusChip(q.status) + '</span><span>' + modButtons('questions', q.id, q.status) + '</span></div></article>'; }).join('');
  } else if (tab === 'teachers') {
    var reqs = store.teacherRequests();
    body = reqs.length === 0 ? empty('No teacher requests', 'When a student asks for Teacher access from their dashboard, the request appears here. Approve it and they get the teacher dashboard; reject it and they stay a student.')
      : reqs.map(function (r) {
        return '<article class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p><b>' + esc(r.name) + '</b> <span class="dim">' + esc(r.email) + '</span></p><span class="chip' + (r.status === 'pending' ? ' chip-amber' : '') + '">' + (r.status === 'pending' ? 'Waiting for review' : r.status === 'approved' ? 'Approved — Teacher' : 'Rejected') + '</span></div>' +
          '<p style="margin-top:8px">“' + esc(r.reason) + '”</p>' +
          '<div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span class="dim small">Requested ' + fmtDateTime(r.createdAt) + '</span><span>' +
          (r.status === 'pending'
            ? '<button type="button" class="btn-primary btn-sm" data-approve-teacher="' + r.id + '">Approve as Teacher</button> <button type="button" class="btn-danger" data-reject-teacher="' + r.id + '">Reject</button>'
            : '') + '</span></div></article>';
      }).join('');
  } else {
    var crs = store.centreReviews();
    body = crs.length === 0 ? empty('No centre reviews', 'Exam-centre reviews from the Navigator will appear here.')
      : crs.map(function (r) {
        var centre = D.CENTRES.find(function (x) { return x.id === r.centreId; });
        return '<article class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p><b>' + esc(centre ? centre.city + ' — ' + centre.campus : r.centreId) + '</b></p><span class="chip">' + r.rating + '/5</span></div><p style="margin-top:8px">' + esc(r.text) + '</p><div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span class="dim small">by ' + esc(r.author) + ' ' + statusChip(r.status) + '</span><span>' + modButtons('centreReviews', r.id, r.status) + '</span></div></article>';
      }).join('');
  }
  return head('Admin panel', 'Manage the whole site', 'Read the contact inbox and moderate every piece of community content. Reject hides an item from the public pages (you can approve it again); Delete is immediate and permanent.') + tabsHtml + body;
}
adminView.onMount = function () {
  document.querySelectorAll('[data-admintab]').forEach(function (b) {
    b.addEventListener('click', function () { UI.adminTab = b.getAttribute('data-admintab'); render(); });
  });
  function setStatus(kind, id, status) {
    var arr = load(kind, []);
    arr.forEach(function (x) { if (String(x.id) === id) x.status = status; });
    save(kind, arr); render();
  }
  document.querySelectorAll('[data-approve]').forEach(function (b) {
    b.addEventListener('click', function () { var p = b.getAttribute('data-approve').split(':'); setStatus(p[0], p[1], 'approved'); });
  });
  document.querySelectorAll('[data-reject]').forEach(function (b) {
    b.addEventListener('click', function () { var p = b.getAttribute('data-reject').split(':'); setStatus(p[0], p[1], 'rejected'); });
  });
  document.querySelectorAll('[data-del]').forEach(function (b) {
    b.addEventListener('click', function () { var p = b.getAttribute('data-del').split(':'); del(p[0], p[1]); });
  });
  function setTeacherRequest(id, approve) {
    var reqs = store.teacherRequests(), accounts = store.accounts(), changed = null;
    reqs.forEach(function (r) { if (String(r.id) === id) { r.status = approve ? 'approved' : 'rejected'; changed = r; } });
    if (approve && changed) {
      accounts.forEach(function (a) { if (a.id === changed.accountId) a.role = 'teacher'; });
      store.saveAccounts(accounts);
    }
    save('teacherRequests', reqs); render();
  }
  document.querySelectorAll('[data-approve-teacher]').forEach(function (b) {
    b.addEventListener('click', function () { setTeacherRequest(b.getAttribute('data-approve-teacher'), true); });
  });
  document.querySelectorAll('[data-reject-teacher]').forEach(function (b) {
    b.addEventListener('click', function () { setTeacherRequest(b.getAttribute('data-reject-teacher'), false); });
  });
};
function visible(arr) { return (arr || []).filter(function (x) { return x.status !== 'rejected'; }); }

/* ---------- FAQ ---------- */
function faqListHtml() {
  var q = (UI.faqQ || '').toLowerCase().trim(), cat = UI.faqCat || 'All';
  var list = D.FAQS.map(function (f, i) { return { q: f.q, a: f.a, cat: f.cat, i: i }; }).filter(function (f) {
    return (cat === 'All' || f.cat === cat) && (!q || f.q.toLowerCase().indexOf(q) !== -1 || f.a.toLowerCase().indexOf(q) !== -1);
  });
  if (!list.length) return empty('No answer found', 'Try different words — or post it in Ask the Community and let students and teachers answer it for everyone.');
  return '<p class="small" style="font-weight:600;color:var(--dim);margin-bottom:12px">Showing ' + list.length + ' of ' + D.FAQS.length + ' answers</p>' +
    list.map(function (f) {
      var open = UI.faqOpen === f.i;
      return '<div class="card mb" style="overflow:hidden"><button type="button" class="faq-q" data-faq="' + f.i + '" aria-expanded="' + open + '" style="display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;padding:20px;text-align:left;background:none;border:0;color:var(--text)"><span style="font-weight:700"><span style="margin-right:8px;font-weight:900;color:var(--amber)">' + String(f.i + 1).padStart(2, '0') + '</span>' + esc(f.q) + '</span><span style="flex-shrink:0;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-size:1.1rem;font-weight:700" aria-hidden="true">' + (open ? '−' : '+') + '</span></button>' +
        (open ? '<div style="padding:0 20px 20px"><span class="chip" style="margin-bottom:8px">' + esc(f.cat) + '</span><p style="margin-top:8px">' + esc(f.a) + '</p></div>' : '') + '</div>';
    }).join('');
}
function faqView() {
  UI.faqQ = UI.faqQ || ''; UI.faqCat = UI.faqCat || 'All'; UI.faqOpen = (UI.faqOpen == null ? 0 : UI.faqOpen);
  return '<div style="max-width:48rem;margin:0 auto">' + head('Knowledge base', 'Top 50 VU questions, answered', 'The questions asked again and again in VU student groups — collected, verified against VU\u2019s published rules, and made searchable. Still stuck? Ask the community from the Ask page.') +
    '<div class="card mb" style="padding:16px 20px"><label class="field-label" for="faq-search">Search the answers</label>' +
    '<input id="faq-search" class="field" value="' + esc(UI.faqQ) + '" placeholder="Try: datesheet, fee blocked, GDB, recheck…">' +
    '<div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:8px">' +
    ['All'].concat(D.FAQ_CATEGORIES).map(function (c) {
      return '<button type="button" class="btn-ghost btn-sm" data-faqcat="' + esc(c) + '" aria-pressed="' + (UI.faqCat === c) + '"' + (UI.faqCat === c ? ' style="background:var(--accent);color:var(--accent-ink);border-color:var(--accent)"' : '') + '>' + esc(c) + '</button>';
    }).join('') + '</div></div><div id="faqList">' + faqListHtml() + '</div></div>';
}
faqView.onMount = function () {
  var s = $('faq-search'); if (!s) return;
  s.addEventListener('input', function () { UI.faqQ = s.value; $('faqList').innerHTML = faqListHtml(); bindFaq(); });
  document.querySelectorAll('[data-faqcat]').forEach(function (b) {
    b.addEventListener('click', function () { UI.faqCat = b.getAttribute('data-faqcat'); render(); });
  });
  bindFaq();
  function bindFaq() {
    document.querySelectorAll('[data-faq]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.getAttribute('data-faq');
        UI.faqOpen = (UI.faqOpen === i ? null : i);
        $('faqList').innerHTML = faqListHtml(); bindFaq();
      });
    });
  }
};

/* ---------- Notes ---------- */
function notesListHtml() {
  var f = (UI.noteFilter || '').toLowerCase().trim();
  var list = store.notes().filter(function (n) {
    return !f || n.courseCode.toLowerCase().indexOf(f) !== -1 || n.title.toLowerCase().indexOf(f) !== -1 || (n.subject || '').toLowerCase().indexOf(f) !== -1;
  });
  if (!list.length) return empty('No notes here yet', 'Add your first note with the form — course code, lecture number, title and your key points. Your notes stay saved in this browser, and you can find them here any time.');
  return list.map(function (n) {
    return '<article class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p style="font-weight:700"><span style="color:var(--accent)">' + esc(n.courseCode) + '</span> <span class="dim">· Lecture ' + n.lectureNo + (n.subject ? ' · ' + esc(n.subject) : '') + '</span></p><span class="dim small">' + fmtDate(n.createdAt) + '</span></div>' +
      '<h3 class="font-display" style="margin-top:4px;font-size:1.15rem">' + esc(n.title) + '</h3>' +
      (n.content ? '<p class="dim" style="margin-top:4px;white-space:pre-wrap">' + esc(n.content) + '</p>' : '') +
      '<button type="button" class="btn-danger" style="margin-top:12px" data-delnote="' + n.id + '">Delete note</button></article>';
  }).join('');
}
function notesView() {
  UI.noteFilter = UI.noteFilter || '';
  var courses = Array.from(new Set(store.notes().map(function (n) { return n.courseCode; })));
  return head('Tool 02 · Notes & Handouts', 'Notes & Handouts Organizer', 'The problem: notes scattered across WhatsApp, screenshots and copy registers. The fix: every note filed by course code, subject and lecture number, searchable in seconds. Official handouts live on VULMS course downloads — see the Past Papers & Handouts Guide for where exactly.') +
    '<div class="grid lg-side" style="gap:24px"><form class="card" style="padding:24px;height:fit-content;display:grid;gap:16px" id="noteForm"><h2 class="font-display" style="font-size:1.25rem">Add a note</h2>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="note-code">Course code</label><input id="note-code" class="field" value="' + esc(UI.notePrefillCode || '') + '" placeholder="CS101" required></div>' +
    '<div><label class="field-label" for="note-lec">Lecture #</label><input id="note-lec" type="number" min="1" max="999" class="field" value="1"></div></div>' +
    '<div><label class="field-label" for="note-subject">Subject name</label><input id="note-subject" class="field" placeholder="Introduction to Computing"></div>' +
    '<div><label class="field-label" for="note-title">Note title</label><input id="note-title" class="field" placeholder="Binary number system — key points" required></div>' +
    '<div><label class="field-label" for="note-content">Your notes</label><textarea id="note-content" class="field" placeholder="Write or paste the important points from this lecture…"></textarea></div>' +
    '<div id="noteMsg"></div><button type="submit" class="btn-primary" style="width:100%">Save note</button></form>' +
    '<div><div style="margin-bottom:16px;display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end"><div style="flex:1;min-width:220px"><label class="field-label" for="note-filter">Search notes</label><input id="note-filter" class="field" value="' + esc(UI.noteFilter) + '" placeholder="Search by course, subject or title…"></div>' +
    (courses.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px;padding-bottom:6px">' + courses.map(function (c) { return '<button type="button" class="chip" data-notecourse="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' : '') +
    '</div><div id="notesList">' + notesListHtml() + '</div></div></div>';
}
notesView.onMount = function () {
  var f = $('noteForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var code = $('note-code').value.trim().toUpperCase(), title = $('note-title').value.trim();
    if (!code || !title) return;
    var arr = store.notes();
    arr.unshift({ id: uid(), courseCode: code, subject: $('note-subject').value.trim(), lectureNo: +$('note-lec').value || 1, title: title, content: $('note-content').value.trim(), createdAt: new Date().toISOString() });
    save('notes', arr);
    $('noteMsg').innerHTML = '<div class="note-ok" role="status">Note saved — find it any time in the list below.</div>';
    $('note-title').value = ''; $('note-content').value = '';
    $('note-lec').value = (+$('note-lec').value || 1) + 1;
    $('notesList').innerHTML = notesListHtml(); bindDel();
  });
  var flt = $('note-filter');
  flt.addEventListener('input', function () { UI.noteFilter = flt.value; $('notesList').innerHTML = notesListHtml(); bindDel(); });
  document.querySelectorAll('[data-notecourse]').forEach(function (b) {
    b.addEventListener('click', function () { UI.noteFilter = b.getAttribute('data-notecourse'); render(); });
  });
  bindDel();
  function bindDel() {
    document.querySelectorAll('[data-delnote]').forEach(function (b) {
      b.addEventListener('click', function () { del('notes', b.getAttribute('data-delnote')); });
    });
  }
};

/* ---------- Routine builder ---------- */
var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
function routineView() {
  UI.routine = UI.routine || { courses: [{ name: 'CS101', lecturesPerWeek: 3, deadline: '' }, { name: 'MTH101', lecturesPerWeek: 3, deadline: '' }], hoursPerDay: 2, studyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], plan: null, planName: 'My weekly routine', savedMsg: '' };
  var u = UI.routine;
  var saved = store.routines();
  return head('Tool 03 · Study Planner', 'Study Planner — Weekly Routine Builder', 'The problem: 15+ lectures a week, a job or family, and deadlines that sneak up. Tell the planner your courses, your free hours and your deadlines — it spreads the work into a week you can actually follow.') +
    '<div class="grid lg-side2" style="gap:24px"><div class="card" style="padding:24px;height:fit-content;display:grid;gap:20px"><h2 class="font-display" style="font-size:1.25rem">Your courses</h2>' +
    u.courses.map(function (c, i) {
      return '<div style="border:2px solid var(--border);border-radius:16px;padding:16px"><div class="grid" style="grid-template-columns:1fr auto;gap:12px"><div><label class="field-label" for="rc-name-' + i + '">Course ' + (i + 1) + '</label><input id="rc-name-' + i + '" class="field" data-rcname="' + i + '" value="' + esc(c.name) + '" placeholder="CS101"></div>' +
        '<div><label class="field-label" for="rc-lec-' + i + '">Lectures / week</label><input id="rc-lec-' + i + '" type="number" min="1" max="7" class="field" style="width:96px" data-rclec="' + i + '" value="' + c.lecturesPerWeek + '"></div></div>' +
        '<div style="margin-top:12px;display:flex;gap:12px;align-items:flex-end"><div style="flex:1"><label class="field-label" for="rc-dl-' + i + '">Next deadline (optional)</label><input id="rc-dl-' + i + '" type="date" class="field" data-rcdl="' + i + '" value="' + esc(c.deadline) + '"></div>' +
        (u.courses.length > 1 ? '<button type="button" class="btn-danger" data-rcdel="' + i + '">Remove</button>' : '') + '</div></div>';
    }).join('') +
    '<button type="button" class="btn-ghost" style="width:100%" id="rcAdd">+ Add another course</button>' +
    '<div><label class="field-label" id="rc-hours-label" for="rc-hours">Focused study hours per day: ' + u.hoursPerDay + 'h</label><input id="rc-hours" type="range" min="1" max="6" step="0.5" value="' + u.hoursPerDay + '"></div>' +
    '<div><span class="field-label">Study days</span><div style="display:flex;flex-wrap:wrap;gap:8px">' + DAYS.map(function (d) {
      var on = u.studyDays.indexOf(d) !== -1;
      return '<button type="button" class="btn-ghost btn-sm" data-rcday="' + d + '" aria-pressed="' + on + '"' + (on ? ' style="background:var(--accent);color:var(--accent-ink);border-color:var(--accent)"' : '') + '>' + d.slice(0, 3) + '</button>';
    }).join('') + '</div></div>' +
    '<button type="button" class="btn-primary" style="width:100%" id="rcGen">Generate my routine</button></div>' +
    '<div><div id="routinePlan">' + routinePlanHtml() + '</div>' +
    (saved.length ? '<div class="mt2"><h2 class="font-display" style="font-size:1.5rem;margin-bottom:12px">Saved routines</h2>' + saved.map(function (r) {
      var days = []; try { days = JSON.parse(r.planJson); } catch (e) {}
      return '<div class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p style="font-weight:700">' + esc(r.name) + '</p><span class="dim small">Saved ' + fmtDate(r.createdAt) + '</span></div><p class="dim small" style="margin-top:4px">' + days.map(function (d) { return d.day.slice(0, 3) + ': ' + d.sessions.length + ' session' + (d.sessions.length === 1 ? '' : 's'); }).join(' · ') + '</p><button type="button" class="btn-danger" style="margin-top:12px" data-delroutine="' + r.id + '">Delete</button></div>';
    }).join('') + '</div>' : '') + '</div></div>';
}
function routinePlanHtml() {
  var u = UI.routine;
  if (!u.plan) return empty('Your week, planned in 30 seconds', 'Add your courses on the left, be honest about your free hours (2 focused hours beat 6 distracted ones), and generate. Courses with the nearest deadlines get revision sessions first.');
  return '<div class="grid sm2" style="gap:16px">' + u.plan.map(function (d) {
    return '<div class="card" style="padding:20px"><h3 class="font-display" style="font-size:1.1rem;color:var(--accent)">' + esc(d.day) + '</h3><ul style="margin-top:8px;display:grid;gap:8px">' + d.sessions.map(function (s) { return '<li style="background:var(--surface-2);border-radius:12px;padding:8px 12px;font-size:.9rem"><strong>' + esc(s.course) + '</strong> — ' + esc(s.task) + '</li>'; }).join('') + '</ul></div>';
  }).join('') + '</div>' +
    '<div class="card mt" style="padding:20px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end"><div style="flex:1;min-width:200px"><label class="field-label" for="routine-name">Save this routine as</label><input id="routine-name" class="field" value="' + esc(u.planName) + '"></div>' +
    '<button type="button" class="btn-amber" id="rcSave">Save routine</button></div>' +
    (u.savedMsg ? '<div class="note-ok mt" role="status">' + esc(u.savedMsg) + '</div>' : '');
}
routineView.onMount = function () {
  var u = UI.routine; if (!u) return;
  function syncInputs() {
    document.querySelectorAll('[data-rcname]').forEach(function (el) { u.courses[+el.getAttribute('data-rcname')].name = el.value; });
    document.querySelectorAll('[data-rclec]').forEach(function (el) { u.courses[+el.getAttribute('data-rclec')].lecturesPerWeek = +el.value || 1; });
    document.querySelectorAll('[data-rcdl]').forEach(function (el) { u.courses[+el.getAttribute('data-rcdl')].deadline = el.value; });
  }
  document.querySelectorAll('[data-rcday]').forEach(function (b) {
    b.addEventListener('click', function () { syncInputs(); var d = b.getAttribute('data-rcday'); u.studyDays = u.studyDays.indexOf(d) !== -1 ? u.studyDays.filter(function (x) { return x !== d; }) : u.studyDays.concat([d]); render(); });
  });
  document.querySelectorAll('[data-rcdel]').forEach(function (b) {
    b.addEventListener('click', function () { syncInputs(); u.courses.splice(+b.getAttribute('data-rcdel'), 1); render(); });
  });
  $('rcAdd').addEventListener('click', function () { syncInputs(); u.courses.push({ name: '', lecturesPerWeek: 3, deadline: '' }); render(); });
  // Dragging the slider updates only its label — no re-render, so the slider keeps focus.
  $('rc-hours').addEventListener('input', function (e) { u.hoursPerDay = +e.target.value; var lab = $('rc-hours-label'); if (lab) lab.textContent = 'Focused study hours per day: ' + u.hoursPerDay + 'h'; });
  $('rcGen').addEventListener('click', function () {
    syncInputs();
    var valid = u.courses.filter(function (c) { return c.name.trim(); });
    if (!valid.length || !u.studyDays.length) return;
    var queue = [];
    var sorted = valid.slice().sort(function (a, b) {
      var da = a.deadline ? new Date(a.deadline).getTime() : Infinity, db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    });
    sorted.forEach(function (c) {
      for (var i = 0; i < c.lecturesPerWeek; i++) queue.push({ course: c.name, task: 'Watch lecture + take notes (session ' + (i + 1) + ')' });
      queue.push({ course: c.name, task: 'Revise notes & attempt practice questions' });
      if (c.deadline) queue.push({ course: c.name, task: '⚑ Deadline ' + c.deadline + ': finish & submit pending work' });
    });
    var perDay = Math.max(1, Math.round(u.hoursPerDay));
    var days = DAYS.filter(function (d) { return u.studyDays.indexOf(d) !== -1; });
    var out = days.map(function (d) { return { day: d, sessions: [] }; });
    queue.forEach(function (s, i) { var day = out[i % out.length]; if (day) day.sessions.push(s); });
    u.plan = out.filter(function (d) { return d.sessions.length; });
    u.savedMsg = '';
    $('routinePlan').innerHTML = routinePlanHtml();
    var sv = $('rcSave');
    if (sv) sv.addEventListener('click', saveRoutine);
    void perDay;
  });
  function saveRoutine() {
    var name = ($('routine-name') ? $('routine-name').value.trim() : '') || 'My weekly routine';
    var arr = store.routines();
    arr.unshift({ id: uid(), name: name, planJson: JSON.stringify(u.plan), createdAt: new Date().toISOString() });
    save('routines', arr); u.savedMsg = 'Routine saved — it will be here every time you come back.'; render();
  }
  var sv0 = $('rcSave'); if (sv0) sv0.addEventListener('click', saveRoutine);
  document.querySelectorAll('[data-delroutine]').forEach(function (b) {
    b.addEventListener('click', function () { del('routines', b.getAttribute('data-delroutine')); });
  });
}

/* ---------- Degree progress ---------- */
function degreeView() {
  var ds = degreeStats();
  var bySem = {};
  ds.courses.forEach(function (c) { (bySem[c.semester] = bySem[c.semester] || []).push(c); });
  var sems = Object.keys(bySem).map(Number).sort(function (a, b) { return a - b; });
  return head('Tool 04 · Degree', 'Degree Progress Dashboard', 'The problem: students genuinely don\u2019t know how much of their degree is done or what their CGPA really is. Enter your completed courses once — this dashboard keeps the full picture. No login needed; your courses are saved in this browser.') +
    '<div class="grid sm2 lg4" style="gap:16px">' +
    '<div class="card stat"><p class="lbl">Degree complete</p><p class="val font-display">' + ds.pct + '%</p><div class="progress" style="margin-top:12px" role="progressbar" aria-valuenow="' + ds.pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Degree completion"><div style="width:' + ds.pct + '%"></div></div><p class="hint">' + ds.done + ' of ' + ds.settings.totalCredits + ' credit hours</p></div>' +
    '<div class="card stat"><p class="lbl">Current CGPA</p><p class="val font-display">' + (ds.done > 0 ? ds.cgpa.toFixed(2) : '—') + '</p><p class="hint">Target: ' + ds.settings.targetCgpa.toFixed(2) + ' · Minimum to graduate: 2.00</p></div>' +
    '<div class="card stat"><p class="lbl">Courses passed</p><p class="val font-display">' + ds.courses.filter(function (c) { return c.grade !== 'F'; }).length + '</p><p class="hint">' + ds.courses.filter(function (c) { return c.grade === 'F'; }).length + ' failed — repeat them early</p></div>' +
    '<div class="card stat"><p class="lbl">Credit hours left</p><p class="val font-display">' + Math.max(0, ds.settings.totalCredits - ds.done) + '</p><p class="hint">≈ ' + Math.max(0, Math.ceil((ds.settings.totalCredits - ds.done) / 18)) + ' semester(s) at 18 credits each</p></div></div>' +
    '<div class="grid lg-side mt" style="gap:24px"><div style="display:grid;gap:24px;align-content:start">' +
    '<form class="card" style="padding:24px;display:grid;gap:16px" id="degreeForm"><h2 class="font-display" style="font-size:1.25rem">Add a completed course</h2>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="dc-code">Course code</label><input id="dc-code" class="field" placeholder="CS101" required></div>' +
    '<div><label class="field-label" for="dc-sem">Semester</label><input id="dc-sem" type="number" min="1" max="16" class="field" value="1"></div></div>' +
    '<div><label class="field-label" for="dc-title">Course title</label><input id="dc-title" class="field" placeholder="Introduction to Computing"></div>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="dc-credits">Credit hours</label><input id="dc-credits" type="number" min="0.5" max="10" step="0.5" class="field" value="3"></div>' +
    '<div><label class="field-label" for="dc-grade">Grade</label><select id="dc-grade" class="field">' + D.GRADE_SCALE.map(function (g) { return '<option value="' + g.grade + '">' + g.grade + ' (' + g.points.toFixed(2) + ')</option>'; }).join('') + '</select></div></div>' +
    '<button type="submit" class="btn-primary" style="width:100%">Add course</button></form>' +
    '<form class="card" style="padding:24px;display:grid;gap:16px" id="degreeSettingsForm"><h2 class="font-display" style="font-size:1.25rem">Degree settings</h2>' +
    '<div><label class="field-label" for="ds-program">Program</label><input id="ds-program" class="field" value="' + esc(ds.settings.program) + '"></div>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="ds-total">Total credits</label><input id="ds-total" type="number" min="10" max="400" class="field" value="' + ds.settings.totalCredits + '"></div>' +
    '<div><label class="field-label" for="ds-target">Target CGPA</label><input id="ds-target" type="number" min="0" max="4" step="0.1" class="field" value="' + ds.settings.targetCgpa + '"></div></div>' +
    '<div id="dsMsg"></div><button type="submit" class="btn-ghost" style="width:100%">Save settings</button></form></div>' +
    '<div style="display:grid;gap:20px;align-content:start">' +
    (sems.length === 0 ? empty('No courses logged yet', 'Add the courses you have completed — with the grades from your VULMS grade book — and this page becomes your personal degree map.')
      : sems.map(function (sem) {
        var list = bySem[sem];
        var sc = list.reduce(function (s, c) { return s + (+c.creditHours || 0); }, 0);
        var sp = list.reduce(function (s, c) { return s + (+c.creditHours || 0) * (D.GRADE_POINTS[c.grade] || 0); }, 0);
        return '<div class="card" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><h3 class="font-display" style="font-size:1.1rem">Semester ' + sem + '</h3><span class="chip">GPA ' + (sc > 0 ? (sp / sc).toFixed(2) : '—') + ' · ' + sc + ' credits</span></div>' +
          '<ul class="list-divide" style="margin-top:12px;list-style:none;padding:0;margin-bottom:0">' + list.map(function (c) {
            return '<li style="display:flex;justify-content:space-between;gap:12px;align-items:center"><span><strong>' + esc(c.code) + '</strong> <span class="dim">' + esc(c.title) + '</span></span><span style="display:flex;gap:12px;align-items:center"><span class="chip chip-amber">' + c.creditHours + ' cr · ' + esc(c.grade) + '</span><button type="button" class="btn-danger" data-deldegree="' + c.id + '">Remove</button></span></li>';
          }).join('') + '</ul></div>';
      }).join('')) +
    '<div class="card" style="padding:20px"><h3 class="font-display" style="font-size:1.1rem">Official VU grade scale</h3><div class="grid sm2 lg3 mt" style="gap:6px 24px">' +
    D.GRADE_SCALE.map(function (g) { return '<p class="small"><strong>' + g.grade + '</strong> = ' + g.points.toFixed(2) + ' <span class="dim">(' + g.range + ')</span></p>'; }).join('') +
    '</div><p class="dim small" style="margin-top:12px">Passing a course needs ≥20% in the first half (assignments + quizzes + GDB + midterm), ≥20% in the final term, and ≥40% overall. VU applies relative grading, so treat this as the standard scale.</p></div></div></div>';
}
degreeView.onMount = function () {
  var f = $('degreeForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var code = $('dc-code').value.trim().toUpperCase(); if (!code) return;
    var arr = store.degreeCourses();
    arr.push({ id: uid(), code: code, title: $('dc-title').value.trim(), creditHours: +$('dc-credits').value || 3, grade: $('dc-grade').value, semester: +$('dc-sem').value || 1, createdAt: new Date().toISOString() });
    save('degreeCourses', arr); render();
  });
  $('degreeSettingsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    save('degreeSettings', { program: $('ds-program').value.trim() || 'My degree', totalCredits: +$('ds-total').value || 132, targetCgpa: +$('ds-target').value || 3 });
    $('dsMsg').innerHTML = '<div class="note-ok" role="status">Settings saved.</div>';
  });
  document.querySelectorAll('[data-deldegree]').forEach(function (b) {
    b.addEventListener('click', function () { del('degreeCourses', b.getAttribute('data-deldegree')); });
  });
};

/* ---------- Exam centres ---------- */
function centresGridHtml() {
  var all = visible(store.centreReviews());
  function avgFor(id) { var rs = all.filter(function (r) { return r.centreId === id; }); return rs.length ? rs.reduce(function (s, r) { return s + r.rating; }, 0) / rs.length : null; }
  var s = (UI.centreSearch || '').toLowerCase().trim();
  var filtered = D.CENTRES.filter(function (c) { return !s || c.city.toLowerCase().indexOf(s) !== -1 || c.province.toLowerCase().indexOf(s) !== -1; });
  if (!filtered.length) return empty('No centre matches that search', 'VU has campuses in 100+ cities. Check the official VU website linked below for the complete list.');
  return filtered.map(function (c) {
    var avg = avgFor(c.id), isSel = UI.centreSel === c.id;
    var n = all.filter(function (r) { return r.centreId === c.id; }).length;
    var needsConfirm = c.address.indexOf('confirm exact') !== -1;
    return '<button type="button" class="card" data-centre="' + c.id + '" aria-pressed="' + isSel + '" style="padding:20px;text-align:left;color:var(--text)"' + (isSel ? ' data-sel="1"' : '') + '>' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><span class="font-display" style="font-size:1.9rem;font-weight:900;color:var(--amber)">' + esc(c.city.slice(0, 2).toUpperCase()) + '</span><span class="chip">' + esc(c.province) + '</span></div>' +
      '<h3 class="font-display" style="margin-top:8px;font-size:1.25rem">' + esc(c.city) + '</h3><p style="font-weight:600">' + esc(c.campus) + '</p>' +
      '<p class="dim small" style="margin-top:4px">' + esc(c.address) + '</p>' +
      (needsConfirm ? '<p style="margin-top:8px"><span class="chip chip-amber">⚠ Exact address still to confirm on vu.edu.pk — check before travelling</span></p>' : '') +
      '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px">' + c.facilities.map(function (f) { return '<span class="chip">' + esc(f) + '</span>'; }).join('') + '</div>' +
      '<p style="margin-top:12px;font-size:.9rem;font-weight:600;color:var(--accent)">' + (avg != null ? '★ ' + avg.toFixed(1) + ' from ' + n + ' review(s)' : 'No reviews yet — be the first') + '</p></button>';
  }).join('');
}
function centreDetailHtml() {
  var centre = D.CENTRES.find(function (c) { return c.id === UI.centreSel; }) || D.CENTRES[0];
  if (!centre) return '';
  var posted = UI.centreJustPosted; UI.centreJustPosted = false;
  var all = visible(store.centreReviews());
  var centreReviews = all.filter(function (r) { return r.centreId === centre.id; });
  return (posted ? '<div class="note-ok mb" role="status">Review posted — thank you for helping the next batch choose well.</div>' : '') +
    '<h2 class="font-display" style="font-size:1.5rem">' + esc(centre.city) + ' — reviews</h2><p class="dim small" style="margin-top:4px">' + esc(centre.campus) + '</p>' +
    '<div style="margin-top:16px;display:grid;gap:12px">' +
    (centreReviews.length === 0 ? '<p class="dim">No reviews for this centre yet. Sat an exam here? Tell juniors about seating, staff behaviour, load-shedding backup and reaching on time.</p>'
      : centreReviews.map(function (r) { return '<article style="background:var(--surface-2);border-radius:16px;padding:16px"><div style="display:flex;justify-content:space-between;align-items:center">' + stars(r.rating, 15) + '<span class="dim small">' + fmtDate(r.createdAt) + '</span></div><p style="margin-top:8px">' + esc(r.text) + '</p><p class="dim small" style="margin-top:4px">— ' + esc(r.author) + '</p></article>'; }).join('')) +
    '</div><form id="centreForm" style="margin-top:20px;display:grid;gap:16px;border-top:2px solid var(--border);padding-top:20px"><h3 class="font-display" style="font-size:1.1rem">Review this centre</h3>' +
    '<div><label class="field-label" for="cr-rating">Your rating: <span id="cr-rating-val">5</span>/5</label><input id="cr-rating" type="range" min="1" max="5" step="1" value="5"></div>' +
    '<div><label class="field-label" for="cr-text">Your experience</label><textarea id="cr-text" class="field" placeholder="How were the halls, staff, computers, washrooms, parking…?" required></textarea></div>' +
    '<div id="crMsg"></div><button type="submit" class="btn-primary" style="width:100%">Post review</button></form>';
}
function centresView() {
  UI.centreSearch = UI.centreSearch || ''; UI.centreSel = UI.centreSel || (D.CENTRES[0] && D.CENTRES[0].id);
  return head('Tool 05 · Exams', 'Exam Center Navigator', 'The problem: a noisy, far or badly managed centre can ruin a paper you prepared for months. Compare real VU campus centres city by city, read student reviews, and choose before you make your datesheet.') +
    '<div style="max-width:28rem;margin-bottom:20px"><label class="field-label" for="centre-search">Find your city</label><input id="centre-search" class="field" value="' + esc(UI.centreSearch) + '" placeholder="Lahore, Karachi, Peshawar…"></div>' +
    '<div class="grid lg-side" style="gap:24px"><div class="grid sm2" id="centreGrid" style="gap:16px;align-content:start">' + centresGridHtml() + '</div>' +
    '<div class="card" id="centreDetail" style="padding:24px;height:fit-content">' + centreDetailHtml() + '</div></div>' +
    '<p class="dim small" style="margin-top:24px">Addresses are from VU\u2019s published campus information. Centres can move — verify yours on the <a href="' + D.VU_OFFICIAL_CAMPUS_URL + '" target="_blank" rel="noreferrer"><b>official VU website (vu.edu.pk)</b></a> — search for \u201cVirtual Campuses\u201d there — before exam day.</p>';
}
centresView.onMount = function () {
  var s = $('centre-search'); if (!s) return;
  function refreshLists() {
    var g = $('centreGrid'), d = $('centreDetail');
    if (g) g.innerHTML = centresGridHtml();
    if (d) d.innerHTML = centreDetailHtml();
    bindCards(); bindDetailForm();
  }
  function bindCards() {
    document.querySelectorAll('[data-centre]').forEach(function (b) {
      b.addEventListener('click', function () { UI.centreSel = b.getAttribute('data-centre'); refreshLists(); });
    });
  }
  function bindDetailForm() {
    var r = $('cr-rating');
    if (r) r.addEventListener('input', function () { $('cr-rating-val').textContent = r.value; });
    var f = $('centreForm');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = $('cr-text').value.trim(); if (!text) return;
      var arr = store.centreReviews();
      arr.unshift({ id: uid(), centreId: UI.centreSel, rating: +$('cr-rating').value, text: text, author: (store.profile() && store.profile().name) || 'Anonymous', createdAt: new Date().toISOString(), status: 'approved' });
      save('centreReviews', arr);
      UI.centreJustPosted = true;
      render();
    });
  }
  // Typing in the search updates only the lists below — the input keeps focus.
  s.addEventListener('input', function () { UI.centreSearch = s.value; refreshLists(); });
  bindCards(); bindDetailForm();
};

/* ---------- Freshman guide ---------- */
function guideView() {
  var done = new Set(store.guideDone());
  var pct = Math.round(done.size / D.GUIDE_STEPS.length * 100);
  return '<div style="max-width:48rem;margin:0 auto">' + head('Tool 06 · New students', 'Virtual Freshman Guide', 'New admission? This roadmap takes you from \u2018admission confirmed\u2019 to \u2018first result\u2019 without the panic. Tick each step as you finish it — your progress is saved in this browser.') +
    '<div class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><p style="font-weight:700">Your onboarding progress</p><span class="chip chip-amber">' + done.size + '/' + D.GUIDE_STEPS.length + ' steps · ' + pct + '%</span></div>' +
    '<div class="progress" style="margin-top:12px;height:16px" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Onboarding progress"><div style="width:' + pct + '%"></div></div>' +
    (pct === 100 ? '<p style="margin-top:12px;font-weight:600;color:var(--accent)">Roadmap complete — you\u2019re officially a VU pro. Welcome! 🎓</p>' : '') + '</div>' +
    '<ol style="list-style:none;padding:0;display:grid;gap:16px">' +
    D.GUIDE_STEPS.map(function (st, i) {
      var isDone = done.has(st.id);
      return '<li class="card" style="display:flex;gap:16px;padding:20px;' + (isDone ? 'opacity:.75' : '') + '"><button type="button" role="checkbox" aria-checked="' + isDone + '" aria-label="Mark step ' + (i + 1) + ' (' + esc(st.title) + ') as ' + (isDone ? 'not done' : 'done') + '" data-guide="' + st.id + '" style="flex-shrink:0;width:48px;height:48px;border-radius:50%;border:3px solid ' + (isDone ? 'var(--accent)' : 'var(--amber)') + ';background:' + (isDone ? 'var(--accent)' : 'var(--amber-soft)') + ';color:' + (isDone ? 'var(--accent-ink)' : '#8a5c07') + ';font-size:1.25rem;font-weight:900">' + (isDone ? '✓' : (i + 1)) + '</button>' +
        '<div><p class="small" style="font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--accent)">' + esc(st.phase) + '</p>' +
        '<h3 class="font-display" style="margin-top:2px;font-size:1.15rem;' + (isDone ? 'text-decoration:line-through' : '') + '">' + esc(st.title) + '</h3>' +
        '<p style="margin-top:4px">' + esc(st.detail) + '</p><p style="margin-top:8px;background:var(--amber-soft);border-radius:12px;padding:8px 12px;font-size:.9rem;font-weight:500">💡 ' + esc(st.tip) + '</p></div></li>';
    }).join('') + '</ol></div>';
}
guideView.onMount = function () {
  document.querySelectorAll('[data-guide]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-guide'), done = store.guideDone();
      done = done.indexOf(id) !== -1 ? done.filter(function (x) { return x !== id; }) : done.concat([id]);
      save('guideDone', done); render();
    });
  });
};

/* ---------- Course reviews ---------- */
function reviewsView() {
  UI.revSearch = UI.revSearch || '';
  var p = store.profile();
  var all = visible(store.reviews());
  var byCourse = {};
  all.forEach(function (r) { var c = byCourse[r.courseCode] = byCourse[r.courseCode] || { count: 0, rating: 0, difficulty: 0 }; c.count++; c.rating += r.rating; c.difficulty += r.difficulty; });
  var f = UI.revSearch.toLowerCase().trim();
  var list = all.filter(function (r) { return !f || r.courseCode.toLowerCase().indexOf(f) !== -1 || (r.courseName || '').toLowerCase().indexOf(f) !== -1; });
  return head('Tool 07 · Community wisdom', 'Course Review Portal', 'The problem: elective choices made blind — then a semester of regret. Seniors rate courses, score their difficulty and leave the advice they wish they\u2019d had. No login needed to read or post.') +
    (Object.keys(byCourse).length ? '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px">' + Object.keys(byCourse).map(function (code) {
      var c = byCourse[code];
      return '<button type="button" class="card" data-revchip="' + esc(code) + '" style="padding:12px 16px;text-align:left;color:var(--text)"><span class="font-display" style="font-size:1.1rem;font-weight:700">' + esc(code) + '</span> <span class="dim small">★ ' + (c.rating / c.count).toFixed(1) + ' · difficulty ' + (c.difficulty / c.count).toFixed(1) + '/5 · ' + c.count + ' review' + (c.count === 1 ? '' : 's') + '</span></button>';
    }).join('') + '</div>' : '') +
    '<div class="grid lg-side" style="gap:24px"><form class="card" style="padding:24px;height:fit-content;display:grid;gap:16px" id="reviewForm"><h2 class="font-display" style="font-size:1.25rem">Review a course you took</h2>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="rv-code">Course code</label><input id="rv-code" class="field" placeholder="CS201" required></div>' +
    '<div><label class="field-label" for="rv-name">Course name</label><input id="rv-name" class="field" placeholder="OOP"></div></div>' +
    '<div><span class="field-label">Overall rating</span><div style="display:flex;gap:4px" role="radiogroup" aria-label="Overall rating" id="rvStars"></div></div>' +
    '<div><span class="field-label">Difficulty: <span id="rv-diff-val">3</span>/5 <span id="rv-diff-word">(fair)</span></span><div style="display:flex;gap:8px" role="radiogroup" aria-label="Difficulty" id="rvDiff"></div></div>' +
    '<div><label class="field-label" for="rv-advice">Your honest advice</label><textarea id="rv-advice" class="field" placeholder="What should juniors know? Lectures to never skip, midterm tricks, who should avoid this elective…" required></textarea></div>' +
    '<div id="rvMsg"></div><button type="submit" class="btn-primary" style="width:100%">Publish review</button>' +
    '<p class="dim small">Posting as ' + esc(p ? p.name : 'Anonymous senior') + ' (' + esc(p ? p.role : 'student') + ').</p></form>' +
    '<div><div style="max-width:28rem;margin-bottom:16px"><label class="field-label" for="rv-search">Search reviews</label><input id="rv-search" class="field" value="' + esc(UI.revSearch) + '" placeholder="Search by course code or name…"></div>' +
    '<div id="reviewsList">' + reviewsListHtml(list) + '</div></div></div>';
}
function reviewsListHtml(list) {
  if (!list.length) return empty('No reviews yet for this search', 'Be the senior you needed in your first semester — review a course you have completed and save a junior from a blind elective choice.');
  return list.map(function (r) {
    return '<article class="card mb" style="padding:20px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><p class="font-display" style="font-size:1.1rem"><b>' + esc(r.courseCode) + '</b> <span class="dim" style="font-size:1rem;font-weight:600">' + esc(r.courseName) + '</span></p>' + stars(r.rating) + '</div>' +
      '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px"><span class="chip" style="background:var(--coral-soft);color:var(--coral)">Difficulty ' + r.difficulty + '/5</span><span class="chip">' + (r.authorRole === 'teacher' ? 'Teacher insight' : 'Senior advice') + '</span></div>' +
      '<p style="margin-top:8px">' + esc(r.advice) + '</p><p class="dim small" style="margin-top:8px">— ' + esc(r.author) + ' · ' + fmtDate(r.createdAt) + '</p></article>';
  }).join('');
}
reviewsView.onMount = function () {
  var rating = 5, difficulty = 3;
  var starBox = $('rvStars'), diffBox = $('rvDiff');
  function paintStars() {
    starBox.innerHTML = [1, 2, 3, 4, 5].map(function (i) {
      return '<button type="button" role="radio" aria-checked="' + (rating === i) + '" aria-label="Rating ' + i + ' star' + (i > 1 ? 's' : '') + '" data-star="' + i + '" style="width:48px;height:48px;border-radius:50%;border:2px solid ' + (i <= rating ? 'var(--amber)' : 'var(--border)') + ';background:' + (i <= rating ? 'var(--amber-soft)' : 'var(--surface)') + ';color:var(--amber);font-size:1.4rem">' + (i <= rating ? '★' : '☆') + '</button>';
    }).join('');
    starBox.querySelectorAll('[data-star]').forEach(function (b) { b.addEventListener('click', function () { rating = +b.getAttribute('data-star'); paintStars(); }); });
  }
  function paintDiff() {
    var words = { 1: '(easy ride)', 2: '(easy ride)', 3: '(fair)', 4: '(tough)', 5: '(brutal)' };
    diffBox.innerHTML = [1, 2, 3, 4, 5].map(function (d) {
      return '<button type="button" role="radio" aria-checked="' + (difficulty === d) + '" aria-label="Difficulty ' + d + ' of 5" data-diff="' + d + '" style="flex:1;height:48px;border-radius:12px;border:2px solid ' + (difficulty === d ? 'var(--coral)' : 'var(--border)') + ';background:' + (difficulty === d ? 'var(--coral-soft)' : 'var(--surface)') + ';color:' + (difficulty === d ? 'var(--coral)' : 'var(--text)') + ';font-weight:700">' + d + '</button>';
    }).join('');
    $('rv-diff-val').textContent = difficulty; $('rv-diff-word').textContent = words[difficulty];
    diffBox.querySelectorAll('[data-diff]').forEach(function (b) { b.addEventListener('click', function () { difficulty = +b.getAttribute('data-diff'); paintDiff(); }); });
  }
  paintStars(); paintDiff();
  var f = $('reviewForm');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var code = $('rv-code').value.trim().toUpperCase(), advice = $('rv-advice').value.trim();
    if (!code || !advice) return;
    var p = store.profile();
    var arr = store.reviews();
    arr.unshift({ id: uid(), courseCode: code, courseName: $('rv-name').value.trim(), rating: rating, difficulty: difficulty, advice: advice, author: p ? p.name : 'Anonymous senior', authorRole: p ? p.role : 'student', createdAt: new Date().toISOString(), status: 'approved' });
    save('reviews', arr);
    $('rvMsg').innerHTML = '<div class="note-ok" role="status">Review published — a junior somewhere just made a smarter choice.</div>';
    $('rv-advice').value = ''; render();
  });
  var s = $('rv-search');
  s.addEventListener('input', function () {
    UI.revSearch = s.value;
    var f2 = s.value.toLowerCase().trim();
    var list = visible(store.reviews()).filter(function (r) { return !f2 || r.courseCode.toLowerCase().indexOf(f2) !== -1 || (r.courseName || '').toLowerCase().indexOf(f2) !== -1; });
    $('reviewsList').innerHTML = reviewsListHtml(list);
  });
  document.querySelectorAll('[data-revchip]').forEach(function (b) {
    b.addEventListener('click', function () { UI.revSearch = b.getAttribute('data-revchip'); render(); });
  });
};

/* ---------- GDB drafter ---------- */
var GDB_STARTERS = [
  'In my opinion, the most important point is… because…',
  'This topic matters for VU students because…',
  'One practical example from daily life is…',
  'However, it is also important to consider…',
  'To conclude, I would say that…'
];
function gdbView() {
  UI.gdb = UI.gdb || { draftId: null, title: '', courseCode: '', content: '' };
  var u = UI.gdb;
  var content = u.content;
  var chars = content.length;
  var words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  var sentences = content.split(/[.!?]+/).filter(function (s) { return s.trim().length; }).length;
  var readSecs = Math.max(0, Math.round(words / 200 * 60));
  var quality = words === 0 ? { label: 'Start writing', color: 'var(--dim)', tip: 'Aim for 120–250 focused words: state your point, give one example, conclude.' }
    : words < 60 ? { label: 'Too short', color: 'var(--coral)', tip: 'Under 60 words usually reads as unprepared. Add a reason and one real example.' }
    : words <= 300 ? { label: 'Healthy length', color: 'var(--accent)', tip: 'This is the sweet spot for most GDBs — clear, complete, and respectful of the reader.' }
    : { label: 'Getting long', color: 'var(--amber)', tip: 'Long GDBs lose marks when they wander. Cut repetition and keep one strong thread.' };
  var drafts = store.drafts();
  return head('Tool 08 · Writing', 'GDB Drafter', 'The problem: GDB boards open for 2–3 days, and rushed posts written at midnight read like it. Draft here calmly — with live counts and structure help — then paste into VULMS.') +
    '<div class="grid lg-2col" style="gap:24px"><div class="card" style="padding:24px;display:grid;gap:16px;height:fit-content">' +
    '<div class="grid gdb-head" style="gap:16px"><div><label class="field-label" for="gdb-title">GDB topic / title</label><input id="gdb-title" class="field" value="' + esc(u.title) + '" placeholder="e.g. Should AI tools be allowed in assignments?"></div>' +
    '<div><label class="field-label" for="gdb-code">Course code</label><input id="gdb-code" class="field" value="' + esc(u.courseCode) + '" placeholder="CS101"></div></div>' +
    '<div><label class="field-label" for="gdb-body">Your draft</label><textarea id="gdb-body" class="field" style="min-height:260px;font-size:1.05rem;line-height:1.7" placeholder="Write in your own words. Structure that scores: 1) your clear position, 2) one or two reasons, 3) a real example, 4) a short conclusion.">' + esc(content) + '</textarea></div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px">' + GDB_STARTERS.map(function (s) { return '<button type="button" class="chip" data-starter="' + esc(s) + '">+ “' + esc(s.slice(0, 34)) + '…”</button>'; }).join('') + '</div>' +
    '<div class="grid g4" style="gap:12px" id="gdbCounts">' + gdbCountsHtml(chars, words, sentences, readSecs) + '</div>' +
    '<div style="background:var(--accent-soft);border-radius:16px;padding:16px"><p style="font-weight:700;color:' + quality.color + '">Length check: ' + quality.label + '</p><p class="small" style="margin-top:4px">' + quality.tip + '</p><p class="small" style="margin-top:4px">Originality check: never paste internet text — VU penalises copied GDBs. Your own simple words score better.</p></div>' +
    '<div id="gdbMsg">' + (u.savedMsg ? '<div class="note-ok" role="status">' + esc(u.savedMsg) + '</div>' : '') + '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px"><button type="button" class="btn-primary" id="gdbSave">' + (u.draftId != null ? 'Update draft' : 'Save draft') + '</button>' +
    '<button type="button" class="btn-ghost" id="gdbCopy">Copy text</button><button type="button" class="btn-ghost" id="gdbNew">New draft</button></div></div>' +
    '<div><h2 class="font-display" style="font-size:1.25rem;margin-bottom:12px">Saved drafts</h2>' +
    (drafts.length === 0 ? empty('No drafts saved', 'Drafts you save appear here, ready to copy into VULMS the moment a GDB opens.')
      : drafts.map(function (d) {
        var w = d.content.trim() === '' ? 0 : d.content.trim().split(/\s+/).length;
        return '<article class="card mb" style="padding:16px"><p style="font-weight:700">' + esc(d.title) + '</p><p class="dim small" style="margin-top:4px">' + esc(d.courseCode || 'No course') + ' · ' + w + ' words · updated ' + fmtDate(d.updatedAt) + '</p><div style="margin-top:12px;display:flex;gap:8px"><button type="button" class="btn-ghost btn-sm" data-opendraft="' + d.id + '">Open in editor</button><button type="button" class="btn-danger" data-deldraft="' + d.id + '">Delete</button></div></article>';
      }).join('')) + '</div></div>';
}
function gdbCountsHtml(chars, words, sentences, readSecs) {
  return [['Characters', String(chars)], ['Words', String(words)], ['Sentences', String(sentences)], ['Reading time', readSecs + 's']].map(function (x) {
    return '<div style="background:var(--surface-2);border-radius:16px;padding:12px;text-align:center"><p class="font-display" style="font-size:1.5rem;font-weight:700">' + x[1] + '</p><p class="small" style="font-weight:600;color:var(--dim)">' + x[0] + '</p></div>';
  }).join('');
}
gdbView.onMount = function () {
  var u = UI.gdb; if (!u) return;
  var body = $('gdb-body');
  body.addEventListener('input', function () {
    u.content = body.value; u.title = $('gdb-title').value; u.courseCode = $('gdb-code').value;
    var chars = u.content.length, words = u.content.trim() === '' ? 0 : u.content.trim().split(/\s+/).length;
    var sentences = u.content.split(/[.!?]+/).filter(function (s) { return s.trim().length; }).length;
    $('gdbCounts').innerHTML = gdbCountsHtml(chars, words, sentences, Math.max(0, Math.round(words / 200 * 60)));
  });
  document.querySelectorAll('[data-starter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = b.getAttribute('data-starter');
      u.content = u.content ? u.content.replace(/\s+$/, '') + ' ' + s + ' ' : s + ' ';
      render();
    });
  });
  $('gdbSave').addEventListener('click', function () {
    var title = $('gdb-title').value.trim(); if (!title) { $('gdbMsg').innerHTML = '<div class="note-warn" role="alert">Give your draft a title first.</div>'; return; }
    var arr = store.drafts();
    var now = new Date().toISOString();
    if (u.draftId != null) {
      arr.forEach(function (d) { if (String(d.id) === String(u.draftId)) { d.title = title; d.courseCode = $('gdb-code').value.trim().toUpperCase(); d.content = $('gdb-body').value; d.updatedAt = now; } });
    } else {
      var id = uid(); u.draftId = id;
      arr.unshift({ id: id, title: title, courseCode: $('gdb-code').value.trim().toUpperCase(), content: $('gdb-body').value, createdAt: now, updatedAt: now });
    }
    save('drafts', arr);
    u.savedMsg = 'Draft saved. Paste it into VULMS when the GDB board is open.';
    render();
  });
  $('gdbCopy').addEventListener('click', function () {
    var btn = $('gdbCopy');
    if (navigator.clipboard) navigator.clipboard.writeText($('gdb-body').value).catch(function () {});
    btn.textContent = 'Copied ✓'; setTimeout(function () { if ($('gdbCopy')) $('gdbCopy').textContent = 'Copy text'; }, 2000);
  });
  $('gdbNew').addEventListener('click', function () { UI.gdb = { draftId: null, title: '', courseCode: '', content: '' }; render(); });
  document.querySelectorAll('[data-opendraft]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = store.drafts().find(function (x) { return String(x.id) === b.getAttribute('data-opendraft'); });
      if (d) { UI.gdb = { draftId: d.id, title: d.title, courseCode: d.courseCode, content: d.content }; render(); }
    });
  });
  document.querySelectorAll('[data-deldraft]').forEach(function (b) {
    b.addEventListener('click', function () { del('drafts', b.getAttribute('data-deldraft')); });
  });
};

/* ---------- Datesheet scheduler ---------- */
var DS_SESSIONS = ['Morning', 'Evening'];
function datesheetView() {
  UI.dsStart = UI.dsStart || (function () { var d = new Date(); d.setDate(d.getDate() + 7); return isoDay(d); })();
  var list = store.datesheet();
  var days = [];
  var base = new Date(UI.dsStart + 'T00:00:00');
  if (!isNaN(base.getTime())) for (var i = 0; i < 14; i++) { var d = new Date(base); d.setDate(base.getDate() + i); days.push(isoDay(d)); }
  function dayLoad(date) { return list.filter(function (x) { return x.examDate === date; }).length; }
  var clash = list.some(function (x) { return list.some(function (y) { return y.id !== x.id && y.examDate === x.examDate && y.session === x.session; }); });
  var heavyDays = days.filter(function (d) { return dayLoad(d) >= 2; });
  var outside = list.filter(function (x) { return days.indexOf(x.examDate) === -1; });
  return head('Tool 09 · Exams', 'Datesheet Scheduler', 'The problem: two brutal papers on one day, discovered after the real datesheet closed. Add your subjects, drag them across the calendar (or use the date pickers on touch screens), and test your plan until it feels human.') +
    '<div class="card mb" style="padding:20px;display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end">' +
    '<div style="flex:1;min-width:160px"><label class="field-label" for="ds-code">Subject code</label><input id="ds-code" class="field" placeholder="CS101"></div>' +
    '<div style="flex:1;min-width:180px"><label class="field-label" for="ds-name">Subject name</label><input id="ds-name" class="field" placeholder="Introduction to Computing"></div>' +
    '<button type="button" class="btn-primary" id="dsAdd">Add subject</button>' +
    '<div><label class="field-label" for="ds-start">Exam window starts</label><input id="ds-start" type="date" class="field" value="' + esc(UI.dsStart) + '"></div></div>' +
    '<div id="dsMsg"></div>' +
    ((clash || heavyDays.length) ? '<div style="margin-top:16px;display:grid;gap:8px" role="alert">' +
      (clash ? '<p class="note-bad">⚠ Clash detected: two subjects share the same date and session — impossible in a real datesheet. Move one of them.</p>' : '') +
      (heavyDays.length ? '<p class="note-warn">Heads up: ' + heavyDays.map(function (d) { return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }).join(', ') + ' ha' + (heavyDays.length === 1 ? 's' : 've') + ' 2 papers. Survivable — but only with serious preparation gaps before them.</p>' : '') + '</div>' : '') +
    '<div class="grid sm2 lg-5 mt" style="gap:16px">' + days.map(function (date) {
      var dd = new Date(date + 'T00:00:00');
      var dayItems = list.filter(function (x) { return x.examDate === date; });
      return '<div class="card" style="min-height:176px;padding:16px"><p class="font-display" style="font-weight:700">' + dd.toLocaleDateString(undefined, { weekday: 'short' }) + '<span style="display:block;font-family:system-ui;font-size:.85rem;font-weight:600;color:var(--dim)">' + dd.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + '</span></p>' +
        DS_SESSIONS.map(function (session) {
          var slot = dayItems.filter(function (x) { return x.session === session; });
          return '<div class="ds-slot" data-slot="' + date + '|' + session + '" style="margin-top:12px;border:2px dashed var(--border);border-radius:12px;padding:8px"><p class="small" style="font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--dim)">' + session + '</p>' +
            (slot.length === 0 ? '<p class="small dim" style="padding:4px 0">Drop a subject here</p>' :
              slot.map(function (it) {
                return '<div draggable="true" data-drag="' + it.id + '" style="margin-top:6px;cursor:grab;background:var(--accent-soft);border-radius:8px;padding:8px 10px"><p class="small" style="font-weight:700">' + esc(it.courseCode) + '</p>' + (it.courseName ? '<p class="small dim">' + esc(it.courseName) + '</p>' : '') +
                  '<div style="margin-top:6px;display:flex;gap:6px;align-items:center"><label class="sr-only" for="move-date-' + it.id + '">Move ' + esc(it.courseCode) + ' to date</label><input id="move-date-' + it.id + '" type="date" data-movedate="' + it.id + '" value="' + esc(it.examDate) + '" style="width:100%;min-width:0;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text);padding:2px 4px;font-size:.75rem">' +
                  '<button type="button" class="btn-danger" style="min-height:28px;padding:2px 10px" aria-label="Remove ' + esc(it.courseCode) + ' from datesheet" data-delds="' + it.id + '">✕</button></div></div>';
              }).join('')) + '</div>';
        }).join('') + '</div>';
    }).join('') + '</div>' +
    (outside.length ? '<div class="card mt" style="padding:20px"><h2 class="font-display" style="font-size:1.1rem">Subjects outside this 14-day window</h2><ul class="mt" style="display:grid;gap:6px">' + outside.map(function (it) { return '<li style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:.9rem"><span><strong>' + esc(it.courseCode) + '</strong> — ' + esc(it.examDate) + ' · ' + esc(it.session) + '</span><button type="button" class="btn-danger" data-delds="' + it.id + '">Remove</button></li>'; }).join('') + '</ul></div>' : '') +
    (list.length === 0 ? '<div class="mt">' + empty('No subjects yet', 'Add every subject you\u2019re taking this semester, then drag them into a plan with breathing room before the tough ones.') + '</div>' : '');
}
datesheetView.onMount = function () {
  var start = $('ds-start'); if (!start) return;
  start.addEventListener('change', function () { UI.dsStart = start.value; render(); });
  $('dsAdd').addEventListener('click', function () {
    var code = $('ds-code').value.trim().toUpperCase(); if (!code) return;
    var arr = store.datesheet();
    var base = new Date(UI.dsStart + 'T00:00:00');
    var first = isNaN(base.getTime()) ? UI.dsStart : isoDay(base);
    arr.push({ id: uid(), courseCode: code, courseName: $('ds-name').value.trim(), examDate: first, session: 'Morning', createdAt: new Date().toISOString() });
    save('datesheet', arr);
    $('dsMsg').innerHTML = '<div class="note-ok" role="status">Subject added to the first day — drag it to your ideal slot.</div>';
    render();
  });
  function placeItem(id, date, session) {
    var arr = store.datesheet();
    arr.forEach(function (x) { if (String(x.id) === String(id)) { x.examDate = date; x.session = session; } });
    save('datesheet', arr); render();
  }
  document.querySelectorAll('[data-drag]').forEach(function (el) {
    el.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', el.getAttribute('data-drag')); });
  });
  document.querySelectorAll('[data-slot]').forEach(function (el) {
    el.addEventListener('dragover', function (e) { e.preventDefault(); });
    el.addEventListener('drop', function (e) {
      e.preventDefault();
      var id = e.dataTransfer.getData('text/plain'); if (!id) return;
      var p = el.getAttribute('data-slot').split('|'); placeItem(id, p[0], p[1]);
    });
  });
  document.querySelectorAll('[data-movedate]').forEach(function (el) {
    el.addEventListener('change', function () {
      var arr = store.datesheet();
      arr.forEach(function (x) { if (String(x.id) === el.getAttribute('data-movedate')) x.examDate = el.value; });
      save('datesheet', arr); render();
    });
  });
  document.querySelectorAll('[data-delds]').forEach(function (b) {
    b.addEventListener('click', function () { del('datesheet', b.getAttribute('data-delds')); });
  });
};

/* ---------- Quiz ---------- */
var QUIZ_SECONDS_PER_Q = 30;
function quizView() {
  UI.quiz = UI.quiz || { subject: 'Mixed (all subjects)', started: false, finished: false, questions: [], idx: 0, picked: null, score: 0, timeLeft: QUIZ_SECONDS_PER_Q, elapsed: 0 };
  var u = UI.quiz;
  var subjects = ['Mixed (all subjects)'].concat(Array.from(new Set(D.QUIZ_BANK.map(function (q) { return q.subject; }))));
  var attempts = store.quizAttempts();
  var html = head('Tool 10 · Practice', 'Quiz Practice Engine', 'The problem: real VULMS quizzes are timed and unforgiving — the first time you feel that pressure should not be when marks are on the line. Practice here: 30 seconds per question, no pausing.');
  if (!u.started && !u.finished) {
    html += '<div class="card" style="padding:24px;display:grid;gap:20px"><div><label class="field-label" for="quiz-subject">Practice set</label><select id="quiz-subject" class="field">' + subjects.map(function (s) { var n = s === 'Mixed (all subjects)' ? D.QUIZ_BANK.length : D.QUIZ_BANK.filter(function (q) { return q.subject === s; }).length; return '<option value="' + esc(s) + '"' + (u.subject === s ? ' selected' : '') + '>' + esc(s) + ' (' + n + ' question' + (n === 1 ? '' : 's') + ')</option>'; }).join('') + '</select></div>' +
      '<ul style="list-style:disc;padding-left:24px;color:var(--dim);display:grid;gap:4px"><li>Up to 10 questions, ' + QUIZ_SECONDS_PER_Q + ' seconds each — just like the real pressure.</li><li>Questions are sample practice questions written for this site, in the style of VU course basics.</li><li>Your attempts are saved in this browser so you can watch yourself get faster.</li></ul>' +
      '<button type="button" class="btn-primary" style="width:100%" id="quizStart">Start practice quiz</button></div>';
  }
  if (u.started && u.questions[u.idx]) {
    var cur = u.questions[u.idx];
    html += '<div class="card" style="padding:24px"><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center"><span class="chip">' + esc(cur.subject) + '</span><span class="chip chip-amber">Question ' + (u.idx + 1) + ' of ' + u.questions.length + '</span><span class="chip" id="quizTimer" style="' + (u.timeLeft <= 8 ? 'background:var(--coral-soft);color:var(--coral)' : '') + '" aria-live="polite">⏱ ' + u.timeLeft + 's</span></div>' +
      '<div class="progress" style="margin-top:16px;height:12px"><div style="width:' + (u.idx / u.questions.length * 100) + '%"></div></div>' +
      '<h2 class="font-display" style="margin-top:20px;font-size:1.5rem">' + esc(cur.q) + '</h2><div style="margin-top:20px;display:grid;gap:12px" id="quizOpts">' +
      cur.options.map(function (opt, i) {
        var isAns = u.picked != null && i === cur.answer, isWrong = u.picked === i && i !== cur.answer;
        return '<button type="button" data-opt="' + i + '" ' + (u.picked != null ? 'disabled' : '') + ' style="min-height:56px;border-radius:16px;border:2px solid ' + (isAns ? 'var(--accent)' : isWrong ? 'var(--coral)' : 'var(--border)') + ';background:' + (isAns ? 'var(--accent-soft)' : isWrong ? 'var(--coral-soft)' : 'var(--surface)') + ';color:var(--text);padding:12px 20px;text-align:left;font-size:1rem;font-weight:600"><span style="margin-right:8px;font-weight:900;color:var(--amber)">' + ['A', 'B', 'C', 'D'][i] + '.</span>' + esc(opt) + '</button>';
      }).join('') + '</div>' +
      (u.picked != null ? '<p style="margin-top:16px;background:var(--surface-2);border-radius:12px;padding:12px 16px;font-size:.9rem" role="status">' + (u.picked === cur.answer ? '✓ Correct! ' : '✗ Not quite — the answer is ' + ['A', 'B', 'C', 'D'][cur.answer] + '. ') + esc(cur.explain) + '</p>' : '') +
      '<p style="margin-top:16px;font-size:.9rem;font-weight:600;color:var(--dim)">Score so far: ' + u.score + '</p></div>';
  }
  if (u.finished) {
    html += '<div class="card" style="padding:24px;text-align:center"><p class="font-display" style="font-size:3rem;font-weight:900;color:var(--accent)">' + u.score + '/' + u.questions.length + '</p>' +
      '<p style="margin-top:8px;font-size:1.1rem">' + (u.score >= 8 ? 'Outstanding — real-quiz ready! 🏆' : u.score >= 5 ? 'Solid! A little more revision and you\u2019re dangerous.' : 'Good reps — every practice round makes the real quiz calmer.') + '</p>' +
      '<p class="dim small" style="margin-top:4px">Finished in ' + u.elapsed + ' seconds. This attempt has been saved to your history.</p>' +
      '<div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center"><button type="button" class="btn-primary" id="quizAgain">Practice again</button><button type="button" class="btn-ghost" id="quizChange">Change subject</button></div></div>';
  }
  if (attempts.length) {
    html += '<div class="card mt" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Your recent attempts</h2><ul class="list-divide" style="margin-top:12px;list-style:none;padding:0;margin-bottom:0">' +
      attempts.slice(0, 6).map(function (a) { return '<li style="display:flex;justify-content:space-between"><span style="font-weight:700">' + a.score + '/' + a.total + ' correct</span><span class="dim small">' + a.seconds + 's · ' + fmtDate(a.createdAt) + '</span></li>'; }).join('') + '</ul></div>';
  }
  return '<div style="max-width:48rem;margin:0 auto">' + html + '</div>';
}
quizView.onMount = function () {
  var u = UI.quiz; if (!u) return;
  function start() {
    var pool = D.QUIZ_BANK.filter(function (q) { return u.subject === 'Mixed (all subjects)' || q.subject === u.subject; });
    var shuffled = pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, Math.min(10, pool.length));
    u.questions = shuffled; u.idx = 0; u.picked = null; u.score = 0; u.elapsed = 0; u.timeLeft = QUIZ_SECONDS_PER_Q; u.finished = false; u.started = true;
    render();
  }
  function finish(finalScore) {
    u.finished = true; u.started = false;
    var arr = store.quizAttempts();
    arr.unshift({ id: uid(), score: finalScore, total: u.questions.length, seconds: u.elapsed, createdAt: new Date().toISOString() });
    save('quizAttempts', arr.slice(0, 20));
    render();
  }
  var startBtn = $('quizStart');
  if (startBtn) startBtn.addEventListener('click', function () { u.subject = $('quiz-subject').value; start(); });
  var again = $('quizAgain'); if (again) again.addEventListener('click', start);
  var ch = $('quizChange'); if (ch) ch.addEventListener('click', function () { u.finished = false; u.started = false; render(); });
  if (u.started && u.questions.length) {
    every(function () {
      u.elapsed++;
      u.timeLeft--;
      var t = $('quizTimer'); if (t) t.textContent = '⏱ ' + Math.max(0, u.timeLeft) + 's';
      if (u.timeLeft <= 0) {
        u.picked = null; u.timeLeft = QUIZ_SECONDS_PER_Q;
        if (u.idx + 1 >= u.questions.length) finish(u.score); else { u.idx++; render(); }
      }
    }, 1000);
    document.querySelectorAll('[data-opt]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (u.picked != null) return;
        var opt = +b.getAttribute('data-opt'), q = u.questions[u.idx];
        u.picked = opt;
        var newScore = opt === q.answer ? u.score + 1 : u.score;
        if (opt === q.answer) u.score = newScore;
        render();
        setTimeout(function () {
          if (view !== 'quiz') return;
          u.picked = null; u.timeLeft = QUIZ_SECONDS_PER_Q;
          if (u.idx + 1 >= u.questions.length) finish(newScore); else { u.idx++; render(); }
        }, 900);
      });
    });
  }
};

/* ---------- Past papers & handouts guide ---------- */
var PAPER_TYPES = ['Midterm paper', 'Final term paper', 'Quiz paper'];
function papersView() {
  var list = store.papers();
  var scored = list.filter(function (p) { return p.total > 0; });
  var avg = scored.length ? Math.round(scored.reduce(function (s, p) { return s + (p.correct / p.total * 100); }, 0) / scored.length) : null;
  return head('Tool 15 · Exam prep', 'Past Papers & Handouts Guide', 'The problem: students revise from random screenshots and never know which papers they have actually solved. Here is where the real material lives — and a tracker so every paper you finish counts.') +
    '<div class="grid lg-side2" style="gap:24px"><div style="display:grid;gap:16px;align-content:start">' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">1 · Start with the official handouts</h2><p style="margin-top:8px">Every VU course has an official handout (PDF) in the Downloads section of that course on VULMS. Download all of them at the start of the semester — they are the syllabus, and exam questions come from them, not from random notes.</p><div style="margin-top:12px"><a class="btn-primary" href="' + D.VULMS_URL + '" target="_blank" rel="noreferrer">Open VULMS — course downloads ↗</a></div></div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">2 · Where real past papers live</h2><ul style="margin-top:8px;list-style:disc;padding-left:24px;display:grid;gap:6px"><li><strong>Your seniors</strong> — ask in Ask the Community here, or your program\u2019s student group, for the last 2–3 semesters\u2019 papers of your exact course code.</li><li><strong>Your campus</strong> — many VU campuses keep paper collections and notice-board copies; ask the campus help desk.</li><li><strong>Your own solved papers</strong> — the tracker on this page is your personal bank: log each paper you solve and your score, and it grows into revision material for finals.</li></ul><p class="dim small" style="margin-top:8px">This site does not host paper files — papers change every semester, and a stale \u201csolved\u201d file teaches the wrong answers. Use the sources above for the current ones.</p></div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">3 · How to use a paper properly</h2><ol style="margin-top:8px;list-style:decimal;padding-left:24px;display:grid;gap:6px"><li>Solve it <strong>timed</strong> — midterm 60–90 minutes, final as per your datesheet slot — no handout open.</li><li>Mark it against the handout, not against a friend\u2019s memory.</li><li>Write down every question you got wrong and the lecture number it came from.</li><li>Re-solve the wrong ones a week later. That second pass is where the marks are.</li><li>Log it in the tracker — seeing \u201c7 papers solved, 82% average\u201d is the best pre-exam confidence there is.</li></ol></div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">⚠ What to avoid</h2><ul style="margin-top:8px;list-style:disc;padding-left:24px;display:grid;gap:6px"><li>Don\u2019t buy \u201c100% solved / guaranteed\u201d paper packs — they are usually wrong, outdated, or both.</li><li>Don\u2019t use tools that auto-solve quizzes or skip lectures for you — VU penalises it, and you learn nothing for the final.</li><li>Don\u2019t trust an answer key you can\u2019t check against the handout.</li></ul></div></div>' +
    '<div style="display:grid;gap:16px;align-content:start">' +
    '<div class="grid sm2" style="gap:16px">' + stat('Papers solved', String(list.length), 'Logged in this browser') + stat('Average score', avg == null ? '—' : avg + '%', scored.length ? 'Across ' + scored.length + ' scored paper(s)' : 'Add a score to see it') + '</div>' +
    '<form class="card" style="padding:24px;display:grid;gap:16px" id="paperForm"><h2 class="font-display" style="font-size:1.25rem">Log a paper you solved</h2>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="pp-code">Course code</label><input id="pp-code" class="field" placeholder="CS101" required></div>' +
    '<div><label class="field-label" for="pp-type">Paper type</label><select id="pp-type" class="field">' + PAPER_TYPES.map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select></div></div>' +
    '<div><label class="field-label" for="pp-term">Semester / session</label><input id="pp-term" class="field" placeholder="e.g. Fall 2025 midterm"></div>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="pp-correct">Questions right (optional)</label><input id="pp-correct" type="number" min="0" max="200" class="field" placeholder="e.g. 41"></div>' +
    '<div><label class="field-label" for="pp-total">Out of (optional)</label><input id="pp-total" type="number" min="1" max="200" class="field" placeholder="e.g. 50"></div></div>' +
    '<div id="ppMsg"></div><button type="submit" class="btn-primary" style="width:100%">Save to my paper bank</button></form>' +
    '<div><h2 class="font-display" style="font-size:1.25rem;margin-bottom:12px">My paper bank</h2>' +
    (list.length === 0 ? empty('No papers logged yet', 'Solve a past paper, log it here with your score, and watch this list — and your average — grow through the semester.')
      : list.map(function (p) {
        var pct = p.total > 0 ? Math.round(p.correct / p.total * 100) : null;
        return '<article class="card mb" style="padding:16px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><p style="font-weight:700">' + esc(p.courseCode) + ' <span class="dim">· ' + esc(p.paperType) + (p.term ? ' · ' + esc(p.term) : '') + '</span></p>' + (pct != null ? '<span class="chip chip-amber">' + pct + '% (' + p.correct + '/' + p.total + ')</span>' : '<span class="chip">Solved</span>') + '</div><div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center"><span class="dim small">' + fmtDate(p.createdAt) + '</span><button type="button" class="btn-danger" data-delpaper="' + p.id + '">Remove</button></div></article>';
      }).join('')) + '</div></div></div>';
}
papersView.onMount = function () {
  var f = $('paperForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var code = $('pp-code').value.trim().toUpperCase(); if (!code) return;
    var correct = +$('pp-correct').value || 0, total = +$('pp-total').value || 0;
    if (total > 0 && correct > total) { $('ppMsg').innerHTML = '<div class="note-warn" role="alert">\u201cQuestions right\u201d can\u2019t be more than \u201cOut of\u201d.</div>'; return; }
    var arr = store.papers();
    arr.unshift({ id: uid(), courseCode: code, paperType: $('pp-type').value, term: $('pp-term').value.trim(), correct: correct, total: total, createdAt: new Date().toISOString() });
    save('papers', arr); render();
  });
  document.querySelectorAll('[data-delpaper]').forEach(function (b) {
    b.addEventListener('click', function () { del('papers', b.getAttribute('data-delpaper')); });
  });
};

/* ---------- Assignments & GDB guide + deadlines tracker ---------- */
function assignmentsView() {
  var list = store.deadlines().slice().sort(function (a, b) { return (a.dueDate || '').localeCompare(b.dueDate || ''); });
  function daysLeft(d) {
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var due = new Date(d + 'T00:00:00');
    if (isNaN(due.getTime())) return null;
    return Math.round((due.getTime() - now.getTime()) / 86400000);
  }
  return head('Tool 16 · Deadlines', 'Assignments & GDB Guide', 'The problem: VU never extends a deadline — the upload link simply closes. This page explains exactly how assignments and GDBs work, what they are worth, and keeps every deadline you enter in one sorted list so nothing sneaks up on you.') +
    '<div class="grid lg-side2" style="gap:24px"><div style="display:grid;gap:16px;align-content:start">' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">1 · How a VU assignment works</h2><ul style="margin-top:8px;list-style:disc;padding-left:24px;display:grid;gap:6px;line-height:1.6"><li>Assignments appear on your course page on VULMS — usually one per course in each half of the semester, with a fixed due date and time.</li><li>You upload <strong>one file</strong> in the exact format the page asks for (usually .doc/.docx or PDF; sometimes a .zip for programming tasks).</li><li>The link <strong>closes at the deadline</strong> — late uploads are not accepted. Submit at least 24 hours early: last-hour server rush and load-shedding are the most common reasons students lose these marks.</li><li>After uploading, <strong>re-download your own file</strong> from VULMS and open it. A wrong format or corrupt file means zero marks.</li><li>If the deadline has not passed, most courses let you upload again — the latest file replaces the old one.</li></ul></div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">2 · How a GDB works</h2><ul style="margin-top:8px;list-style:disc;padding-left:24px;display:grid;gap:6px;line-height:1.6"><li>A Graded Discussion Board is a short written answer on a topic the teacher posts — the board stays open only <strong>2–3 days</strong>.</li><li>It usually carries <strong>2–5%</strong> of the course marks, graded on relevance, clarity and originality.</li><li>Write it <strong>in your own words</strong> — copied text from the internet or another student gets zero, and VU checks.</li><li>Structure that works: your clear position, one or two reasons, one real example, one short conclusion. Draft it in the GDB Drafter here first, then paste it into VULMS.</li></ul><div style="margin-top:12px"><button type="button" class="btn-primary" data-go="gdb">Open GDB Drafter →</button></div></div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">3 · What each piece is worth</h2><p style="margin-top:8px">A very common VU scheme — always check your own course page, because it can differ:</p><ul style="margin-top:8px;list-style:none;padding:0;display:grid;gap:6px" class="list-divide">' +
    [['Assignments', '10%'], ['Quizzes', '3–10%'], ['GDB', '2–5%'], ['Midterm exam', '35%'], ['Final term exam', '50%']].map(function (r) { return '<li style="display:flex;justify-content:space-between"><span>' + r[0] + '</span><strong>' + r[1] + '</strong></li>'; }).join('') + '</ul>' +
    '<p style="margin-top:12px;background:var(--amber-soft);border-radius:12px;padding:12px 16px;font-size:.9rem"><strong>Passing needs all three:</strong> at least 20% in the first half (assignments + quizzes + GDB + midterm), at least 20% in the final term, and at least 40% overall. Fail any one and the course is an F — even with a good total. Try it in the CGPA Planner\u2019s pass/fail checker.</p></div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">⚠ What not to do</h2><ul style="margin-top:8px;list-style:disc;padding-left:24px;display:grid;gap:6px;line-height:1.6"><li>Don\u2019t copy assignments or GDBs from the internet or a friend — VU uses plagiarism checks and copied work gets zero.</li><li>Don\u2019t buy \u201csolved assignment\u201d packs — they are often wrong for your semester\u2019s questions.</li><li>Don\u2019t use auto-solve tools or ask anyone to attempt your quizzes for you — it is a disciplinary matter, not a shortcut.</li><li>Don\u2019t wait for the last hour: VULMS does not extend deadlines because a student missed an announcement.</li></ul></div></div>' +
    '<div style="display:grid;gap:16px;align-content:start">' +
    '<form class="card" style="padding:24px;display:grid;gap:16px" id="deadlineForm"><h2 class="font-display" style="font-size:1.25rem">My deadlines — never miss one</h2>' +
    '<div><label class="field-label" for="dl-title">What is due?</label><input id="dl-title" class="field" placeholder="e.g. CS101 Assignment 1" required></div>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="dl-type">Type</label><select id="dl-type" class="field">' + ['Assignment', 'Quiz', 'GDB', 'Fee challan', 'Exam', 'Other'].map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select></div>' +
    '<div><label class="field-label" for="dl-code">Course code</label><input id="dl-code" class="field" placeholder="CS101"></div></div>' +
    '<div><label class="field-label" for="dl-date">Due date</label><input id="dl-date" type="date" class="field" required></div>' +
    '<div id="dlMsg"></div><button type="submit" class="btn-primary" style="width:100%">Add deadline</button>' +
    '<p class="dim small">Your deadlines live in this browser only. Copy them from the announcements on VULMS — VU announces every due date there first.</p></form>' +
    '<div><h2 class="font-display" style="font-size:1.25rem;margin-bottom:12px">Upcoming deadlines</h2>' +
    (list.length === 0 ? empty('No deadlines tracked yet', 'Add your next assignment, quiz or GDB due date from VULMS above. This list sorts itself by date, and the urgent ones jump to the top with a warning.')
      : list.map(function (d) {
        var dl = daysLeft(d.dueDate);
        var chip = dl == null ? '' : dl < 0 ? '<span class="chip" style="background:var(--coral-soft);color:var(--coral)">Overdue by ' + (-dl) + ' day' + (-dl === 1 ? '' : 's') + '</span>'
          : dl === 0 ? '<span class="chip" style="background:var(--coral-soft);color:var(--coral)">Due today!</span>'
          : dl === 1 ? '<span class="chip chip-amber">Due tomorrow</span>'
          : dl <= 3 ? '<span class="chip chip-amber">' + dl + ' days left</span>'
          : '<span class="chip">' + dl + ' days left</span>';
        return '<article class="card mb" style="padding:16px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><p style="font-weight:700">' + esc(d.title) + ' <span class="dim">· ' + esc(d.type) + (d.courseCode ? ' · ' + esc(d.courseCode) : '') + '</span></p>' + chip + '</div><div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center"><span class="dim small">Due ' + fmtDate(d.dueDate) + '</span><button type="button" class="btn-danger" data-deldeadline="' + d.id + '">Done / Remove</button></div></article>';
      }).join('')) + '</div></div></div>';
}
assignmentsView.onMount = function () {
  var f = $('deadlineForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = $('dl-title').value.trim(), date = $('dl-date').value;
    if (!title || !date) return;
    var arr = store.deadlines();
    arr.unshift({ id: uid(), title: title, type: $('dl-type').value, courseCode: $('dl-code').value.trim().toUpperCase(), dueDate: date, createdAt: new Date().toISOString() });
    save('deadlines', arr); render();
  });
  document.querySelectorAll('[data-deldeadline]').forEach(function (b) {
    b.addEventListener('click', function () { del('deadlines', b.getAttribute('data-deldeadline')); });
  });
};

/* ---------- CGPA planner ---------- */
function cgpaLabelText(key, u) {
  if (key === 'currentCgpa') return 'Current CGPA: ' + u.currentCgpa.toFixed(2);
  if (key === 'creditsDone') return 'Credit hours completed: ' + u.creditsDone;
  if (key === 'creditsLeft') return 'Credit hours remaining: ' + u.creditsLeft;
  if (key === 'target') return 'Target CGPA: ' + u.target.toFixed(2);
  return 'Average credits per course: ' + u.creditsPerCourse;
}
function cgpaResultsHtml(u) {
  var total = u.creditsDone + u.creditsLeft;
  var required = u.creditsLeft > 0 ? (u.target * total - u.currentCgpa * u.creditsDone) / u.creditsLeft : 0;
  var coursesLeft = Math.max(1, Math.round(u.creditsLeft / u.creditsPerCourse));
  var aFraction = Math.min(1, Math.max(0, required - 3));
  var aCourses = Math.round(aFraction * coursesLeft), bCourses = Math.max(0, coursesLeft - aCourses);
  function scenario(avg) { return ((u.currentCgpa * u.creditsDone + avg * u.creditsLeft) / Math.max(1, total)).toFixed(2); }
  var verdict = required <= u.currentCgpa && required <= 3 ? { text: 'You\u2019re on safe ground — even a modest semester keeps this target within reach. Protect it with consistency.', bg: 'var(--accent-soft)' }
    : required > 4 ? { text: 'Mathematically out of reach in the remaining credits — even straight A\u2019s can\u2019t pull it there. Set the target lower, or extend it: repeating your lowest-grade courses replaces weak grades and is the fastest legal way to raise a CGPA.', bg: 'var(--coral-soft)' }
    : required > 3.67 ? { text: 'Possible, but only with a near-perfect run. Treat every course like it matters — because at this target, it does.', bg: 'var(--coral-soft)' }
    : { text: 'Achievable with a strong, planned semester. Use the A/B mix below as your personal contract.', bg: 'var(--accent-soft)' };
  return '<div class="card" style="padding:24px;text-align:center"><p class="small" style="font-weight:600;color:var(--dim)">Average GPA you must score on every remaining credit</p>' +
    '<p class="font-display" style="margin-top:4px;font-size:3.75rem;font-weight:900;color:' + (required > 4 ? 'var(--coral)' : 'var(--accent)') + '">' + (u.creditsLeft > 0 ? required.toFixed(2) : '—') + '</p>' +
    '<p class="dim">out of 4.00, across ' + u.creditsLeft + ' remaining credit hours (' + coursesLeft + ' courses)</p></div>' +
    '<div style="background:' + verdict.bg + ';border-radius:var(--radius);padding:20px" role="status"><p style="font-weight:500">' + verdict.text + '</p></div>' +
    (required <= 4 && required > 3 ? '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Your A/B contract</h2><p style="margin-top:8px">If your remaining ' + coursesLeft + ' courses split between A\u2019s (4.00) and B\u2019s (3.00), you need at least <strong style="color:var(--accent)">' + aCourses + ' A\u2019s</strong> and can afford <strong>' + bCourses + ' B\u2019s</strong> — anything below a B must be balanced by another A.</p></div>' : '') +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">What-if scenarios</h2><ul class="list-divide" style="margin-top:12px;list-style:none;padding:0;margin-bottom:0">' +
    D.GRADE_SCALE.slice(0, 6).map(function (g) { return '<li style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span>If every remaining course is a <strong>' + g.grade + '</strong> (' + g.points.toFixed(2) + ')</span><span class="chip chip-amber">Final CGPA ' + scenario(g.points) + '</span></li>'; }).join('') +
    '</ul><p class="dim small" style="margin-top:12px">Calculated on VU\u2019s standard grade-point scale. Remember VU also applies relative grading, and an F\u2019s credits stay in the denominator until the course is passed.</p></div>';
}
function cgpaView() {
  UI.cgpa = UI.cgpa || { currentCgpa: 2.6, creditsDone: 66, creditsLeft: 66, target: 3.2, creditsPerCourse: 3 };
  var u = UI.cgpa;
  var ds = degreeStats();
  var hasDegree = ds.courses.length > 0;
  var sliders = [
    ['cg-cur', 'Current CGPA: ' + u.currentCgpa.toFixed(2), u.currentCgpa, 0, 4, 0.05, 'currentCgpa'],
    ['cg-done', 'Credit hours completed: ' + u.creditsDone, u.creditsDone, 0, 300, 1, 'creditsDone'],
    ['cg-left', 'Credit hours remaining: ' + u.creditsLeft, u.creditsLeft, 1, 300, 1, 'creditsLeft'],
    ['cg-target', 'Target CGPA: ' + u.target.toFixed(2), u.target, 2, 4, 0.05, 'target'],
    ['cg-per', 'Average credits per course: ' + u.creditsPerCourse, u.creditsPerCourse, 1, 6, 1, 'creditsPerCourse']
  ];
  return head('Tool 11 · Grades', 'CGPA Target Planner', 'The problem: \u2018I need a 3.2\u2019 is a wish, not a plan. Enter where you are and where you want to be — this planner converts it into the exact average, and the exact number of A\u2019s, your remaining courses demand.') +
    '<div class="grid lg-side2" style="gap:24px"><div class="card" style="padding:24px;height:fit-content;display:grid;gap:20px">' +
    (hasDegree ? '<button type="button" class="btn-ghost" id="cgUseDegree" style="width:100%">↩ Use my Degree Dashboard data — CGPA ' + ds.cgpa.toFixed(2) + ', ' + ds.done + ' credits done</button>' : '') +
    sliders.map(function (f) { return '<div><label class="field-label" id="cg-lab-' + f[6] + '" for="' + f[0] + '">' + f[1] + '</label><input id="' + f[0] + '" type="range" min="' + f[3] + '" max="' + f[4] + '" step="' + f[5] + '" value="' + f[2] + '" data-cg="' + f[6] + '"></div>'; }).join('') +
    '<p class="dim small">Tip: your exact CGPA and credits are in your VULMS grade book — and the Degree Dashboard here computes them from your courses automatically.</p></div>' +
    '<div id="cgpaResults" style="display:grid;gap:20px;align-content:start">' + cgpaResultsHtml(u) + '</div></div>' +
    '<div class="grid lg2 mt" style="gap:24px">' +
    '<div class="card" style="padding:24px;display:grid;gap:16px;height:fit-content"><h2 class="font-display" style="font-size:1.25rem">✅ Pass / Fail checker</h2><p class="dim" style="font-size:.9rem">VU passes a course only if <strong>all three</strong> rules hold: at least 20% in the first half, at least 20% in the final term, and at least 40% overall. Enter your marks and see instantly.</p>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="pf-fa">First-half marks obtained</label><input id="pf-fa" type="number" min="0" max="200" class="field" placeholder="e.g. 32"></div><div><label class="field-label" for="pf-fat">First-half total marks</label><input id="pf-fat" type="number" min="1" max="200" class="field" value="50"></div></div>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="pf-fin">Final term marks obtained</label><input id="pf-fin" type="number" min="0" max="200" class="field" placeholder="e.g. 28"></div><div><label class="field-label" for="pf-fint">Final term total marks</label><input id="pf-fint" type="number" min="1" max="200" class="field" value="50"></div></div>' +
    '<div id="pfResult" role="status"><p class="dim small">Enter both halves to check the three rules.</p></div></div>' +
    '<div class="card" style="padding:24px;display:grid;gap:16px;height:fit-content"><h2 class="font-display" style="font-size:1.25rem">🔮 Final marks predictor</h2><p class="dim" style="font-size:.9rem">Most-asked question: <em>\u201cWhat do I need in the final term to get grade X?\u201d</em> Enter your first-half marks (out of 50) and your target grade — the answer is instant.</p>' +
    '<div class="grid g2" style="gap:12px"><div><label class="field-label" for="fp-fa">First-half marks (out of 50)</label><input id="fp-fa" type="number" min="0" max="50" class="field" placeholder="e.g. 32"></div>' +
    '<div><label class="field-label" for="fp-grade">Target grade</label><select id="fp-grade" class="field">' + D.GRADE_SCALE.slice(0, 10).map(function (g) { return '<option value="' + g.grade + '">' + g.grade + ' (' + g.range + ')</option>'; }).join('') + '</select></div></div>' +
    '<div id="fpResult" role="status"><p class="dim small">Enter your first-half marks to see what the final term must deliver.</p></div>' +
    '<p class="dim small">Grade boundaries use the standard VU scale and relative grading can shift them slightly — always confirm against your VULMS grade book.</p></div></div>';
}
cgpaView.onMount = function () {
  var useBtn = $('cgUseDegree');
  if (useBtn) useBtn.addEventListener('click', function () {
    var ds = degreeStats();
    UI.cgpa.currentCgpa = Math.round(ds.cgpa * 100) / 100;
    UI.cgpa.creditsDone = ds.done;
    UI.cgpa.creditsLeft = Math.max(1, ds.settings.totalCredits - ds.done);
    UI.cgpa.target = ds.settings.targetCgpa;
    render();
  });
  document.querySelectorAll('[data-cg]').forEach(function (el) {
    // Dragging a slider updates only its label and the results panel — no full
    // re-render, so the slider keeps focus and position while dragging.
    el.addEventListener('input', function () {
      var key = el.getAttribute('data-cg');
      UI.cgpa[key] = +el.value;
      var lab = $('cg-lab-' + key); if (lab) lab.textContent = cgpaLabelText(key, UI.cgpa);
      var res = $('cgpaResults'); if (res) res.innerHTML = cgpaResultsHtml(UI.cgpa);
    });
  });
  // Pass / fail checker — the three official VU rules, checked in place.
  function checkPassFail() {
    var fa = +$('pf-fa').value, fat = +$('pf-fat').value || 50, fin = +$('pf-fin').value, fint = +$('pf-fint').value || 50;
    var out = $('pfResult'); if (!out) return;
    if (!$('pf-fa').value || !$('pf-fin').value) { out.innerHTML = '<p class="dim small">Enter both halves to check the three rules.</p>'; return; }
    var fa50 = fa / fat * 50, fin50 = fin / fint * 50, agg = fa50 + fin50;
    var r1 = fa50 >= 10, r2 = fin50 >= 10, r3 = agg >= 40;
    function row(ok, label, detail) {
      return '<li style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span>' + (ok ? '✓ ' : '✗ ') + label + '</span><span class="chip" style="' + (ok ? '' : 'background:var(--coral-soft);color:var(--coral)') + '">' + detail + '</span></li>';
    }
    var pass = r1 && r2 && r3;
    out.innerHTML = '<ul class="list-divide" style="list-style:none;padding:0;margin:0;display:grid;gap:6px">' +
      row(r1, 'Rule 1 — first half ≥ 20%', fa50.toFixed(1) + ' / 50') +
      row(r2, 'Rule 2 — final term ≥ 20%', fin50.toFixed(1) + ' / 50') +
      row(r3, 'Rule 3 — overall ≥ 40%', agg.toFixed(1) + ' / 100') + '</ul>' +
      '<div style="margin-top:12px;border-radius:16px;padding:16px;background:' + (pass ? 'var(--accent-soft)' : 'var(--coral-soft)') + '" role="status"><p style="font-weight:700">' + (pass ? '✓ PASS — all three rules are met.' : '✗ FAIL — one or more rules are not met. Failing even one rule means an F for the course.') + '</p></div>';
  }
  ['pf-fa', 'pf-fat', 'pf-fin', 'pf-fint'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('input', checkPassFail); });
  // Final marks predictor — marks needed in the final (out of 50) for a target grade.
  function predictFinal() {
    var fa = +$('fp-fa').value;
    var grade = $('fp-grade').value;
    var out = $('fpResult'); if (!out) return;
    if (!$('fp-fa').value) { out.innerHTML = '<p class="dim small">Enter your first-half marks to see what the final term must deliver.</p>'; return; }
    var minPct = { 'A': 85, 'A-': 80, 'B+': 75, 'B': 71, 'B-': 68, 'C+': 64, 'C': 61, 'C-': 58, 'D+': 54, 'D': 50 }[grade] || 50;
    var need = minPct - fa;
    var msg;
    if (need > 50) msg = '<p style="font-weight:700">Not possible for ' + grade + ' — even a perfect 50/50 in the final only reaches ' + (fa + 50) + '%. Aim one grade lower, or repeat the course later.</p>';
    else if (need <= 10) msg = '<p style="font-weight:700">You need just 10 / 50 in the final term for ' + grade + ' — but remember, 10 is the minimum to pass the final half at all, so aim higher for safety.</p>';
    else msg = '<p style="font-weight:700">You need ' + need + ' / 50 in the final term for a ' + grade + '.</p><p class="small" style="margin-top:4px">That is ' + Math.round(need / 50 * 100) + '% of the final paper. Anything above ' + need + ' pushes you toward the next grade up.</p>';
    out.innerHTML = '<div style="border-radius:16px;padding:16px;background:var(--accent-soft)" role="status">' + msg + '</div>';
  }
  ['fp-fa', 'fp-grade'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('input', predictFinal); });
};

/* ---------- Stories ---------- */
function storiesView() {
  UI.storyTag = UI.storyTag || 'All';
  var p = store.profile();
  var list = visible(store.stories()).filter(function (s) { return UI.storyTag === 'All' || s.tag === UI.storyTag; });
  return head('Tool 12 · Community', 'Stories & Confessions', 'Distance learning is lonely — until you read someone else\u2019s 3 a.m. assignment story. Anonymous, honest, sometimes hilarious. Share yours; it might be exactly what a junior needs tonight.') +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">' + ['All'].concat(D.STORY_TAGS).map(function (t) {
      return '<button type="button" class="btn-ghost btn-sm" data-storytag="' + esc(t) + '" aria-pressed="' + (UI.storyTag === t) + '"' + (UI.storyTag === t ? ' style="background:var(--accent);color:var(--accent-ink);border-color:var(--accent)"' : '') + '>' + esc(t) + '</button>';
    }).join('') + '</div>' +
    '<div class="grid lg-2col" style="gap:24px"><div style="display:grid;gap:16px;align-content:start">' +
    (list.length === 0 ? empty('No stories here yet', 'This page comes alive with the first story. Yours could be the one a struggling student reads at midnight and thinks: \u2018Okay. I can do this too.\u2019')
      : list.map(function (s) {
        var open = UI.storyOpen === s.id;
        return '<article class="card" style="padding:24px"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span class="chip chip-amber">' + esc(s.tag) + '</span><span class="dim small">' + fmtDate(s.createdAt) + ' · by ' + esc(s.author) + '</span></div>' +
          '<h2 class="font-display" style="margin-top:8px;font-size:1.5rem">' + esc(s.title) + '</h2>' +
          '<p style="margin-top:8px;white-space:pre-wrap;' + (open ? '' : 'display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden') + '">' + esc(s.body) + '</p>' +
          (s.body.length > 280 ? '<button type="button" data-storymore="' + s.id + '" aria-expanded="' + open + '" style="margin-top:8px;font-weight:700;color:var(--accent);background:none;border:0;padding:0">' + (open ? 'Show less' : 'Read full story →') + '</button>' : '') + '</article>';
      }).join('')) + '</div>' +
    '<form class="card" style="padding:24px;height:fit-content;display:grid;gap:16px" id="storyForm"><h2 class="font-display" style="font-size:1.25rem">Share your story</h2>' +
    '<div><label class="field-label" for="st-title">Title</label><input id="st-title" class="field" placeholder="The night the Wi-Fi died before my quiz" required></div>' +
    '<div><label class="field-label" for="st-tag">Category</label><select id="st-tag" class="field">' + D.STORY_TAGS.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
    '<div><label class="field-label" for="st-body">Your story</label><textarea id="st-body" class="field" style="min-height:160px" placeholder="Tell it like you\u2019d tell a friend…" required></textarea></div>' +
    '<label style="display:flex;align-items:center;gap:12px;font-weight:500;cursor:pointer"><input type="checkbox" id="st-anon" checked style="width:20px;height:20px;accent-color:var(--accent)"> Post anonymously</label>' +
    '<div id="stMsg"></div><button type="submit" class="btn-primary" style="width:100%">Publish story</button></form></div>';
}
storiesView.onMount = function () {
  document.querySelectorAll('[data-storytag]').forEach(function (b) {
    b.addEventListener('click', function () { UI.storyTag = b.getAttribute('data-storytag'); render(); });
  });
  document.querySelectorAll('[data-storymore]').forEach(function (b) {
    b.addEventListener('click', function () { UI.storyOpen = (UI.storyOpen === b.getAttribute('data-storymore') ? null : b.getAttribute('data-storymore')); render(); });
  });
  var f = $('storyForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = $('st-title').value.trim(), body = $('st-body').value.trim();
    if (!title || !body) return;
    var p = store.profile();
    var arr = store.stories();
    arr.unshift({ id: uid(), title: title, body: body, tag: $('st-tag').value, author: $('st-anon').checked ? 'Anonymous' : (p ? p.name : 'Anonymous'), createdAt: new Date().toISOString(), status: 'approved' });
    save('stories', arr);
    $('stMsg').innerHTML = '<div class="note-ok" role="status">Story published — thank you for making someone feel less alone today.</div>';
    $('st-title').value = ''; $('st-body').value = ''; render();
  });
};

/* ---------- Health desk ---------- */
var POSTURE_QS = [
  'Is the top of your screen at (or just below) eye level?',
  'Is your lower back supported by the chair or a cushion?',
  'Are your feet flat on the floor (not dangling or crossed for hours)?',
  'Are your elbows roughly at 90°, close to your body?',
  'Have you stood up or walked in the last 45 minutes?'
];
function healthView() {
  UI.health = UI.health || { answers: [false, false, false, false, false], eyeRunning: false, eyeSecs: 20, focusMode: null, focusSecs: 25 * 60 };
  var u = UI.health;
  var yes = u.answers.filter(Boolean).length;
  function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  return head('Tool 13 · Wellness', 'Remote Student Health Desk', 'The problem nobody warns freshers about: 6–8 hours a day at one desk quietly wrecks your back, neck and eyes. Three small tools here will save you real pain.') +
    '<div class="grid lg2" style="gap:24px"><div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.5rem">60-second posture check</h2><p class="dim" style="margin-top:4px">Answer honestly about your setup right now.</p>' +
    '<div style="margin-top:16px;display:grid;gap:12px">' + POSTURE_QS.map(function (q, i) {
      return '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;background:var(--surface-2);border-radius:16px;padding:12px 16px"><p style="font-weight:500">' + esc(q) + '</p><div style="display:flex;gap:8px;flex-shrink:0">' +
        '<button type="button" data-posture="' + i + ':yes" aria-pressed="' + u.answers[i] + '" class="btn-ghost btn-sm" style="' + (u.answers[i] ? 'background:var(--accent);color:var(--accent-ink);border-color:var(--accent)' : '') + '">Yes</button>' +
        '<button type="button" data-posture="' + i + ':no" aria-pressed="' + !u.answers[i] + '" class="btn-ghost btn-sm" style="' + (!u.answers[i] ? 'background:var(--coral);color:#fff;border-color:var(--coral)' : '') + '">No</button></div></div>';
    }).join('') + '</div>' +
    '<div style="margin-top:16px;border-radius:16px;padding:16px;background:' + (yes >= 4 ? 'var(--accent-soft)' : 'var(--amber-soft)') + '" role="status"><p style="font-weight:700">Score: ' + yes + '/5</p><p class="small" style="margin-top:4px">' +
    (yes >= 4 ? 'Excellent setup — your future spine thanks you. Keep the movement habit alive.'
      : yes >= 2 ? 'A few fixes will change everything: raise the screen with books, put a cushion behind your lower back, and set a 45-minute stand-up alarm.'
      : 'Your setup is hurting you. Today, just fix two things: screen at eye level (books work!) and feet flat on the floor. Then add a cushion for your back.') + '</p></div></div>' +
    '<div style="display:grid;gap:24px;align-content:start"><div class="card" style="padding:24px;text-align:center"><h2 class="font-display" style="font-size:1.5rem">20-20-20 eye break</h2><p class="dim" style="margin-top:4px">Every 20 minutes, look at something 20 feet away for 20 seconds. Press start, look far away, and let your eyes rest.</p>' +
    '<p class="font-display" id="eyeSecs" style="margin:16px 0;font-size:3.75rem;font-weight:900;color:var(--accent)" aria-live="polite">' + (u.eyeRunning ? u.eyeSecs + 's' : '20s') + '</p>' +
    '<button type="button" class="btn-primary" id="eyeStart" ' + (u.eyeRunning ? 'disabled' : '') + '>' + (u.eyeRunning ? 'Look far away…' : 'Start eye break') + '</button></div>' +
    '<div class="card" style="padding:24px;text-align:center"><h2 class="font-display" style="font-size:1.5rem">Focus & break timer</h2><p class="dim" style="margin-top:4px">Study in 25-minute sprints with 5-minute breaks — the Pomodoro rhythm that matches the Routine Builder.</p>' +
    '<p class="font-display" id="focusSecs" style="margin:16px 0;font-size:3.75rem;font-weight:900;color:var(--amber)" aria-live="polite">' + fmt(u.focusSecs) + '</p>' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center"><button type="button" class="btn-primary" id="focusStart">Start 25-min focus</button><button type="button" class="btn-amber" id="breakStart">Start 5-min break</button>' +
    (u.focusMode ? '<button type="button" class="btn-ghost" id="focusStop">Stop timer</button>' : '') + '</div>' +
    (u.focusMode ? '<p style="margin-top:12px;font-weight:600;color:var(--accent)">' + (u.focusMode === 'focus' ? 'Focusing… phone face-down!' : 'Break time — stand, stretch, water.') + '</p>' : '') + '</div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.5rem">2-minute desk stretch</h2><ol style="margin-top:12px;list-style:decimal;padding-left:24px;display:grid;gap:8px">' +
    '<li><strong>Neck rolls:</strong> slowly circle your head 5 times each way.</li><li><strong>Shoulder shrugs:</strong> lift shoulders to ears, hold 3 seconds, drop. ×8</li><li><strong>Chest opener:</strong> clasp hands behind your back, gently lift, breathe deeply. 20 seconds.</li><li><strong>Seated twist:</strong> rotate your torso left and right, holding 10 seconds each.</li><li><strong>Wrist circles:</strong> essential for long typing/GDB sessions. 10 each way.</li></ol>' +
    '<p class="dim small" style="margin-top:12px">Persistent pain, numbness or vision problems deserve a real doctor — this desk is for prevention, not treatment.</p></div></div></div>';
}
healthView.onMount = function () {
  var u = UI.health; if (!u) return;
  document.querySelectorAll('[data-posture]').forEach(function (b) {
    b.addEventListener('click', function () { var p = b.getAttribute('data-posture').split(':'); u.answers[+p[0]] = (p[1] === 'yes'); render(); });
  });
  var eye = $('eyeStart');
  if (eye) eye.addEventListener('click', function () {
    u.eyeSecs = 20; u.eyeRunning = true; render();
    every(function () {
      u.eyeSecs--;
      var el = $('eyeSecs'); if (el) el.textContent = Math.max(0, u.eyeSecs) + 's';
      if (u.eyeSecs <= 0) { u.eyeRunning = false; u.eyeSecs = 20; render(); }
    }, 1000);
  });
  function startFocus(mins, mode) {
    u.focusSecs = mins * 60; u.focusMode = mode; render();
    every(function () {
      u.focusSecs--;
      var el = $('focusSecs'); if (el) el.textContent = Math.floor(Math.max(0, u.focusSecs) / 60) + ':' + String(Math.max(0, u.focusSecs) % 60).padStart(2, '0');
      if (u.focusSecs <= 0) { u.focusMode = null; u.focusSecs = 25 * 60; render(); }
    }, 1000);
  }
  var fs = $('focusStart'); if (fs) fs.addEventListener('click', function () { startFocus(25, 'focus'); });
  var bs = $('breakStart'); if (bs) bs.addEventListener('click', function () { startFocus(5, 'break'); });
  var st = $('focusStop'); if (st) st.addEventListener('click', function () { u.focusMode = null; render(); });
};

/* ---------- Ask the community ---------- */
function askView() {
  UI.askFilter = UI.askFilter || 'All';
  var p = store.profile();
  var list = visible(store.questions()).filter(function (q) { return UI.askFilter === 'All' || q.category === UI.askFilter; });
  return head('Tool 14 · Community', 'Ask the Community', 'The problem: your exact problem was solved by someone last semester — but the answer is buried in a group chat. Ask here, publicly, so the answer helps every student after you too. No login needed.') +
    '<div class="grid lg-side" style="gap:24px"><form class="card" style="padding:24px;height:fit-content;display:grid;gap:16px" id="askForm"><h2 class="font-display" style="font-size:1.25rem">Ask a question</h2>' +
    '<div><label class="field-label" for="ask-title">Question</label><input id="ask-title" class="field" placeholder="e.g. Can I take CS201 and CS304 together?" required></div>' +
    '<div><label class="field-label" for="ask-cat">Category</label><select id="ask-cat" class="field">' + D.QUESTION_CATEGORIES.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></div>' +
    '<div><label class="field-label" for="ask-body">Details</label><textarea id="ask-body" class="field" placeholder="Add the details that matter: your program, semester, what you\u2019ve tried…"></textarea></div>' +
    '<div id="askMsg"></div><button type="submit" class="btn-primary" style="width:100%">Post question</button>' +
    '<p class="dim small">Asking as ' + esc(p ? p.name : 'Anonymous') + '. Check the FAQ first — the top 50 answers might already cover it.</p></form>' +
    '<div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">' + ['All'].concat(D.QUESTION_CATEGORIES).map(function (c) {
      return '<button type="button" class="btn-ghost btn-sm" data-askcat="' + esc(c) + '" aria-pressed="' + (UI.askFilter === c) + '"' + (UI.askFilter === c ? ' style="background:var(--accent);color:var(--accent-ink);border-color:var(--accent)"' : '') + '>' + esc(c) + '</button>';
    }).join('') + '</div>' +
    (list.length === 0 ? empty('No questions here yet', 'Ask the first one — how VULMS blocks accounts, which elective is easier, anything. Somebody in this community knows.')
      : list.map(function (q) {
        return '<article class="card mb" style="padding:20px"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><span class="chip">' + esc(q.category) + '</span><span class="chip chip-amber">' + (q.answers || []).length + ' answer' + ((q.answers || []).length === 1 ? '' : 's') + '</span><span class="dim small">' + fmtDate(q.createdAt) + ' · by ' + esc(q.author) + '</span></div>' +
          '<h3 class="font-display" style="margin-top:8px;font-size:1.25rem">' + esc(q.title) + '</h3>' +
          (q.body ? '<p class="dim" style="margin-top:4px">' + esc(q.body) + '</p>' : '') +
          ((q.answers || []).length ? '<ul style="margin-top:16px;display:grid;gap:12px;list-style:none;padding:0">' + q.answers.map(function (a) {
            return '<li style="background:var(--surface-2);border-radius:16px;padding:16px"><p>' + esc(a.body) + '</p><p class="dim small" style="margin-top:6px;font-weight:600">— ' + esc(a.author) + ' <span class="chip">' + (a.authorRole === 'teacher' ? 'Teacher' : a.authorRole === 'admin' ? 'Admin' : 'Student') + '</span></p></li>';
          }).join('') + '</ul>' : '<p style="margin-top:12px;font-size:.9rem;font-weight:600;color:var(--coral)">Waiting for its first answer — could be yours.</p>') +
          '<form style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap" data-answerform="' + q.id + '"><label class="sr-only" for="answer-' + q.id + '">Answer this question</label><input id="answer-' + q.id + '" class="field" style="flex:1;min-width:200px" placeholder="Share what worked for you…"><button type="submit" class="btn-primary">Answer</button></form></article>';
      }).join('')) + '</div></div>';
}
askView.onMount = function () {
  document.querySelectorAll('[data-askcat]').forEach(function (b) {
    b.addEventListener('click', function () { UI.askFilter = b.getAttribute('data-askcat'); render(); });
  });
  var f = $('askForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = $('ask-title').value.trim(); if (!title) return;
    var p = store.profile();
    var arr = store.questions();
    arr.unshift({ id: uid(), title: title, body: $('ask-body').value.trim(), category: $('ask-cat').value, author: p ? p.name : 'Anonymous', createdAt: new Date().toISOString(), answers: [], status: 'approved' });
    save('questions', arr);
    $('askMsg').innerHTML = '<div class="note-ok" role="status">Question posted — students and teachers can now answer it.</div>';
    $('ask-title').value = ''; $('ask-body').value = ''; render();
  });
  document.querySelectorAll('[data-answerform]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var qid = form.getAttribute('data-answerform');
      var input = $('answer-' + qid);
      var body = input.value.trim(); if (!body) return;
      var p = store.profile();
      var arr = store.questions();
      arr.forEach(function (q) {
        if (String(q.id) === qid) q.answers.push({ id: uid(), body: body, author: p ? p.name : 'Anonymous', authorRole: p ? p.role : 'student', createdAt: new Date().toISOString() });
      });
      save('questions', arr); render();
    });
  });
};

/* ---------- Subject hub (Paper Bank style: one subject, everything in one place) ---------- */
function subjectView() {
  var code = (UI.subjectCode || 'CS101').toUpperCase();
  var guide = null;
  (D.SUBJECTS || []).forEach(function (s) { if (s.code === code) guide = s; });
  var name = guide ? guide.name : code + ' — your subject';
  var quizQs = D.QUIZ_BANK.filter(function (q) { return q.subject.indexOf(code) === 0; });
  var myNotes = store.notes().filter(function (n) { return n.courseCode.toUpperCase() === code; });
  var myPapers = store.papers().filter(function (p) { return (p.courseCode || '').toUpperCase() === code; });
  var scoredPapers = myPapers.filter(function (p) { return p.total > 0; });
  var paperAvg = scoredPapers.length ? Math.round(scoredPapers.reduce(function (s, p) { return s + p.correct / p.total * 100; }, 0) / scoredPapers.length) : null;
  var quizLabel = quizQs.length ? quizQs[0].subject : 'Mixed (all subjects)';
  return head('Subject hub', code + ' · ' + name, guide ? guide.focus : 'Everything for this subject in one place — key points, quiz practice, your notes and your solved papers.') +
    '<div class="grid lg-2col" style="gap:24px"><div style="display:grid;gap:20px;align-content:start">' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Key points to remember</h2>' +
    (guide ? '<ul style="margin-top:12px;list-style:disc;padding-left:24px;display:grid;gap:8px;line-height:1.6">' + guide.points.map(function (pt) { return '<li>' + esc(pt) + '</li>'; }).join('') + '</ul>'
      : '<p class="dim" style="margin-top:8px">No ready-made key points for this code yet — add your own notes below and they will show up here.</p>') +
    '<p class="dim small" style="margin-top:12px">Handouts for this subject are on VULMS: open the course in VULMS → Downloads / handouts. See the Past Papers & Handouts Guide for the exact steps.</p></div>' +
    (guide ? '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">What to study, and when</h2>' +
    '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px"><span class="chip chip-amber">Midterm · ' + esc(guide.midterm) + '</span><span class="chip chip-amber">Final term · ' + esc(guide.final) + '</span></div>' +
    '<p style="margin-top:16px;font-weight:700">Important topics</p><div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px">' + guide.topics.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' +
    '<p style="margin-top:16px;font-weight:700">How to study it</p><p class="dim" style="margin-top:4px">' + esc(guide.method) + '</p></div>' : '') +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Your notes for ' + esc(code) + '</h2>' +
    (myNotes.length ? '<ul class="mt" style="display:grid;gap:8px">' + myNotes.slice(0, 5).map(function (n) { return '<li style="background:var(--surface-2);border-radius:12px;padding:12px 16px"><strong>' + esc(n.title) + '</strong> <span class="dim small">· Lecture ' + n.lectureNo + '</span></li>'; }).join('') + '</ul>'
      : '<p class="dim" style="margin-top:8px">No notes saved for ' + esc(code) + ' yet. Add one — course code, lecture number, title and your key points — and it will live here.</p>') +
    '<button type="button" class="btn-primary mt" id="subjAddNote">+ Add a note for ' + esc(code) + '</button></div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Solved papers</h2>' +
    (myPapers.length ? '<p class="dim" style="margin-top:8px">' + myPapers.length + ' paper' + (myPapers.length === 1 ? '' : 's') + ' solved for ' + esc(code) + (paperAvg != null ? ' — average score ' + paperAvg + '%.</p>' : '.</p>')
      : '<p class="dim" style="margin-top:8px">No papers logged for ' + esc(code) + ' yet. Solve one, log your score, and watch your average grow.</p>') +
    '<button type="button" class="btn-ghost mt" data-go="papers">Open Past Papers Guide</button></div></div>' +
    '<div style="display:grid;gap:20px;align-content:start"><div class="card" style="padding:24px;display:grid;gap:12px"><h2 class="font-display" style="font-size:1.25rem">Do it now — ' + esc(code) + '</h2>' +
    '<button type="button" class="btn-primary" id="subjQuiz">▶ Practice quiz — ' + quizQs.length + ' question' + (quizQs.length === 1 ? '' : 's') + '</button>' +
    '<button type="button" class="btn-ghost" data-go="routine">Study Planner — plan this subject</button>' +
    '<button type="button" class="btn-ghost" data-go="datesheet">Datesheet — place this paper</button>' +
    '<button type="button" class="btn-ghost" data-go="gdb">GDB Drafter</button>' +
    '<button type="button" class="btn-ghost" data-go="cgpa">CGPA Planner</button>' +
    '<button type="button" class="btn-ghost" data-go="reviews">Course reviews for ' + esc(code) + '</button></div>' +
    '<div class="card" style="padding:24px"><h2 class="font-display" style="font-size:1.25rem">Not the right subject?</h2><p class="dim" style="margin-top:8px">Type another code on the home page, or pick a popular one:</p>' +
    '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px">' + ['CS101', 'MTH101', 'ENG101', 'MGT101', 'STA301', 'CS201'].map(function (c) { return '<button type="button" class="chip" data-subject="' + c + '" style="font-weight:700">' + c + '</button>'; }).join('') + '</div></div></div></div>';
}
subjectView.onMount = function () {
  var code = (UI.subjectCode || 'CS101').toUpperCase();
  var quizQs = D.QUIZ_BANK.filter(function (q) { return q.subject.indexOf(code) === 0; });
  var qb = $('subjQuiz');
  if (qb) qb.addEventListener('click', function () {
    var pool = D.QUIZ_BANK.filter(function (q) { return q.subject.indexOf(code) === 0; });
    var shuffled = pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, Math.min(10, pool.length));
    UI.quiz = { subject: quizQs.length ? quizQs[0].subject : 'Mixed (all subjects)', started: true, finished: false, questions: shuffled, idx: 0, picked: null, score: 0, timeLeft: QUIZ_SECONDS_PER_Q, elapsed: 0 };
    go('quiz');
  });
  var nb = $('subjAddNote');
  if (nb) nb.addEventListener('click', function () { UI.noteFilter = code; UI.notePrefillCode = code; go('notes'); });
  document.querySelectorAll('[data-subject]').forEach(function (b) {
    b.addEventListener('click', function () { UI.subjectCode = b.getAttribute('data-subject'); render(); });
  });
};

/* ---------- header search (searches tools, FAQ and centres — no login needed) ---------- */
(function wireHeaderSearch() {
  var input = $('siteSearch'), box = $('searchResults');
  if (!input || !box) return;
  var lastResults = [];
  function openResult(r) {
    if (r.subject) UI.subjectCode = r.subject;
    if (r.faq != null) { UI.faqQ = ''; UI.faqCat = 'All'; UI.faqOpen = r.faq; }
    if (r.centre) UI.centreSel = r.centre;
    close(); input.value = ''; lastResults = []; go(r.go);
  }
  function close() { box.hidden = true; box.innerHTML = ''; }
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    if (q.length < 2) { close(); return; }
    var results = [];
    (D.SUBJECTS || []).forEach(function (s) {
      if ((s.code + ' ' + s.name).toLowerCase().indexOf(q) !== -1) results.push({ label: s.code + ' · ' + s.name, sub: 'Subject hub — key points, quiz, notes & papers in one place', go: 'subject', subject: s.code });
    });
    TOOLS.forEach(function (t) {
      if ((t.title + ' ' + t.blurb).toLowerCase().indexOf(q) !== -1) results.push({ label: t.title, sub: t.blurb, go: t.view });
    });
    D.FAQS.forEach(function (f, i) {
      if (results.length < 8 && (f.q + ' ' + f.a).toLowerCase().indexOf(q) !== -1) results.push({ label: f.q, sub: 'FAQ · ' + f.cat, go: 'faq', faq: i });
    });
    D.CENTRES.forEach(function (c) {
      if (results.length < 8 && (c.city + ' ' + c.campus).toLowerCase().indexOf(q) !== -1) results.push({ label: c.city + ' — ' + c.campus, sub: 'Exam centre · ' + c.address, go: 'centres', centre: c.id });
    });
    if (!results.length) { lastResults = []; box.innerHTML = '<button type="button" disabled><b>No matches</b><span>Try “fee”, “GDB”, “Lahore” or “CGPA”.</span></button>'; box.hidden = false; return; }
    lastResults = results.slice(0, 8);
    box.innerHTML = lastResults.map(function (r, i) {
      return '<button type="button" data-sr="' + i + '"><b>' + esc(r.label) + '</b><span>' + esc(r.sub) + '</span></button>';
    }).join('');
    box.hidden = false;
    box.querySelectorAll('[data-sr]').forEach(function (b) {
      b.addEventListener('click', function () { openResult(lastResults[+b.getAttribute('data-sr')]); });
    });
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && lastResults.length) { e.preventDefault(); openResult(lastResults[0]); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.header-search')) close(); });
})();

/* ---------- view registry & boot ---------- */
var VIEWS_FN = {
  home: homeView, about: aboutView, login: loginView, contact: contactView,
  dashboard: dashboardView, admin: adminView, faq: faqView, notes: notesView,
  routine: routineView, degree: degreeView, centres: centresView, guide: guideView,
  reviews: reviewsView, gdb: gdbView, datesheet: datesheetView, quiz: quizView, papers: papersView, subject: subjectView,
  assignments: assignmentsView,
  cgpa: cgpaView, stories: storiesView, health: healthView, ask: askView,
  privacy: privacyView, disclaimer: disclaimerView, terms: termsView
};
render();
})();
