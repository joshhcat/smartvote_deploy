// Import the handler from the source file
// Vercel will compile TypeScript and NestJS build will create dist/
// The import path will resolve correctly after NestJS build completes
import handler from '../src/main';

export default handler;

