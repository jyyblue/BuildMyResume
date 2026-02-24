import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    /**
     * GET /health
     * Simple health check endpoint.
     */
    @Get()
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'buildmyresume-api',
        };
    }
}
