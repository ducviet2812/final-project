import { CoinPackageService } from './coin-package.service';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Roles } from 'src/roles.decorator';
// import { JwtGuard } from 'src/guards/jwt.guard';
import { RolesGuard, UserRole } from 'src/guards/roles.guard';
import { CoinPackageCreateDto, CoinPackageUpdateDto } from 'src/dto/request/coin-package.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Coin Package')
@Controller('coinpackage')
export class CoinPackageController {
    constructor(private readonly coinPackageService: CoinPackageService) {}

    @Get()
    async getList() {
        return await this.coinPackageService.findAll();
    }

    @Post()
    @ApiBearerAuth('access_token')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtGuard, RolesGuard)
    async create(@Body() body: CoinPackageCreateDto) {
        return await this.coinPackageService.create(body);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard, RolesGuard)
    async update(@Body() body: CoinPackageUpdateDto, @Param('id') id: string) {
        return await this.coinPackageService.update(id, body);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard, RolesGuard)
    async delete(@Param('id') id: string) {
        return await this.coinPackageService.delete(id);
    }
}
