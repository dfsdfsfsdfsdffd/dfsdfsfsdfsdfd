"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ShieldCheck, Code, Star, Heart, Search, Trash2, ExternalLink, Plus, CornerDownRight } from "lucide-react";

type Badges = {
  user?: boolean;
  friend?: boolean;
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
  links?: Array<{ clicks?: number; url?: string; label?: string }>;
  created_at?: string | null;
  badges: Badges | null;
};

type ProfileRedirect = {
  id: string;
  source_username: string;
  target_username: string;
  target_user_id?: string | null;
  created_at?: string | null;
};

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [redirects, setRedirects] = useState<ProfileRedirect[]>([]);
  const [redirectSource, setRedirectSource] = useState("");
  const [redirectTarget, setRedirectTarget] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const haystack = [
      user.username,
      user.email,
      user.display_name,
      user.id,
    ].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  function linkClicks(user: AdminUser) {
    return (user.links || []).reduce((sum, link) => sum + Number(link.clicks || 0), 0);
  }

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users");
      const redirectsResponse = await fetch("/api/admin/redirects");
      const result = await response.json();
      const redirectsResult = await redirectsResponse.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load users.");
      }
      if (!redirectsResponse.ok) {
        throw new Error(redirectsResult.error || "Unable to load redirects.");
      }

      setUsers(result.users || []);
      setRedirects(redirectsResult.redirects || []);
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
    setRedirects([]);
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
      friend: Boolean(user.badges?.friend),
      dev: Boolean(user.badges?.dev),
      staff: Boolean(user.badges?.staff),
      [key]: !user.badges?.[key],
    });
  }

  async function deleteUser(user: AdminUser) {
    const label = user.username || user.email || user.id;
    if (!window.confirm(`Delete ${label}? This removes the auth user and profile.`)) return;

    setError(null);
    const response = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Unable to delete user.");
      return;
    }

    setUsers((current) => current.filter((item) => item.id !== user.id));
  }

  async function saveRedirect() {
    setError(null);

    const response = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: redirectSource,
        target: redirectTarget,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Unable to save redirect.");
      return;
    }

    setRedirects(result.redirects || []);
    setRedirectSource("");
    setRedirectTarget("");
  }

  async function deleteRedirect(source: string) {
    setError(null);

    const response = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        source,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Unable to delete redirect.");
      return;
    }

    setRedirects(result.redirects || []);
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
            <span>{filteredUsers.length} shown / {users.length} total</span>
          </div>

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-redirects">
            <div className="admin-redirect-head">
              <div>
                <strong>Reserved redirects</strong>
                <span>Make aliases like softcard.cc/hey redirect to a real profile.</span>
              </div>
              <small>{redirects.length.toLocaleString()} active</small>
            </div>
            <div className="admin-redirect-form">
              <label>
                <span>Alias</span>
                <input
                  value={redirectSource}
                  onChange={(event) => setRedirectSource(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30))}
                  placeholder="hey"
                />
              </label>
              <CornerDownRight size={18} />
              <label>
                <span>Target profile</span>
                <input
                  value={redirectTarget}
                  onChange={(event) => setRedirectTarget(event.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30))}
                  placeholder="akuryo"
                />
              </label>
              <button onClick={saveRedirect} disabled={!redirectSource || !redirectTarget}>
                <Plus size={15} />
                Save redirect
              </button>
            </div>
            {redirects.length > 0 && (
              <div className="admin-redirect-list">
                {redirects.map((redirect) => (
                  <div className="admin-redirect-row" key={redirect.id || redirect.source_username}>
                    <span><b>/{redirect.source_username}</b> {"->"} /{redirect.target_username}</span>
                    <div>
                      <a href={`/${redirect.source_username}`} target="_blank" rel="noreferrer">Test</a>
                      <button onClick={() => deleteRedirect(redirect.source_username)}>
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search username, email, name, or id"
            />
          </div>

          <div className="admin-table">
            {filteredUsers.map((user) => (
              <div className="admin-user" key={user.id}>
                <div className="admin-profile">
                  <img src={user.avatar_url || "https://i.imgur.com/1X6g1YH.jpeg"} alt="" />
                  <div>
                    <strong>{user.username || "No username"}</strong>
                    <span>{user.email || user.display_name || user.id}</span>
                    {user.created_at && <small>Joined {new Date(user.created_at).toLocaleDateString()}</small>}
                  </div>
                </div>

                <div className="admin-meta">
                  <span>{Number(user.views || 0).toLocaleString()} views</span>
                  <span>{linkClicks(user).toLocaleString()} clicks</span>
                </div>

                <div className="admin-badges">
                  {user.username && (
                    <a href={`/${user.username}`} target="_blank" rel="noreferrer" className="admin-mini-link" title="Open profile">
                      <ExternalLink size={15} />
                    </a>
                  )}
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
                    className={user.badges?.friend ? "is-active" : ""}
                    onClick={() => toggleBadge(user, "friend")}
                  >
                    <Heart size={15} />
                    Friend
                  </button>
                  <button
                    className={user.badges?.staff ? "is-active" : ""}
                    onClick={() => toggleBadge(user, "staff")}
                  >
                    <Star size={15} />
                    Staff
                  </button>
                  <button className="admin-danger" onClick={() => deleteUser(user)} title="Delete user">
                    <Trash2 size={15} />
                    Delete
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
