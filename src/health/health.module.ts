import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule,
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {} 