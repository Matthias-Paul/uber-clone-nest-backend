import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUsertype } from '../interfaces/active-user.interface';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUsertype | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: ActiveUsertype = request.user;
    return field ? user?.[field] : user;
  },
);
