import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "/api/v1";

export interface ApiResponse<T> {

    success: boolean;

    message: string;

    data: T;

}

class ApiClient {

    private client: AxiosInstance;

    constructor() {

        this.client = axios.create({

            baseURL: API_BASE_URL,

            timeout: 30000,

        });

        this.client.interceptors.request.use(config => {

            const token = this.getToken();

            if (token) {

                config.headers.Authorization =
                    `Bearer ${token}`;

            }

            return config;

        });

        this.client.interceptors.response.use(

            response => response,

            (error: AxiosError) => {

                if (error.response?.status === 401) {

                    this.clearToken();

                    window.location.href = "/login";

                }

                return Promise.reject(error);

            }

        );

    }

    getToken() {

        return localStorage.getItem("auth_token");

    }

    setToken(token: string) {

        localStorage.setItem("auth_token", token);

    }

    clearToken() {

        localStorage.removeItem("auth_token");

    }

    async get<T>(url: string, params?: any) {

        const res = await this.client.get<ApiResponse<T>>(url, { params });

        return res.data.data;

    }

    async post<T>(url: string, body?: any) {

        const res = await this.client.post<ApiResponse<T>>(url, body);

        return res.data;

    }

    async put<T>(url: string, body?: any) {

        const res = await this.client.put<ApiResponse<T>>(url, body);

        return res.data.data;

    }

    async delete<T>(url: string) {

        const res = await this.client.delete<ApiResponse<T>>(url);

        return res.data.data;

    }

}

export const api = new ApiClient();