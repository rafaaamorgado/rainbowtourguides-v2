\# Traveler Journey (End-to-End)

\*\*Doc ID:\*\* DOC-JOURNEY-TRAVELER    
\*\*Audience:\*\* Product / Design / Engineering / Ops    
\*\*Last updated:\*\* 2026-01-15

\---

\#\# 1\) Product promise (what the traveler should feel)

A traveler should feel:  
\- \*\*Reassured\*\*: “This is built for LGBTQ+ safety and respect.”  
\- \*\*In control\*\*: “I understand how this works and what it costs.”  
\- \*\*Seen, not sexualized\*\*: “This isn’t a hookup vibe.”  
\- \*\*Confident\*\*: “These guides are real and vetted.”

North-star outcome:  
1\) Discover a city → 2\) Choose a verified guide → 3\) Request/Book → 4\) Pay safely →    
5\) Coordinate via messages → 6\) Tour happens → 7\) Mutual reviews → 8\) Rebook / explore new cities

\---

\#\# 2\) Personas covered

\- \*\*Visitor / Guest\*\* (not logged-in): learning, browsing, trust-building, conversion  
\- \*\*Traveler\*\* (logged-in customer): profile setup, booking lifecycle, messaging, reviews, retention

\---

\#\# 3\) Journey map (stages)

\#\#\# Stage A — Awareness & trust (Visitor)  
\*\*Entry points\*\*  
\- Homepage, city pages, guide profiles, blog articles (SEO is the main acquisition engine).

\*\*Visitor actions\*\*  
\- Reads mission / safety / inclusivity messaging  
\- Browses cities and featured guides  
\- Reads blog posts (LGBTQ+ travel \+ safety \+ city inspiration)

\*\*Soft walls (conversion UX)\*\*  
Some “high-intent” details can be blurred or gated for guests, with a calm prompt:  
\- full pricing table  
\- full reviews list  
\- messaging CTA  
\- booking CTA

\*\*Guest conversion triggers\*\*  
\- “Book / Request” → sign up modal/page  
\- “Message guide” → sign up prompt  
\- “Unlock pricing & reviews” → sign up prompt

\*\*Post-registration continuity\*\*  
After sign-up, user returns to the exact place they left off (city/guide/booking draft).

\*\*Primary emotion\*\*  
“I’m curious, but I need to trust this isn’t shady.”

\---

\#\#\# Stage B — Account creation & onboarding (Traveler)  
\*\*Auth\*\*  
\- v2 baseline: email/password  
\- optional: social login (if implemented in v2 scope)

\*\*Traveler onboarding (wizard)\*\*  
Required:  
\- Preferred \*\*language\*\*  
\- Preferred \*\*currency\*\*  
\- Name  
Optional but recommended:  
\- Pronouns  
\- Home city / country  
\- Profile photo  
\- Short bio  
\- Interests (culture, food, nightlife, queer history, nature, etc.)

\*\*Traveler profiles (IMPORTANT)\*\*  
\- Traveler has:  
  1\) \*\*Private dashboard profile\*\* (settings, preferences)  
  2\) \*\*Public traveler profile\*\* visible to guides during booking context (Airbnb-style)  
     \- Purpose: make guides feel safer and more informed  
     \- Privacy: show limited fields only (see “Privacy rules”)

\*\*Privacy rules (recommended)\*\*  
Public traveler profile shows:  
\- first name (or chosen display name)  
\- photo (optional but strongly encouraged)  
\- languages  
\- short bio  
\- interests  
Not shown publicly:  
\- email, phone, exact address, payment details, legal name

\*\*Primary emotion\*\*  
“Okay, this feels legit and thoughtful.”

\---

\#\#\# Stage C — Discovery & browsing (Traveler or Guest)  
\*\*Core discovery behaviors\*\*  
\- Search/browse by city  
\- Filter by:  
  \- availability (basic in v2)  
  \- language  
  \- interests / specialties  
\- Preview:  
  \- guide ratings  
  \- bio & vibe  
  \- availability snapshot  
  \- verified badge

\*\*Guide profile must answer\*\*  
\- Who is this person?  
\- Are they verified?  
\- What do we do?  
\- How much does it cost?  
\- Are they available when I need them?

\*\*Primary emotion\*\*  
“I want the right guide — safe, aligned, and not awkward.”

\---

\#\#\# Stage D — Booking creation (Request flow \= default)  
\*\*Booking request inputs\*\*  
\- date  
\- start time (or time window)  
\- duration (4/6/8h)  
\- number of people (optional v2)  
\- notes: interests, pace, must-see items, boundaries/preferences

