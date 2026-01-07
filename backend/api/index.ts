// Vercel serverless function handler for NestJS
// This file is compiled by @vercel/node builder
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
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
  
  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

// Vercel serverless function handler
export default async function handler(req: express.Request, res: express.Response) {
  const app = await createApp();
  return app(req, res);
}
