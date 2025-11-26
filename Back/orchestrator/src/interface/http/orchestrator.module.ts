// /interface/http/orchestrator.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrchestratorController } from './orchestrator.controller';
import { AuthService } from '../../application/services/auth.service';
import { DashboardService } from '../../application/services/dashboard.service';
import { ProductService } from '../../application/services/product.service'; 
import { CrawlerService } from '../../application/services/crawler.service'; 

// Clients
import { UsersClient } from '../../application/clients/users.client';
import { ProductClient } from '../../application/clients/product.client';
import { StoresClient } from '../../application/clients/stores.client';
import { ScrapedClient } from '../../application/clients/scraped.client';
import { CrawlerClient } from '../../application/clients/crawler.client';

@Module({
  imports: [HttpModule],
  controllers: [OrchestratorController],
  providers: [
    // Services
    AuthService,
    DashboardService,  
    ProductService,    
    CrawlerService,    

    // Clients
    UsersClient,
    ProductClient,
    StoresClient,
    ScrapedClient,
    CrawlerClient,
  ],
})
export class OrchestratorModule {}
