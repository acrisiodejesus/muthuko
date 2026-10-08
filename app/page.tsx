'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ServiceOrder, ReclaimedPart, WorkshopMetrics } from '@/types';
import {
  initDatabase,
  getAllOrders,
  getAllParts,
  getMetrics,
  saveOrder,
  resetDatabaseToSeed,
} from '@/lib/db';
import { Header } from '@/components/Header';
import { BottomNav, TabType } from '@/components/BottomNav';
import { WorkbenchTab } from '@/components/tabs/WorkbenchTab';
import { NewOrderTab } from '@/components/tabs/NewOrderTab';
import { PartsBankTab } from '@/components/tabs/PartsBankTab';
import { MetricsTab } from '@/components/tabs/MetricsTab';
import { PwaRegister } from '@/components/PwaRegister';
import { INITIAL_METRICS } from '@/lib/seed-data';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabType>('workbench');
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [parts, setParts] = useState<ReclaimedPart[]>([]);
  const [metrics, setMetrics] = useState<WorkshopMetrics>(INITIAL_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega e sincroniza dados locais
  const loadData = useCallback(async () => {
    try {
      await initDatabase();
      const [allOrders, allParts, currentMetrics] = await Promise.all([
        getAllOrders(),
        getAllParts(),
        getMetrics(),
      ]);
      setOrders(allOrders);
      setParts(allParts);
      setMetrics(currentMetrics);
    } catch (err) {
      console.error('[Muthuko] Erro ao carregar dados locais:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Suporte a atalhos do manifest (?tab=new, ?tab=parts)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'new') setCurrentTab('new-order');
      if (tabParam === 'parts') setCurrentTab('parts-bank');
    }
  }, [loadData]);

  // Atualização de uma ordem
  const handleUpdateOrder = async (updated: ServiceOrder) => {
    await saveOrder(updated);
    await loadData();
  };

  // Criação de nova ordem
  const handleOrderCreated = async () => {
    await loadData();
    // Muda para a bancada para ver o item cadastrado
    setCurrentTab('workbench');
  };

  // Reset para dados de campo oficiais de Nampula
  const handleResetSeed = async () => {
    setIsLoading(true);
    await resetDatabaseToSeed();
    await loadData();
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Entregue' && o.status !== 'Abandonado (>45 dias)'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <PwaRegister />

      <Header
        ordersCount={orders.length}
        partsCount={parts.length}
        onRefresh={loadData}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-amber-400">
              Carregando base de bancada Muthuko (IndexedDB)...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'workbench' && (
              <WorkbenchTab
                orders={orders}
                onUpdateOrder={handleUpdateOrder}
                onRefresh={loadData}
                onGoToNewOrder={() => setCurrentTab('new-order')}
              />
            )}

            {currentTab === 'new-order' && (
              <NewOrderTab
                onOrderCreated={handleOrderCreated}
                nextOrderNumber={orders.length + 1}
              />
            )}

            {currentTab === 'parts-bank' && (
              <PartsBankTab
                parts={parts}
                onPartsChange={loadData}
              />
            )}

            {currentTab === 'metrics' && (
              <MetricsTab
                metrics={metrics}
                orders={orders}
                parts={parts}
                onResetSeed={handleResetSeed}
              />
            )}
          </>
        )}
      </main>

      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        activeOrdersCount={activeOrdersCount}
        partsCount={parts.length}
      />
    </div>
  );
}
