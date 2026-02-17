"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Bookmark = {
  id: string
  title: string
  url: string
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  // =============================
  // AUTH SESSION
  // =============================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // =============================
  // FETCH BOOKMARKS
  // =============================
  const fetchBookmarks = async () => {
    if (!session) return

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [session])

  // =============================
  // REALTIME SUBSCRIPTION
  // =============================
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  // =============================
  // ADD BOOKMARK (INSTANT UI)
  // =============================
  const addBookmark = async () => {
    if (!title || !url) return

    const formattedUrl = url.startsWith("http") ? url : `https://${url}`

    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          title,
          url: formattedUrl,
          user_id: session.user.id,
        },
      ])
      .select()

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setBookmarks((prev) => [data[0], ...prev])
    }

    setTitle("")
    setUrl("")
  }

  // =============================
  // DELETE BOOKMARK (INSTANT UI)
  // =============================
  const deleteBookmark = async (id: string) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      return
    }

    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  // =============================
  // GOOGLE LOGIN
  // =============================
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // =============================
  // LOGIN SCREEN
  // =============================
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">Smart Bookmark App</h1>
          <button
            onClick={signInWithGoogle}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition active:scale-95"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  // =============================
  // MAIN APP
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Smart Bookmark App</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition active:scale-95"
          >
            Logout
          </button>
        </div>

        {/* ADD BOOKMARK */}
        <div className="bg-slate-700 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl mb-4 font-semibold">Add Bookmark</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 p-2 rounded bg-slate-800"
            />
            <input
              type="text"
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 p-2 rounded bg-slate-800"
            />
            <button
              onClick={addBookmark}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition active:scale-95"
            >
              Add
            </button>
          </div>
        </div>

        {/* BOOKMARK LIST */}
        <div className="bg-slate-700 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl mb-4 font-semibold">Your Bookmarks</h2>

          <div className="space-y-4">
            {bookmarks.map((bookmark) => {
              const domain = new URL(bookmark.url).hostname

              return (
                <div
                  key={bookmark.id}
                  className="flex justify-between items-center bg-slate-800 px-4 py-3 rounded-lg hover:scale-[1.01] transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                      alt="logo"
                      className="w-6 h-6 rounded"
                    />
                    <a
                      href={bookmark.url}
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      {bookmark.title}
                    </a>
                  </div>

                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg transition active:scale-90"
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}