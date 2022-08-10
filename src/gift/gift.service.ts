import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BuyGiftDto, GiftDto, SendGiftDto } from 'src/dto/request/Gift.dto';
import { GiftLogService } from 'src/gift-log/gift-log.service';
import { Gift, GiftDocument } from 'src/schemas/gift.schema';
import { SystemService } from 'src/system/system.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GiftService {
    constructor(
        @InjectModel(Gift.name) private giftModel: Model<GiftDocument>,
        private readonly giftLogService: GiftLogService,
        private readonly userService: UserService,
        private readonly systemService: SystemService,
    ) {}

    async findAll() {
        return {
            message: 'Get list gifts successfully',
            data: {
                gifts: await this.giftModel.find(),
            },
        };
    }

    async create(body: GiftDto) {
        try {
            return {
                message: 'Created gift successfully',
                data: {
                    gift: await this.giftModel.create({
                        name: body.name,
                        price: body.value,
                        image: body.image,
                    }),
                },
            };
        } catch (error) {
            throw new BadRequestException('Something went wrong');
        }
    }

    async update(giftId: string, body: GiftDto) {
        try {
            if (!body.name && !body.value && !body.image) {
                throw new BadRequestException('Please enter name, value or image');
            }

            const gift = await this.giftModel.findById(giftId);
            if (!gift) {
                throw new NotFoundException('Gift not found');
            }

            if (body.name) gift.name = body.name;
            if (body.value) gift.price = body.value;
            if (body.image) gift.image = body.image;

            await gift.save();

            return {
                message: 'Updated gift successfully',
                data: {
                    gift,
                },
            };
        } catch (error) {
            throw new BadRequestException('Something went wrong');
        }
    }

    async delete(giftId: string) {
        try {
            await this.giftModel.deleteOne({ _id: giftId });
            return {
                message: 'Deleted gift successfully',
                data: {
                    id: giftId,
                },
            };
        } catch (error) {
            throw new BadRequestException('Something went wrong');
        }
    }

    async send(sendId: string, body: SendGiftDto) {
        try {
            const { receiveId, giftId } = body;
            const result = await this.userService.updateBagSendGift(sendId, receiveId, giftId);

            await this.giftLogService.createSendGiftLog(sendId, receiveId, giftId);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async buy(userId: string, body: BuyGiftDto) {
        try {
            const gift = await this.giftModel.findById(body.giftId);

            //getting gift price now
            const bagItem = {
                giftId: gift._id + '',
                quantity: body.quantity,
                price: gift.price,
            };
            const updateUser = await this.userService.updateBagBuyGift(userId, bagItem);

            await this.giftLogService.createBuyGiftLog(userId, body.giftId, body.quantity);

            return {
                message: 'Buy gift successfully',
                data: {
                    user: updateUser,
                },
            };
        } catch (error) {
            throw error;
        }
    }

    async exchange(userId: string, giftId: string, quantity: number) {
        try {
            const user = await this.userService._findById(userId);
            let indexGift = -1;
            let isGiftExistInBag = false;

            for (let i = 0; i < user.bag.length; i++) {
                const item = user.bag[i];
                if (item.id_gift.toString() === giftId) {
                    isGiftExistInBag = true;

                    if (item.quanity < quantity) {
                        throw new BadGatewayException("Don't have enough gift to exchange");
                    } else {
                        const gift = await this.giftModel.findById(giftId);

                        const exchangeGift = await this.systemService._findByName('COIN_EXCHANGE_RATE');

                        //add coin to wallet
                        user.wallet_amount += quantity * gift.price * +exchangeGift.value;
                        user.bag[i].quanity -= quantity;
                        if (user.bag[i].quanity === 0) {
                            indexGift = i;
                        }

                        //TODO: add transaction here
                    }
                    break;
                }
            }

            if (!isGiftExistInBag) {
                throw new NotFoundException("Gift doesn't exist in your bag or in system.");
            }

            if (indexGift >= 0) {
                user.bag.splice(indexGift, 1);
            }

            await user.save();

            return {
                message: 'Exchange gift to coin successfully',
                data: {
                    user,
                },
            };
        } catch (error) {
            throw error;
        }
    }
}
