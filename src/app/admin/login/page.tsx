import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { TopBar } from "@/components/TopBar";

export default function AdminLoginPage() {
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
          title="Platform admin"
          expectedRole="ADMIN"
          redirectTo="/admin"
          alternateLogin={{ href: "/client/login", label: "Restaurant / hotel client login →" }}
        />
      </div>
    </div>
  );
}
