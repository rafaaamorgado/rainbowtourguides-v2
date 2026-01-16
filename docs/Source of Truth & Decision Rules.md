\# DOC-00 — Source of Truth & Decision Rules

\*\*Doc ID:\*\* DOC-00-SOURCE-OF-TRUTH    
\*\*Last updated:\*\* 2026-01-16    
\*\*Audience:\*\* Product / Design / Engineering / Ops / AI coding agents    
\*\*Purpose:\*\* Prevent contradictions. Make Claude Code / Cursor / Codex deterministic when specs disagree.

\---

\#\# 1\) Authority order (what wins when docs conflict)

When two sources disagree, the winner is decided by this order:

1\. \*\*Rainbow Tour Guides v2 — Master Context\*\*    
2\. \*\*New PRD (Last Updated Dec 3rd 25)\*\*    
3\. \*\*Persona specs\*\* (Visitor / Traveler / Guide / Admin) \+ key journey docs    
4\. \*\*DB Reality\*\* (Database Structure — Supabase public schema)    
5\. \*\*Codebase & Product Overview\*\* (what’s implemented today)

\*\*Rule of thumb:\*\*    
\- Master Context \+ PRD define \*\*intent\*\* (“what we are building”).    
\- DB reality \+ codebase define \*\*constraints\*\* (“what exists today”).    
\- Persona specs define \*\*experience\*\* (“how it should feel and flow”).

\---

\#\# 2\) Conflict resolution protocol (mandatory)

When a conflict is detected:

\#\#\# Step 1 — Categorize it  
\- \*\*Type A: Product intent conflict\*\* (what we should build)    
\- \*\*Type B: Model/Schema conflict\*\* (fields/tables/enums don’t match)    
\- \*\*Type C: Routing/IA conflict\*\* (URLs, nav, page ownership)    
\- \*\*Type D: Policy/safety conflict\*\* (trust & safety / eligibility / moderation)

\#\#\# Step 2 — Apply the authority order  
\- If Master Context and PRD disagree, \*\*Master Context wins for v2\*\* and PRD becomes “later” unless explicitly tagged “launch requirement.”

\#\#\# Step 3 — Document the decision  
\- Add an entry to \*\*Open Questions Log\*\* (see §3) \*\*or\*\* record as a “Decision (Locked)” if it’s final.

\#\#\# Step 4 — Choose conservative defaults  
If still ambiguous after applying authority:  
\- Choose the option that is \*\*safer\*\*, \*\*more privacy-preserving\*\*, \*\*less legally risky\*\*, and \*\*simpler to ship\*\*.  
\- Do \*\*not\*\* invent new tables/enums/routes silently. Record it.

\---

\#\# 3\) Open Questions Log (single source)

