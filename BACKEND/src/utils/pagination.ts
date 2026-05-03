// Tiny pagination helpers keep route handlers readable.
export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const defaultPage = 1;
const defaultPageSize = 12;
const maxPageSize = 24;

export const readPagination = (input: PaginationInput = {}) => {
  const page = Number.isFinite(input.page) && Number(input.page) > 0 ? Number(input.page) : defaultPage;
  const pageSize = Number.isFinite(input.pageSize) && Number(input.pageSize) > 0
    ? Math.min(Number(input.pageSize), maxPageSize)
    : defaultPageSize;

  return { page, pageSize };
};

export const slicePage = <T>(items: T[], input: PaginationInput = {}) => {
  const { page, pageSize } = readPagination(input);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages
    } satisfies PaginationMeta
  };
};
