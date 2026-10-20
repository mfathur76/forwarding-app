export type ShipmentStatus =
  | "MENUNGGU"
  | "DALAM_PERJALANAN"
  | "TERKIRIM"
  | "DIBATALKAN";

export interface Shipment {
  id: string;

  trackingNumber: string;
  customerId: string;
  driverId: string | null;
  vehicleId: string | null;
  origin: string;
  destination: string;
  weightKg: number;
  price: number;
  pickupDate: string | null;
  deliveryDate: string | null;
  cargoDescription: string | null;
  notes: string | null;
  status: ShipmentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface ShipmentPayload {
  customerId: string;
  driverId: string;
  vehicleId: string;
  origin: string;
  destination: string;
  weightKg: number;
  price: number;
  pickupDate: string;
  deliveryDate: string;
  cargoDescription: string;
  notes: string;
  status: ShipmentStatus;
}
