import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MapService {
    constructor(private readonly userService: UserService) {}

    async updateLocation(userId: string, location: ILocation) {
        try {
            return this.userService.updateLocation(userId, location);
        } catch (error) {
            throw new BadRequestException('Something went wrong!');
        }
    }

    async findFriendAround(userId: string) {
        try {
            //Get radius from Setting collections
            const radius = 200; // meters

            const me = await this.userService.findById(userId);
            const users = await this.userService.getOtherUser(userId);
            const friendsAround: IUserLocation[] = [];

            users.forEach((user) => {
                if (user.last_location.latitude && user.last_location.longitude) {
                    if (this.getDistance(me.last_location, user.last_location) <= radius) {
                        friendsAround.push({
                            name: user.name.first_name + ' ' + user.name.last_name,
                            avatar: user.avatar,
                            location: user.last_location,
                        });
                    }
                }
            });

            return friendsAround;
        } catch (error) {
            throw new BadRequestException('Have some errors when finding friends around.');
        }
    }

    getDistance(locationA: ILocation, locationB: ILocation) {
        const R = 6378137;
        const rlat1 = locationA.latitude * (Math.PI / 180);
        const rlat2 = locationB.latitude * (Math.PI / 180);
        const difflat = rlat2 - rlat1; // Radian difference (latitudes)
        const difflon = (locationB.longitude - locationA.longitude) * (Math.PI / 180);

        const distance =
            2 *
            R *
            Math.asin(
                Math.sqrt(
                    Math.sin(difflat / 2) * Math.sin(difflat / 2) +
                        Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2),
                ),
            );
        return distance;
    }
}
