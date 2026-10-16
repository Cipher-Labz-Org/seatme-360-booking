"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { setAuth, type StoredUser } from "@/lib/auth-storage";

type Props = {
  title: string;
  expectedRole: "ADMIN" | "CLIENT";
  redirectTo: string;
  alternateLogin?: { href: string; label: string };
};

export function LoginForm({ title, expectedRole, redirectTo, alternateLogin }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api<{ token: string; user: StoredUser }>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      if (data.user.role !== expectedRole) {
        setError("This login is for a different account type.");
        return;
      }
      setAuth(data.token, data.user);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <p className="eyebrow">SeatMe platform</p>
      <h1>{title}</h1>
      <form className="form-grid" onSubmit={onSubmit} style={{ marginTop: 24 }}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p style={{ color: "#a93226", margin: 0, fontSize: 14 }}>{error}</p>}
        <button type="submit" className="button primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {alternateLogin && (
        <p className="login-switch">
          <Link href={alternateLogin.href}>{alternateLogin.label}</Link>
        </p>
      )}
    </div>
  );
}
