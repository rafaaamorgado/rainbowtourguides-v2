\# Concierge Page Spec (/concierge)

\*\*Doc ID:\*\* DOC-CONCIERGE-PAGE     
\*\*Audience:\*\* Product / Design / Engineering / Ops    
\*\*Last updated:\*\* 2026-01-15

\---

\#\# 1\) Goal

Introduce RTG Concierge as a premium planning service and capture qualified leads, while keeping the marketplace (guides) as the primary transactional engine.

\---

\#\# 2\) Primary user stories

\- Visitor: “I want someone to plan my trip safely and thoughtfully.”  
\- Traveler: “I’m overwhelmed; I want a done-for-me itinerary and vetted options.”  
\- Ops: “I need structured intake so I can fulfill manually in v2.”

\---

\#\# 3\) Key decisions

\- Canonical URL: \*\*/concierge\*\*  
\- Concierge is \*\*marketed at v2 launch\*\*  
\- Fulfillment: \*\*manual in v2\*\*, systematized later

\---

\#\# 4\) Page IA (sections)

1\) \*\*Hero\*\*  
   \- Headline: “Concierge travel planning, built for LGBTQ+ peace of mind.”  
   \- Subhead: clarify what they get (itinerary \+ safety \+ vetted recommendations)  
   \- CTAs:  
     \- Primary: “Request concierge planning”  
     \- Secondary: “Browse guides” (routes to /cities)

2\) \*\*How it works (3 steps)\*\*  
   1\. Tell us your dates and vibe  
   2\. We propose a plan \+ options  
   3\. You travel with confidence

3\) \*\*What’s included\*\*  
   \- Safety considerations (calm, non-alarmist)  
   \- Neighborhood guidance  
   \- Curated recommendations (food, culture, queer-friendly venues)  
   \- Optional guide bookings (via RTG marketplace)

4\) \*\*Who it’s for\*\*  
   \- Solo travelers, couples, first-time LGBTQ+ destinations, “busy professionals”

5\) \*\*Pricing\*\*  
   \- v2 default: show starting price (“from $X”) or “request pricing”  
   \- Decision needed: fixed packages vs custom quotes (see Open Questions)

6\) \*\*Intake form\*\*  
   \- Inline form or modal; must be easy and calm  
   \- After submit: confirmation screen \+ email confirmation

7\) \*\*Trust\*\*  
   \- Safety posture, values, boundaries  
   \- “Not a hookup service” (subtle but explicit)

8\) \*\*FAQ\*\*  
   \- turnaround time, refunds, what concierge is/isn’t, how guide booking works

\---

\#\# 5\) Intake form (fields)

\*\*Required\*\*  
\- Name  
\- Email  
\- Destination city/country (free text \+ optional dropdown of supported cities)  
\- Dates (start/end)  
\- Party type (solo / couple / group)  
\- Interests (multi-select: culture, food, nightlife, nature, queer history, etc.)  
\- Budget comfort (range)  
\- Notes (free text)

\*\*Optional\*\*  
\- Accessibility needs  
\- Language preference  
\- “Are you also interested in booking a private guide?” (yes/no)

\---

\#\# 6\) Data model (minimal viable)

Option A (fast): store in Supabase table \`concierge\_requests\`  
\- id (uuid)  
\- created\_at  
\- name  
\- email  
\- destination  
\- start\_date, end\_date  
\- party\_type  
\- interests (text\[\])  
\- budget\_range  
\- notes  
\- status (new, contacted, in\_progress, delivered, closed)  
\- assigned\_to (admin user id)  
\- internal\_notes (text)

\---

\#\# 7\) Ops workflow (v2 manual)

1\) New request created → admin notified (email \+ admin dashboard)  
2\) Admin reviews and contacts user (email or in-platform if traveler account exists)  
3\) Admin updates status \+ internal notes  
4\) Deliver plan as PDF/email (v2), later inside dashboard

\---

\#\# 8\) Analytics

Track:  
\- Page views  
\- Form start → submit conversion  
\- Lead volume by destination  
\- Lead quality proxy: budget \+ length \+ interests  
\- Downstream: % concierge leads who also book guides

\---

\#\# 9\) Acceptance criteria (“Done means”)

\- /concierge is live, styled, and consistent with premium calm brand  
\- Intake form submits and persists a record  
\- User sees a confirmation state and receives an email confirmation  
\- Admin can view a list of concierge requests, update status, add notes  
\- Basic tracking events exist (page view, submit)

\---

\#\# 10\) Open questions

1\) Pricing model for concierge at v2 launch:  
   \- Package tiers (e.g., Lite / Standard / Premium), or  
   \- “Request pricing” \+ manual quote?  
2\) Turnaround time promise (e.g., 48 hours) and whether it differs by package.

