# VU Help Desk — VU Student Help Website (static version)

A complete, static version of the **VU Student Help Website** for Virtual
University students — built to be hosted for free on Vercel from this
repository, with no server and no database.

> **No sign-in wall.** The home page, FAQ, every tool, the quiz, CGPA
> planner, datesheet scheduler and notes are all visible and usable without
> an account. Signing up creates a VU Help Desk account (name, email and
> password, saved in your browser only) for your personal dashboard and the
> Admin Panel. It is **not** a VULMS account and never connects to VULMS.

## What's inside

- **26 pages/views:** Home, About Us, Login, Contact Us, Student Dashboard,
  Teacher Dashboard, Admin Dashboard, Admin Panel, FAQ Top 50, Notes
  & Handouts, Study Planner, Degree Progress, Exam Centers, Freshman Guide,
  Course Reviews, GDB Drafter, Datesheet Scheduler, Quiz Practice, Past
  Papers Guide, Subject Hub, Assignments & GDB Guide, CGPA Planner, Stories, Health Desk, Ask the Community,
  Privacy Policy, Disclaimer, Terms &amp; Conditions.
- **All 16 tools work client-side** (the original 13 plus Ask the Community,
  the Past Papers & Handouts Guide and the Assignments & GDB Guide), plus a Subject Hub: type a subject
  code (e.g. CS101) on the home page and get that subject's key points, important topics, midterm/final
  lecture split and study method, quiz questions, your notes and solved papers in one place. Searchable FAQ (all
  50 questions),
  notes by course/lecture, study planner, degree progress with real
  CGPA maths on the VU grade scale, exam centre navigator, freshman guide
  with saved progress, course reviews with difficulty scores, GDB drafter
  with live character/word counts, datesheet scheduler (14-day window) with
  clash detection, timed quiz practice (46-question bank), past-papers guide
  with a solved-paper tracker, assignments & GDB guide with a personal
  deadline tracker, CGPA target planner (can import your Degree
  Dashboard data, plus a pass/fail checker and final-marks predictor), stories, and the health desk (posture check, 20-20-20
  eye timer, focus/break timer, desk stretch).
- **Separate dashboards** for Student, Teacher and Admin, plus a separate
  **Admin Panel** (contact inbox; approve / reject / delete course reviews,
  stories, questions and centre reviews; approve / reject Teacher requests).
- **Roles are earned, not picked:** every new account starts as a Student;
  the first account created while the site has no Admin becomes the Admin
  (site owner). A Student can request Teacher access from their dashboard
  and the Admin approves or rejects it in the Admin Panel. Nobody can open
  the Admin Panel without signing in as the admin account.
- **Friendly emerald / amber / ink theme**, light & dark mode, fully
  responsive on phone, tablet and desktop, with a clean typographic
  logo.
- **Persistence:** everything you add is saved in your browser's
  localStorage only. Community sections (Course Reviews, Stories, Ask the
  Community) start **empty** — no fake reviews or stories are pre-filled.

## Deploy on Vercel

1. Import this repository in Vercel (**Add New → Project → Import**).
2. Settings — nothing to change:
   - **Framework Preset:** Other (no framework, no build step)
   - **Root Directory:** `./` (the repository root)
   - **Build Command:** *(none)*
   - **Output Directory:** *(none / repository root — `index.html` is at the root)*
   - **Install Command:** *(none)*
3. Click **Deploy**. No custom domain is needed — Vercel gives the site a
   free `*.vercel.app` link (project name defaults to `vu-help-desk`).

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

No build step, no dependencies, no environment variables.

## Files

| File | What it is |
| --- | --- |
| `index.html` | App shell: branded header (logo, search, theme toggle, login), sidebar + mobile menu, bottom quick-nav |
| `assets/css/style.css` | Full theme + responsive layout (emerald/amber/ink, light/dark) |
| `assets/js/data.js` | Reference content: 50 FAQs, 14 exam centres, VU grade scale, 10-step freshman guide, 46-question quiz bank, 6 subject guides with midterm/final splits |
| `assets/js/app.js` | The whole app: routing, all 26 views, all tools, localStorage persistence, accounts, admin moderation |
| `vercel.json` | Static-hosting config for Vercel |

## Honesty notes

- Accounts on this site are VU Help Desk accounts (name, email, password
  stored as a simple hash in this browser only). They are **not** VULMS
  accounts, never connect to VULMS, and never ask for a VULMS password.
  For VULMS, visit vulms.vu.edu.pk.
- Exam-centre addresses are reproduced exactly as published by the original
  site, including any "(confirm exact address on vu.edu.pk campus list)"
  notes. Centres can move — always verify on the
  [official VU website](https://www.vu.edu.pk/) (search for "Virtual
  Campuses" there) before exam day. Note: the old deep link to the VU campus
  directory (`vu.edu.pk/PVCs/Default?type=Private`) returned a 404 on a
  direct check on 2026-11-08, so the site now links to the verified VU
  homepage instead of a dead deep link.
- This is a student help project, **not** an official VU website. Confirm
  fees, dates and rules on VULMS and vu.edu.pk.