\*\*Booking draft behavior\*\*  
\- Guests can build a draft but must sign up to submit.  
\- After submit: status becomes \`pending\`.

\*\*Traveler dashboard updates\*\*  
\- Booking appears in “Pending requests”  
\- Traveler sees a clear next step: “Wait for guide response”

\*\*Primary emotion\*\*  
“Great — now I’m waiting. Please keep me posted.”

\---

\#\#\# Stage E — Acceptance → payment → confirmation  
\*\*Guide accepts\*\*  
\- Booking status becomes \`accepted\` (awaiting payment)  
\- Traveler gets:  
  \- in-app notification  
  \- email notification  
  \- clear CTA: “Pay to confirm”

\*\*Payment\*\*  
\- Stripe Checkout  
\- After successful payment: status becomes \`confirmed\`

\*\*Receipts\*\*  
\- Email receipt confirmation  
\- Booking details page shows:  
  \- paid amount  
  \- fee breakdown  
  \- cancellation summary

\*\*Primary emotion\*\*  
“Nice. This is structured and safe.”

\---

\#\#\# Stage F — Messaging & planning  
\*\*Messaging access\*\*  
\- Messaging is available once:  
  \- booking is \`accepted\` or \`confirmed\` (choose one; recommended: \`accepted\` to coordinate before payment, but guardrails needed)

\*\*Messaging features\*\*  
\- One thread per booking (context visible: dates, duration, reference)  
\- “Report” button always visible  
\- Lightweight reminders (“confirm meeting point”, “share key preferences”)

\*\*24h reminders\*\*  
\- Automated email reminder 24 hours before the tour:  
  \- time \+ meeting point  
  \- guide name  
  \- cancellation policy summary  
  \- link back to booking \+ messages

\*\*Primary emotion\*\*  
“Good — we’re aligned. I know where to go.”

\---

\#\#\# Stage G — Tour day → completion  
\*\*Completion triggers (v2 recommendation)\*\*  
\- Guide marks booking as \`completed\` after the tour  
\- Traveler can also “Confirm completed” (optional)  
\- Admin can override in disputes

\*\*Post-tour\*\*  
\- Booking moves to “Past bookings”  
\- Review prompt starts

\*\*Primary emotion\*\*  
“That was great — this felt respectful and safe.”

\---

\#\#\# Stage H — Reviews, rewards, retention  
\*\*Mutual reviews (double-blind)\*\*  
\- Traveler reviews guide  
\- Guide reviews traveler  
\- Reviews are hidden until \*\*both submit\*\* or a \*\*timeout window\*\* expires (recommended: 14 days)  
\- Once both submitted (or timeout):  
  \- reviews become visible on dashboards  
  \- guide review appears on guide public profile  
  \- traveler review appears on traveler public profile (limited visibility rules apply)

\*\*Retention loops\*\*  
\- “Rebook this guide”  
\- “Explore similar guides in this city”  
\- “Try another city”  
\- Optional: concierge upsell (soft, premium)

\*\*Primary emotion\*\*  
“I’d use this again.”

\---

\#\# 4\) Status model (traveler-visible)  
\- \`draft\` (optional internal)  
\- \`pending\` (awaiting guide decision)  
\- \`accepted\` (awaiting payment)  
\- \`confirmed\` (paid)  
\- \`declined\`  
\- \`cancelled\_by\_traveler\`  
\- \`cancelled\_by\_guide\`  
\- \`completed\`

\---

\#\# 5\) Edge cases & safety  
\- Off-platform payment requests → reportable violation  
\- Harassment / coercion → immediate suspension path  
\- Cancellations:  
  \- free until 48h before start  
  \- within 48h: policy rules (see Pricing & Fees spec)  
\- Refunds: admin override and reason codes logged

\---

\#\# 6\) Acceptance criteria (“Done means”)  
\- Guest → sign-up → returns to same context (city/guide/booking draft)  
\- Traveler onboarding captures language \+ currency \+ basic profile  
\- Traveler has \*\*private dashboard\*\* and \*\*public profile\*\* (Airbnb-like)  
\- Booking request flow → accepted → Stripe payment → confirmed works end-to-end  
\- Messaging exists per booking with report button  
\- 24h email reminders are sent  
\- Mutual reviews are double-blind with reveal rules  
\- Past bookings \+ rebook flows exist

