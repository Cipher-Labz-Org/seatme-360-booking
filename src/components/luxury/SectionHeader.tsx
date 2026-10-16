type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, lead, align = "left" }: Props) {
  return (
    <header className={`section-head section-head-${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {lead && <p className="lead section-lead">{lead}</p>}
    </header>
  );
}
