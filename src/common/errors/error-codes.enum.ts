export enum ErrorCode {
  InvalidRegisterFormat = '400-01-01-003',
  InternalServerError = '500-01-01-004',
  InvalidCredentials = '401-01-01-001',
  InvalidJsonFormat = '400-01-01-004',
  TokenMissing = '401-01-01-002',
  EmailAlreadyExists = '409-01-01-001',

  UnauthorizedRoleChange = '403-02-01-001',
  UserNotFound = '404-02-01-002',

  Unauthorized = '401-01-01-005',
  PostNotFound = '404-03-01-001',
  ForbiddenPostEdit = '403-03-01-002',
  ForbiddenPostDelete = '403-03-01-003',
}
