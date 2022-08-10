import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MatchModule } from './match/match.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { GiftModule } from './gift/gift.module';
import { GiftLogModule } from './gift-log/gift-log.module';
import { NotificationModule } from './notification/notification.module';
import { MapModule } from './map/map.module';
import { AdminModule } from './admin/admin.module';
import { CoinPackageModule } from './coin-package/coin-package.module';
import { SystemModule } from './system/system.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env.development', '.env.production', '.env'],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (cfg: ConfigService) => ({
                uri: cfg.get('MONGODB_URI'),
                useNewUrlParser: true,
            }),
            inject: [ConfigService],
        }),
        TwilioModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (cfg: ConfigService) => ({
                accountSid: cfg.get('TWILIO_ACCOUNT_SID'),
                authToken: cfg.get('TWILIO_AUTH_TOKEN'),
            }),
            inject: [ConfigService],
        }),
        UserModule,
        AuthModule,
        MatchModule,
        ConversationModule,
        MessageModule,
        GiftModule,
        GiftLogModule,
        NotificationModule,
        MapModule,
        AdminModule,
        CoinPackageModule,
        SystemModule,
    ],
})
export class AppModule {}
