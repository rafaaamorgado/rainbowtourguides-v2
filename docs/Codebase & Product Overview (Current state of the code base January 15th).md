# **Rainbow Tour Guides v2 — Codebase & Product Overview (Read‑Only Review)**

## **Current state of the code base January 15th**

## **1\) Product Summary (What the app is today)**

Rainbow Tour Guides v2 is a Next.js App Router application for a two‑sided marketplace connecting LGBTQ+ travelers with verified local guides. The product is structured around:

* Discovery: Marketing, city, and guide browsing pages.  
* Account & Role‑based dashboards: Separate experiences for travelers, guides, and admins.  
* Bookings & payments: Booking creation, Stripe checkout, and payment verification.  
* Messaging & reviews: Traveler/guide messaging and reviews tied to bookings.  
* Operational tools: Admin console for approvals and management.

---

## **2\) Technical Specifications & Architecture**

### **Framework & Runtime**

* Next.js 16 App Router with React 19 and TypeScript.  
* Server Components for most pages; client components for interactive UI (sidebars, forms).  
* Tailwind CSS 3 \+ shadcn/ui \+ Radix UI for styling and UI primitives.

### **Code Organization**

* app/ – Routes (pages, layouts, API endpoints, metadata).  
* components/ – UI components, forms, cards, and shared widgets.  
* lib/ – App‑level utilities: data access, adapters, auth helpers, Supabase clients, email, storage helpers.  
* supabase/ – Database schema, migrations, seeds.  
* types/ – Typed Supabase schema definitions.

### **Data Access Strategy**

The app uses a data service layer (lib/data-service.ts) that wraps Supabase queries and adapts results to UI‑friendly models via lib/adapters.ts. This prevents UI code from querying Supabase directly.

### **Logging/Debug**

* lib/query-logger.ts \+ /api/debug/queries provide query logging in development.

---

## **3\) Tech Stack & External Tools**

### **Core stack**

* Next.js 16 (App Router), React 19  
* TypeScript  
* Tailwind CSS, shadcn/ui, Radix UI  
* Lucide icons

### **External integrations**

* Supabase (Postgres \+ Auth \+ Storage)  
  * SSR client: @supabase/ssr  
  * Browser client: @supabase/supabase-js  
* Resend for transactional email  
* Stripe for checkout/payment processing  
* PayPal: not present in codebase

---

## **4\) Environment Variables / Configuration**

.env.example (required for local dev):

* NEXT\_PUBLIC\_SUPABASE\_URL  
* NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY  
* SUPABASE\_SERVICE\_ROLE\_KEY  
* RESEND\_API\_KEY

Additional required by code:

* EMAIL\_FROM (Resend sender)  
* STRIPE\_SECRET\_KEY  
* Optional base URLs for deployments:  
  * NEXT\_PUBLIC\_BASE\_URL  
  * NEXT\_PUBLIC\_SITE\_URL  
  * VERCEL\_URL

---

## **5\) Database & Authentication**

### **Authentication flow**

* Supabase Auth is the primary auth system.  
* Sign‑up uses Supabase Auth \+ creates a profile row.  
* Role assignment is stored in profiles.role.  
* OAuth sign‑in supported (Google).  
* Callback route: /auth/callback exchanges code for session and ensures profile role.

### **Role‑based access**

Role gates are enforced server‑side with helpers in lib/auth-helpers.ts:

* requireUser() – ensures authenticated user.  
* requireRole("guide" | "traveler" | "admin") – role‑gated pages.

### **User profile model**

User metadata in auth.users is extended by a public profiles table:

* profiles.id references auth.users.id  
* Role (traveler | guide | admin)  
* full\_name, avatar, home city, languages, etc.

---

## **6\) Database Schema (Supabase)**

Core tables (from supabase/schema.v2.sql \+ types/database.ts):

