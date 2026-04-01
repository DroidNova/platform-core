import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T = unknown> {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ example: 'Request successful' })
  message!: string;

  @ApiProperty({
    description: 'Payload returned by the endpoint',
    example: { id: 'usr_123', fullName: 'Alex Johnson' },
  })
  data!: T;
}
