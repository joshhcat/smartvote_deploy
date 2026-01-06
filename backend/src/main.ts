import { NestFactory } from '@nestjs/core';
import { log } from 'console';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

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
bootstrap();
