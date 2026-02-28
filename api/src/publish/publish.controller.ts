import { Controller, Post, Get, Delete, Body, Param, Req, Ip } from '@nestjs/common';
import { PublishService } from './publish.service';
import { PublishDto } from './dto/publish.dto';
import type { Request } from 'express';

@Controller('publish')
export class PublishController {
    constructor(private readonly publishService: PublishService) { }

    @Post()
    async publishResume(
        @Body() publishDto: PublishDto,
        @Ip() clientIp: string,
        @Req() request: Request
    ) {
        const ip = (request.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || clientIp;
        const userAgent = request.headers['user-agent'] || 'unknown';
        return this.publishService.publishResume(publishDto, ip, userAgent);
    }

    @Post('cleanup')
    async cleanupOldResumes() {
        return this.publishService.cleanupOldResumes();
    }

    @Get('stats')
    async getStats() {
        return this.publishService.getPublishingStats();
    }

    @Get(':id')
    async getResume(@Param('id') id: string) {
        return this.publishService.getPublishedResume(id);
    }

    @Delete(':id')
    async deleteResume(@Param('id') id: string) {
        return this.publishService.deletePublishedResume(id);
    }
}
