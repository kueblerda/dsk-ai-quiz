# Build Prompt: "Do I Need AI In My Business?" — Interactive Assessment App

## Project Overview

**Business:** DSK Market Innovations | Montgomery, TX
**Type:** Interactive lead magnet quiz — hosted as a standalone web app on GitHub Pages
**Purpose:** Honestly assess whether a home service business owner is ready for AI,
needs process clarity, needs a full AI audit, or simply isn't there yet — and deliver
a personalized result that positions DSK as a trusted advisor, not a tool pusher.
**Audience:** Home service business owners in Texas (HVAC, plumbing, roofing,
landscaping, electrical, painting, pest control, etc.)
**Core Principle:** This tool tells the truth. Not every business needs AI. Results
must match the user's actual situation. Never funnel everyone toward a sales pitch.

---

## Architecture Overview

### What GHL Handles (David configures separately — not built by Claude Code)

| Component | Purpose |
|---|---|
| Opt-In Landing Page | Hosts the form. User gives First Name + Email before accessing the quiz. |
| GHL Form | Two fields only: First Name + Email. On submit → creates contact → redirects to quiz URL with params. |
| Contact Custom Fields | Stores quiz results on the contact record. All fields prefixed with `aiquiz_`. |
| Custom Values | Location-level constants referenced in workflows and emails. Prefixed with `aiquiz_`. |
| Inbound Webhook Workflow | Receives quiz outcome POST. Maps data to contact fields. Tags contact. Routes to email sequence. Notifies David. |
| Email Sequences (x4) | One per outcome. Automated nurture tailored to AI readiness stage. |
| Booking Calendars | Used in Outcome 2, 3, and 4 CTA buttons. David fills in actual GHL calendar URLs. |
| Contact Tags | Applied by webhook workflow — full list in GHL Setup Checklist. |

### What Claude Code Builds

| File | Description |
|---|---|
| `index.html` | App shell |
| `style.css` | All styling — DSK branded via CSS custom properties |
| `quiz.js` | Quiz engine, scoring logic, DOM rendering, GHL webhook call |
| `outcomes.js` | All outcome content (headlines, copy, CTAs) — separated for easy editing |
| `config.js` | Values David fills in before deploy (webhook URL, calendar URLs) |
| `README.md` | Setup, config, GHL checklist, and GitHub Pages instructions |

---

## Tech Stack

- **Vanilla HTML / CSS / JavaScript** — no frameworks, no build tools, no npm, no dependencies
- **Hosted on:** GitHub Pages (free, zero-config, deploys directly from the repo)
- **GHL Integration:** Native `fetch()` POST to GHL Inbound Webhook URL
- **No backend required**
- **No n8n required**

---

## User Journey & Data Flow

```
[GHL Opt-In Landing Page]
        ↓  User enters First Name + Email
[GHL Form Submission]
        ↓  GHL creates/updates contact record
        ↓  GHL fires "Quiz Started" workflow → sends immediate welcome email
        ↓  GHL redirects to quiz URL with params:
           https://[github-pages-url]/?fname=John&email=john@example.com
[Quiz App — GitHub Pages]
        ↓  App reads fname + email from URL params on load
        ↓  Fallback if params missing: fname = "there", email = null
        ↓  User completes 6 questions (one at a time, progress bar)
        ↓  Scoring engine calculates Maturity Score + Chaos Score
        ↓  Outcome 1–4 determined

OUTCOMES 2, 3, 4:
        ↓  Processing View (1.5s) — webhook fires here (fire-and-forget)
        ↓  Results page rendered — diagnosis + pain callouts + CTA button

OUTCOME 1 ONLY:
        ↓  Processing View (1.5s) — webhook does NOT fire here
        ↓  Results page rendered — diagnosis + two-button resource choice
        ↓  User clicks "Yes, help me" or "No thanks"
        ↓  Webhook fires on button click (includes resourceAssistance field)
        ↓  Confirmation message replaces the two buttons

[GHL Inbound Webhook Workflow — all outcomes]
        ↓  Receives outcome data
        ↓  Finds/creates contact by email
        ↓  Updates aiquiz_ contact custom fields
        ↓  Applies outcome tag + pain point tags
        ↓  Enrolls contact in correct email sequence
        ↓  Sends David internal notification with action context
```

