export interface Customer {

    id: string;

    name: string;

    type: 'INDIVIDUAL' | 'COMPANY';

    company?: string;

    email: string;

    phone: string;

    address: string;

    createdAt: string;

    updatedAt: string;

}

export interface CustomerFormData {

    name: string;

    type: 'INDIVIDUAL' | 'COMPANY';

    company: string;

    email: string;

    phone: string;

    address: string;

}