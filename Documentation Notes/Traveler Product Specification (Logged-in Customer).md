\# Traveler Product Specification (Logged-in Customer)

\*\*Doc ID:\*\* DOC-SPEC-TRAVELER    
\*\*Audience:\*\* Product / Design / Engineering / Ops    
\*\*Last updated:\*\* 2026-01-15    
\*\*Applies to:\*\* Traveler experience after authentication (plus the “auth boundary” flows that gate booking/messaging)

\---

\#\# 0\) Why this spec exists

Traveler experience is the revenue engine. It must:  
\- Convert browsing into \*\*confirmed bookings\*\*  
\- Preserve \*\*trust and safety\*\* (verification cues, reporting, boundaries)  
\- Make booking feel \*\*transparent and premium\*\* (pricing \+ fees \+ policies)  
\- Keep travelers calm through \*\*clear status \+ notifications \+ time handling\*\*  
\- Support post-trip loops: \*\*reviews, rebooking, retention\*\*

This document specifies the \*\*traveler-facing product\*\*: pages, flows, features, states, and acceptance checks.

\---

\#\# 1\) Traveler persona & intent

\#\#\# Primary intents  
1\) “I want a vetted LGBTQ+ guide in \*\*\[City\]\*\* on \*\*\[Date\]\*\*.”  
2\) “I want to understand price and safety \*\*before\*\* I commit.”  
3\) “I want smooth coordination and no surprises.”

\#\#\# Emotional journey we design for  
Curiosity → reassurance → choice → commitment → coordination → confidence → memory → return

Biggest drop-off risks:  
\- Confusing booking steps (request vs confirm vs pay)  
\- Hidden fees / unclear cancellation rules  
\- Timezone confusion  
\- Slow acceptance and no status updates  
\- Safety uncertainty or lack of escalation path

\---

\#\# 2\) Scope & versioning (important)

This backlog includes features at different maturity levels. To avoid shipping chaos:

\#\#\# v2 (launch core)  
\- Email/password \+ OAuth (Google/Apple)  
\- Email verification required before requesting  
\- Mandatory acceptance of ToS/Privacy/Refund/Community Guidelines  
\- Traveler onboarding: language, currency, home country  
\- Traveler profile: display name \+ avatar (public traveler profile limited)  
\- City/guide discovery with filters \+ sorting  
\- Booking request (4/6/8h, ≥24h lead, note ≤500 chars, participants, meeting preference)  
\- Guide accept/decline  
\- Payment via Stripe Checkout after acceptance (recommended v2 default)  
\- Messaging per booking  
\- Dashboard (upcoming/past)  
\- 24h reminder email  
\- Reviews (traveler→guide) \+ double-blind reveal (with guide review)  
\- Safety reporting \+ support entry points  
\- Data export \+ account deletion (GDPR self-service)

\#\#\# v2.1+ (explicitly later)  
\- Bundled multi-day reservations (multiple sessions in one flow)  
\- Auto-charge stored payment method on acceptance  
\- Chat image attachments  
\- MoMo/ZaloPay local methods  
\- Calendar integration (ICS)  
\- 2FA \+ session management “sign out everywhere”  
\- Promo codes \+ loyalty perks  
\- Blocking guides

\> We can still design the data model for v2.1 now, but the UI/implementation can ship later.

\---

\#\# 3\) Pages & navigation (traveler app)

