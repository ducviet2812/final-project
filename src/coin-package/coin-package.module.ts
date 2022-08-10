import { Module } from '@nestjs/common';
import { CoinPackageService } from './coin-package.service';
import { CoinPackageController } from './coin-package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CoinPackage, CoinPackageSchema } from 'src/schemas/coinpackage.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: CoinPackage.name, schema: CoinPackageSchema }])],
    providers: [CoinPackageService],
    controllers: [CoinPackageController],
})
export class CoinPackageModule {}
