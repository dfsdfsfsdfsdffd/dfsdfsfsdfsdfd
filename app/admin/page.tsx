"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ShieldCheck, Code, Star } from "lucide-react";

type Badges = {
  user?: boolean;
  dev?: boolean;
  staff?: boolean;
};

type AdminUser = {
  id: string;
  username: string | null;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  views: number | null;
  badges: Badges | null;
};

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load users.");
      }

      setUsers(result.users || []);
      setIsAuthed(true);
    } catch (err: any) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to log in.");
      }

      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthed(false);
    setUsers([]);
    setPassword("");
  }

  async function updateBadges(userId: string, badges: Badges) {
    setError(null);

    const response = await fetch("/api/admin/badges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        badges,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Unable to update badges.");
      return;
    }

    setUsers((current) =>
      current.map((user) => (user.id === userId ? result.user : user))
    );
  }

  function toggleBadge(user: AdminUser, key: keyof Badges) {
    updateBadges(user.id, {
      user: Boolean(user.badges?.user),
      dev: Boolean(user.badges?.dev),
      staff: Boolean(user.badges?.staff),
      [key]: !user.badges?.[key],
    });
  }

  return (
    <main className="admin-main">
      <nav className="admin-nav">
        <Link href="/" className="admin-back">
          <ArrowLeft size={16} />
          Home
        </Link>
        {isAuthed && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="admin-ghost" onClick={() => loadUsers()} disabled={loading}>
              <RefreshCw size={15} />
              Refresh
            </button>
            <button className="admin-ghost" onClick={logout}>
              Log out
            </button>
          </div>
        )}
      </nav>

      {!isAuthed ? (
        <section className="admin-login">
          <p className="admin-kicker">Admin</p>
          <h1>Softcard control panel</h1>
          <p>Enter the admin password to view users and manage badges.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              login();
            }}
          >
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && <div className="admin-error">{error}</div>}
            <button disabled={loading}>{loading ? "Checking..." : "Log in"}</button>
          </form>
        </section>
      ) : (
        <section className="admin-wrap">
          <div className="admin-head">
            <div>
              <p className="admin-kicker">Admin</p>
              <h1>Users</h1>
            </div>
            <span>{users.length} total</span>
          </div>

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-table">
            {users.map((user) => (
              <div className="admin-user" key={user.id}>
                <div className="admin-profile">
                  <img src={user.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg"} alt="" />
                  <div>
                    <strong>{user.username || "No username"}</strong>
                    <span>{user.email || user.display_name || user.id}</span>
                  </div>
                </div>

                <div className="admin-meta">
                  <span>{Number(user.views || 0).toLocaleString()} views</span>
                </div>

                <div className="admin-badges">
                  <button
                    className={user.badges?.user ? "is-active" : ""}
                    onClick={() => toggleBadge(user, "user")}
                  >
                    <ShieldCheck size={15} />
                    User
                  </button>
                  <button
                    className={user.badges?.dev ? "is-active" : ""}
                    onClick={() => toggleBadge(user, "dev")}
                  >
                    <Code size={15} />
                    Dev
                  </button>
                  <button
                    className={user.badges?.staff ? "is-active" : ""}
                    onClick={() => toggleBadge(user, "staff")}
                  >
                    <Star size={15} />
                    Staff
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
