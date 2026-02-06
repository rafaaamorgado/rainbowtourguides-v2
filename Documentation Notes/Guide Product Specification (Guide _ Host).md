\# Guide Product Specification (Guide / Host)

\*\*Doc ID:\*\* DOC-SPEC-GUIDE    
\*\*Audience:\*\* Product / Design / Engineering / Ops    
\*\*Last updated:\*\* 2026-01-15    
\*\*Applies to:\*\* Guide onboarding, profile, availability, booking lifecycle, messaging, payouts, reviews, support, and safety ops

\---

\#\# 0\) Why this spec exists

Guides are the supply side. The guide product must:  
\- Enable fast onboarding without sacrificing \*\*trust \+ safety\*\*  
\- Produce high-quality public profiles that \*\*convert\*\*  
\- Make availability \+ scheduling \*\*simple and accurate\*\*  
\- Make request handling \*\*fast\*\* (accept/decline/propose changes)  
\- Protect guides with clear policies \+ incident reporting  
\- Make payouts \+ earnings \*\*transparent\*\*  
\- Build reputation loops via reviews

This document specifies the guide-facing experience: \*\*pages, flows, features, states, and acceptance checks\*\*.

\---

\#\# 1\) Guide persona & intent

\#\#\# Primary intents  
1\) “I want to join and get approved quickly.”  
2\) “I want control: schedule, pricing, boundaries.”  
3\) “I want reliable payments and professional customers.”

\#\#\# Emotional journey we design for  
Curiosity → confidence → verification → pride (profile live) → control (calendar) → momentum (requests) → trust (reviews) → income (payouts)

Drop-off risks:  
\- Verification feels intrusive or confusing  
\- Onboarding is too long without save/resume  
\- Availability handling is error-prone (timezones)  
\- Requests come in but are hard to manage quickly  
\- Earnings/payouts feel unclear

\---

\#\# 2\) Scope & versioning (don’t ship a monster)

Your story list spans “launch” and “future platform.” This spec separates:

\#\#\# v2 (launch core)  
\- Guide signup \+ role selection  
\- Multi-step onboarding with save/resume  
\- Public profile editor (bio/tagline/photos/languages/specialties/prices/meeting point/max group/timezone)  
\- Availability: weekly recurring \+ blackout ranges  
\- Verification: \*\*Stripe Connect identity\*\* (recommended primary) \+ optional doc upload for ops  
\- Verification states \+ admin approval  
\- Booking request management: accept/decline \+ reason; auto-decline after 24h  
\- Prevent overlapping bookings  
\- Messaging thread per booking (text)  
\- 24h reminders  
\- Mark tour as completed (and optionally “started”)  
\- Cancel booking with reason \+ policy impact display  
\- Earnings per booking \+ monthly summary (basic)  
\- Reviews: guide ↔ traveler mutual with double-blind reveal; guide reply \+ report  
\- Safety incident report \+ no-show reporting  
\- Support access \+ guide FAQs  
\- Notifications: email \+ in-app (settings)  
\- “Temporarily unavailable” toggle

\#\#\# v2.1+ (explicitly later)  
\- Real-time chat \+ attachments (images/PDFs)  
\- Advanced calendar (day/week/month) with drag-drop  
\- Propose new time/duration flow (counter-offer)  
\- Multiple payout methods (PayPal, MoMo/ZaloPay)  
\- CSV/PDF export for tax  
\- Profile analytics \+ conversion insights  
\- Affiliate program for guides  
\- Pricing optimization suggestions  
\- Same-day booking toggle / last-minute rules

\---

\#\# 3\) Pages & navigation (guide app)

