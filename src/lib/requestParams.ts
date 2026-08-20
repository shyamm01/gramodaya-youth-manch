/**
 * Reads a positive integer "limit" from a request — checked as an X-Limit
 * header first (keeps the URL clean, e.g. for callers like the home page that
 * don't want ?limit= showing in the network tab), falling back to a ?limit=
 * query param for callers that prefer it there. Generic across any list
 * endpoint, not specific to any one page.
 */
export function getRequestLimit(req: Request): number | undefined {
  const url = new URL(req.url);
  const raw = req.headers.get('x-limit') || url.searchParams.get('limit');
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
