import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { HealthController } from './health/health.controller';

const isGeneratingOpenAPI = process.env.GENERATE_OPENAPI === 'true';

const getDatabaseConfig = () => {
  if (isGeneratingOpenAPI) {
    // SQLite en mémoire pour la génération OpenAPI
    return {
      type: 'sqlite' as const,
      database: ':memory:',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }

  // PostgreSQL pour l'environnement normal
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'devuser',
    password: process.env.DB_PASSWORD || 'devpassword',
    database: process.env.DB_NAME || 'aetherweave',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true, // ATTENTION: false en production
  };
};

@Module({
  imports: [TypeOrmModule.forRoot(getDatabaseConfig()), UsersModule, RolesModule],
  controllers: [HealthController],
})
export class AppModule {}