\#\#\# 3.1 Core routes  
\*\*Marketing (still accessible)\*\*  
\- \`/\` \`/cities\` \`/cities/\[slug\]\` \`/guides/\[handle\]\` \`/blog\` \`/faq\` \`/safety\` \`/legal/\*\`

\*\*Traveler app\*\*  
\- \`/traveler/onboarding\`  
\- \`/traveler/dashboard\` (overview)  
\- \`/traveler/bookings\` (tabs: upcoming/pending/past)  
\- \`/traveler/bookings/\[id\]\` (booking detail)  
\- \`/traveler/messages\` (inbox)  
\- \`/traveler/messages/\[threadId\]\` (thread)  
\- \`/traveler/profile\` (public profile \+ edit)  
\- \`/traveler/settings\` (security, notifications, privacy, data export/delete)

\*\*Shared auth\*\*  
\- \`/auth/sign-in\` \`/auth/sign-up\` \`/auth/callback\` \`/auth/verify-email\` \`/auth/reset\`

\#\#\# 3.2 Navigation model  
\- Topbar: Explore, Blog, Help, Avatar menu (Dashboard, Bookings, Messages, Profile, Settings, Sign out)  
\- Persistent city search is available from topbar for fast re-entry into discovery

\---

\#\# 4\) Account, auth, and compliance (traveler)

\#\#\# 4.1 Sign-up & role selection  
\*\*User stories covered\*\*  
\- Create account via email/password  
\- OAuth via Google/Apple  
\- Select “Traveler” role  
\- Accept ToS, Privacy, Refund, Community Guidelines

\*\*Requirements\*\*  
\- Sign-up modal or page includes:  
  \- Email \+ password OR OAuth  
  \- Role selector defaulted to Traveler when coming from traveler CTAs  
  \- Required checkbox bundle:  
    \- “I agree to ToS”  
    \- “I agree to Privacy”  
    \- “I agree to Refund policy”  
    \- “I agree to Community Guidelines”  
  \- Optional:  
    \- Marketing opt-in  
    \- Analytics consent handled via cookie banner

\*\*Acceptance checks\*\*  
\- Traveler role stored reliably (server-side, not just client)  
\- If checkboxes not accepted → block sign-up completion  
\- OAuth sign-up still requires policy acceptance step (post-OAuth continuation)

\---

\#\#\# 4.2 Email verification gate  
\*\*User story\*\*  
\- Must verify email before requesting bookings

\*\*Requirements\*\*  
\- After sign-up, prompt: “Verify your email to request bookings”  
\- “Resend email” action (rate limited)  
\- Booking CTAs remain visible but blocked with verification prompt until verified

\*\*Acceptance checks\*\*  
\- Unverified users cannot submit booking requests (server-side enforced)  
\- Verification completion returns the user to intended context

\---

\#\#\# 4.3 Password & security settings  
\*\*User stories\*\*  
\- Change password  
\- Reset password  
\- Sign out everywhere \+ active sessions (later)  
\- Enable 2FA (later)

\*\*v2 Requirements\*\*  
\- Password reset via email link  
\- Change password inside settings

\*\*v2.1 Requirements\*\*  
\- Active sessions view \+ “sign out everywhere”  
\- 2FA enable/disable with recovery codes

\*\*Acceptance checks\*\*  
\- Password reset works with safe expiration  
\- Change password requires current password re-auth (recommended)

\---

\#\#\# 4.4 Privacy, consent, data controls  
\*\*User stories\*\*  
\- Download data  
\- Delete account \+ PII after confirmation  
\- Opt in/out marketing \+ booking notifications  
\- Manage analytics consent

\*\*Requirements\*\*  
\- Notifications preferences in settings:  
  \- booking updates (transactional) — cannot fully disable  
  \- marketing — opt out allowed  
\- Analytics consent handled via cookie preference UI  
\- Data export: JSON download of profile, bookings, reviews, messages  
\- Account deletion:  
  \- confirmation step (email link recommended)  
  \- delete or anonymize PII  
  \- retain minimal non-PII booking metadata for legal/accounting

\*\*Acceptance checks\*\*  
\- Export produces a file in a common format (JSON)  
\- Deletion is irreversible and audited  
\- Post-deletion, admin sees masked record only

\---

\#\# 5\) Traveler profile (public \+ private)

\#\#\# 5.1 Profile requirements  
\*\*User stories\*\*  
\- Set preferred language, currency, home country during onboarding  
\- Edit display name and avatar  
\- Add/update phone and emergency contact (coordination)

\*\*Design decision: public traveler profile (guide-facing)\*\*  
\- Traveler profile has:  
  \- \*\*Private fields\*\*: phone, emergency contact, email, preferences  
  \- \*\*Public traveler card\*\* shown to guides during booking:  
    \- display name  
    \- avatar (optional but encouraged)  
    \- languages  
    \- short bio (optional)  
    \- interests (optional)  
    \- home country (optional)

\*\*Acceptance checks\*\*  
\- Private fields never shown publicly  
\- Emergency contact visible only to traveler \+ admin (and only used for safety escalation, not shared casually)

\---

\#\# 6\) Discovery & decisioning (traveler browsing)

\#\#\# 6.1 Search entry points  
\*\*User stories\*\*  
\- Homepage city search  
\- Type a city name and pick matching result  
\- Open \`/cities/\[slug\]\` with SEO content \+ guide list

\*\*Requirements\*\*  
\- Always available city search in top nav  
\- \`/cities/\[slug\]\` renders SEO content \+ guide list (server-rendered)  
\- Date/time selector to filter “available on my chosen date”

\*\*Acceptance checks\*\*  
\- Selecting city routes correctly and persists selected date/time in URL query (recommended)  
\- City page loads quickly and shows skeletons on slow networks

\---

\#\#\# 6.2 Filters & sorting  
\*\*User stories\*\*  
\- Filter by duration, language, interests, min rating, availability on date  
\- Sort by relevance, rating, most bookings  
\- Clear all filters  
\- No-match suggestions

\*\*Requirements\*\*  
\- Filters:  
  \- duration (4/6/8)  
  \- languages  
  \- interests/themes (food/culture/nightlife)  
  \- min average rating  
  \- available on chosen date  
\- Sort:  
  \- relevance (default)  
  \- rating  
  \- most bookings (if data exists; else hide)  
\- No-match state:  
  \- suggest removing filters  
  \- show “top-rated in city” or “nearby alternatives”

\*\*Acceptance checks\*\*  
\- Filters update results deterministically  
\- Reset clears URL params and UI state  
\- No-match suggestions are actionable

\---

\#\#\# 6.3 Guide profile (full details for traveler)  
\*\*User stories\*\*  
\- See bio/photos/pricing/reviews  
\- Browse gallery  
\- See prices per duration  
\- See converted prices (estimates)  
\- Mini calendar open slots  
\- Verified indicator \+ safety statement  
\- Save guide for later  
\- Share link

\*\*Requirements\*\*  
\- Guide profile sections:  
  \- Gallery (up to 4+; future expansions ok)  
  \- About \+ themes  
  \- Languages  
  \- Verified badge \+ safety statement  
  \- Pricing table for 4/6/8h  
  \- Mini availability preview (not full scheduling system in v2)  
  \- Reviews list \+ rating summary  
  \- Save (wishlist/favorites) (v2 optional; else v2.1)  
  \- Share link (copy \+ share sheet)

\*\*Pricing display rules\*\*  
\- Show primary currency (city currency) \+ traveler preferred currency conversion  
\- Label conversions as estimates (not charged amount unless currency matches)

\*\*Acceptance checks\*\*  
\- Pricing visible and clear before booking  
\- Conversion copy prevents misunderstandings  
\- Verified badge is truthful (based on guide approval \+ verification state)

\---

\#\# 7\) Booking flow (request → accept → pay → confirm)

\#\#\# 7.1 Booking creation  
\*\*User stories\*\*  
\- Pick date/time (≥24h lead)  
\- Choose 4/6/8h duration  
\- Participants up to guide limit  
\- Choose meeting preference (guide default vs traveler entered)  
\- Add note ≤500 chars  
\- See subtotal \+ traveler fee \+ tax note  
\- Prevent overlapping sessions  
\- Prevent duplicate pending requests  
\- Handle slot becoming unavailable mid-flow

\*\*Requirements (v2)\*\*  
Booking form inputs:  
\- duration: 4/6/8  
\- date  
\- start time (enforce ≥24h)  
\- participants (1..max\_group\_size)  
\- meeting preference:  
  \- guide default pickup area / meetup point OR  
  \- traveler custom address (free text; optionally structured later)  
\- itinerary note (≤500 chars)  
\- price summary:  
  \- subtotal (guide price)  
  \- traveler service fee  
  \- tax note (“taxes may apply” or city-specific rules)

Validation rules:  
\- Lead time: must be ≥24 hours from now (in guide local time; see timezone)  
\- Availability: must be within guide’s weekly window and not a blackout date  
\- Overlap: traveler can’t have overlapping \*confirmed\* bookings; optionally block overlapping pending too  
\- Duplicate: prevent multiple pending requests to same guide for same date/time

\*\*Slot lost handling\*\*  
\- If availability changes while traveler is filling form:  
  \- show modal: “This time is no longer available — choose another slot”  
  \- preserve typed notes

\*\*Acceptance checks\*\*  
\- Booking cannot be created if invalid by availability/lead time rules (server enforced)  
\- User sees a clear error message and path to fix  
\- Draft preserves inputs across navigation and auth refresh

\---

\#\#\# 7.2 Pending management  
\*\*User stories\*\*  
\- Submit and see pending screen  
\- Modify pending date/time/duration/notes  
\- Cancel pending request  
\- See status

\*\*Requirements\*\*  
\- Pending view shows:  
  \- date/time, duration, guide, price estimate  
  \- status explanation \+ expected response window  
\- Traveler can edit pending request:  
  \- changes reset “response timer” (optional)  
  \- notify guide of updates  
\- Traveler can cancel pending:  
  \- no fee charged (v2 default)  
  \- reason optional

\*\*Acceptance checks\*\*  
\- Only traveler owner can modify/cancel  
\- Guide gets notified of edits/cancellation

\---

\#\#\# 7.3 Guide decision & notifications  
\*\*User stories\*\*  
\- Traveler notified when accepted  
\- Notified if declined with reason

\*\*Requirements\*\*  
\- On accept:  
  \- status \`accepted\`  
  \- show “Pay now to confirm” CTA  
  \- send email \+ in-app notification  
\- On decline:  
  \- status \`declined\`  
  \- show reason (predefined categories \+ optional note)  
  \- suggest alternatives: similar guides or concierge

\*\*Acceptance checks\*\*  
\- Notifications fire reliably  
\- Decline reason copy stays respectful and privacy-safe

\---

\#\#\# 7.4 Payment & confirmation (reconciled)  
\*\*Conflict\*\*  
You listed “stored method charged automatically after acceptance (simulated in v2).”  
Earlier RTG v2 spec: “accept → traveler pays via Stripe Checkout.”

\*\*Recommended v2 decision\*\*  
\- Use Stripe Checkout after acceptance (simple, consistent, fewer edge cases)

\*\*v2 Requirements\*\*  
\- Payment CTA launches Stripe Checkout  
\- On success:  
  \- status becomes \`confirmed\`  
  \- confirmation page  
  \- emailed receipt  
  \- invoice PDF download (if supported) or receipt PDF later

\*\*v2.1 Upgrade\*\*  
\- Stored payment method pre-auth \+ auto-capture on acceptance  
\- Payment failure prompts method update

\*\*Acceptance checks\*\*  
\- \`confirmed\` only reachable after successful payment event  
\- If payment fails: traveler sees clear retry path  
\- Receipt email sent; booking detail shows payment status and breakdown

\---

\#\#\# 7.5 Calendar & reminders  
\*\*User stories\*\*  
\- Add confirmed tour to calendar  
\- Reminder 24h before tour  
\- DST-safe time handling

\*\*v2 Requirements\*\*  
\- 24h reminder email:  
  \- local time labels (guide local time \+ traveler local time if different)  
  \- meeting point link  
  \- booking link

\*\*v2.1\*\*  
\- ICS calendar download / add to Google/Apple calendar button

\*\*Acceptance checks\*\*  
\- Time labels prevent confusion (explicit timezone)  
\- DST-safe conversions; never show ambiguous times

\---

\#\# 8\) Messaging (traveler ↔ guide)

\#\#\# 8.1 Thread creation & access  
\*\*User stories\*\*  
\- Thread opens on acceptance  
\- Exchange messages  
\- New message notifications  
\- Share images in chat (later)  
\- Add follow-up questions after acceptance

\*\*v2 Requirements\*\*  
\- Thread opens when booking becomes \`accepted\` (or \`confirmed\`; choose policy)  
\- Text messages only  
\- Notification: email \+ in-app indicator

\*\*v2.1\*\*  
\- Image attachments  
\- Realtime updates

\*\*Acceptance checks\*\*  
\- Only traveler \+ guide \+ admin can access thread (RLS)  
\- Message notifications don’t leak content on lockscreen/email preview beyond minimal

\---

\#\# 9\) Dashboard & bookings management

\#\#\# 9.1 Dashboard overview  
\*\*User stories\*\*  
\- View upcoming bookings with date/time/guide/status  
\- View past bookings  
\- Open booking details with sessions and conversation thread  
\- View history of payments and reviews  
\- Rebook same guide

\*\*Requirements\*\*  
\- \`/traveler/dashboard\`:  
  \- Upcoming next booking card  
  \- Pending requests list  
  \- Past highlights \+ “book again”  
\- \`/traveler/bookings\`:  
  \- tabs: Pending / Upcoming / Past  
  \- each row shows: date/time, guide, status, CTA  
\- Booking detail page:  
  \- timeline of status changes  
  \- payment status and receipt link  
  \- cancellation and refund status  
  \- conversation thread link

\*\*Acceptance checks\*\*  
\- Status labels are consistent across all pages  
\- Rebooking CTA routes to guide profile with prefilled context where possible

\---

\#\#\# 9.2 Cancellation & refunds  
\*\*User stories\*\*  
\- Cancel and see refund outcomes per policy  
\- See whether refund approved and timeline  
\- Report no-show and request refund

\*\*Requirements\*\*  
\- Cancellation UI shows:  
  \- what happens financially before confirming cancellation  
  \- policy summary (48h rule)  
\- Refund tracking:  
  \- status: requested / approved / denied / processed  
  \- expected timeline (copy-only if we don’t have exact values)  
\- No-show flow:  
  \- “Report no-show” option on booking detail  
  \- opens support case \+ flags admin

\*\*Acceptance checks\*\*  
\- Traveler sees clear outcomes before cancel  
\- Refund status is visible and updates based on admin action / Stripe events

\---

\#\# 10\) Reviews & reputation (traveler)

\#\#\# 10.1 Leave and manage reviews  
\*\*User stories\*\*  
\- Leave 1–5 rating \+ text review  
\- Edit within grace period  
\- Report abusive review  
\- See guide response

\*\*Requirements\*\*  
\- Review eligibility only after \`completed\`  
\- Double-blind reveal:  
  \- not visible until both submit or timeout (recommended 14 days)  
\- Edit window:  
  \- allow edit within X hours after submission (recommended 24h) if not yet revealed  
\- Reporting:  
  \- “Report review” with reason categories

\*\*Acceptance checks\*\*  
\- Only booking participants can review  
\- Edits obey reveal rules  
\- Reports enter moderation queue

\---

\#\# 11\) Support & safety escalation (traveler)

\#\#\# 11.1 Support access points  
\*\*User stories\*\*  
\- Contact support from Help/FAQ or dashboard  
\- Open and track tickets  
\- Flag booking as safety incident for admin escalation  
\- Block a guide (later)

\*\*v2 Requirements\*\*  
\- Support entry points:  
  \- Help/FAQ → “Contact support”  
  \- Booking detail → “Report issue”  
  \- Messages thread → “Report”  
\- Minimal ticketing:  
  \- create ticket (category \+ message)  
  \- show ticket status (received / in progress / resolved)  
\- Safety incident flag:  
  \- prominent but calm “Safety issue” report path  
  \- immediate escalation tag for admin

\*\*v2.1\*\*  
\- Block guide (hide profile and prevent rebooking)  
\- More robust ticketing UI

\*\*Acceptance checks\*\*  
\- Reporting is available from booking and messages  
\- Escalations are visible in admin queue and auditable

\---

\#\# 12\) Internationalization & time correctness (traveler)

\*\*User stories\*\*  
\- Change site language  
\- Format dates/currencies correctly  
\- Set display currency; see conversions  
\- See booking times in guide local time with clear labels  
\- Protected from DST shifts

\*\*Requirements\*\*  
\- Display both:  
  \- “Guide local time” (primary for tour logistics)  
  \- “Your time” (secondary if traveler timezone differs)  
\- Show timezone abbreviation and offset where possible  
\- Currency conversions labeled as estimates unless charged in that currency

\*\*Acceptance checks\*\*  
\- No ambiguous times (e.g., DST gaps)  
\- Consistent formatting per locale

\---

\#\# 13\) Promotions, loyalty, and payments expansion (later)

\*\*User stories\*\*  
\- Promo code at checkout  
\- Loyalty/status perks  
\- Pay with MoMo/ZaloPay when available  
\- PDF invoice/receipt download

\*\*v2.1+ Requirements\*\*  
\- Promo code entry at checkout \+ validation  
\- Loyalty display in dashboard (tier \+ perks)  
\- Additional payment methods based on Stripe capabilities per region  
\- PDF invoice generation

\---

\#\# 14\) Page-to-page flow map (what leads to what)

\#\#\# Primary booking path  
\- \`/\` or \`/cities\` → \`/cities/\[slug\]\` → \`/guides/\[handle\]\` → Booking modal/page    
→ (submit) \`/traveler/bookings/\[id\]\` (pending)    
→ (guide accepts) \`/traveler/bookings/\[id\]\` (accepted) \+ “Pay now”    
→ (Stripe checkout) success → \`/traveler/bookings/\[id\]\` (confirmed) \+ receipt    
→ (messages) \`/traveler/messages/\[threadId\]\`    
→ (completion) review prompt → review form

\#\#\# Account & settings  
\- Avatar menu → \`/traveler/settings\` (security, notifications, privacy)  
\- Dashboard → Bookings → Booking detail → Cancel/report/support

\---

\#\# 15\) Data & permission boundaries (traveler)

Traveler can access:  
\- public guide data  
\- their own booking records  
\- their own messages  
\- their own payment/receipt links  
\- their own support tickets  
\- their own export/delete controls

Traveler cannot access:  
\- other travelers’ PII  
\- other guides’ private settings  
\- admin moderation queues or payouts data

\*\*Acceptance checks\*\*  
\- RLS enforces ownership and role boundaries server-side  
\- UI hiding is never the only protection

\---

\#\# 16\) “Done means” checklist

Traveler product is “complete enough for v2” when:  
\- Auth supports email \+ OAuth, with email verification gate for booking  
\- Sign-up captures policy acceptance (ToS/Privacy/Refund/Community)  
\- Onboarding captures language/currency/home country  
\- Traveler profile supports display name/avatar, and keeps private fields private  
\- City \+ guide discovery with filters and sorting works  
\- Booking request → acceptance → payment → confirmation works end-to-end  
\- Traveler can manage pending requests and cancellations  
\- Messaging per booking works with notifications \+ reporting  
\- 24h reminders send with correct timezone labeling (DST-safe)  
\- Reviews flow exists with double-blind reveal rules  
\- Support and safety incident escalation exists  
\- GDPR export and account deletion exists and is auditable

\---

\#\# 17\) Open questions to lock (so engineering doesn’t guess)

1\) \*\*Payment timing for v2\*\*  
   \- A) Pay after acceptance via Stripe Checkout (recommended)  
   \- B) Auto-charge stored method after acceptance (v2.1)

2\) \*\*Multi-day bundling\*\*  
   \- A) v2.1 only (recommended)  
   \- B) Include in v2

3\) \*\*Phone \+ emergency contact\*\*  
   \- A) optional fields (recommended)  
   \- B) required before confirmed booking

4\) \*\*Messaging threshold\*\*  
   \- A) open thread at \`accepted\` (recommended for coordination)  
   \- B) open thread at \`confirmed\` (safer financially, slower coordination)

5\) \*\*Attachments\*\*  
   \- A) v2.1 (recommended)  
   \- B) include in v2

6\) \*\*Block guide\*\*  
   \- A) v2.1  
   \- B) include in v2

