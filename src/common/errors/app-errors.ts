import { HttpException } from '@nestjs/common';

class AppError extends HttpException {
  public errorCode: string;

  constructor(message: string, errorCode: string, statusCode: number = 500) {
    super(message, statusCode);
    this.name = 'AppError';
    this.errorCode = errorCode;
  }
}

export default AppError;