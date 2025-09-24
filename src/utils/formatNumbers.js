// Utilities to format prices and ratings with conditional decimals
export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  // integer -> no decimals
  if (Number.isInteger(n)) return String(n);
  // exact one decimal (e.g., 4.5) -> one decimal
  if (Math.round(n * 10) === n * 10) return n.toFixed(1).replace(/\.0$/, "");
  // otherwise show up to 2 decimals, trimming trailing zeros
  return n.toFixed(2).replace(/(?:\.0+|(?<=(\.\d+?))0+)$/, "");
}

export function formatRating(value) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (Number.isInteger(n)) return String(n);
  // keep one decimal for ratings
  return n.toFixed(1).replace(/\.0$/, "");
}
