import { ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import { createMock } from '@golevelup/ts-jest';
import { APIKeyGuard } from './api-key.guard';

describe('API Key Guard', () => {
  const guard = new APIKeyGuard(new Logger());

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(guard['logger']).toBeDefined();
  });

  // ? HTTP Context
  describe('HTTP context', () => {
    let mockHttpExecutionContext: ExecutionContext;

    it('should return true when a valid API key is used', () => {
      mockHttpExecutionContext = createMock<ExecutionContext>({
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(
            createMock<Request>({
              header: jest.fn((name) => {
                return name === process.env.API_KEY_NAME.toLowerCase()
                  ? process.env.API_KEY_PASS
                  : undefined;
              }),
            }),
          ),
          getResponse: jest.fn(),
          getNext: jest.fn(),
        })),
      });
      expect(guard.canActivate(mockHttpExecutionContext)).toBe(true);
    });

    it('should return true when API key auth is disabled', () => {
      process.env.API_KEY_AUTH = 'false';
      mockHttpExecutionContext = createMock<ExecutionContext>({
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(
            createMock<Request>({
              header: jest.fn((name) => {
                return name === process.env.API_KEY_NAME.toLowerCase()
                  ? 'process.env.API_KEY_PASS'
                  : undefined;
              }),
            }),
          ),
          getResponse: jest.fn(),
          getNext: jest.fn(),
        })),
      });
      expect(guard.canActivate(mockHttpExecutionContext)).toBe(true);
      process.env.API_KEY_AUTH = 'true';
    });

    it('should return false when an invalid API key is used', () => {
      mockHttpExecutionContext = createMock<ExecutionContext>({
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(
            createMock<Request>({
              header: jest.fn((name) => {
                return name === process.env.API_KEY_NAME.toLowerCase()
                  ? 'InvalidAPIKey'
                  : undefined;
              }),
            }),
          ),
          getResponse: jest.fn(),
          getNext: jest.fn(),
        })),
      });
      expect(guard.canActivate(mockHttpExecutionContext)).toBe(false);
    });
  });
});
