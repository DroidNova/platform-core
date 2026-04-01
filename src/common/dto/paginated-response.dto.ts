import { PaginationMeta } from '../types/api-response.type';

export class PaginatedResponseDto<T> {
  items!: T[];
  meta!: PaginationMeta;
}
