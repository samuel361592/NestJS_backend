import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  const mockExecutionContext = (
    user: { roles?: string[] } | undefined,
  ): ExecutionContext => {
    const getRequest = jest.fn().mockReturnValue({ user });
    const switchToHttp = jest.fn().mockReturnValue({ getRequest });

    return {
      switchToHttp,
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as unknown as ExecutionContext;
  };

  it('should allow access when no roles are required', () => {
    (reflector.get as jest.Mock).mockReturnValue(undefined);

    const context = mockExecutionContext({ roles: ['user'] });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin']);

    const context = mockExecutionContext({ roles: ['admin', 'user'] });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin']);

    const context = mockExecutionContext({ roles: ['user'] });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny access when user has no roles', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin']);

    const context = mockExecutionContext({});
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny access when user is undefined', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin']);

    const context = mockExecutionContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
