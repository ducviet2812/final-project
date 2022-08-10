import { Body, Controller, Get, HttpStatus, Req, Res, UseGuards, Post } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { AuthLoginAdminDto, AuthOTPDto, AuthRegisterAdminDto, AuthSendOTPDto } from 'src/dto';
import { AuthLogin } from 'src/dto/response/Auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('/facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookLogin(): Promise<HttpStatus> {
        return HttpStatus.OK;
    }

    @Get('/google')
    @UseGuards(AuthGuard('google'))
    async googleLogin(): Promise<HttpStatus> {
        return HttpStatus.OK;
    }

    @Get('/facebook/redirect')
    @UseGuards(AuthGuard('facebook'))
    async facebookLoginRedirect(@Req() req: Request, @Res() res: Response): Promise<any> {
        res.send(await this.authService.socialLogin(req.user as SocialReponse));
    }

    @Get('/google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleLoginRedirect(@Req() req: Request, @Res() res: Response) {
        res.send(await this.authService.socialLogin(req.user as SocialReponse));
    }

    @Post('/send-otp')
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard)
    async sendOtp(@Req() req: Request, @Res() res: Response) {
        res.send(await this.authService.sendOTP(req.user as JWT_Info));
    }

    @Post('/send-otp-register')
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard)
    async sendOtpRegister(@Req() req: Request, @Body() authSendOTP: AuthSendOTPDto) {
        // res.send(await this.authService.sendOTPRegister(req.user as JWT_Info, authSendOTP.phone));
        return await this.authService.sendOTPRegister(req.user as JWT_Info, authSendOTP.phone);
    }

    @Post('verify-otp')
    @ApiBearerAuth('access_token')
    @UseGuards(JwtGuard)
    async verifyOtp(@Req() req: Request, @Body() authOTP: AuthOTPDto, @Res() res: Response) {
        res.send(await this.authService.verifyOTP((req.user as JWT_Info).email, authOTP.otp));
    }

    @Post('phone')
    async phoneLogin(@Body('phone') phone: string, @Res() res: Response) {
        res.send(await this.authService.phoneLogin(phone));
    }
    //Admin Login
    @Post('/admin/register')
    async adminRegister(@Body() authRegisterAdmin: AuthRegisterAdminDto): Promise<AuthLogin> {
        return await this.authService.adminRegister(authRegisterAdmin);
    }
    @Post('/admin/login')
    async adminLogin(@Body() authLoginAdmin: AuthLoginAdminDto): Promise<AuthLogin> {
        return await this.authService.adminLogin(authLoginAdmin);
    }
}
