import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateAdminDto } from 'src/dto/request/Admin.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RolesGuard, UserRole } from 'src/guards/roles.guard';
import { Roles } from 'src/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post('/')
    @ApiBearerAuth('access_token')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtGuard, RolesGuard)
    update(@Req() req: Request, @Body() body: UpdateAdminDto) {
        return this.adminService.update((req.user as JWT_Info)._id, body);
    }
}
