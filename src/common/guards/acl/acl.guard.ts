import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ACLGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly reflector: Reflector,
  ) {
    this.logger = new Logger('ACL Guard');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let result: string | boolean;
    let grantedRoles: string[] | undefined;
    let grantedPermissions: string[] | undefined;

    this.logger.verbose('Triggered');

    /**
     * * Roles
     * Get all roles from class & handler
     */
    const classRoles = this.reflector.get<string[]>(
      'Roles',
      context.getClass(),
    );

    const handlerRoles = this.reflector.get<string[]>(
      'Roles',
      context.getHandler(),
    );

    /**
     * * Permissions
     * Get all permissions from class & handler
     */
    const classPermissions = this.reflector.get<string[]>(
      'Permissions',
      context.getClass(),
    );

    const handlerPermissions = this.reflector.get<string[]>(
      'Permissions',
      context.getHandler(),
    );

    /**
     * ? HTTP Context
     * Granted roles & permissions from HTTP context
     */
    if (context.getType() === 'http') {
      grantedRoles = this.reflector.get<string[]>(
        'Roles',
        context.switchToHttp().getRequest<Request>().app,
      );

      grantedPermissions = this.reflector.get<string[]>(
        'Permissions',
        context.switchToHttp().getRequest<Request>().app,
      );
    }

    // * Logging
    if (context.getClass()?.name) {
      this.logger.debug(
        `Can Active: ${context.getClass().name}.${context.getHandler().name}`,
      );
    }

    if (grantedRoles) {
      this.logger.debug(`Granted roles: ${grantedRoles.join(',')}`);
    }

    if (grantedPermissions) {
      this.logger.debug(`Granted permissions: ${grantedPermissions.join(',')}`);
    }

    if (handlerPermissions) {
      this.logger.debug(`Handler permissions: ${handlerPermissions.join(',')}`);
    }

    if (handlerRoles) {
      this.logger.debug(`Handler roles: ${handlerRoles.join(',')}`);
    }

    if (classPermissions) {
      this.logger.debug(`Class permissions: ${classPermissions.join(',')}`);
    }

    if (classRoles) {
      this.logger.debug(`Class roles: ${classRoles.join(',')}`);
    }

    // * Uncomment the following for optional debugging
    // console.log({
    //   // Requirements
    //   classRoles,
    //   handlerRoles,
    //   classPermissions,
    //   handlerPermissions,
    //   // Grants
    //   grantedRoles,
    //   grantedPermissions,
    // });

    // * Check
    // Checking handler's required permissions
    if (handlerPermissions) {
      result = this.check(handlerPermissions, grantedPermissions);
      if (result) {
        this.logger.verbose(`Activated by handler permission : ${result}`);
        return true;
      }
    }

    // Checking handler's required roles
    if (handlerRoles) {
      result = this.check(handlerRoles, grantedRoles);
      if (result) {
        this.logger.verbose(`Activated by handler role : ${result}`);
        return true;
      }
    }

    // Checking class's required permissions
    if (classPermissions) {
      result = this.check(classPermissions, grantedPermissions);
      if (result) {
        this.logger.verbose(`Activated by class permission : ${result}`);
        return true;
      }
    }

    // Checking class's required roles
    if (classRoles) {
      result = this.check(classRoles, grantedRoles);
      if (result) {
        this.logger.verbose(`Activated by class role : ${result}`);
        return true;
      }
    }

    const ACL = [
      handlerPermissions,
      handlerRoles,
      classPermissions,
      classRoles,
    ];

    const hasRule = ACL.some((rule) => typeof rule === 'object');
    this.logger.verbose(`Activation ${!hasRule ? 'accepted' : 'rejected'}`);

    return !hasRule;
  }

  /**
   * * Verifying required roles/permissions against granted roles/permissions
   * @param requirements Requirement roles / permissions
   * @param grants Granted roles / permissions
   */
  check(requirements: string[], grants: string[]): boolean | string {
    return typeof grants !== 'undefined'
      ? requirements.find((i) => grants.includes(i))
      : false;
  }
}
