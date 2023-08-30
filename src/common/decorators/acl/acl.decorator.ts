import { Reflector } from '@nestjs/core';

const Roles = Reflector.createDecorator<string[]>({ key: 'Roles' });
const Permissions = Reflector.createDecorator<string[]>({ key: 'Permissions' });

export { Roles, Permissions };
