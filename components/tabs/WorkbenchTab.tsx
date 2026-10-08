'use client';

import React, { useState, useMemo } from 'react';
import { ServiceOrder, OrderStatus, Neighborhood } from '@/types';
import { formatMT, getStatusBadgeStyle } from '@/lib/utils';
import {
  Search,
  Filter,
  Tv,
  Radio,
  SunMedium,
  Volume2,
  Zap,
  HelpCircle,
  Eye,
  MessageSquare,
  Clock,
  Layers,
  MapPin,
  Coins,
} from 'lucide-react';
import { OrderDetailsModal } from '../modals/OrderDetailsModal';
import { WhatsAppModal } from '../modals/WhatsAppModal';
import { HarvestPartsModal } from '../modals/HarvestPartsModal';

interface WorkbenchTabProps {
  orders: ServiceOrder[];
  onUpdateOrder: (order: ServiceOrder) => void;
  onRefresh: () => void;
  onGoToNewOrder: () => void;
}

export function WorkbenchTab({
  orders,
  onUpdateOrder,
  onRefresh,
  onGoToNewOrder,
}: WorkbenchTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Todos');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [whatsAppOrder, setWhatsAppOrder] = useState<ServiceOrder | null>(null);
  const [harvestOrder, setHarvestOrder] = useState<ServiceOrder | null>(null);

  const statusFilters = [
    'Todos',
    'Aguardando Avaliação',
    'Em Reparação',
    'Pronto para Levantamento',
    'Abandonado (>45 dias)',
    'Entregue',
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'TV':
        return <Tv className="w-4 h-4 text-sky-400" />;
      case 'Rádio':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      case 'Painel/Inversor Solar':
        return <SunMedium className="w-4 h-4 text-amber-400" />;
      case 'Amplificador':
        return <Volume2 className="w-4 h-4 text-purple-400" />;
      case 'Ferro':
        return <Zap className="w-4 h-4 text-orange-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.reportedDefect.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'Todos' || order.status === selectedStatus;

      const matchesNeighborhood =
        selectedNeighborhood === 'Todos' ||
        order.neighborhood === selectedNeighborhood;

      return matchesSearch && matchesStatus && matchesNeighborhood;
    });
  }, [orders, searchQuery, selectedStatus, selectedNeighborhood]);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner & Quick Search */}
      <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-3 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, modelo, defeito ou ID (Ex: Skyworth, MTK-001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filtros de Status (Scroll Horizontal em Telas Pequenas) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {statusFilters.map((st) => {
            const isSelected = selectedStatus === st;
            const count =
              st === 'Todos'
                ? orders.length
                : orders.filter((o) => o.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtro de Bairro */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Oficinas por Bairro:</span>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="Todos">Todos os Bairros</option>
              <option value="Muhala">Muhala</option>
              <option value="Namutequeliua">Namutequeliua</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {filteredOrders.length} resultado(s)
          </span>
        </div>
      </div>

      {/* Lista de Ordens na Bancada */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm">Nenhuma ordem encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não há aparelhos correspondentes aos filtros selecionados. Tente limpar os termos ou cadastre uma nova ordem.
          </p>
          <button
            onClick={onGoToNewOrder}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-amber-400 transition"
          >
            Registar Novo Aparelho
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const badgeStyle = getStatusBadgeStyle(order.status);

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-sm space-y-3"
              >
                {/* Linha 1: ID, Tempo e Badge de Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
                      {order.id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{order.daysInShop}d na bancada</span>
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Linha 2: Aparelho & Defeito */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-slate-800">{getDeviceIcon(order.deviceType)}</span>
                    <h3 className="font-bold text-white text-sm tracking-tight">
                      {order.brandModel}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 pl-7">
                    <strong className="text-slate-400">Defeito: </strong>
                    {order.reportedDefect}
                  </p>
                </div>

                {/* Linha 3: Cliente, Bairro e Técnico */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800/80 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{order.clientName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{order.neighborhood}</span>
                  </div>

                  <div className="text-[11px] text-amber-300/80 font-medium">
                    Técnico: {order.technicianName}
                  </div>
                </div>

                {/* Linha 4: Orçamento Transparente */}
                <div className="bg-slate-950/80 rounded-xl px-3 py-2 border border-slate-800/90 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Peças: {formatMT(order.partsCost)} + Mão de obra: {formatMT(order.laborCost)}</span>
                  </div>
                  <span className="font-mono font-black text-amber-400">
                    Total: {formatMT(order.totalCost)}
                  </span>
                </div>

                {/* Linha 5: Botões de Ação */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Fotos & Laudo</span>
                    </button>

                    <button
                      onClick={() => setWhatsAppOrder(order)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition border border-emerald-500/30"
                      title="Enviar comprovativo para o cliente via WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {order.status === 'Abandonado (>45 dias)' && (
                    <button
                      onClick={() => setHarvestOrder(order)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition"
                      title="Reaproveitar componentes deste aparelho abandonado"
                    >
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      <span>{order.scavenged ? 'Peças Salvas' : 'Extrair Peças'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateOrder={(updated) => {
            onUpdateOrder(updated);
            setSelectedOrder(null);
          }}
        />
      )}

      {whatsAppOrder && (
        <WhatsAppModal
          order={whatsAppOrder}
          onClose={() => setWhatsAppOrder(null)}
        />
      )}

      {harvestOrder && (
        <HarvestPartsModal
          order={harvestOrder}
          onClose={() => setHarvestOrder(null)}
          onHarvested={() => {
            onRefresh();
            setHarvestOrder(null);
          }}
        />
      )}
    </div>
  );
}
