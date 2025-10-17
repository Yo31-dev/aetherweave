import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'devuser',
      password: process.env.DB_PASSWORD || 'devpassword',
      database: process.env.DB_NAME || 'aetherweave',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ATTENTION: false en production
    }),
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}