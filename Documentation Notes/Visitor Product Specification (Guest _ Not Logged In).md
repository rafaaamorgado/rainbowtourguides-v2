\# Visitor Product Specification (Guest / Not Logged In)

\*\*Doc ID:\*\* DOC-SPEC-VISITOR    
\*\*Audience:\*\* Product / Design / Engineering / Ops    
\*\*Last updated:\*\* 2026-01-15    
\*\*Applies to:\*\* Public marketing \+ discovery experience for non-authenticated users

\---

\#\# 0\) Why this spec exists

Visitors are the front door. The visitor experience must:  
\- Convert SEO traffic into \*\*trust\*\* (mission, safety, inclusivity)  
\- Convert browsing into \*\*account creation\*\* (soft walls, minimal friction)  
\- Preserve \*\*context \+ intent\*\* (return to the same page after sign-up; keep booking draft inputs)  
\- Deliver \*\*premium, calm, non-sexualized\*\* brand tone consistently

\---

\#\# 1\) Visitor persona & intent

\#\#\# Primary intent clusters  
1\) \*\*Explorers (SEO)\*\*: “Is this real? Is it safe? Can I browse in my city?”  
2\) \*\*High intent\*\*: “I saw a guide/city — I want to book or message.”  
3\) \*\*Curious guides\*\*: “Can I become a guide? What’s required?”  
4\) \*\*Researchers\*\*: “Let me read blog posts, safety tips, and FAQ first.”

\#\#\# Emotional journey to design for  
\- Curiosity → skepticism → reassurance → “this is legit” → action → conversion    
\- Biggest drop-off risks: unclear value, feels sleazy, gating too early, losing progress.

\---

\#\# 2\) Information architecture (pages \+ purpose)

