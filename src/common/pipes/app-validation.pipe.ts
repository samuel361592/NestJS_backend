import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorCode, ErrorMessages } from '../errors/error-codes.enum';

interface ValidationIssue {
  field: string;
  messages: string[];
}

function collectValidationIssues(
  errors: ValidationError[],
  parentPath = '',
): ValidationIssue[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const currentIssue = error.constraints
      ? [{ field, messages: Object.values(error.constraints) }]
      : [];

    return [
      ...currentIssue,
      ...collectValidationIssues(error.children ?? [], field),
    ];
  });
}

export function createAppValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: false,
    },
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        errorCode: ErrorCode.InvalidRequestFormat,
        message: ErrorMessages[ErrorCode.InvalidRequestFormat],
        errors: collectValidationIssues(errors),
      }),
  });
}
