interface Props {
  count: number;
  size?: "sm" | "md";
}

export function UnreadBadge({ count, size = "sm" }: Props) {
  if (count <= 0) return null;

  const sizeClasses =
    size === "md" ? "text-xs px-2 py-1" : "text-[10px] px-1.5 py-0.5";

  return (
    <span
      className={`bg-gray-700 text-white rounded-full font-medium ${sizeClasses}`}
      aria-label={`${count} unread messages`}
    >
      {count}
    </span>
  );
}
