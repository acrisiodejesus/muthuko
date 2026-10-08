import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ServiceOrder, ReclaimedPart, WorkshopMetrics } from '@/types';
import { SEED_ORDERS, SEED_PARTS, INITIAL_METRICS } from './seed-data';

const DB_NAME = 'muthuko_db';
const DB_VERSION = 1;

interface MuthukoDB extends DBSchema {
  orders: {
    key: string;
    value: ServiceOrder;
    indexes: { 'by-status': string; 'by-neighborhood': string };
  };
  parts: {
    key: string;
    value: ReclaimedPart;
    indexes: { 'by-category': string; 'by-code': string };
  };
  metrics: {
    key: string;
    value: WorkshopMetrics;
  };
}

let dbPromise: Promise<IDBPDatabase<MuthukoDB>> | null = null;

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

async function getDB(): Promise<IDBPDatabase<MuthukoDB> | null> {
  if (!isIndexedDBAvailable()) return null;

  if (!dbPromise) {
    dbPromise = openDB<MuthukoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('by-status', 'status');
          orderStore.createIndex('by-neighborhood', 'neighborhood');
        }

        if (!db.objectStoreNames.contains('parts')) {
          const partStore = db.createObjectStore('parts', { keyPath: 'id' });
          partStore.createIndex('by-category', 'category');
          partStore.createIndex('by-code', 'code');
        }

        if (!db.objectStoreNames.contains('metrics')) {
          db.createObjectStore('metrics');
        }
      },
    });
  }

  return dbPromise;
}

// Fallback LocalStorage Helpers
const LS_ORDERS_KEY = 'muthuko_ls_orders';
const LS_PARTS_KEY = 'muthuko_ls_parts';
const LS_METRICS_KEY = 'muthuko_ls_metrics';
const LS_SEEDED_KEY = 'muthuko_seeded_v1';

function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[Storage] Falha ao persistir no localStorage:', err);
  }
}

/**
 * Inicialização e Seed do Banco de Dados
 * Garante que as 42 ordens e 28 peças do relatório de Nampula sejam carregadas no primeiro acesso.
 */
export async function initDatabase(): Promise<void> {
  if (typeof window === 'undefined') return;

  const db = await getDB();
  if (db) {
    const existingOrdersCount = await db.count('orders');
    if (existingOrdersCount === 0) {
      console.log('[Muthuko DB] Inicializando IndexedDB com dados de campo de Nampula...');
      const tx = db.transaction(['orders', 'parts', 'metrics'], 'readwrite');
      for (const order of SEED_ORDERS) {
        await tx.objectStore('orders').put(order);
      }
      for (const part of SEED_PARTS) {
        await tx.objectStore('parts').put(part);
      }
      await tx.objectStore('metrics').put(INITIAL_METRICS, 'summary');
      await tx.done;
      console.log('[Muthuko DB] 42 Ordens e 28 Peças gravadas com sucesso no IndexedDB!');
    }
  } else {
    // Fallback localStorage
    const seeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!seeded) {
      setLocalStorage(LS_ORDERS_KEY, SEED_ORDERS);
      setLocalStorage(LS_PARTS_KEY, SEED_PARTS);
      setLocalStorage(LS_METRICS_KEY, INITIAL_METRICS);
      localStorage.setItem(LS_SEEDED_KEY, 'true');
    }
  }
}

// --- SERVIÇOS DE ORDENS ---

export async function getAllOrders(): Promise<ServiceOrder[]> {
  const db = await getDB();
  if (db) {
    return await db.getAll('orders');
  }
  return getLocalStorage<ServiceOrder[]>(LS_ORDERS_KEY, SEED_ORDERS);
}

export async function getOrderById(id: string): Promise<ServiceOrder | undefined> {
  const db = await getDB();
  if (db) {
    return await db.get('orders', id);
  }
  const orders = getLocalStorage<ServiceOrder[]>(LS_ORDERS_KEY, SEED_ORDERS);
  return orders.find((o) => o.id === id);
}

