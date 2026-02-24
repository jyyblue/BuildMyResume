import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnhanceRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Content is required' })
    content: string;

    @IsString()
    @IsOptional()
    field?: string;

    @IsString()
    @IsNotEmpty({ message: 'Puter auth token is required' })
    token: string;
}
