export type DriverStatus =
  | "TERSEDIA"
  | "BERTUGAS"
  | "NONAKTIF";

export interface Driver {
  id: string;

  name: string;
  phone: string | null;
  licenseNumber: string;
  status: DriverStatus;
  address: string | null;

  created_at: string;
  updated_at: string;
}
export interface DriverFormData {
  
  name: string;
  phone: string | null;
  licenseNumber: string;
  status: DriverStatus;
  address: string | null;


}
export interface DriverPayload {
  name: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  address: string;
}

export interface DriverQuery {
  search?: string;
  limit?: number;
  offset?: number;
}