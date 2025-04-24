import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: '403-01-01-001',
    description: '錯誤代碼',
  })
  errorCode: string;

  @ApiProperty({
    example: '只有 admin 可以更改角色',
    description: '錯誤訊息',
  })
  message: string;
}
