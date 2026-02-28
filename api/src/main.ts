// Vercel serverless entry point
// This file wraps the NestJS application for Vercel's serverless runtime
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';

const server = express();
let app: any;

async function bootstrap() {
    if (app) return app;

    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));
    const logger = new Logger('Bootstrap');

    nestApp.use(helmet());
    nestApp.use(compression());
    nestApp.use(json({ limit: '10mb' }));
    nestApp.use(urlencoded({ extended: true, limit: '10mb' }));

    nestApp.enableCors({
        origin: [
            'http://localhost:8080',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://buildmyresume.live',
            'https://www.buildmyresume.live',
            process.env.FRONTEND_URL,
        ].filter(Boolean) as string[],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization,Accept',
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    nestApp.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
        }),
    );

    await nestApp.init();
    logger.log('🚀 NestJS app initialized for Vercel');
    app = nestApp;
    return app;
}

// Vercel handler
export default async function handler(req: any, res: any) {
    await bootstrap();
    server(req, res);
}
