import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class APIKeyGuard implements CanActivate {
  constructor(private readonly logger: Logger) {
    this.logger = new Logger('API Key Guard');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.verbose('Triggered');
    if (process.env.API_KEY_AUTH === 'true') {
      // * Key name
      const APIKeyName = process.env.API_KEY_NAME.toLowerCase();

      // ? HTTP context
      if (context.getType() === 'http') {
        const req = context.switchToHttp().getRequest<Request>();
        // ! Change implementation for actual usage
        if (req.header(APIKeyName) === process.env.API_KEY_PASS) {
          return true;
        }
      }

      return false;
    }

    return true;
  }
}
