import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import "./StatCard.css";

type StatCardProps = {
  value: ReactNode;
  label: string;
  tone?: string;
  badge?: string;
  onClick?: () => void;
};

function StatCard({
  value,
  label,
  tone = "",
  badge,
  onClick,
}: StatCardProps) {
  const { t } = useI18n();
  const className = `stat-card ${tone}`.trim();
  const labelContent = (
    <span className="stat-card__label">
      {label}
      {badge && <span className="stat-card__badge">{badge}</span>}
    </span>
  );

  if (!onClick) {
    return (
      <div className={className}>
        {labelContent}
        <span className="stat-card__value">{value}</span>
      </div>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {labelContent}
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__hint">{t("common.viewDetail")}</span>
    </button>
  );
}

export default StatCard;