> **GHL Redirect URL Note:** Test whether GHL supports merge tags in the form redirect
> URL field (e.g., `?fname={{contact.first_name}}&email={{contact.email}}`). If not
> supported natively, use a GHL Workflow: on form submit → Send Email immediately with
> a personalized quiz link built from merge tags. The quiz app handles missing URL
> params gracefully — personalization is a nice-to-have, not a blocker.

---

## GHL Custom Fields & Custom Values

All GHL fields and values created for this campaign use the `aiquiz_` prefix.
David creates these in GHL before building the webhook workflow.

### Contact Custom Fields

Written to the contact record by the Inbound Webhook Workflow via an
"Update Contact" action that maps incoming JSON keys to these fields.

| GHL Field Label | Field Key | Field Type | Webhook JSON Key | Notes |
|---|---|---|---|---|
| AI Quiz Outcome | `aiquiz_outcome` | Number | `outcome` | Values: 1, 2, 3, or 4 |
| AI Quiz Outcome Label | `aiquiz_outcome_label` | Single Line Text | `outcomeLabel` | e.g., "AI Ready" |
| AI Quiz Maturity Score | `aiquiz_maturity_score` | Number | `maturityScore` | Range: 3–9 |
| AI Quiz Chaos Score | `aiquiz_chaos_score` | Number | `chaosScore` | Range: 3–9 |
| AI Quiz Pain Points | `aiquiz_pain_points` | Text Area | `painPoints` | Join array as comma-separated string |
| AI Quiz Resource Help | `aiquiz_resource_assistance` | Single Line Text | `resourceAssistance` | "yes", "no", or blank |
| AI Quiz Completed At | `aiquiz_completed_at` | Date | `completedAt` | ISO 8601 timestamp |

### Custom Values (Location Level)

Global constants referenced in GHL workflows and email templates.

| Custom Value Label | Key | Value to Enter | Used In |
|---|---|---|---|
| AI Quiz — Quiz URL | `aiquiz_quiz_url` | `https://[github-pages-url]` | Welcome email, workflows |
| AI Quiz — Outcome 2 Calendar | `aiquiz_outcome2_calendar_url` | GHL calendar link | Workflow emails |
| AI Quiz — Outcome 3 Calendar | `aiquiz_outcome3_calendar_url` | GHL calendar link | Workflow emails |
| AI Quiz — Outcome 4 Calendar | `aiquiz_outcome4_calendar_url` | GHL calendar or audit page | Workflow emails |

---

## Quiz Structure

### Display Rules

- One question per screen. No scrolling through all questions at once.
- Progress bar at top fills proportionally. Adjusts if Q4 is skipped.
- Answers are large, full-width tappable buttons — mobile-first.
- Selecting an answer highlights it. A "Next →" button confirms and advances.
- No back button required.
- If Q3 = Option A (one tool or none): auto-set Q4 score = 1, skip Q4 display entirely.
  Progress denominator changes from 6 to 5.

---

### Questions, Answer Options, and Score Values

Each answer contributes to one of two scoring axes: **Maturity** or **Chaos**.

---

**Q1 — Business Age** *(Maturity axis)*
> "How long has your business been open?"

| Option | Label | Maturity Score |
|---|---|---|
| A | Less than 12 months | 1 |
| B | 1–3 years | 2 |
| C | More than 3 years | 3 |

---

**Q2 — Process Documentation** *(Maturity axis)*
> "Do you have a written, step-by-step process for how a job moves from
> first contact to final invoice?"

