import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from 'src/schemas/match.schema';

@Injectable()
export class MatchService {
    constructor(@InjectModel(Match.name) private matchModel: Model<MatchDocument>) {}

    async isAMatchB(userAId: string, userBId: string): Promise<string> {
        const aMatchB = await this.matchModel.findOne({ id_from: userAId, id_to: userBId });
        if (aMatchB) return aMatchB._id;
        return null;
    }
    async create(idFrom: string, idTo: string) {
        await this.matchModel.create({
            id_from: idFrom,
            id_to: idTo,
        });
    }

    async delete(matchId: string) {
        await this.matchModel.deleteOne({ _id: matchId });
    }
}
