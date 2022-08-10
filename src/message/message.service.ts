import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from 'src/schemas/conversation.schema';
import { Message, MessageDocument } from 'src/schemas/message.schema';

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    ) {}
    async create(userId: string, body: iMessageCreate): Promise<MessageDocument> {
        const conversation = await this.conversationModel.findOne({
            users: { $in: [userId, body.idReceive] },
        });
        const newMessage = await this.messageModel.create({
            id_send: userId,
            id_receive: body.idReceive,
            messages: body.messages,
            exp: body.exp ? Date.now() + body.exp * 1000 * 60 : undefined,
        });
        if (!conversation) {
            await this.conversationModel.create({
                users: [userId, body.idReceive],
                messages: [newMessage._id],
            });
        } else {
            conversation.messages.push(newMessage._id as string & Message & Document);
            await conversation.save();
        }
        return newMessage;
    }
}