| Option | Label | Maturity Score |
|---|---|---|
| A | No — we figure it out as we go | 1 |
| B | It's in my head, but not written down | 2 |
| C | Yes — it's documented and my team follows it | 3 |

*Pain point flag: A or B → push `"no-documented-process"` to pain points array*

---

**Q3 — Tool Count** *(Chaos axis)*
> "How many paid software tools or subscriptions does your business currently use?
> (scheduling, invoicing, CRM, communication, etc.)"

| Option | Label | Chaos Score |
|---|---|---|
| A | None or just one | 1 |
| B | Two or three | 2 |
| C | Four or more | 3 |

*Pain point flag: C → push `"tool-sprawl"` to pain points array*
*Skip logic: A selected → auto-set Q4 score = 1, skip Q4 display entirely*

---

**Q4 — Data Movement Between Tools** *(Chaos axis)*
*(Skipped and auto-scored if Q3 = Option A)*
> "When you use more than one tool, how does information get from one to the other?"

| Option | Label | Chaos Score |
|---|---|---|
| A | We only use one tool | 1 |
| B | We manually copy or re-enter data between them | 3 |
| C | Most of our tools connect automatically | 1 |

*Pain point flag: B → push `"manual-data-entry"` to pain points array*

---

**Q5 — After-Hours Lead Handling** *(Maturity axis)*
> "What happens when a potential customer contacts you after hours or while
you're on a job?"

| Option | Label | Maturity Score |
|---|---|---|
| A | We miss most of them and hope they call back | 3 |
| B | We follow up manually the next morning | 2 |
| C | We have a consistent process — every lead gets captured | 2 |

*Pain point flag: A → push `"missing-after-hours-leads"` to pain points array*

> Scoring note: Option A scores 3 (high maturity signal) because missing
after-hours leads means the business is active with real inbound interest.
> This is a clear, solvable AI use case — not a sign of immaturity.

---

**Q6 — "We Need a System" Frequency** *(Chaos axis)*
> "How often does someone in your business say 'we need a better system for this'?"

| Option | Label | Chaos Score |
|---|---|---|
| A | Rarely — things run pretty smoothly | 1 |
| B | Occasionally — a few times a month | 2 |
| C | Multiple times a week — it's a constant problem | 3 |

*Pain point flag: C → push `"constant-system-gaps"` to pain points array*

---

### Scoring Logic — Two-Axis System

```js
// Maturity Score: Q1 + Q2 + Q5
const maturity = answers.q1 + answers.q2 + answers.q5;
// Range: 3–9 | Low Maturity: 3–5 | High Maturity: 6–9

// Chaos Score: Q3 + Q4 + Q6
// Note: Q4 is auto-set to 1 if Q3 = Option A (one tool)
const chaos = answers.q3 + answers.q4 + answers.q6;
// Range: 3–9 | Low Chaos: 3–5 | High Chaos: 6–9

const highMaturity = maturity >= 6;
const highChaos    = chaos >= 6;

if (!highMaturity && !highChaos) return 1; // Foundation First
if (!highMaturity &&  highChaos) return 2; // Needs Clarity
if ( highMaturity && !highChaos) return 3; // AI Ready
if ( highMaturity &&  highChaos) return 4; // Needs Audit
```

### Outcome Matrix

```
                     LOW CHAOS (3–5)     HIGH CHAOS (6–9)
LOW MATURITY (3–5)   Outcome 1           Outcome 2
HIGH MATURITY (6–9)  Outcome 3           Outcome 4
```

### Pain Points Collector

Build an array of triggered pain point tags. Include in webhook payload.
Adjust option index mapping to match your answer storage format.

```js
const painPoints = [];
if (answers.q2 < 3)   painPoints.push("no-documented-process");   // Q2 Option A or B
if (answers.q3 === 3)  painPoints.push("tool-sprawl");             // Q3 Option C
if (answers.q4 === 3)  painPoints.push("manual-data-entry");       // Q4 Option B
if (answers.q5 === 3)  painPoints.push("missing-after-hours-leads"); // Q5 Option A (score=3)
if (answers.q6 === 3)  painPoints.push("constant-system-gaps");    // Q6 Option C
```

