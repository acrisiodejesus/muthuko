'use client';

import React from 'react';
import { WorkshopMetrics, ServiceOrder, ReclaimedPart } from '@/types';
import { formatMT } from '@/lib/utils';
import {
  ShieldCheck,
  Cpu,
  Clock,
  Tv,
  RotateCcw,
  Sparkles,
  BarChart2,
  CheckCircle,
  AlertOctagon,
  Building2,
  HeartHandshake,
} from 'lucide-react';

interface MetricsTabProps {
  metrics: WorkshopMetrics;
  orders: ServiceOrder[];
  parts: ReclaimedPart[];
  onResetSeed: () => void;
}

export function MetricsTab({
  metrics,
  orders,
  parts,
  onResetSeed,
}: MetricsTabProps) {
  // Contagem por tipo
  const deviceCounts = orders.reduce((acc, order) => {
    acc[order.deviceType] = (acc[order.deviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Contagem por bairro
  const muhalaCount = orders.filter((o) => o.neighborhood === 'Muhala').length;
  const namutequeliuaCount = orders.filter((o) => o.neighborhood === 'Namutequeliua').length;

  // Total economizado
  const totalSavedValue = parts.reduce(
    (acc, p) => acc + p.priceMT * (p.quantity || 1),
    0
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Banner Principal de Confiança Comunitária Muthuko */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-4 rounded-2xl border border-amber-500/30 space-y-2 shadow-lg">
        <div className="flex items-center gap-2 text-amber-400">
          <HeartHandshake className="w-5 h-5" />
          <h2 className="text-base font-black tracking-wide">
            IMPACTO DO PROTOCOLO MUTHUKO EM NAMPULA
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Relatório consolidado de transparência técnica, economia circular e eliminação de conflitos de bancada nas oficinas dos bairros Muhala e Namutequeliua.
        </p>
      </div>

      {/* 4 KPIs Consolidados da Intervenção de Campo */}
      <div className="grid grid-cols-2 gap-3">
        {/* KPI 1: 42 Aparelhos Cadastrados */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">APARELHOS CADASTRADOS</span>
            <Tv className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.totalOrders}
          </div>
          <p className="text-[11px] text-slate-400">
            Ordens com laudo fotográfico em Nampula
          </p>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
        </div>

        {/* KPI 2: 0 Reclamações de Extravio */}
        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold">RECLAMAÇÕES DE EXTRAVIO</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {metrics.zeroLossClaims}
          </div>
          <p className="text-[11px] text-emerald-300">
            Zero conflitos graças à foto macro da placa
          </p>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
        </div>

        {/* KPI 3: 7 Dias Tempo Médio */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">TEMPO MÉDIO DE DECISÃO</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            {metrics.avgDecisionDays} <span className="text-sm font-normal text-slate-400">dias</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Aprovação rápida via WhatsApp formatado
          </p>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl" />
        </div>

        {/* KPI 4: 28 Peças Salvas do Lixo Eletrónico */}
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold">PEÇAS SALVAS DO LIXO</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {metrics.savedPartsCount}
          </div>
          <p className="text-[11px] text-amber-300">
            Componentes reaproveitados de carcaças
          </p>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
        </div>
      </div>

      {/* Economia Comunitária & Valor do Banco de Peças */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            ECONOMIA COMUNITÁRIA GERADA
          </span>
          <span className="text-sm font-black text-emerald-400 font-mono">
            {formatMT(totalSavedValue)}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Valor economizado pelos clientes ao utilizarem semicondutores e capacitores recuperados de carcaças abandonadas, evitando a compra de peças novas importadas com custos elevados de frete para Nampula.
        </p>
      </div>

      {/* Distribuição por Tipo de Aparelho */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          DISTRIBUIÇÃO DE APARELHOS NA BANCADA
        </h3>

        <div className="space-y-2.5">
          {Object.entries(deviceCounts).map(([type, count]) => {
            const percentage = Math.round((count / orders.length) * 100);
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{type}</span>
                  <span className="text-slate-400 font-mono">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Oficinas Representadas nos Bairros */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          OFICINAS PARTICIPANTES EM NAMPULA
        </h3>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Bairro Muhala</span>
            <strong className="text-base font-black text-white">{muhalaCount}</strong>
            <span className="text-slate-400 block text-[11px]">
              Mestre Momade & Téc. Américo
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Bairro Namutequeliua</span>
            <strong className="text-base font-black text-white">{namutequeliuaCount}</strong>
            <span className="text-slate-400 block text-[11px]">
              Téc. Celestino & Mestre Rassul
            </span>
          </div>
        </div>
      </div>

      {/* Ação de Restauração de Dados Oficiais de Campo */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-300">
            Restaurar Base de Campo Original
          </h4>
          <p className="text-[11px] text-slate-400">
            Recarrega as 42 ordens e 28 peças do levantamento inicial de Nampula.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Deseja recarregar a base com as 42 ordens e 28 peças originais do relatório de campo?')) {
              onResetSeed();
            }
          }}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Seed</span>
        </button>
      </div>
    </div>
  );
}
