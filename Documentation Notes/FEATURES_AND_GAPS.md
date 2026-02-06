# Rainbow Tour Guides v2 — Missing Features & Implementation Checklist

**As of January 29, 2026**

---

## Executive Summary

| Category | Count | Status |
|----------|-------|--------|
| **v2 Core Features** | 28 | 80% Complete |
| **Critical Gaps** | 5 | BLOCKING |
| **High Priority Gaps** | 8 | Must fix before launch |
| **Refactoring Opportunities** | 10 | Can defer to v2.1 |
| **v2.1 Features** (designed) | 12 | Ready to implement |

---

## Section 1: CRITICAL BLOCKING ISSUES (Fix Immediately)

### 1.1 🔴 Debug Routes Expose Sensitive Data

**Files to Delete:**
- ✗ `/app/test-connection/page.tsx` - Leaks Supabase auth state, query logs
- ✗ `/app/debug/auth/page.tsx` - Shows user email, JWT tokens
- ✗ `/app/api/debug/queries/route.ts` - Query debug endpoint

**Effort:** 15 minutes  
**Risk if not fixed:** CRITICAL - Security/privacy violation in production

---

### 1.2 🔴 Database Schema Misalignment

**Problem:** `types/database.ts` doesn't match actual `supabase-schema.sql`

**Mismatches Found:**
- `guides.price_4h` vs `guides.base_price_4h` (both exist - dual fields)
- `messages.text` vs `messages.body` (different names)
- `reviews.author_id` vs `reviews.traveler_id` (generic vs explicit)
- Missing tables: `travelers`, `experiences`, `availability_slots`, `admin_events`

**Effort:** 2 days  
**Impact:** Type safety compromised; adapters may fail at runtime

**Action Items:**
1. Decide: which is source of truth (database.ts or schema.sql)?
2. If schema is source: regenerate types from Supabase
3. If database.ts is source: update SQL schema
4. Update all adapters in `lib/adapters.ts`
5. Fix all queries in `lib/data-service.ts`
6. Test adapters with real data

---

### 1.3 🔴 Missing Password Reset Flow

**Missing Page:** `/auth/reset`  
**Current State:** Users with forgotten passwords are stuck

**Effort:** 1 day  
**Impact:** CRITICAL - Customer support burden

**Required Implementation:**
- Form page at `/auth/reset`
- Email-based reset token flow (Supabase built-in)
- Token verification page
- New password entry
- Test end-to-end

---

### 1.4 🔴 Email Verification Gate Unclear

**Current State:** Policy says "verify email before requesting"; implementation unclear

**Effort:** 0.5 days  
**Impact:** HIGH - Unverified users might bypass verification requirement

**Required Implementation:**
- Add explicit check before booking request submission
- Block request endpoint if email not verified
- Show clear messaging
- Add "Resend verification" button

---

### 1.5 🔴 Missing Refund Management Interface

**Missing Page:** `/admin/refunds`  
**Current State:** Admin has no way to process refunds

**Effort:** 2 days  
**Impact:** CRITICAL - Cancellations can't be honored

**Required Implementation:**
- Admin refunds list/dashboard
- Refund request approval workflow
- Stripe refund API integration
- Reason codes (no-show, guide request, traveler request, dispute)
- Audit logging
- Email notifications to traveler

---

## Section 2: HIGH PRIORITY GAPS (Ship ASAP)

### 2.1 Missing Admin Pages (7 pages total)

#### A) `/admin/reports` - Safety Incident Moderation

**Purpose:** Handle safety reports, review reports, message reports

**Features:**
- Report queue (open / in-progress / resolved)
- Report details with context
- Actions: dismiss, hide, request edit, contact reporter
- Audit trail

**Effort:** 1.5 days

---

#### B) `/admin/payouts` - Guide Payout History

**Purpose:** Review payouts sent to guides, reconciliation

**Features:**
- Payout history table
- Filter by guide, date range, status
- Stripe Connect balance
- Manual payout capability
- Export CSV for accounting

**Effort:** 1 day

---

#### C) `/admin/analytics` - KPI Dashboards

**Purpose:** Business intelligence and performance tracking

