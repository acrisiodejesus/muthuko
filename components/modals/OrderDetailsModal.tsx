'use client';

import React, { useState } from 'react';
import { ServiceOrder, OrderStatus } from '@/types';
import { formatMT, getStatusBadgeStyle } from '@/lib/utils';
import {
  X,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  User,
  Wrench,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Coins,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { HarvestPartsModal } from './HarvestPartsModal';
import { generateDiagnosticChassisPlaceholder, generateDiagnosticBoardPlaceholder } from '@/lib/image-compressor';

interface OrderDetailsModalProps {
  order: ServiceOrder;
  onClose: () => void;
  onUpdateOrder: (updated: ServiceOrder) => void;
}

const ALL_STATUSES: OrderStatus[] = [
  'Aguardando Avaliação',
  'Em Reparação',
  'Pronto para Levantamento',
  'Entregue',
  'Abandonado (>45 dias)',
];

export function OrderDetailsModal({
  order,
  onClose,
  onUpdateOrder,
}: OrderDetailsModalProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [partsCost, setPartsCost] = useState(order.partsCost);
  const [laborCost, setLaborCost] = useState(order.laborCost);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showHarvest, setShowHarvest] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<'board' | 'chassis'>('board');
  const [isSaving, setIsSaving] = useState(false);

  // Se a ordem não tiver fotos salvas, geramos visualizações técnicas de laudo
  const boardPhoto =
    order.boardPhotoUrl ||
    generateDiagnosticBoardPlaceholder(order.deviceType, order.brandModel, order.initialObservation);
  const chassisPhoto =
    order.chassisPhotoUrl ||
    generateDiagnosticChassisPlaceholder(order.deviceType, order.brandModel, order.clientName);

  const statusStyle = getStatusBadgeStyle(currentStatus);
  const totalCost = Number(partsCost || 0) + Number(laborCost || 0);

  const handleSaveStatusAndBudget = async () => {
    setIsSaving(true);
    try {
      const updated: ServiceOrder = {
        ...order,
        status: currentStatus,
        partsCost: Number(partsCost || 0),
        laborCost: Number(laborCost || 0),
        totalCost,
        updatedAt: new Date().toISOString(),
      };
      onUpdateOrder(updated);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
          {/* Header */}
          <div className="bg-slate-800 px-4 py-3.5 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                {order.id}
              </span>
              <h3 className="font-black text-white text-base truncate max-w-[220px] sm:max-w-md">
                {order.brandModel}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-slate-200 text-sm">
            {/* Linha de Status & Tempo */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Estado:</span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                  {currentStatus}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{order.daysInShop} dias na bancada</span>
              </div>
            </div>

            {/* Informações do Cliente & Oficina */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80 space-y-1.5">
                <span className="text-xs font-bold text-slate-400 block">DADOS DO CLIENTE</span>
                <div className="flex items-center gap-2 font-bold text-white">
                  <User className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{order.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href={`tel:${order.clientPhone}`} className="hover:underline">
                    {order.clientPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Bairro: {order.neighborhood}</span>
                </div>
              </div>

              <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80 space-y-1.5">
                <span className="text-xs font-bold text-slate-400 block">BANCADA & TÉCNICO</span>
                <div className="flex items-center gap-2 font-bold text-white">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{order.technicianName}</span>
                </div>
                <div className="text-xs text-slate-300">
                  Tipo: <strong className="text-amber-300">{order.deviceType}</strong>
                </div>
                <div className="text-xs text-slate-400 truncate">
                  Entrada: {new Date(order.createdAt).toLocaleDateString('pt-MZ')}
                </div>
              </div>
            </div>

            {/* Defeito Informado */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
              <span className="text-xs font-bold text-slate-400 block mb-1">
                DEFEITO REPORTADO PELO CLIENTE
              </span>
              <p className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {order.reportedDefect}
              </p>
            </div>

            {/* Protocolo Fotográfico com Abas (Carcaça vs Placa Macro) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  PROTOCOLO VISUAL DE ENTRADA (TRANSPARÊNCIA)
                </span>
                <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setActivePhotoTab('board')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      activePhotoTab === 'board'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Placa Interna
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhotoTab('chassis')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      activePhotoTab === 'chassis'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Carcaça / Etiqueta
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-[4/3] max-h-64 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhotoTab === 'board' ? boardPhoto : chassisPhoto}
                  alt={activePhotoTab === 'board' ? 'Foto da Placa' : 'Foto da Carcaça'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-slate-700 rounded-md px-2 py-1 text-[11px] text-amber-300 font-mono">
                  {activePhotoTab === 'board'
                    ? '🔍 Macro: Placa com demarcação de inspeção'
                    : '🏷️ Etiqueta & Integridade Externa'}
                </div>
              </div>

              {/* Anotação Visual da Placa */}
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300">
                <strong className="text-amber-400">Inspeção da Placa: </strong>
                {order.initialObservation || 'Sem anotações de peças removidas previamente.'}
              </div>
            </div>

            {/* Discriminação Transparente de Orçamento */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  DISCRIMINAÇÃO TRANSPARENTE DE ORÇAMENTO (MT)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Custo das Peças (MT):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={partsCost}
                    onChange={(e) => setPartsCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Mão de Obra do Técnico (MT):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  {formatMT(Number(partsCost || 0))} (Peças) + {formatMT(Number(laborCost || 0))} (Mão de Obra)
                </span>
                <span className="text-base font-black text-amber-400 font-mono">
                  = {formatMT(totalCost)}
                </span>
              </div>
            </div>

            {/* Atualizar Status do Aparelho */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                ATUALIZAR ESTADO DA ORDEM DE SERVIÇO:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCurrentStatus(st)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition text-center ${
                      currentStatus === st
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão Especial de Sucata Ética se Abandonado */}
            {currentStatus === 'Abandonado (>45 dias)' && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Aparelho elegível para extração de componentes (Sucata Ética)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHarvest(true)}
                  className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Layers className="w-4 h-4" />
                  <span>Extrair Peças para o Banco Comunitário</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-800 px-4 py-3 border-t border-slate-700 flex flex-wrap gap-2 justify-between items-center">
            <button
              type="button"
              onClick={() => setShowWhatsApp(true)}
              className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comprovativo WhatsApp</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs transition"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSaveStatusAndBudget}
                disabled={isSaving}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWhatsApp && (
        <WhatsAppModal
          order={{
            ...order,
            status: currentStatus,
            partsCost: Number(partsCost || 0),
            laborCost: Number(laborCost || 0),
            totalCost,
          }}
          onClose={() => setShowWhatsApp(false)}
        />
      )}

      {showHarvest && (
        <HarvestPartsModal
          order={order}
          onClose={() => setShowHarvest(false)}
          onHarvested={() => {
            onUpdateOrder({
              ...order,
              scavenged: true,
              status: currentStatus,
            });
          }}
        />
      )}
    </>
  );
}