---

## GHL Webhook Payload

**Endpoint:** `CONFIG.ghlWebhookUrl`

**Timing:**
- Outcomes 2, 3, 4: Fire during the Processing View (1.5s delay). Fire-and-forget.
- Outcome 1: Fire only after the user clicks a resource assistance button.

**Full payload structure (all outcomes):**

```json
{
  "firstName":           "John",
  "email":               "john@example.com",
  "outcome":             "3",
  "outcomeLabel":        "AI Ready",
  "maturityScore":       7,
  "chaosScore":          4,
  "painPoints":          ["missing-after-hours-leads", "no-documented-process"],
  "resourceAssistance":  null,
  "completedAt":         "2026-06-30T17:30:00Z"
}
```

**Field notes:**
- `resourceAssistance`: `true` or `false` for Outcome 1 (set by button click). `null` for all others.
- `painPoints`: Empty array `[]` if no flags triggered. Never omit the field.
- `completedAt`: ISO 8601 UTC timestamp at time of payload creation.
- Always wrap fetch in `try/catch`. Never surface webhook errors to the user.
- Outcomes 2–4: Never block results display on webhook success or failure.
- Outcome 1: Fire webhook on button click → immediately render confirmation message.

> **GHL Field Mapping Note:** In the GHL "Update Contact" action inside the webhook
> workflow, map each incoming JSON key to its corresponding `aiquiz_` contact custom
> field. Join the `painPoints` array as a comma-separated string before mapping to
> the `aiquiz_pain_points` text field. Map `resourceAssistance` true → "yes",
> false → "no", null → leave blank.

---

## Outcome Definitions & Results Page Content

All copy below lives in `outcomes.js` as `const OUTCOMES = { 1:{...}, 2:{...}, 3:{...}, 4:{...} }`.
`quiz.js` reads from this object — never hardcodes outcome strings directly.

---

### Outcome 1 — "Foundation First"

**Headline:**
> You don't need AI right now — and that's perfectly okay.

**Diagnosis:**
> The most common mistake new businesses make is layering tools and automation on top
> of a process that isn't solid yet. AI doesn't fix a shaky foundation — it builds on
> it faster. Right now, your biggest win is getting clear on how you do your work,
> job by job, before you automate any of it.

**What they actually need (render as a simple bulleted list):**
- A written checklist for how a job flows from first call to final invoice
- Focus on landing clients and learning what your process looks like in practice
- Consistency before complexity

**Two-Button Interaction (renders below the diagnosis — no link CTA)**

Prompt text above buttons:
> One last question — would you like a hand finding some free resources
> to help you build your foundation?

Button A: ✅ "Yes — please point me in the right direction"
- Sets `resourceAssistance: true` in webhook payload
- Fires webhook (fire-and-forget, same try/catch pattern)
- Replaces buttons with confirmation message:
  > "Done. David from DSK will reach out personally with some resources
  > for exactly where you are in your journey.
  > Keep an eye on your inbox."

Button B: 👍 "No thanks — I'll find them on my own"
- Sets `resourceAssistance: false` in webhook payload
- Fires webhook
- Replaces buttons with confirmation message:
  > "Sounds good — best of luck building your foundation.
  > If you ever want a second opinion, you know where to find us."

**No calendar link. No sales pitch. No secondary CTA.**

---

### Outcome 2 — "Clarity Before Tools"

**Headline:**
> You're growing — but you need process clarity before AI can help.

**Diagnosis:**
> You're past the starting line, which is a big deal. But right now your processes
> are either undocumented or inconsistent — and automating an unclear process just
> makes the confusion happen faster. The good news: you're closer than you think.
> Getting your workflow written down and a simple system in place could change
> everything.

