// app.module.ts
import { Module } from '@nestjs/common';
import { OrchestratorModule } from './interface/http/orchestrator.module';
import { AxiosConfigModule } from './infrastructure/http/axios.config';

@Module({
  imports: [
    AxiosConfigModule,  
    OrchestratorModule,
  ],
})
export class AppModule {}
