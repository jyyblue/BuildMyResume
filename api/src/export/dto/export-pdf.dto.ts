import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExportPdfDto {
    @IsString()
    @IsNotEmpty({ message: 'HTML content is required' })
    html: string;

    @IsOptional()
    @IsString()
    encryptedData?: string;

    @IsOptional()
    @IsString()
    signature?: string;
}
