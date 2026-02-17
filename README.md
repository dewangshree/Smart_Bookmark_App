## Smart Bookmark App

A production-ready full-stack bookmark manager built using Next.js (App Router) and Supabase (Auth + PostgreSQL + Realtime).

This application enables users to securely authenticate via Google OAuth, manage private bookmarks, and experience real-time updates without page refresh.


---

🌍 Live Application

Production URL:

https://smart-bookmark-k4p3xf6ts-shreyas-projects-ff372eaf.vercel.app

GitHub Repository:

<your-github-repo-url>


---

📌 Core Features

🔐 Google OAuth authentication (Supabase Auth)

👤 User-specific private bookmarks (Row-Level Security enforced)

➕ Add bookmark (Title + URL)

🗑 Delete bookmark

⚡ Real-time updates across multiple tabs

🌐 Automatic favicon/logo detection for any domain

🚀 Production deployment on Vercel



---

🏗 System Architecture

High-Level Architecture

┌────────────────────┐
                 │      Client        │
                 │  Next.js (App)     │
                 └─────────┬──────────┘
                           │
                           │ Supabase JS SDK
                           │
                 ┌─────────▼──────────┐
                 │      Supabase      │
                 │  Backend Platform  │
                 ├────────────────────┤
                 │ Auth (Google OAuth)│
                 │ PostgreSQL DB      │
                 │ Row-Level Security │
                 │ Realtime Engine    │
                 └─────────┬──────────┘
                           │
                           │ Hosted on
                           ▼
                    ┌───────────────┐
                    │    Vercel     │
                    │ Production    │
                    └───────────────┘


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

┌────────────────────┐
        │   auth.users       │
        │--------------------│
        │ id (uuid)          │
        └─────────┬──────────┘
                  │
                  │ 1-to-many
                  │
        ┌─────────▼──────────┐
        │    bookmarks       │
        │--------------------│
        │ id (uuid)          │
        │ user_id (uuid)     │
        │ title (text)       │
        │ url (text)         │
        │ created_at         │
        └────────────────────┘

Each user can only access bookmarks linked to their own user_id.


---

🔐 Row-Level Security (RLS)

RLS was enabled to guarantee strict user isolation.

alter table bookmarks enable row level security;

Policy:

create policy "Users can manage their own bookmarks"
on bookmarks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

What this ensures:

User A cannot see User B's bookmarks

User A cannot modify User B’s data

All operations are scoped at the database level

Security does not rely on frontend filtering



---

🔄 Authentication Flow

Google OAuth via Supabase

Authentication is handled using Supabase’s built-in Google provider.

Client Sign-In

await supabase.auth.signInWithOAuth({
  provider: 'google',
});


---

Authentication Flow Diagram

User
  │
  │ Click "Sign in with Google"
  ▼
Supabase Auth (OAuth Redirect)
  │
  ▼
Google Authentication
  │
  ▼
Supabase Callback
  │
  ▼
User Session Created
  │
  ▼
Next.js App (Authenticated State)


---

⚡ Real-Time Updates

Real-time updates were implemented using Supabase’s PostgreSQL change feeds.

Subscription Logic

supabase
  .channel('bookmarks-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookmarks',
    },
    () => fetchBookmarks()
  )
  .subscribe();


---

Real-Time Data Flow

User A adds bookmark
        │
        ▼
Supabase Database
        │
        ▼
Realtime Engine detects change
        │
        ▼
Subscribed clients receive event
        │
        ▼
UI refreshes automatically

No manual page refresh required.


---

🌐 Dynamic Favicon Rendering

To improve UX, favicons are dynamically fetched for any domain.

Implementation

function getFavicon(url: string) {
  try {
    const normalized = url.startsWith('http')
      ? url
      : `https://${url}`;

    const domain = new URL(normalized).hostname;

    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return null;
  }
}

This supports most domains automatically.


---

⚙️ Environment Variables

Required in both .env.local and Vercel dashboard:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Failure to define these results in:

Error: supabaseUrl is required


---

🚀 Deployment Architecture

GitHub Repository
        │
        ▼
Vercel Build System
        │
        ├── Install Dependencies
        ├── Build Next.js App
        └── Inject Environment Variables
        │
        ▼
Production Deployment

Supabase Redirect URLs configured to include:

https://your-vercel-domain.vercel.app


---

🧩 Challenges & Solutions

1️⃣ OAuth Redirect Issues (Production)

Issue:

site url is improperly formatted

Solution:

Ensured HTTPS protocol

Removed trailing slashes

Added correct Vercel domain in Redirect URLs



---

2️⃣ Missing Environment Variables During Build

Issue:

supabaseUrl is required

Solution:

Added env variables in Vercel dashboard

Ensured exact key names



---

3️⃣ Ensuring True Real-Time Behavior

Issue: UI did not auto-update.

Solution:
Implemented Supabase realtime subscription and triggered refetch on change events.


---

🧠 AI Tools Used

AI tools were used strictly as development assistants.

Used:

ChatGPT – debugging assistance, architecture refinement, deployment troubleshooting

Cursor AI – code suggestion and refactoring


AI was not used to auto-generate the entire solution.
All architectural decisions, integrations, and security configurations were implemented and validated manually.


---

⏱ Development Time Breakdown (~15 Hours)

Task	Time

Project Setup & Supabase Integration	3 hrs
Authentication & RLS Policies	3 hrs
CRUD Implementation	2 hrs
Real-Time Integration	2 hrs
Favicon & UX Improvements	1.5 hrs
Deployment & Production Debugging	2.5 hrs
Testing & Refinement	1 hr


Total: ~15 hours


---

🛠 Development Environment

Editor: Visual Studio Code

OS: macOS

Version Control: Git & GitHub

Hosting: Vercel

Backend: Supabase



---

🧪 Testing Strategy

Multi-user session testing

Cross-tab real-time validation

Incognito mode authentication testing

Production environment verification



---

🎯 Engineering Focus

This project was built with emphasis on:

Database-level security

Clean architecture

Real-time UX

Proper production configuration

Scalable backend integration





You are very close to standing out.
