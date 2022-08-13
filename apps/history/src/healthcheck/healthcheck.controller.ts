import { Controller, Get } from '@nestjs/common'

@Controller('healthcheck')
export class HealthCheckController {
  @Get()
  healthcheck() {
    return {
      status: 'OK',
      version: '0.0.0',
    }
  }
}
