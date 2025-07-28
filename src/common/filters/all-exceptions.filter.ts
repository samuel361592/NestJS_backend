import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../errors/error-codes.enum';
import { ErrorMessages } from '../errors/error-codes.enum'; // 導入 ErrorMessages

interface ErrorResponseShape {
  message?: string;
  errorCode?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = 500;
    let responseMessage = ErrorMessages[ErrorCode.InternalServerError]; // 從 ErrorMessages 獲取預設訊息
    let responseErrorCode = ErrorCode.InternalServerError;

    console.error('錯誤攔截器捕捉到異常：', exception);

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (exception instanceof BadRequestException) {
        responseErrorCode = ErrorCode.InvalidRegisterFormat;
        responseMessage = ErrorMessages[ErrorCode.InvalidRegisterFormat]; // 從 ErrorMessages 獲取訊息
      } else if (typeof res === 'object' && res !== null) {
        const { message, errorCode } = res as ErrorResponseShape;

        if (
          errorCode &&
          Object.values(ErrorCode).includes(errorCode as ErrorCode)
        ) {
          responseErrorCode = errorCode as ErrorCode;
          responseMessage = ErrorMessages[responseErrorCode] || message || responseMessage; // 優先從 ErrorMessages 獲取，其次是原始訊息，最後是預設訊息
        } else if (message) {
          responseMessage = message; // 如果沒有有效的 errorCode，但有 message，則使用原始 message
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