\*\*Where:\*\* Add to \*\*Master Context\*\* under a section named \`Open Questions (v2)\`.

\*\*Format (copy/paste template):\*\*  
\- \*\*\[OQ-\#\#\#\] Title\*\*    
  \- Context: …    
  \- Options: A / B / C    
  \- Default for now: …    
  \- Owner: Rafa    
  \- Due by: (date)    
  \- Impacted docs/routes: …

\*\*Rule:\*\* Only the Master Context holds canonical open questions. Other docs reference them by ID.

\---

\#\# 4\) Decision taxonomy (AI must respect these labels)

Every meaningful decision should be tagged as one of:

\- \*\*Locked (v2)\*\* — do not change without explicit instruction    
\- \*\*Default (v2)\*\* — may change, but only through Open Question resolution    
\- \*\*Experimental\*\* — allowed to iterate quickly (copy/UX/layout)    
\- \*\*Phase 2+\*\* — explicitly out of v2 scope

Agents must not treat “Phase 2+” items as requirements.

\---

\#\# 5\) Canonical product decisions (Locked for v2)

\#\#\# 5.1 Verification approach (Locked)  
\*\*Guide identity verification is Stripe-first.\*\*

\- Guides complete \*\*Stripe Connect onboarding\*\* (KYC/identity is handled by Stripe).  
\- RTG stores only \*\*minimal Stripe identifiers \+ derived verification status\*\*:  
  \- \`guides.stripe\_account\_id\` (to be added)  
  \- \`guides.verification\_status\` (derived; see DOC-02)  
  \- optional: \`guides.stripe\_requirements\` (sanitized summary, not PII)

\*\*RTG does NOT store government ID images in Supabase Storage.\*\*    
If any older doc mentions “ID upload”, treat it as \*\*deprecated\*\* for v2.

\> Required follow-up change: update Master Context where it mentions “ID upload” as a requirement.

\#\#\# 5.2 Booking model (Locked)  
\- v2 booking is \*\*request → accept → pay → confirm\*\* (Stripe Checkout).  
\- Status model uses: \`draft → pending → accepted → confirmed → completed\` plus decline/cancel variants (see DOC-02).

\#\#\# 5.3 Messaging gate (Default for v2)  
\- Messaging opens at \*\*accepted\*\* (recommended) OR \*\*confirmed\*\* (safer).    
If not decided, default to \*\*accepted with guardrails\*\* (no attachments, report button, moderation).

\#\#\# 5.4 Safety posture (Locked)  
\- Not a hookup product; no sexual services; boundaries enforced.

\---

\#\# 6\) Terminology normalization (must be consistent)

\- \*\*Public marketplace:\*\* \`guides\` (plural) routes    
  \- \`/guides/\[handle\]\` \= public guide profile    
\- \*\*Guide app area:\*\* \`guide\` (singular) routes    
  \- \`/guide/dashboard\`, \`/guide/onboarding\`, etc.  
\- “Booking” refers to a \*\*single session\*\* in v2.  
\- “Reservation” (multi-day container) is \*\*v2.1+\*\* (future-ready only).

\---

\#\# 7\) Document index (current docs pack)

\#\#\# 7.1 Product intent & global  
\- Rainbow Tour Guides v2 — Master Context    
\- New PRD (Last Updated Dec 3rd 25\)    
\- Rainbow Tour Guides v2 — Founder Clarity Brief Simplified    
\- Rainbow Tour Guides v2 — Product Specs (Global Overview)

\#\#\# 7.2 Persona \+ journey  
\- Visitor Product Spec (Guest)    
\- Traveler Product Spec (Logged-in)    
\- Guide Product Spec (Guide/Host)    
\- Admin Product Spec    
\- Traveler Journey (End-to-End)    
\- User Journey Narrative (All Personas)

\#\#\# 7.3 Key functional specs  
\- Guide Onboarding Spec (incl. Stripe verification)    
\- Pricing & Fees Spec    
\- Concierge Page Spec \+ Concierge Draft

\#\#\# 7.4 Data reality  
\- Database Structure (Supabase public schema)    
\- Codebase & Product Overview (current implementation)

\#\#\# 7.5 Glue docs (this set)  
\- DOC-00 Source of Truth & Decision Rules    
\- DOC-01 Routes & Navigation Map    
\- DOC-02 State Machines & Enums    
\- DOC-03 Data Contracts    
\- DOC-04 Reality vs Plan Matrix

\---

\#\# 8\) Acceptance checks (“Done means”)  
\- Conflicts are resolvable without debate because authority order is clear.  
\- Open Questions exist in one place only (Master Context).  
\- Verification approach is consistent everywhere: Stripe-first, no Supabase ID storage.  
\- Agents can safely build without inventing routes/enums/tables.

\# DOC-01 — Routes & Navigation Map (Canonical)

\*\*Doc ID:\*\* DOC-01-ROUTES-NAVIGATION-MAP    
\*\*Last updated:\*\* 2026-01-16    
\*\*Audience:\*\* Product / Design / Engineering / AI coding agents    
\*\*Purpose:\*\* Prevent route drift, duplicates, broken linking, and inconsistent layout groups.

\---

\#\# 1\) Route naming rules (Locked)

\- Public marketplace uses \*\*plural\*\*: \`/guides\`, \`/cities\`  
\- Guide app uses \*\*singular\*\* prefix: \`/guide/\*\`  
\- Traveler app uses \`/traveler/\*\`  
\- Admin uses \`/admin/\*\`  
\- Concierge is canonical: \`/concierge\` (never \`\_concierge\`)

\---

\#\# 2\) Layout groups (recommended)

Use explicit route groups in Next.js App Router:

\- \`(marketing)\` for public pages    
\- \`(auth)\` for auth screens    
\- \`(traveler)\` traveler app shell    
\- \`(guide)\` guide app shell    
\- \`(admin)\` admin console shell    
\- \`(legal)\` legal pages

(Your codebase may already implement some of this; if not, this is the target organization.)

\---

\#\# 3\) Canonical routes table

\*\*Legend\*\*  
\- \*\*Auth:\*\* \`Public\` | \`Login\` | \`Role: traveler/guide/admin\`  
\- \*\*Status:\*\* \`Built\` | \`Partial\` | \`Planned\`  
\- \*\*Layout:\*\* suggested layout group (not necessarily current code)

| Route | Audience | Auth | Layout | Status | Notes |  
|---|---|---|---|---|---|  
| \`/\` | Visitor | Public | (marketing) | Built | Marketing home |  
| \`/cities\` | Visitor/Traveler | Public | (marketing) | Built | Listing \+ search |  
| \`/cities/\[slug\]\` | Visitor/Traveler | Public | (marketing) | Built | SEO city \+ guides |  
| \`/guides\` | Visitor/Traveler | Public | (marketing) | Built | Global directory |  
| \`/guides/\[slugOrHandle\]\` | Visitor/Traveler | Public | (marketing) | Built | Public guide profile |  
| \`/countries/\[slug\]\` | Visitor | Public | (marketing) | Built | \*\*Check DB reality\*\*: countries has no slug currently |  
| \`/how-it-works\` | Visitor | Public | (marketing) | Built | Explain booking \+ verification \+ safety |  
| \`/faq\` | Visitor | Public | (marketing) | Built | FAQ |  
| \`/blog\` | Visitor | Public | (marketing) | Built | Currently mock content |  
| \`/blog/\[slug\]\` | Visitor | Public | (marketing) | Built | Currently mock content |  
| \`/about\` | Visitor | Public | (marketing) | Planned | Mentioned in Visitor spec |  
| \`/contact\` | Visitor | Public | (marketing) | Planned | Contact form |  
| \`/safety\` | Visitor | Public | (marketing) | Built | Legal safety exists; unify URL strategy |  
| \`/legal/terms\` | Visitor | Public | (legal) | Built | |  
| \`/legal/privacy\` | Visitor | Public | (legal) | Built | |  
| \`/legal/safety\` | Visitor | Public | (legal) | Built | Consider redirect from \`/safety\` or vice versa |  
| \`/legal/refunds\` | Visitor | Public | (legal) | Planned | Needed for pricing/refund clarity |  
| \`/legal/community\` | Visitor | Public | (legal) | Planned | Community guidelines |  
| \`/concierge\` | Visitor/Traveler | Public | (marketing) | Planned/Partial | Page spec exists; confirm implementation |  
| \`/sitemap.xml\` | Visitor | Public | (marketing) | Planned | SEO |  
| \`/sitemap\` | Visitor | Public | (marketing) | Planned | Optional HTML sitemap |

\#\#\# Auth routes  
| Route | Audience | Auth | Layout | Status | Notes |  
|---|---|---|---|---|---|  
| \`/auth/sign-in\` | All | Public | (auth) | Built | |  
| \`/auth/sign-up\` | All | Public | (auth) | Built | |  
| \`/auth/callback\` | All | Public | (auth) | Built | OAuth callback |  
| \`/auth/sign-out\` | All | Login | (auth) | Built | |  
| \`/account\` | All | Login | (account) | Built | Role-aware summary/redirect |

\#\#\# Traveler app  
| Route | Audience | Auth | Layout | Status | Notes |  
|---|---|---|---|---|---|  
| \`/traveler\` | Traveler | Role: traveler | (traveler) | Built | Redirect to dashboard |  
| \`/traveler/onboarding\` | Traveler | Role: traveler | (traveler) | Built | Wizard |  
| \`/traveler/dashboard\` | Traveler | Role: traveler | (traveler) | Built | |  
| \`/traveler/bookings\` | Traveler | Role: traveler | (traveler) | Built | Tabs by status |  
| \`/traveler/bookings/\[id\]\` | Traveler | Role: traveler | (traveler) | Built | Booking detail |  
| \`/traveler/messages\` | Traveler | Role: traveler | (traveler) | Built | Threads |  
| \`/traveler/messages/\[threadId\]\` | Traveler | Role: traveler | (traveler) | Built | Thread detail |  
| \`/traveler/profile\` | Traveler | Role: traveler | (traveler) | Built | Public/private fields |  
| \`/traveler/reviews\` | Traveler | Role: traveler | (traveler) | Built | Review management |

\#\#\# Guide app  
| Route | Audience | Auth | Layout | Status | Notes |  
|---|---|---|---|---|---|  
| \`/guide\` | Guide | Role: guide | (guide) | Built | Redirect |  
| \`/guide/onboarding\` | Guide | Role: guide | (guide) | Built | Includes Stripe Connect start |  
| \`/guide/dashboard\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/bookings\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/bookings/\[id\]\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/messages\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/messages/\[threadId\]\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/profile\` | Guide | Role: guide | (guide) | Built | Public profile editor |  
| \`/guide/pricing\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/photos\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/availability\` | Guide | Role: guide | (guide) | Built | Weekly \+ blackout dates |  
| \`/guide/reviews\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/settings\` | Guide | Role: guide | (guide) | Built | |  
| \`/guide/payouts\` | Guide | Role: guide | (guide) | Built | Stripe Connect status |

\#\#\# Admin console  
| Route | Audience | Auth | Layout | Status | Notes |  
|---|---|---|---|---|---|  
| \`/admin\` | Admin | Role: admin | (admin) | Built | |  
| \`/admin/guides\` | Admin | Role: admin | (admin) | Built | Verification queue |  
| \`/admin/bookings\` | Admin | Role: admin | (admin) | Built | |  
| \`/admin/reviews\` | Admin | Role: admin | (admin) | Built | |  
| \`/admin/content/blog\` | Admin | Role: admin | (admin) | Built | Minimal CMS area |  
| \`/admin/users\` | Admin | Role: admin | (admin) | Planned | Spec expects |  
| \`/admin/reports\` | Admin | Role: admin | (admin) | Planned | Safety incidents |  
| \`/admin/refunds\` | Admin | Role: admin | (admin) | Planned | Disputes/refunds |  
| \`/admin/payouts\` | Admin | Role: admin | (admin) | Planned | Stripe Connect |  
| \`/admin/settings\` | Admin | Role: admin | (admin) | Planned | Fees/policies |  
| \`/admin/logs\` | Admin | Role: admin | (admin) | Planned | Webhooks/errors |  
| \`/admin/audit\` | Admin | Role: admin | (admin) | Planned | Audit log UI |

\#\#\# Debug/utility (dev only)  
| Route | Audience | Auth | Layout | Status | Notes |  
|---|---|---|---|---|---|  
| \`/test-connection\` | Dev | Public | (debug) | Built | Should be disabled in prod |  
| \`/debug/auth\` | Dev | Login | (debug) | Built | Should be disabled in prod |  
| \`/api/debug/queries\` | Dev | Login | (api) | Built | Dev-only |

\---

\#\# 4\) Navigation model (who sees what)

\#\#\# 4.1 Topbar (public)  
\- Explore → \`/cities\`  
\- Blog → \`/blog\`  
\- How it works → \`/how-it-works\`  
\- Concierge → \`/concierge\`  
\- Become a Guide → \`/guide/onboarding\` (or a public landing if desired)  
\- Sign in / Join → \`/auth/sign-in\` / \`/auth/sign-up\`

\#\#\# 4.2 Role-aware nav (logged in)  
\- Traveler: Dashboard / Bookings / Messages / Profile  
\- Guide: Dashboard / Bookings / Messages / Profile / Availability / Payouts  
\- Admin: Admin Console

\---

\#\# 5\) Acceptance checks (“Done means”)  
\- No duplicate routes exist for the same concept.  
\- \`/concierge\` is canonical and linked consistently.  
\- Public guide pages are \`/guides/\*\`, guide app is \`/guide/\*\`.  
\- Routes marked “Planned” are not referenced as “Built” in other docs.

\# DOC-02 — State Machines & Enums (Canonical)

\*\*Doc ID:\*\* DOC-02-STATE-MACHINES-ENUMS    
\*\*Last updated:\*\* 2026-01-16    
\*\*Audience:\*\* Engineering / Product / AI coding agents    
\*\*Purpose:\*\* One canonical set of enums and transitions. Prevents logic drift across pages, DB, and APIs.

\---

\#\# 0\) Global rules

\- Do \*\*not\*\* invent enum values ad-hoc inside UI or API handlers.  
\- All guards (messaging eligibility, review eligibility, payout eligibility) must reference these enums.  
\- When DB reality differs, create a migration plan (see DOC-04).

\---

\#\# 1\) \`booking\_status\` (canonical for v2)

\#\#\# 1.1 Enum values  
\- \`draft\` — internal only (optional); not yet requested  
\- \`pending\` — traveler requested; awaiting guide decision  
\- \`accepted\` — guide accepted; awaiting traveler payment  
\- \`confirmed\` — payment successful; booking confirmed  
\- \`declined\` — guide declined  
\- \`cancelled\_by\_traveler\`  
\- \`cancelled\_by\_guide\`  
\- \`completed\`

\> Note: refunds/disputes are \*\*not\*\* separate booking statuses in v2. Track refunds separately (later table) or via Stripe events \+ admin notes.

\#\#\# 1.2 Transition rules (allowed moves)

\`\`\`mermaid  
stateDiagram-v2  
  \[\*\] \--\> draft  
  draft \--\> pending: traveler\_submits\_request  
  pending \--\> accepted: guide\_accepts  
  pending \--\> declined: guide\_declines  
  accepted \--\> confirmed: stripe\_payment\_success  
  accepted \--\> cancelled\_by\_traveler: traveler\_cancels\_before\_payment  
  accepted \--\> cancelled\_by\_guide: guide\_cancels\_before\_payment  
  confirmed \--\> cancelled\_by\_traveler: traveler\_cancels (policy applies)  
  confirmed \--\> cancelled\_by\_guide: guide\_cancels (policy applies)  
  confirmed \--\> completed: guide\_marks\_completed (or auto after time)  
  declined \--\> \[\*\]  
  cancelled\_by\_traveler \--\> \[\*\]  
  cancelled\_by\_guide \--\> \[\*\]  
  completed \--\> \[\*\]  
​​

### **.3 Access gates (must be consistent)**

* **Messaging enabled when:** `booking_status IN (accepted, confirmed, completed)`

  * If you decide “messaging only after payment,” then use `(confirmed, completed)` instead.

* **Review enabled when:** `booking_status = completed`

* **Checkout allowed when:** `booking_status = accepted`

* **Payout eligible when:** `booking_status = completed` \+ cooldown (policy, e.g. 48h)

---

## **2\) `verification_status` (Stripe-first; guides)**

### **2.1 What RTG stores (minimal \+ privacy safe)**

RTG stores **no ID documents**. Stripe performs identity verification during Connect onboarding.

Recommended fields:

* `guides.stripe_account_id` (text) **REQUIRED**

* `guides.verification_status` (enum below)

* Optional (safe summaries):

  * `guides.stripe_charges_enabled` (bool)

  * `guides.stripe_payouts_enabled` (bool)

  * `guides.stripe_requirements_due` (text\[\])

  * `guides.stripe_disabled_reason` (text)

### **2.2 Enum values**

* `not_started` — no Stripe account created/linked

* `in_progress` — Stripe onboarding started; requirements pending

* `verified` — Stripe indicates onboarding sufficient for payouts (payouts enabled)

* `restricted` — Stripe indicates account restricted/disabled; action required

* `rejected` — Stripe permanently rejected (rare; treat as restricted \+ admin decision)

* `suspended` — RTG admin suspended the guide (policy enforcement)

### **2.3 Mapping from Stripe → `verification_status` (deterministic)**

**Pseudo-logic** (exact fields may vary by Stripe object; implement via webhook \+ periodic refresh):

* If `stripe_account_id is null` → `not_started`

* Else if payouts not enabled OR requirements due not empty → `in_progress`

* Else if payouts enabled AND charges enabled → `verified`

* Else if disabled reason exists OR requirements past\_due → `restricted`

* Admin enforcement overrides all → `suspended`

`stateDiagram-v2`  
  `[*] --> not_started`  
  `not_started --> in_progress: create_or_link_stripe_account`  
  `in_progress --> verified: stripe_onboarding_complete`  
  `in_progress --> restricted: stripe_restricts_account`  
  `verified --> restricted: stripe_restricts_account`  
  `restricted --> in_progress: guide_resolves_requirements`  
  `restricted --> rejected: permanent_failure (rare)`  
  `verified --> suspended: admin_suspends`  
  `in_progress --> suspended: admin_suspends`  
  `restricted --> suspended: admin_suspends`  
  `suspended --> verified: admin_reinstates (if Stripe ok)`

### **2.4 Listing gate (must be consistent)**

A guide is eligible to appear in public listings only when:

* `guides.approved = true` (admin approved) AND

* `guides.verification_status = verified`

(If you want “approved but not verified” to preview privately, keep them unlisted.)

---

## **3\) `concierge_request_status` (v2 manual ops)**

### **3.1 Enum values**

* `new`

* `contacted`

* `in_progress`

* `delivered`

* `closed`

`stateDiagram-v2`  
  `[*] --> new`  
  `new --> contacted: ops_reaches_out`  
  `contacted --> in_progress: intake_confirmed`  
  `in_progress --> delivered: plan_sent`  
  `delivered --> closed: traveler_done`  
  `contacted --> closed: traveler_unresponsive_or_cancelled`  
  `new --> closed: invalid_or_spam`

---

## **4\) `dispute_status` (admin workflow)**

### **4.1 Enum values (from Admin spec)**

* `opened`

* `in_review`

* `resolved_refunded`

* `resolved_denied`

* `escalated`

`stateDiagram-v2`  
  `[*] --> opened`  
  `opened --> in_review: admin_triage`  
  `in_review --> resolved_refunded: refund_issued`  
  `in_review --> resolved_denied: deny_with_reason`  
  `in_review --> escalated: complex_case`  
  `escalated --> resolved_refunded: refund_issued`  
  `escalated --> resolved_denied: deny_with_reason`

---

## **5\) (Recommended) Additional enums to standardize soon**

These aren’t required by this doc set, but you’ll benefit from defining them early:

* `profile_role`: add `moderator`, `finance` OR use a separate permissions table

* `guide_profile_status`: `draft`, `submitted`, `changes_requested`, `approved`, `rejected`, `suspended`

  * Today you approximate this with `approved` \+ `reviewed_by` \+ notes. Consider normalizing later.

---

## **6\) Acceptance checks (“Done means”)**

* All code paths use these enums (no duplicates like `paid` vs `confirmed`).

* Stripe verification logic is deterministic and privacy-safe.

* Messaging/reviews gates are consistent across traveler \+ guide \+ admin.

`---`

```` ```md ````  
`# DOC-03 — Data Contracts (Per Route)`

