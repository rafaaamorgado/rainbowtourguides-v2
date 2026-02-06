\# Rainbow Tour Guides v2 — Product Specs (Global Overview)

\*\*Doc ID:\*\* DOC-PRODUCT-SPECS    
\*\*Audience:\*\* Product / Design / Engineering / Ops    
\*\*Last updated:\*\* 2026-01-15    
\*\*Purpose:\*\* A global “WHAT” overview of features, scope, and acceptance checks. Detailed persona specs come next.

\---

\#\# 0\) Product definition

Rainbow Tour Guides is a premium LGBTQ+ travel marketplace where travelers discover vetted local guides, request or book private tours, pay safely, coordinate in-app, and leave mutual reviews — with an admin layer ensuring trust, safety, and operational control.

\---

\#\# 1\) Scope: v2 vs v2.1

\#\#\# v2 (Launch scope)  
\*\*Core marketplace loop\*\*  
\- Discover (cities → guides)  
\- Trust signals (verification, reviews, safety positioning)  
\- Request booking (4/6/8h) with ≥24h lead time  
\- Guide accepts/declines  
\- Traveler pays via Stripe Checkout  
\- Messaging thread per booking  
\- Completion \+ mutual reviews (double-blind reveal)  
\- Admin: guide approvals, disputes/refunds tooling, moderation

\#\#\# v2.1 (Defined now; can ship later)  
\- \*\*Multi-day bundle\*\* (“Reservation” containing multiple sessions)  
\- Stored payment method / auto-capture on acceptance (pre-auth)  
\- Attachments in chat  
\- Realtime messaging  
\- Advanced availability/calendar UX

\> Decision note: We define the data model now so v2.1 is additive, not a rewrite.

\---

\#\# 2\) Users & roles

\- \*\*Visitor / Guest\*\*: SEO-driven discovery, trust-building, conversion via soft walls  
\- \*\*Traveler\*\*: profile \+ booking lifecycle \+ messaging \+ reviews \+ retention loops  
\- \*\*Guide\*\*: onboarding \+ verification \+ availability \+ accept/decline \+ payouts \+ reputation  
\- \*\*Admin / Moderator\*\*: verification, safety enforcement, disputes, refunds, content moderation, reporting

\---

\#\# 3\) Platform primitives (core objects)

\> Naming is intentional: “reservation” vs “booking session” supports multi-day later.

\#\#\# 3.1 Entities  
\- \*\*City / Country\*\*: SEO entry points and discovery context  
\- \*\*Traveler Profile\*\*: private settings \+ limited public profile (guide-facing)  
\- \*\*Guide Profile\*\*: public listing profile \+ private dashboard settings  
\- \*\*Availability\*\*: weekly pattern \+ blackout dates in guide’s timezone  
\- \*\*Reservation\*\* (v2.1-ready): a group container  
\- \*\*Booking Session\*\* (“booking”): a single dated tour instance  
\- \*\*Conversation\*\*: 1 thread per reservation (or per booking session in v2; see 6.5)  
\- \*\*Review\*\*: traveler↔guide mutual reviews with reveal rules  
\- \*\*Report\*\*: review and message reports for moderation  
\- \*\*Admin Audit Log\*\*: immutable record of admin actions

