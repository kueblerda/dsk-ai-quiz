# DSK AI Quiz — "Do I Need AI In My Business?"

Interactive lead-magnet assessment for DSK Market Innovations. Vanilla HTML/CSS/JS,
no build tools, no dependencies. Hosted free on GitHub Pages, integrates with GHL
via a single webhook `fetch()` call.

---

## 1. Deploy to GitHub Pages

1. Push this folder to a GitHub repository (or commit it into the repo you already have).
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch."
4. Choose branch `main` (or your default branch) and folder `/ (root)` — assuming
   `index.html` sits at the repo root. Save.
5. GitHub gives you a URL like `https://[username].github.io/[repo-name]/`. Wait
   1–2 minutes for the first deploy, then visit the URL to confirm the quiz loads.
6. Every time you push changes to that branch, GitHub Pages redeploys automatically.

---

## 2. Configure `config.js`

Before going live, open `config.js` and replace every `PASTE_...` placeholder:

```js
const CONFIG = {
  ghlWebhookUrl: "PASTE_GHL_INBOUND_WEBHOOK_URL_HERE",
  outcome2CalendarUrl: "PASTE_OUTCOME_2_CALENDAR_URL_HERE",
  outcome3CalendarUrl: "PASTE_OUTCOME_3_CALENDAR_URL_HERE",
  outcome4CalendarUrl: "PASTE_OUTCOME_4_AUDIT_URL_HERE",
  // Brand colors and logo are already set — only change if rebranding.
};
```

| Key | Where to get it |
|---|---|
| `ghlWebhookUrl` | GHL → Workflow → "Inbound Webhook" trigger → copy the generated URL |
| `outcome2CalendarUrl` | GHL booking calendar for the "15-Minute Clarity Call" |
| `outcome3CalendarUrl` | GHL booking calendar for the "Free AI Workflow Call" |
| `outcome4CalendarUrl` | GHL booking calendar (or landing page) for the "AI Audit Consultation" |

Commit and push after editing — GitHub Pages will redeploy with the live values.

---

## 3. Test the Webhook Before Going Live

1. In GHL, open the Inbound Webhook workflow and use its built-in **test** feature
   (most GHL webhook triggers let you "Listen for test request" or replay a sample).
2. On the live (or local) quiz, open the browser console and complete the quiz for
   each of the four outcome paths. Watch the Network tab for the POST to
   `ghlWebhookUrl` — confirm it returns a 200 and the payload matches the shape below.
3. In GHL, confirm the test payload populated the contact's `aiquiz_` fields and
   triggered the correct tag/branch.
4. Repeat for Outcome 1's two button paths (`resourceAssistance: true` / `false`)
   since that webhook fires on click, not during processing.

**Payload shape sent on every outcome:**

```json
{
  "firstName": "John",
  "email": "john@example.com",
  "outcome": "3",
  "outcomeLabel": "AI Ready",
  "maturityScore": 7,
  "chaosScore": 4,
  "painPoints": ["missing-after-hours-leads", "no-documented-process"],
  "resourceAssistance": null,
  "completedAt": "2026-06-30T17:30:00Z"
}
```

To test locally before deploying, just open `index.html` directly in a browser
(or run any static file server) — there's no backend or build step required.

---

## 4. GHL Setup Checklist (David completes — not built by Claude Code)

### 4.1 — Create Contact Custom Fields (`aiquiz_` prefix)

Settings → Custom Fields → Contacts. Create all 7 fields:

| Field Label | Field Key | Type |
|---|---|---|
| AI Quiz Outcome | `aiquiz_outcome` | Number |
| AI Quiz Outcome Label | `aiquiz_outcome_label` | Single Line Text |
| AI Quiz Maturity Score | `aiquiz_maturity_score` | Number |
| AI Quiz Chaos Score | `aiquiz_chaos_score` | Number |
| AI Quiz Pain Points | `aiquiz_pain_points` | Text Area |
| AI Quiz Resource Help | `aiquiz_resource_assistance` | Single Line Text |
| AI Quiz Completed At | `aiquiz_completed_at` | Date |

- [ ] All 7 custom fields created with exact field keys above

### 4.2 — Create Custom Values (`aiquiz_` prefix)

Settings → Custom Values (Location Level). Create all 4:

| Label | Key | Value |
|---|---|---|
| AI Quiz — Quiz URL | `aiquiz_quiz_url` | `https://[github-pages-url]` — fill in after GitHub deploy |
| AI Quiz — Outcome 2 Calendar | `aiquiz_outcome2_calendar_url` | GHL calendar link |
| AI Quiz — Outcome 3 Calendar | `aiquiz_outcome3_calendar_url` | GHL calendar link |
| AI Quiz — Outcome 4 Calendar | `aiquiz_outcome4_calendar_url` | GHL calendar or audit page link |

