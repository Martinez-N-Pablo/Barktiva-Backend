export interface User {
    id: string;
    name: string;
    surname: string;
    email: string;
    password: string;
    photo?: string;
    birthdate?: Date;
    dogs: string[];
    tasks: string[];
}