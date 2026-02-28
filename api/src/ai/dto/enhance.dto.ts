import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnhanceRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Content is required' })
    content: string;

    @IsString()
    @IsOptional()
    field?: string;

    @IsOptional()
    rejectedResponses?: string[];

    @IsOptional()
    @IsString()
    token?: string; // Kept for backwards compatibility but not required
}
