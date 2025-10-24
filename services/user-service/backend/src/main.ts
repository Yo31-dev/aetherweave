import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  // Generate OpenAPI spec file if GENERATE_OPENAPI env var is set
  if (process.env.GENERATE_OPENAPI === 'true') {
    // OpenAPI/Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('User Service API')
      .setDescription('User management service for AetherWeave')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer('http://localhost:9080/api/v1', 'APISIX Gateway (local)')
      .addServer('http://localhost:3000', 'Direct (dev only)')
      .addTag('users', 'User management endpoints')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const outputPath = path.resolve(process.cwd(), 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log(`OpenAPI spec generated at ${outputPath}`);
    process.exit(0);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`User service running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
