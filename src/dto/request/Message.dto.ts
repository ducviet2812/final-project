import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MessageCreateDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    idReceive: string;

    @ApiProperty()
    @IsArray()
    messages: [{ type: MessageType; value: string }];

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    exp: number;
}
