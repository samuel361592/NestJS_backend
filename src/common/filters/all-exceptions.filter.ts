
import { ExceptionFilter, Catch, ArgumentsHost,  HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import AppError from '../errors/app-errors';


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof AppError) {
      response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

        if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      response.status(status).json({
        statusCode: status,
        ...(typeof res === 'string' ? { message: res } : res),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }
    
    response.status(500).json({
      statusCode: 500,
      errorCode: 'InternalServerError',
      message: '未知錯誤',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}