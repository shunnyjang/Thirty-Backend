import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['error', 'warn'],
  });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle(`Thirty API Document`)
    .setDescription(`30일 챌린지 써티 API 문서입니다`)
    .setVersion('0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(3000);
}

bootstrap();