**Features:**
- GMV (Gross Merchandise Value)
- Take rate (commission collected)
- Active guides count
- Top cities by booking volume
- Booking completion rate
- Charts: revenue trend, booking trend, geographic distribution

**Effort:** 2 days

---

#### D) `/admin/settings` - Global Configuration

**Purpose:** Platform-wide settings without code changes

**Features:**
- Fee percentages (commission, service fee, tax)
- Supported currencies and locales
- Feature flags (instant book, saved methods, etc.)
- Verification requirements per city
- Refund policy terms

**Effort:** 1.5 days

---

#### E) `/admin/integrations` - Service Configurations

**Purpose:** Manage API keys and integrations

**Features:**
- Stripe keys (test/live mode toggle)
- Resend API key
- Analytics IDs (GA4, Sentry, PostHog)
- Webhook configuration
- Rate limiting settings

**Effort:** 1 day

---

#### F) `/admin/logs` - System & Audit Logs

**Purpose:** Debug issues and track all privileged actions

**Features:**
- Admin action logs (approve, reject, refund, suspend, etc.)
- Auth events (login, password reset, 2FA)
- API errors and exceptions
- Webhook events
- Filter and search

**Effort:** 1.5 days

---

#### Summary of Admin Pages

| Page | Purpose | Status | Effort |
|------|---------|--------|--------|
| `/admin` | Overview | ✅ Basic | - |
| `/admin/users` | User management | ✅ Complete | - |
| `/admin/guides` | Guide verification | ✅ Complete | - |
| `/admin/bookings` | Booking management | ✅ Complete | - |
| `/admin/reviews` | Review moderation | ⚠️ Partial | 1 day |
| `/admin/reports` | **MISSING** | ❌ | 1.5 days |
| `/admin/payouts` | **MISSING** | ❌ | 1 day |
| `/admin/analytics` | **MISSING** | ❌ | 2 days |
| `/admin/settings` | **MISSING** | ❌ | 1.5 days |
| `/admin/integrations` | **MISSING** | ❌ | 1 day |
| `/admin/logs` | **MISSING** | ❌ | 1.5 days |

**Total Admin Gap:** 9 days of work

---

### 2.2 Missing Public Pages

#### A) `/about` - Mission & Trust Page

**Purpose:** Build trust with visitors, explain company values

**Content:**
- Mission statement
- Team bio/photos
- Values (safety, respect, authenticity, etc.)
- Media mentions/press kit (if any)
- Social links

**Effort:** 1 day

---

#### B) `/contact` - Support Entry Point

**Purpose:** Allow visitors to reach out before signing up

**Features:**
- Contact form (name, email, subject, message)
- GDPR consent checkbox
- Email confirmation
- Routing to support email

**Effort:** 0.5 days

---

### 2.3 Missing Legal Pages

| Page | Status | Effort |
|------|--------|--------|
| `/legal/community-guidelines` | ❌ Missing | 0.5 days |
| `/legal/refund-policy` | ❌ Missing | 0.5 days |

**Total:** 1 day

---

### 2.4 Incomplete Core Features

#### A) Soft Walls (Visitor Gating) - Inconsistent

**Current State:** Pricing/reviews blurred for guests but inconsistent

**Missing:**
- Server-side enforcement (some endpoints not gated)
- Consistent unlock messaging
- Pricing display rules

**Effort:** 1 day

---

#### B) 24h Booking Reminders - Timing Unclear

**Current State:** Email template exists; trigger timing not documented

**Issues:**
- What time should reminder send (local or UTC)?
- What if booking is <24h in future?
- Timezone handling?
- How to prevent duplicates?

**Effort:** 0.5 days (testing + documentation)

---

#### C) Double-blind Review Reveal - Timeout Rules Unclear

**Current State:** Partial implementation

**Issues:**
- What's the reveal timeout (14 days documented)?
- What triggers automatic reveal?
- Can users withdraw review before reveal?

**Effort:** 0.5 days

---

#### D) Cancellation Policy Display - Not Shown Pre-booking

**Current State:** Policy mentioned in docs but not shown to traveler before booking

**Missing:**
- Show policy on booking form
- Show refund amount on cancellation screen
- Link to full refund policy

