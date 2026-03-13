import { SetMetadata } from '@nestjs/common';

export const allowAnonymous = () => {
  return SetMetadata('isPublic', true);
};
