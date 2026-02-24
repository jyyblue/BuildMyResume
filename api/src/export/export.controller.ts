import { Body, Controller, Post } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportPdfDto } from './dto/export-pdf.dto';

@Controller('export')
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    /**
     * POST /export/pdf
     * Generate a PDF from HTML content.
     * Returns { pdf: "base64-encoded-pdf-string" }
     */
    @Post('pdf')
    async exportPdf(@Body() dto: ExportPdfDto) {
        const pdf = await this.exportService.generatePdf(dto.html);
        return { pdf };
    }
}
