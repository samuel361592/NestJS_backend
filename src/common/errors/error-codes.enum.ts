export enum ErrorCode {
  InvalidCredentials       = '401-01-001',
  TokenMissing             = '401-01-002',
  InvalidRegisterFormat    = '400-01-003',
  InvalidJsonFormat        = '400-01-004',
  InternalServerError      = '500-01-004',
  Unauthorized             = '401-01-005',
  EmailAlreadyExists       = '409-01-001',

  UserNotFound             = '404-02-002',
  UnauthorizedRoleChange   = '403-02-001',
  SelfRoleModificationForbidden = '403-02-003',


  PostNotFound             = '404-03-001',
  ForbiddenPostEdit        = '403-03-002',
  ForbiddenPostDelete      = '403-03-003',
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.InvalidCredentials]: '帳號或密碼錯誤',
  [ErrorCode.TokenMissing]: '請提供有效的 JWT token',
  [ErrorCode.InvalidRegisterFormat]: '註冊格式無效',
  [ErrorCode.InvalidJsonFormat]: 'JSON 格式無效',
  [ErrorCode.InternalServerError]: '內部伺服器錯誤',
  [ErrorCode.Unauthorized]: '未經授權',
  [ErrorCode.EmailAlreadyExists]: '此信箱已被註冊，請使用其他信箱',
  [ErrorCode.UserNotFound]: '使用者不存在',
  [ErrorCode.UnauthorizedRoleChange]: '未經授權的角色變更',
  [ErrorCode.SelfRoleModificationForbidden]: '不可修改自己的角色',
  [ErrorCode.PostNotFound]: '文章不存在',
  [ErrorCode.ForbiddenPostEdit]: '禁止編輯此文章',
  [ErrorCode.ForbiddenPostDelete]: '禁止刪除此文章',
};
