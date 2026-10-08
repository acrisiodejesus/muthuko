export type OrderStatus =
  | 'Aguardando Avaliação'
  | 'Em Reparação'
  | 'Pronto para Levantamento'
  | 'Entregue'
  | 'Abandonado (>45 dias)';

export type DeviceType =
  | 'TV'
  | 'Rádio'
  | 'Painel/Inversor Solar'
  | 'Amplificador'
  | 'Ferro'
  | 'Outro';

export type Neighborhood = 'Muhala' | 'Namutequeliua' | 'Outro';

export interface ServiceOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  neighborhood: Neighborhood;
  technicianName: string;
  deviceType: DeviceType;
  brandModel: string;
  reportedDefect: string;
  initialObservation: string;
  chassisPhotoUrl?: string;
  boardPhotoUrl?: string;
  status: OrderStatus;
  partsCost: number; // em Meticais (MT)
  laborCost: number; // em Meticais (MT)
  totalCost: number; // em Meticais (MT)
  createdAt: string;
  updatedAt: string;
  daysInShop: number;
  scavenged?: boolean;
}

export type PartCategory =
  | 'Transístor / MOSFET'
  | 'Capacitor'
  | 'Diodo / Retificador'
  | 'Regulador CI'
  | 'Conector / Chave'
  | 'Barramento LED'
  | 'Transformador / Bobina'
  | 'Outro';

export interface ReclaimedPart {
  id: string;
  code: string; // Ex: IRF3205, 13003, KBP307
  category: PartCategory;
  description: string;
  condition: 'Testado OK' | 'Requer Teste';
  donorOrderId?: string;
  donorDevice: string;
  binLocation: string; // Gaveta/Gaveteiro na oficina
  quantity: number;
  priceMT: number; // Valor justo em MT
  createdAt: string;
}

export interface WorkshopMetrics {
  totalOrders: number;
  zeroLossClaims: number;
  avgDecisionDays: number;
  savedPartsCount: number;
  totalSavedValueMT: number;
  ordersInRepair: number;
  ordersReady: number;
  ordersAbandoned: number;
}
