import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MessageCreateDto } from 'src/dto/request/Message.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { MessageService } from './message.service';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Message')
@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}
    @Post()
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard)
    async create(@Req() req: Request, @Body() body: MessageCreateDto) {
        return await this.messageService.create((req.user as JWT_Info)._id, body);
    }
}
