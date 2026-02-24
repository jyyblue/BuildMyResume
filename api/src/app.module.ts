import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { ExportModule } from './export/export.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [AiModule, ExportModule, HealthModule],
})
export class AppModule { }
