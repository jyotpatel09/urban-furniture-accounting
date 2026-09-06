export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(5000, Math.max(1, parseInt(String(query.limit || '1000'), 10) || 1000));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
