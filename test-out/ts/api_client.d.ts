export interface User {
    id: number;
    name: string;
    email: string;
}
export declare function fetchUsers(): Promise<User[]>;
