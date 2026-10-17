import type { ReactNode } from "react";
import "./StatCard.css";

type StatCardProps = {
  value: ReactNode;
  label: string;
  tone?: string;
  onClick?: () => void;
};

function StatCard({ value, label, tone = "", onClick }: StatCardProps) {
  const className = `stat-card ${tone}`.trim();

  if (!onClick) {
    return (
      <div className={className}>
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
      </div>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__hint">Voir le détail</span>
    </button>
  );
}

export default StatCard;
