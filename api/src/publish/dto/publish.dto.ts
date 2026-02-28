import { IsString, IsOptional } from 'class-validator';

export class PublishDto {
    @IsString()
    encryptedResumeData: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    existingId?: string;
}
