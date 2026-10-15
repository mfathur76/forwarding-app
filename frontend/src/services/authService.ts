import { api } from "./api";

export interface User {

    id: string;

    fullName: string;

    email: string;

    role: string;

}

export async function login(

    email: string,

    password: string

) {

    return api.post<{

        token: string;

        user: User;

    }>("/auth/login", {

        email,

        password,

    });

}