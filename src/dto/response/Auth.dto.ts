import { Admin } from 'src/schemas/admin.schema';
import { User } from 'src/schemas/user.schema';

export interface AuthLogin {
    message: string;
    data?: {
        token: string;
        user: User | Admin;
    };
}

export interface AuthHandleName {
    firstName: string;
    lastName: string;
}