`**Doc ID:** DOC-03-DATA-CONTRACTS`    
`**Last updated:** 2026-01-16`    
`**Audience:** Engineering / AI coding agents`    
`**Purpose:** For every route, define: required reads/writes, and permission expectations (RLS/guards).`

`---`

`## 0) Contract rules (non-negotiable)`

`1. **Route code must not invent schema.** If a field/table doesn’t exist, mark it as a DOC-04 gap.`  
`2. **All writes must be role-guarded server-side.** UI hiding is not security.`  
`3. **Sensitive data rule:** RTG does **not** store guide ID documents in Supabase. Stripe verification only.`  
`4. **Messaging and reviews must be booking-scoped** (one thread per booking; reviews tied to booking).`

`---`

`## 1) Data sources`

`### 1.1 Supabase (DB)`  
`Current core tables referenced in v2:`  
`` - `countries`, `cities` ``  
`` - `profiles` ``  
`` - `guides`, `guide_photos`, `guide_unavailable_dates` ``  
`` - `bookings` ``  
`` - `messages` ``  
`` - `reviews`, `review_replies` ``

`### 1.2 Stripe`  
`- Checkout Sessions + PaymentIntents for traveler payment`  
`- Connect Accounts for guide verification/payout eligibility`

`---`

`## 2) Public / marketing routes`

