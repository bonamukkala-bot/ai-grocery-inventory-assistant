interface StatusBadgeProps {
  days: number;
}

export default function StatusBadge({ days }: StatusBadgeProps) {
  let colorClass = "";
  let label = "";

  if (days < 3) {
    colorClass = "bg-red-100 text-red-700 border-red-200";
    label = "Critical";
  } else if (days <= 7) {
    colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
    label = "Warning";
  } else {
    colorClass = "bg-green-100 text-green-700 border-green-200";
    label = "Healthy";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      {label}
    </span>
  );
}
