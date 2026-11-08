# VU Help Desk — VU Student Help Website (static version)

A complete, static version of the **VU Student Help Website** for Virtual
University students — built to be hosted for free on Vercel from this
repository, with no server and no database.

> **No sign-in wall.** The home page, FAQ, every tool, the quiz, CGPA
> planner, datesheet scheduler and notes are all visible and usable without
> an account. A demo role login is only used for personal dashboards and the
> Admin Panel — and it is a demo profile, **not** a real VULMS account.

## What's inside

- **21 pages/views:** Home, About Us, Login, Contact Us, Student Dashboard,
  Teacher Dashboard, Admin Dashboard, Admin Panel, FAQ Top 50, Notes
  Organizer, Routine Builder, Degree Progress, Exam Centers, Freshman Guide,
  Course Reviews, GDB Drafter, Datesheet Scheduler, Quiz Practice, Past
  Papers Guide, CGPA Planner, Stories, Health Desk, Ask the Community.
- **All 15 tools work client-side** (the original 13 plus Ask the Community
  and the Past Papers & Handouts Guide): searchable FAQ (all 50 questions),
  notes by course/lecture, weekly routine builder, degree progress with real
  CGPA maths on the VU grade scale, exam centre navigator, freshman guide
  with saved progress, course reviews with difficulty scores, GDB drafter
  with live character/word counts, datesheet scheduler (14-day window) with
  clash detection, timed quiz practice (34-question bank), past-papers guide
  with a solved-paper tracker, CGPA target planner (can import your Degree
  Dashboard data), stories, and the health desk (posture check, 20-20-20
  eye timer, focus/break timer, desk stretch).
- **Separate dashboards** for Student, Teacher and Admin, plus a separate
  **Admin Panel** (contact inbox; approve / reject / delete course reviews,
  stories, questions and centre reviews).
- **Friendly emerald / amber / ink theme**, light & dark mode, fully
  responsive on phone, tablet and desktop. Meet **Vee the owl** 🦉, the
  site's mascot, on the home page.
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
| `assets/js/data.js` | Reference content copied exactly from the original site: 50 FAQs, 14 exam centres, VU grade scale, 10-step freshman guide, 34-question quiz bank |
| `assets/js/app.js` | The whole app: routing, all 20 views, all tools, localStorage persistence, admin moderation |
| `vercel.json` | Static-hosting config for Vercel |

## Honesty notes

- Login is a **demo role profile** — it is not a VULMS account and cannot
  access any real VU account.
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
