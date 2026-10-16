import Link from "next/link";

type Props = {
  href?: string;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function LuxuryButton({
  href,
  variant = "primary",
  className = "",
  children,
  type = "button",
  disabled,
  onClick,
}: Props) {
  const cls = `button ${variant === "primary" ? "primary" : variant === "outline" ? "outline" : "ghost"} ${className}`.trim();
  if (href) {
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
