
export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Produção',
  COMPLETED = 'Concluída',
  CANCELLED = 'Cancelada'
}

export enum Priority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  URGENT = 'Urgente'
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  details?: string;
}

export interface PieceItem {
  id: string;
  partCode: string;
  description: string;
  quantity: number;
  medidaL: string;
  medidaA: string;
  material: string;
}

export interface ProductionOrder {
  id: string;
  clientName: string;
  productName: string;
  quantity: number;
  unit: string;
  deadline: string;
  status: OrderStatus;
  priority: Priority;
  sector: string;
  subSector?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
  createdByRole?: string;
  items?: PieceItem[];
  history: AuditEntry[];
}

export interface EngineeringPart {
  id: string;
  partCode: string;
  masterProduct: string;
  timestamp: string;
  shape: 'sheet' | 'tube-round' | 'tube-square' | 'tube-rect' | 'rebar';
  materialName: string;
  dimensions: string;
  unitWeight: number;
  totalWeight: number;
  quantity: number;
  description: string;
  notes?: string;
}

export interface LoadHistoryEntry {
  id: string;
  timestamp: string;
  totalWeight: number;
  itemsCount: number;
  createdBy?: string;
  createdByRole?: string;
  details: {
    material: string;
    spec: string;
    weight: number;
    count: number;
  }[];
  fullLibrary?: EngineeringPart[];
  notes?: string;
}

export interface SystemUser {
  id: string;
  name: string;
  role: string;
  password?: string;
}

export interface ProductionSector {
  id: string;
  name: string;
}

export interface ProductionSubSector {
  id: string;
  name: string;
}

export interface SheetMaterial {
  id: string;
  name: string;
  thickness: string;
}

export interface TubeRoundMaterial {
  id: string;
  name: string;
  diameter: string;
  wall: string;
}

export interface MetalonSquareMaterial {
  id: string;
  name: string;
  side: string;
  wall: string;
}

export interface MetalonRectMaterial {
  id: string;
  name: string;
  width: string;
  height: string;
  wall: string;
}

export interface WhatsappContact {
  id: string;
  label: string;
  number: string;
}

export interface SystemConfig {
  contacts: WhatsappContact[];
  settingsPassword?: string; // Senha customizada para aba Configurações
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}
