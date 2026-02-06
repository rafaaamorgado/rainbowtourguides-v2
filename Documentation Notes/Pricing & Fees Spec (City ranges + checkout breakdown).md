\# Pricing & Fees Spec (City ranges \+ checkout breakdown)

\*\*Doc ID:\*\* DOC-SPEC-PRICING-FEES    
\*\*Audience:\*\* Product / Design / Engineering / Ops    
\*\*Last updated:\*\* 2026-01-15

\---

\#\# 1\) Goals

\- Make pricing feel premium and transparent  
\- Reduce booking friction by setting expectations early  
\- Show fees clearly at checkout without feeling “nickel-and-dimed”  
\- Enable consistent cancellation/refund behavior

\---

\#\# 2\) Pricing primitives

\#\#\# Guide prices  
\- Guide sets base prices for durations: 4h / 6h / 8h  
\- Currency default per city (configurable)  
\- Optional: extra-hour rate (v2 optional)

\#\#\# Platform fees (targets)  
\- Platform commission on guide earnings: \~18–22%  
\- Traveler service fee: \~8–12% (added at checkout)

\---

\#\# 3\) City pricing ranges (public on city pages)

\#\#\# What we display  
On \`/cities/\[slug\]\` show:  
\- \*\*Typical private tour range:\*\* €X–€Y  
\- Optional: “Most bookings around: €Z”  
\- Note: “Final price depends on duration, season, and availability.”

\#\#\# How we compute (v2)  
Using active approved guides in that city:  
\- For each guide: compute “starting price” \= min(4h,6h,8h)  
\- City range:  
  \- X \= 25th percentile (or min if low sample)  
  \- Y \= 75th percentile (or max if low sample)  
\- Optional Z \= median

\#\#\# Small sample rules  
\- If \< 3 guides: show “Typical starting from €X” only  
\- If 3–5 guides: use min/max  
\- If \> 5 guides: use percentiles

\---

\#\# 4\) Guide profile pricing display

On \`/guides/\[slug\]\` show:  
\- Clean table for 4h / 6h / 8h  
\- What’s included (short bullets)  
\- Clear CTA: Request booking / Book now

\---

\#\# 5\) Checkout fee presentation

\#\#\# Requirements  
At payment step show:  
\- Guide price (base)  
\- Traveler service fee (line item)  
\- Total  
\- Refund/cancellation summary (short)

\#\#\# Copy style  
\- Calm and direct:  
  \- “Service fee supports verification, secure payments, and support.”  
\- No guilt language; no tiny-print vibes.

\---

\#\# 6\) Cancellation & refunds (v2)

\#\#\# Policy baseline  
\- Free cancellation until 48 hours before start time  
\- Within 48h: apply policy (partial refund or no refund — decision needed)

\#\#\# Recommended v2 default (simple)  
\- \>48h: full refund (minus processing if needed)  
\- ≤48h: no refund (or 50% refund) — choose one for terms consistency

\#\#\# Operational notes  
\- Admin can issue manual refunds in Stripe for edge cases  
\- Always log refund reason codes

\---

\#\# 7\) Status model dependency

Pricing/fees are tied to booking status:  
\- \`pending\` / \`accepted\` (not paid) → no charge yet (request model)  
\- \`confirmed\` (paid) → fees captured  
\- \`cancelled\_\*\` → refund rules apply  
\- \`completed\` → eligible for payouts after 48h cooldown

\---

\#\# 8\) Payout logic (summary)

\- Guides are paid via Stripe Connect  
\- Payouts only for completed bookings  
\- 48h delay after completion before payout eligibility  
\- Weekly payout schedule

\---

\#\# 9\) Acceptance criteria (“Done means”)

\- City pages show typical ranges with correct sample-size behavior  
\- Guide profiles show clean duration pricing table  
\- Checkout shows clear itemization and total  
\- Cancellation and refund rules are implemented consistently in UI \+ terms  
\- Admin has tooling to override/refund with audit trail

\---

\#\# 10\) Open questions (needs a decision to finalize)  
1\) Within 48h cancellation rule:  
   \- No refund, OR  
   \- 50% refund?  
2\) Do we absorb Stripe processing fees on refunds, or pass them through?  
3\) Do we show taxes/VAT messaging now, or keep it “taxes may apply” for v2?

