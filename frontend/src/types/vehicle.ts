export type VehicleStatus =
  | "TERSEDIA"
  | "BERTUGAS"
  | "PERAWATAN"
  | "NONAKTIF";

export interface Vehicle {
  id: string;

  plateNumber: string;
  vehicleType: string;
  brand: string | null;
  capacityKg: number;
  year: number | null;
  status: VehicleStatus;

  created_at: string;
  updated_at: string;
}

export interface VehiclePayload {
  plateNumber: string;
  vehicleType: string;
  brand: string;
  capacityKg: number;
  year: number | null;
  status: VehicleStatus;
}
