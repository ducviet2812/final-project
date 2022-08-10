import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model, ObjectId } from 'mongoose';
import { Conversation, ConversationDocument } from 'src/schemas/conversation.schema';

@Injectable()
export class ConversationService {
    constructor(@InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>) {}

    async createConversation(userAId: ObjectId, userBId: ObjectId): Promise<Conversation> {
        const conversation = await this.conversationModel.create({
            users: [userAId, userBId],
        });

        return conversation;
    }
    async delete(userAId: ObjectId, userBId: ObjectId): Promise<DeleteResult> {
        return this.conversationModel.deleteOne({
            users: {
                $all: [userAId, userBId],
            },
        });
    }
}
