import crypto from 'crypto';

export const generateJWTSecret = (length: number = 64): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate a secret and log it (only for development)
if (process.env.NODE_ENV === 'development') {
  const secret = generateJWTSecret();
  console.log('Generated JWT Secret (save this in your .env file):');
  console.log(`JWT_SECRET=${secret}`);
} 