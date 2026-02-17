## Smart Bookmark App

A production-ready full-stack bookmark manager built using Next.js (App Router) and Supabase (Auth + Database + Realtime).

This application allows users to securely authenticate via Google OAuth, create private bookmarks, and experience real-time updates without page refresh.

Live URL:
https://smart-bookmark-k4p3xf6ts-shreyas-projects-ff372eaf.vercel.app


---

📌 Features

🔐 Google OAuth authentication (Supabase Auth)

👤 User-specific private bookmarks (Row-Level Security enforced)

➕ Add bookmark (Title + URL)

🗑 Delete bookmark

⚡ Real-time updates across tabs (Supabase Realtime)

🌐 Dynamic favicon/logo rendering for any domain

🚀 Production deployment on Vercel



---

🏗 Architecture Overview

Client (Next.js - App Router)
        |
        | Supabase JS Client
        |
Supabase Backend
 ├── Authentication (Google OAuth)
 ├── Postgres Database
 ├── Row-Level Security Policies
 └── Realtime Subscriptions
        |
Vercel (Production Hosting)


---

🗄 Database Design

Table: bookmarks

Column	Type	Description

id	uuid	Primary key
user_id	uuid	References auth.users.id
title	text	Bookmark title
url	text	Website URL
created_at	timestamp	Auto-generated



---

🔒 Row-Level Security (RLS)

Enabled to ensure users only access their own data.

Example Policy:

CREATE POLICY "Users can manage their own bookmarks"
ON bookmarks
FOR ALL
USING (auth.uid() = user_id);

This guarantees:

User A cannot view User B’s bookmarks

All data access is securely scoped



---

⚡ Real-Time Implementation

Real-time updates were implemented using Supabase Realtime subscriptions.

supabase
  .channel('bookmarks-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'bookmarks' },
    () => fetchBookmarks()
  )
  .subscribe();

This ensures:

Adding a bookmark in one tab instantly updates another

No manual refresh required

Fully reactive UX



---

🌐 Dynamic Favicon Rendering

To improve user recognition, favicons are dynamically generated based on domain.

function getFavicon(url: string) {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return null;
  }
}

This works for most domains dynamically without storing logos.


---

🧠 Authentication Flow

Google OAuth via Supabase

Production redirect URLs configured in Supabase dashboard

Environment variables configured in Vercel:


NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

Handled edge cases:

Production redirect URL formatting

Missing environment variables causing build failure

OAuth callback configuration



---

🛠 Tech Stack

Next.js 14 (App Router)

Supabase (Auth, Database, Realtime)

PostgreSQL

Tailwind CSS

Vercel (Deployment)



---

🤖 AI Tools Used

AI tools were used as development assistants, not code generators.

Used:

ChatGPT – debugging guidance, architecture clarification, production auth troubleshooting

Cursor AI – code suggestions and refactoring assistance


Usage Scope:

Debugging OAuth redirect issues

Understanding Supabase RLS policy structure

Improving favicon logic

Deployment troubleshooting


All core integration and implementation decisions were manually reviewed and implemented.


---

⏱ Development Time Breakdown (Total ~15 Hours)

Task	Time Spent

Project Setup & Supabase Integration	~3 hours
Authentication & RLS Policies	~3 hours
CRUD Operations	~2 hours
Real-time Integration	~2 hours
Dynamic Favicon Logic	~1.5 hours
Production Deployment & Debugging	~2.5 hours
UI Polishing & Testing	~1 hour


Total: ~15 hours


---

⚙️ Development Environment

Editor: Visual Studio Code

OS: macOS

Version Control: Git + GitHub

Deployment: Vercel (Production)



---

🧩 Challenges Faced & Solutions

1. Supabase Production OAuth Redirect Error

Issue: site url is improperly formatted

Solution:

Corrected Site URL format (https required)

Added Vercel production domain in Redirect URLs

Ensured no trailing slashes



---

2. Missing Environment Variables During Build

Issue: supabaseUrl is required

Solution:

Added environment variables in Vercel dashboard

Verified variable names match exactly



---

3. Favicon Not Rendering for Certain Domains

Issue: Invalid URL parsing caused runtime error

Solution:

Normalized URL before parsing

Added safe fallback handling



---

4. Ensuring True Real-Time Updates

Issue: UI not updating automatically

Solution:

Implemented Supabase Realtime subscription

Refetched bookmarks on event trigger



---

🧪 Testing

Multiple user sessions tested

Incognito mode tested

Cross-tab real-time verified

Production environment validated



---

🎯 Final Notes

This project was built with focus on:

Security (RLS)

Scalability

Clean architecture

Production readiness

Real-time responsiveness


The implementation prioritizes correctness, separation of concerns, and real-world deployment considerations.