`` ### `/` ``  
`**Reads**`  
``- `cities` (featured/active) *(if “featured” field doesn’t exist, use a curated list in code for now)*``  
``- `guides` + `guide_photos` (featured guides)``

`**Writes**`  
`- none (optional: newsletter signup later)`

`**Permissions**`  
`- public read allowed only for non-sensitive fields`

`---`

`` ### `/cities` ``  
`**Reads**`  
`` - `cities` WHERE `is_active = true` ``  
``- optional join: `countries` for display``

`**Writes**`  
`- none`

`**Permissions**`  
`- public read safe`

`---`

`` ### `/cities/[slug]` ``  
`**Reads**`  
`` - `cities` by `slug` ``  
`` - `guides` WHERE `city_id = cities.id` AND `approved = true` AND `verification_status = verified` ``  
``- `guide_photos` (main photo by `sort_order=0`)``  
``- optional: aggregate `reviews` for rating summary``  
``- optional: compute city “typical range” from `guides.price_*` (see Pricing spec)``

`**Writes**`  
`- none for guests`  
``- (optional traveler-only) booking draft stored client-side or in DB as `bookings` with `draft` status``

`**Permissions**`  
`- public: only approved+verified guides`  
`- traveler: can create booking drafts only for self`

`---`

`` ### `/guides` ``  
`**Reads**`  
``- `guides` WHERE approved+verified``  
``- `cities` for filtering``  
`` - `guide_photos` ``  
`- optional: rating aggregates`

