import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Express } from 'express';
import { AppModule } from './app/app.module';
import { environment, } from './app/core/environment';

async function bootstrap(expressApp: Express | undefined = undefined, port: number | undefined = undefined) {

  const app = expressApp == undefined ? await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
    bufferLogs: true,
  }) : await NestFactory.create(AppModule, new ExpressAdapter(expressApp))

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    // forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.enableCors()

  if (port !== undefined) { await app.listen(port) }
  return app;
}


export async function createApp(expressApp: Express): Promise<INestApplication> {
  // const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp),);
  return bootstrap(expressApp);
}

bootstrap(undefined, environment.app_port);