**What they actually need (render as a bulleted list):**
- Their workflow written down and repeatable
- Possibly a simple CRM to start organizing leads and follow-ups — nothing custom,
  nothing complex
- Right-sized for where they are now

**CTA Block (light — no hard sell):**
> Not sure whether a simple out-of-the-box solution fits right now, or if something
> built around your specific workflow makes more sense? That's exactly the kind of
> conversation we love — no pitch, just clarity.

**CTA Button:** "Let's Figure It Out — Free 15 Min →" → `CONFIG.outcome2CalendarUrl`

---

### Outcome 3 — "AI Ready"

**Headline:**
> Your business is ready for AI — and it can win back serious time.

**Diagnosis:**
> You have a clear process and an established business. What you don't have is relief
> from the manual, repetitive work that's eating your time. That's exactly what AI is
> built for — not replacing how you work, just handling the parts you're already
> doing, automatically.

**Personalized Pain Callouts** (render ONLY triggered tags as icon + card):
- `missing-after-hours-leads` → "📞 You're losing leads after hours — AI can answer
  and qualify them while you're on a job."
- `no-documented-process` → "📋 Getting your process documented is the last step
  before automation becomes truly powerful."
- `manual-data-entry` → "⌨️ Manual data entry is costing you hours — that's one of
  the easiest and highest-impact things to automate."

*If no pain points triggered, skip the callout section entirely — render nothing.*

**CTA Block:**
> Let's look at exactly where your time is going and map out what to automate first.
> Free call. Specific agenda based on your results. No fluff.

**CTA Button:** "Book Your Free AI Workflow Call →" → `CONFIG.outcome3CalendarUrl`

---

### Outcome 4 — "Audit First"

**Headline:**
> You have the right problems — but adding more tools right now would make it worse.

**Diagnosis:**
> Your business has real potential for AI to make a major impact. But right now your
> data is spread across multiple places, your tools aren't talking to each other, and
> some of your processes may be solving the wrong problem entirely. Adding automation
> on top of that won't fix it — it'll scale the chaos. What you need first is a clear
> picture of what's working, what's broken, and how everything connects.

**Personalized Pain Callouts** (render ONLY triggered tags):
- `tool-sprawl` → "🛠️ Four or more tools that don't talk to each other is a
  consolidation problem — adding a fifth won't solve it."
- `manual-data-entry` → "⌨️ Copy-pasting data between tools is one of the biggest
  time and accuracy drains we see in service businesses."
- `constant-system-gaps` → "🔁 Saying 'we need a system for this' multiple times a
  week means your current setup is already breaking under the weight of your growth."

*If no pain points triggered, skip the callout section entirely — render nothing.*

**CTA Block:**
> We offer a structured AI Audit — we map your current workflows, identify what's
> working, show you how to pull all your data into one clear source, and deliver a
> written report with a prioritized action plan. Before we ever recommend a single tool.

**CTA Button:** "Learn About the AI Audit →" → `CONFIG.outcome4CalendarUrl`

---

## UI/UX Requirements

### Layout & Responsiveness
- Mobile-first. Most home service owners open links on their phones.
- Max content width: 640px, centered on desktop.
- All touch targets minimum 48px tall.
- No horizontal scrolling at any breakpoint.

### App Views (JS-Rendered States — No Page Reloads)

| View | Description |
|---|---|
| `intro` | Welcome. Personalized with fname from URL param. Start button. |
| `question` | One question. Answer buttons. Progress bar. Next button. |
| `processing` | "Analyzing your results..." 1.5s delay. Webhook fires here for Outcomes 2–4. |
| `results` | Headline + diagnosis + what-they-need list + pain callout cards + CTA button. |
| `outcome1-choice` | Appended below results for Outcome 1 only: two-button choice + confirmation on click. |

### Typography
- Font: **Inter** — load from Google Fonts (weights: 400, 500, 700)
- Apply via CSS. No other fonts needed.

### DSK Brand Colors (applied via CSS custom properties set from config.js at runtime)