`**Writes**`  
`- none`

`**Permissions**`  
`- public safe`

`---`

`` ### `/guides/[handle]` ``  
`**Reads**`  
``- `guides` by handle/slug (implementation-defined)``  
``- `guide_photos` gallery``  
``- `reviews` for this guide (via `booking_id` join)``  
`- guide availability snapshot:`  
  `` - `guides.availability_pattern` + `guide_unavailable_dates` ``

`**Writes**`  
``- traveler: create booking request (`bookings` insert → `pending`)``  
`- traveler: cannot write messages unless booking eligible`

`**Permissions**`  
`- public: show only approved+verified guides; blur/lock pricing if you choose soft walls`  
`- traveler: booking creation allowed`

`---`

`` ### `/blog`, `/blog/[slug]` ``  
`**Reads**`  
`- v2: mock content OR future CMS table`  
`**Writes**`  
`- none`  
`**Permissions**`  
`- public safe`

`---`

`` ### `/how-it-works`, `/faq`, `/about`, `/contact`, `/concierge` ``  
`Mostly content routes. The only write-heavy one is concierge.`

`` ### `/concierge` ``  
`**Reads**`  
``- none required (optional: supported cities list via `cities`)``

`**Writes**`  
``- `concierge_requests` (NEW TABLE; not in DB reality yet)``  
  `- store intake form submission`

