import { NestFactory } from '@nestjs/core';
import { log } from 'console';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let cachedApp: any;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  
  // Enable CORS
  app.enableCors();
  
  // Serve static files from uploads directory (only works locally, not on Vercel)
  // On Vercel, use cloud storage (S3, Cloudinary, etc.) instead
  if (process.env.NODE_ENV !== 'production') {
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });
  }
  
  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

// For Vercel serverless functions
export default async function handler(req: any, res: any) {
  const app = await createApp();
  return app(req, res);
}

// For local development - check if running directly (not imported)
if (process.env.VERCEL !== '1') {
  // Only start server if not on Vercel and if this file is executed directly
  const isMainModule = require.main === module || !process.env.VERCEL;
  if (isMainModule) {
    async function bootstrap() {
      const app = await NestFactory.create<NestExpressApplication>(AppModule);
      
      // Enable CORS
      app.enableCors();
      
      // Serve static files from uploads directory
      app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
      });
      
      await app.listen(process.env.PORT ?? 3004);
      console.log(
        `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3004}`,
      );
    }
    bootstrap().catch(console.error);
  }
}
