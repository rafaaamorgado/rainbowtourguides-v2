\# Guide Onboarding Spec (including verification workflow)

\*\*Doc ID:\*\* DOC-SPEC-GUIDE-ONBOARD    
\*\*Audience:\*\* Product / Design / Engineering / Ops    
\*\*Last updated:\*\* 2026-01-15

\---

\#\# 1\) What the guide should feel

A guide should feel:  
\- \*\*Respected\*\*: “This is professional, not sleazy.”  
\- \*\*Protected\*\*: “The platform has my back.”  
\- \*\*In control\*\*: “I set my availability and boundaries.”  
\- \*\*Confident\*\*: “Payments are secure and predictable.”

North-star outcome:  
A guide can onboard quickly, verify identity, get approved, appear in listings, accept bookings, run tours, get paid, and build reputation.

\---

\#\# 2\) Guide eligibility (official)

We accept:  
\- \*\*LGBTQ+ guides\*\*, and  
\- \*\*LGBTQ+-friendly / queer-affirming guides\*\*

Eligibility is based on \*\*behavior and standards\*\*, not identity proof.  
Guides must:  
\- agree to the Code of Conduct and non-discrimination standards  
\- pass identity verification  
\- pass manual review (Rafa \+ Alan at launch)  
\- maintain professional positioning (no sexual services; no “rent-a-friend” framing)

\---

\#\# 3\) System states (guide lifecycle)

