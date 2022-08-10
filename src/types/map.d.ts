declare interface ILocation {
    latitude: number;
    longitude: number;
}

declare interface IUserLocation {
    name: string;
    avatar: string;
    location: {
        latitude: number;
        longitude: number;
    };
}