export async function saveOrder(order: ServiceOrder): Promise<ServiceOrder> {
  const db = await getDB();
  if (db) {
    await db.put('orders', order);
    return order;
  }
  const orders = getLocalStorage<ServiceOrder[]>(LS_ORDERS_KEY, SEED_ORDERS);
  const index = orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
  setLocalStorage(LS_ORDERS_KEY, orders);
  return order;
}

export async function deleteOrder(id: string): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.delete('orders', id);
    return;
  }
  const orders = getLocalStorage<ServiceOrder[]>(LS_ORDERS_KEY, SEED_ORDERS);
  setLocalStorage(LS_ORDERS_KEY, orders.filter((o) => o.id !== id));
}

// --- SERVIÇOS DE BANCO DE PEÇAS ---

export async function getAllParts(): Promise<ReclaimedPart[]> {
  const db = await getDB();
  if (db) {
    return await db.getAll('parts');
  }
  return getLocalStorage<ReclaimedPart[]>(LS_PARTS_KEY, SEED_PARTS);
}

export async function savePart(part: ReclaimedPart): Promise<ReclaimedPart> {
  const db = await getDB();
  if (db) {
    await db.put('parts', part);
    return part;
  }
  const parts = getLocalStorage<ReclaimedPart[]>(LS_PARTS_KEY, SEED_PARTS);
  const index = parts.findIndex((p) => p.id === part.id);
  if (index >= 0) {
    parts[index] = part;
  } else {
    parts.unshift(part);
  }
  setLocalStorage(LS_PARTS_KEY, parts);
  return part;
}

export async function deletePart(id: string): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.delete('parts', id);
    return;
  }
  const parts = getLocalStorage<ReclaimedPart[]>(LS_PARTS_KEY, SEED_PARTS);
  setLocalStorage(LS_PARTS_KEY, parts.filter((p) => p.id !== id));
}

// --- MÉTRICAS E RESET ---

export async function getMetrics(): Promise<WorkshopMetrics> {
  const orders = await getAllOrders();
  const parts = await getAllParts();

  const inRepair = orders.filter((o) => o.status === 'Em Reparação').length;
  const ready = orders.filter((o) => o.status === 'Pronto para Levantamento').length;
  const abandoned = orders.filter((o) => o.status === 'Abandonado (>45 dias)').length;
  
  const totalPartsValue = parts.reduce((acc, p) => acc + (p.priceMT * (p.quantity || 1)), 0);

  return {
    totalOrders: orders.length,
    zeroLossClaims: 0, // Protocolo fotográfico garantiu 0 extravios
    avgDecisionDays: 7, // Média comunitária reportada
    savedPartsCount: parts.length,
    totalSavedValueMT: totalPartsValue,
    ordersInRepair: inRepair,
    ordersReady: ready,
    ordersAbandoned: abandoned,
  };
}

export async function resetDatabaseToSeed(): Promise<void> {
  const db = await getDB();
  if (db) {
    const tx = db.transaction(['orders', 'parts', 'metrics'], 'readwrite');
    await tx.objectStore('orders').clear();
    await tx.objectStore('parts').clear();
    for (const order of SEED_ORDERS) {
      await tx.objectStore('orders').put(order);
    }
    for (const part of SEED_PARTS) {
      await tx.objectStore('parts').put(part);
    }
    await tx.objectStore('metrics').put(INITIAL_METRICS, 'summary');
    await tx.done;
  } else {
    setLocalStorage(LS_ORDERS_KEY, SEED_ORDERS);
    setLocalStorage(LS_PARTS_KEY, SEED_PARTS);
    setLocalStorage(LS_METRICS_KEY, INITIAL_METRICS);
    localStorage.setItem(LS_SEEDED_KEY, 'true');
  }
}
