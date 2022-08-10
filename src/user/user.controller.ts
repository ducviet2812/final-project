import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { JwtGuard } from 'src/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LikeUserDto } from 'src/dto';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('like')
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard)
    async like(@Req() req: Request, @Body() body: LikeUserDto) {
        return this.userService.like((req.user as JWT_Info)._id, body.userId);
    }

    @Post('unlike')
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard)
    async unlike(@Req() req: Request, @Body() body: LikeUserDto) {
        return this.userService.unlike((req.user as JWT_Info)._id, body.userId);
    }

    @Post('block')
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard)
    async block(@Req() req: Request, @Body() body: LikeUserDto) {
        return this.userService.block((req.user as JWT_Info)._id, body.userId);
    }

    @Post('unblock')
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard)
    async unblock(@Req() req: Request, @Body() body: LikeUserDto) {
        return this.userService.unblock((req.user as JWT_Info)._id, body.userId);
    }
}