\- \`draft\` (onboarding in progress)  
\- \`submitted\` (awaiting admin review)  
\- \`changes\_requested\`  
\- \`approved\` (listed)  
\- \`rejected\`  
\- \`suspended\` (post-approval enforcement)

\---

\#\# 4\) Profile model (private \+ public)

Guides have:  
1\) \*\*Private guide dashboard\*\* (manage bookings, availability, payouts)  
2\) \*\*Public guide profile\*\* (marketplace listing \+ conversion)

Public profile must include:  
\- main profile photo (thumbnail)  
\- up to 4 photos total (gallery)  
\- name \+ city  
\- bio \+ “what we’ll do”  
\- specialties/tags  
\- languages  
\- pricing (4/6/8h)  
\- availability snapshot  
\- reviews and rating  
\- verified indicator (once approved and verified)

\---

\#\# 5\) Onboarding wizard (v2)

\#\#\# Step 1 — Account & basics  
Fields:  
\- display\_name  
\- city (primary)  
\- languages (multi-select)  
\- short intro (“Why I guide”)

Uploads:  
\- Profile photos: \*\*up to 4\*\*  
  \- 1 required main photo (thumbnail)  
  \- 0–3 additional gallery photos

Validation:  
\- main photo required  
\- basic fields required

\---

\#\#\# Step 2 — Alignment & standards  
Required checkboxes:  
\- “I provide LGBTQ+ affirming experiences.”  
\- “I follow RTG boundaries and Code of Conduct.”  
\- “I will not offer sexual services or imply them on the platform.”

Required short answers:  
\- “Why I enjoy guiding LGBTQ+ travelers”  
\- “What travelers can expect from me (tone \+ vibe)”

\---

\#\#\# Step 3 — Specialties & experience design  
Inputs:  
\- specialties tags: culture, food, nightlife, queer history, nature, hidden gems, etc.  
\- “What we’ll do” (structured paragraph)  
\- neighborhoods / areas covered (optional)  
\- comfort categories (optional v2): solo-friendly, couples-friendly, low-key, nightlife

Goal:  
Make the guide easy to match without turning the profile into a novel.

\---

\#\#\# Step 4 — Rates & durations  
Inputs:  
\- 4h / 6h / 8h prices  
\- currency (default from city; editable)  
\- optional “extra hour rate” (if enabled in v2)  
\- what’s included (bullets)  
\- what’s not included (bullets; e.g., tickets, meals)

Validation:  
\- non-negative  
\- minimums configurable by ops (per city if needed)

\---

\#\#\# Step 5 — Availability & blackout dates  
Inputs:  
\- weekly availability (days \+ time windows)  
\- blocked dates (calendar style)  
\- notes (flexibility guidance)

Rules:  
\- availability must be visible as a \*\*snapshot\*\* on public profile  
\- travelers choose a date/time; guide can accept/decline

\---

\#\#\# Step 6 — Identity & verification (Stripe-first)  
\*\*Primary mechanism (recommended canonical): Stripe Connect identity\*\*  
\- Guide completes Stripe Connect Express onboarding  
\- Stripe performs KYC/identity checks required for payouts  
\- Platform stores Stripe account status \+ requirements

\*\*Why Stripe-first\*\*  
\- It aligns verification with payouts  
\- It’s operationally scalable  
\- It supports global KYC variability

\*\*Supplemental documents (optional)\*\*  
\- If ops wants extra safety assurance in some cities, allow additional doc upload:  
  \- government ID image  
  \- proof of address (optional)

Docs storage rules:  
\- private storage bucket  
\- admin-only access  
\- access logged in admin audit trail

\---

\#\#\# Step 7 — Review & submit  
\- Show onboarding summary  
\- Guide submits  
\- State becomes \`submitted\`  
\- Guide sees: “Thanks — we’re reviewing your profile”

\---

\#\# 6\) Admin review workflow (v2 manual ops)

\#\#\# Admin review checklist  
\- profile completeness  
\- tone \+ positioning (no sexualized framing)  
\- photos quality and appropriateness  
\- specialties and clarity of experience  
\- availability plausibility  
\- verification status:  
  \- Stripe Connect: not\_started / in\_progress / complete / restricted  
  \- supplemental docs (if used): readable and consistent

\#\#\# Admin actions  
\- \*\*Approve\*\* → state \`approved\` → guide becomes visible in listings  
\- \*\*Request changes\*\* → state \`changes\_requested\` with reason \+ requested edits  
\- \*\*Reject\*\* → state \`rejected\` with reason code \+ internal notes  
\- \*\*Suspend\*\* (post-approval) → immediate delisting \+ booking controls

\#\#\# Reason codes (required)  
\- verification incomplete / restricted  
\- ID/doc unreadable or mismatch (if supplemental used)  
\- profile sexualized / escort-like positioning  
\- discriminatory or hostile language  
\- inconsistent identity/location claims  
\- refusal to comply with policies

\---

\#\# 7\) Bookings & messaging (guide-side experience)

\#\#\# Booking intake  
When traveler requests a booking:  
\- guide receives notification (email \+ dashboard)  
\- guide sees traveler summary \+ traveler public profile (limited)  
\- guide accepts or declines

\#\#\# After acceptance  
\- request-model:  
  \- status becomes \`accepted\`  
  \- traveler is prompted to pay  
  \- once paid → \`confirmed\`  
\- chat thread becomes available (recommended at \`accepted\`, with guardrails)

\#\#\# Tour day operations  
\- 24h reminder email to guide (time \+ meeting point \+ traveler name)  
\- guide uses chat for final coordination

\#\#\# Completion  
\- guide marks booking as \`completed\`  
\- payout eligibility starts after the 48h cooldown (per payout rules)

\---

\#\# 8\) Reviews (mutual \+ double-blind)

\- Guide reviews traveler  
\- Traveler reviews guide  
\- Reviews are hidden until both submit or timeout window expires (recommended: 14 days)  
\- Once revealed:  
  \- guide reviews appear on guide public profile  
  \- traveler reviews appear on traveler public profile (if enabled) with privacy controls

\---

\#\# 9\) Payout requirements (Stripe Connect)

\- Guide cannot receive payouts unless Stripe Connect is complete  
\- If booking occurs while Connect incomplete:  
  \- allow booking (optional), but warn clearly: “Complete payouts setup to receive earnings.”

\---

\#\# 10\) Security & privacy requirements

\- Private storage for sensitive docs  
\- RLS: guides can only edit their own profile/availability  
\- Admin access is role-gated and audited  
\- Photos are public; verification documents are never public

\---

\#\# 11\) Acceptance criteria (“Done means”)

\- Guide can complete onboarding in \<10 minutes with clear progress steps  
\- Supports \*\*up to 4 profile photos\*\* with one main thumbnail  
\- Guide has both \*\*private dashboard\*\* and \*\*public profile\*\*  
\- Stripe Connect onboarding is integrated and status is tracked  
\- Admin can approve/reject/request changes with reason codes  
\- Approved guide appears in city listings and can receive requests  
\- Mutual reviews with double-blind reveal rules are implemented  
\- 24h reminders exist for guide \+ traveler