**Effort:** 0.5 days

---

---

## Section 3: MEDIUM PRIORITY GAPS (v2.1 or early v2.2)

### 3.1 Payment & Transactions

| Feature | v2 Status | v2.1 | Effort |
|---------|-----------|------|--------|
| Stored payment methods | ❌ | ✅ | 2 days |
| Auto-charge on acceptance | ❌ | ✅ | 1 day |
| Promo codes | ❌ | ✅ | 1 day |
| Local payment methods (MoMo, ZaloPay) | ❌ | ✅ | 2 days |
| PDF invoice download | ❌ | ✅ | 0.5 days |

**Total v2.1 Payment Work:** 6.5 days

---

### 3.2 Messaging & Coordination

| Feature | v2 Status | v2.1 | Effort |
|---------|-----------|------|--------|
| Image attachments | ❌ | ✅ | 1 day |
| Real-time messaging | ❌ | ✅ | 2 days |
| Voice messages | ❌ | ✅ | 2 days |

**Total v2.1 Messaging Work:** 5 days

---

### 3.3 Availability & Scheduling

| Feature | v2 Status | v2.1 | Effort |
|---------|-----------|------|--------|
| Counter-offer / propose changes | ❌ | ✅ | 2 days |
| Advanced calendar (day/week/month view) | ❌ | ✅ | 2 days |
| Drag-drop scheduling | ❌ | ✅ | 2 days |
| Calendar integration (ICS export) | ❌ | ✅ | 1 day |

**Total v2.1 Scheduling Work:** 7 days

---

### 3.4 User Management

| Feature | v2 Status | v2.1 | Effort |
|---------|-----------|------|--------|
| Block guides | ❌ | ✅ | 0.5 days |
| 2FA (TOTP + WebAuthn) | ❌ | ✅ | 2 days |
| Session management (sign out everywhere) | ❌ | ✅ | 1 day |
| Social sharing improvements | ⚠️ | ✅ | 1 day |

**Total v2.1 User Work:** 4.5 days

---

### 3.5 Analytics & Optimization

| Feature | v2 Status | v2.1 | Effort |
|---------|-----------|------|--------|
| Conversion analytics (GA4 integration) | ❌ | ✅ | 1 day |
| A/B testing framework | ❌ | ✅ | 1 day |
| Profile analytics (guide conversion) | ❌ | ✅ | 1 day |
| Search query analytics | ❌ | ✅ | 0.5 days |

**Total v2.1 Analytics Work:** 3.5 days

---

### 3.6 Platform Features

| Feature | v2 Status | v2.1 | Effort |
|---------|-----------|------|--------|
| Multi-day reservations | ❌ | ✅ Design ready | 3 days (UI) |
| Save guides (wishlist) | ❌ | ✅ | 1 day |
| Loyalty/status tiers | ❌ | ✅ | 2 days |
| Email digest/newsletter | ❌ | ✅ | 1 day |

**Total v2.1 Platform Work:** 7 days

---

**Total v2.1 Work:** ~33 days of effort (6-8 weeks for team of 2)

---

## Section 4: CODE QUALITY & MAINTAINABILITY (Non-Blocking)

### 4.1 Component Refactoring Opportunities

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Consolidate GuideCard (3 variants → 1) | High - reduce duplication | 1 day | Medium |
| Extract OnboardingWizard state (Context) | High - eliminate prop drilling | 2 days | Medium |
| Create Form Provider pattern | Medium - reduce boilerplate | 0.5 days | Low |
| Create Error Boundary | Medium - consistent error UI | 1 day | Low |
| Unify Loading Skeleton patterns | Low - consistency | 0.5 days | Low |

**Total Refactoring:** 5 days

---

### 4.2 Architecture Improvements

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Add E2E tests (Playwright) | High - booking flow confidence | 3 days | High |
| Add unit tests (data-service) | High - adapter correctness | 2 days | High |
| Add error monitoring (Sentry) | High - production debugging | 1 day | Medium |
| Database migration tooling | High - schema safety | 1 day | Medium |
| Image optimization (next/image) | Medium - performance | 0.5 days | Low |

**Total Architecture:** 7.5 days

---

