\# Admin Product Specification (Admin / Moderator / Finance)

\*\*Doc ID:\*\* DOC-SPEC-ADMIN    
\*\*Audience:\*\* Product / Engineering / Ops / Trust & Safety / Finance    
\*\*Last updated:\*\* 2026-01-15    
\*\*Applies to:\*\* Admin console, moderation tools, ops workflows, configuration, CMS, analytics, logs, and integrations

\---

\#\# 0\) Why this spec exists

Admin is the trust \+ operations backbone. The admin console must:  
\- Protect access (2FA, RBAC, audit logs)  
\- Keep marketplace safe (verification, enforcement, incident management)  
\- Keep bookings and money flowing (refunds, payouts, fee settings)  
\- Enable growth (CMS, promos, SEO, analytics)  
\- Provide observability (logs, monitoring, alerts)

This spec turns your admin story list into a structured, shippable system.

\---

\#\# 1\) Admin roles & permission model (RBAC)

\#\#\# 1.1 Roles (minimum set)  
\- \*\*Admin\*\*: full access  
\- \*\*Moderator\*\*: verifications, reviews, safety reports, user enforcement, content moderation (no finance settings)  
\- \*\*Finance\*\*: payouts, refunds, fee settings, exports, commission reporting (no content edits unless granted)

\> Optional: Marketing role later, but you can model “Marketing” as Moderator+CMS permissions.

