import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { AdminService } from 'src/admin/admin.service';
import { AuthLoginAdminDto, AuthLoginSocialDto, AuthRegisterAdminDto } from 'src/dto';
import { AuthLogin, AuthHandleName } from 'src/dto/response/Auth.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly adminService: AdminService,
        private config: ConfigService,
        private jwt: JwtService,
        @InjectTwilio() private readonly twilioClient: TwilioClient,
    ) {}
    async signToken(_id: string, email: string, role?: string): Promise<string> {
        const secret: string = this.config.get('JWT_SECRET');
        const payload: JWT_Info = {
            _id,
            email,
        };
        if (role) payload.role = role;
        return this.jwt.signAsync(payload, {
            expiresIn: this.config.get('JWT_EXPIRATION_TIME'),
            secret,
        });
    }
    handleName(firstName: string | undefined, lastName: string | undefined): AuthHandleName {
        const fullName = (firstName || '') + ' ' + (lastName || '');
        const nameSplit = fullName.split(' ').filter((c) => c !== '');
        const newLastName = nameSplit[nameSplit.length - 1];
        nameSplit.pop();
        const newFirstName = nameSplit.join(' ');
        return { firstName: newFirstName, lastName: newLastName };
    }
    async socialLogin(body: AuthLoginSocialDto): Promise<AuthLogin> {
        try {
            const { email, firstName, lastName, avatar } = body;
            // const user = await (await this.userService.findWithEmail(email)).populate('friends', 'email name avatar');
            const user = await this.userService.findByEmail(email);
            const nameHandle = this.handleName(firstName, lastName);
            if (!user) {
                console.log('newUser');
                const newUser = await this.userService.create({
                    email,
                    firstName: nameHandle.firstName,
                    lastName: nameHandle.lastName,
                    avatar,
                });
                return {
                    message: 'Register success',
                    data: {
                        token: await this.signToken(newUser._id, newUser.email),
                        user: newUser,
                    },
                };
            }
            return {
                message: 'Login success',
                data: {
                    token: await this.signToken(user._id, user.email),
                    user: await user.populate('friends', 'email name avatar'),
                },
            };
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
    convertPhone(phone: string): string {
        let newPhone = phone;
        if (newPhone[0] === '0') {
            newPhone = '+84' + newPhone.substring(1);
        }
        return newPhone;
    }
    async sendSMS(phone: string) {
        try {
            const serviceSid = this.configService.get('TWILIO_VERIFICATION_SERVICE_SID');
            const phoneNumber = this.convertPhone(phone);
            return this.twilioClient.verify
                .services(serviceSid)
                .verifications.create({ to: phoneNumber, channel: 'sms' });
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }
    async sendOTP(userInfo: JWT_Info): Promise<AuthLogin> {
        try {
            const user = await this.userService.findByEmail(userInfo.email);

            if (!user) throw new NotFoundException('User not found');
            await this.userService.updateOTP(user.email);
            await this.sendSMS(user.phone);

            return {
                message: 'Send otp success',
            };
        } catch (error) {
            throw error;
        }
    }
    async sendOTPRegister(userInfo: JWT_Info, phone: string): Promise<AuthLogin> {
        try {
            const user = await this.userService.findByEmail(userInfo.email);

            if (!user) throw new NotFoundException('User not found');
            if (user.status.is_verified) throw new BadRequestException('User already verified');

            await this.userService.updateOTPWithPhone(user.email, phone);
            await this.sendSMS(phone);

            return {
                message: 'Send otp success',
            };
        } catch (error) {
            throw error;
        }
    }
    async verifyOTP(email: string, otp: string): Promise<AuthLogin> {
        try {
            const user = await this.userService.findByEmail(email);

            if (!user.status.is_active) throw new BadRequestException('User was blocked! Contact admin');
            if (+user.otp.expire < Date.now()) throw new BadRequestException('OTP expired');

            /* twillio handle */
            const serviceSid = this.configService.get('TWILIO_VERIFICATION_SERVICE_SID');
            const result = await this.twilioClient.verify
                .services(serviceSid)
                .verificationChecks.create({ to: this.convertPhone(user.phone), code: otp });
            if (!result.valid || result.status !== 'approved') {
                user.otp.times -= 1;
                await user.save();
                let message = 'OTP invalid';
                if (user.status.is_verified) {
                    message = `OTP invalid! If you submit the wrong code ${user.otp.times} again, you will be locked out of your account.`;
                }
                throw new BadRequestException(message);
            }

            user.otp.times = +process.env.OTP_MAX_TURN;
            user.status.is_verified = true;

            await user.save();

            return {
                message: 'Verify otp success',
            };
        } catch (error) {
            throw error;
        }
    }
    async phoneLogin(phone: string): Promise<AuthLogin> {
        try {
            const user = await this.userService.findByPhone(phone);
            if (!user) {
                const newUser = await this.userService.createWithPhone({ phone });
                return {
                    message: 'Register success',
                    data: {
                        token: await this.signToken(newUser._id, ''),
                        user: newUser,
                    },
                };
            }
            return {
                message: 'Login success',
                data: {
                    token: await this.signToken(user._id, user.email),
                    user,
                },
            };
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
    async adminRegister(body: AuthRegisterAdminDto): Promise<AuthLogin> {
        try {
            const newAdmin = await this.adminService.create(body);
            newAdmin.password = undefined;
            return {
                message: 'Register success',
                data: {
                    token: await this.signToken(newAdmin._id, newAdmin.email, 'admin'),
                    user: newAdmin,
                },
            };
        } catch (error) {
            throw error;
        }
    }
    async adminLogin(body: AuthLoginAdminDto): Promise<AuthLogin> {
        try {
            const { username, password } = body;
            const admin = await this.adminService._findByUsername(username);
            if (!(await admin.comparePassword(password))) throw new BadRequestException('Password invalid');
            admin.password = undefined;
            return {
                message: 'Login success',
                data: {
                    token: await this.signToken(admin._id, admin.email, 'admin'),
                    user: admin,
                },
            };
        } catch (error) {
            throw error;
        }
    }
}