| CSS Variable | Hex | Role |
|---|---|---|
| `--color-primary` | `#4A6470` | Slate Steel — main buttons, headers, progress bar |
| `--color-dark` | `#2B2F33` | Deep Charcoal — body text, footers |
| `--color-secondary` | `#5C7A8A` | Dusk Blue — hover states, secondary accents |
| `--color-depth` | `#1F2326` | Graphite Shadow — borders, dividers |
| `--color-background` | `#E8E9EA` | Cloud Gray — page bg, card backgrounds |
| `--color-white` | `#FFFFFF` | Pure White — contrast, breathing room |
| `--color-muted` | `#9CA3A8` | Warm Gray — captions, muted text, dividers |
| `--color-accent` | `#E8A33D` | Signal Amber — CTA buttons, selected state, highlights |

### Answer Button States
- Default: white background, `--color-depth` border, `--color-dark` text
- Hover: `--color-secondary` at 10% opacity background
- Selected: `--color-accent` background, white text, subtle checkmark icon
- Selected state persists until Next is clicked

### Results Page
- Small outcome badge (e.g., "Result 2 of 4") in `--color-muted` — subtle only
- Headline: large font, `--color-dark`
- Diagnosis: readable body copy with line breaks — not a wall of text
- Pain callout cards: icon + sentence, `--color-background` card, `--color-primary` left border accent
- CTA button: full-width on mobile, centered on desktop, `--color-accent` background
- DSK logo loaded from CDN URL in `config.js` — displayed in header and at page bottom
- Business tagline at bottom: "Veteran-Owned. Straight Talk. Real Results."
- No navigation, no footer links, no distractions

---

## File Structure

```
dsk-ai-quiz/
│
├── index.html        # App shell — loads all CSS and JS
├── style.css         # All styles using CSS custom properties
├── quiz.js           # Quiz engine: state, DOM rendering, scoring, webhook
├── outcomes.js       # All outcome content: headlines, copy, CTAs, pain callout text
├── config.js         # ⚠️ David fills in all placeholder values before deploy
└── README.md         # Setup, config instructions, GHL checklist, deploy guide
```

No local assets folder needed — DSK logo loads directly from CDN URL in config.js.

---

## config.js — Complete File (David fills in PASTE_ placeholders before deploy)

```js
const CONFIG = {

  // ─── GHL Webhook ────────────────────────────────────────────────────────────
  // Copy Inbound Webhook URL from GHL Workflow trigger and paste here
  ghlWebhookUrl: "PASTE_GHL_INBOUND_WEBHOOK_URL_HERE",

  // ─── CTA Links Per Outcome ──────────────────────────────────────────────────
  // Outcome 1: No external link — two-button resource choice renders inline.
  // David is notified by GHL workflow when resourceAssistance = true.

  // Outcome 2: Soft 15-min clarity call (GHL calendar)
  outcome2CalendarUrl: "PASTE_OUTCOME_2_CALENDAR_URL_HERE",

  // Outcome 3: Free AI workflow call (GHL calendar)
  outcome3CalendarUrl: "PASTE_OUTCOME_3_CALENDAR_URL_HERE",

  // Outcome 4: AI audit consultation (GHL calendar or landing page)
  outcome4CalendarUrl: "PASTE_OUTCOME_4_AUDIT_URL_HERE",

  // ─── DSK Brand Colors ───────────────────────────────────────────────────────
  colorPrimary:    "#4A6470",  // Slate Steel    — buttons, headers, progress bar
  colorDark:       "#2B2F33",  // Deep Charcoal  — body text, footers
  colorSecondary:  "#5C7A8A",  // Dusk Blue      — hover states, secondary accents
  colorDepth:      "#1F2326",  // Graphite Shadow— borders, dividers
  colorBackground: "#E8E9EA",  // Cloud Gray     — page background, cards
  colorWhite:      "#FFFFFF",  // Pure White     — contrast, breathing room
  colorMuted:      "#9CA3A8",  // Warm Gray      — captions, dividers, muted text
  colorAccent:     "#E8A33D",  // Signal Amber   — CTA buttons, selected state
  // colorAccentAlt:"#3DBFB0", // Electric Teal  — reserved, use sparingly

  // ─── DSK Brand Identity ─────────────────────────────────────────────────────
  logoUrl:         "https://assets.cdn.filesafe.space/Ajx524SyzDiGKS2SIEuY/media/6a3e95a1c492ddc24c6d6f28.png",
  businessName:    "DSK Market Innovations",
  businessTagline: "Veteran-Owned. Straight Talk. Real Results.",

};
```