\#\#\# 1.2 Permissions (capabilities)  
\- \`users.read\`, \`users.write\`, \`users.suspend\`, \`users.ban\`  
\- \`guides.verify\`, \`guides.approve\`, \`guides.reject\`  
\- \`bookings.read\`, \`bookings.write\`, \`bookings.freeze\`  
\- \`payments.refund\`, \`payouts.read\`, \`fees.write\`  
\- \`reviews.moderate\`, \`reports.manage\`  
\- \`cms.write\`, \`cms.publish\`, \`cms.approve\`  
\- \`analytics.read\`, \`exports.create\`  
\- \`integrations.manage\`, \`settings.manage\`  
\- \`logs.read\`, \`alerts.manage\`  
\- \`impersonation.readonly\`  
\- \`audit.read\`

\#\#\# 1.3 RBAC acceptance checks  
\- Every route/action checks permission server-side  
\- UI hides actions user cannot perform  
\- All privileged actions are logged to audit trails with actor \+ reason

\---

\#\# 2\) Security & access control

\#\#\# 2.1 Admin login \+ 2FA  
\*\*User stories\*\*  
\- Secure admin login with 2FA  
\- Enforce 2FA for all admins

\*\*v2 requirements\*\*  
\- Admin-only \`/admin\` route protected by role \+ permission checks  
\- 2FA methods (choose one for v2, expand later):  
  \- TOTP (recommended)  
  \- WebAuthn (later)  
\- Recovery codes (recommended)

\*\*Acceptance checks\*\*  
\- No admin access without 2FA once enforced  
\- “Remember device” optional but time-limited  
\- 2FA enforcement can be toggled globally by Admin role

\#\#\# 2.2 Password reset  
\- Reset via secure email link (admin and non-admin, but admin flow must be hardened)  
\- Rate limiting \+ logging for suspicious attempts

\*\*Acceptance checks\*\*  
\- Reset links expire  
\- All login/reset attempts appear in system logs

\---

\#\# 3\) Admin information architecture (IA)

\#\#\# 3.1 Admin console routes (recommended)  
\- \`/admin\` Overview dashboard  
\- \`/admin/users\` Users list (travelers \+ guides)  
\- \`/admin/users/\[id\]\` User detail  
\- \`/admin/guides\` Guide verification queue  
\- \`/admin/guides/\[id\]\` Guide application detail  
\- \`/admin/bookings\` Bookings list  
\- \`/admin/bookings/\[id\]\` Booking detail  
\- \`/admin/reviews\` Reviews moderation  
\- \`/admin/reports\` Safety reports / incident cases  
\- \`/admin/refunds\` Refunds & disputes (may be integrated into bookings)  
\- \`/admin/payouts\` Payouts and revenue summaries  
\- \`/admin/analytics\` KPI dashboards \+ segmentation  
\- \`/admin/content\` CMS dashboard (homepage/cities/FAQ/blog/media)  
\- \`/admin/promos\` Promo codes \+ banners \+ popups  
\- \`/admin/settings\` Global settings (fees, policies, locales, currencies, rollout)  
\- \`/admin/integrations\` Stripe keys, analytics IDs, SMTP/Resend, pixels  
\- \`/admin/logs\` System logs (auth, errors, webhooks)  
\- \`/admin/audit\` Audit trails  
\- \`/admin/alerts\` Monitoring \+ thresholds \+ notifications  
\- \`/admin/backups\` Backup exports (manual download)

\#\#\# 3.2 Navigation  
\- Left sidebar with sections:  
  \- Operations (Users, Guides, Bookings, Reports)  
  \- Money (Refunds, Payouts, Fees)  
  \- Content (CMS, Blog, Media, Promos)  
  \- Analytics (KPIs, Reports, Exports)  
  \- System (Integrations, Logs, Alerts, Audit, Backups, Settings)

\---

\#\# 4\) Overview dashboard (ops cockpit)

\*\*User stories\*\*  
\- View activity summary (active users, pending verifications, bookings)  
\- KPIs: sign-ups, actives, verified guides, request volume, accept rate, revenue

\#\#\# Requirements  
Dashboard widgets (minimum viable):  
\- \*\*Today / 7d / 30d\*\* overview:  
  \- sign-ups  
  \- active users  
  \- booking requests  
  \- accept rate  
  \- GMV \+ platform revenue  
\- Queues:  
  \- pending guide verifications  
  \- unresolved safety reports  
  \- refunds awaiting decision  
  \- failed payments/webhooks (if tracked)  
\- “Recent activity” feed:  
  \- approvals/rejections  
  \- bans/suspensions  
  \- refund actions  
  \- major content publishes

\*\*Acceptance checks\*\*  
\- Each widget links to filtered list view (1-click drilldown)  
\- Filters persist across navigation

\---

\#\# 5\) User management (travelers \+ guides)

\*\*User stories\*\*  
\- Search/filter users by name/email/city/status  
\- View profile, booking history, verification state  
\- Suspend/deactivate with reason  
\- Restore suspended users  
\- Ban permanently; prevent re-registration via email/IP

\#\#\# 5.1 Users list  
Columns:  
\- name, email, role, city (if guide), status, created date, last active, flags count

Filters:  
\- role (traveler/guide/admin/moderator/finance)  
\- status (active/suspended/banned/pending verification)  
\- city  
\- flagged/safety incidents  
\- date range

Actions:  
\- open detail  
\- suspend  
\- ban  
\- restore

\*\*Acceptance checks\*\*  
\- Actions require reason code \+ note  
\- All actions recorded in audit trails

\#\#\# 5.2 User detail view  
Tabs:  
\- Profile  
\- Bookings history  
\- Messages (read-only access, gated by permission \+ purpose)  
\- Reviews  
\- Safety reports  
\- Admin notes \+ moderation history

\*\*Acceptance checks\*\*  
\- Admin can see full history but sensitive data is minimized  
\- Access to messages is logged (for privacy compliance)

\#\#\# 5.3 Enforcement model  
Statuses:  
\- \`active\`  
\- \`suspended\` (temporary)  
\- \`banned\` (permanent)

Ban controls:  
\- email hash block (recommended)  
\- IP block (optional; be careful with false positives)  
\- device fingerprinting (later)

\*\*Acceptance checks\*\*  
\- Banned users cannot sign up again using same email  
\- Suspended users cannot book/message (role-based enforcement)

\---

\#\# 6\) Guide verification & onboarding approvals

\*\*User stories\*\*  
\- View pending applications with ID/documents  
\- Inspect ID photo, bio, notes  
\- Approve triggers welcome email  
\- Reject with notes for correction  
\- Flag suspicious accounts for re-verification

\#\#\# 6.1 Verification queue  
Queue shows:  
\- guide name \+ city  
\- verification state (submitted/pending/changes requested)  
\- completeness score (optional)  
\- Connect/KYC status (Stripe)  
\- flags (duplicate, suspicious behavior)

\#\#\# 6.2 Application detail  
Sections:  
\- Profile preview (public-facing)  
\- Verification materials (ID/documents if used)  
\- Stripe verification status (if used)  
\- Admin notes  
\- Decision panel:  
  \- Approve  
  \- Reject  
  \- Request changes  
  \- Flag for re-verification

Decision requires:  
\- reason code  
\- optional notes to guide

\*\*Acceptance checks\*\*  
\- Only authorized roles can view sensitive docs  
\- Approval publishes guide into listings  
\- Approval triggers automated welcome email  
\- Reject/request changes sends clear notes and keeps guide unlisted

\---

\#\# 7\) Bookings management (platform-wide)

\*\*User stories\*\*  
\- View all bookings with filters  
\- Open booking details: user info, messages, payment logs  
\- Manually update statuses  
\- Freeze a booking and disable chat  
\- Trigger refunds with preset options \+ notes

\#\#\# 7.1 Bookings list  
Filters:  
\- status  
\- city  
\- guide  
\- traveler  
\- date range  
\- payment status  
\- flagged cases

Columns:  
\- booking id  
\- city  
\- guide  
\- traveler  
\- start date/time  
\- status  
\- payment status  
\- amount  
\- created at

\#\#\# 7.2 Booking detail  
Sections:  
\- booking timeline (status history)  
\- traveler \+ guide summary cards  
\- pricing breakdown (gross, traveler fee, platform commission)  
\- payment events (Stripe checkout/payment intent summary)  
\- messages thread (read-only) with “disable chat” toggle (freeze)  
\- dispute/refund panel  
\- internal notes

Admin actions:  
\- update status (guardrails)  
\- freeze booking (locks changes; disables chat)  
\- refund preset: 25% / 50% / 100%  
\- add decision note \+ reason code

\*\*Acceptance checks\*\*  
\- Status changes require reason \+ are logged  
\- Freezing disables chat and prevents new messages  
\- Refund actions create traceable record \+ are synced with Stripe when live

\---

\#\# 8\) Refunds, disputes, and policy rules

\*\*User stories\*\*  
\- Edit cancellation/refund rules  
\- Publish updated rules instantly \+ email updates  
\- Export records for accounting

\#\#\# 8.1 Refund policy engine (configurable)  
Default policy described:  
\- ≥48h: full refund  
\- 24–48h: 50% refund  
\- \<24h: no refund

Config fields:  
\- thresholds (hours)  
\- refund percentages  
\- whether platform fee refundable  
\- exceptions (no-show, safety incident, admin override)

\*\*Acceptance checks\*\*  
\- Policy changes are versioned and timestamped  
\- Users see policy version on booking confirmation pages  
\- Policy change emails are triggered (with opt-out rules respected)

\#\#\# 8.2 Dispute workflow states  
\- \`opened\`  
\- \`in\_review\`  
\- \`resolved\_refunded\`  
\- \`resolved\_denied\`  
\- \`escalated\`

\*\*Acceptance checks\*\*  
\- Every decision requires reason code \+ note  
\- Booking can be frozen during disputes

\---

\#\# 9\) Payouts, revenue, and fee configuration

\*\*User stories\*\*  
\- Aggregated commission revenue per week/month  
\- Configure commission % and traveler service fees  
\- Minimum booking charges  
\- View scheduled payout dates and payout records  
\- Export payout records

\#\#\# Requirements  
\- Revenue dashboard:  
  \- GMV  
  \- traveler fees collected  
  \- platform commission collected  
  \- refunds netted  
\- Fee settings:  
  \- platform commission %  
  \- traveler service fee %  
  \- minimum traveler fee amount  
\- Payouts view:  
  \- guide payouts scheduled/paid  
  \- failures/delays  
  \- Stripe Connect health summary

\*\*Acceptance checks\*\*  
\- Fee changes apply only to new bookings after effective date  
\- Financial exports are consistent and reconciliable

\---

\#\# 10\) Reviews moderation & history

\*\*User stories\*\*  
\- Moderate reviews by date/flag count  
\- Hide/delete/restore reviews  
\- See moderation history and actor

\#\#\# Requirements  
\- Reviews list:  
  \- filters: flagged, city, guide, date range, severity  
\- Actions:  
  \- hide (soft remove)  
  \- delete (hard remove; requires higher permission)  
  \- restore  
\- History:  
  \- who acted, when, why

\*\*Acceptance checks\*\*  
\- All moderation actions are auditable  
\- Restore returns review to prior visibility state

\---

\#\# 11\) Safety reports & incident cases

\*\*User stories\*\*  
\- Manage safety reports  
\- Tag resolved \+ follow-up notes  
\- Escalation workflow

\#\#\# Requirements  
\- Case management:  
  \- create case from booking or message report  
  \- severity levels (low/med/high/urgent)  
  \- assign to admin/moderator  
  \- status \+ notes  
\- Ability to:  
  \- freeze booking  
  \- suspend accounts involved  
  \- export case history (internal)

\*\*Acceptance checks\*\*  
\- Safety cases are separated from general tickets  
\- Access is restricted and logged due to sensitivity

\---

\#\# 12\) CMS \+ marketing operations (massive block)

You listed an extensive marketing CMS backlog. Treat as \*\*CMS module\*\* with approvals, scheduling, and rollback.

\#\#\# 12.1 CMS content areas  
\- Homepage:  
  \- hero copy, images, CTAs, testimonials, trust badges  
  \- featured cities/guides rotation  
  \- announcement banner  
  \- pop-ups (newsletter, promos) with display rules  
\- FAQs \+ How it Works blocks  
\- City pages:  
  \- localized intros, highlights, safety tips, keywords  
  \- city status: Active/Upcoming/Hidden  
  \- duplicate city template to launch faster  
\- Blog:  
  \- drafts/published/archived  
  \- categories and tags  
  \- scheduled publishing  
  \- media embeds (YouTube/social)  
  \- RSS feed output  
\- SEO:  
  \- meta title/description per page  
  \- structured metadata (OG/Twitter cards)  
  \- alt text and captions for accessibility  
  \- pre-publish checks (SEO/accessibility)

\#\#\# 12.2 Content workflow (approval \+ scheduling \+ rollback)  
Roles:  
\- Editor submits changes  
\- Approver publishes

States:  
\- \`draft\`  
\- \`pending\_approval\`  
\- \`scheduled\`  
\- \`published\`  
\- \`archived\`

Features:  
\- preview mode (staging preview)  
\- schedule go-live  
\- rollback to previous version  
\- changelog with author and timestamp

\*\*Acceptance checks\*\*  
\- Non-admin editors cannot publish without approval (if enabled)  
\- Publishing creates changelog entry  
\- Rollback is one-click and logged

\---

\#\# 13\) Promotions & growth controls

\*\*User stories\*\*  
\- Promo codes with expiry, usage limits, percentage/flat discounts  
\- Feature guides/cities  
\- Bulk re-engagement emails  
\- Affiliate landing pages \+ referral tracking

\#\#\# v2 (practical minimum)  
\- Promo codes:  
  \- code, type (%/flat), expiry, usage limit, active flag  
\- Featured guides/cities toggles

\#\#\# v2.1+  
\- A/B testing controls  
\- Affiliate payout management  
\- Campaign scheduling and segmentation

\*\*Acceptance checks\*\*  
\- Promo validation is reliable at checkout  
\- Expired/overused codes fail gracefully with clear messages

\---

\#\# 14\) Analytics, reporting, exports, and scheduled summaries

\*\*User stories\*\*  
\- KPIs and filters by city/month/category  
\- Export analytics CSV/PDF  
\- Schedule weekly/monthly summaries to email  
\- Track which blog articles generate bookings/signups

\#\#\# Requirements  
Dashboards:  
\- funnel metrics (visit → city → guide → request → accept → paid)  
\- accept rate by city/guide  
\- revenue by city  
\- content performance (blog → bookings)

Exports:  
\- CSV for accounting and analytics  
\- PDF reports (optional)

Scheduled reporting:  
\- weekly summary email  
\- monthly summary email  
\- configurable recipients (admins)

\*\*Acceptance checks\*\*  
\- Scheduled emails respect admin notification preferences (but are admin-only)  
\- Exports include filters and timestamp ranges

\---

\#\# 15\) System logs, monitoring, and alerts

\*\*User stories\*\*  
\- View system logs (login attempts, API errors, webhooks)  
\- Filter logs by date/severity  
\- Track uptime/latency/errors via monitoring  
\- Alerts when bookings drop or payments fail

\#\#\# Requirements  
Logs module:  
\- auth events  
\- webhook events (Stripe)  
\- email delivery events (Resend)  
\- API errors \+ server errors  
\- moderation access logs (who read messages)

Monitoring module:  
\- uptime checks  
\- latency percentiles  
\- error rate  
\- webhook failure rate

Alerts:  
\- payments failing threshold  
\- booking requests below baseline  
\- webhook backlog  
\- email delivery failures

\*\*Acceptance checks\*\*  
\- Admin can filter logs and export subsets  
\- Alerts can route to email (and Slack later)

\---

\#\# 16\) Integrations & system settings

\*\*User stories\*\*  
\- Manage integrations (Stripe keys, analytics IDs, SMTP)  
\- Manage supported currencies/languages/default locale  
\- Manage payment gateways  
\- Consent banner configuration

\#\#\# Requirements  
Integrations panel:  
\- Stripe (publishable/secret keys; webhook secrets)  
\- Analytics IDs (GA4, Search Console verification, Meta Pixel)  
\- Email provider (Resend/SMTP settings)  
\- CRM/newsletter tool connection

System settings:  
\- supported currencies  
\- supported languages  
\- default locale  
\- cookie consent behavior  
\- feature flags

\*\*Acceptance checks\*\*  
\- Secrets are never displayed in plaintext after initial entry  
\- Changes are versioned and audited

\---

\#\# 17\) Impersonation (read-only)

\*\*User story\*\*  
\- Impersonate traveler/guide (read-only) for troubleshooting

\#\#\# Requirements  
\- Admin can view UI “as user” without performing actions  
\- Any access is logged  
\- Clear banner “Impersonating (read-only)”

\*\*Acceptance checks\*\*  
\- No destructive actions possible in impersonation mode  
\- Impersonation is auditable

\---

\#\# 18\) Audit trails & compliance

\*\*User stories\*\*  
\- Access audit trails for all admin actions

\#\#\# Requirements  
Every privileged action logs:  
\- actor (admin id)  
\- action type  
\- target entity id  
\- timestamp  
\- reason code  
\- optional note  
\- before/after diff (where feasible)

\*\*Acceptance checks\*\*  
\- Audit log is immutable  
\- Audit log is searchable and exportable

\---

\#\# 19\) Page-to-page flow map (what leads to what)

\#\#\# Typical ops flows  
\- \`/admin\` → “Pending verifications” → \`/admin/guides?status=pending\`  
  → open application → approve/reject → email triggered → audit logged

\- \`/admin/bookings\` → open booking → view messages/payment  
  → freeze → refund preset → notes → audit logged

\- \`/admin/reviews\` → filter flagged → hide/remove → history updated

\- \`/admin/content\` → edit homepage block → preview → submit for approval  
  → publish/schedule → changelog → rollback if needed

\- \`/admin/settings\` → update fee policy → publish policy update → email users

\---

\#\# 20\) “Done means” checklist (v2 launch)

Admin console is v2-ready when:  
\- Admin access is protected by RBAC and 2FA enforcement (at least TOTP)  
\- Users list supports search/filter/detail \+ suspend/restore/ban with reasons  
\- Guide verification queue supports inspect \+ approve/reject/request changes \+ welcome email  
\- Booking management supports global list \+ detail \+ status updates \+ refund presets \+ freeze chat  
\- Reviews moderation exists with hide/restore \+ actor history  
\- Safety reports module exists with case states and escalation options  
\- Fee settings exist (commission, traveler fee, minimums) with effective dates  
\- Revenue summaries exist (weekly/monthly) and export works  
\- CMS supports editing core marketing content with preview and publish (full approval workflow can be v2.1)  
\- Logs and audit trails exist for all privileged actions

\---

\#\# 21\) Open questions to lock (so engineering doesn’t guess)

1\) \*\*2FA implementation (v2)\*\*  
   \- A) TOTP \+ recovery codes (recommended)  
   \- B) WebAuthn only  
   \- C) Both

2\) \*\*RBAC granularity\*\*  
   \- A) 3 roles (Admin/Moderator/Finance) with permissions map (recommended)  
   \- B) Many roles (Marketing, Support, Ops, etc.) immediately

3\) \*\*Ban enforcement\*\*  
   \- A) email hash ban only (recommended)  
   \- B) email \+ IP ban  
   \- C) email \+ IP \+ device fingerprint (later)

4\) \*\*CMS scope in v2\*\*  
   \- A) Homepage \+ cities \+ blog basics (recommended)  
   \- B) Full marketing suite \+ approvals \+ scheduling \+ rollback in v2

5\) \*\*Refund engine\*\*  
   \- A) preset refunds only \+ notes (v2 recommended)  
   \- B) fully configurable rule engine v2

6\) \*\*Freeze booking behavior\*\*  
   \- A) disable chat \+ block changes (recommended)  
   \- B) disable chat only

7\) \*\*Impersonation\*\*  
   \- A) read-only in v2 (recommended)  
   \- B) full impersonation (high risk)

