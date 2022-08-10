import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConversationService } from 'src/conversation/conversation.service';
import { UserCreateDto, UserCreateWithPhoneDto, UserUpdateDto } from 'src/dto';
import { MatchService } from 'src/match/match.service';
import { NotificationService } from 'src/notification/notification.service';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private matchService: MatchService,
        private notificationService: NotificationService,
        private conversationService: ConversationService,
    ) {}
    async create(body: UserCreateDto): Promise<User> {
        return this.userModel.create({
            email: body.email,
            name: {
                first_name: body.firstName,
                last_name: body.lastName,
            },
            avatar: body.avatar,
        });
    }
    async findById(id: string): Promise<UserDocument> {
        return this.userModel.findById(id);
    }
    async _findById(id: string): Promise<UserDocument> {
        const result = this.userModel.findById(id);
        if (result) throw new NotFoundException('User not found');
        return result;
    }
    async findByEmail(email: string): Promise<UserDocument> {
        return this.userModel.findOne({ email });
    }
    async updateOTP(email: string): Promise<UserDocument> {
        return this.userModel.findOneAndUpdate(
            { email },
            {
                otp: {
                    times: 5,
                    expire: new Date(Date.now() + 10 * 60 * 1000),
                },
            },
        );
    }
    async updateOTPWithPhone(email: string, phone: string): Promise<UserDocument> {
        return this.userModel.findOneAndUpdate(
            { email },
            {
                phone,
                otp: {
                    times: 5,
                    expire: new Date(Date.now() + 10 * 60 * 1000),
                },
            },
        );
    }
    async like(fromUser: string, toUser: string) {
        const matchId = await this.matchService.isAMatchB(toUser, fromUser);
        if (matchId) {
            await this.matchService.delete(matchId);
            const userA = await this.userModel.findByIdAndUpdate(fromUser, {
                $push: {
                    friends: new mongoose.Types.ObjectId(toUser) + '',
                },
            });
            const userB = await this.userModel.findByIdAndUpdate(toUser, {
                $push: {
                    friends: new mongoose.Types.ObjectId(fromUser) + '',
                },
            });

            await this.conversationService.createConversation(userA._id, userB._id);

            await this.notificationService.match(userA, userB);
        } else {
            await this.notificationService.like(toUser);

            await this.matchService.create(fromUser, toUser);
        }
        return {
            message: 'You have liked this user',
            data: {
                user: toUser,
            },
        };
    }
    async unlike(fromUser: string, toUser: string) {
        try {
            const matchId = await this.matchService.isAMatchB(fromUser, toUser);
            if (matchId) {
                await this.matchService.delete(matchId);
            } else {
                const userA = await this.userModel.findByIdAndUpdate(fromUser, {
                    $pull: {
                        friends: new mongoose.Types.ObjectId(toUser) + '',
                    },
                });
                const userB = await this.userModel.findByIdAndUpdate(toUser, {
                    $pull: {
                        friends: new mongoose.Types.ObjectId(fromUser) + '',
                    },
                });
                await this.conversationService.delete(userA._id, userB._id);
            }
            return {
                message: 'You have unliked this user',
                data: {
                    user: toUser,
                },
            };
        } catch (error) {
            throw error;
        }
    }
    async block(userId: string, blockedUserId: string) {
        try {
            const user = await this._findById(userId);
            await this.userModel.findByIdAndUpdate(userId, {
                $push: {
                    blocked: blockedUserId,
                },
            });
            await this.conversationService.delete(user._id, new mongoose.Schema.Types.ObjectId(blockedUserId));
            return {
                message: 'Blocked user successfully',
                data: {
                    user: blockedUserId,
                },
            };
        } catch (error) {
            throw error;
        }
    }
    async unblock(userId: string, blockedUserId: string) {
        try {
            const user = await this.userModel.findOneAndUpdate(
                { _id: userId, block: { $in: [blockedUserId] } },
                {
                    $pull: {
                        blocked: blockedUserId,
                    },
                },
                { new: true },
            );
            return {
                message: 'Unblocked user successfully',
                data: {
                    user: user._id,
                },
            };
        } catch (error) {
            throw error;
        }
    }

    async updateBagBuyGift(userId: string, bagItem: BagItem) {
        const user = await this._findById(userId);
        const totalPrice: number = bagItem.price * bagItem.quantity;

        if (user.wallet_amount >= totalPrice) {
            user.wallet_amount -= totalPrice;

            let isExistItemBag = false;
            for (let i = 0; i < user.bag.length; i++) {
                if (user.bag[i].id_gift.toString() === bagItem.giftId) {
                    user.bag[i].quanity += bagItem.quantity;
                    isExistItemBag = true;
                    break;
                }
            }

            if (!isExistItemBag) {
                user.bag.push({
                    id_gift: bagItem.giftId,
                    quanity: bagItem.quantity,
                });
            }

            //TODO: create transaction

            return await user.save();
        }
        throw new BadRequestException('Not enough money');
    }
    async updateBagSendGift(sendId: string, receiveId: string, giftId: string) {
        const sendUser = await this._findById(sendId);
        const receiveUser = await this._findById(receiveId);

        let indexSendUserHasOneGift = -1;
        let isSendUserHasGift = false;
        let isReceiveUserHasGift = false;

        for (let i = 0; i < sendUser.bag.length; i++) {
            if (sendUser.bag[i].id_gift.toString() === giftId) {
                if (sendUser.bag[i].quanity === 1) {
                    indexSendUserHasOneGift = i;
                }
                sendUser.bag[i].quanity -= 1;
                isSendUserHasGift = true;
                break;
            }
        }

        // if send user has one gift
        if (!indexSendUserHasOneGift) {
            sendUser.bag.splice(indexSendUserHasOneGift, 1);
        }

        // if receive user has gift
        if (!isSendUserHasGift) {
            throw new BadRequestException("User don't have this gift");
        }

        // if receive user has gift
        for (let i = 0; i < receiveUser.bag.length; i++) {
            if (receiveUser.bag[i].id_gift.toString() === giftId) {
                receiveUser.bag[i].quanity += 1;
                isReceiveUserHasGift = true;
                break;
            }
        }

        //if receive users bag doesn't have this gift before then it will be pushed to receive user's bag
        if (!isReceiveUserHasGift) {
            receiveUser.bag.push({
                id_gift: giftId,
                quanity: 1,
            });
        }

        await sendUser.save();
        await receiveUser.save();

        return {
            message: 'Send gift successfully',
            data: {
                giftId,
            },
        };
    }
    async updateLocation(userId: string, location: ILocation) {
        const updatedUser = await this.userModel.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    last_location: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                },
            },
            { new: true },
        );
        return updatedUser;
    }
    async getOtherUser(userId: string) {
        return await this.userModel.find({ _id: { $ne: userId }, last_location: { $ne: undefined } });
    }
    async findByPhone(phone: string): Promise<UserDocument> {
        return this.userModel.findOne({ phone });
    }
    async createWithPhone(body: UserCreateWithPhoneDto): Promise<User> {
        return this.userModel.create({
            phone: body.phone,
        });
    }
    async update(userId: string, body: UserUpdateDto): Promise<User> {
        return this.userModel.findByIdAndUpdate(userId, body, { new: true });
    }
}
