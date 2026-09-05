export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
