import { registerAs } from '@nestjs/config';

export default registerAs('registerAs', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRESIN ?? '86400', 10),
  
}));