---

## GHL Setup Checklist

David completes all of the following inside GHL. None of this is built by Claude Code.

### 1 — Create Contact Custom Fields (aiquiz_ prefix)

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

---

### 2 — Create Custom Values (aiquiz_ prefix)

Settings → Custom Values (Location Level). Create all 4:

| Label | Key | Value |
|---|---|---|
| AI Quiz — Quiz URL | `aiquiz_quiz_url` | `https://[github-pages-url]` — fill in after GitHub deploy |
| AI Quiz — Outcome 2 Calendar | `aiquiz_outcome2_calendar_url` | GHL calendar link |
| AI Quiz — Outcome 3 Calendar | `aiquiz_outcome3_calendar_url` | GHL calendar link |
| AI Quiz — Outcome 4 Calendar | `aiquiz_outcome4_calendar_url` | GHL calendar or audit page link |

- [ ] All 4 custom values created (fill in URLs after deploy and calendars are built)

---

### 3 — Build the Opt-In Landing Page

- [ ] Headline: "Do I Need AI In My Business?"
- [ ] Subheadline: "Answer 6 honest questions. Get a free personalized assessment.
       No hype — just clarity."
- [ ] Embed GHL form (First Name + Email — 2 fields only, no phone field)
- [ ] Set form redirect URL:
       `https://[github-pages-url]/?fname={{contact.first_name}}&email={{contact.email}}`
- [ ] Test that merge tags resolve in redirect URL
       If not: use a workflow to send an immediate email with the personalized quiz link

---

### 4 — Build the Inbound Webhook Workflow

**Trigger:** Inbound Webhook → copy the webhook URL → paste into `config.js`

**Actions (execute in order):**

1. Find/Create Contact by `email` field from webhook payload
2. Update Contact — map webhook fields to aiquiz_ custom fields:
   - `outcome` → `aiquiz_outcome`
   - `outcomeLabel` → `aiquiz_outcome_label`
   - `maturityScore` → `aiquiz_maturity_score`
   - `chaosScore` → `aiquiz_chaos_score`
   - `painPoints` (join as comma-separated string) → `aiquiz_pain_points`
   - `resourceAssistance` (true→"yes" / false→"no" / null→blank) → `aiquiz_resource_assistance`
   - `completedAt` → `aiquiz_completed_at`
3. Add Tag: `ai-quiz-completed`
4. Branch on `outcome` field value → 4 branches

**Outcome 1 Branch:**
- Add Tag: `ai-quiz-outcome-1`
- Sub-branch on `resourceAssistance` value:
  - `"yes"` → Add Tag `ai-quiz-needs-resources` → Send David ⚠️ ACTION NEEDED notification
  - `"no"` → Add Tag `ai-quiz-self-sufficient` → Send David 🟡 no-action notification
- Enroll in Outcome 1 email sequence (same sequence both paths — David personalizes
  the first email manually when resourceAssistance = "yes")

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

---

### 5 — David Notification Emails

Add "Send Email" + "In-App User Notification" to each outcome branch.
All notifications go to: david@dskleads.com

---

**Outcome 1 — resourceAssistance = "yes"**
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

**Outcome 1 — resourceAssistance = "no"**
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

---

### 6 — Build Email Sequences (4 total — content TBD after app is live)