`**Permissions**`  
`- public write allowed with abuse controls (rate limit, spam protection)`

`---`

`## 3) Auth routes`

`` ### `/auth/sign-in`, `/auth/sign-up`, `/auth/callback`, `/auth/sign-out` ``  
`**Reads/Writes**`  
`- Supabase Auth`  
``- `profiles` row creation on first auth``

`**Permissions**`  
`- public, but writes are limited to self via Auth`

`---`

`## 4) Traveler app routes`

`` ### `/traveler/onboarding` ``  
`**Reads**`  
``- `profiles` (self)``

`**Writes**`  
``- update `profiles` fields:``  
  ``- `full_name`, `pronouns`, `languages`, `avatar_url`, etc.``

`**Permissions**`  
`- traveler-only, self-only`

`---`

`` ### `/traveler/bookings` ``  
`**Reads**`  
`` - `bookings` WHERE `traveler_id = auth.user.id` ``  
`` - joins: `guides`, `cities`, `guide_photos` ``

`**Writes**`  
`- none (list view)`  
`- actions:`  
  ``- cancel booking: update status → `cancelled_by_traveler` (guard by rules)``

`**Permissions**`  
`- traveler-only, participant-only`

`---`

`` ### `/traveler/bookings/[id]` ``  
`**Reads**`  
``- booking by `id` where traveler is participant``  
`- join: guide info, city info, messages count`  
`` - payment fields: `stripe_checkout_session_id`, `stripe_payment_intent_id` ``

`**Writes**`  
`- cancellation (status update)`  
``- review creation (insert into `reviews` once completed)``  
`- optional: traveler “confirm completed” (if implemented)`

`**Permissions**`  
`- traveler-only, participant-only`

`---`

`` ### `/traveler/messages`, `/traveler/messages/[threadId]` ``  
`**Reads**`  
``- `messages` WHERE booking participant``  
`- booking context for header (guide/traveler names, date, status)`

`**Writes**`  
``- insert `messages` (sender_id=self, booking_id)``  
`- only if booking status eligible (see DOC-02)`

`**Permissions**`  
`- traveler-only, participant-only`  
`- admin read-only access must be audited (future)`

`---`

`` ### `/traveler/profile`, `/traveler/reviews` ``  
`**Reads/Writes**`  
``- `profiles` self``  
`- reviews authored by self, or received (if traveler profile reviews are enabled)`

`**Permissions**`  
`- self-only`

`---`

`## 5) Guide app routes`

`` ### `/guide/onboarding` ``  
`**Reads**`  
``- `profiles` self``  
``- `guides` self (extension table)``

`**Writes**`  
``- create/update `guides` row``  
`- create Stripe Connect account + save:`  
  ``- `guides.stripe_account_id` (gap today)``

`**Permissions**`  
`- guide-only, self-only`

`---`

`` ### `/guide/profile`, `/guide/pricing`, `/guide/photos`, `/guide/availability` ``  
`**Reads**`  
``- `guides` self``  
`` - `guide_photos` ``  
`` - `guide_unavailable_dates` ``

`**Writes**`  
``- update `guides` profile fields (bio, tags, prices, currency)``  
`` - insert/update/delete `guide_photos` ``  
`` - insert/update/delete `guide_unavailable_dates` ``  
`` - update `guides.availability_pattern` ``

`**Permissions**`  
`- guide-only, self-only`

`---`

