import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { TransactionDocument } from './transaction.schema';
import 'dotenv/config';
export type UserDocument = User & Document;
export enum UserGender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

@Schema({
    timestamps: true,
})
export class User {
    _id: string;
    @Prop({
        type: String,
        unique: true,
        sparse: true,
    })
    phone: string;

    @Prop({
        type: String,
        unique: true,
        sparse: true,
    })
    email: string;

    @Prop({
        type: {
            first_name: String,
            last_name: String,
        },
    })
    name: {
        first_name: string;
        last_name: string;
    };

    @Prop({
        type: String,
        unique: true,
        sparse: true,
    })
    nickname: string;

    @Prop({
        type: String,
        enum: UserGender,
    })
    gender: UserGender;

    @Prop({
        type: mongoose.Schema.Types.Date,
    })
    birthday: Date;

    @Prop({
        type: {
            is_verified: Boolean,
            is_active: Boolean,
        },
        default: {
            is_verified: false,
            is_active: true,
        },
    })
    status: {
        is_verified: boolean;
        is_active: boolean;
    };

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
    friends: UserDocument[] | string[];

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
    block: UserDocument[] | string[];

    @Prop({
        type: Number,
        default: 0,
    })
    wallet_amount: number;

    @Prop({
        type: String,
    })
    avatar: string;

    @Prop({
        type: {
            bio: String,
            album: [String],
        },
    })
    profile: {
        bio: string;
        album: [string];
    };

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    })
    transactions: TransactionDocument[] | string[];

    @Prop([
        {
            id_gift: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Gift',
            },
            quanity: Number,
        },
    ])
    bag: [
        {
            id_gift: string;
            quanity: number;
        },
    ];

    @Prop({
        type: {
            latitude: Number,
            longitude: Number,
        },
    })
    last_location: {
        latitude: number;
        longitude: number;
    };

    @Prop({
        type: mongoose.Schema.Types.Date,
        default: Date.now(),
    })
    last_login: Date;

    @Prop({
        type: {
            expire: mongoose.Schema.Types.Date,
            times: Number,
        },
        default: {
            expire: new Date(Date.now() + 15 * 60 * 1000),
            times: 4,
        },
    })
    otp: {
        expire: Date;
        times: number;
    };
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
    const user = this as UserDocument;
    if (user.isNew && user.email) {
        user.nickname = user.email.split('@')[0];
    }
    if (user.otp.times === 0 && user.status.is_active) {
        user.status.is_active = false;
    }
    next();
});
