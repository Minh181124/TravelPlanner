import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Tất cả route sẽ có prefix /api (VD: /api/places/route)
  app.setGlobalPrefix('api');

  // Cho phép Frontend (port 3000) gọi Backend
  app.enableCors();

  // Cấu hình giao diện Swagger để Demo API
  const config = new DocumentBuilder()
    .setTitle('Travel Planner API - Minh Quang')
    .setDescription('Hệ thống quản lý lịch trình du lịch thông minh TP.HCM')
    .setVersion('1.0')
    .addTag('travel')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document); // Truy cập Swagger tại /swagger

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger UI: http://localhost:3000/swagger`);
}
bootstrap();
