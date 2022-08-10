import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GiftDocument } from './gift.schema';
import { UserDocument } from './user.schema';
import mongoose from 'mongoose';

export type GiftLogDocument = GiftLog & Document;
@Schema({
    timestamps: true,
})
export class GiftLog {
    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    })
    id_send: UserDocument | string;

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    })
    id_receive: UserDocument | string;

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift',
    })
    gift: GiftDocument | string;

    @Prop({
        required: true,
        type: Number,
    })
    quantity: number;
}

export const GiftLogSchema = SchemaFactory.createForClass(GiftLog);
