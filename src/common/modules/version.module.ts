import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { VersionGuard } from '../guards/version.guard';
import { VersionInterceptor } from '../interceptors/version.interceptor';
import { VersionService } from '../services/version.service';
import { VersionController } from '../controllers/version.controller';

@Global()
@Module({
  providers: [
    VersionService,
    {
      provide: APP_GUARD,
      useClass: VersionGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: VersionInterceptor,
    },
  ],
  exports: [VersionService],
  controllers: [VersionController],
})
export class VersionModule {} 