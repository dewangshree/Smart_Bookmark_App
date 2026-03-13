<div align="center">

# 🔖 Smart Bookmark App

### Secure · Real-Time · OAuth-Powered Bookmark Manager

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38BDF8?style=for-the-badge&logo=tailwindcss)
![Google OAuth](https://img.shields.io/badge/Google-OAuth%202.0-4285F4?style=for-the-badge&logo=google)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

Smart Bookmark App allows users to securely authenticate via **Google OAuth**, store bookmarks with strict **per-user data isolation**, and experience **real-time UI updates** without any page refresh.

🚀 **[Live Demo →](https://smart-bookmark-k4p3xf6ts-shreyas-projects-ff372eaf.vercel.app)**

</div>

---

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [End-to-End Flow](#-end-to-end-system-flow)
- [Database Model](#-database-relationship-model)
- [Security Model](#-security-model-row-level-security)
- [Authentication Flow](#-authentication-flow)
- [Real-Time Data Flow](#-real-time-data-flow)
- [Favicon Detection Strategy](#-favicon-detection-strategy)
- [Key Engineering Decisions](#-key-engineering-decisions)
- [Challenges & Solutions](#-challenges--solutions)
- [Time Investment](#-time-investment)
- [Local Setup](#-local-setup)
- [Production Deployment](#-production-deployment)
- [What This Project Demonstrates](#-what-this-project-demonstrates)

---

## 🔷 System Overview

> Smart Bookmark App allows users to securely authenticate using Google OAuth, store bookmarks with strict per-user isolation, and experience real-time UI updates without page refresh.

| Feature | Implementation |
|---|---|
| Authentication | Google OAuth 2.0 via Supabase Auth |
| Authorization | Row-Level Security (PostgreSQL) |
| Real-Time Updates | Supabase WebSocket Subscriptions |
| Frontend | Next.js + React + TailwindCSS |
| Deployment | Vercel (Serverless) |

---

## 🔁 End-to-End System Flow

```
┌──────────────────────────────────────────────────────────────┐
│                           USER                               │
│                 Interacts via Web Browser                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  • Next.js Application                                       │
│  • React UI (Tailwind CSS)                                   │
│  • Supabase JS SDK                                           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │  HTTPS Request + JWT
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   SUPABASE AUTH SERVICE                      │
│  • Google OAuth Verification                                 │
│  • JWT Session Issuance                                      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                  SUPABASE DATABASE LAYER                     │
│  • PostgreSQL                                                │
│  • Row-Level Security (RLS Validation)                       │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │  Database Change Event
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                  SUPABASE REALTIME ENGINE                    │
│  • Emits WebSocket Events                                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT UI UPDATE                         │
│  • React State Updates                                       │
│  • Instant Re-render (No Refresh)                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Relationship Model

```
auth.users (1)
    │
    │  owns
    ▼
bookmarks (*)
```

**Schema:**

```sql
-- Managed by Supabase Auth
auth.users
    ├── id           uuid          [Primary Key]
    ├── email        text
    └── provider     text

-- Application table
bookmarks
    ├── id           uuid          [Primary Key]
    ├── user_id      uuid          [Foreign Key → auth.users.id]
    ├── title        text
    ├── url          text
    └── created_at   timestamptz
```

> One user can own multiple bookmarks. Each bookmark belongs to exactly one user.

---

## 🔐 Security Model (Row-Level Security)

**Enable RLS on the bookmarks table:**

```sql
alter table bookmarks enable row level security;
```

**Policy definition:**

```sql
create policy "Users manage their own bookmarks"
on bookmarks
for all
using      (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

**Security guarantees:**

```
✅ User A cannot read    User B's bookmarks
✅ User A cannot modify  User B's bookmarks
✅ All enforcement occurs at the database level
✅ Zero reliance on frontend filtering
✅ Prevents horizontal privilege escalation
```

---

## 🔑 Authentication Flow

```
User clicks "Sign in with Google"
            │
            ▼
    Client (Next.js)
            │
            ▼
    Supabase Auth Service
            │
            ▼
    Google OAuth Verification
            │
            ▼
    Supabase Issues JWT Session
            │
            ▼
    JWT Stored in Browser
            │
            ▼
    Authenticated Requests Sent with JWT
            │
            ▼
    PostgreSQL Validates via RLS Policy
```

> ⚠️ No passwords are stored in the application at any layer.

---

## ⚡ Real-Time Data Flow

```
User adds a bookmark
            │
            ▼
Client sends INSERT request
            │
            ▼
PostgreSQL writes row
            │
            ▼
Supabase detects database change
            │
            ▼
Realtime Engine emits WebSocket event
            │
            ▼
Client receives event update
            │
            ▼
React state updates → UI re-renders instantly
```

> This eliminates polling entirely and ensures fully reactive UI behavior.

---

## 🖼 Favicon Detection Strategy

```javascript
const getFavicon = (url) => {
  const domain = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};
```

**Benefits:**

```
✅ No logo storage required
✅ Works for any valid domain automatically
✅ Lightweight and scalable
✅ Zero maintenance overhead
```

---

## 🧠 Key Engineering Decisions

| Decision | Rationale |
|---|---|
| Database-enforced authorization | Eliminates frontend filtering as a security boundary |
| Google OAuth only | Avoids credential storage and password management entirely |
| Serverless deployment (Vercel) | Auto-scaling with zero infrastructure management |
| Event-driven real-time updates | Eliminates polling, reduces server load |
| Environment-based configuration | Keeps secrets out of source code |

---

## 🛠 Challenges & Solutions

**1. OAuth Redirect Misconfiguration**

```
Issue:    Invalid site URL configured in Supabase dashboard
Solution: Updated production HTTPS URL and redirect URI settings
```

**2. Missing Environment Variables**

```
Issue:    supabaseUrl is required → build failure on Vercel
Solution: Added the following environment variables in Vercel dashboard

          NEXT_PUBLIC_SUPABASE_URL
          NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**3. UI Not Updating After CRUD Operations**

```
Issue:    Page refresh required to reflect changes
Solution: Implemented Supabase Realtime subscription on bookmarks table
```

---

## ⏱ Time Investment (~15 Hours)

```
Architecture Planning        ──────────  2 hours
OAuth Integration            ──────────  3 hours
Database + RLS Setup         ──────────  2 hours
CRUD Implementation          ──────────  3 hours
Realtime Integration         ──────────  2 hours
Deployment + Debugging       ──────────  2 hours
Documentation                ──────────  1 hour
                             ─────────────────────
Total                                  ~15 hours
```

---

## 🚀 Local Setup

**1. Clone the repository**

```bash
git clone https://github.com/your-username/Smart_Bookmark_App.git
cd Smart_Bookmark_App
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**4. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment

```
Platform        →  Vercel (Serverless)
Database        →  Supabase PostgreSQL
Authentication  →  Google OAuth 2.0
Authorization   →  Row-Level Security (RLS)
Real-Time       →  WebSocket Subscriptions
CDN             →  Vercel Edge Network
```

---

## ✅ What This Project Demonstrates

```
✔  Secure full-stack architecture design
✔  Database-level authorization (not frontend filtering)
✔  Real-time reactive system implementation
✔  Production deployment and environment configuration
✔  OAuth integration without credential storage
✔  Clean, structured engineering documentation
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with Next.js · Supabase · TailwindCSS · Vercel**

⭐ Star this repo if you found it helpful!

</div>
