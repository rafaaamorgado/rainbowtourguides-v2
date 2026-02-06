\# Rainbow Tour Guides v2 — User Journey Narrative (All Personas)

\*\*Doc ID:\*\* DOC-JOURNEYS-ALL v0.2    
\*\*Last updated:\*\* 2026-01-15    
\*\*Purpose:\*\* A product \+ UX narrative of what each persona \*feels, does, and achieves\* across RTG v2 — aligned to the PRD, user stories, and current Supabase schema direction.    
\*\*Scope:\*\* Visitor, Traveler, Guide, Admin/Ops, System (foundation), Marketing/Content (future-facing but planned).

\---

\#\# 0\) The RTG promise (north star)

Rainbow Tour Guides helps LGBTQ+ travelers and allies \*\*book private tours with verified LGBTQ+ and LGBTQ+-friendly local guides\*\*—with safety-first design, transparent pricing, and a calm, premium experience.

\*\*Core wedge (SEO \+ product):\*\* “LGBTQ+ private guide in \[City\]”.

\*\*v2 launch stance:\*\*  
\- v2 is \*\*bookable\*\*, not a demo.  
\- We focus on \*\*curated supply\*\* (few cities, high-quality guides).  
\- We build trust through:  
  \- verification \+ approval  
  \- safety norms \+ clear boundaries  
  \- reviews  
  \- pricing transparency (including “typical ranges” per city)

\---

\#\# 1\) Visitor / Guest (Not Logged-In)

\#\#\# User description  
Visitors are curious first-timers arriving from SEO, social, or referrals. They want quick answers:  
\- “Is this legit?”  
\- “Is it safe?”  
\- “Do you have my city?”  
\- “What does it cost—roughly?”  
Their job is to \*\*understand\*\*, \*\*trust\*\*, and either \*\*start browsing\*\* or \*\*convert\*\* to Traveler / Guide.

\#\#\# Journey narrative (what they feel → do → achieve)