* countries: reference list.  
* cities: searchable destinations, slugs, active/featured flags.  
* profiles: user role \+ identity info (linked to auth.users).  
* travelers: traveler‑specific preferences.  
* guides: guide bios, languages, themes, pricing.  
* experiences: guided experiences linked to guides.  
* availability\_slots: calendar availability blocks.  
* bookings: booking records, status, Stripe session ID.  
* messages: booking‑thread messages.  
* reviews: traveler reviews tied to bookings.  
* admin\_events: admin audit events.

Enums:

* profile\_role (traveler/guide/admin)  
* guide\_status (pending/approved/rejected)  
* booking\_status (pending/accepted/declined/confirmed/completed/cancelled/paid)

---

## **7\) Payment & Email Flows**

### **Stripe Checkout**

* POST /api/checkout/create-session  
  * Verifies booking ownership.  
  * Calculates price from guide or booking.  
  * Creates Stripe Checkout session.  
  * Saves stripe\_checkout\_session\_id.  
* GET /api/checkout/verify-session  
  * Confirms session payment state.  
  * Marks booking status \= paid.  
  * Sends confirmation emails.

### **Resend Email Notifications**

lib/email.ts provides:

* Booking request notifications.  
* Booking status (accepted/declined).  
* Booking paid confirmation.  
  Uses Supabase Admin API (service role key) to retrieve user emails.

---

## **8\) Pages & Routes (Current)**

### **Marketing/Public Pages**

* / — Marketing home (app/(marketing)/page.tsx)  
* /guides — Browse guides  
* /guides/\[slug\] — Guide profile detail  
* /cities — Browse cities  
* /cities/\[slug\] — City detail  
* /countries/\[slug\] — Country detail (dynamic)  
* /how-it-works  
* /faq  
* /blog — Blog listing (mock data)  
* /blog/\[slug\] — Blog article (mock data)  
* /legal/terms  
* /legal/privacy  
* /legal/safety

### **Auth**

* /auth/sign-in  
* /auth/sign-up  
* /auth/sign-out  
* /auth/callback (route handler)

### **Account / Role Redirects**

* /account — authenticated profile summary

### **Traveler Dashboard**

* /traveler (redirects to dashboard)  
* /traveler/dashboard  
* /traveler/bookings  
* /traveler/bookings/\[id\]  
* /traveler/messages  
* /traveler/messages/\[threadId\]  
* /traveler/onboarding  
* /traveler/profile  
* /traveler/reviews

### **Guide Dashboard**

* /guide (redirects to dashboard)  
* /guide/dashboard  
* /guide/bookings  
* /guide/bookings/\[id\]  
* /guide/messages  
* /guide/messages/\[threadId\]  
* /guide/onboarding  
* /guide/profile  
* /guide/pricing  
* /guide/photos  
* /guide/availability  
* /guide/reviews  
* /guide/settings  
* /guide/payouts

### **Admin Console**

* /admin  
* /admin/guides  
* /admin/bookings  
* /admin/reviews  
* /admin/content/blog

### **Debug/Utilities**

* /test-connection — Supabase connection test page  
* /debug/auth — auth debug view (server data)

### **API Routes**

* POST /api/checkout/create-session  
* GET /api/checkout/verify-session  
* /api/debug/queries (GET/DELETE, dev‑only)

---

## **9\) Key Functional Areas (What the code does)**

### **Traveler Experience**

* Browse guides and cities.  
* Create bookings and pay via Stripe.  
* Messaging with guides.  
* Post reviews.

### **Guide Experience**

* Onboarding \+ profile management.  
* Availability and pricing.  
* Booking management.  
* Messaging with travelers.  
* Review summaries.

### **Admin Experience**

* Approve/reject guides.  
* Update booking statuses.  
* Manage user roles.  
* Review system stats.

---

## **10\) State of Data Sources**

* Supabase is the primary data source for cities, guides, bookings, reviews, messaging, etc.  
* Some content (especially blog articles and certain UI fixtures) is mocked via lib/mock-data.ts and used directly in pages like /blog.

