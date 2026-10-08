'use client';

import React from 'react';
import { Cpu, RefreshCw, ShieldCheck, MapPin } from 'lucide-react';

interface HeaderProps {
  ordersCount: number;
  partsCount: number;
  onRefresh?: () => void;
}

export function Header({ ordersCount, partsCount, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <Cpu className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-amber-400">MUTHUKO</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                PWA OFFLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Nampula • Muhala & Namutequeliua</span>
            </p>
          </div>
        </div>

        {/* Badges de Estado Rápido & Ações */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">
              <strong className="text-white">{ordersCount}</strong> Ordens | <strong className="text-white">{partsCount}</strong> Peças
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Recarregar dados locais"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition active:scale-95 border border-slate-700"
              aria-label="Recarregar dados locais"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
