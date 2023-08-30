import { TestingModule, Test } from '@nestjs/testing';
import { AppController } from '@/app.controller';
import { AppModule } from '@/app.module';
import { AppService } from '@/app.service';
import { MiddlewareConsumer } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { ACLMiddleware } from './common/middlewares';

describe('AppModule', () => {
  let app: TestingModule;
  let middlewareConsumer: MiddlewareConsumer;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AppService],
    }).compile();
    middlewareConsumer = createMock<MiddlewareConsumer>();
  });

  it('should be defined', () => {
    const appController = app.get<AppController>(AppController);
    const appService = app.get<AppService>(AppService);

    expect(app).toBeDefined();
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });

  it('should configure the middleware', () => {
    const app = new AppModule();
    app.configure(middlewareConsumer);
    expect(middlewareConsumer.apply).toHaveBeenCalledWith(ACLMiddleware);
  });
});