`` ### `/guide/bookings`, `/guide/bookings/[id]` ``  
`**Reads**`  
`` - bookings where `guide_id = self` ``  
``- join: traveler public profile (limited subset from `profiles`)``  
`- messages for that booking`

`**Writes**`  
`- accept/decline booking:`  
  `` - `pending → accepted` or `pending → declined` ``  
`- mark completed:`  
  `` - `confirmed → completed` ``

`**Permissions**`  
`- guide-only, participant-only`

`---`

`` ### `/guide/messages` ``  
`Same as traveler messages but from guide participant view.`

`---`

`` ### `/guide/payouts` ``  
`**Reads**`  
`- Stripe Connect status for self (via Stripe API)`  
``- optional stored summaries in `guides` (safe fields only)``

`**Writes**`  
`- none (Connect onboarding links may be created server-side)`

`**Permissions**`  
`- guide-only, self-only`

`---`

`## 6) Admin routes`

`> Note: Admin spec expects more admin routes than currently implemented. Treat missing ones as planned.`

`` ### `/admin/guides` ``  
`**Reads**`  
``- `guides` queue:``  
  `- profile completeness fields`  
  `` - `approved` ``  
  ``- `verification_status` (derived from Stripe)``  
``- `profiles` for guide identity (non-sensitive)``  
`- Stripe account status (server-side fetch)`

`**Writes**`  
`- approve/reject:`  
  `` - set `guides.approved` ``  
  `` - set `guides.reviewed_by`, `guides.reviewed_at` ``  
`- enforcement:`  
  ``- set `guides.verification_status = suspended` (or equivalent enforcement flag)``

`**Permissions**`  
`- admin-only`

`---`

`` ### `/admin/bookings` ``  
`**Reads**`  
`- bookings platform-wide (with filters)`  
`- join: guides, travelers, cities`  
`- Stripe payment status (server-side fetch if needed)`

`**Writes**`  
`- manual status updates (guarded + audited)`  
`- freeze chat (future flag; not in DB yet)`  
`- refunds (Stripe action + record in DB later)`

`**Permissions**`  
`- admin-only, actions require reason codes`

`---`

`` ### `/admin/reviews` ``  
`**Reads**`  
`- reviews + replies`  
`**Writes**`  
`- hide/delete/restore (needs moderation fields — may be missing)`  
`**Permissions**`  
`- admin/moderator-only`

`---`

`## 7) API routes`

`` ### `POST /api/checkout/create-session` ``  
`**Reads**`  
`- booking by id (must be owned by traveler)`  
``- guide pricing to compute amount (or use `bookings.price_total` if already computed)``

`**Writes**`  
`- Stripe Checkout session created`  
`` - persist `bookings.stripe_checkout_session_id` ``

`**Permissions**`  
`- traveler-only; ownership check required`

`---`

`` ### `GET /api/checkout/verify-session` ``  
`**Reads**`  
`- Stripe session/payment intent status`  
`**Writes**`  
`` - if paid: `accepted → confirmed` ``  
``- persist `stripe_payment_intent_id` if present``  
`- trigger emails (may be stubbed)`

`**Permissions**`  
`- traveler-only; booking ownership check`

`---`

`` ### (Planned) Stripe Connect webhook: `/api/stripe/webhook` ``  
`**Reads**`  
`- event payload`  
`**Writes**`  
``- update `guides.verification_status` and safe Stripe summary fields``  
`**Permissions**`  
`- Stripe signature verification required`

`---`

`## 8) Acceptance checks (“Done means”)`  
`- Every route has explicit reads/writes and role guards.`  
`- Booking status transitions only occur via allowed transitions (DOC-02).`  
`- Stripe-first verification is enforced and privacy-safe.`  
`- Gaps discovered here are captured in DOC-04 with migration notes.`

---

`# DOC-04 — Reality vs Plan Matrix (DB vs Code vs v2 Needs)`

`**Doc ID:** DOC-04-REALITY-VS-PLAN-MATRIX`    
`**Last updated:** 2026-01-16`    
`**Audience:** Product / Engineering / AI coding agents`    
`**Purpose:** Stop “schema hallucinations.” Clearly mark what exists today vs what must be added.`

`---`

`## 1) How to read this matrix`

`Columns:`  
`- **Exists in Supabase now?** = confirmed in current public schema doc`  
`- **Exists in code types?** = referenced in codebase overview / likely TS types`  
`- **Required for v2 launch?** = must-have to ship core loop`  
`- **Workaround** = minimal viable alternative if missing`  
`- **Migration note** = what to add/change when you’re ready`

`---`

`## 2) Reality vs plan matrix`

