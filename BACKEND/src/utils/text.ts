// Text helpers power simple matching without external search tooling.
export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const tokenize = (value: string) =>
  normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

export const uniqueStrings = (values: string[]) => [...new Set(values.filter(Boolean))];

export const titleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const extractPrice = (value: string) => {
  const matched = value.match(/(?:mrp|rs|inr|price|₹)\s*[:.]?\s*(\d{1,4})/i) ?? value.match(/\b(\d{2,4})\b/);
  return matched ? Number(matched[1]) : null;
};

export const scoreAgainstQuery = (query: string, candidates: string[]) => {
  // Prefer exact match first, then fall back to substring and token overlap.
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const queryTokens = tokenize(normalizedQuery);
  let score = 0;

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeText(candidate);

    if (normalizedCandidate === normalizedQuery) {
      score = Math.max(score, 1);
      continue;
    }

    if (normalizedCandidate.includes(normalizedQuery)) {
      score = Math.max(score, 0.8);
    }

    const tokenMatches = queryTokens.filter((token) => normalizedCandidate.includes(token)).length;

    if (queryTokens.length > 0) {
      score = Math.max(score, tokenMatches / queryTokens.length);
    }
  }

  return Number(score.toFixed(2));
};
