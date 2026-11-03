// Shared formatting — admin tables, public pages, invoices

export const formatCurrency = (amount: number | null, currency = "INR"): string => {
  if (amount === null || amount === undefined) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | null, style: "short" | "long" = "short"): string => {
  if (!date) return "—";
  const d = new Date(date);
  return style === "long"
    ? d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

export const formatRelativeTime = (date: string): string => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(date);
};

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const truncate = (text: string, length: number): string =>
  text.length <= length ? text : `${text.slice(0, length).trim()}…`;

export const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};