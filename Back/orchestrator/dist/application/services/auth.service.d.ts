import { UsersClient } from '../clients/users.client';
export declare class AuthService {
    private usersClient;
    constructor(usersClient: UsersClient);
    login(dto: any): Promise<any>;
    register(dto: any): Promise<any>;
}
