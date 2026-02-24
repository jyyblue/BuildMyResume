import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Brief is required' })
    brief: string;

    @IsString()
    @IsNotEmpty({ message: 'Puter auth token is required' })
    token: string;

    @IsOptional()
    context?: {
        targetRole?: string;
        industry?: string;
        experienceLevel?: string;
    };
}
