import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '../types/api-response.type';

class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 43 })
  totalItems!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;

  @ApiProperty({ example: false })
  hasPreviousPage!: boolean;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    type: 'array',
    description: 'Page items. Item shape depends on the endpoint.',
    example: [],
  })
  items!: T[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMeta;
}