- [ ] All 4 custom values created (fill in URLs after deploy and calendars are built)

### 4.3 — Build the Opt-In Landing Page

- [ ] Headline: "Do I Need AI In My Business?"
- [ ] Subheadline: "Answer 6 honest questions. Get a free personalized assessment. No hype — just clarity."
- [ ] Embed GHL form (First Name + Email — 2 fields only, no phone field)
- [ ] Set form redirect URL: `https://[github-pages-url]/?fname={{contact.first_name}}&email={{contact.email}}`
- [ ] Test that merge tags resolve in redirect URL. If not: use a workflow to send
      an immediate email with the personalized quiz link instead (the quiz app
      handles missing URL params gracefully — falls back to `fname = "there"`)

### 4.4 — Build the Inbound Webhook Workflow

**Trigger:** Inbound Webhook → copy the webhook URL → paste into `config.js` as `ghlWebhookUrl`

**Actions (execute in order):**

1. Find/Create Contact by `email` field from webhook payload
2. Update Contact — map webhook fields to `aiquiz_` custom fields:
   - `outcome` → `aiquiz_outcome`
   - `outcomeLabel` → `aiquiz_outcome_label`
   - `maturityScore` → `aiquiz_maturity_score`
   - `chaosScore` → `aiquiz_chaos_score`
   - `painPoints` (join as comma-separated string) → `aiquiz_pain_points`
   - `resourceAssistance` (`true`→"yes" / `false`→"no" / `null`→blank) → `aiquiz_resource_assistance`
   - `completedAt` → `aiquiz_completed_at`
3. Add Tag: `ai-quiz-completed`
4. Branch on `outcome` field value → 4 branches

**Outcome 1 Branch:**
- Add Tag: `ai-quiz-outcome-1`
- Sub-branch on `resourceAssistance` value:
  - `"yes"` → Add Tag `ai-quiz-needs-resources` → Send David ⚠️ ACTION NEEDED notification
  - `"no"` → Add Tag `ai-quiz-self-sufficient` → Send David 🟡 no-action notification
- Enroll in Outcome 1 email sequence (same sequence both paths — David personalizes
  the first email manually when `resourceAssistance = "yes"`)

**Outcome 2 Branch:**
- Add Tag: `ai-quiz-outcome-2`
- Send David 🟠 warm lead notification
- Enroll in Outcome 2 email sequence

**Outcome 3 Branch:**
- Add Tag: `ai-quiz-outcome-3`
- Send David 🟢 hot lead notification
- Enroll in Outcome 3 email sequence

**Outcome 4 Branch:**
- Add Tag: `ai-quiz-outcome-4`
- Send David 🔴 high-value lead notification
- Enroll in Outcome 4 email sequence

### 4.5 — David Notification Emails

Add "Send Email" + "In-App User Notification" to each outcome branch.
All notifications go to: `david@dskleads.com`

**Outcome 1 — `resourceAssistance = "yes"`**
Subject: `⚠️ [DSK Quiz] ACTION NEEDED — {{contact.first_name}} needs free resources`
```
Name:    {{contact.first_name}} {{contact.last_name}}
Email:   {{contact.email}}
Outcome: 1 — Foundation First

This person asked for your help finding free resources.
Do NOT pitch services. This is a trust-building moment.

ACTION REQUIRED: Find 2–3 free resources for new home service business
owners and email them personally within 24 hours.

Pain Points: {{contact.aiquiz_pain_points}}
Completed:   {{contact.aiquiz_completed_at}}
```

**Outcome 1 — `resourceAssistance = "no"`**
Subject: `🟡 [DSK Quiz] Outcome 1 — {{contact.first_name}} (no action needed)`
```
Name:    {{contact.first_name}} {{contact.last_name}}
Email:   {{contact.email}}
Outcome: 1 — Foundation First

This person said they are fine finding their own resources.
No outreach required. Tagged and in nurture sequence.

Completed: {{contact.aiquiz_completed_at}}
```

**Outcome 2**
Subject: `🟠 [DSK Quiz] Outcome 2 — {{contact.first_name}} (warm — light follow-up)`
```
Name:    {{contact.first_name}} {{contact.last_name}}
Email:   {{contact.email}}
Outcome: 2 — Needs Clarity
Pain Points: {{contact.aiquiz_pain_points}}

Growing but disorganized. Soft CTA only — simple CRM conversation.

ACTION: Watch for calendar booking in next 48 hours.
If none, send a personal message — not a sequence, a real email from you.

Completed: {{contact.aiquiz_completed_at}}
```

