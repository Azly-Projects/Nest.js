import { APP_GUARD } from '@nestjs/core';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ACLGuard, APIKeyGuard } from './common/guards';
import { ACLMiddleware } from './common/middlewares';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
    {
      provide: APP_GUARD,
      useClass: APIKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ACLGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ACLMiddleware).forRoutes('*');
  }
}
