import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);

    /**
     * Generate a PDF from HTML content using Puppeteer.
     * Returns the PDF as a base64-encoded string.
     */
    async generatePdf(html: string): Promise<string> {
        let browser: any = null;

        try {
            // Dynamic import to avoid bundling issues
            const puppeteer = await import('puppeteer');
            browser = await puppeteer.default.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
            });

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });

            await browser.close();
            browser = null;

            return Buffer.from(pdfBuffer).toString('base64');
        } catch (error) {
            this.logger.error('PDF generation failed', error);
            throw new HttpException(
                'Failed to generate PDF',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        } finally {
            if (browser) {
                try {
                    await browser.close();
                } catch {
                    // Ignore cleanup errors
                }
            }
        }
    }
}
