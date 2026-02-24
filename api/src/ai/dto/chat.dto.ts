import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ChatMode {
    CHAT = 'CHAT',
    GENERATE = 'GENERATE',
    ENHANCE = 'ENHANCE',
}

export class ChatRequestDto {
    @IsNotEmpty({ message: 'Messages are required' })
    messages: any;

    @IsString()
    @IsNotEmpty({ message: 'Puter auth token is required' })
    token: string;

    @IsEnum(ChatMode, { message: 'Mode must be CHAT, GENERATE, or ENHANCE' })
    @IsOptional()
    mode?: ChatMode;

    @IsOptional()
    stream?: boolean;
}
