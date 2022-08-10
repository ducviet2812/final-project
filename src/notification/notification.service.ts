import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from 'src/schemas/notification.schema';

@Injectable()
export class NotificationService {
    constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) {}
    create(notification: iNotificationCreate): Promise<NotificationDocument> {
        return this.notificationModel.create(notification);
    }
    async delete(userId: string, notiId: string) {
        return this.notificationModel.deleteOne({ _id: notiId, user: userId });
    }
    async updateSeen(userId: string, notiId: string, hasSeen?: boolean) {
        try {
            const noti = await this.notificationModel.findOneAndUpdate(
                { _id: notiId, user: userId },
                { hasSeen: hasSeen ? hasSeen : true },
                { new: true },
            );
            if (!noti) {
                throw new BadRequestException('Notification not found');
            }
            return {
                message: 'Notification updated',
                data: noti,
            };
        } catch (error) {
            throw error;
        }
    }
    like(toUser: string): Promise<NotificationDocument> {
        return this.create({
            type: NotificationType.LIKE,
            message: `Someone liked you`,
            user: toUser,
        });
    }
    match(fromUser: iMatchUser, toUser: iMatchUser): Promise<[NotificationDocument, NotificationDocument]> {
        return Promise.all([
            this.create({
                type: NotificationType.MATCH,
                message: 'You and ' + fromUser.name.first_name + fromUser.name.last_name + ' are now friends!',
                user: toUser._id,
            }),
            this.create({
                type: NotificationType.MATCH,
                message: 'You and ' + toUser.name.first_name + toUser.name.last_name + ' are now friends!',
                user: fromUser._id,
            }),
        ]);
    }
    async gift(sendUser: string, toUser: string): Promise<NotificationDocument> {
        return this.create({
            type: NotificationType.GIFT,
            message: `You received a gift from ${sendUser}`,
            user: toUser,
        });
    }
}
