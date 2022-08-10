declare interface iNotificationCreate {
    type: NotificationType;
    message: string;
    user: string;
}
declare interface iMatchUser {
    _id: string;
    name: {
        first_name: string;
        last_name: string;
    };
}
