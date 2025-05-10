import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP 狀態碼' })
  statusCode: number;

  @ApiProperty({ example: '400-01-01-003', description: '錯誤代碼' })
  errorCode: string;

  @ApiProperty({
    example: '信箱、密碼、名稱等欄位格式錯誤',
    description: '錯誤訊息',
  })
  message: string;
}