\#\#\# 3.2 Statuses (booking session)  
\- \`draft\` (optional internal)  
\- \`pending\` (requested; awaiting guide decision)  
\- \`accepted\` (awaiting traveler payment — v2 default)  
\- \`confirmed\` (paid)  
\- \`declined\`  
\- \`cancelled\_by\_traveler\`  
\- \`cancelled\_by\_guide\`  
\- \`completed\`

\---

\#\# 4\) UX scope & IA

\#\#\# 4.1 Pages

\*\*Public\*\*  
\- Landing  
\- Explore / Cities list \+ search  
\- City page \`/cities/{slug}\`  
\- Guide directory \`/guides\` (optional global search)  
\- Guide profile \`/guides/{handle}\`  
\- Blog list \+ article pages  
\- Help/FAQ  
\- Legal: ToS / Privacy / Refund / Community / Safety  
\- Auth pages (sign-in/up/callback)

\*\*Traveler app\*\*  
\- Dashboard (upcoming/past)  
\- Booking flow  
\- Messages  
\- Profile (public \+ private)  
\- Settings

\*\*Guide app\*\*  
\- Dashboard (requests / upcoming / past)  
\- Profile editor (public)  
\- Availability (weekly \+ blackout)  
\- Messages  
\- Payouts (Stripe Connect status)  
\- Settings (default meetup preferences, policy acknowledgements)

\*\*Admin\*\*  
\- Overview (KPIs)  
\- Users & Guides  
\- Guide verification queue  
\- Bookings  
\- Reviews & Reports  
\- Disputes / Refunds  
\- Content moderation (optional v2)  
\- Reports (GMV, take rate, active guides, top cities)

\#\#\# 4.2 Navigation

\- Topbar: Explore, Blog, Become a Guide, Sign in / Avatar (role-aware)  
\- Footer: City links, About, Help, Legal, Social

\#\#\# 4.3 Design system (non-negotiable)  
\- Tailwind \+ shadcn/ui  
\- WCAG AA focus states, semantic landmarks, aria labels  
\- Responsive layouts  
\- Calm, premium tone; never sexualized

\---

\#\# 5\) Feature set (What) \+ acceptance criteria (Done means)

\#\# 5.1 Discovery & browsing

\*\*User stories\*\*  
1\) Traveler selects a \*\*city\*\* and \*\*date/time\*\* and sees relevant guides.  
2\) Traveler filters by \*\*duration (4/6/8h)\*\*, \*\*languages\*\*, \*\*themes/interests\*\*, \*\*rating\*\*, \*\*availability on chosen date\*\*.  
3\) Traveler opens \*\*Guide Profile\*\* with bio, photos, languages, prices, reviews.

\*\*Functional requirements\*\*  
\- City selector with typeahead; \`/cities/{slug}\` is SEO-friendly and server-rendered.  
\- Guide cards show: photo, name, tags, rating, “from price”, availability badge for chosen date.  
\- Filters: duration, languages, themes, rating threshold, “available on date”.  
\- Sorting: default relevance, rating, most booked (or “recommended” until data exists).

\*\*Acceptance criteria\*\*  
\- Visiting \`/cities/{slug}\` renders correct meta tags and indexable content.  
\- Filters update results deterministically; empty state shows:  
  \- “No guides match your filters” \+ clear reset \+ suggestions (top-rated guides in city).  
\- If user chooses a date, availability badge correctly reflects guide availability rules (weekly \+ blackout).

\---

\#\# 5.2 Traveler profile (public \+ private)

\*\*User stories\*\*  
\- Traveler creates profile: display name, avatar, home country, preferred language/currency, interests.  
\- Traveler has a \*\*public-facing profile\*\* visible to guides in booking context (Airbnb-style).

\*\*Functional requirements\*\*  
\- Onboarding wizard captures: preferred language \+ currency (required) \+ profile basics.  
\- Public traveler profile shows only limited fields (privacy-safe).

\*\*Acceptance criteria\*\*  
\- Traveler can edit profile and see updates reflected in booking context.  
\- Sensitive info (email, payment, address) is never exposed in public profile views.

\---

\#\# 5.3 Guide profile creation

\*\*User stories\*\*  
\- Guide creates profile: city, bio, photos (up to 4, 1 main), languages, prices (4/6/8h), max group size, interests, safety statement, social links.

\*\*Functional requirements\*\*  
\- Guide profile editor supports:  
  \- up to 4 photos (1 required main thumbnail)  
  \- pricing table (4/6/8h)  
  \- tags and themes  
  \- safety statement  
  \- max group size  
  \- optional social links

\*\*Acceptance criteria\*\*  
\- Public guide page renders gallery, pricing, availability snapshot, reviews, and booking CTA.  
\- Profile cannot be listed unless approved \+ verified (see 5.4).

\---

\#\# 5.4 Guide onboarding & verification

\*\*User stories\*\*  
\- Guide registers, completes onboarding, and is verified before listing.  
\- Verification uses \*\*Stripe identity (Connect)\*\* as primary mechanism.  
\- Admin approves/rejects guides for authenticity and safety.

\*\*Functional requirements\*\*  
\- Stripe Connect Express onboarding integrated.  
\- Guide can finish profile while Connect is in progress.  
\- Admin verification queue shows: completeness, tone flags, Connect status, reason codes.

\*\*Acceptance criteria\*\*  
\- A guide cannot appear in listings unless:  
  \- profile is complete AND  
  \- admin-approved AND  
  \- verification is sufficient (Connect complete or explicitly allowed by ops policy)  
\- Admin actions are logged in \`auditLogs\`.

\---

\#\# 5.5 Availability (weekly \+ blackout) in local timezone

\*\*User stories\*\*  
\- Guide sets weekly availability \+ blackout dates in local timezone.

\*\*Functional requirements\*\*  
\- Weekly pattern (days \+ time windows)  
\- Blackout dates (calendar list)  
\- Availability evaluation used by booking request validation

\*\*Acceptance criteria\*\*  
\- Traveler cannot request a slot outside availability or overlapping blackout rules.  
\- Availability snapshot on guide profile accurately reflects guide’s local timezone.

\---

\#\# 5.6 Booking request (v2 default) \+ multi-day (v2.1)

\*\*User stories\*\*  
\- Traveler requests booking (4/6/8h) with date \+ start time (≥24h lead) \+ itinerary note.  
\- Guide accepts/declines.  
\- After acceptance, traveler pays; confirmation \+ message thread opens.  
\- (v2.1) Traveler bundles multiple days into one reservation with multiple sessions.

\*\*Functional requirements (v2)\*\*  
\- Booking request inputs:  
  \- duration 4/6/8h  
  \- date  
  \- start time (enforce ≥24h lead)  
  \- itinerary note (≤500 chars)  
  \- meeting preference (guide default vs traveler suggestion)  
\- Prevent overlapping/outside availability  
\- Create booking session in \`pending\`  
\- On guide accept:  
  \- booking → \`accepted\`  
  \- traveler receives notification with “Pay to confirm”  
\- On Stripe success:  
  \- booking → \`confirmed\`  
  \- receipts \+ confirmation emails queued

\*\*Multi-day design (v2.1-ready)\*\*  
\- \`reservation\` groups multiple \`booking\_sessions\`  
\- Pricing summary shows per-session totals \+ overall total

\*\*Acceptance criteria\*\*  
\- Request creates booking session(s) with correct status and ownership rules.  
\- Only the intended guide can accept/decline.  
\- Payment completion is the only path to \`confirmed\`.  
\- All notifications are triggered (email can be stubbed in MVP but events must exist).

\---

\#\# 5.7 Messaging (post-booking)

\*\*User stories\*\*  
\- Traveler and guide message each other to finalize details.  
\- Admin can read for disputes.  
\- 24h reminders email both parties.

\*\*Functional requirements\*\*  
\- One conversation thread per \*\*reservation\*\* (preferred), or per booking session (v2 acceptable).  
\- Participants-only access; admin override read access.  
\- Report button available in thread.  
\- Reminder emails 24h before start time:  
  \- time, meeting point, link to messages

\*\*Acceptance criteria\*\*  
\- Non-participants cannot access thread (RLS enforced).  
\- Admin can access threads for dispute resolution.  
\- Reminder emails are queued reliably.

\---

\#\# 5.8 Reviews (mutual, double-blind)

\*\*User stories\*\*  
\- After completion, both traveler and guide can rate (1–5) and review each other.  
\- Reviews reveal only after both submit (or timeout).  
\- Users can report a review; admin can hide/remove or allow a response.

\*\*Functional requirements\*\*  
\- Review eligibility only for completed bookings.  
\- Double-blind rule:  
  \- hidden until both submit OR timeout (recommended: 14 days)  
\- Report queue for moderation; admin can hide/remove; optionally request edits.

\*\*Acceptance criteria\*\*  
\- Only booking participants can review.  
\- Reported reviews appear in admin queue with clear actions \+ audit logs.  
\- Public profiles display only revealed reviews.

\---

\#\# 5.9 Admin console (ops surface)

\*\*User stories\*\*  
\- Admin searches users/guides/bookings; verifies/bans guides; resets passwords via email link.  
\- Admin manages refunds (full/partial), disputes, and sees payout/fees summaries (stubbed in MVP).  
\- Admin moderates reviews and reports; views KPIs.

\*\*Functional requirements\*\*  
\- Role-protected \`/admin\`  
\- Tables: Users/Guides, Bookings, Reviews/Reports, Disputes/Refunds  
\- Actions:  
  \- approve/reject guides \+ reason codes  
  \- suspend/reinstate users  
  \- update booking statuses (limited, logged)  
  \- initiate refunds via Stripe (v2) or stub actions (MVP) with log  
\- KPIs:  
  \- GMV, take rate, active guides, top cities

\*\*Acceptance criteria\*\*  
\- All admin actions produce \`auditLogs\`.  
\- Admin routes are inaccessible without admin role.  
\- Refund/dispute actions have reason codes and visible history.

\---

\#\# 5.10 GDPR self-service

\*\*User stories\*\*  
\- Users can export their data and delete account.  
\- Platform retains minimal non-PII booking aggregates for legal/accounting.

\*\*Functional requirements\*\*  
\- Export: JSON of profile, bookings, messages, reviews  
\- Delete:  
  \- confirm via email link  
  \- wipe/obfuscate PII  
  \- retain non-PII aggregates

\*\*Acceptance criteria\*\*  
\- Deletion is irreversible and logged.  
\- Admin sees masked records post-deletion.

\---

\#\# 6\) Non-functional requirements (Aligned to RTG v2 stack)

\> Note: This section intentionally aligns to Next.js \+ Supabase \+ Stripe, not Firebase/Firestore.

\#\#\# Performance  
\- Core Web Vitals targets: LCP \< 2.5s, CLS \< 0.1, INP \< 200ms on 3G  
\- Next/Image optimization and sensible caching  
\- SSR for SEO routes (cities, guide profiles, blog)

\#\#\# Security  
\- Supabase Auth (email verification; OAuth optional)  
\- Supabase RLS enforcing role-based access (traveler/guide/admin)  
\- HTTPS only  
\- Secrets in env vars (Vercel)  
\- Admin audit logs for privileged actions

\#\#\# Accessibility  
\- WCAG AA: keyboard navigation, visible focus, semantic landmarks, aria labels

\#\#\# Reliability  
\- Health endpoint (\`/healthz\`)  
\- Scheduled DB backups (Supabase)  
\- Error monitoring (Sentry recommended)

\#\#\# Privacy  
\- Minimize PII  
\- Clear analytics consent banner if tracking (GA4/PostHog)  
\- Data retention policy documented; logs redacted

\---

\#\# 7\) Conflicts & decisions (tracked)

\#\#\# Conflict A — Stack  
Brain dump references Firebase/Firestore. RTG v2 uses Next.js \+ Supabase \+ Stripe.  
\*\*Decision:\*\* spec aligns to Supabase/RLS.

\#\#\# Conflict B — Multi-day bundling  
Earlier v2 scope excluded multi-day. Brain dump requires bundling days.  
\*\*Decision:\*\* define data model now; ship feature in v2.1 unless v2 timeline allows.

\#\#\# Conflict C — Auto-charge stored method  
Brain dump says “charge stored method on acceptance.” RTG default is “accept → pay.”  
\*\*Decision:\*\* v2 \= pay after accept; v2.1 adds stored method / pre-auth.

\---

\#\# 8\) Acceptance checks (“Done means”)

\- Visitors can discover via SEO (cities, blog) and convert smoothly without losing context.  
\- Travelers can request, pay, message, complete, and review end-to-end.  
\- Guides can onboard with photos, pricing, availability, Stripe verification, and admin approval.  
\- Admin can run safety/compliance operations with logs and reason codes.  
\- RLS prevents data leaks; public vs private profile boundaries are enforced.