**Outcome 3**
Subject: `🟢 [DSK Quiz] Outcome 3 — {{contact.first_name}} (HOT — watch for booking)`
```
Name:    {{contact.first_name}} {{contact.last_name}}
Email:   {{contact.email}}
Outcome: 3 — AI Ready
Pain Points: {{contact.aiquiz_pain_points}}
Maturity Score: {{contact.aiquiz_maturity_score}} | Chaos Score: {{contact.aiquiz_chaos_score}}

Strong fit for DSK AI workflow services.
Clear process, losing time to manual work.

ACTION: Watch for a free AI workflow call booking.
If no booking within 48 hours, send a personal follow-up.
Reference their specific pain points in your outreach.

Completed: {{contact.aiquiz_completed_at}}
```

**Outcome 4**
Subject: `🔴 [DSK Quiz] Outcome 4 — {{contact.first_name}} (HIGH VALUE — audit lead)`
```
Name:    {{contact.first_name}} {{contact.last_name}}
Email:   {{contact.email}}
Outcome: 4 — Needs AI Audit
Pain Points: {{contact.aiquiz_pain_points}}
Maturity Score: {{contact.aiquiz_maturity_score}} | Chaos Score: {{contact.aiquiz_chaos_score}}

Established business with tool sprawl and disconnected data.
Highest-value lead type. Ideal AI audit candidate.

ACTION: Watch for an audit consultation booking.
If no booking within 24 hours, reach out personally.
This is not a nurture situation — these leads are ready to move.

Completed: {{contact.aiquiz_completed_at}}
```

### 4.6 — Build Email Sequences (4 total — content TBD after app is live)

- [ ] Outcome 1 sequence — light nurture, no pitch, useful content for new businesses
- [ ] Outcome 2 sequence — process/clarity content, light CRM mention, soft DSK intro
- [ ] Outcome 3 sequence — AI use cases for home service, link to book workflow call
- [ ] Outcome 4 sequence — AI audit value content, urgency, link to audit consultation

### 4.7 — Build Booking Calendars (3 total)

- [x] Outcome 2: "15-Minute Clarity Call" — soft, no-pitch framing
- [x] Outcome 3: "Free AI Workflow Call" — specific, results-focused
- [x] Outcome 4: "AI Audit Consultation" — high-value, professional framing

| Calendar | Duration | Calendar ID | Booking Widget URL |
|---|---|---|---|
| 15-Minute Clarity Call | 15 min | `fEyrDCz5KUAneZB2rLMN` | `https://api.leadconnectorhq.com/widget/booking/aiquiz-clarity-call` |
| Free AI Workflow Call | 30 min | `gFsesjhjnaG4SPj1PgEl` | `https://api.leadconnectorhq.com/widget/booking/aiquiz-workflow-call` |
| AI Audit Consultation | 45 min | `ZpHFZmoaQkArTmZeirGi` | `https://api.leadconnectorhq.com/widget/booking/aiquiz-audit-consultation` |

Booking widget URLs are already wired into `config.js` (`outcome2CalendarUrl`,
`outcome3CalendarUrl`, `outcome4CalendarUrl`).

---

## File Structure

```
dsk-ai-quiz/
├── index.html        # App shell — loads all CSS and JS
├── style.css         # All styles using CSS custom properties
├── quiz.js           # Quiz engine: state, DOM rendering, scoring, webhook
├── outcomes.js       # All outcome content: headlines, copy, CTAs, pain callout text
├── config.js         # ⚠️ Fill in all placeholder values before deploy
└── README.md         # This file
```

No local assets folder — the DSK logo loads directly from the CDN URL in `config.js`.

## Scoring Logic Reference

- **Maturity Score** = Q1 + Q2 + Q5 (range 3–9). High Maturity = 6–9.
- **Chaos Score** = Q3 + Q4 + Q6 (range 3–9). High Chaos = 6–9.
  Q4 is auto-scored to 1 and skipped if Q3 = "None or just one."
- **Outcome matrix:**

  |  | Low Chaos (3–5) | High Chaos (6–9) |
  |---|---|---|
  | **Low Maturity (3–5)** | Outcome 1 — Foundation First | Outcome 2 — Needs Clarity |
  | **High Maturity (6–9)** | Outcome 3 — AI Ready | Outcome 4 — Needs Audit |
