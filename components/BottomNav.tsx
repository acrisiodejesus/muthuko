'use client';

import React from 'react';
import { Wrench, PlusCircle, Layers, BarChart3 } from 'lucide-react';

export type TabType = 'workbench' | 'new-order' | 'parts-bank' | 'metrics';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  activeOrdersCount: number;
  partsCount: number;
}

export function BottomNav({
  currentTab,
  onChangeTab,
  activeOrdersCount,
  partsCount,
}: BottomNavProps) {
  const tabs = [
    {
      id: 'workbench' as TabType,
      label: 'Bancada',
      icon: Wrench,
      badge: activeOrdersCount,
      sublabel: 'Ordens & Histórico',
    },
    {
      id: 'new-order' as TabType,
      label: 'Nova Entrada',
      icon: PlusCircle,
      badge: null,
      sublabel: 'Registo Visual',
      highlight: true,
    },
    {
      id: 'parts-bank' as TabType,
      label: 'Banco de Peças',
      icon: Layers,
      badge: partsCount,
      sublabel: 'Sucata Ética',
    },
    {
      id: 'metrics' as TabType,
      label: 'Métricas',
      icon: BarChart3,
      badge: null,
      sublabel: 'Impacto & Dados',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-5xl mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
                aria-label={tab.label}
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 ring-4 ring-slate-900 shadow-amber-500/40'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-4 ring-slate-900'
                  }`}
                >
                  <Icon className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[11px] font-black mt-1 ${
                    isActive ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center relative rounded-lg transition-colors active:bg-slate-800/80 ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-3.5 bg-slate-800 text-amber-400 border border-amber-500/40 text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight truncate max-w-[85px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
