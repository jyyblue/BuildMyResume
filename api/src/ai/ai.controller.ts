import { Body, Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { ChatRequestDto, EnhanceRequestDto, GenerateRequestDto } from './dto';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    /**
     * POST /ai/chat
     * Main AI chat endpoint — supports CHAT, GENERATE, ENHANCE modes.
     * This is the primary endpoint used by the React app.
     */
    @Post('chat')
    async chat(@Body() dto: ChatRequestDto) {
        return this.aiService.chat(dto.messages, dto.token, dto.mode);
    }

    /**
     * POST /ai/enhance
     * Dedicated content enhancement endpoint.
     */
    @Post('enhance')
    async enhance(@Body() dto: EnhanceRequestDto) {
        return this.aiService.enhance(dto.content, dto.token, dto.field);
    }

    /**
     * POST /ai/generate
     * Dedicated resume generation endpoint.
     */
    @Post('generate')
    async generate(@Body() dto: GenerateRequestDto) {
        return this.aiService.generate(dto.brief, dto.token, dto.context);
    }

    /**
     * POST /ai/extract-pdf
     * Extracts text from uploaded PDF file.
     */
    @Post('extract-pdf')
    @UseInterceptors(FileInterceptor('file'))
    async extractPdf(@UploadedFile() file: Express.Multer.File) {
        return this.aiService.extractPdfText(file);
    }
}