### 4.3 Documentation & Process

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Document data flows | High - onboarding new devs | 1 day | Medium |
| Create runbook for admin operations | Medium - support efficiency | 1 day | Medium |
| Document booking state machine | Medium - consistency | 0.5 days | Low |
| Create deployment checklist | Medium - launch confidence | 0.5 days | Low |

**Total Documentation:** 3 days

---

---

## Section 5: DETAILED IMPLEMENTATION ROADMAP

### Phase 1: Pre-Launch Critical Fixes (1 Week)

**Week 1:**
- **Mon-Tue:** Remove debug routes + schema alignment (2 days)
- **Wed:** Password reset implementation (1 day)
- **Thu:** Email verification gate + refund management (2 days)
- **Fri:** Testing + final fixes (1 day)

**Blocker Resolution:** Ready for launch by end of week

**Owner:** 1 backend engineer + 1 full-stack engineer

---

### Phase 2: Admin Features & Public Pages (2 Weeks)

**Week 2:**
- **Mon-Tue:** Refund management + reports moderation (2 days)
- **Wed-Thu:** Analytics dashboard (2 days)
- **Fri:** Testing

**Week 3:**
- **Mon:** Settings + integrations pages (2 days)
- **Tue-Wed:** Logs page + audit trail (1.5 days)
- **Thu-Fri:** About + contact pages + soft wall polish (2 days)

**Owner:** 1 full-stack engineer

---

### Phase 3: Documentation & Soft Launch (1 Week)

**Week 4:**
- **Mon:** Documentation + runbooks
- **Tue-Wed:** User acceptance testing
- **Thu-Fri:** Production deployment + monitoring

**Owner:** 1 engineer + 1 product manager

---

### Phase 4: v2.1 Preparation (Starting Week 5)

**Focus Areas:**
1. Component consolidation (GuideCard, ProfileForm)
2. Create missing v2.1 tables
3. E2E test suite
4. Multi-day reservation design

**Owner:** Full team

---

---

## Section 6: Feature Priority Matrix

```
            EFFORT
        Low    Medium    High
      ┌──────────────────────┐
    H │ · Contact  · Reports │
    I │           · Refunds  │
    G │   · Password Reset   │
    H │      · Soft Wall     │
    P │                      │
    R │  ┌─────────────────┐ │
    I │  │ Blocking Issues │ │
    O │  │ · Debug Routes  │ │
    R │  │ · Schema Fix    │ │
    I │  │ · Email Gate    │ │
    T │  └─────────────────┘ │
    Y │                      │
      │    · Payout Page    │
      │    · Integrations   │
      │    · Analytics      │
    L │    · Logs Page      │
    O │                      │
    W │  · Settings Page    │
      └──────────────────────┘
```

---

## Section 7: Success Criteria

### Before Launch
- [ ] No debug routes in codebase
- [ ] database.ts matches schema exactly
- [ ] Password reset flow works end-to-end
- [ ] Email verification blocks bookings
- [ ] Admin can process refunds
- [ ] All admin pages implemented
- [ ] About/contact pages live
- [ ] Soft walls consistent
- [ ] 24h reminders send correctly
- [ ] Review reveal logic verified

### After Launch (v2.1 Readiness)
- [ ] E2E test coverage >80%
- [ ] Components consolidated
- [ ] v2.1 tables created
- [ ] Documentation complete
- [ ] Performance metrics baseline set
- [ ] Sentry monitoring live

---

## Appendix: Time Estimates Summary

| Category | Days | Team Size |
|----------|------|-----------|
| **Critical Fixes** | 5 | 2 engineers |
| **High Priority Gaps** | 9 | 1 engineer |
| **Public Pages** | 1.5 | 1 engineer |
| **Admin Pages** | 9 | 1 engineer |
| **Code Refactoring** | 5 | 1 engineer |
| **Architecture/Tests** | 7.5 | 1 engineer |
| **Documentation** | 3 | 1 engineer |
| **v2.1 Features** | 33 | 2 engineers (6-8 weeks) |
| **TOTAL v2 Launch** | ~30 days | 2 engineers (3-4 weeks) |

---

**Report Generated:** 2026-01-29  
**Next Review:** After Phase 1 completion
