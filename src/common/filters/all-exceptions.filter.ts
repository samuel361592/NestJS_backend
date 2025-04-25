import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../errors/error-codes.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = 500;
    let responseMessage = 'Internal server error';
    let responseErrorCode = ErrorCode.InternalServerError;

    // 處理 HTTP 例外
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const res = exception.getResponse();

      // 如果是 BadRequestException，通常為 class-validator 格式錯誤
      if (exception instanceof BadRequestException) {
        responseErrorCode = ErrorCode.InvalidRegisterFormat;
        responseMessage = '信箱、密碼、名稱等欄位格式錯誤';
      } else if (typeof res === 'object' && res !== null) {
        const { message, errorCode } = res as {
          message?: string;
          errorCode?: string;
        };
        if (message) responseMessage = message;
        if (
          errorCode &&
          Object.values(ErrorCode).includes(errorCode as ErrorCode)
        ) {
          responseErrorCode = errorCode as ErrorCode;
        }
      } else if (typeof res === 'string') {
        responseMessage = res;
      }
    }

    response.status(statusCode).json({
      statusCode,
      errorCode: responseErrorCode,
      message: responseMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
