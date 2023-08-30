import { ExecutionContext, Logger, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createMock } from '@golevelup/ts-jest';
import { Request } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ACLGuard } from './acl.guard';
import { Permissions, Roles } from '@/common/decorators/acl/acl.decorator';

// * Mock class
@Roles(['ClassRole'])
@Permissions(['ClassPermission'])
class MockClass {
  // Test 1 : Activated by handler permission
  @Permissions(['HandlerPermission'])
  test1(): string {
    return 'OK';
  }

  // Test 2 : Activated by handler role
  @Roles(['HandlerRole'])
  test2(): string {
    return 'OK';
  }

  // Test 3 : Activated by class permission
  test3(): string {
    return 'OK';
  }

  // Test 4 : Activated by class role
  test4(): string {
    return 'OK';
  }
}

describe('ACL Guard', () => {
  const guard = new ACLGuard(new Logger(), new Reflector());

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(guard['logger']).toBeDefined();
    expect(guard['reflector']).toBeDefined();
  });

  // ? HTTP Context
  describe('HTTP context', () => {
    let mockHttpRequest: Partial<Request>;
    let mockHttpArgumentsHost: Partial<HttpArgumentsHost>;
    let mockHttpExecutionContext: Partial<ExecutionContext>;

    beforeEach(() => {
      mockHttpRequest = createMock<Request>();
      mockHttpArgumentsHost = {
        getRequest: jest.fn().mockReturnValue(mockHttpRequest),
        getNext: jest.fn(),
      };
      mockHttpExecutionContext = createMock<ExecutionContext>({
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
        getClass: () => MockClass as any,
      });
    });

    describe('should return true', () => {
      it('should test1 activated by handler permission', () => {
        SetMetadata('Permissions', ['HandlerPermission'])(mockHttpRequest.app);
        const executionContext = createMock<ExecutionContext>({
          ...mockHttpExecutionContext,
          getHandler: () => new MockClass().test1 as any,
        });
        expect(guard.canActivate(executionContext)).toBe(true);
      });

      it('should test2 activated by handler role', () => {
        SetMetadata('Roles', ['HandlerRole'])(mockHttpRequest.app);
        const executionContext = createMock<ExecutionContext>({
          ...mockHttpExecutionContext,
          getHandler: () => new MockClass().test2 as any,
        });
        expect(guard.canActivate(executionContext)).toBe(true);
      });

      it('should test3 activated by class permission', () => {
        SetMetadata('Permissions', ['ClassPermission'])(mockHttpRequest.app);
        const executionContext = createMock<ExecutionContext>({
          ...mockHttpExecutionContext,
          getHandler: () => new MockClass().test3 as any,
        });
        expect(guard.canActivate(executionContext)).toBe(true);
      });

      it('should test4 activated by class role', () => {
        SetMetadata('Roles', ['ClassRole'])(mockHttpRequest.app);
        const executionContext = createMock<ExecutionContext>({
          ...mockHttpExecutionContext,
          getHandler: () => new MockClass().test4 as any,
        });
        expect(guard.canActivate(executionContext)).toBe(true);
      });
    });

    describe('should return false', () => {
      it('should return false when test1 requires role from handler', () => {
        SetMetadata('Roles', ['HandlerRole'])(mockHttpRequest.app);
        const executionContext = createMock<ExecutionContext>({
          ...mockHttpExecutionContext,
          getHandler: () => new MockClass().test1 as any,
        });
        expect(guard.canActivate(executionContext)).toBe(false);
      });

      it('should return false when test2 requires permission from handler', () => {
        SetMetadata('Permission', ['HandlerPermission'])(mockHttpRequest.app);
        const executionContext = createMock<ExecutionContext>({
          ...mockHttpExecutionContext,
          getHandler: () => new MockClass().test2 as any,
        });
        expect(guard.canActivate(executionContext)).toBe(false);
      });

      it('should return false when test3 requires permission from class', () => {
        const executionContext = createMock<ExecutionContext>({
          ...mockHttpExecutionContext,
          getHandler: () => new MockClass().test3 as any,
        });
        expect(guard.canActivate(executionContext)).toBe(false);
      });

      it('should return false when test4 requires role from class', () => {
        const executionContext = createMock<ExecutionContext>({
          ...mockHttpExecutionContext,
          getHandler: () => new MockClass().test4 as any,
        });
        expect(guard.canActivate(executionContext)).toBe(false);
      });
    });
  });
});
