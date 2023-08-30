import { Request, Response } from 'express';
import { createMock } from '@golevelup/ts-jest';
import { ACLMiddleware } from './acl.middleware';

describe('ACL Middleware', () => {
  let mockHttpRequest: Request;
  let mockHttpResponse: Response;
  let middleware: ACLMiddleware;

  beforeAll(() => {
    mockHttpRequest = createMock<Request>();
    mockHttpResponse = createMock<Response>();

    middleware = new ACLMiddleware();
    middleware.use(mockHttpRequest, mockHttpResponse, jest.fn());
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
});
