# FlowFi 💸

> A cash-flow budgeting tool for students, interns, and gig workers who don't get paid on a schedule.

**Live app:** [flowfi-ten.vercel.app](https://flowfi-ten.vercel.app)

---

## The Problem

Most budgeting apps ask "how much did you spend this month?"

Students and gig workers are asking a different question:

**"Will I go broke before my next deposit?"**

Every budgeting app assumes you get paid on the 1st and 15th. Most students don't. After speaking with fellow students and interns, I found a consistent pattern: people weren't struggling to track spending — they were struggling to know if they could safely spend at all.

---

## What I Built

FlowFi answers one question really well: **will you run out of money before your next income?**

- **14-day cash flow forecast** — visualizes your projected balance based on upcoming income and expenses
- **"Safe to spend" number** — calculates a daily spending allowance until your next guaranteed income
- **Uncertainty tagging** — mark income as guaranteed, likely, or uncertain
- **Best case vs worst case toggle** — see how your balance looks if uncertain income doesn't come through

---

## What I Intentionally Left Out (v1)

- Bank account syncing — adds complexity, not core to the insight
- Spending categories — solves a different problem
- Auth/login — unnecessary friction for an MVP
- Notifications — post-validation feature

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Database | Supabase |
| Charts | Recharts |
| Deployment | Vercel |

---

## Results

- Launched publicly and shared with target users (students, interns, gig workers)
- Core forecast and safe-to-spend features validated through real usage
- Users reported the "safe to spend" number as the most useful feature

---

## Case Study

Full product thinking, research insights, and design decisions → coming soon

---

## Running Locally

```bash
git clone https://github.com/britneyk-code/flowfi.git
cd flowfi
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm run dev
```
