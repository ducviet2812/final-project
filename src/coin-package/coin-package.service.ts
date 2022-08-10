import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CoinPackage, CoinpackageDocument } from './../schemas/coinpackage.schema';
import { CoinPackageCreateDto, CoinPackageUpdateDto } from 'src/dto/request/coin-package.dto';

@Injectable()
export class CoinPackageService {
    constructor(@InjectModel(CoinPackage.name) private coinpackageModel: Model<CoinpackageDocument>) {}
    async findAll() {
        return {
            message: 'Get all packages successfully',
            data: {
                data: await this.coinpackageModel.find(),
            },
        };
    }
    async create(body: CoinPackageCreateDto) {
        try {
            return {
                message: 'Created package successfully',
                data: {
                    package: await this.coinpackageModel.create({
                        name: body.name,
                        coin: body.coin,
                    }),
                },
            };
        } catch (error) {
            throw error;
        }
    }
    async findById(coinPackageId: string) {
        return await this.coinpackageModel.findById(coinPackageId);
    }
    async _findById(coinPackageId: string) {
        const result = this.coinpackageModel.findById(coinPackageId);
        if (!result) throw new NotFoundException('Coin Package not found');
        return result;
    }
    async update(coinPackageId: string, body: CoinPackageUpdateDto) {
        try {
            if (!body.name && !body.coin) {
                throw new BadRequestException('Please enter package name and coin');
            }

            const coinPackage = await this._findById(coinPackageId);

            if (body.name) coinPackage.name = body.name;
            if (body.coin) coinPackage.coin = body.coin;

            await coinPackage.save();

            return {
                message: 'Updated package successfully',
                data: {
                    package: coinPackage,
                },
            };
        } catch (error) {
            throw error;
        }
    }
    async delete(coinPackageId: string) {
        try {
            const result = await this.coinpackageModel.deleteOne({ _id: coinPackageId });
            if (result.deletedCount === 0) throw new NotFoundException('Package not found');
            return {
                message: 'Deleted package successfully',
                data: {
                    _id: coinPackageId,
                },
            };
        } catch (error) {
            if (error.name === 'CastError') throw new BadRequestException('Id is invalid');
            throw error;
        }
    }
}