\#\#\# Top-level public routes (canonical)  
\- \`/\` Home (mission \+ trust \+ featured cities/guides \+ CTAs)  
\- \`/cities\` Explore cities (listing \+ search)  
\- \`/cities/\[slug\]\` City page (SEO content \+ guide teasers \+ filters)  
\- \`/guides\` Guide directory (optional; global browsing)  
\- \`/guides/\[handle\]\` Guide profile (read-only teaser \+ soft walls)  
\- \`/how-it-works\` How it Works (booking model, verification, safety, rules)  
\- \`/about\` About / Mission / Inclusivity statement  
\- \`/safety\` Safety hub (policy \+ standards \+ how to report)  
\- \`/faq\` FAQ  
\- \`/blog\` Blog index  
\- \`/blog/\[slug\]\` Blog article  
\- \`/contact\` Contact form  
\- \`/legal/\*\` Terms, Privacy, Refund/Cancellation, Community Guidelines  
\- \`/sitemap.xml\` and \`/sitemap\` (optional HTML sitemap page)  
\- \`/auth/\*\` Sign in/up/callback (modal can route here)

\#\#\# Navigation (visitor)  
\*\*Topbar\*\*  
\- Explore (cities)  
\- Blog  
\- How it works  
\- Become a Guide  
\- Language/Currency selector  
\- Sign in (primary) / Join (secondary)

\*\*Footer\*\*  
\- About, FAQ, Contact  
\- Legal: Privacy, Terms, Refunds, Community  
\- Social links  
\- City links (SEO \+ quick switching)

\---

\#\# 3\) Visitor journey map (end-to-end)

\#\#\# Stage A — Landing & trust (Home)  
\*\*Entry sources\*\*  
\- Organic search → city/guide/blog pages  
\- Direct → homepage  
\- Social/referrals → guide profiles

\*\*Home must answer in 10 seconds\*\*  
\- What is RTG?  
\- Why is it safe?  
\- How does booking work?  
\- Where do you operate?

\*\*Homepage modules (required)\*\*  
1\) Mission \+ inclusivity statement (calm, premium)  
2\) How it works (3–4 steps)  
3\) Trust cues:  
   \- Verified guides / safety standards  
   \- Secure payments badges (Stripe / SSL)  
   \- Media/testimonials  
4\) Featured destinations (cards)  
5\) Sample guides (cards)  
6\) Newsletter CTA (email-only)  
7\) Bottom CTAs: “Join as Traveler” \+ “Join as Guide”  
8\) Announcement banner (optional) e.g., “Now available in Da Nang\!”

\*\*Primary CTAs\*\*  
\- Browse cities  
\- Find a guide (optional)  
\- Join / Sign up  
\- Become a guide

\*\*Acceptance checks\*\*  
\- All CTAs open sign-up modal when appropriate  
\- Scrolling triggers no jarring layout shifts; skeletons used where needed

\---

\#\#\# Stage B — Explore cities (pre-auth)  
\*\*Route\*\*  
\- \`/cities\`

\*\*Features\*\*  
\- City search/typeahead (works before sign-up)  
\- Featured/trending cities  
\- SEO-friendly city cards

\*\*Quick switching\*\*  
\- Top navigation includes a city switcher or “Popular cities” dropdown for fast jumps

\*\*Acceptance checks\*\*  
\- Typing “Lisbon” shows Lisbon; selecting routes to \`/cities/lisbon\`  
\- Mobile-first and fast; skeletons during load

\---

\#\#\# Stage C — City page (SEO \+ guide teaser \+ soft walls)  
\*\*Route\*\*  
\- \`/cities/\[slug\]\`

\*\*Purpose\*\*  
\- Rank in SEO  
\- Build trust (LGBTQ+ context \+ safety notes)  
\- Show enough guide inventory to convert

\*\*City page sections\*\*  
1\) City intro (LGBTQ+ oriented) \+ safety snapshot  
2\) City highlights (3–5)  
3\) Guide teaser list (3–5 guides visible for visitors)  
4\) Filters (enabled pre-auth but with partial detail)  
5\) CTA blocks: “Sign up to unlock pricing, reviews, and booking”

\*\*Guide teaser rules (visitor view)\*\*  
Visible:  
\- Guide main photo  
\- Name  
\- Languages  
\- General description snippet  
\- Tags/themes  
Blurred/locked:  
\- Full pricing table (4/6/8h)  
\- Full reviews list  
\- Messaging button  
\- Booking form

\*\*Empty state\*\*  
If no guides:  
\- Show message: “We’re curating guides for this city”  
\- Offer: newsletter signup \+ concierge CTA \+ link to top alternative cities

\*\*Acceptance checks\*\*  
\- City page is indexable SSR with correct meta  
\- Visitor can filter results but sees “locked” details until sign-up  
\- Clicking a guide goes to read-only guide profile

\---

\#\#\# Stage D — Guide profile (read-only \+ conversion)  
\*\*Route\*\*  
\- \`/guides/\[handle\]\`

\*\*Visitor-visible (read-only)\*\*  
\- Main photo \+ gallery teaser (optional blur for non-auth)  
\- Name \+ city  
\- Languages  
\- “About” short version  
\- Themes/interests  
\- Verification badge placeholder (e.g., “Verified guide” label)  
\- Selected reviews teaser (see reviews section)  
\- Social sharing buttons

\*\*Locked for visitors\*\*  
\- Pricing breakdown (4/6/8h)  
\- Availability calendar detail  
\- “Message guide”  
\- “Request booking”  
\- Contact details

\*\*Conversion UX\*\*  
\- Inline callout near locked sections:  
  \- “Sign up to unlock pricing, reviews, and booking.”  
\- CTA buttons open sign-up modal:  
  \- “Request booking” (primary)  
  \- “Message guide” (secondary)  
  \- “Join now” (tertiary)

\*\*Acceptance checks\*\*  
\- Visitors cannot access pricing/messaging endpoints (server-side guard)  
\- Sharing works even for guests

\---

\#\#\# Stage E — Signup & return-to-context  
\*\*Trigger points\*\*  
\- Clicking Request Booking / Message / Unlock pricing  
\- Trying to submit a booking draft

\*\*Signup UX requirements\*\*  
\- Can open from any CTA as a \*\*modal\*\* (preferred) or route  
\- Supports:  
  \- Email/password  
  \- Google login  
  \- Apple login

\*\*Return-to-context\*\*  
\- After successful signup/login, user returns to:  
  \- the exact page (\`/cities/\[slug\]\` or \`/guides/\[handle\]\`)  
  \- the exact scroll position (nice-to-have)  
  \- and resumes any draft flow

\*\*Abandoned signup caching\*\*  
\- Cache partially filled fields temporarily (local storage)  
\- Expire after X hours (recommended: 24h)

\*\*Acceptance checks\*\*  
\- Post-auth redirect always preserves source URL \+ query params  
\- No data loss for booking drafts started pre-auth (see Section 6\)

\---

\#\# 4\) Soft walls & gating rules (critical)

\#\#\# What visitors can do (allowed)  
\- Browse cities and city content  
\- Use search/typeahead  
\- Use filters (language/interest/duration) but see partial results  
\- Open guide profiles in read-only  
\- Read blog articles, FAQ, safety pages  
\- Subscribe to newsletter  
\- Submit contact form  
\- Change language/currency display preferences  
\- Toggle light/dark mode  
\- Share pages

\#\#\# What visitors cannot do (blocked)  
\- View contact info  
\- Message guides  
\- View full pricing details  
\- View full reviews list (beyond limited teaser)  
\- Submit booking request (must authenticate)

\#\#\# Gating UX patterns (use consistently)  
\- Blur \+ lock icon \+ “Sign up to unlock”  
\- Inline CTA in the exact place of friction (pricing, reviews, booking)  
\- Don’t gate too early: show enough value to feel real.

\---

\#\# 5\) Reviews visibility (visitor)

\#\#\# Visitor rule  
Visitors can read \*\*selected verified reviews\*\* (teaser), but cannot leave reviews.

\#\#\# Recommended implementation  
\- Show:  
  \- average rating \+ count (if available)  
  \- up to 2–3 recent reviews excerpted (short)  
\- Gate:  
  \- full review list behind signup

\*\*Acceptance checks\*\*  
\- “See all reviews” triggers signup  
\- Visitors cannot access write-review UI or endpoints

\---

\#\# 6\) Booking draft preservation (pre-auth)

\#\#\# Requirement  
If a visitor starts the booking flow (e.g., selects duration/date/start time/note) and then hits the auth wall, the system must preserve inputs and restore them after signup/login.

\#\#\# Spec  
\- Draft stored in:  
  \- local storage (visitor side) keyed by guide \+ city  
  \- optionally mirrored server-side once logged in

\*\*Draft fields\*\*  
\- guide\_id  
\- city\_slug  
\- duration (4/6/8h)  
\- date  
\- start\_time  
\- itinerary\_note (≤500 chars)  
\- meeting preference (optional)  
\- selected language (optional)  
\- created\_at timestamp

\*\*Acceptance checks\*\*  
\- After signup, booking form is pre-filled exactly as before  
\- Draft expires cleanly after X hours (recommended: 24h)  
\- No cross-user leakage (draft is local until authenticated)

\---

\#\# 7\) Language & currency preferences (visitor)

\#\#\# Requirements  
\- Visitors can change display language and currency for browsing.  
\- If they return later, the site defaults to browser language (localized content).  
\- Store preferences via cookie/local storage.  
\- Currency display is informational pre-auth.

\*\*Acceptance checks\*\*  
\- Switching language updates navigation labels \+ key marketing copy  
\- Switching currency updates visible “from” prices (if shown) as estimates

\---

\#\# 8\) Newsletter (no account required)

\#\#\# Requirements  
\- Email-only signup  
\- Success message immediately  
\- Double opt-in confirmation email

\*\*Acceptance checks\*\*  
\- Prevent invalid emails  
\- Confirm subscription with a “check your inbox” state  
\- GDPR consent displayed if required by policy

\---

\#\# 9\) Contact form (GDPR-compliant)

\*\*Route\*\*  
\- \`/contact\`

\*\*Fields\*\*  
\- Name (required)  
\- Email (required, validated)  
\- Subject (required)  
\- Message (required)  
\- Privacy/consent checkbox (required)

\*\*Behavior\*\*  
\- Client-side validation \+ server-side validation  
\- Confirmation screen \+ email acknowledgement (optional)

\*\*Acceptance checks\*\*  
\- Cannot submit without required fields  
\- Invalid email blocked  
\- Consent required  
\- Success state displays clearly

\---

\#\# 10\) Cookie consent (GDPR environment)

\#\#\# Requirements  
\- Banner with:  
  \- “Accept all”  
  \- “Customize”  
  \- “Reject non-essential”  
\- Analytics only fire after consent

\*\*Acceptance checks\*\*  
\- Choice persists (cookie)  
\- Analytics tags not loaded before consent  
\- “Customize” allows toggling analytics vs necessary

\---

\#\# 11\) Blog & SEO acquisition engine

\#\#\# Requirements  
\- \`/blog\` index \+ \`/blog/\[slug\]\` articles  
\- Articles include:  
  \- city links  
  \- safety content  
  \- internal CTAs to explore/guide pages  
\- SEO:  
  \- meta tags  
  \- structured data where appropriate  
  \- sitemap includes cities, guides, blog

\*\*Acceptance checks\*\*  
\- Blog pages load fast, readable on mobile  
\- Internal linking strategy supports “LGBTQ+ private guide in \[City\]” wedge

\---

\#\# 12\) Social sharing

\#\#\# Requirements  
\- Share buttons: Facebook, Twitter/X, WhatsApp  
\- Share on city and guide pages (at minimum)  
\- Use canonical URLs \+ meta OG tags

\*\*Acceptance checks\*\*  
\- Shared link previews show correct title/description/image  
\- Buttons work on mobile (WhatsApp especially)

\---

\#\# 13\) UI quality requirements (visitor)

\- Responsive and mobile-optimized layouts  
\- Loading skeletons for lists and profile content  
\- Light/dark mode toggle  
\- Announcement banner component (dismissible)  
\- Trust badges (SSL, secure payments, verified guides)

\*\*Acceptance checks\*\*  
\- Skeletons show on slow networks; no “white flash” pages  
\- Toggle persists for theme preference  
\- Banner can be controlled by config (admin later)

\---

\#\# 14\) Page-to-page flow map (what leads to what)

\#\#\# Primary browse flows  
\- \`/\` → \`/cities\` → \`/cities/\[slug\]\` → \`/guides/\[handle\]\` → (CTA) → signup → return → booking  
\- \`/blog/\[slug\]\` → \`/cities/\[slug\]\` or \`/guides/\[handle\]\` → signup

\#\#\# Conversion triggers  
\- “Request booking” → signup modal → return to guide profile \+ booking draft restored  
\- “Message guide” → signup modal → return to guide profile \+ open messages (post-auth)  
\- “Unlock pricing/reviews” → signup modal → same page unlocks

\#\#\# Guide acquisition flow  
\- “Become a guide” → \`/how-it-works\` section or dedicated \`/become-a-guide\`  
  \- CTA → signup as guide → guide onboarding wizard

\---

\#\# 15\) Data & permissions (visitor-safe boundaries)

Visitor can access only:  
\- cities/countries public data  
\- guides public profile data (teaser)  
\- blog content  
\- public review excerpts (limited)

Visitor cannot access:  
\- private profiles  
\- contact details  
\- full reviews  
\- pricing breakdown (if gated)  
\- messaging endpoints  
\- booking creation endpoints

\*\*Acceptance checks\*\*  
\- Server-side checks prevent URL hacking (not just UI hiding)  
\- RLS policies prevent unauthorized reads

\---

\#\# 16\) “Done means” checklist

Visitor experience is complete when:  
\- Visitors can browse cities, guides, and blog content without login  
\- Soft walls exist and convert without feeling hostile  
\- Any CTA that requires auth opens signup and returns to context  
\- Booking draft inputs are preserved through signup  
\- Contact \+ newsletter flows work with validation \+ confirmations  
\- Language/currency preferences work pre-auth and persist  
\- Cookie consent gates analytics correctly  
\- Site is fast, mobile-friendly, and visually consistent with brand tone

\---  