\#\#\# 3.1 Core routes  
\*\*Public\*\*  
\- \`/guides/\[handle\]\` (public profile)

\*\*Guide app\*\*  
\- \`/guide/onboarding\` (wizard \+ resume)  
\- \`/guide/dashboard\` (overview: requests, upcoming, earnings snapshot)  
\- \`/guide/bookings\` (list \+ filters)  
\- \`/guide/bookings/\[id\]\` (booking detail \+ actions \+ thread link)  
\- \`/guide/calendar\` (availability \+ booked slots)  
\- \`/guide/messages\` (inbox)  
\- \`/guide/messages/\[threadId\]\` (thread)  
\- \`/guide/profile\` (public profile editor \+ preview)  
\- \`/guide/availability\` (weekly \+ blackout management; may be part of calendar)  
\- \`/guide/payouts\` (Stripe Connect status \+ payout history)  
\- \`/guide/settings\` (notifications, policies, privacy/data export/delete, account status)  
\- \`/guide/help\` (guide FAQs \+ policies \+ safety resources)

\*\*Admin\*\*  
\- \`/admin/guides\` (verification queue \+ approvals)

\#\#\# 3.2 Navigation model  
\- Topbar: Dashboard, Bookings, Calendar, Messages, Profile, Payouts, Help, Avatar menu (Settings, Sign out)  
\- Persistent “New request” indicator in nav  
\- Admin announcements banner area in dashboard (config-driven)

\---

\#\# 4\) Registration, role, and verification

\#\#\# 4.1 Registration \+ role selection  
\*\*User stories\*\*  
\- Register with personal details, city, languages, specialties, base rates  
\- Select “Guide” role during registration

\*\*Requirements\*\*  
\- Signup includes role selection:  
  \- Guide role activates guide dashboard routes \+ permissions  
\- Minimum viable signup fields:  
  \- email, password or OAuth (optional)  
  \- role \= guide  
  \- policy acceptance (ToS/Privacy/Refund/Community)  
\- Immediately route to onboarding wizard

\*\*Acceptance checks\*\*  
\- Role stored server-side and enforced for route access  
\- Guide cannot access traveler dashboard routes (and vice versa)

\---

\#\#\# 4.2 Identity verification (reconciled)  
Your story list requests “upload ID \+ selfie” and “supporting docs.”    
RTG v2 direction previously leaned on Stripe Connect for identity.

\*\*Recommended v2 decision (canonical)\*\*  
\- \*\*Stripe Connect Express\*\* is the primary identity verification (KYC)  
\- Allow \*\*supplemental doc uploads\*\* (ID, selfie, licenses) for ops confidence \*only if needed\*

\*\*Verification inputs\*\*  
\- Required:  
  \- Stripe Connect identity flow completion  
\- Optional (policy-driven by ops/city):  
  \- government ID upload  
  \- selfie upload  
  \- tour license/certificates upload

\*\*Verification states\*\*  
\- \`draft\` (onboarding incomplete)  
\- \`submitted\` (awaiting admin review)  
\- \`pending\_verification\` (Connect in progress / docs under review)  
\- \`changes\_requested\`  
\- \`approved\` (listed)  
\- \`rejected\`  
\- \`suspended\`

\*\*Acceptance checks\*\*  
\- Guide cannot be listed until \`approved\`  
\- Guide sees clear status and next steps on dashboard  
\- Document uploads are stored privately and admin-only, with audit logs

\---

\#\#\# 4.3 Save/resume onboarding  
\*\*User stories\*\*  
\- Save progress; finish later without losing data  
\- Edit and re-submit docs if rejected

\*\*Requirements\*\*  
\- Every onboarding step saves automatically (draft mode)  
\- “Resume onboarding” entry point always visible until approved  
\- If changes requested:  
  \- show reason codes \+ exact fields needing updates  
  \- guide can resubmit

\*\*Acceptance checks\*\*  
\- Refreshing the page does not lose progress  
\- Changes requested flow is explicit and actionable

\---

\#\# 5\) Public profile creation & editing

\#\#\# 5.1 Public profile model (guide-facing)  
\*\*User stories\*\*  
\- Create/edit public profile with photos, languages, specialties, years exp, prices  
\- Add/remove/reorder gallery photos  
\- Write bio \+ tagline  
\- List themes/interests  
\- Update languages and specialties anytime  
\- Preview how profile looks to travelers  
\- Share profile link externally

\*\*Profile sections\*\*  
\- Photos:  
  \- main thumbnail (required)  
  \- gallery (multiple; reorderable)  
\- Tagline (short, conversion-oriented)  
\- Biography (story \+ credibility; not overly long)  
\- Languages  
\- Specialties/themes (food, culture, nightlife, LGBTQ+ history)  
\- Years of experience (optional v2)  
\- Pricing tiers (4/6/8h)  
\- Max group size  
\- Safety statement  
\- Default meeting point \+ instructions  
\- Social links (optional)

\*\*Pricing rules\*\*  
\- Prices are stored as tiers (4/6/8h)  
\- Changes apply only to \*\*new\*\* bookings; existing bookings retain locked pricing snapshot

\*\*Acceptance checks\*\*  
\- Profile preview matches public rendering  
\- Reordering photos updates public profile gallery order  
\- Pricing edit does not retroactively alter existing confirmed bookings

\---

\#\# 6\) Availability & calendar (timezone-safe)

\#\#\# 6.1 Timezone  
\*\*User stories\*\*  
\- Set timezone so availability displays correctly

\*\*Requirements\*\*  
\- Guide selects timezone during onboarding (default from browser)  
\- All availability and bookings are stored in a canonical form and displayed in guide local time  
\- Traveler views show guide local time \+ traveler local time labels

\*\*Acceptance checks\*\*  
\- No DST ambiguity; times are labeled and consistent

\---

\#\#\# 6.2 Weekly availability \+ blackout ranges  
\*\*User stories\*\*  
\- Define weekly recurring availability  
\- Block specific dates/ranges  
\- Toggle last-minute bookings (later)

\*\*v2 Requirements\*\*  
\- Weekly pattern: day \+ time windows (e.g., Mon 9–17)  
\- Blackout: single dates and date ranges  
\- Availability snapshot visible to travelers

\*\*v2.1\*\*  
\- Same-day/last-minute booking toggle with rules (min lead time override)

\*\*Acceptance checks\*\*  
\- System prevents double-booking and requests outside availability  
\- Blackouts override weekly windows

\---

\#\#\# 6.3 Calendar views  
\*\*User stories\*\*  
\- View calendar showing available \+ booked slots  
\- Daily/weekly/monthly views (later)

\*\*v2\*\*  
\- Simple calendar view showing booked sessions \+ availability blocks

\*\*v2.1\*\*  
\- Day/week/month toggles \+ filters \+ drag-to-block

\*\*Acceptance checks\*\*  
\- Booked sessions appear correctly and cannot overlap

\---

\#\# 7\) Booking request lifecycle (guide side)

\#\#\# 7.1 Notifications & request inbox  
\*\*User stories\*\*  
\- Receive notifications for booking requests  
\- View traveler summary: name, country, interests, group size, date, note

\*\*Requirements\*\*  
\- Notification channels:  
  \- in-app (mandatory)  
  \- email (default on; configurable)  
  \- SMS/push (later)  
\- Request card shows:  
  \- traveler public profile snippet (privacy-safe)  
  \- requested date/time \+ duration \+ participants  
  \- traveler note  
  \- payout estimate (optional v2)

\*\*Acceptance checks\*\*  
\- Notification delivered within reasonable time  
\- Guide can open request detail reliably from notification link

\---

\#\#\# 7.2 Accept / decline / auto-decline  
\*\*User stories\*\*  
\- Accept updates traveler dashboard and triggers payment intent  
\- Decline with optional reason  
\- Auto-decline after 24h if no response  
\- Cannot accept overlapping bookings

\*\*v2 Requirements\*\*  
\- Accept:  
  \- booking becomes \`accepted\`  
  \- traveler prompted to pay to confirm  
  \- message thread opens  
\- Decline:  
  \- booking becomes \`declined\`  
  \- reason category optionally sent to traveler  
\- Auto-decline:  
  \- if no response within 24h (configurable), mark declined with system reason  
\- Overlap prevention:  
  \- accepting overlaps blocked at server level

\*\*Acceptance checks\*\*  
\- Only the target guide can accept/decline  
\- Auto-decline is reliable and visible in audit logs  
\- Overlapping acceptance is impossible even with concurrency

\---

\#\#\# 7.3 Counter-offer (propose new time/duration) — v2.1  
\*\*User story\*\*  
\- Propose new start time or duration if original doesn’t fit

\*\*v2.1 Requirements\*\*  
\- Guide can propose alternative(s)  
\- Traveler can accept one alternative  
\- Booking updates and re-triggers payment flow if needed

\---

\#\# 8\) Messaging (guide ↔ traveler)

\#\#\# 8.1 Thread rules  
\*\*User stories\*\*  
\- Chat opens automatically upon acceptance  
\- Real-time messaging \+ attachments (later)  
\- Email \+ in-app notification for new messages

\*\*v2 Requirements\*\*  
\- Thread opens at \`accepted\` (or \`confirmed\` if you prefer stricter gating)  
\- Text-only messaging with timestamps  
\- In-app unread indicators \+ email notifications

\*\*v2.1\*\*  
\- Realtime updates  
\- Attachments: images/PDFs

\*\*Acceptance checks\*\*  
\- Only participants \+ admin can access thread (RLS)  
\- New message notifications do not leak sensitive content

\---

\#\# 9\) Tour execution controls

\#\#\# 9.1 Start / complete status  
\*\*User stories\*\*  
\- Mark a tour as “Started” or “Completed”

\*\*v2 Requirements\*\*  
\- \`completed\` is required (starts payout clock)  
\- “Started” is optional but helpful for ops

\*\*Acceptance checks\*\*  
\- Only guide (and admin) can mark completed  
\- Completed triggers review eligibility and payout cooldown start

\---

\#\#\# 9.2 Cancellation by guide  
\*\*User stories\*\*  
\- Cancel booking with reason  
\- See penalty/refund impact before confirming

\*\*Requirements\*\*  
\- Show cancellation policy and consequences:  
  \- traveler refund rules  
  \- potential guide penalty flags (if implemented)  
\- Require reason category  
\- Notify traveler immediately

\*\*Acceptance checks\*\*  
\- Guide sees clear consequences before final cancel  
\- Refund workflow is initiated or queued properly

\---

\#\#\# 9.3 No-show and incident reporting  
\*\*User stories\*\*  
\- Mark traveler no-show  
\- Submit incident reports / safety concerns

\*\*v2 Requirements\*\*  
\- “Report no-show” from booking detail  
\- “Report safety incident” from booking/messages  
\- Reports create admin escalation ticket

\*\*Acceptance checks\*\*  
\- Reports are visible in admin queue with audit trail  
\- Traveler cannot be silently punished without review (ops policy)

\---

\#\# 10\) Earnings & payouts (guide)

\#\#\# 10.1 Earnings visibility  
\*\*User stories\*\*  
\- See earnings per booking (after platform commission)  
\- See monthly earnings and cumulative payouts

\*\*v2 Requirements\*\*  
\- Booking detail shows:  
  \- gross price  
  \- platform commission  
  \- net earnings estimate  
\- Monthly summary (basic totals)

\*\*v2.1\*\*  
\- CSV/PDF export for tax  
\- Insights on performance

\*\*Acceptance checks\*\*  
\- Earnings numbers match pricing snapshot and fee rules  
\- Historical bookings keep historical pricing snapshot

\---

\#\#\# 10.2 Payout account connection  
\*\*User stories\*\*  
\- Connect payout account (Stripe, PayPal, MoMo/ZaloPay)  
\- View scheduled payout dates/amounts  
\- Update payout info  
\- Notifications on payout initiated/delayed

\*\*v2 Decision (recommended)\*\*  
\- Stripe Connect only for v2

\*\*v2 Requirements\*\*  
\- \`/guide/payouts\` shows:  
  \- Connect status  
  \- missing requirements  
  \- payout schedule policy (weekly, 48h post-completion delay)  
  \- payout history (if available)

\*\*v2.1\*\*  
\- Additional payout methods if desired (but adds complexity)

\*\*Acceptance checks\*\*  
\- Guide cannot receive payouts unless Connect complete  
\- Payout status changes trigger notifications

\---

\#\# 11\) Reviews & reputation (guide)

\#\#\# 11.1 Mutual reviews (double-blind)  
\*\*User stories\*\*  
\- Rate traveler after completion  
\- Read traveler reviews  
\- Respond publicly once  
\- Report offensive/false review  
\- View overall rating average and count

\*\*Requirements\*\*  
\- Double-blind reveal:  
  \- visible when both submit or after timeout  
\- One response per review (public)  
\- Report review to admin moderation queue

\*\*Acceptance checks\*\*  
\- Only participants can review each other  
\- Response and report actions are audited  
\- Rating aggregates update correctly

\---

\#\# 12\) Support, policies, safety resources

\*\*User stories\*\*  
\- Contact support for bookings/payouts  
\- View guide-targeted help/FAQs  
\- View policies and community guidelines in dashboard  
\- Access safety guidelines \+ LGBTQ+ inclusivity resources  
\- View admin announcements

\*\*v2 Requirements\*\*  
\- \`/guide/help\` hub with:  
  \- FAQs  
  \- policies  
  \- safety resources  
  \- contact support CTA  
\- Admin announcements module in dashboard

\*\*Acceptance checks\*\*  
\- Guides can reach support from booking detail and payouts  
\- Policy pages are accessible without leaving the dashboard

\---

\#\# 13\) Notifications & preferences (guide)

\*\*User stories\*\*  
\- Enable notifications for requests/messages/payouts  
\- Choose methods (email/in-app/SMS/push)

\*\*v2 Requirements\*\*  
\- Settings toggles:  
  \- booking requests (email \+ in-app)  
  \- messages (email \+ in-app)  
  \- payouts (email \+ in-app)  
\- SMS/push later

\*\*Acceptance checks\*\*  
\- Transactional notifications cannot be entirely disabled (safety/ops)  
\- Preferences persist and are respected

\---

\#\# 14\) Account controls (guide)

\*\*User stories\*\*  
\- Download personal data  
\- Request deletion (GDPR)  
\- Temporarily unavailable status without deleting

\*\*Requirements\*\*  
\- Data export (JSON)  
\- Deletion with email confirmation and PII removal/anonymization  
\- “Temporarily unavailable” toggle:  
  \- hides guide from search/listings  
  \- prevents new booking requests  
  \- preserves account/history

\*\*Acceptance checks\*\*  
\- Unavailable guides do not appear in search or accept new requests  
\- Deletion is auditable and irreversible

\---

\#\# 15\) Analytics, affiliate, optimization (v2.1+)

\*\*User stories\*\*  
\- Profile view analytics \+ conversion rate  
\- Affiliate program for referrals  
\- Insights for pricing optimization  
\- Last-minute toggles

\*\*Status\*\*  
\- Not v2-critical. Define instrumentation events now; build later.

\---

\#\# 16\) Page-to-page flow map (what leads to what)

\#\#\# Guide onboarding path  
\- Public “Become a Guide” → \`/become-a-guide\` (or \`/how-it-works\#guides\`)    
→ sign-up (role=Guide) → \`/guide/onboarding\`    
→ complete profile \+ availability \+ verification    
→ \`submitted/pending\_verification\` state shown on \`/guide/dashboard\`    
→ admin approves → profile becomes public on \`/guides/\[handle\]\`

\#\#\# Request handling path  
\- Notification → \`/guide/bookings/\[id\]\`    
→ accept/decline    
→ accept opens chat \`/guide/messages/\[threadId\]\`    
→ after tour mark completed → review flow → payouts

\---

\#\# 17\) Data & permission boundaries (guide)

Guides can access:  
\- their own profile \+ availability  
\- their own bookings \+ messages \+ earnings/payouts  
\- traveler public profile snippet (booking context only)

Guides cannot access:  
\- other guides’ private data  
\- admin tools  
\- other travelers’ PII  
\- payout rules beyond their own data

\*\*Acceptance checks\*\*  
\- RLS enforces ownership and role boundaries server-side

\---

\#\# 18\) “Done means” checklist (v2 launch)

Guide product is v2-ready when:  
\- Guide can sign up with role=Guide and reach onboarding wizard  
\- Onboarding supports save/resume and document resubmission  
\- Verification states are clear and admin-approvable  
\- Public profile editor supports photos reorder, bio, languages, specialties, pricing tiers, meeting point, max group, safety statement  
\- Availability supports weekly pattern \+ blackout ranges with timezone correctness  
\- Requests can be accepted/declined; auto-decline works; overlaps prevented  
\- Messaging thread opens and works with notifications (text-only ok)  
\- 24h reminders work  
\- Guide can mark completed; reviews flow works double-blind; guide can respond/report reviews  
\- Payouts page shows Stripe Connect status and earnings are transparent  
\- Support, policies, and safety resources are accessible in-dashboard  
\- “Temporarily unavailable” hides guide from discovery without deleting account

\---

\#\# 19\) Open questions to lock (so engineering doesn’t guess)

1\) \*\*Verification method\*\*  
   \- A) Stripe Connect only (recommended for v2)  
   \- B) Stripe \+ mandatory ID/selfie uploads  
   \- C) ID/selfie uploads only

2\) \*\*Messaging threshold\*\*  
   \- A) Open thread at \`accepted\` (recommended for coordination)  
   \- B) Open thread at \`confirmed\`

3\) \*\*Auto-decline window\*\*  
   \- A) 24h (your story)  
   \- B) 12h (faster inventory hygiene)

4\) \*\*Tour status\*\*  
   \- A) Only \`completed\` in v2 (simpler)  
   \- B) \`started\` \+ \`completed\` in v2 (better ops)

5\) \*\*Attachments\*\*  
   \- A) v2.1 (recommended)  
   \- B) include in v2

6\) \*\*Counter-offer\*\*  
   \- A) v2.1  
   \- B) include in v2

7\) \*\*Payout methods\*\*  
   \- A) Stripe only in v2 (recommended)  
   \- B) Add PayPal/MoMo/ZaloPay in v2