`| Feature / Object | Table / Field | Exists in Supabase now? | Exists in code types? | Required for v2 launch? | Workaround (if missing) | Migration note |`  
`|---|---|---:|---:|---:|---|---|`  
``| Users & roles | `profiles` | ✅ | ✅ | ✅ | — | Tighten RLS: public read is too broad |``  
``| Role enum expansion | `profile_role` includes moderator/finance | ❓ (likely no) | ❓ | ❌ (v2) | Use `admin` only for now | Add roles or implement permissions table |``  
``| Cities listing | `cities(id,country_id,name,slug,is_active)` | ✅ | ✅ | ✅ | — | Add `description`, `hero_image`, `featured`, SEO fields later |``  
``| Countries | `countries(iso_code,name)` | ✅ | ✅ | ❌ | Use iso_code for routing or remove `/countries/[slug]` | Add `slug` if you want country pages |``  
``| Guide core profile | `guides` | ✅ | ✅ | ✅ | — | Normalize guide profile status later |``  
``| Guide approval | `guides.approved` + `reviewed_by/at` | ✅ | ✅ | ✅ | — | Consider `guide_profile_status` enum later |``  
``| Guide photos | `guide_photos` | ✅ | ✅ | ✅ | — | Ensure main photo rule via `sort_order` |``  
``| Guide availability | `guides.availability_pattern` + `guide_unavailable_dates` | ✅ | ✅ | ✅ | — | If code expects `availability_slots`, align to reality or add slots table |``  
``| Stripe Checkout payment | `bookings.stripe_checkout_session_id`, `stripe_payment_intent_id` | ✅ | ✅ | ✅ | — | Add payment_status field later if needed |``  
``| Booking statuses (canonical) | `booking_status` enum values | ✅ (enum exists) | ✅ (but values differ) | ✅ | Map UI to canonical values | Migrate enum to match DOC-02 |``  
``| Booking fee breakdown | `bookings.traveler_fee`, `platform_commission`, `net_to_guide` | ❌ | ❓ | ❌ (nice) | Compute on the fly from totals + % | Add fields when you need accounting/audit |``  
``| Messaging | `messages(booking_id,sender_id,body)` | ✅ | ✅ | ✅ | — | Add “read receipts/attachments” later |``  
``| Reviews | `reviews`, `review_replies` | ✅ | ✅ | ✅ | — | Add moderation fields later |``  
``| Duplicate review tables | `guide_reviews`, `traveler_reviews` | ✅ (exists) | ❓ | ❌ | Ignore them | Mark deprecated; remove later |``  
``| Concierge leads | `concierge_requests` | ❌ | ❓ | ❌ (but useful) | Store in email/spreadsheet temporarily | Create table + admin list view |``  
``| Disputes/refunds log | `disputes` table | ❌ | ❓ | ❌ (v2 can be manual) | Handle via Stripe dashboard + admin notes | Add disputes table + audit later |``  
``| Safety reports | `reports` table | ❌ | ❓ | ❌ (v2 can be manual) | Manual inbox + admin notes | Add reports + moderation pipeline |``  
``| Admin audit log | `audit_logs` | ❌ (DB doc says missing) | ✅ (code overview mentions admin_events) | ❌ (but very helpful) | Log in server logs for now | Create `audit_logs` and write on admin actions |``  
``| Traveler profile privacy model | `profiles_public_view` | ❌ | ❓ | ✅ (privacy) | Hide sensitive fields in UI only (not enough) | Create view + restrict base table |``  
``| Travelers table | `travelers` | ❌ (DB reality) | ✅ (code overview mentions) | ❌ | Use `profiles` only | Either add table or remove from code references |``  
``| Experiences table | `experiences` | ❌ (DB reality) | ✅ (code overview mentions) | ❌ | Use “guide profile narrative” only | Add later if you productize experiences |``  
``| Availability slots table | `availability_slots` | ❌ (DB reality) | ✅ (code overview mentions) | ❌ | Use `availability_pattern` + blackout | Add slots later if needed |``  
``| Stripe Connect account link | `guides.stripe_account_id` | ❌ | ❓ | ✅ (for verification) | Keep in env/session (fragile) | **Add this column** (required) |``  
``| Stripe verification status | `guides.verification_status` | ✅ | ✅ | ✅ | Derive from Stripe on read | Keep stored + updated by webhook |``  
``| ID document storage | `guides.id_document_url` | ✅ | ❓ | ❌ | Do not use | Deprecate; leave null |``  
``| Blog CMS | `posts` table | ❌ | ❓ | ❌ | Mock content | Add CMS later |``

`---`

`## 3) High-impact conflicts to resolve (now)`

`### 3.1 Verification conflict`  
`Some docs mention “ID upload.” v2 is **Stripe-first**.`    
`Action: update any doc that says ID upload to “Stripe Connect identity verification.”`

`### 3.2 Schema drift: code overview vs DB reality`  
``The code overview references tables (`travelers`, `experiences`, `availability_slots`, `admin_events`) that are not present in the current public schema doc.``    
`Action: pick one strategy:`  
`- **Option A (Recommended):** Align code to current DB reality (lean v2)`    
`- **Option B:** Add migrations to create the missing tables (heavier)`

`---`

`## 4) Minimum migrations recommended for v2 correctness`

``1) Add `guides.stripe_account_id` (text, nullable initially)``    
``2) Update `verification_status` enum values to match DOC-02 (or implement mapping layer)``    
``3) Lock down `profiles` public read (privacy fix) via view/RLS``    
``4) Add `cities` display fields only if your UI needs them (optional)``

`---`

`## 5) Acceptance checks (“Done means”)`  
`- Agents can tell exactly what exists vs what must be built.`  
`- Stripe verification does not require storing ID documents in Supabase.`  
`- Booking status names are consistent across UI, DB, and API.`

