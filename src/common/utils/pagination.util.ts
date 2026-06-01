import { PaginatedResult, PaginationMeta } from '../types/api-response.type';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function buildPaginationMeta(
  totalItems: number,
  params: PaginationParams,
): PaginationMeta {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export function toPaginatedResult<T>(
  items: T[],
  totalItems: number,
  params: PaginationParams,
): PaginatedResult<T> {
  return {
    items,
    meta: buildPaginationMeta(totalItems, params),
  };
}

export function getPaginationOffset(params: PaginationParams): number {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;

  return (page - 1) * limit;
}
