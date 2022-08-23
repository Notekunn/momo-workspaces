import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { HealthCheckModule } from './healthcheck/healthcheck.module'
import { typeormConfig } from './ormconfig'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthCheckModule,
    TypeOrmModule.forRoot(typeormConfig),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
