import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthCheckModule } from './healthcheck/healthcheck.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthCheckModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
