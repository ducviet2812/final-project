import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsDefined,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNotEmptyObject,
    IsObject,
    IsOptional,
    IsString,
    Length,
    Matches,
    ValidateNested,
} from 'class-validator';
import { UserGender } from 'src/schemas/user.schema';

export class UserCreateDto {
    @ApiProperty({ type: String })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ type: String, default: 'Nguyễn Văn' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ type: String, default: 'An' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ type: String, default: 'www.user-avatar.com' })
    @IsString()
    @IsNotEmpty()
    avatar: string;
}

export class UserCreateWithPhoneDto {
    @ApiProperty({ type: String, default: '0987654321' })
    @IsString()
    @IsNotEmpty()
    phone: string;
}

export class LikeUserDto {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class UserNameDto {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Length(2, 20)
    first_name: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Length(2, 20)
    last_name: string;
}

export class UserProfileDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    bio: string;

    @IsOptional()
    @IsArray()
    @IsNotEmpty()
    @IsString({ each: true })
    @IsNotEmptyObject()
    album: string[];
}

export class UserUpdateDto {
    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => UserNameDto)
    @ApiProperty({
        type: String,
        default: {
            first_name: 'Nguyễn Văn',
            last_name: 'An',
        },
    })
    name: UserNameDto;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Za-z0-9]+([A-Za-z0-9]*|[._-]?[A-Za-z0-9]+)*$/g)
    @ApiProperty({ type: String, default: 'nguyenvana123' })
    nickname: string;

    @ApiProperty({ type: UserGender, default: UserGender.MALE })
    @IsOptional()
    @IsEnum(UserGender)
    gender: UserGender;

    @ApiProperty({ type: Date, default: '' })
    @IsOptional()
    @IsNotEmpty()
    @IsDateString()
    birthday: Date;

    @ApiProperty({ type: String, default: '' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    avatar: string;

    @ApiProperty({
        type: UserProfileDto,
        default: {
            bio: '',
            album: [],
        },
    })
    @IsOptional()
    @IsObject()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => UserProfileDto)
    profile: UserProfileDto;
}