\#\#\#\# A) Awareness & trust-first landing  
\*\*They feel:\*\* cautious optimism, scanning for legitimacy and safety.    
\*\*They do:\*\*  
\- land on \`/\` or \`/cities/\[slug\]\` from SEO  
\- read mission \+ inclusivity statement \+ “How it works”  
\- see trust badges (verification, secure payments, community guidelines)  
\- browse featured cities \+ sample guides (teasers)  
\*\*They achieve:\*\* “This is for people like me. This feels safe and premium.”

\#\#\#\# B) Exploration without commitment (soft walls)  
\*\*They feel:\*\* interested, but price-curious.    
\*\*They do:\*\*  
\- use global search to type a city  
\- open \`/cities/\[slug\]\`  
\- browse 3–5 guide cards (teaser mode)  
\- open \`/guides/\[slug\]\` in read-only mode:  
  \- photo, name, languages, headline, general bio snippet  
  \- “Verified” badge is visible, but detailed safety/availability/pricing/reviews are gated  
\*\*Soft-wall rules (v2 default):\*\*  
\- Visitors \*\*can\*\* browse cities, guides, and blog content freely.  
\- Visitors \*\*cannot\*\* access:  
  \- messaging  
  \- booking forms submission  
  \- full pricing \+ fee breakdown  
  \- full reviews list (show a small “preview” only)  
  \- contact details / personal info beyond what’s needed for a public marketplace profile

\*\*They achieve:\*\* “I can see enough to decide if I want to join.”

\#\#\#\# C) Conversion triggers (where sign-up happens)  
\*\*They feel:\*\* ready to act, don’t want friction.    
\*\*They do:\*\*  
\- click CTA: “Request booking”, “Message guide”, “Save guide”  
\- get sign-up modal (email \+ Google/Apple)  
\- after sign-up, return to the exact same page \+ restore any in-progress booking inputs  
\*\*They achieve:\*\* “I didn’t lose my place. I can continue.”

\#\#\#\# D) SEO \+ content loop  
\*\*They do:\*\*  
\- read blog posts, safety tips, city guides  
\- share city/guide pages via social buttons  
\*\*They achieve:\*\* RTG becomes a bookmarkable resource (even before sign-up).

\*\*Key visitor themes\*\*  
\- SEO-driven acquisition \+ “trust at first scroll”  
\- soft walls that motivate sign-up without feeling coercive  
\- conversion flows that preserve context and reduce drop-off

\---

\#\# 2\) Traveler (Logged-in Customer)

\#\#\# User description  
The Traveler is an LGBTQ+ traveler or ally seeking \*\*private, authentic experiences\*\* with \*\*verified guides\*\*. Their emotional priorities:  
\- safety and ease  
\- feeling welcomed (not tolerated)  
\- real local connection, not “tourist conveyor belt”

\#\#\# Journey narrative

\#\#\#\# A) Account creation & safety gates  
\*\*They feel:\*\* hopeful; want fast onboarding.    
\*\*They do:\*\*  
\- sign up via email/password or Google/Apple  
\- verify email (required before requesting bookings)  
\- accept ToS / Privacy / Refund / Community Guidelines  
\- set preferences (language, currency, home country)  
\*\*They achieve:\*\* access to full marketplace features.

\> Profile visibility stance: Travelers have a \*\*private dashboard\*\*. Any “public profile” is optional and should default to \*\*private\*\* (privacy-first).

\#\#\#\# B) Discovery with intent  
\*\*They feel:\*\* focused and planning-oriented.    
\*\*They do:\*\*  
\- search city \+ select target date/time  
\- filter by:  
  \- duration (4/6/8 hours)  
  \- languages  
  \- themes/interests  
  \- minimum rating  
  \- “available on my chosen date”  
\- open guide profiles:  
  \- full bio \+ photo gallery  
  \- pricing tiers \+ “typical range” context  
  \- availability snapshot  
  \- verified status \+ safety statement  
  \- reviews \+ guide replies  
\*\*They achieve:\*\* choose a guide confidently.

\#\#\#\# C) Booking request → acceptance → payment  
\*\*They feel:\*\* ready; don’t want surprises.    
\*\*They do:\*\*  
\- request booking:  
  \- date, start time (≥24h lead)  
  \- duration 4/6/8h  
  \- party size  
  \- itinerary note (≤500 chars)  
  \- optional multi-day bundle (PRD target; may be phased if not yet built in schema)  
\- booking becomes \`pending\`  
\- guide accepts → traveler pays (Stripe Checkout)  
\- booking becomes \`confirmed\`  
\- chat thread opens automatically  
\*\*They achieve:\*\* the tour is secured and coordinated.

\#\#\#\# D) Messaging \+ tour day  
\*\*They feel:\*\* prepared and reassured.    
\*\*They do:\*\*  
\- use in-app chat to confirm meeting point, itinerary, boundaries  
\- receive 24h reminder email  
\- open booking details for timeline \+ status  
\*\*They achieve:\*\* no awkward uncertainty.

\#\#\#\# E) Post-tour trust loop  
\*\*They feel:\*\* satisfied (or want recourse).    
\*\*They do:\*\*  
\- mark completed (or system completes after date, depending ops policy)  
\- leave a review \+ rating  
\- rebook a guide from history  
\- optionally report issues / safety incident  
\*\*They achieve:\*\* closure \+ safer future bookings.

\*\*Key traveler themes\*\*  
\- transparent pricing and fee clarity  
\- safety cues everywhere, not buried  
\- calm flow: discover → request → confirm → message → review

\---

\#\# 3\) Guide (Verified Local Host)

\#\#\# User description  
Guides are \*\*LGBTQ+ or LGBTQ+-friendly\*\* locals offering private tours. They want:  
\- respectful travelers  
\- reliable payouts  
\- control over availability and boundaries  
\- a brand that feels premium, not exploitative

\#\#\# Journey narrative

\#\#\#\# A) Apply → verify → approved listing  
\*\*They feel:\*\* excited, but protective of their privacy.    
\*\*They do:\*\*  
\- register as Guide (role set at sign-up)  
\- complete onboarding wizard:  
  \- bio, headline, languages, specialties/tags  
  \- city \+ local expertise  
  \- photo upload (up to 4; ordered gallery with main thumbnail)  
  \- pricing tiers (4/6/8h)  
  \- max group size  
  \- availability pattern \+ blackout dates  
  \- verification: government ID upload (and selfie if required by provider)  
  \- accept Guide Code of Conduct \+ boundaries  
\- verification via Stripe Identity (or staged approach: upload now → Stripe later)  
\- admin reviews profile \+ verification docs  
\- status \`pending\` until approved  
\*\*They achieve:\*\* approval unlocks public listing.

\#\#\#\# B) Booking lifecycle (request-based first)  
\*\*They feel:\*\* in control, evaluating fit.    
\*\*They do:\*\*  
\- receive booking request notification  
\- review traveler details \+ note \+ party size  
\- accept / decline (optional reason)  
\- (future) propose alternate time/duration  
\- on acceptance:  
  \- booking moves to \`accepted/awaiting\_payment\`  
  \- payment taken  
  \- booking \`confirmed\`  
  \- chat thread opens  
\*\*They achieve:\*\* no DM chaos; everything is tracked.

\#\#\#\# C) Tour execution \+ payout readiness  
\*\*They feel:\*\* professional.    
\*\*They do:\*\*  
\- receive 24h reminder  
\- mark tour \`completed\` (or confirm completion)  
\- payout is eligible after 48h delay, paid weekly (Stripe Connect)  
\*\*They achieve:\*\* predictable earnings.

\#\#\#\# D) Reviews (two-sided)  
\*\*They do:\*\*  
\- leave a review for the traveler after completion  
\- see traveler review \+ respond once publicly  
\- report abusive reviews  
\*\*Policy stance:\*\* you can support “double-blind” release (both visible only when both submitted) later; v2 can start with simple publishing rules if needed.

\*\*Key guide themes\*\*  
\- verification without humiliation  
\- schedule control  
\- transparent commissions and payouts  
\- reputation-building without harassment risk

\---

\#\# 4\) Admin / Ops (Safety \+ Growth Control)

\#\#\# User description  
Admins (you \+ Alan initially) manage trust and operations:  
\- approve guides  
\- handle disputes and refunds  
\- enforce safety policy  
\- manage content and rollout

\#\#\# Journey narrative

\#\#\#\# A) Oversight dashboard  
\*\*They do:\*\*  
\- login to \`/admin\` (role-gated)  
\- monitor KPIs:  
  \- new sign-ups  
  \- pending verifications  
  \- booking pipeline  
  \- revenue/GMV (v2+)  
\*\*They achieve:\*\* “Is the marketplace healthy today?”

\#\#\#\# B) Guide verification workflow  
\*\*They do:\*\*  
\- open pending guide applications  
\- review profile \+ ID docs  
\- approve/reject with internal notes  
\- guide is listed only if \`approved=true\`  
\*\*They achieve:\*\* quality control without scaling chaos.

\#\#\#\# C) Booking disputes \+ safety incidents  
\*\*They do:\*\*  
\- review bookings and message history (for disputes)  
\- intervene: freeze booking, disable chat, suspend user, trigger refunds  
\- log actions in audit trail (needs DB support)  
\*\*They achieve:\*\* fast response when something goes wrong.

\#\#\#\# D) Content \+ rollout control  
\*\*They do:\*\*  
\- manage cities/countries, featured visibility, promos  
\- keep blog and SEO pages fresh  
\- tag cities as Active/Upcoming/Hidden  
\*\*They achieve:\*\* controlled growth, not “spray and pray.”

\*\*Key admin themes\*\*  
\- safety-first governance  
\- traceable actions (audit logs)  
\- configuration control (fees, policies, feature flags)

\---

\#\# 5\) System / Technical (Foundation)

\#\#\# What the system must guarantee in v2  
\- \*\*Auth \+ roles\*\*: Supabase Auth; role stored in \`profiles.role\`  
\- \*\*Data security\*\*: RLS ensures participants-only access for bookings/messages  
\- \*\*Payments\*\*: Stripe Checkout \+ (later) Stripe Connect payouts  
\- \*\*Core data model\*\* (current): profiles, guides, bookings, messages, reviews, cities/countries  
\- \*\*Notifications\*\* (v2): transactional emails (verification, booking status changes, reminders)

\#\#\# Known schema alignment notes (current reality)  
\- Bookings are currently \*\*single-session\*\* (\`bookings\` table).    
  Multi-day “reservation” grouping is a \*\*planned upgrade\*\* (add \`reservations\` or \`reservation\_id\`).  
\- Reviews are enforced by trigger (\`completed\` booking required).  
\- \*\*Privacy must be tightened\*\*: public read of \`profiles\` should be removed; expose guide public info via safe views instead.

\---

\#\# 6\) Marketing / Content Manager (Operational role, phased)

This role may be a dedicated team later. In v2, Admin can handle it.

\#\#\# Responsibilities  
\- edit homepage blocks, city SEO copy, blog posts  
\- run promos and partnerships  
\- monitor SEO and content performance (GA4/Search Console)

\#\#\# Why it matters  
Blog \+ city pages are a primary acquisition engine for:  
\- “LGBTQ+ private guide in \[City\]”  
\- safety content  
\- destination discovery

\---

\#\# 7\) Unified journey map (high-level)

| Stage | Visitor | Traveler | Guide | Admin/Ops | System |  
|------|---------|----------|------|----------|--------|  
| Awareness | lands via SEO/blog | returns via email/bookmark | sees “Become a guide” | watches sign-ups | serves SSR pages \+ sitemap |  
| Onboarding | soft-wall prompts | signs up \+ verifies email | completes onboarding \+ ID | approves/rejects | creates profile rows, enforces RLS |  
| Engagement | browses cities/guides | filters \+ saves \+ requests | manages availability | monitors funnel | logs bookings/messages |  
| Transaction | hits paywall at booking | pays after acceptance | sees confirmed tour | handles refunds | Stripe checkout \+ IDs |  
| Post-experience | reads reviews previews | leaves review | responds/reviews traveler | moderates reviews | stores immutable history |  
| Growth loop | subscribes newsletter | rebooks \+ referrals | improves rating | expands cities | analytics \+ performance |

\---

\#\# 8\) Intelligence to capture (Alan’s note)

We should capture demand signals \*even from visitors\*:  
\- City search terms (typeahead selections)  
\- City page views \+ scroll depth  
\- “No guides available” events \+ “notify me” intent  
\- Guide profile views per city  
\- CTA clicks (Request booking, Sign up, Become guide)

This informs:  
\- which destinations to recruit guides for next  
\- which city pages to prioritize for SEO  
\- which promos to run

\---

\#\# 9\) Copy direction (short, premium, safety-first)

\*\*Primary theme (connection):\*\*  
\- “Find your local connection.”  
\- “Trusted locals. Genuine connections.”  
\- “Your trip deserves a local touch.”

\*\*Proof line (verification \+ LGBTQ+):\*\*  
\- “Verified LGBTQ+ and LGBTQ+-friendly locals ready to show you their city.”  
\- “Book private tours with verified queer-friendly guides worldwide.”

\*\*SEO-friendly promise (for city pages):\*\*  
\- “LGBTQ+ private guide in \[City\]. Safe, personal, and curated.”

\---

\#\# 10\) Next docs that should reference this narrative  
\- Visitor Product Spec (detailed)  
\- Traveler Product Spec (detailed)  
\- Guide Onboarding Spec (verification workflow)  
\- Safety & Eligibility Policy (public \+ ops annex)  
\- Pricing & Fees Spec (city ranges \+ checkout presentation)  
\- Admin Ops Runbook \+ escalation playbooks

