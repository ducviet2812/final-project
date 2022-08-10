import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserDocument } from './user.schema';

export type MessageDocument = Message & Document;
enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
}

@Schema({
    timestamps: true,
})
export class Message {
    _id: string;
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
        type: [
            {
                value: String,
                type: {
                    type: String,
                    enum: MessageType,
                },
            },
        ],
    })
    messages: [
        {
            value: string;
            type: MessageType;
        },
    ];

    @Prop({
        type: mongoose.Schema.Types.Date,
    })
    exp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
