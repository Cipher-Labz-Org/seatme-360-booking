import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { TopBar } from "@/components/TopBar";

export default function ClientLoginPage() {
  return (
    <div className="login-page">
      <TopBar />
      <div className="container" style={{ paddingTop: 16 }}>
        <Link href="/" style={{ fontSize: 14, color: "var(--muted)" }}>
          ← Back to home
        </Link>
      </div>
      <div className="login-page-main">
        <LoginForm
          title="Restaurant & hotel client"
          expectedRole="CLIENT"
          redirectTo="/client"
          alternateLogin={{ href: "/admin/login", label: "Platform admin login →" }}
        />
      </div>
    </div>
  );
}
