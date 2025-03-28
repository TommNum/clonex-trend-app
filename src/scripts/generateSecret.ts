import { generateJWTSecret } from '../utils/secretGenerator';

const secret = generateJWTSecret();
console.log('\nGenerated JWT Secret:');
console.log('---------------------');
console.log(`JWT_SECRET=${secret}`);
console.log('\nCopy this line and add it to your .env file'); 