- [ ] Outcome 1 sequence — light nurture, no pitch, useful content for new businesses
- [ ] Outcome 2 sequence — process/clarity content, light CRM mention, soft DSK intro
- [ ] Outcome 3 sequence — AI use cases for home service, link to book workflow call
- [ ] Outcome 4 sequence — AI audit value content, urgency, link to audit consultation

---

### 7 — Build Booking Calendars (3 total)

- [ ] Outcome 2: "15-Minute Clarity Call" — soft, no-pitch framing
- [ ] Outcome 3: "Free AI Workflow Call" — specific, results-focused
- [ ] Outcome 4: "AI Audit Consultation" — high-value, professional framing

---

## Claude Code Build Notes

- All views rendered inside a single `<div id="app">` in `index.html`.
  No routing libraries. No page reloads. Pure DOM manipulation.

- On app init, apply DSK brand colors as CSS custom properties:
  ```js
  document.documentElement.style.setProperty('--color-primary',    CONFIG.colorPrimary);
  document.documentElement.style.setProperty('--color-dark',       CONFIG.colorDark);
  document.documentElement.style.setProperty('--color-secondary',  CONFIG.colorSecondary);
  document.documentElement.style.setProperty('--color-depth',      CONFIG.colorDepth);
  document.documentElement.style.setProperty('--color-background', CONFIG.colorBackground);
  document.documentElement.style.setProperty('--color-white',      CONFIG.colorWhite);
  document.documentElement.style.setProperty('--color-muted',      CONFIG.colorMuted);
  document.documentElement.style.setProperty('--color-accent',     CONFIG.colorAccent);
  ```

- Answer storage:
  ```js
  const answers = { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null };
  ```

- URL param read on load:
  ```js
  const params = new URLSearchParams(window.location.search);
  const fname  = params.get('fname') || 'there';
  const email  = params.get('email') || null;
  ```

- Intro View copy: `"Hey ${fname}, let's find out where you actually stand with AI."`
- Results View copy: `"${fname}, here's what your results say:"`

- Q4 skip logic: If `answers.q3 === 1` (Option A), set `answers.q4 = 1` automatically.
  Skip Q4 display. Adjust progress denominator from 6 to 5.

- Webhook timing:
  - Outcomes 2, 3, 4: Fire during Processing View delay. `async/await` + `try/catch`.
    Never block results display on webhook outcome.
  - Outcome 1: Do NOT fire during Processing View. Fire only when resource-choice
    button is clicked. Set `resourceAssistance: true` or `false` in payload.
    Render confirmation message immediately after firing — do not await.

- Pain callout rendering: Only render cards whose tag strings are present in
  `painPoints[]`. If array is empty, render nothing — no empty containers.

- `outcomes.js` structure:
  ```js
  const OUTCOMES = {
    1: {
      headline: "...",
      diagnosis: "...",
      needsList: ["...", "...", "..."],
      painCallouts: {},          // Outcome 1 has no pain callouts
      ctaType: "choice"          // Renders two-button choice, not a link button
    },
    2: {
      headline: "...",
      diagnosis: "...",
      needsList: ["...", "...", "..."],
      painCallouts: { "no-documented-process": "...", "manual-data-entry": "..." },
      ctaLabel: "Let's Figure It Out — Free 15 Min →",
      ctaUrl: CONFIG.outcome2CalendarUrl
    },
    // ... same shape for 3 and 4
  };
  ```

- Logo in header:
  ```html
  <img src="CONFIG.logoUrl" alt="DSK Market Innovations" />
  ```
  Inject `CONFIG.logoUrl` via JS when rendering each view's header.

- `README.md` must include:
  1. How to enable GitHub Pages (Settings → Pages → Deploy from main / root)
  2. How to fill in `config.js` (include the full placeholder block as reference)
  3. Full copy of the GHL Setup Checklist from this document
  4. How to test the webhook using a GHL test trigger before going live
