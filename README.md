

---

## Smart Bookmark App

A production-ready full-stack bookmark manager built with Next.js (App Router) and Supabase (Auth + PostgreSQL + Realtime).

This application enables secure Google authentication, user-specific private bookmarks, real-time synchronization, and dynamic favicon detection — fully deployed in production.


---

🌍 Live Application

Production URL:
https://smart-bookmark-k4p3xf6ts-shreyas-projects-ff372eaf.vercel.app

GitHub Repository:
https://github.com/dewangshree/Smart_Bookmark_App


---

✨ Features

Google OAuth Authentication (No email/password)

User-specific private bookmarks (Row-Level Security enforced)

Add bookmark (Title + URL)

Delete bookmark

Real-time updates across multiple tabs

Automatic favicon/logo detection for any domain

Production deployment on Vercel



---

🏗 System Architecture

High-Level Architecture Diagram

┌──────────────────────────────────────────────┐
│                    Client                   │
│           Next.js (App Router)              │
│        React + Tailwind CSS (UI)            │
└─────────────────────────┬────────────────────┘
                          │
                          │ Supabase JS SDK
                          ▼
┌──────────────────────────────────────────────┐
│                 Supabase Platform            │
│                                              │
│  ┌───────────────┐   ┌───────────────────┐  │
│  │  Google OAuth │   │  Realtime Engine  │  │
│  │   (Auth)      │   │ (Subscriptions)   │  │
│  └───────────────┘   └───────────────────┘  │
│                                              │
│              PostgreSQL Database             │
│          (Row-Level Security Enabled)        │
└──────────────────────────────────────────────┘
                          │
                          ▼
                 Hosted on Vercel


---

🔄 Authentication Flow

User clicks "Sign in with Google"
            │
            ▼
Supabase Auth initiates Google OAuth
            │
            ▼
Google authenticates user
            │
            ▼
Supabase creates/returns user session
            │
            ▼
JWT session stored in browser
            │
            ▼
User redirected to main dashboard


---

⚡ Real-Time Data Flow

User A adds bookmark
        │
        ▼
Bookmark inserted into PostgreSQL
        │
        ▼
Supabase Realtime emits change event
        │
        ▼
All active client subscriptions receive update
        │
        ▼
UI updates instantly (no page refresh)


---

🗄 Database Architecture

Table: bookmarks

create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);


---

Database Relationship Diagram

┌──────────────────────────┐
│        auth.users        │
│--------------------------│
│ id (uuid) PRIMARY KEY    │
└──────────────┬───────────┘
               │ 1-to-many
               ▼
┌──────────────────────────┐
│        bookmarks         │
│--------------------------│
│ id (uuid) PRIMARY KEY    │
│ user_id (uuid) FK        │
│ title (text)             │
│ url (text)               │
│ created_at (timestamp)   │
└──────────────────────────┘

Each bookmark row is linked to exactly one authenticated user.


---

🔐 Row-Level Security (RLS)

RLS guarantees that users can only access their own bookmarks.

Enable RLS

alter table bookmarks enable row level security;

Policy

create policy "Users manage own bookmarks"
on bookmarks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

Security Guarantee

User A cannot view User B's bookmarks.
User A cannot delete User B's bookmarks.
User A cannot insert bookmarks under another user_id.


---

🌐 Dynamic Favicon Detection

Favicons are generated dynamically using Google’s favicon service.

function getFavicon(url) {
  try {
    const domain = new URL(
      url.startsWith("http") ? url : `https://${url}`
    ).hostname;

    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return "/default-icon.png";
  }
}

This allows logo detection for any valid domain.


---

📂 Project Structure

smart-bookmark-app/
│
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│
├── lib/
│   └── supabaseClient.ts
│
├── public/
│
├── .env.local
├── package.json
└── README.md


---

⚙ Environment Configuration

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key


---

🚀 Deployment

Platform: Vercel

Deployment Steps:

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

Supabase Configuration:

Authentication → URL Configuration

Site URL:
https://your-vercel-domain.vercel.app

Redirect URLs:
http://localhost:3000
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app


---

🧠 Development Approach

Phase 1 – Project setup & Supabase integration
Phase 2 – Google OAuth implementation
Phase 3 – Database schema + RLS configuration
Phase 4 – CRUD functionality
Phase 5 – Real-time subscription integration
Phase 6 – Dynamic favicon detection
Phase 7 – Production deployment & debugging


---

⏱ Development Effort

Total time spent: ~15 hours

Project Setup & Architecture:        ~2 hours
Authentication (OAuth):              ~3 hours
Database + RLS Implementation:       ~2 hours
CRUD Operations:                     ~3 hours
Realtime Integration:                ~2 hours
UI + Favicon Logic:                  ~2 hours
Deployment & Debugging:              ~1 hour


---

🤖 AI Tools Used

ChatGPT:
- Debugging Supabase auth errors
- RLS policy validation
- Architecture design refinement
- Production error diagnosis

Used strictly as a development assistant.
All implementation decisions were understood and verified manually.


---

🖥 Development Environment

Editor: Visual Studio Code
Runtime: Node.js
Framework: Next.js (App Router)
Backend: Supabase
Database: PostgreSQL
Deployment: Vercel


---

🔥 Hardest Challenges

1. Supabase OAuth redirect configuration in production.
2. Handling environment variables correctly during Vercel build.
3. Ensuring true real-time updates without manual refresh.
4. Configuring strict Row-Level Security policies without breaking queries.


---

📌 Final Result

The application successfully satisfies all requirements:

✔ Google Login only
✔ Private user-specific bookmarks
✔ Real-time updates
✔ Add/Delete functionality
✔ Production deployment
✔ Clean UI
✔ Secure RLS isolation


