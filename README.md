## 1️⃣ Smart Bookmark App

# 2️⃣ Live Deployment

https://smart-bookmark-k4p3xf6ts-shreyas-projects-ff372eaf.vercel.app


---

# 3️⃣ 🔷 System Overview 

```
## Overview

Smart Bookmark App allows users to securely authenticate using Google OAuth, 
store bookmarks with strict per-user isolation, and experience real-time 
UI updates without page refresh.
```

---

# 4️⃣  END-TO-END SYSTEM FLOW DIAGRAM  
```
┌──────────────────────────────────────────────────────────────┐
│                          USER                                │
│                Interacts via Web Browser                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                           │
│  • Next.js Application                                       │
│  • React UI (Tailwind CSS)                                   │
│  • Supabase JS SDK                                           │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS Request + JWT
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH SERVICE                     │
│  • Google OAuth Verification                                 │
│  • JWT Session Issuance                                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE LAYER                   │
│  • PostgreSQL                                                │
│  • Row-Level Security (RLS Validation)                       │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ Database Change Event
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    SUPABASE REALTIME ENGINE                  │
│  • Emits WebSocket Events                                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       CLIENT UI UPDATE                       │
│  • React State Updates                                       │
│  • Instant Re-render                                         │
└──────────────────────────────────────────────────────────────┘
```
---

# 5️⃣ Database Relationship Model

```
auth.users (1)
    │
    │ owns
    ▼
bookmarks (*)

auth.users
    ├── id (uuid) [Primary Key]
    ├── email
    └── provider

bookmarks
    ├── id (uuid) [Primary Key]
    ├── user_id (uuid) [Foreign Key → auth.users.id]
    ├── title (text)
    ├── url (text)
    └── created_at (timestamptz)
```

One user can own multiple bookmarks.
Each bookmark belongs to exactly one user.

---

# 6️⃣ Security Model (Row-Level Security)

Enable RLS:

```sql
alter table bookmarks enable row level security;
```

Policy Definition:

```sql
create policy "Users manage their own bookmarks"
on bookmarks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Security Guarantees:

```
User A cannot read User B’s bookmarks
User A cannot modify User B’s bookmarks
All enforcement occurs at database level
No reliance on frontend filtering
```

This prevents horizontal privilege escalation.

---

# 7️⃣ Authentication Flow Diagram

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
PostgreSQL Validates via RLS
```

No passwords are stored in the application.

---

# 8️⃣ Real-Time Data Flow Diagram

```
User adds bookmark
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
Client receives update
        │
        ▼
UI updates instantly (no refresh)
```

This eliminates polling and ensures reactive behavior.

---

# 9️⃣ Favicon Detection Strategy

```javascript
const getFavicon = (url) => {
  const domain = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};
```

Benefits:

```
No logo storage required
Works for any valid domain
Lightweight and scalable
Zero maintenance overhead
```

---

# 🔟 Key Engineering Decisions

```
Database-enforced authorization instead of frontend filtering
OAuth authentication to avoid credential storage
Serverless deployment for scalability
Event-driven real-time updates
Environment-based configuration
```

---

# 1️⃣1️⃣ Challenges & Solutions

OAuth Redirect Misconfiguration

```
Issue: Invalid site URL in Supabase
Solution: Updated production HTTPS URL and redirect settings
```

Missing Environment Variables

```
Issue: supabaseUrl is required (build failure)
Solution: Added environment variables in Vercel
```

Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

UI Not Updating

```
Issue: Refresh required after CRUD operations
Solution: Implemented Supabase Realtime subscription
```

---

# 1️⃣2️⃣ Time Investment (~15 Hours)

```
Architecture Planning        – 2 hours
OAuth Integration            – 3 hours
Database + RLS               – 2 hours
CRUD Implementation          – 3 hours
Realtime Integration         – 2 hours
Deployment + Debugging       – 2 hours
Documentation                – 1 hour
-----------------------------------------
Total                        – ~15 hours
```

---

# 1️⃣3️⃣ Local Setup

```bash
git clone https://github.com/your-username/Smart_Bookmark_App.git
cd Smart_Bookmark_App
npm install
npm run dev
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

# 1️⃣4️⃣ Production Deployment

```
Platform: Vercel
Database: Supabase PostgreSQL
Authentication: Google OAuth 2.0
Security: Row-Level Security
Real-Time: WebSocket Subscriptions
```

---

# 1️⃣5️⃣ What This Project Demonstrates

```
Secure full-stack architecture
Database-level authorization design
Real-time system implementation
Production deployment workflow
Environment configuration management
Clean system documentation
```
